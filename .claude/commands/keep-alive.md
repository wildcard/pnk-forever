---
description: Pick one productive improvement to PNK Forever and ship it end-to-end (bug fix, content, art, UI, narrative). Never lets the game go stale.
argument-hint: [optional focus area — 'bugs' | 'art' | 'ui' | 'story' | 'ai']
---

# /keep-alive — The living-gift routine

PNK Forever is an anniversary gift. A gift stops being alive the moment
maintenance stops. This command is the **scheduled heartbeat** — run it any
time and it will pick one productive improvement and drive it end-to-end
through the existing sub-agents, commit it, and open a PR.

**Pre-flight:** read `HANDOVER.md` sacred constraints. Read
`.claude/rules/narrat-no-autoplay-loops.md`. Do not push to a branch other
than the user's anniversary branch unless explicitly invited to.

---

## The portfolio (priority order)

Each iteration, pick **one** item from the portfolio. Favour earlier items
when in doubt — bug fixes outrank polish. If an argument is supplied
(`bugs`, `art`, `ui`, `story`, `ai`), restrict the pick to that category.

### 1. `bugs` — fix known regressions (highest priority)

Before anything else, dispatch the `game-tester` sub-agent with the
rotating-choice strategy on all 5 chapters. Any failing acceptance criterion
from `HANDOVER.md §10` is a blocker; fix before shipping anything else.

Typical bug classes to watch for:
- Autoplay loops (cascade missing a guard — see `.claude/rules/narrat-no-autoplay-loops.md`)
- Missing sprites (`console: Failed to load …/img/…`)
- Sacred-line misses ("For Anastasia. Forever." must appear exactly once)
- Easter-egg keywords silently dropped from dialog edits

### 2. `story` — richer narrative

Dispatch `game-narrative` to improve pacing or voice in **one** specific
scene — not the whole game in a single pass. Good targets:
- A scene flagged by `game-tester` as "dialog repeating" or "too dense"
- A scene whose keyword coverage is lean (grep for the 18 sacred keywords
  and pick the scene with the fewest)
- A transition that reads abruptly (first line of the scene lands with no
  emotional bridge from the previous one)

Always re-run `game-tester` after. Never edit a `.narrat` file without also
re-reading the loop-invariant rule.

### 3. `art` — fill visual gaps

Dispatch `art-director` (orchestrator). It will either:
- Plan new illustrations and delegate actual generation to `game-artist`
  (Gemini nano banana), OR
- Refresh an existing prompt manifest if the art style has drifted.

Targets: any `public/img/` background missing a sprite, or any scene
flagged as "visual stub" in `game-tester` reports.

### 4. `ui` — chrome polish

Dispatch `game-ui-artist`. Prefers SVG over bitmap. Good small wins:
- Button-prompt keycaps that look bitmap-stretched
- Choice buttons that feel placeholder-y
- Dialog box missing a subtle reading-rhythm cue
- Transitions between scenes that are hard cuts

### 5. `ai` — AI NPC experiments (gated, optional)

The game has an experimental AI NPC plugin
(`v1-modern/src/plugins/ai-npc-plugin.ts`). When `?ai=1` is in the URL,
scripted scenes can use:

```narrat
ai_say k idle "Prompt text for K. to riff on."
```

…and narrat will inject a live line from a free OpenRouter model
(`z-ai/glm-4.5-air:free` primary, `openai/gpt-oss-20b:free` fallback).

Possible AI-category iterations:
- Write a new `ai_demo_*` scene that exercises a different mood
- Tune the `SYSTEM_PROMPT` in the plugin to hit a specific keyword density
- Add a second AI-only chapter reachable via `ai_demo_route`
- Swap primary/fallback models based on current OpenRouter availability

**AI is never a shipping dependency.** If the OpenRouter account's privacy
toggle is off (see plugin file for the gotcha), the plugin falls back to
canned lines and the game still plays clean.

---

## The cadence (every iteration)

1. **Check what's open.** `git status` clean? On the anniversary branch or a
   feature branch off it? Any `release-gap`-labelled issues unresolved?
2. **Run the baseline check.** `cd v1-modern && npm run build` then either
   dispatch `game-tester` (preferred) or run
   `bash scripts/handoff/playtest.sh` (legacy autoplay).
3. **Pick one portfolio item.** Use the optional arg if supplied; else pick
   the highest priority that has a concrete actionable target today. If
   nothing is actionable, stop — a no-op iteration is better than busywork.
4. **Dispatch the right sub-agent** (see portfolio above). Don't duplicate
   its work; its prompt already knows the constraints.
5. **Re-verify.** Rebuild. Re-run `game-tester`. Every `HANDOVER.md §10`
   criterion green.
6. **Commit.** Conventional commits, Co-Authored-By per
   `~/.claude/rules/git-commit-rules.md`. Narrow scope.
7. **Open a PR.** `gh pr create` off main. Body uses the anniversary tone.
   Don't merge unless the user invited you to; leave the review open.

---

## Stop conditions

Do **NOT** proceed if any of these are true — stop and surface to the user:

- `game-tester` reports a loop, a missing sprite, or a sacred-line break
  and you can't fix it in the same iteration.
- An AI-category experiment would require mutating the privacy setting on
  the user's OpenRouter account. That's out of bounds; tell them.
- A narrative edit would change the meaning of a story beat
  (`.claude/agents/game-narrative.md` lists the canonical beats).
- Any change would touch `v0-original-text-engine/` source — never modify
  the original game engine (see HANDOVER sacred constraints).

---

## Never

- Never ship a PR with a loop regression. Run the diagnostic grep from
  `.claude/rules/narrat-no-autoplay-loops.md`.
- Never commit `.env.local` or any secret.
- Never remove the sacred line.
- Never generate images yourself — always go through `art-director` →
  `game-artist`.
- Never batch three portfolio items into one PR. One heartbeat = one
  cohesive change.
