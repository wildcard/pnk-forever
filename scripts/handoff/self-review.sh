#!/usr/bin/env bash
# Read a PR diff, post a self-review comment flagging common smells.
set -euo pipefail

pr="${1:?usage: $0 <PR#>}"

diff="$(gh pr diff "$pr")"
flags=()

# Files over 500 lines
while IFS= read -r file; do
  lines=$(grep -cE '^\+' <<< "$diff" || true)
done
changed_files=$(gh pr diff "$pr" --name-only 2>/dev/null || \
  gh pr view "$pr" --json files -q '.files[].path')

for f in $changed_files; do
  if [[ -f "$f" ]]; then
    n=$(wc -l < "$f")
    [[ "$n" -gt 500 ]] && flags+=("- \`$f\` is $n lines — consider splitting")
  fi
done

# Disallowed patterns in the diff
grep -qE '^\+.*\bconsole\.log\b' <<< "$diff" && flags+=("- \`console.log\` added to source")
grep -qE '^\+.*\bany\b.*[:=]' <<< "$diff"    && flags+=("- \`any\` type used")
grep -qE '^\+.*--no-verify' <<< "$diff"     && flags+=("- \`--no-verify\` present — should not be committed")

if [[ ${#flags[@]} -eq 0 ]]; then
  body="Self-review: no red flags. ✓"
else
  body="Self-review flags:"$'\n'
  for f in "${flags[@]}"; do body+=$'\n'"$f"; done
fi

gh pr comment "$pr" --body "$body"
