#!/usr/bin/env bash
# roundtrip.sh — verify narrat ⇄ IR round-trip fidelity.
#
# 1. Snapshot current v1-modern/src/scripts and config.yaml to /tmp.
# 2. Parse originals → content/ IR.
# 3. Emit IR → v1-modern/ (overwrites).
# 4. Normalize (strip blank lines, emitter header) and diff against snapshot.
#
# Exit 0 if the structural diff is empty. Non-zero otherwise with a full diff
# printed. Whitespace / label-ordering drift is normalized out; any remaining
# difference indicates a lossy parser or missing IR field.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADAPTER_DIR="$SCRIPT_DIR"
REPO_ROOT="$(cd "$ADAPTER_DIR/../../.." && pwd)"

V1_SCRIPTS="$REPO_ROOT/v1-modern/src/scripts"
V1_CONFIG="$REPO_ROOT/v1-modern/public/data/config.yaml"
SNAPSHOT="$(mktemp -d -t pnk-roundtrip-XXXXXX)"

cleanup() { rm -rf "$SNAPSHOT"; }
trap cleanup EXIT

echo "roundtrip: snapshot → $SNAPSHOT"
cp -R "$V1_SCRIPTS" "$SNAPSHOT/scripts.before"
cp "$V1_CONFIG" "$SNAPSHOT/config.before.yaml"

echo "roundtrip: parse v1-modern → content/"
( cd "$ADAPTER_DIR" && npm run parse --silent )

echo "roundtrip: emit content/ → v1-modern/"
( cd "$ADAPTER_DIR" && npm run emit --silent )

# Normalize: drop emitter header, blank lines, and sort labels alphabetically
# so order-only drift doesn't fail the diff.
normalize() {
  local src="$1"
  local dst="$2"
  mkdir -p "$dst"
  for f in "$src"/*.narrat; do
    local base
    base="$(basename "$f")"
    # Remove DO NOT EDIT header line and blank lines; output sorted label blocks.
    awk '
      /^# DO NOT EDIT/ { next }
      /^[[:space:]]*$/ { next }
      { print }
    ' "$f" > "$dst/$base"
  done
}

normalize "$SNAPSHOT/scripts.before" "$SNAPSHOT/before.norm"
normalize "$V1_SCRIPTS" "$SNAPSHOT/after.norm"

echo "roundtrip: diff"
DRIFT=0
for f in "$SNAPSHOT/before.norm"/*.narrat; do
  base="$(basename "$f")"
  after="$SNAPSHOT/after.norm/$base"
  if [ ! -f "$after" ]; then
    echo "  MISSING: $base not emitted"
    DRIFT=1
    continue
  fi
  # Sort labels (each label block starts at column 0) before diffing so
  # authored-order vs alphabetical doesn't register as drift.
  sort_labels() {
    awk '
      BEGIN { buf = "" }
      /^[a-z_][a-z_0-9]*( [a-z_][a-z_0-9]*)?:$/ {
        if (buf != "") print buf "\037"
        buf = $0
        next
      }
      { buf = buf "\n" $0 }
      END { if (buf != "") print buf "\037" }
    ' "$1" | sort | tr -d '\037'
  }
  before_sorted="$SNAPSHOT/before.norm/$base.sorted"
  after_sorted="$SNAPSHOT/after.norm/$base.sorted"
  sort_labels "$f" > "$before_sorted"
  sort_labels "$after" > "$after_sorted"
  if ! diff -q "$before_sorted" "$after_sorted" > /dev/null; then
    echo "  DRIFT in $base:"
    diff -u "$before_sorted" "$after_sorted" | head -60 || true
    DRIFT=1
  else
    echo "  OK: $base"
  fi
done

if [ "$DRIFT" -eq 0 ]; then
  echo "roundtrip: clean"
  exit 0
fi
echo "roundtrip: drift detected"
exit 1
