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

- [ ] **[P0] Run the first full `game-tester` pass against the live build** — we have the agent but have never actually dispatched it end-to-end.
  - owner: game-tester (dispatched by game-producer)
  - acceptance: a SHIP/BLOCK verdict report saved under `.claude/test-reports/<yyyy-mm-dd>.md` with pass/fail per chapter + per easter-egg keyword + sacred-line check.
  - added: 2026-04-20
  - source: SESSION-GAPS.md #10

- [ ] **[P0] Volume picker UI before chapter select** — let Anastasia pick Volume 1 (v0) or Volume 2 (v1) at game start.
  - owner: game-ui-artist
  - acceptance: `v1-modern/src/scripts/game.narrat` opening screen offers both routes; both paths deploy and load without 404.
  - added: 2026-04-20
  - source: SESSION-GAPS.md #8

- [ ] **[P1] Centralize easter-egg keyword list in a single source of truth** — remove duplicated string literals across the 5 `.narrat` files.
  - owner: game-narrative
  - acceptance: one canonical list imported/referenced by all scenes; no keyword appears as a bare string literal in two different files.
  - added: 2026-04-20
  - source: SESSION-GAPS.md #12

- [ ] **[P1] Update `README.md` "What's Next" to match shipped state** — the section still describes v1 as "in planning" despite 5 chapters being live on Vercel.
  - owner: story-biographer
  - acceptance: section reflects reality — 5 chapters shipped, chapter-select hidden from main flow, Vercel deploy live at the production URL.
  - added: 2026-04-20

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

## Open — producer-generated (from the legendary-game research lenses)

- [ ] **[P1] Identify and document the 3–5 "remembered moments"** — Engineer-the-Moments lens (Hades, Undertale). The moments Anastasia will still remember a year from playing.
  - owner: game-producer (with game-narrative input)
  - acceptance: `.claude/docs/remembered-moments.md` lists each beat + scene + why it lands for Anastasia specifically + current implementation status (PASS / WEAK / MISSING).
  - added: 2026-04-20

- [ ] **[P1] Ambient-texture audit** — Night-in-the-Woods lens. Where are the quiet scenes lacking personal detail?
  - owner: game-producer (dispatches `general-purpose` as a VN reviewer)
  - acceptance: audit report flagging at least 5 spots in the 5 narrat files where personal-detail density can go up one notch without bloat; each flagged spot has a concrete candidate line of dialog or detail to add.
  - added: 2026-04-20

- [ ] **[P1] Landing-the-ending review** — focused pass on `japan.narrat:home_scene` + the sacred line's setup beats.
  - owner: game-narrative (brief from game-producer)
  - acceptance: one-page review of the last 60 seconds of gameplay — does the sacred line earn its weight? Is the beat before it still the right beat? Include specific edits if any.
  - added: 2026-04-20

- [ ] **[P2] First-60-seconds polish** — the opening minute decides whether she keeps playing.
  - owner: game-narrative + art-director (parallel dispatch)
  - acceptance: the intro_scene through the first choice is reviewed as a unit; one concrete improvement shipped.
  - added: 2026-04-20

- [ ] **[P2] Personal-detail density pass on kitchen_conversation** — the crescendo scene; the Night-in-the-Woods lens applied to the single most emotionally-loaded scene.
  - owner: game-narrative
  - acceptance: 3+ new lines of personal detail (inside jokes, shared-memory references, things only Anastasia will catch) added to the dim-sum / tiger / zodiac / future thread, without breaking the cascade-guard choice structure.
  - added: 2026-04-20

---

## Done

(none yet — populated at milestone boundaries)

---

## Archived

(move dropped / won't-do items here with a one-line reason)
