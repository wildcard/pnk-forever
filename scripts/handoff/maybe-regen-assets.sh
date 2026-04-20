#!/usr/bin/env bash
# If the generator script is newer than any image, trigger the workflow.
set -euo pipefail

gen="v1-modern/scripts/generate-assets.mjs"
img_dir="v1-modern/public/img"

[[ -f "$gen" ]] || { echo "generator not found"; exit 0; }

gen_ts=$(git log -1 --format=%ct -- "$gen")
img_ts=$(git log -1 --format=%ct -- "$img_dir")

if [[ "$gen_ts" -gt "${img_ts:-0}" ]]; then
  echo "generator newer than images — triggering workflow"
  gh workflow run generate-assets.yml --ref "$(git rev-parse --abbrev-ref HEAD)"
else
  echo "images up to date"
fi
