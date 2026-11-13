#!/bin/sh
# Convert every .xls in <dir> to .xlsx with LibreOffice, as the cutover converts the
# production templates. Runs LibreOffice in a throwaway container.
#
# fixtures/formatted-templates/*.xlsx were converted with LibreOffice 25.2.3.2
# (Debian 13 "trixie" package libreoffice-calc-nogui 4:25.2.3-2+deb13u9, arm64) on the
# python:3.12-slim image pinned below. Debian replaces packages with security updates,
# so the exact package cannot be pinned; the script stops if the LibreOffice it gets is
# not 25.2.3, since another version may write rows differently. Override with
# LIBREOFFICE_VERSION=<x.y.z> after checking the result with python -m app.template_check.
#
# Usage: scripts/convert_templates.sh <dir>
set -eu
dir=$(cd "$1" && pwd)
image="python:3.12-slim@sha256:cb7e7f6dc0a4b341e9098051c4e6b6d450a6835f226bf0b910a99edf766fd3e7"
expected="${LIBREOFFICE_VERSION:-25.2.3}"
docker run --rm -e EXPECTED="$expected" -v "$dir:/w" "$image" sh -c '
  apt-get update -qq >/dev/null &&
  apt-get install -y -qq --no-install-recommends libreoffice-calc-nogui >/dev/null &&
  version=$(soffice --version) &&
  echo "$version" &&
  case "$version" in
    "LibreOffice $EXPECTED"*) ;;
    *) echo "expected LibreOffice $EXPECTED; set LIBREOFFICE_VERSION to accept this one" >&2; exit 1 ;;
  esac &&
  cd /w && soffice --headless --convert-to xlsx --outdir /w /w/*.xls'
