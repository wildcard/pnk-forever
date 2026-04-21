# Landing-the-Ending Review — 2026-04-20

**Reviewer:** Ren'Py / narrat postmortem veteran (dispatched via `general-purpose`).
**Scope:** `v1-modern/src/scripts/japan.narrat` — labels `talk_future` (152–163), `give_necklace` (165–170), `use_necklace` (178–183), `fly_home` (185–188), `home_scene` (190–197).
**Brief:** "Does the sacred line 'For Anastasia. Forever.' earn its weight, given the 60 seconds of gameplay that precede it?"

---

## Verdict

**POLISH-BEFORE-SHIP.** Bones are right. Final 60 seconds currently reads like a storyboard, not a scene. Two small additions and one cut and it lands.

## Per sub-question

**1. Runway.** Two lines in `fly_home` is not enough. It's a geography transition, not an emotional one. Need one beat *inside the flight* connecting necklace (a physical object just given) to home (the next physical place). Necklace handed over on line 168, then silent until credits — missing the bridge.

**2. The beat before the beat.** The "earn the silence" move in a 30-minute VN is *a held moment with no dialogue* — one line of pure image, no speaker, before the dedication. `talk_future` does the verbal work ("Stronger together. One. To eternity.") — good, on the page. Missing: the *wordless* counterpart. Tel Aviv light + two cups of tea almost does it but is rushed into the next line on the same breath. Needs room.

**3. The sacred line's setup.** `"And they lived, and loved, and kept going — forever."` (line 193) is stealing oxygen. Pre-echoes "Forever" one line before the sacred line uses the same word, and its fairytale register fights the intimate register the rest of the game earned. **Cut it.** Sacred line needs silence around "forever," not a rhyme. Tea-and-light is the better penultimate beat — concrete, domestic, theirs.

**4. Structure.** "THE END" is hurting. Convention for audiences; this game has one player. Remove the `"THE END"` line and the blank `""` lines bracketing it. Sacred line should follow the domestic image after a single blank line, and stand alone.

**5. Necklace moment.** `use_necklace` line "The silver rests cool on your chest. A perfect weight." is the best-written line in this stretch. Doing real work. Problem isn't the moment; it's that the necklace disappears for the entire flight and the whole `home_scene`. Needs to reappear *once* after this, or it wasn't an anchor — it was a prop.

## Proposed edits

**ADD** (`japan.narrat:fly_home`, inserted between the two existing lines):
```narrat
"The silver catches the wind. It stays warm against your chest."
```

**CUT** (`japan.narrat:193–196`):
```narrat
"And they lived, and loved, and kept going — forever."
""
"THE END"
""
```

Resulting `home_scene`:
```narrat
home_scene:
  set_screen home
  "Home. Tel Aviv light through the window. Two cups of tea."
  ""
  "For Anastasia. Forever."
```

## Sacred-constraint check

The final line `"For Anastasia. Forever."` is preserved verbatim. Producer should still surface to the user before dispatching, because the surrounding scene is author-deliberate and cutting the "they lived and loved" line is a judgment call only the author can make.
