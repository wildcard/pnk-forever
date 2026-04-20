#!/usr/bin/env bash
# fetch.sh — download + verify + extract the pinned Ren'Py SDK.
#
# Idempotent: if the target directory already exists and version.txt matches,
# skip. Otherwise download, checksum, extract.
#
# Platforms: macOS (darwin) + Linux. Windows is WSL-only.
set -euo pipefail

VERSION="${RENPY_VERSION:-8.3.7}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/renpy-$VERSION"
MARKER="$TARGET_DIR/version.txt"

if [ -f "$MARKER" ] && [ "$(cat "$MARKER")" = "$VERSION" ]; then
  echo "fetch: renpy-$VERSION already present at $TARGET_DIR"
  exit 0
fi

OS="$(uname -s)"
case "$OS" in
  Darwin) SDK_FILE="renpy-$VERSION-sdk.dmg" ;;
  Linux)  SDK_FILE="renpy-$VERSION-sdk.tar.bz2" ;;
  *) echo "fetch: unsupported OS: $OS"; exit 2 ;;
esac

URL="https://www.renpy.org/dl/$VERSION/$SDK_FILE"
CHECKSUM_URL="https://www.renpy.org/dl/$VERSION/checksums.txt"

WORK="$(mktemp -d -t pnk-renpy-XXXXXX)"
trap 'rm -rf "$WORK"' EXIT

echo "fetch: downloading $URL"
curl -fL --retry 3 -o "$WORK/$SDK_FILE" "$URL"

echo "fetch: verifying checksum"
curl -fL --retry 3 -o "$WORK/checksums.txt" "$CHECKSUM_URL"
EXPECTED="$(grep " $SDK_FILE\$" "$WORK/checksums.txt" | awk '{print $1}')"
if [ -z "$EXPECTED" ]; then
  echo "fetch: no checksum entry for $SDK_FILE"; exit 3
fi
if command -v shasum >/dev/null; then
  ACTUAL="$(shasum -a 256 "$WORK/$SDK_FILE" | awk '{print $1}')"
else
  ACTUAL="$(sha256sum "$WORK/$SDK_FILE" | awk '{print $1}')"
fi
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "fetch: checksum mismatch"; echo "  expected: $EXPECTED"; echo "  actual:   $ACTUAL"; exit 4
fi

echo "fetch: extracting"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
case "$OS" in
  Darwin)
    hdiutil attach "$WORK/$SDK_FILE" -nobrowse -mountpoint "$WORK/mnt"
    cp -R "$WORK/mnt/renpy-$VERSION-sdk/." "$TARGET_DIR/"
    hdiutil detach "$WORK/mnt" -quiet
    ;;
  Linux)
    tar -xjf "$WORK/$SDK_FILE" -C "$TARGET_DIR" --strip-components=1
    ;;
esac

echo "$VERSION" > "$MARKER"
echo "fetch: ready at $TARGET_DIR"
