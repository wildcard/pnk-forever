# Ship-Gate — Integrated Branch Re-Verdict

**Date:** 2026-04-22
**Branch:** `integrate/producer-sequence`
**Commit:** `203107d`
**Tester:** `game-tester` sub-agent (dispatched by `game-producer`)
**Purpose:** Re-validate after integrating 2026-04-20 producer-sequence polish on top of current `main` (which added Ch6 Vancouver, AI NPC plugin, volume picker, keyword-centralization CI, PR #42 kitchen top-guard).

---

## VERDICT: SHIP

Branch `integrate/producer-sequence` @ commit `203107d` passes all acceptance criteria. The integrated tree is clean.

---

## Per-Chapter Summary

| Chapter | Entry label | Terminal | Max visits any label | Loop? | End reached |
|---------|-------------|----------|----------------------|-------|-------------|
| Ch1 Meet Cute | `intro_scene` | `home_scene` | 6 (`sunset_conversation`, 7 opts) | No | Yes |
| Ch2 Sunset Walk | `chapter_2_start` | `home_scene` | 6 (`sunset_conversation`) | No | Yes |
| Ch3 Jaffa Nights | `chapter_3_start` | `home_scene` | 3 (`jaffa_street_scene`) | No | Yes |
| Ch4 Kyoto Kitchen | `chapter_4_start` | `home_scene` | 6 (`kitchen_conversation`, 8 opts + top-guard) | No | Yes |
| Ch5 Forever Home | `chapter_5_start` | `home_scene` | 1 (direct) | No | Yes |
| Ch6 West Coast Years | `chapter_6_start` | `home_scene` | 5 (`vancouver_day_prompt`, 5 opts) | No | Yes |

---

## Acceptance Criteria

| # | Criterion | Result |
|---|-----------|--------|
| C1 | All volumes playable (V0 input/output, V2 Narrat loads) | PASS |
| C2 | chapter_select offers 6 chapters (was 5; Ch6 added in PR #44) | PASS |
| C3 | No loops — 6-visit cap not triggered on any label | PASS |
| C4 | All items collectable (shekel, slushy, slippers, tiger sign, chopsticks, kite, necklace) | PASS |
| C5 | Skills/unlocks: `can_go_sunset`, `can_fly`, `has_kite`, `slept_with_k`, `has_necklace` | PASS |
| C6 | All 15 conversation flags reachable | PASS |
| C7 | All 15 canonical easter-egg keywords in scripts | PASS |
| C8 | Visuals: 6+ backgrounds, phoenix + k sprites | PASS (unchanged from prior) |
| C9 | No new console errors (pre-existing P2 noise unchanged) | PASS |
| C10 | Sacred line "For Anastasia. Forever." — terminal, exactly once per chapter | PASS |

---

## Loop Analysis (rotating-choice simulation, Python-verified)

| Label | Options | Max visits | Exit mechanism |
|-------|---------|------------|----------------|
| `slushy_choice` | 2 | 2 | `use_slushy` drains gulps 3→0, exits to `go_to_beach` |
| `beach_choice` | 5 | 1 | opt1 `talk_to_k` chains to `sunset_scene` and exits |
| `sunset_conversation` | 7 | 6 | visit 6 picks `world` → JAPAN → `can_fly=true` → top-guard fires → `jaffa_apt_scene` |
| `jaffa_street_scene` | 3 | 2 | visit 2 `fly_branch` exits to `fly_to_japan` |
| `kyoto_apt_choice` | 3 | 3 | visit 3 `go_kitchen` (slippers+tiger both set) → `kitchen_scene` |
| `kitchen_conversation` | 8 + top-guard | 6 | visit 6 sets `talked_zodiac=true`; top-guard at next entry fires → `talk_future` → `give_necklace` → `has_necklace=true` → top-guard fires → `use_necklace` |
| `epilogue_bridge` | 2 | 1 | both options are forward-only; no self-jump possible |
| `vancouver_day_prompt` | 5 | 5 | visit 5 `head_home` → `vancouver_outro` |

Self-jump diagnostic (awk scan of all six `.narrat` files): zero hits.

---

## Integration-Specific Checks

**kitchen_conversation (the re-validation target).** PR #42's top-guards at `japan.narrat:70,72` (`if $data.has_necklace` and `if $data.talked_zodiac`) are intact — the producer-sequence commit did not touch lines 69–93. The 8-option hub exits cleanly at visit 6 under rotating-choice without hitting the cap. Pattern (a) cascade via guard — canonical idiom confirmed.

**epilogue_bridge (new in producer-sequence).** `fly_home` now jumps `epilogue_bridge` rather than directly to `home_scene`. The two-option block is pattern (c) no-self-jump: both options are forward-only (`vancouver_intro` or `home_scene`). No loop risk.

**vancouver_outro (Ch6 dead-end fix).** `jump home_scene` added at `vancouver.narrat:98`. Without this, Ch6 and the `epilogue_bridge → vancouver_intro` path were dead-ends. Now all paths through Vancouver terminate at the sacred line.

**home_scene terminal.** `"For Anastasia. Forever."` is the last statement of `japan.narrat:196-200`. No trailing choice, no trailing jump. Reachable from all 6 chapters, appears exactly once per chapter.

---

## Easter-Egg Keyword Coverage (15/15 canonical)

All 15 keywords from `docs/easter-eggs.md` are present in at least one `.narrat` file and reachable on at least one chapter playthrough. The task brief also lists EHECATL — it appears as mixed-case `"Ehecatl"` at `beach.narrat:59` and is not in the canonical list; no action required for ship-gate.

---

## Residual Observations (no action required for this release)

- **[P2]** Pre-existing ~314 console.error entries per session (global-scope parser quirks in `game.narrat` + `sunset.narrat`). Unchanged. Zero new errors from `203107d`.
- **[P3]** Agent spec criterion C2 says "5 chapters" — wording is now stale; the build has 6.
- **[P3]** EHECATL is `"Ehecatl"` (mixed case) at `beach.narrat:59`. If it should be a canonical keyword, append to `docs/easter-eggs.md`.

---

**SHIP. Branch `integrate/producer-sequence` is ready to merge to main.**
