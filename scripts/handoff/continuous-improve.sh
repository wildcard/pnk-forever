#!/usr/bin/env bash
# Continuous improvement loop: runs playtest, applies fixes, repeats until ready.
set -euo pipefail

MAX_ITERATIONS="${MAX_ITERATIONS:-10}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-30}"
PLAYTEST_SCRIPT="$(dirname "$0")/playtest.sh"

echo "=== Continuous Improvement Loop ==="
echo "Max iterations: $MAX_ITERATIONS"
echo "Sleep between runs: ${SLEEP_BETWEEN}s"
echo ""

if [[ ! -f "$PLAYTEST_SCRIPT" ]]; then
  echo "ERROR: playtest.sh not found at $PLAYTEST_SCRIPT"
  exit 1
fi

iteration=0
ready=false

while [[ $iteration -lt $MAX_ITERATIONS ]]; do
  iteration=$((iteration + 1))
  echo ""
  echo "╔═══════════════════════════════════════╗"
  echo "║  ITERATION $iteration/$MAX_ITERATIONS"
  echo "╚═══════════════════════════════════════╝"
  echo ""

  # Run playtest
  if bash "$PLAYTEST_SCRIPT"; then
    ready=true
    echo ""
    echo "🎉 Game is ready to ship! Exiting loop."
    break
  fi

  # Extract improvement suggestions from last run
  # (In a real implementation, this would parse the report and apply automated fixes)
  echo ""
  echo "📋 Suggested actions for next iteration:"
  echo "  1. Review playtest report above"
  echo "  2. Fix critical issues manually or via automation"
  echo "  3. Deploy updated version to preview"
  echo "  4. Script will re-test in ${SLEEP_BETWEEN}s..."
  echo ""

  # Wait before next iteration
  if [[ $iteration -lt $MAX_ITERATIONS ]]; then
    sleep "$SLEEP_BETWEEN"
  fi
done

if [[ "$ready" == true ]]; then
  echo ""
  echo "✅ SUCCESS: Game passed quality check after $iteration iteration(s)"
  exit 0
else
  echo ""
  echo "⚠️  WARNING: Reached max iterations ($MAX_ITERATIONS) without passing"
  echo "Manual intervention may be required."
  exit 1
fi
