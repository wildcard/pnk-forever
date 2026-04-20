# P&K Forever — Local Agent Handoff

> Handoff for a local agent with `vercel` CLI, `gh` CLI, and scheduled-task
> capability to take this project from "loads in a browser" to "polished,
> released game." Everything needed to resume is here.

## 0. Quick Orient (read first)

- **Repo root**: this repository. Active branch: `claude/anniversary-game-vp0Vp`.
- **Stack**: Narrat 3.17 (Vue 3) → Vite → static site on Vercel.
- **Source of truth for narrative**: `v0-original-text-engine/game-disks/p-n-k-forever.js`.
  Do not invent new story; port from v0.
- **Modern game code**: `v1-modern/` (Vite + Narrat + scripts in `src/scripts/*.narrat`).
- **Deployed preview**: `https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app`
- **Preferred model**: continue on `claude-opus-4-7` (or equivalent) for code, `claude-haiku-4-5` for small tasks.

### What works right now
- Narrat initializes, dialogue box renders, dark romantic theme applied
- All 5 script files parse (no more `(and ...)` / `==` infix errors)
- Vercel preview auto-builds from the branch
- Asset pipeline is wired (script + GitHub Action) but **never run end-to-end**
- Placeholder images are tiny 67-byte PNGs — real Imagen output hasn't been committed

### What does NOT work (known gaps)
1. `GEMINI_API_KEY` is not in GitHub Actions secrets or Vercel env
2. Real images haven't been generated
3. `trigger_easter_egg` is a no-op — the 6 IFTTT webhooks from v0 don't fire
4. Character sprites never appear (no `show` calls in scripts)
5. No automated tests, no CI, no lint
6. `docs/v1-architecture.md` exists but doesn't reflect current state
7. Bundle size warning (1.8MB) — no code splitting
8. No favicon (`vite.svg` 404 in console), mobile layout untested

---

## 1. Definition of Done

The project is "done" when **every** box is checked:

- [ ] Production deployment on Vercel's `pnk-forever.vercel.app` (or custom domain)
- [ ] Full playthrough possible: Beach Rest → Beach → Sunset (all 8 countries) → Jaffa → Japan → Kitchen → Home, no parser errors, no 404s
- [ ] All 9 scene backgrounds are real Imagen artwork (not placeholders)
- [ ] Phoenix + K sprites appear on screen during `talk` commands
- [ ] All 6 easter egg webhooks fire to IFTTT on trigger (mango, tea, chocolate, kite, love, fly)
- [ ] Save/load works across sessions (localStorage persistence verified)
- [ ] Mobile playable (verified on a ~375px viewport)
- [ ] `GEMINI_API_KEY` + `IFTTT_WEBHOOK_KEY` are in GitHub + Vercel, never in source
- [ ] CI runs on every PR: typecheck + build + (eventually) Playwright smoke test
- [ ] README at repo root explains how to play, how to develop, how the pipeline works

Anything not on this list is out of scope. Resist expanding it.

---

## 2. Current State — What To Check First

Run these on arrival to confirm the world hasn't drifted since this doc was written:

```bash
# branch + latest commit
git fetch origin && git log --oneline origin/claude/anniversary-game-vp0Vp -10

# build passes locally
cd v1-modern && npm ci && npm run build

# deployed preview still loads and game is visible
curl -sI https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app/ | head -1
curl -s  https://pnk-forever-git-claude-anniversary-game-vp0vp-kadosh-dev.vercel.app/data/config.yaml | head -5

# secrets presence (don't print values)
gh secret list --repo $(gh repo view --json nameWithOwner -q .nameWithOwner) | grep -i gemini || echo "NEED: add GEMINI_API_KEY"
vercel env ls preview 2>/dev/null | grep -i gemini || echo "NEED: add GEMINI_API_KEY to Vercel"
```

If any of those fail, treat the corresponding issue below as P0.

---

## 3. Roadmap → GitHub Issues

Each bullet below becomes **one GitHub issue and one PR**. Don't batch. The agent should create all issues first (so dependencies are visible), then work them in priority order.

Use these commands to create issues verbatim — the titles, labels, and bodies are already designed.

### P0 — Cannot ship without these

#### I-1: Add `GEMINI_API_KEY` to GitHub Actions secrets and Vercel env
```bash
gh issue create \
  --title "Add GEMINI_API_KEY to GitHub + Vercel secrets" \
  --label "p0,infra" \
  --body "$(cat docs/issues/i-01-gemini-secret.md)"
```
**Acceptance**: `gh secret list` shows GEMINI_API_KEY; `vercel env ls` shows it in production + preview + development. `/generate-assets` workflow runs successfully on manual trigger.
**Effort**: 10 min. **No PR needed** — close with commit referencing the secret names.

#### I-2: Generate real scene images via Imagen
**Prereq**: I-1 done.
**Acceptance**: `v1-modern/public/img/*.png` are all >100KB (real images), preview deployment shows them. Branch is `claude/gen-assets-<date>`, PR merges into `claude/anniversary-game-vp0Vp`.
**Commands**:
```bash
gh workflow run generate-assets.yml --ref claude/anniversary-game-vp0Vp
gh run watch                 # wait for completion
git pull                     # pull the auto-commit
```
**Effort**: 15 min (mostly API wait time).

#### I-3: Wire IFTTT easter egg webhooks
Currently `trigger_easter_egg` in `sunset.narrat` is just `return`. v0 fires 6 IFTTT webhooks (mango, tea, chocolate, kite, love, fly). Use Narrat plugin API to register a `trigger_easter_egg` command that fetches a webhook URL.
**Approach**:
1. Add `IFTTT_WEBHOOK_KEY` to Vercel + GitHub (same pattern as I-1).
2. Expose it at build time via Vite's `define`: `__IFTTT_KEY__: JSON.stringify(process.env.IFTTT_WEBHOOK_KEY)`.
3. Register a custom Narrat command in `src/index.ts`:
   ```ts
   import { registerCommand } from 'narrat';
   registerCommand('trigger_easter_egg', {
     argTypes: [{ name: 'event', type: 'string' }],
     runner: async (ctx, event) => {
       await fetch(`https://maker.ifttt.com/trigger/${event}/with/key/${__IFTTT_KEY__}`);
     },
   });
   ```
4. Remove the `trigger_easter_egg event_name: return` stub from `sunset.narrat`.
**Acceptance**: Playing through and hitting "MANGO!" fires an IFTTT webhook (verify in IFTTT activity log).
**Effort**: 1 hr.

#### I-4: Show character sprites during dialogue
`talk phoenix idle "..."` is in scripts but sprites never appear. `config.yaml` defines `sprites.idle` for each character but no `show`/`hide` commands exist in the scripts.
**Approach**: Add `show phoenix idle left` / `show k idle right` / `hide phoenix` at scene transitions. Do NOT rewrite every `talk` line — Narrat shows the portrait automatically when `talk <char>` is called _if_ the sprite was previously `show`n.
**Acceptance**: Phoenix portrait visible during her lines at the beach; K's portrait visible during his.
**Effort**: 1–2 hr.

### P1 — Needed for "production"

#### I-5: CI workflow — typecheck + build on every PR
Create `.github/workflows/ci.yml` that runs on `pull_request` against any branch: `npm ci`, `npm run build`, `tsc --noEmit`. Cache `node_modules` by `package-lock.json` hash.
**Acceptance**: PR to any branch shows green CI checks within 3 min.
**Effort**: 45 min.

#### I-6: Playwright smoke test — game reaches Jaffa
Install `@playwright/test`. Write one test: load the page, click "Press to start", click through the first 5 choices, assert the screen class eventually becomes `background-jaffa_apt`.
**Acceptance**: `npm run test` passes locally and in CI (headless).
**Effort**: 2 hr.

#### I-7: Mobile layout pass
Test at 375×667 and 414×896. Fix: dialogue box cramped, choice buttons overlap, portrait gets clipped. Use Narrat's `mobileDialogHeightPercentage` and media queries in `game.css`.
**Acceptance**: Manual walkthrough on Chrome mobile emulator shows no overlap, buttons tappable.
**Effort**: 2 hr.

#### I-8: Favicon + OG metadata
`vite.svg` 404 in console. Add a custom favicon (e.g. a P&K emoji SVG) and OpenGraph tags (title, description, preview image) so the link previews nicely when shared.
**Effort**: 30 min.

#### I-9: README at repo root
Explain what the game is, how to play, how to develop, how the image pipeline works, how to add scenes. Link to `v0-original-text-engine/README.md` for history.
**Effort**: 1 hr.

### P2 — Nice to have

- **I-10**: Code split — dynamic `import('narrat')` to reduce initial JS from 1.8MB
- **I-11**: Rolling Release when merging to main (Vercel Rolling Releases)
- **I-12**: `vercel.ts` config (replace `vercel.json` with typed config)
- **I-13**: Music/SFX — Narrat supports `audio.files`; at minimum beach ambience + sunset track
- **I-14**: Animated scene transitions between `set_screen` calls
- **I-15**: Localization — Hebrew translation of the Tel Aviv scenes

---

## 4. Issue creation — one command

Create every P0/P1 issue in one go:

```bash
./scripts/handoff/create-issues.sh       # see §7
```

The script reads `docs/issues/*.md` files (the full bodies for each issue) and calls `gh issue create` for each.

---

## 5. PR Strategy — one issue, one branch, one PR

For each issue `I-N`:

```bash
# branch name mirrors issue number
git switch -c "claude/i-${N}-<short-slug>" origin/claude/anniversary-game-vp0Vp

# do the work, commit
git commit -am "feat(i-${N}): <short summary>"

# push and open PR linked to the issue
git push -u origin HEAD
gh pr create \
  --base claude/anniversary-game-vp0Vp \
  --title "I-${N}: <short summary>" \
  --body "Closes #${ISSUE_NUMBER}

## What
<changes>

## How to test
<steps>

## Verification
- [ ] CI green
- [ ] Vercel preview URL loads
- [ ] <issue-specific checks>"
```

**Rules**:
- Never push directly to `main` or to `claude/anniversary-game-vp0Vp`. Always via PR.
- Keep PRs small — one acceptance criterion per PR. If you find yourself touching >5 files for a P0/P1 issue (other than I-6 Playwright), split it.
- Do not add `[skip ci]` unless the commit only touches docs.

---

## 6. Scheduled Tasks

Use your scheduler to run these on the cadence shown. Each entry is a shell command suitable for cron/launchd/etc.

| Cadence | Task | Command |
|---|---|---|
| Every 15 min during active dev | Check PR CI status | `./scripts/handoff/check-prs.sh` |
| Hourly | Auto-merge green PRs that have `auto-merge` label | `./scripts/handoff/automerge.sh` |
| Daily 09:00 | Regenerate assets if any prompts changed | `./scripts/handoff/maybe-regen-assets.sh` |
| Daily 10:00 | Smoke test the deployed preview | `./scripts/handoff/smoke-preview.sh` |
| Weekly Mon 09:00 | Review open issues, bump stale ones | `./scripts/handoff/triage.sh` |
| On every new commit to the dev branch | Self-review the diff, comment on PR | `./scripts/handoff/self-review.sh <PR#>` |

Implementations live in `scripts/handoff/`. They're intentionally small — read them before relying on them.

### Review schedule (the human in the loop)

- **Daily 17:00** — post a summary comment on the active dev branch with: PRs merged today, PRs blocked, current deployment URL.
- **Weekly Fri 16:00** — create a tracking issue `Week of <date>: review` listing what shipped, what slipped, top 3 for next week.

---

## 7. Helper scripts to create

Create these under `scripts/handoff/` as part of the first PR (issue I-0 below).

- `create-issues.sh` — iterate `docs/issues/*.md`, call `gh issue create` for each
- `check-prs.sh` — `gh pr list --author @me --json number,title,mergeable,statusCheckRollup`
- `automerge.sh` — for each PR with label `auto-merge` and green checks, `gh pr merge --squash --delete-branch`
- `maybe-regen-assets.sh` — if `git log -1 v1-modern/scripts/generate-assets.mjs` is newer than any `public/img/*.png`, run the workflow
- `smoke-preview.sh` — `curl` the preview, fetch `/data/config.yaml`, assert HTTP 200 and at least one expected scene key exists
- `triage.sh` — `gh issue list --state open --json number,title,updatedAt,labels`, bump anything untouched >7 days with a comment
- `self-review.sh <PR>` — diff the PR, post a review comment listing files changed + any red flags (files >500 lines, any `any`, any `console.log` in src/)

### I-0: Bootstrap handoff tooling
Before any other issue, create a PR that adds `scripts/handoff/` and `docs/issues/*.md`. This is the one manual setup step.

---

## 8. Working Agreement for the Local Agent

1. **Always create a branch and PR**. Never commit to a shared branch directly.
2. **Never print the value of any secret** — only names, environments, metadata.
3. **Verify, don't trust**. After `gh issue create`, list issues. After `vercel env add`, list env vars. After a deploy, curl the URL.
4. **If a tool fails, diagnose — don't bypass**. No `--no-verify`, no force pushes, no `|| true` to mask errors.
5. **Stop if scope expands beyond §1 (Definition of Done)**. Open a new issue instead of inflating the current one.
6. **If uncertain about narrative content, read v0 source** (`v0-original-text-engine/game-disks/p-n-k-forever.js`). Do not invent new story.
7. **Commits are in present tense, scoped**: `fix(scripts): ...`, `feat(i-4): ...`, `chore(deps): ...`.
8. **The branch `claude/anniversary-game-vp0Vp` is the integration branch** for this feature. Merge child PRs into it. Only merge it to `main` when §1 is fully green.

---

## 9. Emergency Rollback

If a deploy breaks production:

```bash
# list recent production deployments
vercel ls pnk-forever --prod

# promote the previous one
vercel promote <previous-deployment-url>
```

Do NOT `git revert` on main unless the rollback promotion also isn't possible.

---

## 10. Open Questions (for the human, not the agent)

- Custom domain? If yes, which? (Default: `pnk-forever.vercel.app`.)
- IFTTT webhook key — where does this live currently? (Was in the v0 Makefile/env?)
- Release date? Is there a fixed anniversary the game needs to be live for?
- Analytics? (Vercel Analytics is one click; third-party would need a consent banner.)

Resolve these in the tracking issue before starting P2 work.

---

## Appendix A — Key paths

| Path | What |
|---|---|
| `v1-modern/src/index.ts` | Entry point, `startApp` call |
| `v1-modern/src/game.css` | Custom theme + gradient fallbacks |
| `v1-modern/src/scripts/*.narrat` | Game scripts (5 files) |
| `v1-modern/public/data/config.yaml` | Narrat config (loaded at runtime) |
| `v1-modern/public/img/` | Scene + character images |
| `v1-modern/scripts/generate-assets.mjs` | Imagen 3 asset generator |
| `.github/workflows/generate-assets.yml` | Manual workflow that runs the above |
| `vercel.json` | Monorepo build config (root) |
| `v1-modern/vercel.json` | Sub-project build config |
| `v0-original-text-engine/game-disks/p-n-k-forever.js` | Source of truth for narrative |

## Appendix B — Narrat quick reference (learned the hard way)

- Operators are **prefix in parens**: `(&& a b)`, `(== $x 3)`, `(! $x)`. Not `and`, not infix.
- Conditional choices: `"text" if (condition):`.
- Config lives in `public/data/config.yaml`. Top-level key `common:` wraps `gameTitle`, `saveFileName`, `layout`. `layout` must include `dialogBottomPadding` and `verticalLayoutThreshold`.
- `startApp` takes **one** options object, including `container: '#app'` (no default).
- `.narrat` files are transformed by `vite-plugin-narrat` — import them without `?raw`.
- Narrat's CSS lives at `narrat/dist/style.css` — must be imported explicitly.
