# Handoff Automation Scripts

Helper scripts for local agent workflows. Each is self-contained and documented inline.

## Quality Assurance & Testing

### `playtest.sh`
Automated browser-based quality check using Playwright.

**What it does:**
- Launches headless Chrome via Playwright
- Loads the game and captures screenshots at key moments
- Checks 6 readiness criteria (visuals, playability, accessibility, narrative, choices, easter eggs)
- Generates markdown report with issues categorized as: critical, warnings, improvements, positives
- Exit 0 if game passes, exit 1 if needs work

**Requirements:**
- Node.js and npx
- Playwright (auto-installed on first run)
- `jq` for report formatting

**Usage:**
```bash
# Test current preview URL
./playtest.sh

# Test custom URL
PREVIEW_URL=https://example.com ./playtest.sh
```

**Output:**
- Markdown report to stdout
- Screenshots in temp directory (path printed in output)
- Exit code indicates pass/fail

---

### `auto-improve.sh`
Intelligent improvement loop that applies automated fixes based on playtest results.

**What it does:**
- Runs playtest to identify issues
- Applies automated fixes:
  - Missing visuals → runs `generate-assets.mjs` with GEMINI_API_KEY
  - Missing character sprites → adds `show phoenix`/`show k` commands
  - Other common issues → applies pattern-based patches
- Commits changes with descriptive message
- Pushes to current branch
- Waits for Vercel deployment (45s)
- Re-tests
- Repeats until game passes or max cycles reached (default: 5)

**Requirements:**
- All playtest.sh requirements
- `jq`, `gh` CLI
- GEMINI_API_KEY env var (for asset generation)
- Git branch starting with `claude/` (for push to work)

**Usage:**
```bash
# Run with Gemini API key
GEMINI_API_KEY=xxx ./auto-improve.sh

# Custom max cycles
MAX_CYCLES=3 GEMINI_API_KEY=xxx ./auto-improve.sh
```

**Exit codes:**
- 0 = Game passed quality check
- 1 = Reached max cycles without passing (manual intervention needed)

---

### `continuous-improve.sh`
Simple loop wrapper around playtest.sh for manual improvement workflows.

**What it does:**
- Runs playtest.sh repeatedly
- Pauses between runs (default: 30s)
- Human manually fixes issues between iterations
- Stops when playtest passes or max iterations reached

**Usage:**
```bash
# Run with defaults (10 iterations, 30s sleep)
./continuous-improve.sh

# Custom settings
MAX_ITERATIONS=5 SLEEP_BETWEEN=60 ./continuous-improve.sh
```

---

### `smoke-preview.sh`
Quick health check for deployed preview.

**What it does:**
- Curls root URL, checks for HTTP 200
- Fetches `/data/config.yaml`, verifies it contains `gameTitle: P&K Forever`
- Checks scene image size (warns if placeholder)
- Exit 0 if healthy, exit 1 if broken

**Usage:**
```bash
# Test default preview URL
./smoke-preview.sh

# Test custom URL
PREVIEW_URL=https://example.com ./smoke-preview.sh
```

**Good for:** Cron jobs, CI post-deploy checks, quick sanity tests

---

## Pull Request Automation

### `check-prs.sh`
Lists open PRs authored by you with their CI status.

**Usage:**
```bash
./check-prs.sh
```

---

### `automerge.sh`
Auto-merges PRs that have the `auto-merge` label AND are mergeable AND all checks are green.

**Usage:**
```bash
# Run manually
./automerge.sh

# In cron (hourly)
0 * * * * cd /path/to/repo && ./scripts/handoff/automerge.sh
```

**Safety:** Only merges if ALL conditions met. No-op otherwise.

---

### `self-review.sh <PR#>`
Posts a code review comment on the given PR with automated red flags.

**Checks for:**
- Files over 500 lines
- `console.log` in source
- `any` type usage
- `--no-verify` in code

**Usage:**
```bash
./self-review.sh 42
```

---

## Asset Pipeline

### `maybe-regen-assets.sh`
Triggers asset generation workflow if generator script is newer than images.

**What it does:**
- Compares git log timestamps: `generate-assets.mjs` vs `public/img/`
- If generator is newer, triggers GitHub Actions workflow `generate-assets.yml`
- No-op if images are up to date

**Usage:**
```bash
./maybe-regen-assets.sh
```

**Good for:** Daily cron job to auto-regenerate assets when prompts change

---

## Issue Management

### `triage.sh`
Bumps stale issues (no activity in 7+ days).

**What it does:**
- Lists all open issues
- For each issue updated >7 days ago, posts comment: "Still open after a week — bumping. Next step?"

**Usage:**
```bash
./triage.sh
```

**Good for:** Weekly Monday morning run to surface forgotten issues

---

### `create-issues.sh`
Creates GitHub issues from `docs/issues/*.md` files.

**What it does:**
- Reads each file in `docs/issues/`
- Extracts title from first `# ` line
- Extracts labels from `Labels:` line
- Creates issue via `gh issue create`

**Usage:**
```bash
./create-issues.sh
```

---

## Scheduling

Recommended cron schedule (adjust paths):

```cron
# Every 15 min during active dev
*/15 * * * * cd /path/to/pnk-forever && ./scripts/handoff/check-prs.sh

# Hourly auto-merge
0 * * * * cd /path/to/pnk-forever && ./scripts/handoff/automerge.sh

# Daily 9am - regenerate assets if needed
0 9 * * * cd /path/to/pnk-forever && ./scripts/handoff/maybe-regen-assets.sh

# Daily 10am - smoke test
0 10 * * * cd /path/to/pnk-forever && ./scripts/handoff/smoke-preview.sh

# Daily 2pm - automated playtest
0 14 * * * cd /path/to/pnk-forever && ./scripts/handoff/playtest.sh

# Weekly Monday 9am - triage
0 9 * * 1 cd /path/to/pnk-forever && ./scripts/handoff/triage.sh
```

For `auto-improve.sh`, run manually or after deployments:

```bash
# After merging a PR
gh pr merge 42 --squash && sleep 60 && GEMINI_API_KEY=xxx ./scripts/handoff/auto-improve.sh
```

---

## Prerequisites

All scripts:
- bash
- git
- GitHub CLI (`gh`) authenticated

Additional per script (see individual docs above):
- Node.js + npx (playtest, auto-improve)
- Playwright (auto-installed by playtest)
- jq (playtest report formatting)
- curl (smoke-preview)

---

## Exit Codes

Convention used by all scripts:
- **0** = success / checks passed / no issues found
- **1** = failure / checks failed / issues found / manual intervention needed
- **2+** = usage error (missing arguments, etc.)

Use exit codes in CI/cron to trigger alerts or block deployments.
