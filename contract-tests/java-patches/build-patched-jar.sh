#!/bin/sh
# Build wmstool with the minimal fixes in java-patches/*.patch (applied in name order),
# ONLY to record .fixed.json goldens. The repository's wmstool/ is never modified: the
# build runs on a copy.
#
#   ./java-patches/build-patched-jar.sh
#   docker compose -f docker-compose.yml -f docker-compose.java-fixed.yml up -d --wait
#   .venv/bin/pytest -q -k "<tests a patch changes>" --update-golden --golden-variant fixed
#   (see README.md "Golden 變體" for which tests each patch changes)
set -eu
HERE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(cd "$HERE/.." && pwd)
WORK=$(mktemp -d "${TMPDIR:-/tmp}/wmstool-patched.XXXXXX")
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/wmstool"
cp -R "$REPO/wmstool/src" "$REPO/wmstool/pom.xml" "$WORK/wmstool/"
for p in "$HERE"/java-patches/*.patch; do
  echo "applying $(basename "$p")"
  (cd "$WORK" && patch -p1 --quiet < "$p")
done
(cd "$WORK/wmstool" && mvn -q -DskipTests package)
mkdir -p "$HERE/runtime"
cp "$WORK"/wmstool/target/wmstool-*.jar "$HERE/runtime/wmstool-fixed.jar"
echo "built $HERE/runtime/wmstool-fixed.jar"
