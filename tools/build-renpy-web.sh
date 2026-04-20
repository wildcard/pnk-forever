#!/usr/bin/env bash
# build-renpy-web.sh — emit v2-renpy, convert assets, drive Ren'Py SDK web export.
#
# Prereqs:
#   - Ren'Py SDK fetched via tools/renpy-sdk/fetch.sh
#   - content/ IR passes ir-lint (exit 0)
#   - content/assets/backgrounds/* present
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RENPY_VERSION="${RENPY_VERSION:-8.3.7}"
SDK_DIR="$ROOT/tools/renpy-sdk/renpy-$RENPY_VERSION"
V2="$ROOT/v2-renpy"
DIST="$ROOT/dist/v2-renpy"

if [ ! -d "$SDK_DIR" ]; then
  echo "build-renpy-web: SDK missing. Run tools/renpy-sdk/fetch.sh first."
  exit 2
fi

echo "build-renpy-web: ir-lint precheck"
( cd "$ROOT" && npm run ir-lint --silent )

echo "build-renpy-web: emit v2-renpy/"
( cd "$ROOT/tools/adapters/renpy" && npm run emit --silent )

echo "build-renpy-web: asset pipeline"
bash "$ROOT/tools/adapters/renpy/assets.sh"

echo "build-renpy-web: Ren'Py SDK web distribute"
rm -rf "$DIST"
mkdir -p "$DIST"
# Ren'Py launcher CLI: renpy.sh <project> distribute --package=web
"$SDK_DIR/renpy.sh" "$V2" distribute --package=web --destination "$DIST"

# Ren'Py emits a zip; unzip in place.
WEB_ZIP="$DIST"/*-web.zip
if ls $WEB_ZIP 1> /dev/null 2>&1; then
  unzip -o $WEB_ZIP -d "$DIST"
  rm $WEB_ZIP
fi

if [ ! -f "$DIST/index.html" ]; then
  echo "build-renpy-web: index.html missing after distribute"
  exit 3
fi

echo "build-renpy-web: done — $DIST"
ls -lh "$DIST" | head -20
