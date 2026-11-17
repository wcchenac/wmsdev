#!/bin/sh
# Convert the report templates (*Template.xls) under <dir> to .xlsx with LibreOffice, as
# the cutover converts the production templates. Runs LibreOffice in a throwaway
# container. Generated reports in the same folders are left alone: a converted report
# would sit next to its .xls and be downloaded instead of it.
#
# fixtures/formatted-templates/*.xlsx were converted with LibreOffice 25.2.3.2
# (Debian 13 "trixie" package libreoffice-calc-nogui 4:25.2.3-2+deb13u9, arm64) on the
# python:3.12-slim image pinned below. Debian replaces packages with security updates,
# so the exact package cannot be pinned; the script stops if the LibreOffice it gets is
# not 25.2.3, since another version may write rows differently. Override with
# LIBREOFFICE_VERSION=<x.y.z> after checking the result with python -m app.template_check.
#
# Usage: scripts/convert_templates.sh [--list] <dir>
#   --list  print the templates that would be converted (relative to <dir>) and stop
set -eu
list_only=
if [ "${1:-}" = "--list" ]; then
  list_only=1
  shift
fi
dir=$(cd "$1" && pwd)
templates=$(cd "$dir" && find . -type f -name "*Template.xls" | sed "s|^\./||" | LC_ALL=C sort)
if [ -n "$list_only" ]; then
  [ -z "$templates" ] || printf "%s\n" "$templates"
  exit 0
fi
if [ -z "$templates" ]; then
  echo "no *Template.xls under $dir" >&2
  exit 1
fi
image="python:3.12-slim@sha256:cb7e7f6dc0a4b341e9098051c4e6b6d450a6835f226bf0b910a99edf766fd3e7"
expected="${LIBREOFFICE_VERSION:-25.2.3}"
docker run --rm -e EXPECTED="$expected" -e TEMPLATES="$templates" -v "$dir:/w" "$image" sh -c '
  set -eu
  apt-get update -qq >/dev/null &&
  apt-get install -y -qq --no-install-recommends libreoffice-calc-nogui >/dev/null &&
  version=$(soffice --version) &&
  echo "$version" &&
  case "$version" in
    "LibreOffice $EXPECTED"*) ;;
    *) echo "expected LibreOffice $EXPECTED; set LIBREOFFICE_VERSION to accept this one" >&2; exit 1 ;;
  esac &&
  cd /w &&
  printf "%s\n" "$TEMPLATES" | while IFS= read -r f; do
    soffice --headless --convert-to xlsx --outdir "$(dirname "/w/$f")" "/w/$f"
  done'
