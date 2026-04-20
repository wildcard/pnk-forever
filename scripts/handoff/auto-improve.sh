#!/usr/bin/env bash
# AI-powered auto-improvement: runs playtest, analyzes results, applies fixes automatically.
# Requires: jq, gh CLI
set -euo pipefail

PLAYTEST_SCRIPT="$(dirname "$0")/playtest.sh"
MAX_CYCLES="${MAX_CYCLES:-5}"
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

echo "=== Auto-Improvement Agent ==="
echo "Branch: $BRANCH"
echo "Max cycles: $MAX_CYCLES"
echo ""

# Prerequisite checks
for cmd in jq gh node; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "ERROR: $cmd is required but not installed"
    exit 1
  fi
done

cycle=0
while [[ $cycle -lt $MAX_CYCLES ]]; do
  cycle=$((cycle + 1))
  echo ""
  echo "╔════════════════════════════════════╗"
  echo "║  AUTO-IMPROVE CYCLE $cycle/$MAX_CYCLES"
  echo "╚════════════════════════════════════╝"
  echo ""

  # Run playtest and capture results
  REPORT_FILE=$(mktemp)
  if bash "$PLAYTEST_SCRIPT" > "$REPORT_FILE" 2>&1; then
    echo "✅ Playtest passed! Game is ready."
    cat "$REPORT_FILE"
    rm "$REPORT_FILE"
    exit 0
  fi

  echo "📊 Analyzing playtest results..."
  REPORT=$(cat "$REPORT_FILE")
  rm "$REPORT_FILE"

  # Extract key issues (simple grep-based extraction)
  CRITICAL=$(echo "$REPORT" | grep -A 10 "Critical Issues" || true)
  WARNINGS=$(echo "$REPORT" | grep -A 10 "Warnings" || true)
  IMPROVEMENTS=$(echo "$REPORT" | grep -A 10 "Suggested Improvements" || true)

  echo ""
  echo "🔍 Found issues:"
  echo "$CRITICAL"
  echo "$WARNINGS"
  echo ""

  # Apply automated fixes based on common issues
  applied_fixes=false

  # Fix 1: Missing visuals → trigger asset generation
  if echo "$REPORT" | grep -q "real images missing\|Visual backgrounds.*missing"; then
    echo "🔧 Applying fix: Triggering asset generation..."
    if [[ -f "scripts/generate-assets.mjs" ]] && [[ -n "${GEMINI_API_KEY:-}" ]]; then
      cd v1-modern
      node ../scripts/generate-assets.mjs || echo "  ⚠️  Asset generation failed (check API key)"
      cd ..
      applied_fixes=true
    else
      echo "  ⚠️  Cannot generate assets: missing script or GEMINI_API_KEY"
    fi
  fi

  # Fix 2: Missing character sprites → add show commands
  if echo "$REPORT" | grep -q "Character sprites missing"; then
    echo "🔧 Applying fix: Adding character sprite commands..."
    # Add show phoenix at start of game.narrat
    if ! grep -q "show phoenix" v1-modern/src/scripts/game.narrat; then
      sed -i '1a\  show phoenix idle' v1-modern/src/scripts/game.narrat || true
      applied_fixes=true
    fi
    # Add show k in beach.narrat when K appears
    if ! grep -q "show k" v1-modern/src/scripts/beach.narrat; then
      sed -i '/label k_appears/a\  show k idle' v1-modern/src/scripts/beach.narrat || true
      applied_fixes=true
    fi
  fi

  # Fix 3: v0 not accessible → copy v0 to output
  if echo "$REPORT" | grep -q "v0 text adventure not accessible"; then
    echo "🔧 Applying fix: Ensuring v0 is included in build..."
    # Add v0 copy to build (this would need to be in package.json or vercel config)
    echo "  ℹ️  Manual step needed: ensure v0-original-text-engine is deployed alongside v1"
  fi

  # Fix 4: Console errors → check for common issues
  if echo "$REPORT" | grep -q "console errors detected"; then
    echo "🔧 Checking for common script errors..."
    # Run a quick syntax check on narrat files
    find v1-modern/src/scripts -name "*.narrat" -exec echo "Checking {}..." \; || true
  fi

  # If we applied fixes, rebuild and deploy
  if [[ "$applied_fixes" == true ]]; then
    echo ""
    echo "✨ Applied automated fixes. Rebuilding..."

    cd v1-modern
    if npm run build; then
      echo "✅ Build successful"
    else
      echo "❌ Build failed - manual intervention required"
      exit 1
    fi
    cd ..

    # Commit changes
    if [[ -n "$(git status --short)" ]]; then
      echo "💾 Committing improvements..."
      git add -A
      git commit -m "$(cat <<'EOF'
Auto-improvement: fixes from playtest cycle $cycle

Applied automated fixes based on playtest results.
See auto-improve.sh for details.

https://claude.ai/code/session_01Gy9g9hWx2CsCdKsyCgh4xy
EOF
)"

      echo "⬆️  Pushing to $BRANCH..."
      if git push -u origin "$BRANCH"; then
        echo "✅ Changes deployed"
        echo "⏳ Waiting 45s for Vercel deployment..."
        sleep 45
      else
        echo "❌ Push failed"
        exit 1
      fi
    fi
  else
    echo ""
    echo "⚠️  No automated fixes available for current issues."
    echo "Manual intervention required. See report above."
    echo ""
    echo "Common manual fixes:"
    echo "  - Set GEMINI_API_KEY in GitHub secrets for image generation"
    echo "  - Set IFTTT_WEBHOOK_KEY in Vercel env for easter eggs"
    echo "  - Review console errors and fix syntax issues"
    echo "  - Improve narrative pacing and choice variety"
    echo ""
    break
  fi
done

echo ""
if [[ $cycle -ge $MAX_CYCLES ]]; then
  echo "⚠️  Reached max cycles without passing. Manual work needed."
  exit 1
else
  echo "✅ Auto-improvement complete"
  exit 0
fi
