#!/usr/bin/env bash
# Create all P0/P1 GitHub issues from docs/issues/*.md.
# Idempotent: skips issues whose title already exists.
set -euo pipefail

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
ISSUES_DIR="$(dirname "$0")/../../docs/issues"

declare -A ISSUE_TITLES=(
  [i-01-gemini-secret]="I-1: Add GEMINI_API_KEY to GitHub + Vercel secrets"
  [i-02-generate-images]="I-2: Generate real scene images via Imagen"
  [i-03-ifttt-easter-eggs]="I-3: Wire IFTTT easter egg webhooks"
  [i-04-character-sprites]="I-4: Show character sprites during dialogue"
  [i-05-ci]="I-5: CI workflow — typecheck + build on every PR"
  [i-06-playwright-smoke]="I-6: Playwright smoke test — game reaches Jaffa"
  [i-07-mobile]="I-7: Mobile layout pass"
  [i-08-favicon-og]="I-8: Favicon + OG metadata"
  [i-09-readme]="I-9: Root README"
)

declare -A ISSUE_LABELS=(
  [i-01-gemini-secret]="p0,infra"
  [i-02-generate-images]="p0,content"
  [i-03-ifttt-easter-eggs]="p0,feature"
  [i-04-character-sprites]="p0,feature"
  [i-05-ci]="p1,infra"
  [i-06-playwright-smoke]="p1,tests"
  [i-07-mobile]="p1,ui"
  [i-08-favicon-og]="p1,ui"
  [i-09-readme]="p1,docs"
)

# Make sure labels exist
for label in p0 p1 p2 infra feature content tests ui docs no-pr auto-merge; do
  gh label create "$label" --repo "$REPO" --color BFD4F2 2>/dev/null || true
done

existing=$(gh issue list --repo "$REPO" --state all --limit 200 --json title -q '.[].title')

for slug in "${!ISSUE_TITLES[@]}"; do
  title="${ISSUE_TITLES[$slug]}"
  labels="${ISSUE_LABELS[$slug]}"
  body_file="${ISSUES_DIR}/${slug}.md"

  if grep -qxF "$title" <<< "$existing"; then
    echo "  skip  $title"
    continue
  fi
  if [[ ! -f "$body_file" ]]; then
    echo "  MISS  $body_file — skipping"
    continue
  fi

  echo "  create $title"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --label "$labels" \
    --body-file "$body_file"
done
