# Session Gap Report — User-reported issues to file as GH issues

Extracted from the conversation between the user and the agent. Each entry is ready to paste into `gh issue create --title "..." --body-file "..." --label "..."`.

Status key: **✅ FIXED** (shipped this session), **🟡 PARTIAL** (in progress / scoped but not shipped), **🔴 OPEN** (not started).

---

## #1 — Infinite playtest loop on first click **✅ FIXED**

**Title**: `fix(qa): autoplay playtest gets stuck in infinite loop on first choice`

**Labels**: `bug`, `qa`, `autoplay`

**Reported quote**:
> "avoid infinite loop"

**What was broken**: The autoplay playtest harness picked the first choice forever — a flavor option that jumped back to the same menu (e.g. "Look at the beach" → `beach_choice` → "Look at the beach" → …). Tests ran to timeout instead of advancing.

**Root cause**: Choice ordering placed flavor/repeat options before progression options; autoplay always clicks the first option.

**Fix delivered**:
- Reordered every `choice:` block so progression options come first.
- Added `MAX_VISITS_PER_CHOICE_SET = 8` cap in `scripts/handoff/playtest.sh` as a safety net.
- Acceptance criteria: playtest reaches a terminal scene within 200 turns.

**Commit**: `118d76b Fix loop-on-first-click, replace UI keycap placeholders`

---

## #2 — Art pipeline must use Gemini nano banana, not Claude/PIL **✅ FIXED**

**Title**: `feat(art): replace placeholder/PIL art with real Gemini nano banana generations`

**Labels**: `art`, `agent`, `enhancement`

**Reported quote**:
> "don't use Claude for generating visuals. use a game artist for that (another sub agent) - use the gemini API key I gave you (search a nano banana skill - use the latest model)"

**What was broken**: Visual assets were either missing or generated via PIL/Claude placeholders. Game looked unfinished.

**Fix delivered**:
- Created 3 sub-agents: `art-director` (orchestrator), `game-artist` (Gemini-only), `game-narrative` (prose).
- `v1-modern/scripts/generate-assets.mjs` now calls `gemini-2.5-flash-image` with `responseModalities: ["IMAGE"]` and aspect-ratio control (16:9 for backgrounds, 3:4 for sprites).
- All 9 backgrounds + 2 sprites regenerated (1.3-1.8 MB each).

**Commits**: `3ad0a99`, `fa708b8 Replace placeholder art with Gemini 2.5 Flash Image generations`

---

## #3 — Billing enabled, upgrade to better image model **✅ FIXED**

**Title**: `feat(art): upgrade to gemini-2.5-flash-image now billing is active`

**Labels**: `art`, `enhancement`

**Reported quote**:
> "I've set billing, use a better model and generate the graphics"

**What was broken**: Free-tier quota was hitting limits.

**Fix delivered**:
- Switched from Imagen preview to `gemini-2.5-flash-image` (nano banana).
- All 11 assets regenerated successfully after billing enablement.

**Commit**: `fa708b8`

---

## #4 — Green 1×1 pixel UI placeholders **✅ FIXED**

**Title**: `fix(ui): replace 1×1 green placeholder keycap PNGs with real button prompts`

**Labels**: `ui`, `bug`, `polish`

**Reported quote**:
> "see that our game UI is a green placeholder... that's not right"

**What was broken**: Every keyboard button-prompt icon (`public/img/ui/button-prompts/keyboard/*.png`) was a 1×1 pixel green square, rendered by narrat at 24-32 px as a green block.

**Fix delivered**:
- Created `game-ui-artist` sub-agent with vector-first rule.
- Wrote `v1-modern/scripts/draw-keycaps.py` (PIL) producing 96×96 PNG keycaps with dark-slate cap + coral-orange border + white label: `a-z`, `enter`, `escape`, `space`, `plus`, `minus`, arrow cluster, individual arrows.

**Commit**: `118d76b`

**Follow-up**: Upgrade bitmap keycaps → SVG for crispness (see #13 below).

---

## #5 — Stuck autoplay after CONTINUE to sunset **✅ FIXED**

**Title**: `fix(narrative): sunset-transition loop when CONTINUE jumps back to beach_choice`

**Labels**: `bug`, `autoplay`, `narrative`

**Reported quote** (with screenshot):
> "great work on graphic but we're stuck again"

**What was broken**: `talk_to_k_continue` accepting "CONTINUE to the sunset" set `can_go_sunset=true` and jumped back to `beach_choice`. Autoplay then picked "Talk to the dog" (option 1) and re-ran the whole conversation tree. Loop.

**Fix delivered**:
- Changed `talk_to_k_continue` to `jump sunset_scene` directly instead of returning to `beach_choice`.

**Commit**: `8e5d626 Add chapter select + fix beach loop after CONTINUE`

---

## #6 — Add chapter selection to main menu **✅ FIXED**

**Title**: `feat(menu): let players start directly from any of the 5 chapters`

**Labels**: `feature`, `menu`, `ux`

**Reported quote**:
> "we need to have chapters in the main menu, the v0 original game is a throwback nostalgia (was already played), but the v1 modern including new parts of the game that can be played directly (imagine it like a Game 2 volume, you don't have to force the player to play the Game 1 again to start from Game 2)"

**Fix delivered**:
- `main:` now displays the title and jumps to `chapter_select:`.
- `chapter_select:` offers: Ch 1 Meet Cute → Ch 2 Sunset Walk → Ch 3 Jaffa Nights → Ch 4 Kyoto Kitchen → Ch 5 Forever Home.
- Each `chapter_N_start` preseeds all required gate flags (knows_name, talked_business, can_go_sunset, can_fly, slept_with_k, has_kite, etc.) so players can start cold.
- Switcher labels reframed as "Game 1 · Original Throwback" / "Game 2 · Modern Edition".

**Commit**: `8e5d626`

---

## #7 — Dead link: 404 on Game 1 (`/v0-original-text-engine/`) **✅ FIXED**

**Title**: `fix(deploy): Vercel 404 on /v0-original-text-engine/ directory index`

**Labels**: `bug`, `deploy`, `vercel`

**Reported quote** (with screenshot of 404 page):
> "this link is dead"

**Root cause**: `vercel.json` had `cleanUrls: true` + `trailingSlash: false`, which stripped the trailing slash but didn't auto-resolve the directory's `index.html`.

**Fix delivered**:
- Added explicit rewrites in `vercel.json` for both `/v0-original-text-engine` and `/v0-original-text-engine/` → `/v0-original-text-engine/index.html`.
- Switcher link updated to the canonical `/v0-original-text-engine/index.html` as belt-and-suspenders.

**Commit**: `fa76f3a Fix 404 on Game 1 link — add explicit rewrite for v0 directory`

---

## #8 — Separate Volume from Chapter; add volume picker **🟡 PARTIAL**

**Title**: `feat(menu): add Volume picker BEFORE chapter select (V1 vs V2)`

**Labels**: `feature`, `menu`, `ux`, `P0`

**Reported quote**:
> "You missed understood. let's separate what is a chapter and what is a volume. We can have a chapter select in the main menu. Prior to that we can have a volume selection (all the reimagined game is volume 2)"

**What's still missing**:
- An in-game `volume_select:` label that appears BEFORE `chapter_select:`.
- If player picks Volume 1 → navigate to `/v0-original-text-engine/index.html`.
- If player picks Volume 2 → jump to `chapter_select`.
- Needs a custom narrat command `open_url "…"` registered via `registerPlugin` in `v1-modern/src/index.ts`.

**Implementation recipe**: Documented in `HANDOVER.md` §11 item 1.

**Acceptance criteria**:
- [ ] `main:` jumps to `volume_select`, not `chapter_select`.
- [ ] Volume 1 choice redirects to the text-engine build.
- [ ] Volume 2 choice jumps to chapter_select.
- [ ] Corner switcher link can be removed (redundant once in-game picker works).

---

## #9 — Second stuck loop: sunset conversation FOOD repeats **✅ FIXED**

**Title**: `fix(narrative): 'Already covered' topics loop back to same menu in sunset/kitchen`

**Labels**: `bug`, `autoplay`, `narrative`, `P0`

**Reported quote** (with screenshot of sunset FOOD loop):
> "stuck again"

**What was broken**: In `sunset_conversation`, autoplay picked "FOOD?" → completed → jumped back → picked "FOOD?" again → "Already covered that one" → loop. Same pattern in `kitchen_conversation`.

**Fix delivered (cascade chain pattern)**:
- Each covered topic now **cascades to the next uncovered topic** instead of returning to the menu:
  ```narrat
  sunset_food_branch:
    if $data.talked_food:
      jump sunset_drink_branch   # cascade, not loop
  ```
- Added exit gates at top of each conversation: `sunset → if can_fly: jump jaffa_apt_scene`; `kitchen → if has_necklace: jump use_necklace`.
- Also guarded `use_bed` on `slept_with_k` and `kite_branch` on `has_kite`.

**Commit**: `a7f978c Fix autoplay loops in sunset/jaffa/japan + add game-tester sub-agent`

---

## #10 — Game tester sub-agent for full beta play **🟡 PARTIAL**

**Title**: `feat(qa): add game-tester sub-agent that beta-plays the whole game`

**Labels**: `qa`, `agent`, `enhancement`, `P0`

**Reported quote**:
> "create a game tester sub agent that actually play the game as a beta tester until completion and make sure that narrative is not blocked by loops esp on autoplay. all chapters are discoverable and all volumes are playable. all items can be collected, all skills are discovered, all conversations are discoverable and the game is fun to play and looks engaging and beautiful"

**Delivered**:
- `.claude/agents/game-tester.md` created with 12 acceptance criteria, rotating-choice strategy, loop/repetition detection, item/skill/easter-egg audit, screenshot capture.

**Still missing**:
- [ ] First full run of the agent against the deployed build.
- [ ] Validate the rotating-choice strategy surfaces new bugs.
- [ ] Wire the agent into a pre-deploy hook (block push if SHIP=false).

**Acceptance criteria**:
- [ ] All 5 chapters pass ship gate.
- [ ] All items collected, all skills flipped, all conversations reached.
- [ ] No prompt visited >6 times, no line repeated >4 times.
- [ ] Sacred line "For Anastasia. Forever." verified at end of Ch 5.
- [ ] Zero `console.error` entries.

---

## #11 — Master handover prompt for local coder agents **✅ FIXED**

**Title**: `docs: HANDOVER.md master prompt for continuing development locally`

**Labels**: `docs`, `onboarding`

**Reported quote**:
> "write an extensive handover master prompt to allow development to continue on a local coder agent"

**Delivered**:
- `HANDOVER.md` — self-contained master prompt with: sacred constraints, repo layout, sub-agent roster, narrat syntax cheatsheet, git/Vercel quirks, 12-criterion ship gate, prioritized open-work list.

**Commit**: `0bb9c6a Add HANDOVER.md master prompt for local coder agents`

---

## #12 — Audit & centralize easter-egg keywords **🔴 OPEN**

**Title**: `chore(narrative): single source of truth for easter-egg keywords`

**Labels**: `tech-debt`, `narrative`

**Surfaced during**: Code review of this session.

**Problem**: Keywords (MANGO, TEA, CHOCOLATE, KITE, LOVE, FLY, TIGER, SNAKE, ZODIAC, FUTURE, NECKLACE, BROMPTON, JAFFA, JAPAN, `PNK-n3zk7MAMBG-GIFT`) are duplicated across narrat scripts, playtest audit lists, and `docs/easter-eggs.md`. Rename one and the playtest silently passes.

**Acceptance criteria**:
- [ ] One canonical JSON/YAML list of keywords.
- [ ] Playtest imports the list instead of hardcoding.
- [ ] `game-tester` agent reads the same source.

---

## #13 — Upgrade keycaps from PNG → SVG **🔴 OPEN**

**Title**: `feat(ui): replace bitmap keycaps with hand-authored SVG, currentColor tintable`

**Labels**: `ui`, `polish`, `P2`

**Surfaced during**: `game-ui-artist` agent spec — "vectors beat bitmaps" rule not yet honored.

**Problem**: Current keycaps are 96×96 PIL-drawn PNGs; not crisp at DPI scaling, not CSS-tintable.

**Acceptance criteria**:
- [ ] Each keycap authored as SVG with `viewBox="0 0 32 32"` and `currentColor` stroke.
- [ ] Total UI asset payload under 200 KB.
- [ ] Narrat config points at `.svg` (or rasterized PNG at 2× for engines that require bitmaps).

---

## #14 — Migrate `vercel.json` → `vercel.ts` **🔴 OPEN**

**Title**: `chore(deploy): migrate vercel.json to typed vercel.ts`

**Labels**: `tech-debt`, `deploy`, `vercel`

**Surfaced during**: Code review + Vercel session context (2026-02-27).

**Problem**: `vercel.ts` is now Vercel's recommended config format with full TypeScript support, dynamic logic, and env-var access. Our hand-crafted rewrites for `/v0-original-text-engine/` would be easier to maintain in TS.

**Acceptance criteria**:
- [ ] Install `@vercel/config`.
- [ ] Port `cleanUrls`, `trailingSlash`, `buildCommand`, `outputDirectory`, and the two v0 rewrites to `vercel.ts`.
- [ ] Delete `vercel.json`.

---

## #15 — Add mobile-responsive check to playtest **🔴 OPEN**

**Title**: `qa: verify game works on mobile viewport (narrat defaults assume desktop)`

**Labels**: `qa`, `mobile`, `P2`

**Surfaced during**: Code review — playtest uses 1280×720 viewport only.

**Problem**: The recipient may open the game on a phone. Narrat's default layout may break below 768px.

**Acceptance criteria**:
- [ ] Playtest runs a second pass at iPhone 14 Pro viewport (430×932).
- [ ] All choices remain tappable; dialog box readable; sprites not cut off.

---

## Batch-create all issues with `gh` (after installing gh CLI)

```bash
# After `gh auth login`
for f in docs/issues-session/*.md; do
  title=$(grep -m1 '^## #' "$f" | sed 's/^## #[0-9]* — //' | sed 's/ \*\*.*$//')
  gh issue create \
    --title "$title" \
    --body-file "$f" \
    --label "from-session-2026-04-20"
done
```

Or one-shot per issue:
```bash
gh issue create --title "feat(menu): add Volume picker BEFORE chapter select (V1 vs V2)" \
  --label "feature,menu,ux,P0" \
  --body "$(awk '/^## #8/,/^---$/' docs/issues-session/SESSION-GAPS.md)"
```
