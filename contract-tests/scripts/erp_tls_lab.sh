#!/bin/sh
# Reproduce an ERP (SQL Server) that only speaks TLS 1.0, and check how the
# wmstool-py image's pymssql connects to it.
#
# The image's pymssql 2.3.2 bundles FreeTDS 1.4.23 with its own OpenSSL 1.0.2k
# (amd64 and arm64 wheels alike). FreeTDS 1.4 disables TLS 1.0 by default, so an
# old SQL Server limited to TLS 1.0 cannot be reached until freetds.conf says
# "enable tls v1 = yes". "?encryption=off" in the URL does not help: FreeTDS
# still encrypts the login packet, like Java's JDBC encrypt=false.
#
# The script starts a throwaway SQL Server 2022 container with
#   forceencryption = 0, tlsprotocols = 1.0, tlsciphers = AES128-SHA:AES256-SHA:@SECLEVEL=0
# (SECLEVEL=0 is needed: SQL Server on Linux uses OpenSSL 3, which otherwise
# refuses TLS 1.0 itself) and expects:
#   default URL                    -> connection fails
#   URL with ?encryption=off       -> connection fails
#   freetds.conf enable tls v1=yes -> connects
# It exits 0 only when all three hold. Everything it creates is removed on exit.
#
# Production SQL Server runs on Windows (Schannel), not OpenSSL: this shows the
# client side. Check the real ERP with the image itself before the cutover.
#
# Usage: scripts/erp_tls_lab.sh
#   IMAGE=<wmstool-py image>  (default wmstool-py:contract, built by docker-compose.python.yml)
#   DUMP=1                    also print the FreeTDS log (TDSDUMP) of each attempt
set -eu
image="${IMAGE:-wmstool-py:contract}"
server_image="mcr.microsoft.com/mssql/server:2022-latest"
password="Lab-Pass-123"
suffix="$$"
network="erp-tls-lab-$suffix"
server="erp-tls-lab-$suffix"
work=$(mktemp -d)

cleanup() {
  docker rm -f "$server" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT INT TERM

docker image inspect "$image" >/dev/null 2>&1 || {
  echo "image $image not found; build it first (docker compose -f docker-compose.yml -f docker-compose.python.yml build)" >&2
  exit 2
}

cat >"$work/mssql.conf" <<'EOF'
[network]
forceencryption = 0
tlsprotocols = 1.0
tlsciphers = AES128-SHA:AES256-SHA:@SECLEVEL=0
EOF
printf '[global]\n\tenable tls v1 = yes\n' >"$work/freetds.conf"
cat >"$work/probe.py" <<'EOF'
import sys
from sqlalchemy import create_engine, text
try:
    with create_engine(sys.argv[1]).connect() as conn:
        row = conn.execute(text(
            "SELECT encrypt_option FROM sys.dm_exec_connections WHERE session_id = @@SPID")).one()
        print(f"connected (encrypt_option={row[0]})")
except Exception as exc:  # noqa: BLE001 - any failure is the result being reported
    print("failed:", str(exc).splitlines()[0][:160])
    sys.exit(1)
EOF

docker network create "$network" >/dev/null
docker run -d --name "$server" --network "$network" --platform linux/amd64 \
  -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD="$password" \
  -v "$work/mssql.conf:/var/opt/mssql/mssql.conf:ro" "$server_image" >/dev/null
echo "starting SQL Server (TLS 1.0 only) ..."
i=0
until docker logs "$server" 2>&1 | grep -q "SQL Server is now ready for client connections"; do
  i=$((i + 1))
  if [ "$i" -gt 90 ]; then
    echo "SQL Server did not start in time" >&2
    docker logs "$server" 2>&1 | tail -20 >&2
    exit 2
  fi
  sleep 2
done
sleep 5
docker logs "$server" 2>&1 | grep "Allowed TLS protocol versions" | sed 's/Allowed TLS ciphers.*//'

url="mssql+pymssql://sa:$password@$server:1433/master"
dump_env=""
[ "${DUMP:-}" = 1 ] && dump_env="-e TDSDUMP=stdout"

# probe <label> <expected: ok|fail> <url> [extra docker args...]
failures=0
probe() {
  label=$1 expected=$2 target=$3
  shift 3
  # shellcheck disable=SC2086 # dump_env is either empty or one "-e X=Y" pair
  if out=$(docker run --rm --network "$network" $dump_env -v "$work/probe.py:/probe.py:ro" "$@" \
      --entrypoint python "$image" /probe.py "$target" 2>&1); then
    result=ok
  else
    result=fail
  fi
  [ "${DUMP:-}" = 1 ] && printf '%s\n' "$out" | sed 's/^/    /'
  summary=$(printf '%s\n' "$out" | grep -E '^(connected|failed:)' | tail -1)
  if [ "$result" = "$expected" ]; then
    printf '  %-36s %-4s (expected) %s\n' "$label" "$result" "$summary"
  else
    printf '  %-36s %-4s (EXPECTED %s) %s\n' "$label" "$result" "$expected" "$summary"
    failures=$((failures + 1))
  fi
}

probe "default" fail "$url"
probe "?encryption=off" fail "$url?encryption=off"
probe "freetds.conf: enable tls v1 = yes" ok "$url" \
  -v "$work/freetds.conf:/usr/local/etc/freetds.conf:ro"

if [ "$failures" -ne 0 ]; then
  echo "$failures result(s) differ from what the cutover plan assumes" >&2
  exit 1
fi
echo "all results as expected: a TLS 1.0-only ERP needs freetds.conf with 'enable tls v1 = yes'"
