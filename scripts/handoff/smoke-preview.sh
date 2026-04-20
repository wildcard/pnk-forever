#!/usr/bin/env bash
# Smoke-check the deployed preview. Exit non-zero on failure so a scheduler can alert.
set -euo pipefail

URL="${PREVIEW_URL:-https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app}"

echo "smoke: $URL"

status=$(curl -s -o /dev/null -w '%{http_code}' "$URL/")
[[ "$status" == "200" ]] || { echo "  fail: root returned $status"; exit 1; }

# config.yaml must be served and contain the game title
config=$(curl -sf "$URL/data/config.yaml")
grep -q 'gameTitle: P&K Forever' <<< "$config" || { echo "  fail: config.yaml missing gameTitle"; exit 1; }

# at least one scene image must be >1KB (real artwork, not placeholder)
size=$(curl -sI "$URL/img/beach_rest.png" | awk 'tolower($1) == "content-length:" { print $2 }' | tr -d '\r')
if [[ -z "$size" || "$size" -lt 1024 ]]; then
  echo "  warn: beach_rest.png looks like a placeholder ($size bytes)"
  # not a hard fail yet — images might not be generated
fi

echo "  ok"
