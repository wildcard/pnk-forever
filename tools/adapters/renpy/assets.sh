#!/usr/bin/env bash
# assets.sh — copy/convert IR-referenced assets into v2-renpy/game/images/.
#
# Current scope: backgrounds only (content/assets/backgrounds/*). Sprites and
# audio are not used by v1 yet; hooks left in place for later.
#
# Conversion target: WebP where source permits (keeps the 50MB-per-file
# Ren'Py-Web cap well out of reach). When `cwebp` is unavailable, copies the
# source file through unchanged — Ren'Py Web accepts PNG/JPG directly.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SRC="$ROOT/content/assets/backgrounds"
DEST="$ROOT/v2-renpy/game/images"

mkdir -p "$DEST"

if [ ! -d "$SRC" ] || [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  echo "renpy-assets: no backgrounds in $SRC — skipping (v2-renpy/game/images/ left empty)"
  exit 0
fi

HAS_CWEBP=0
if command -v cwebp >/dev/null 2>&1; then HAS_CWEBP=1; fi

count=0
for src in "$SRC"/*; do
  [ -f "$src" ] || continue
  base="$(basename "$src")"
  stem="${base%.*}"
  ext="${base##*.}"
  case "$ext" in
    png|jpg|jpeg)
      if [ "$HAS_CWEBP" -eq 1 ]; then
        cwebp -quiet -q 85 "$src" -o "$DEST/$stem.webp"
      else
        cp "$src" "$DEST/$base"
      fi
      ;;
    webp|*)
      cp "$src" "$DEST/$base"
      ;;
  esac
  count=$((count + 1))
done

echo "renpy-assets: processed $count file(s) into $DEST (cwebp=$HAS_CWEBP)"
