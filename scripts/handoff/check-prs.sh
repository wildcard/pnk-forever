#!/usr/bin/env bash
# Print a table of open PRs authored by the current user with CI status.
set -euo pipefail

gh pr list \
  --author @me \
  --state open \
  --json number,title,headRefName,mergeable,statusCheckRollup \
  --jq '.[] | [
    .number,
    (.statusCheckRollup | map(.conclusion // .status) | if length == 0 then "∅" elif any(. == "FAILURE") then "✗" elif any(. == "IN_PROGRESS" or . == "PENDING") then "…" else "✓" end),
    .mergeable,
    .title
  ] | @tsv' \
  | column -t -s $'\t'
