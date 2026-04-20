#!/usr/bin/env bash
# build-all.sh — unified build for /v0 /v1 /v2 under dist/
#
# Called by vercel.json buildCommand. Produces:
#   dist/v0/  (vanilla-JS original)
#   dist/v1/  (narrat modern)
#   dist/v2/  (Ren'Py WASM — if SDK available)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

echo "build-all: v0 (vanilla-JS)"
cp -R "$ROOT/v0-original-text-engine" "$DIST/v0"

echo "build-all: v1 (narrat)"
cd "$ROOT/v1-modern"
npm install --no-audit --no-fund
# v1-modern's build also copies v0 into its own dist; we copy only the narrat output.
npx vite build
cp -R dist/. "$DIST/v1/"

echo "build-all: v2 (Ren'Py WASM)"
if [ -x "$ROOT/tools/build-renpy-web.sh" ] && [ -d "$ROOT/tools/renpy-sdk/renpy-"* ] 2>/dev/null; then
  bash "$ROOT/tools/build-renpy-web.sh"
  if [ -d "$ROOT/dist/v2-renpy" ]; then
    cp -R "$ROOT/dist/v2-renpy/." "$DIST/v2/"
  fi
else
  echo "build-all: v2 skipped (Ren'Py SDK not present)"
fi

echo "build-all: done"
ls -la "$DIST"
