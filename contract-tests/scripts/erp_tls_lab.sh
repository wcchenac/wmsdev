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
# refuses TLS 1.0 itself), checks from its log that only TLS 1.0 is allowed, then:
#   1. freetds.conf enable tls v1 = yes -> must connect. Retried until the server
#      accepts logins, which also proves the password, network and DNS are right.
#   2. default URL                      -> must fail with DB-Lib error 20002
#   3. URL with ?encryption=off         -> must fail with DB-Lib error 20002
# Error 20002 ("Adaptive Server connection failed") is what a failed TLS
# handshake looks like here; any other failure means the lab itself is broken.
#
# Exit codes:
#   0    all results as expected
#   1    a result differs from what the cutover plan assumes (FreeTDS behaves differently)
#   2    the lab is not valid (server not limited to TLS 1.0, not reachable, unexpected error)
#   130  interrupted (Ctrl-C); 143 terminated. Everything the script created is removed.
#
# Run it on macOS, Linux or WSL. Git Bash on Windows rewrites the container paths
# in -v and in the command line, so the mounts do not work there.
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
# The EXIT trap does the cleanup once. INT and TERM only exit: a handler that
# returned would let the script carry on against removed containers.
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

lab_error() {
  echo "lab setup invalid: $*" >&2
  exit 2
}

docker image inspect "$image" >/dev/null 2>&1 ||
  lab_error "image $image not found; build it first (docker compose -f docker-compose.yml -f docker-compose.python.yml build)"

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
            "SELECT encrypt_option, CAST(SERVERPROPERTY('ProductVersion') AS varchar(32)) "
            "FROM sys.dm_exec_connections WHERE session_id = @@SPID")).one()
        print(f"connected (encrypt_option={row[0]}, SQL Server {row[1]})")
except Exception as exc:  # noqa: BLE001 - any failure is the result being reported
    print("failed:", str(exc).splitlines()[0][:160])
    sys.exit(1)
EOF
# mktemp -d is 0700 and a umask can make the files 0600: the containers do not run
# as the host user (SQL Server is uid 10001 on Linux), so make them readable.
chmod 755 "$work"
chmod 644 "$work/mssql.conf" "$work/freetds.conf" "$work/probe.py"

docker network create "$network" >/dev/null || lab_error "could not create network $network"
docker run -d --name "$server" --network "$network" --platform linux/amd64 \
  -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD="$password" \
  -v "$work/mssql.conf:/var/opt/mssql/mssql.conf:ro" "$server_image" >/dev/null ||
  lab_error "could not start $server_image"
echo "starting SQL Server (TLS 1.0 only) ..."
i=0
until docker logs "$server" 2>&1 | grep -q "SQL Server is now ready for client connections"; do
  i=$((i + 1))
  if [ "$i" -gt 90 ]; then
    docker logs "$server" 2>&1 | tail -20 >&2
    lab_error "SQL Server did not start within 3 minutes"
  fi
  sleep 2
done
docker logs "$server" 2>&1 | grep -q "Allowed TLS protocol versions are \['1.0'\]" ||
  lab_error "the server does not limit TLS to 1.0 (was mssql.conf read?): $(docker logs "$server" 2>&1 | grep 'Allowed TLS protocol' | head -1)"
echo "server allows TLS 1.0 only"

url="mssql+pymssql://sa:$password@$server:1433/master"
dump_env=""
[ "${DUMP:-}" = 1 ] && dump_env="-e TDSDUMP=stdout"

# probe <url> [extra docker args...]: sets result (ok|fail) and summary.
probe() {
  target=$1
  shift
  # shellcheck disable=SC2086 # dump_env is either empty or one "-e X=Y" pair
  if out=$(docker run --rm --network "$network" $dump_env -v "$work/probe.py:/probe.py:ro" "$@" \
      --entrypoint python "$image" /probe.py "$target" 2>&1); then
    result=ok
  else
    result=fail
  fi
  if [ "${DUMP:-}" = 1 ]; then printf '%s\n' "$out" | sed 's/^/    /'; fi
  summary=$(printf '%s\n' "$out" | grep -E '^(connected|failed:)' | tail -1 || true)
  if [ -z "$summary" ]; then summary=$(printf '%s\n' "$out" | tail -1); fi
}

report() {  # report <label> <expected> <verdict: expected|MISMATCH|LAB ERROR>
  printf '  %-36s %-4s %-22s %s\n' "$1" "$result" "($3, wanted $2)" "$summary"
}

failures=0
lab_errors=0

# 1. Expected to connect. Retry: the ready message comes before logins are accepted.
tries=0
while :; do
  probe "$url" -v "$work/freetds.conf:/usr/local/etc/freetds.conf:ro"
  [ "$result" = ok ] && break
  tries=$((tries + 1))
  [ "$tries" -ge 30 ] && break
  sleep 2
done
if [ "$result" = ok ]; then
  report "freetds.conf: enable tls v1 = yes" ok expected
else
  case $summary in
    *20002*) report "freetds.conf: enable tls v1 = yes" ok MISMATCH; failures=$((failures + 1)) ;;
    *) report "freetds.conf: enable tls v1 = yes" ok "LAB ERROR"; lab_errors=$((lab_errors + 1)) ;;
  esac
fi

# 2 and 3. Expected to fail, and to fail on the handshake (20002), not on anything else.
for case_ in default encryption_off; do
  if [ "$case_" = default ]; then label="default"; target="$url"; else label="?encryption=off"; target="$url?encryption=off"; fi
  probe "$target"
  if [ "$result" = ok ]; then
    report "$label" fail MISMATCH
    failures=$((failures + 1))
  else
    case $summary in
      *20002*) report "$label" fail expected ;;
      *) report "$label" fail "LAB ERROR"; lab_errors=$((lab_errors + 1)) ;;
    esac
  fi
done

if [ "$lab_errors" -ne 0 ]; then
  lab_error "$lab_errors attempt(s) failed for a reason other than the TLS handshake (see above)"
fi
if [ "$failures" -ne 0 ]; then
  echo "$failures result(s) differ from what the cutover plan assumes" >&2
  exit 1
fi
echo "all results as expected: a TLS 1.0-only ERP needs freetds.conf with 'enable tls v1 = yes'"
