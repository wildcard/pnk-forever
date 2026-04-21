#!/usr/bin/env bash
# check-easter-eggs.sh — fails if any keyword from docs/easter-eggs.md's
# canonical list is absent from every v1-modern/src/scripts/*.narrat file.
#
# Used by the easter-eggs CI workflow and can be run locally as a pre-commit
# check. Part of the single-source-of-truth contract established in issue #6.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYWORDS_FILE="$REPO_ROOT/docs/easter-eggs.md"
NARRAT_DIR="$REPO_ROOT/v1-modern/src/scripts"

if [[ ! -f "$KEYWORDS_FILE" ]]; then
  echo "ERROR: $KEYWORDS_FILE not found" >&2
  exit 2
fi

# Parse keywords from the fenced ```keywords ... ``` block.
keywords=$(awk '
  /^```keywords$/ { inblock=1; next }
  /^```$/ && inblock { exit }
  inblock && NF > 0 { print }
' "$KEYWORDS_FILE")

if [[ -z "$keywords" ]]; then
  echo "ERROR: no keywords parsed from $KEYWORDS_FILE (missing or malformed \`\`\`keywords block)" >&2
  exit 2
fi

total=$(printf '%s\n' "$keywords" | grep -c .)
missing=()
while IFS= read -r kw; do
  [[ -z "$kw" ]] && continue
  if ! grep -l -- "$kw" "$NARRAT_DIR"/*.narrat >/dev/null 2>&1; then
    missing+=("$kw")
  fi
done <<<"$keywords"

if (( ${#missing[@]} > 0 )); then
  echo "ERROR: these keywords from $KEYWORDS_FILE are absent from every $NARRAT_DIR/*.narrat:" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi

echo "OK: all $total easter-egg keywords present in at least one narrat script"
