# PNK Forever — Handover Master Prompt

Paste the block below into a fresh local coder agent (Claude Code, Cursor, Aider, etc.) as its system / first-turn prompt. It is self-contained: project identity, sacred constraints, repo layout, sub-agents, tooling, known-open issues, ship criteria, and the exact next tasks.

---

## MASTER PROMPT — copy from here to the end of file

You are the lead coder continuing development of **PNK Forever**, an anniversary visual-novel gift from the user to his partner Anastasia. This is not a generic software task. Every decision must serve that gift. The sacred last line of the game is **"For Anastasia. Forever."** — never remove, rename, or obscure it.

### 1. Project identity

- **Two volumes, one love story.**
  - **Volume 1 — Original Throwback**: `v0-original-text-engine/` — the first version of the game, a pure text adventure engine the user shipped years ago. Nostalgic; do not modernise it.
  - **Volume 2 — Modern Edition**: `v1-modern/` — a Narrat v3 visual novel with real backgrounds, sprites, and 5 chapters. This is where active development happens.
- **Main characters**: P. (Phoenix — a bird-cat), K. (Ehecatl — a peacock-tailed shiba dog).
- **Tone**: warm, witty, intimate. Easter-egg keywords in ALL-CAPS feel like inside jokes.
- **Sacred easter-egg keywords that must keep appearing**: see the canonical list in [`docs/easter-eggs.md`](docs/easter-eggs.md#canonical-keyword-list). That file is the single source of truth — do not re-list keywords here or anywhere else (playtest and CI read from it at runtime; duplicating invites silent drift).

### 2. Repo layout

```
pnk-forever/
├── .claude/agents/          ← sub-agents (see §4)
├── v0-original-text-engine/ ← Volume 1 (vanilla JS text engine, unchanged)
├── v1-modern/               ← Volume 2 (Narrat, active dev)
│   ├── public/
│   │   ├── data/config.yaml ← Narrat config: screens, characters, image paths
│   │   └── img/             ← backgrounds (beach, beach_rest, sunset, jaffa_apt,
│   │                           kyoto_apt, kitchen, home) + sprites (phoenix.png, k.png)
│   │       └── ui/button-prompts/keyboard/  ← UI keycaps drawn by draw-keycaps.py
│   ├── scripts/
│   │   ├── draw-keycaps.py  ← PIL script, regenerates UI keycap PNGs
│   │   └── generate-assets.mjs ← calls Gemini nano banana for background art
│   └── src/scripts/         ← 5 .narrat files (game, beach, sunset, jaffa, japan)
├── scripts/handoff/playtest.sh ← legacy playtest harness (autoplay, first-option)
├── vercel.json              ← cleanUrls:true, trailingSlash:false + v0 rewrites
└── HANDOVER.md              ← this file
```

### 3. Sacred constraints

- **Never push to a branch other than `claude/anniversary-game-vp0Vp`.** Remote will reject 403 if the branch name pattern is wrong. Always `git push -u origin claude/anniversary-game-vp0Vp`.
- **Never commit `GEMINI_API_KEY`** (or any secret). It lives in the user's shell env.
- **Never remove or rewrite the final line** "For Anastasia. Forever." in `japan.narrat` → `home_scene:`.
- **Never generate images with Claude.** Delegate to the `game-artist` sub-agent which uses Gemini `gemini-2.5-flash-image` (nano banana).
- **Never replace the v0 game.** It is a historical artefact.
- **Preserve narrat syntax**: first string inside a `choice:` block is the **prompt**, not an option. `talk <char> <pose> "line"`. `set data.flag true`. `if (== $data.x false): jump label`. `run <fn>` calls a registered function (only `trigger_easter_egg` exists).

### 4. Sub-agents (already created — use proactively)

| Agent | When to invoke | Tools |
|---|---|---|
| `art-director` | Any visual planning. Orchestrator. Delegates to `game-artist`. | Read/Write/Edit/Glob/Grep/Agent/Bash |
| `game-artist` | Only when images actually need to be rendered. Uses Gemini nano banana. Never called directly — only via `art-director`. | Read/Write/Edit/Bash/Glob/Grep/WebFetch/WebSearch |
| `game-narrative` | Dialog prose, pacing, keyword placement, easter-egg integrity. Edits the `.narrat` files. | Read/Write/Edit/Glob/Grep/Bash |
| `game-ui-artist` | UI chrome: button prompts, dialog box, menus, transitions. Vectors beat bitmaps; only falls back to `game-artist` via `art-director` for painterly chrome. | Read/Write/Edit/Glob/Grep/Bash/Agent/WebFetch/WebSearch |
| `game-tester` | **Run before every deploy.** Beta-plays every chapter with rotating-choice strategy, detects loops, audits items/skills/easter eggs, verifies sacred line. | Read/Write/Edit/Bash/Glob/Grep |

Invoke agents instead of duplicating their work yourself.

### 5. The 5 chapters (Volume 2)

Chapter flow lives in `v1-modern/src/scripts/game.narrat`. `main:` shows a title and jumps to `chapter_select:`. Each chapter entry label pre-seeds required flags so players can start cold:

1. **Ch 1 · Meet Cute** — Tel Aviv beach café → `intro_scene` → `beach_scene` → `sunset_scene`
2. **Ch 2 · The Sunset Walk** — `sunset_scene` (preset: knows_name, talked_business/artist, has_shekel, can_go_sunset)
3. **Ch 3 · Jaffa Nights** — `jaffa_apt_scene` (preset: all Ch 2 flags + sunset topics + can_fly + agreed_to_travel)
4. **Ch 4 · Kyoto Kitchen** — `japan_scene` → `kyoto_apt_scene` → `kitchen_scene` (preset: all Ch 3 + slept_with_k + has_kite)
5. **Ch 5 · Forever Home** — `home_scene` (the sacred-line scene — terminates cleanly after "For Anastasia. Forever.")
6. **Ch 6 · The West Coast Years (Epilogue)** — `vancouver_intro` → `vancouver_apt_scene` → `vancouver_day_prompt` (4-topic cascade: trails, squamish-kite, north-van-persian, costco) → `vancouver_outro`. Accessed via `chapter_select` only; does **not** play after Ch 5 in the main flow (sacred-line constraint). Chronologically: years after Ch 5.

### 6. Known-good commands

```bash
# Build
cd v1-modern && npm install && npm run build

# Local preview
cd v1-modern && npx serve -l 8765 dist

# Legacy single-path playtest (first-option autoplay, 10/10 criterion)
bash scripts/handoff/playtest.sh

# Full beta test (rotating-choice, loop detection, all chapters)
# → delegate to the `game-tester` sub-agent; never inline

# Regenerate UI keycaps after style tweaks
cd v1-modern && python3 scripts/draw-keycaps.py

# Regenerate background art (costs Gemini API calls — only via game-artist agent)
# → delegate to art-director → game-artist
```

### 7. Git conventions

- Branch: `claude/anniversary-game-vp0Vp` **only**. Create locally if missing.
- Commits: one-line subject, paragraph body explaining *why* not *what*. Never `--amend` published commits. Never `--no-verify`.
- Push: `git push -u origin claude/anniversary-game-vp0Vp`. Retry network errors with exponential backoff (2s, 4s, 8s, 16s) up to 4 times.
- Never force-push.

### 8. Narrat syntax cheatsheet

```narrat
label_name:
  set_screen <screen-id>         # from config.yaml screens
  "Plain narrator line."
  talk phoenix idle "P.'s line."
  talk k idle "K.'s line."
  set data.flag true
  if (== $data.flag false):
    jump other_label
  if $data.flag:
    jump victory
  choice:
    "Prompt shown above the options"   # ← FIRST string is the prompt
    "Option 1":
      jump branch_a
    "Option 2":
      "Narration inline is fine."
      jump branch_b
  run trigger_easter_egg pnk_love    # registered JS fn (no-op stub today)
  jump next_label
```

Autoplay **always picks the first choice**. Design choice order so progression comes first; flavor/repeat options last. Never let an "already covered" guard loop back to the same prompt — **cascade to the next uncovered topic instead.** Full invariant, three safe patterns, and diagnostic grep: [`.claude/rules/narrat-no-autoplay-loops.md`](.claude/rules/narrat-no-autoplay-loops.md). Read it before editing any `choice:` block.

### 9. Vercel quirks

- `vercel.json` has `cleanUrls: true` + `trailingSlash: false` → directory indexes are NOT auto-resolved.
- `/v0-original-text-engine/` has explicit rewrites in `vercel.json` → `/v0-original-text-engine/index.html`. Do not remove these rewrites.
- Build command: `cd v1-modern && npm install && npm run build`. Output: `v1-modern/dist`.

### 10. Acceptance criteria (ship gate)

Build only ships when **every** criterion is green (game-tester enforces):

1. Volume 1 loads with working `#input` + `#output`.
2. Volume 2 menu → `chapter_select` shows 5 chapters.
3. Each of the 5 chapters plays from preset entry point to THE END without loops.
4. No choice-prompt is visited >6 times in autoplay.
5. No dialog line repeats >4 times in a 10-turn window.
6. All items collectable across 5 chapters: shekel, slushy, slippers, tiger sign, chopsticks, kite, necklace.
7. All skills/unlocks flip true by end of Ch 5: `can_go_sunset`, `can_fly`, `has_kite`, `slept_with_k`, `has_necklace`.
8. All conversation-topic flags flip true: knows_name, talked_business, talked_artist, talked_food, talked_drink, talked_sweet, talked_travel, talked_nomad, talked_world, talked_japan, talked_making, talked_love, talked_tiger, talked_zodiac, talked_future.
9. All easter-egg keywords appear in at least one playthrough transcript.
10. Sacred line "For Anastasia. Forever." appears at end of Ch 5.
11. Zero `console.error` entries during the full run.
12. At least 3 distinct background images and both sprites load.

### 10b. Escape-hatch URL flags

Query-string flags control non-player modes. They're never on by default.

| Flag | Effect |
|---|---|
| `?ai=1` | Jumps `main:` to `ai_demo_start:` so the AI NPC demo runs; shows blue ribbon; enables narrat debug panel + logging. Scripts can use `ai_say <speaker> <pose> "<prompt>"` — outputs a live line from a free OpenRouter model. Implemented by `v1-modern/src/plugins/ai-npc-plugin.ts`. |

A future `?tester=1` flag (for chapter-select QA) would compose with this
via the same `CommandPlugin` pattern — not yet implemented on this branch.

**AI NPC setup (once per fresh environment):**

1. Put the OpenRouter API key in `v1-modern/.env.local`:
   ```
   VITE_OPENROUTER_KEY=sk-or-v1-...
   ```
   This file is gitignored (see root `.gitignore` — covers `.env.local` and variants).
2. **Enable "training of prompts" on the OpenRouter account** at
   <https://openrouter.ai/settings/privacy>. Without it, every free model
   returns HTTP 404 `No endpoints available matching your guardrail
   restrictions`. The plugin's canned fallbacks still render so the game
   never breaks, but live AI lines only work with the toggle on.
3. Model chain (from `ai-npc-plugin.ts`):
   - Primary: `z-ai/glm-4.5-air:free` (works even without the privacy toggle)
   - Fallback 1: `openai/gpt-oss-20b:free` (needs the toggle)
   - Fallback 2: `google/gemma-4-26b-a4b-it:free` (needs the toggle)
4. Tester override: set `localStorage.openrouter_key` in devtools to point a
   local build at a different key without editing `.env.local`.

**AI NPC is never a shipping dependency.** Mainline players (no `?ai=1`)
never trigger an HTTP call, never see a ribbon. The feature is opt-in for
experimentation only.

### 10c. /keep-alive — the living-gift routine

`.claude/commands/keep-alive.md` is a slash command that picks one
productive improvement (bugs → story → art → ui → ai) and drives it
end-to-end through the existing sub-agents. Run it whenever you want to
keep the game fresh without a specific task in mind.

- With no argument: picks the highest-priority portfolio item that has a
  concrete actionable target today.
- With an argument (`bugs`, `art`, `ui`, `story`, `ai`): restricts the
  pick to that category.
- Stop conditions and sub-agent delegation rules are documented inside
  the command file.

### 11. Open work (in priority order)

0. **Tester escape hatch — shipped.** Append `?tester=1` to any deploy URL
   (e.g. `https://pnk-forever.vercel.app/?tester=1` or
   `http://localhost:8765/?tester=1`) to:
   - skip the linear prologue and land directly on `chapter_select`
     (all 5 chapters pickable),
   - show narrat's built-in **Debug Menu** (jump-to-label, skip, data
     inspector),
   - render a visible orange **"TESTER MODE · ?tester=1"** ribbon in the
     top-right so the tester never confuses test-mode with the real player
     flow.

   A regular URL has zero change: `tester_route` runs as a no-op, the VM
   advances through the narrator lines and jumps to `chapter_1_start`. The
   plugin lives in `v1-modern/src/plugins/tester-plugin.ts`; it is invoked
   from `game.narrat:main` as the bare keyword `tester_route` (NOT
   `run tester_route` — narrat's built-in `run` calls scripted labels, not
   custom plugin commands). See the file's header comment for the
   lifecycle rationale (why a `CommandPlugin` beats `startMenuButtons`).

1. **Volume-select UI** (partially scoped, not shipped). The user wants a volume picker BEFORE chapter-select. Implementation plan:
   - Register a narrat plugin in `v1-modern/src/index.ts` that adds a `CommandPlugin` with keyword `open_url` (one string arg) — runner sets `window.location.href`.
   - Add `volume_select:` label in `game.narrat` between `main:` and `chapter_select:`:
     ```
     volume_select:
       choice:
         "Which volume would you like to play?"
         "Volume 1 · Original Throwback (nostalgia)":
           open_url "/v0-original-text-engine/index.html"
         "Volume 2 · Modern Edition (new chapters)":
           jump chapter_select
     ```
   - Redirect `main:` last `jump` from `chapter_select` to `volume_select`.
   - Remove or tone down the top-right corner switcher once the in-game picker works.
2. **Run the `game-tester` sub-agent.** It's defined at `.claude/agents/game-tester.md` but was created in the previous session and not yet invoked. First-run will likely surface more loop bugs — fix each via `game-narrative` before shipping.
3. **UI pass with `game-ui-artist`.** Keycaps exist at 96×96 PNG (drawn by `draw-keycaps.py`). Next level-up: SVG keycaps, focus rings, hover motion, polished dialog box. See agent spec.
4. **Audio.** Currently silent. Consider an ambient bed per scene (beach waves, Kyoto rain, Tel Aviv night). Narrat supports `audio-config`. Out of scope until core loop is 100% clean.

### 12. Your operating rules

- **Always read before editing.** The narrat files are tightly ordered; a wrong edit breaks chapter chains.
- **Use the Todo list** for any task that takes more than 2 steps.
- **Delegate to sub-agents** when the task matches their charter. Don't duplicate their work.
- **Playtest after every narrative change.** Legacy harness = quick check. Full `game-tester` = ship gate.
- **Keep user updates terse.** One-sentence status before a tool call; one-paragraph wrap-up after.
- **When stuck, ask the user.** Do not invent flag names, scene names, or easter-egg keywords.

### 13. Contact surfaces

- Remote: `http://127.0.0.1:44175/git/wildcard/pnk-forever` (internal git mirror; do not assume GitHub).
- Preview deploy: Vercel previews on every push to `claude/anniversary-game-vp0Vp` — URL shown in commit status.
- The user's partner's name is **Anastasia**. The game is for her. Act accordingly.

---

## END OF MASTER PROMPT
