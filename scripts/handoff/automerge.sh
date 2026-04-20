#!/usr/bin/env bash
# Merge (squash) any of your open PRs that have the `auto-merge` label AND
# are mergeable AND all checks are green. No-op otherwise.
set -euo pipefail

mapfile -t candidates < <(
  gh pr list \
    --author @me \
    --state open \
    --label auto-merge \
    --json number,mergeable,statusCheckRollup \
    --jq '.[] | select(
      .mergeable == "MERGEABLE"
      and (.statusCheckRollup | length > 0)
      and (.statusCheckRollup | all(.conclusion == "SUCCESS" or .conclusion == "NEUTRAL" or .conclusion == "SKIPPED"))
    ) | .number'
)

if [[ ${#candidates[@]} -eq 0 ]]; then
  echo "no PRs ready for auto-merge"
  exit 0
fi

for pr in "${candidates[@]}"; do
  echo "merging PR #$pr"
  gh pr merge "$pr" --squash --delete-branch
done
