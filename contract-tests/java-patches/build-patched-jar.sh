#!/bin/sh
# Build wmstool with the minimal history-route fix, ONLY to record .fixed.json goldens.
# The repository's wmstool/ is never modified: the build runs on a copy.
#
#   ./java-patches/build-patched-jar.sh
#   docker compose -f docker-compose.yml -f docker-compose.java-fixed.yml up -d --wait
#   .venv/bin/pytest -q -k history --update-golden --golden-variant fixed
set -eu
HERE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(cd "$HERE/.." && pwd)
WORK=$(mktemp -d "${TMPDIR:-/tmp}/wmstool-patched.XXXXXX")
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/wmstool"
cp -R "$REPO/wmstool/src" "$REPO/wmstool/pom.xml" "$WORK/wmstool/"
(cd "$WORK" && patch -p1 < "$HERE/java-patches/history-routes.patch")
(cd "$WORK/wmstool" && mvn -q -DskipTests package)
mkdir -p "$HERE/runtime"
cp "$WORK"/wmstool/target/wmstool-*.jar "$HERE/runtime/wmstool-history-fixed.jar"
echo "built $HERE/runtime/wmstool-history-fixed.jar"
