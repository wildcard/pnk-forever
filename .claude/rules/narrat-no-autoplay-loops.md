# Narrat — No Autoplay Loops

**APPLIES TO:** every `.narrat` file under `v1-modern/src/scripts/`.
**ENFORCED BY:** the `game-tester` sub-agent (ship gate).
**CODIFIED AFTER:** the `kyoto_apt_choice` slippers-loop regression — see
`japan.narrat` commit history.

Read this file before editing any `.narrat` `choice:` block.

---

## The invariant

Every `choice:` block in a `.narrat` file must **terminate under autoplay**
(first-option-always strategy) **and** under the `game-tester` rotating-choice
strategy (visit N picks option N). A choice block is a loop-risk if any of its
options `jump`s back to the parent label, directly or via a sub-label.

A build ships only when this invariant holds for every choice block. The
runtime enforcer is the `game-tester` sub-agent, which caps any single prompt
at 6 visits; the preventive enforcer is this rule plus the diagnostic grep
below.

---

## The three safe patterns

Pick one. If a choice option doesn't fit any of these, it's a bug.

### (a) Cascade via guard — the canonical idiom

The looping option jumps to a **sub-label**; the sub-label's first statement
is `if $data.<flag>: jump <next_topic>`; the body sets the flag and returns
to the parent choice. Visit N+1 fires the guard and jumps forward to the next
uncovered topic, never back to the option that was already taken.

Canonical example — `japan.narrat:kitchen_conversation`:

```narrat
kitchen_conversation:
  choice:
    "What do you want to talk about or do?"
    "What're you MAKING?":
      jump talk_making
    "I LOVE you":
      jump talk_love
    # ... more topics ...

talk_making:
  if $data.talked_making:
    jump talk_love           # cascade to next uncovered topic
  talk k idle "DIM SUM. Your favorite. Almost ready."
  set data.talked_making true
  jump kitchen_conversation

talk_love:
  if $data.talked_love:
    jump take_chopsticks     # cascade further
  talk k idle "I LOVE you too. Always."
  set data.talked_love true
  jump kitchen_conversation
```

On visit N+1, autoplay still picks option 1 but the guard immediately jumps
forward. The chain eventually exits the choice block entirely.

### (b) Monotonic advance

The option body sets a flag and jumps to a **different** label (not the
parent). Used for one-shots that chain forward naturally.

```narrat
"The sun is going down. Want to CONTINUE to the sunset?":
  set data.can_go_sunset true
  jump sunset_scene              # forward, never back to beach_choice
```

### (c) No self-jump

The option jumps forward only. No flag, no loop. Used for pure navigation.

```narrat
"Go east to the kitchen":
  jump go_kitchen                # one-way
```

---

## The four loop-smells (reject in review)

1. **Unguarded set-and-return.** Option body: `set data.x true` then `jump
   <parent_label>` with **no guard** checking `data.x` at the top of the
   body. Autoplay sets the flag, returns, picks the same option, sets the
   same flag, loops forever.

   *Example of the bug this rule was written for:*
   ```narrat
   kyoto_apt_choice:
     choice:
       "What do you want to do?"
       "Use the slippers Uwabaki":
         "You slip into your uwabaki — SLIPPERS."   # ← first-option autoplay hits this
         set data.wearing_slippers true
         jump kyoto_apt_choice                       # ← and returns here, forever
   ```
   *Fix:* extract the body to a sub-label with a guard (pattern (a) above).

2. **Terminal scene with self-jump.** The final scene (today
   `japan.narrat:home_scene`) whose choice block jumps to itself. The sacred
   line must appear **exactly once** and the scene must terminate cleanly —
   either reach a label with no jump and no choice (narrat will render an
   end-of-game state), or jump to `main` to restart.

   *Fix:* drop the trailing `choice:` block and let the label end after the
   sacred line. Narrat's runtime handles end-of-game.

3. **"Stay here" / "Back" / "Look at X" flavor options that self-jump with no
   flag change.** Even if autoplay's first-option rule doesn't hit them, the
   `game-tester` rotating strategy will eventually pick them, and they'll
   cycle visibly.

   *Fix:* either promote the option to pattern (b) by advancing the scene, or
   add a cascade guard so the Nth visit jumps forward.

4. **Choice block with more than 6 options.** The `game-tester` caps any
   single label at 6 visits (rotating strategy picks option N on visit N).
   A `choice:` block with 7+ options will be visited more than 6 times before
   all paths are covered, triggering the cap and halting the test.

   *Fix:* add a pre-choice guard at the top of the label that cascades past
   the choice block once enough topics are covered, reducing the effective
   visit count below the cap.

   *Example — `japan.narrat:kitchen_conversation` (8 options):*
   ```narrat
   kitchen_conversation:
     if $data.has_necklace:
       jump use_necklace
     if $data.talked_zodiac:        # ← guard added per issue #40
       jump talk_future             # cascades past the 8-option choice block
     talk k idle "What would you like to know?"
     choice:
       ...
   ```
   The guard fires after the 6th conversational topic (`talk_zodiac`) is
   reached, so the label is never rendered more than 6 times.

---

## Diagnostic grep (run before every commit)

Find every self-jump in one line:

```bash
for f in v1-modern/src/scripts/*.narrat; do
  awk '
    /^[a-z_][a-z_0-9]*:$/ { label=$1; sub(/:$/, "", label); next }
    /^[[:space:]]+jump [a-z_]/ {
      match($0, /jump [a-z_][a-z_0-9]*/)
      target = substr($0, RSTART+5, RLENGTH-5)
      if (target == label) print FILENAME":"NR": "label" self-jumps: "$0
    }
  ' "$f"
done
```

Every hit must be verifiable against patterns (a), (b), or (c) above. Any
unjustified hit is a release-blocking bug; file it as a GitHub issue with
label `loop-risk`.

---

## Special case: the sacred line

`japan.narrat:home_scene` ends with `"For Anastasia. Forever."` — **never**
add a `choice:` block or `jump` after that line that returns to the same
label. The sacred line appears exactly once. See `HANDOVER.md` sacred
constraints.

---

## Ship gate

- Legacy single-path playtest: `bash scripts/handoff/playtest.sh`
  (first-option autoplay; catches smell #1 and #2).
- Full beta pass: dispatch the `game-tester` sub-agent
  (`.claude/agents/game-tester.md`) — rotating-choice strategy, 6-visit cap;
  catches smell #3.

Both must pass before pushing to `claude/anniversary-game-vp0Vp`.

---

## See also

- `.claude/agents/game-narrative.md` — writer workflow; references this rule.
- `.claude/agents/game-tester.md` — runtime enforcer.
- `HANDOVER.md` §8 — narrat syntax cheatsheet; points here.
- Canonical cascade: `v1-modern/src/scripts/japan.narrat` labels
  `talk_making` → `talk_love` → `take_chopsticks` → `eat_dumplings` →
  `talk_tiger` → `talk_zodiac` → `talk_future`.
