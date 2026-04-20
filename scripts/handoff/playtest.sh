#!/usr/bin/env bash
# Automated playtest routine: tests the game and suggests improvements until ready to ship.
set -euo pipefail

URL="${PREVIEW_URL:-https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app}"
OUTPUT_DIR="$(mktemp -d)"
REPORT="$OUTPUT_DIR/playtest-report.md"

echo "=== Playtest starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "Testing: $URL"
echo ""

# Check if we have Node and can install Playwright
if ! command -v npx &> /dev/null; then
  echo "ERROR: npx not found. Install Node.js first."
  exit 1
fi

# Install Playwright if needed (uses system-wide cache)
echo "Ensuring Playwright is installed..."
npx -y playwright install chromium 2>&1 | grep -v "Playwright" || true

# Create test script
cat > "$OUTPUT_DIR/test.mjs" << 'EOTEST'
import { chromium } from 'playwright';

const URL = process.env.PREVIEW_URL || 'https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app';
const OUTPUT_DIR = process.env.OUTPUT_DIR;

async function runPlaytest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const findings = {
    critical: [],
    warnings: [],
    improvements: [],
    positives: [],
    ready_criteria: {
      visuals_present: false,
      narrat_playable: false,
      v0_accessible: false,
      engaging_narrative: false,
      clear_choices: false,
      easter_eggs_work: false,
    }
  };

  try {
    // Load the game
    console.log('Loading game...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `${OUTPUT_DIR}/01-load.png` });

    // Check for Narrat UI elements
    const narratContainer = await page.$('.narrat-app');
    if (!narratContainer) {
      findings.critical.push('Narrat container not found - game may not be initializing');
    } else {
      findings.positives.push('Narrat engine loaded successfully');
    }

    // Check for backgrounds
    const backgrounds = await page.$$eval('.scene-background, .background', els =>
      els.map(el => ({
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        src: el.style.backgroundImage || el.getAttribute('src'),
      }))
    );

    if (backgrounds.length === 0) {
      findings.critical.push('No background elements found');
    } else if (backgrounds.some(bg => bg.visible && bg.src && !bg.src.includes('gradient'))) {
      findings.ready_criteria.visuals_present = true;
      findings.positives.push(`Visual backgrounds detected (${backgrounds.length} elements)`);
    } else {
      findings.warnings.push('Only CSS gradient backgrounds - real images missing');
    }

    // Wait for dialog to appear
    await page.waitForSelector('.dialog-panel, .narrat-dialog', { timeout: 5000 }).catch(() => {
      findings.critical.push('Dialog panel never appeared - game may be stuck');
    });
    await page.screenshot({ path: `${OUTPUT_DIR}/02-dialog.png` });

    // Check for character sprites
    const sprites = await page.$$('.character-sprite, .sprite');
    if (sprites.length > 0) {
      findings.positives.push(`Character sprites present (${sprites.length} found)`);
    } else {
      findings.improvements.push('Character sprites missing - add show commands for Phoenix/K');
    }

    // Read initial dialog text
    const dialogText = await page.$eval('.dialog-panel, .narrat-dialog', el => el.textContent).catch(() => '');
    if (dialogText.length > 50) {
      findings.ready_criteria.engaging_narrative = true;
      findings.positives.push('Narrative text displays properly');
    } else {
      findings.warnings.push('Dialog text seems truncated or missing');
    }

    // Check for choices
    const choices = await page.$$('.choice-button, .narrat-choice-button, button.choice');
    if (choices.length > 0) {
      findings.ready_criteria.clear_choices = true;
      findings.positives.push(`Interactive choices available (${choices.length} buttons)`);

      // Click first choice and see if game progresses
      await choices[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUTPUT_DIR}/03-after-choice.png` });

      const newText = await page.$eval('.dialog-panel, .narrat-dialog', el => el.textContent).catch(() => '');
      if (newText !== dialogText) {
        findings.ready_criteria.narrat_playable = true;
        findings.positives.push('Game progression works - choice triggered new dialog');
      } else {
        findings.warnings.push('Choice clicked but dialog did not change');
      }
    } else {
      findings.critical.push('No choice buttons found - player cannot progress');
    }

    // Test slushy interaction (should be on beach_rest scene)
    const slushyChoice = await page.$('button:has-text("drink"), button:has-text("sip"), button:has-text("slushy")');
    if (slushyChoice) {
      findings.positives.push('Found slushy interaction - puzzle mechanics present');
    }

    // Check console for errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.waitForTimeout(1000);
    if (errors.length > 0) {
      findings.warnings.push(`${errors.length} console errors detected: ${errors.slice(0, 3).join('; ')}`);
    }

    // Try to access v0 version (check if it exists)
    const v0Response = await page.goto(`${URL.replace('/v1-modern', '')}/v0-original-text-engine/index.html`, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
    if (v0Response && v0Response.ok()) {
      findings.ready_criteria.v0_accessible = true;
      findings.positives.push('Original v0 text adventure remains accessible');
      await page.screenshot({ path: `${OUTPUT_DIR}/04-v0-check.png` });
    } else {
      findings.improvements.push('v0 text adventure not accessible at expected path');
    }

    // Easter egg check (look for tea/mango/chocolate/kite/love/fly keywords)
    const scriptContent = await page.content();
    const easterEggKeywords = ['mango', 'tea', 'chocolate', 'kite', 'love', 'fly'];
    const foundKeywords = easterEggKeywords.filter(kw => scriptContent.toLowerCase().includes(kw));
    if (foundKeywords.length >= 3) {
      findings.ready_criteria.easter_eggs_work = true;
      findings.positives.push(`Easter egg keywords present: ${foundKeywords.join(', ')}`);
    } else {
      findings.improvements.push('Easter egg triggers may not be wired (need IFTTT webhook implementation)');
    }

  } catch (error) {
    findings.critical.push(`Test crashed: ${error.message}`);
  } finally {
    await browser.close();
  }

  return findings;
}

// Run and output JSON
const results = await runPlaytest();
console.log(JSON.stringify(results, null, 2));
EOTEST

# Run the test script
echo "Running automated playtest..."
cd "$OUTPUT_DIR"
RESULTS=$(PREVIEW_URL="$URL" OUTPUT_DIR="$OUTPUT_DIR" node test.mjs 2>&1 || echo '{"critical":["Test script failed"],"warnings":[],"improvements":[],"positives":[],"ready_criteria":{}}')

# Parse results and generate report
cat > "$REPORT" << 'EOREPORT'
# Playtest Report

**Tested at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**URL:** $URL

## Ready to Ship Criteria

EOREPORT

# Extract ready criteria (requires jq)
if command -v jq &> /dev/null; then
  echo "$RESULTS" | jq -r '
    "### Checklist\n" +
    (.ready_criteria | to_entries | map(
      "- [" + (if .value then "x" else " " end) + "] " + (.key | gsub("_"; " ") | ascii_upcase)
    ) | join("\n"))
  ' >> "$REPORT"

  echo "" >> "$REPORT"
  echo "## Findings" >> "$REPORT"
  echo "" >> "$REPORT"

  CRITICAL_COUNT=$(echo "$RESULTS" | jq '.critical | length')
  WARNING_COUNT=$(echo "$RESULTS" | jq '.warnings | length')
  IMPROVEMENT_COUNT=$(echo "$RESULTS" | jq '.improvements | length')
  POSITIVE_COUNT=$(echo "$RESULTS" | jq '.positives | length')

  if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
    echo "### 🔴 Critical Issues ($CRITICAL_COUNT)" >> "$REPORT"
    echo "$RESULTS" | jq -r '.critical[] | "- " + .' >> "$REPORT"
    echo "" >> "$REPORT"
  fi

  if [[ "$WARNING_COUNT" -gt 0 ]]; then
    echo "### ⚠️  Warnings ($WARNING_COUNT)" >> "$REPORT"
    echo "$RESULTS" | jq -r '.warnings[] | "- " + .' >> "$REPORT"
    echo "" >> "$REPORT"
  fi

  if [[ "$IMPROVEMENT_COUNT" -gt 0 ]]; then
    echo "### 💡 Suggested Improvements ($IMPROVEMENT_COUNT)" >> "$REPORT"
    echo "$RESULTS" | jq -r '.improvements[] | "- " + .' >> "$REPORT"
    echo "" >> "$REPORT"
  fi

  if [[ "$POSITIVE_COUNT" -gt 0 ]]; then
    echo "### ✅ Working Well ($POSITIVE_COUNT)" >> "$REPORT"
    echo "$RESULTS" | jq -r '.positives[] | "- " + .' >> "$REPORT"
    echo "" >> "$REPORT"
  fi

  # Determine if ready to ship
  READY=$(echo "$RESULTS" | jq -r '
    .ready_criteria |
    ((.visuals_present and .narrat_playable and .engaging_narrative and .clear_choices) | tostring)
  ')

  echo "## Status" >> "$REPORT"
  echo "" >> "$REPORT"
  if [[ "$READY" == "true" && "$CRITICAL_COUNT" -eq 0 ]]; then
    echo "**🎉 READY TO SHIP** - Game meets core quality criteria!" >> "$REPORT"
  else
    echo "**🚧 NOT READY** - Address critical issues and improve quality before shipping." >> "$REPORT"
    echo "" >> "$REPORT"
    echo "**Next steps:**" >> "$REPORT"
    if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
      echo "1. Fix all critical issues listed above" >> "$REPORT"
    fi
    if [[ "$READY" != "true" ]]; then
      echo "2. Complete missing ready criteria (see checklist)" >> "$REPORT"
    fi
    if [[ "$IMPROVEMENT_COUNT" -gt 0 ]]; then
      echo "3. Implement suggested improvements" >> "$REPORT"
    fi
  fi

else
  echo "⚠️  jq not installed - showing raw results" >> "$REPORT"
  echo "" >> "$REPORT"
  echo '```json' >> "$REPORT"
  echo "$RESULTS" >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# Add screenshots section
echo "" >> "$REPORT"
echo "## Screenshots" >> "$REPORT"
echo "" >> "$REPORT"
echo "Captured at: \`$OUTPUT_DIR\`" >> "$REPORT"
ls -1 "$OUTPUT_DIR"/*.png 2>/dev/null | while read -r img; do
  echo "- $(basename "$img")" >> "$REPORT"
done

# Output report
echo ""
echo "=========================================="
cat "$REPORT"
echo "=========================================="
echo ""
echo "Full report saved to: $REPORT"
echo "Screenshots saved to: $OUTPUT_DIR"
echo ""

# Return exit code based on readiness
if [[ "$READY" == "true" && "$CRITICAL_COUNT" -eq 0 ]]; then
  echo "✅ Game is ready to ship!"
  exit 0
else
  echo "🚧 Game needs more work. Re-run this script after making improvements."
  exit 1
fi
