# PNK Forever — Backlog

**Owner:** the `game-producer` sub-agent (see `.claude/agents/game-producer.md`).
**Policy:** every item has priority, owner, acceptance, added-date. On completion, check the box (do not delete). At milestone boundaries, move checked items to `.claude/backlog/archive.md`.

## Priority legend
- **P0** — sacred constraint break or shipped bug.
- **P1** — blocker for the next milestone.
- **P2** — polish that noticeably improves the experience.
- **P3** — someday / nice-to-have.

---

## Open — migrated from `docs/issues-session/SESSION-GAPS.md`

- [x] **[P0] Run the first full `game-tester` pass against the live build** — we have the agent but have never actually dispatched it end-to-end.
  - owner: game-tester (dispatched by game-producer)
  - acceptance: a SHIP/BLOCK verdict report saved under `.claude/test-reports/<yyyy-mm-dd>.md` with pass/fail per chapter + per easter-egg keyword + sacred-line check.
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: **BLOCK** — one P0 blocker (kitchen 8-option hub exceeds 6-visit cap). 5/12 criteria PASS as isolated checks; Ch 1–4 fail because all funnel into Ch5 kitchen. Sacred line + backgrounds + sprites + 0 console.errors all GREEN. Full report: `.claude/test-reports/2026-04-20.md`.
  - source: SESSION-GAPS.md #10

- [x] **[P0] Re-run `game-tester` on the integrated branch** — previous ship-gate was against the superseded Hub A/B structure from #39; needs a fresh verdict against `main`'s top-guard structure combined with producer-sequence narrative polish.
  - owner: game-tester (dispatched by game-producer)
  - acceptance: SHIP/BLOCK verdict against commit `203107d` on branch `integrate/producer-sequence`; all 10 acceptance criteria checked; kitchen_conversation 8-option hub with PR #42 top-guard validated at 6-visit cap.
  - added: 2026-04-22
  - completed: 2026-04-22
  - result: **SHIP** — all 10 acceptance criteria PASS, zero self-jumps, kitchen 8-option hub exits cleanly at visit 6 via top-guard cascade, sacred line terminal and unique per chapter, all 15 easter-egg keywords reachable, all 6 chapters end at `home_scene`. Full report: `.claude/test-reports/2026-04-22-integrated-shipgate.md`.

- [x] **[P0] Volume picker UI before chapter select** — let Anastasia pick Volume 1 (v0) or Volume 2 (v1) at game start.
  - owner: game-ui-artist
  - acceptance: `v1-modern/src/scripts/game.narrat` opening screen offers both routes; both paths deploy and load without 404.
  - added: 2026-04-20
  - completed: 2026-04-20 (shipped on main in PR #41 `5dab3ea`).
  - source: SESSION-GAPS.md #8

- [x] **[P1] Centralize easter-egg keyword list in a single source of truth** — remove duplicated string literals across the 5 `.narrat` files.
  - owner: game-narrative
  - acceptance: one canonical list imported/referenced by all scenes; no keyword appears as a bare string literal in two different files.
  - added: 2026-04-20
  - completed: 2026-04-20 (shipped on main in PR #43 `915c1bb` — CI workflow + scripts/check-easter-eggs.sh; stronger than the sunset.narrat registry-comment approach originally planned).
  - source: SESSION-GAPS.md #12

- [ ] **[P1] Update `README.md` "What's Next" to match shipped state** — main has since added Ch6 Vancouver (#12/#38), AI NPC plugin (#34), volume picker (#41); README needs a fresh pass.
  - owner: story-biographer
  - acceptance: section reflects reality — 5 chapters + Ch6 Vancouver epilogue all shipped, volume-select + AI NPC plugin live, chapter-select hidden from main flow, Vercel deploy live at production URL.
  - added: 2026-04-20
  - note: deferred from 2026-04-20 producer sequence — the rewrite prepared then went stale when main merged PRs #12/#34/#38/#41/#42/#43/#44. Fresh dispatch needed.

- [ ] **[P2] Upgrade keycaps from PIL-generated PNG to SVG** — crisper UI at retina zoom.
  - owner: game-ui-artist
  - acceptance: every file under `v1-modern/public/img/ui/button-prompts/` is SVG; `v1-modern/scripts/draw-keycaps.py` archived or removed.
  - added: 2026-04-20
  - source: SESSION-GAPS.md #13

- [ ] **[P2] Migrate `vercel.json` to `vercel.ts`** — typed config, easier to maintain.
  - owner: user (or game-producer delegates)
  - acceptance: `vercel.ts` with equivalent config (buildCommand, outputDirectory, cleanUrls, rewrites for v0 path); preview deploy stays green.
  - added: 2026-04-20
  - source: SESSION-GAPS.md #14

- [ ] **[P2] Add mobile viewport coverage to the playtest** — `game-tester` currently only runs default desktop viewport.
  - owner: game-tester
  - acceptance: test report contains pass/fail per viewport — at minimum 375x667 (iPhone SE), 390x844 (iPhone 14), 768x1024 (iPad).
  - added: 2026-04-20
  - source: SESSION-GAPS.md #15

---

## Open — filed from the 2026-04-20 ship-gate verdict

- [x] **[P0] Split `kitchen_conversation` 8-option hub into two 4-option hubs** — current hub in `v1-modern/src/scripts/japan.narrat:69` requires 7+ visits to clear; 6-visit ship-gate cap aborts Ch 1–4 (all funnel into Ch5 kitchen).
  - owner: game-narrative
  - acceptance: `kitchen_conversation` is replaced by two sequential hubs (Hub A: MAKING / LOVE / chopsticks / dumplings; Hub B: TIGER / ZODIAC / FUTURE / necklace). Each hub ≤4 options. Existing per-topic cascade guards (`if $data.talked_x: jump ...`) remain valid. After the split, dispatch `game-tester` for re-verdict — expected SHIP.
  - added: 2026-04-20
  - completed: 2026-04-20
  - source: `.claude/test-reports/2026-04-20.md` — Blocker #1
  - result: **SHIP** — Hub A clears in 4 visits, Hub B clears in 3 visits, dispatcher guard fires on N+1, all 4 keywords (TIGER/ZODIAC/FUTURE/NECKLACE) intact, sacred line untouched. Re-verdict: `.claude/test-reports/2026-04-20-reverdict.md`.

- [ ] **[P3] game-tester harness ergonomics — 3 polish items** — noted during the inaugural run, do not block shipping.
  - owner: game-tester (self-improvement PR to its own agent spec, not the game)
  - acceptance: (a) wait for `.interact-button` before reading dialog text (currently polls mid-animation, misses BROMPTON in `game.narrat:119`); (b) scan `document.body.innerText` for sacred-line check (currently reads `.dialog-box-new` and captures mid-animation truncation); (c) install Playwright types so scratch `.mjs` scripts under `/tmp/` stop throwing TS `7016` diagnostics.
  - added: 2026-04-20
  - source: `.claude/test-reports/2026-04-20.md` — Non-blocking observations

---

## Open — producer-generated (from the legendary-game research lenses)

- [x] **[P1] Identify and document the 3–5 "remembered moments"** — Engineer-the-Moments lens (Hades, Undertale). The moments Anastasia will still remember a year from playing.
  - owner: game-producer (with game-narrative input)
  - acceptance: `.claude/docs/remembered-moments.md` lists each beat + scene + why it lands for Anastasia specifically + current implementation status (PASS / WEAK / MISSING).
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: 5 moments identified — 3 PASS (Brompton meeting, Ehecatl naming, sacred line), 2 WEAK (JAPAN/FLY pivot, necklace gift dialog). Polish budget steered to items 5 & 6 in this backlog. See `.claude/docs/remembered-moments.md`.

- [x] **[P1] Ambient-texture audit** — Night-in-the-Woods lens. Where are the quiet scenes lacking personal detail?
  - owner: game-producer (dispatches `general-purpose` as a VN reviewer)
  - acceptance: audit report flagging at least 5 spots in the 5 narrat files where personal-detail density can go up one notch without bloat; each flagged spot has a concrete candidate line of dialog or detail to add.
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: 7 flags filed. Producer note: Jaffa is the weakest link (flags 5, 6, 7). See `.claude/reviews/ambient-texture-audit-2026-04-20.md`. 4 of 7 flags have an author-supplied-detail option for real-memory grounding.

- [x] **[P1] Landing-the-ending review** — focused pass on `japan.narrat:home_scene` + the sacred line's setup beats.
  - owner: game-narrative (brief from game-producer)
  - acceptance: one-page review of the last 60 seconds of gameplay — does the sacred line earn its weight? Is the beat before it still the right beat? Include specific edits if any.
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: **POLISH-BEFORE-SHIP** — see `.claude/reviews/landing-the-ending-2026-04-20.md`. Three specific edits proposed: add one sensory line in `fly_home` bridging necklace to home; cut line 193 "And they lived, and loved..." (steals oxygen from "forever"); cut THE END + blanks. Awaiting author (user) decision before dispatching `game-narrative`.

- [x] **[P1] Ship or shelve landing-the-ending edits** — act on the reviewer's three proposed edits, or explicitly shelve them with rationale.
  - owner: user (decides), then game-narrative (executes)
  - acceptance: one of three outcomes — (a) all 3 edits land via game-narrative + game-tester re-pass green; (b) a subset lands with the others explicitly shelved here; (c) all 3 shelved with one-line author rationale recorded below.
  - added: 2026-04-20
  - completed: 2026-04-20
  - source: `.claude/reviews/landing-the-ending-2026-04-20.md`
  - result: (a) — user said "all"; all 3 edits landed in commit `ec98c1c`; game-tester SHIP verdict in `.claude/test-reports/2026-04-20-landing-reverdict.md`.

- [x] **[P2] First-60-seconds polish** — the opening minute decides whether she keeps playing.
  - owner: game-narrative + art-director (parallel dispatch)
  - acceptance: the intro_scene through the first choice is reviewed as a unit; one concrete improvement shipped.
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: one line added at `game.narrat:116` — *"A napkin pinned by a seashell. This table is hers, for now."* — addressing Flag 1 of the ambient-texture audit (café lacks weight of place). Build green. Art-director flagged `beach_rest.png` as REGEN LATER; filed separately below.

- [x] **[P2] Personal-detail density pass on kitchen_conversation** — the crescendo scene; the Night-in-the-Woods lens applied to the single most emotionally-loaded scene.
  - owner: game-narrative
  - acceptance: 3+ new lines of personal detail (inside jokes, shared-memory references, things only Anastasia will catch) added to the dim-sum / tiger / zodiac / future thread, without breaking the cascade-guard choice structure.
  - added: 2026-04-20
  - completed: 2026-04-20
  - result: 6 new lines landed in `japan.narrat`. Move A (Moment 4 HIGH budget): `give_necklace` expanded from "Here. Put it on." to 4 lines of *why* (silver/kite/snake/invitation); stranded zodiac-snake disclosure in `talk_future:161` folded into the box-open moment. Move B (density): har gow callback in `talk_making`, "I noticed you before you noticed me" in `talk_zodiac`, Sunday-mornings ritual in `talk_future`. Cascade verified; build green.

- [ ] **[P3] Regenerate `beach_rest.png` background** — current image reads generic-romantic-dusk; doesn't carry "her café, her afternoon" mood the narrative polish is building toward, plus has a midday-vs-sunset continuity gap.
  - owner: art-director (dispatches game-artist)
  - acceptance: new `v1-modern/public/img/beach_rest.png` that reads as "hot bright midday at P.'s Tel Aviv café" per the brief below.
  - prompt brief: *Tel Aviv beach café at hot bright midday, overhead sun, wooden table with colorful acai slushy, a sandy flip-flop half-visible under a rattan chair, a napkin weighted by a small seashell, Brompton bicycle leaning nearby, no people, warm haze, visual novel background, painterly, Ghibli-inspired, 16:9.*
  - added: 2026-04-20
  - source: art-director's audit during the Item 5/6 first-60s polish dispatch.
  - note: **post-ship** — do not regen before 2026-04-23. The narrative line added at `game.narrat:116` does enough lifting for the anniversary ship.

---

## Done

(none yet — populated at milestone boundaries)

---

## Archived

(move dropped / won't-do items here with a one-line reason)
