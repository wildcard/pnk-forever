#!/usr/bin/env bash
# Automated playtest routine: tests the game and suggests improvements until ready to ship.
set -euo pipefail

MODE="${MODE:-local}"
URL="${PREVIEW_URL:-}"
OUTPUT_DIR="$(mktemp -d)"
REPORT="$OUTPUT_DIR/playtest-report.md"
LOCAL_PORT="${LOCAL_PORT:-8765}"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [[ -z "$URL" ]]; then
  echo "=== Playtest starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "Mode: LOCAL (serving from $REPO_ROOT/v1-modern/dist)"

  if [[ ! -d "$REPO_ROOT/v1-modern/dist" ]]; then
    echo "Building game first..."
    cd "$REPO_ROOT/v1-modern" && npm run build && cd "$REPO_ROOT"
  fi

  # Start fresh server (kill anything on the port first)
  lsof -ti:$LOCAL_PORT 2>/dev/null | xargs -r kill 2>/dev/null || true
  sleep 1

  echo "Starting static server on port $LOCAL_PORT..."
  cd "$REPO_ROOT/v1-modern/dist"
  python3 -m http.server "$LOCAL_PORT" > /dev/null 2>&1 &
  SERVER_PID=$!
  cd "$REPO_ROOT"
  sleep 2
  URL="http://localhost:$LOCAL_PORT"
  echo "Testing: $URL"
else
  echo "=== Playtest starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  echo "Mode: REMOTE"
  echo "Testing: $URL"
fi
echo ""

if ! command -v node &> /dev/null; then
  echo "ERROR: node not found."
  exit 1
fi

# Set up temp project with Playwright
cd "$OUTPUT_DIR"
echo '{"type":"module"}' > package.json
npm install --silent --no-save playwright@latest 2>&1 | grep -v "added\|up to date" || true
npx playwright install chromium 2>&1 | grep -v "Playwright" || true

# Create test script
cat > test.mjs << 'EOTEST'
import { chromium } from 'playwright';

const URL = process.env.PREVIEW_URL || 'http://localhost:8765';
const OUTPUT_DIR = process.cwd();

async function runPlaytest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const findings = {
    critical: [],
    warnings: [],
    improvements: [],
    positives: [],
    dialog_history: [],
    ready_criteria: {
      splash_works: false,
      menu_works: false,
      narrative_progresses: false,
      choices_appear: false,
      choices_work: false,
      visuals_present: false,
      character_sprites: false,
      v0_accessible: false,
      easter_eggs_present: false,
      no_console_errors: false,
    }
  };

  try {
    // === Phase 1: Load ===
    console.error('Phase 1: Loading game...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUTPUT_DIR}/01-splash.png` });

    // === Phase 2: Splash screen ===
    const pressStart = await page.getByRole('button', { name: /press to start/i });
    if (await pressStart.count() > 0) {
      await pressStart.click();
      await page.waitForTimeout(2000);
      findings.ready_criteria.splash_works = true;
      findings.positives.push('Splash screen → Press to start works');
    } else {
      findings.warnings.push('No splash screen found (may have auto-progressed)');
    }
    await page.screenshot({ path: `${OUTPUT_DIR}/02-menu.png` });

    // === Phase 3: Title menu ===
    const newGame = await page.getByRole('button', { name: /new game/i });
    if (await newGame.count() > 0) {
      await newGame.click();
      await page.waitForTimeout(2500);
      findings.ready_criteria.menu_works = true;
      findings.positives.push('Title menu → New Game works');
    } else {
      findings.critical.push('Title menu "New Game" button not found');
    }
    await page.screenshot({ path: `${OUTPUT_DIR}/03-game-start.png` });

    // === Phase 4: Narrative progression - play deep into the game ===
    console.error('Phase 4: Progressing through narrative...');
    const uniqueTexts = new Set();
    let choicesEncounters = 0;
    let successfulChoiceClicks = 0;
    let maxIterations = 150;  // Play through much more of the game

    for (let i = 0; i < maxIterations; i++) {
      const state = await page.evaluate(() => {
        const newBox = document.querySelector('.dialog-box-new');
        const hasChoices = newBox?.classList.contains('has-choices') ?? false;
        const textEl = newBox?.querySelector('.text-command');
        const text = (textEl?.textContent || newBox?.textContent || '').trim();

        const choiceEls = newBox?.querySelectorAll('.dialog-choice') || [];
        const choices = Array.from(choiceEls).map(el => ({
          text: el.textContent.trim(),
          disabled: el.classList.contains('disabled'),
        }));

        return { hasChoices, text: text.substring(0, 200), choices };
      });

      if (state.text && state.text.length > 5) {
        uniqueTexts.add(state.text.substring(0, 100));
      }

      if (state.hasChoices && state.choices.length > 0) {
        choicesEncounters++;
        if (choicesEncounters === 1) {
          findings.ready_criteria.choices_appear = true;
          findings.positives.push(`First choice point reached at step ${i}: ${state.choices.length} options`);
          await page.screenshot({ path: `${OUTPUT_DIR}/04-first-choice.png` });
        }

        // Click the first non-"Back" enabled choice
        const clicked = await page.evaluate(() => {
          const choices = Array.from(document.querySelectorAll('.dialog-box-new .dialog-choice'));
          // Prefer choices that aren't "Back" - try to progress forward
          const forward = choices.find(c =>
            !c.classList.contains('disabled') &&
            !c.textContent.trim().toLowerCase().includes('back')
          ) || choices.find(c => !c.classList.contains('disabled'));
          if (forward) {
            forward.click();
            return forward.textContent.trim();
          }
          return null;
        });

        if (clicked) {
          successfulChoiceClicks++;
          if (successfulChoiceClicks === 1) {
            findings.ready_criteria.choices_work = true;
            findings.positives.push('Choices advance the game');
          }
          await page.waitForTimeout(1200);
        } else {
          console.error(`  Stuck: no clickable choice at step ${i}`);
          break;
        }
        continue;
      }

      // Click Continue (interact-button is a div)
      const advanced = await page.evaluate(() => {
        const btn = document.querySelector('.interact-button');
        if (btn) { btn.click(); return true; }
        return false;
      });

      if (!advanced) {
        console.error(`  End state at step ${i} - no interact-button and no choices`);
        break;
      }
      await page.waitForTimeout(350);
    }

    // Screenshot deep into game
    await page.screenshot({ path: `${OUTPUT_DIR}/05-deep-play.png` });

    if (uniqueTexts.size >= 3) {
      findings.ready_criteria.narrative_progresses = true;
      findings.positives.push(`Narrative shows ${uniqueTexts.size} unique dialog lines across ${choicesEncounters} choice points`);
      findings.dialog_history = [...uniqueTexts].slice(0, 20);
    } else if (uniqueTexts.size > 0) {
      findings.warnings.push(`Only ${uniqueTexts.size} unique dialog lines - game may be stuck`);
    } else {
      findings.critical.push('No narrative text displayed - game may not have started');
    }

    if (choicesEncounters === 0) {
      findings.warnings.push(`No player choices appeared in ${maxIterations} dialog advances`);
    } else {
      findings.positives.push(`Engaged ${choicesEncounters} choice points, ${successfulChoiceClicks} advanced game`);
    }

    // === Phase 5: Visuals check ===
    console.error('Phase 5: Checking visuals...');
    const visualsCheck = await page.evaluate(() => {
      const bg = document.querySelector('.viewport-layer-background');
      const bgImage = bg ? getComputedStyle(bg).backgroundImage : '';
      const hasRealBg = bgImage && bgImage !== 'none' && !bgImage.includes('gradient');

      // Check all images on the page
      const imgs = Array.from(document.querySelectorAll('img'));
      const loadedImgs = imgs.filter(img => img.complete && img.naturalWidth > 50).length;
      const brokenImgs = imgs.filter(img => !img.complete || img.naturalWidth === 0).length;

      return { bgImage, hasRealBg, totalImgs: imgs.length, loadedImgs, brokenImgs };
    });

    if (visualsCheck.hasRealBg) {
      findings.ready_criteria.visuals_present = true;
      findings.positives.push(`Background image loaded: ${visualsCheck.bgImage.substring(0, 60)}...`);
    } else {
      findings.critical.push('No background image loaded - only solid color/gradient');
    }

    if (visualsCheck.brokenImgs > 0) {
      findings.warnings.push(`${visualsCheck.brokenImgs} broken images detected (button icons or sprites)`);
    }

    // Character sprites - scan broadly for character imagery
    const spriteInfo = await page.evaluate(() => {
      const selectors = [
        '.character-sprite', '.sprite', '.portrait', '.character-portrait',
        '[class*="portrait"]', '[class*="sprite"]', '[class*="character"]',
        '.dialog-portrait', '.talk-portrait', '.dialog-box-new img',
      ];
      const found = new Set();
      for (const sel of selectors) {
        try {
          const els = document.querySelectorAll(sel);
          for (const el of els) {
            const style = getComputedStyle(el);
            const hasBg = style.backgroundImage && style.backgroundImage !== 'none' && !style.backgroundImage.includes('gradient');
            const isImg = el.tagName === 'IMG' && el.naturalWidth > 20;
            if (hasBg || isImg) found.add(sel);
          }
        } catch {}
      }
      // Also check any img with phoenix or k in src
      const pk = Array.from(document.querySelectorAll('img')).filter(i => /(phoenix|k)\.png/i.test(i.src || ''));
      return { selectors: [...found], phoenixOrKImgs: pk.length };
    });
    if (spriteInfo.selectors.length > 0 || spriteInfo.phoenixOrKImgs > 0) {
      findings.ready_criteria.character_sprites = true;
      findings.positives.push(`Character sprites visible via: ${spriteInfo.selectors.join(', ') || 'img[phoenix/k]'}`);
    } else {
      findings.improvements.push('No character sprites displayed - Narrat show commands missing');
    }

    // === Phase 6: v0 accessibility ===
    const v0Response = await fetch(`${URL.replace(/\/$/, '')}/v0-original-text-engine/index.html`)
      .then(r => r.ok).catch(() => false);
    if (v0Response) {
      findings.ready_criteria.v0_accessible = true;
      findings.positives.push('v0 original text adventure accessible at /v0-original-text-engine/');
    } else {
      findings.improvements.push('v0 text adventure not deployed alongside v1 (add to build output)');
    }

    // === Phase 7: Easter egg keywords ===
    const pageContent = await page.content();
    const eggs = ['mango', 'tea', 'chocolate', 'kite', 'love', 'fly'];
    const foundEggs = eggs.filter(e => pageContent.toLowerCase().includes(e));
    if (foundEggs.length >= 3) {
      findings.ready_criteria.easter_eggs_present = true;
      findings.positives.push(`Easter egg keywords present: ${foundEggs.join(', ')}`);
    } else {
      findings.improvements.push(`Only ${foundEggs.length}/6 easter egg keywords found - may need more scenes played`);
    }

    // === Phase 8: Console errors ===
    // Write all errors to a file for analysis
    const fs = await import('fs');
    fs.writeFileSync(`${OUTPUT_DIR}/all-console-errors.log`, consoleErrors.join('\n---\n'));
    if (consoleErrors.length === 0) {
      findings.ready_criteria.no_console_errors = true;
      findings.positives.push('No console errors detected');
    } else {
      findings.warnings.push(`${consoleErrors.length} console errors: ${consoleErrors.slice(0, 2).join(' | ')}`);
    }

  } catch (error) {
    findings.critical.push(`Test crashed: ${error.message}`);
  } finally {
    await browser.close();
  }

  return findings;
}

const results = await runPlaytest();
console.log(JSON.stringify(results, null, 2));
EOTEST

echo "Running automated playtest..."
RESULTS=$(PREVIEW_URL="$URL" node test.mjs 2>/tmp/playtest-stderr.log)
STDERR_OUTPUT=$(cat /tmp/playtest-stderr.log 2>/dev/null || echo "")

if [[ -n "$STDERR_OUTPUT" ]]; then
  echo "Test progress:"
  echo "$STDERR_OUTPUT" | head -20
  echo ""
fi

if ! echo "$RESULTS" | jq empty 2>/dev/null; then
  echo "ERROR: Test script failed to produce valid JSON:"
  echo "$RESULTS"
  exit 2
fi

# Generate report
cat > "$REPORT" << EOREPORT
# Playtest Report

**Tested at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**URL:** $URL

## Ready to Ship Criteria

EOREPORT

echo "$RESULTS" | jq -r '
  "### Checklist\n" +
  (.ready_criteria | to_entries | map(
    "- [" + (if .value then "x" else " " end) + "] " + (.key | gsub("_"; " "))
  ) | join("\n"))
' >> "$REPORT"

TOTAL_CRITERIA=$(echo "$RESULTS" | jq '.ready_criteria | length')
PASSED_CRITERIA=$(echo "$RESULTS" | jq '[.ready_criteria[] | select(. == true)] | length')
PCT=$((PASSED_CRITERIA * 100 / TOTAL_CRITERIA))

echo "" >> "$REPORT"
echo "**Score: $PASSED_CRITERIA/$TOTAL_CRITERIA ($PCT%)**" >> "$REPORT"
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

# Dialog sample
DIALOG_COUNT=$(echo "$RESULTS" | jq '.dialog_history | length')
if [[ "$DIALOG_COUNT" -gt 0 ]]; then
  echo "### 📖 Dialog Sample" >> "$REPORT"
  echo '```' >> "$REPORT"
  echo "$RESULTS" | jq -r '.dialog_history[] | "> " + .' >> "$REPORT"
  echo '```' >> "$REPORT"
  echo "" >> "$REPORT"
fi

# Status
READY=$(echo "$RESULTS" | jq -r '
  .ready_criteria |
  ((.splash_works and .menu_works and .narrative_progresses and .choices_appear and .choices_work and .visuals_present) | tostring)
')

echo "## Status" >> "$REPORT"
echo "" >> "$REPORT"
if [[ "$READY" == "true" && "$CRITICAL_COUNT" -eq 0 ]]; then
  echo "**🎉 READY TO SHIP** - Core quality criteria met!" >> "$REPORT"
else
  echo "**🚧 NOT READY** ($PASSED_CRITERIA/$TOTAL_CRITERIA criteria, $CRITICAL_COUNT critical issues)" >> "$REPORT"
fi

echo "" >> "$REPORT"
echo "## Screenshots" >> "$REPORT"
echo "" >> "$REPORT"
echo "Captured at: \`$OUTPUT_DIR\`" >> "$REPORT"
ls -1 "$OUTPUT_DIR"/*.png 2>/dev/null | while read -r img; do
  echo "- $(basename "$img")" >> "$REPORT"
done

echo ""
echo "=========================================="
cat "$REPORT"
echo "=========================================="
echo ""
echo "Report: $REPORT"
echo "Screenshots: $OUTPUT_DIR"

if [[ "$READY" == "true" && "$CRITICAL_COUNT" -eq 0 ]]; then
  echo ""
  echo "✅ Game is ready to ship!"
  exit 0
else
  echo ""
  echo "🚧 Game needs more work."
  exit 1
fi
