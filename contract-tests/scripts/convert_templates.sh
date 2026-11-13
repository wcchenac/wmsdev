#!/bin/sh
# Convert every .xls in <dir> to .xlsx with LibreOffice, as the cutover converts the
# production templates. Runs LibreOffice in a throwaway container.
# Usage: scripts/convert_templates.sh <dir>
set -eu
dir=$(cd "$1" && pwd)
docker run --rm -v "$dir:/w" python:3.12-slim sh -c '
  apt-get update -qq >/dev/null &&
  apt-get install -y -qq --no-install-recommends libreoffice-calc-nogui >/dev/null &&
  cd /w && soffice --headless --convert-to xlsx --outdir /w /w/*.xls'
