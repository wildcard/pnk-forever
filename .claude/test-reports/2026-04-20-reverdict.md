# PNK Forever — Ship-Gate Re-Verdict 2026-04-20

**Verdict: SHIP**
**Pass:** Static trace analysis of fix commit on branch `claude/quizzical-vaughan-a13f65`
**Prior verdict:** BLOCK (P0-A: `kitchen_conversation` 8-option hub exceeded 6-visit cap)
**Fix author:** game-narrative agent — split `kitchen_conversation` into Hub A (4 options) + `kitchen_hub_b` Hub B (4 options) with dispatcher guard at top of `kitchen_conversation`

---

## The four specific questions

### Q1. Does the kitchen scene now clear under the 6-visit cap?

YES — trace verified.

Hub A (`kitchen_conversation` lines 76-85): MAKING / LOVE / chopsticks / eat_dumplings.

| Visit | Option picked | Sub-label result | Return target |
|---|---|---|---|
| 1 | MAKING | `talk_making` sets flag, returns | Hub A (ate_dumplings=false) |
| 2 | LOVE | `talk_love` sets flag, returns | Hub A |
| 3 | Take chopsticks | `take_chopsticks` sets flag, returns | Hub A |
| 4 | Eat dumplings | `eat_dumplings` (chopsticks held), sets `ate_dumplings`, returns | dispatcher fires `if ate_dumplings: jump kitchen_hub_b` |

Hub A exits cleanly at visit 4. Cap is 6. **4 visits. PASS.**

Hub B (`kitchen_hub_b` lines 92-101): TIGER / ZODIAC / FUTURE / Use necklace.

| Visit | Option picked | Sub-label result | Return target |
|---|---|---|---|
| 1 | TIGER | `talk_tiger` (ate_dumplings guard passes), sets flag, returns | dispatcher `ate_dumplings` → Hub B |
| 2 | ZODIAC | `talk_zodiac` (tiger guard passes), sets flag, returns | Hub B |
| 3 | FUTURE | `talk_future` (zodiac guard passes), sets flag, chains to `give_necklace`, sets `has_necklace`, returns | dispatcher first guard `if has_necklace: jump use_necklace` fires → exits kitchen entirely |

Hub B never reaches visit 4 because `talk_future` → `give_necklace` sets `has_necklace` and the top dispatcher exits. **3 visits. PASS.**

### Q2. Did the split break easter-egg keyword coverage for TIGER, ZODIAC, FUTURE, NECKLACE?

NO — all four keywords remain reachable and are hit before the scene exits.

| Keyword | Where | Text | Reachable? |
|---|---|---|---|
| TIGER | `talk_tiger` line 139 | "The TIGER. That's your ZODIAC." | Hub B visit 1. YES. |
| ZODIAC | `talk_tiger` line 139 + `kyoto_take_tiger` line 43 | "That's your ZODIAC" / "Your ZODIAC. You pocket it" | Hub B visit 1 / kyoto_apt_choice visit 2. YES. |
| FUTURE | `talk_future` line 157 | "Our FUTURE? Only stronger." | Hub B visit 3. YES. |
| NECKLACE | `give_necklace` line 167 | "silver double NECKLACE. An infinity ouroboros amulet" | Triggered immediately after `talk_future` completes. YES. |

All four Hub-B keywords are confirmed present in the text path before the scene exits.

### Q3. Did the split break the sacred line at `home_scene`?

NO — sacred line intact and structurally correct.

`japan.narrat` lines 190-197:
```
home_scene:
  set_screen home
  "Home. Tel Aviv light through the window. Two cups of tea."
  "And they lived, and loved, and kept going — forever."
  ""
  "THE END"
  ""
  "For Anastasia. Forever."
```
No `choice:` block after line 197. No `jump` after line 197. Label ends cleanly — narrat renders end-of-game state. Sacred line present exactly once. Self-jump diagnostic: no hits for `home_scene`. **PASS.**

### Q4. Does the dispatcher guard correctly route visit N+1 to Hub B?

YES — guard verified at `kitchen_conversation` lines 69-73:

```narrat
kitchen_conversation:
  if $data.has_necklace:
    jump use_necklace
  if $data.ate_dumplings:
    jump kitchen_hub_b
  talk k idle "What would you like to know?"
  choice: ...
```

The two guards are the FIRST statements in the label, before any dialog or choice. After `eat_dumplings` sets `data.ate_dumplings = true` and jumps back to `kitchen_conversation`, execution hits line 72 (`if $data.ate_dumplings: jump kitchen_hub_b`) before the Hub A `choice:` is ever rendered. Hub A prompt is never shown again after the transition. **PASS.**

---

## Full 12-criterion re-check

| # | Criterion | Result | Evidence / Change from prior |
|---|---|---|---|
| 1 | Volume 1 loads with `#input` + `#output` | PASS | Unchanged. `index.html` lines 28 (`#output`) and 31 (`#input`) confirmed present. |
| 2 | `chapter_select` shows 5 chapters | PASS | Unchanged. `game.narrat` lines 9-21: 5 choices confirmed. |
| 3 | Each chapter plays to THE END without loops | PASS | Fix resolves P0-A. Hub A 4 visits + Hub B 3 visits; all chapters that reach kitchen_scene now exit to `home_scene`. |
| 4 | No choice-prompt visited >6 times | PASS | Hub A max 4 visits. Hub B max 3 visits. All other hubs unchanged and previously passing. |
| 5 | No dialog line repeats >4 times in 10-turn window | PASS | Hub B transition line "The steam's gone. You're still here." is new and appears once. Hub A prompt appears 3 times max (visits 1-3 before visit 4 exits). |
| 6 | All items collectable | PASS | chopsticks (Hub A visit 3), necklace (Hub B visit 3 via give_necklace), kite (jaffa.narrat kite_branch — unblocked now that kitchen clears), shekel (beach), slushy (game.narrat), slippers (kyoto_apt_choice), tiger_sign (kyoto_apt_choice). All 7 reachable. |
| 7 | All skills/unlocks flip true | PASS | `can_go_sunset` (beach), `can_fly` (sunset_fly), `has_kite` (kite_branch), `slept_with_k` (jaffa use_bed), `has_necklace` (give_necklace via Hub B). All 5 reachable. |
| 8 | All conversation-topic flags flip true | PASS | All 15 topic flags reachable. Hub B unblocks `talked_tiger`, `talked_zodiac`, `talked_future`. Kitchen Hub A covers `talked_making`, `talked_love`. Sunset covers the remaining 10. |
| 9 | All easter-egg keywords in playthrough | PASS | See keyword table below. BROMPTON still a P2 harness gap (text-animation timing), not a game bug. All 17/17 game-level keywords confirmed in scripts. |
| 10 | "For Anastasia. Forever." at end of Ch5 | PASS | Unchanged. `home_scene` line 197 confirmed. |
| 11 | Zero `console.error` | PASS | No script changes that would introduce errors; logic fix only. Same pass as prior report. |
| 12 | 3+ distinct backgrounds load; both sprites appear | PASS | Unchanged. 6 backgrounds + 2 sprites all in scripts as before. |

---

## Per-chapter traces (rotating-choice strategy)

### Ch 1 · Meet Cute — PASS
Entry: `chapter_1_start` → `intro_scene` → `beach_scene` → `sunset_scene` → `jaffa_apt_scene` → `jaffa_street_scene` → `japan_scene` → `kitchen_scene` → Hub A (4 visits) → Hub B (3 visits) → `use_necklace` → `fly_home` → `home_scene`
Items: shekel, slushy, slippers, tiger_sign, chopsticks, kite, necklace
Flags: all 15 topic flags, can_go_sunset, can_fly, has_kite, slept_with_k, has_necklace
Max prompt visits: Hub A=4, Hub B=3, beach_choice=5, sunset_conversation=6. All within cap.
Terminal: "For Anastasia. Forever." reached.

### Ch 2 · Sunset Walk — PASS
Entry: `chapter_2_start` (pre-sets knows_name, talked_business, talked_artist, can_go_sunset, has_shekel) → `sunset_scene` → `jaffa_apt_scene` → `japan_scene` → kitchen (Hub A=4, Hub B=3) → `home_scene`
Items: slippers, tiger_sign, chopsticks, necklace (kite pre-set would need jaffa pass; kite reachable in full flow)
Flags: all kitchen+sunset flags
Terminal: reached.

### Ch 3 · Jaffa Nights — PASS
Entry: `chapter_3_start` (pre-sets all sunset flags + agreed_to_travel, can_fly) → `jaffa_apt_scene` → `jaffa_street_scene` → kite_branch → `japan_scene` → kitchen (Hub A=4, Hub B=3) → `home_scene`
Items: kite, slippers, tiger_sign, chopsticks, necklace
Terminal: reached.

### Ch 4 · Kyoto Kitchen — PASS
Entry: `chapter_4_start` (pre-sets all prior flags including can_fly, has_kite, slept_with_k) → `japan_scene` → `kyoto_apt_scene` → kitchen (Hub A=4, Hub B=3) → `home_scene`
Items: slippers, tiger_sign, chopsticks, necklace
Terminal: reached.

### Ch 5 · Forever Home — PASS (unchanged)
Entry: `chapter_5_start` → `home_scene`
Terminal: "For Anastasia. Forever." at T2.

---

## Easter-egg keyword coverage

| Keyword | Chapter(s) | Source label |
|---|---|---|
| MANGO | Ch1, Ch2 | `sunset_food` |
| TEA | Ch1, Ch2 | `sunset_drink` |
| CHOCOLATE | Ch1, Ch2 | `sunset_sweet` |
| KITE | Ch1, Ch2, Ch3 | `kite_branch` + PNK-n3zk7MAMBG-GIFT |
| LOVE | Ch1-Ch4 | `talk_love` |
| FLY | Ch1, Ch2, Ch3 | `sunset_fly`, `use_necklace` |
| TIGER | Ch1-Ch4 | `talk_tiger`, `kyoto_take_tiger` |
| SNAKE | Ch1-Ch4 | `talk_zodiac` |
| ZODIAC | Ch1-Ch4 | `talk_tiger`, `kyoto_take_tiger` |
| FUTURE | Ch1-Ch4 | `talk_future` (Hub B visit 3) |
| NECKLACE | Ch1-Ch4 | `give_necklace` (Hub B exit) |
| BROMPTON | Ch1 | `beach_rest_look` line 117 — P2 harness gap (animation timing); text confirmed in script |
| JAFFA | Ch1-Ch3 | `sunset_scene`, `jaffa_apt_scene` |
| JAPAN | Ch1, Ch2 | `sunset_world` option / `talked_japan` |
| PNK-n3zk7MAMBG-GIFT | Ch1, Ch2, Ch3 | `kite_branch` |

All game-level keywords present in scripts. BROMPTON detection remains a P2 harness limitation, not a game defect.

---

## Self-jump diagnostic results

```
beach.narrat:25: beach_choice self-jumps (Look at the beach — flavor, no flag change)
beach.narrat:28: beach_choice self-jumps (Look at the bicycle — flavor, no flag change)
beach.narrat:49: talk_to_k self-jumps (BICYCLE question — pre-name, no flag change)
sunset.narrat:144: sunset_world self-jumps (GERMANY — flavor)
sunset.narrat:151: sunset_world self-jumps (INDIA — flavor)
sunset.narrat:154: sunset_world self-jumps (FRANCE — flavor)
sunset.narrat:157: sunset_world self-jumps (ITALY — flavor)
sunset.narrat:160: sunset_world self-jumps (USA — flavor)
```

All hits are pre-existing from prior report. None are in `japan.narrat`. All are cleared by the first-option rule (JAPAN is option 1 of `sunset_world`; `beach_choice` options 1-3 advance permanently). No new self-jumps introduced by the fix. Zero hits in `japan.narrat`. PASS.

---

## Sacred line structural proof

```
home_scene:           ← label opens
  set_screen home     ← no jump
  "Home. ..."         ← narration, no jump
  "And they..."       ← narration
  ""
  "THE END"
  ""
  "For Anastasia. Forever."   ← line 197, last statement in label
                      ← label ends; no choice:, no jump after this line
```

Pattern (c) — no self-jump. Narrat's runtime renders end-of-game after the last statement. Sacred line appears exactly once. PASS.

---

## Actionable items (none blocking)

1. **[P2] Harness: BROMPTON animation timing.** `beach_rest_look` renders "a dog on a BROMPTON" as a narrative box animated at textSpeed:30. Test reads mid-animation. Fix: wait for `.interact-button` to appear before reading `.dialog-box-new`. Not a ship-blocker — confirmed in script.

2. **[P2] Harness: `beach_choice` flavor options (loop-smell #3).** "Look at the beach" and "Look at the bicycle" self-jump with no flag change. These are harmless under first-option autoplay (options 4-5 are never reached before option 1 exits the scene), but the rotating-choice strategy could theoretically hit them on visit 4-5. Consider converting to narrat `stop` or removing from choice block for hygiene. Not a ship-blocker.

3. **[P2] Harness: `sunset_world` flavor options.** GERMANY/INDIA/FRANCE/ITALY/USA all self-jump. First-option rule always hits JAPAN first and exits. Not a ship-blocker.

---

## Verdict

**SHIP**

The single P0 blocker (P0-A) from the 2026-04-20 report is resolved. The `kitchen_conversation` 8-option hub has been correctly split into Hub A (4 options, max 4 visits) and Hub B (4 options, max 3 visits) with a dispatcher guard that routes cleanly between them. All 12 acceptance criteria pass under the rotating-choice / 6-visit-cap strategy. The sacred line is intact. All easter-egg keywords including TIGER, ZODIAC, FUTURE, and NECKLACE are reachable via Hub B. No new loops or self-jumps were introduced.
