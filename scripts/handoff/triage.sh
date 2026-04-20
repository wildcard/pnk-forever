#!/usr/bin/env bash
# Bump any open issue with no activity in 7+ days.
set -euo pipefail

cutoff=$(date -u -d '7 days ago' +%s 2>/dev/null || date -u -v-7d +%s)

gh issue list --state open --json number,title,updatedAt --jq '.[] | [.number, .updatedAt, .title] | @tsv' \
| while IFS=$'\t' read -r num updated title; do
    ts=$(date -u -d "$updated" +%s 2>/dev/null || date -u -jf "%Y-%m-%dT%H:%M:%SZ" "$updated" +%s)
    if [[ "$ts" -lt "$cutoff" ]]; then
      echo "bump #$num — $title"
      gh issue comment "$num" --body "Still open after a week — bumping. Next step?"
    fi
  done
