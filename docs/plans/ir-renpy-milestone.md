# Plan: Ren'Py WASM Port + Engine-Portable Content Contract

## Context

PNK Forever is a personal anniversary visual novel with two engine incarnations so far:
- **v0** — a vanilla-JS "text engine" (archived, read-only)
- **v1** — narrat 3.12.4 (TypeScript VN engine, 5 `.narrat` scripts, 703 lines, 61 labels, 24 choice blocks, 6 easter-egg triggers, sacred-line ending constraint)

**The user's goal is not simply "port to Ren'Py."** It is to establish an
engine-portable foundation so the game can keep being re-rendered in new
engines indefinitely. Two architectural requirements from the user:

1. **Strongly-typed content contract** — JSON Schema / typed IR describing
   characters, scenes (envs/backgrounds), items, mechanics (triggers,
   easter eggs), dialog, and choices. This becomes the **source of truth**;
   every engine (narrat, Ren'Py, future) reads from it.
2. **Specialized engine-migration sub-agents** — each engine has a dedicated
   sub-agent that compiles the IR to that engine's native format and
   validates round-trip fidelity. Migration is a repeatable pipeline, not a
   one-shot rewrite.

First concrete deliverable of that foundation: a **Ren'Py build shipped as
WASM web** (Emscripten-based, served from the same Vercel site alongside v0
and v1-modern), with desktop/mobile as a cheap follow-up since Ren'Py gives
them for free from the same `.rpy` source.

Ren'Py Web is production-ready as of 8.x (CPython + pygame-ce via Emscripten),
ships via the launcher's "Web" build target, works on static hosts without
COOP/COEP, and maps cleanly from narrat's primitives (label/jump/choice/set)
to `.rpy` (label/jump/menu/`$`). Key constraints: 50MB-per-file cap, iOS
Safari audio quirks, `renpy.movie_cutscene()` is the only video path.

## Target architecture

```
             ┌────────────────────────────────┐
             │   content/  (source of truth)   │
             │   - schema/*.schema.json        │
             │   - characters/*.json           │
             │   - scenes/*.json               │
             │   - items/*.json                │
             │   - mechanics/*.json            │
             │   - dialog/*.json  (scene bodies│
             │     + choices + triggers)       │
             └──────────────┬─────────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
   narrat-adapter     renpy-adapter     future-adapter
   (emits .narrat      (emits .rpy       (e.g. bitsy,
    + config.yaml)      + images/audio)   twine, ink, ...)
           │                │
           ▼                ▼
     v1-modern/        v2-renpy/
     (existing)        (new)
```

- `content/` is the contract. Everything else is derived.
- Adapters live under `tools/adapters/<engine>/` and are idempotent:
  re-running regenerates the engine project from IR.
- Assets (images/audio) live under `content/assets/` and are referenced by
  IR; adapters copy/link them into each engine's expected layout.

## Scope of this plan

Phase-gated. Phases 0–2 are the foundation; Phase 3 is the Ren'Py WASM
deliverable. Later phases harden it.

### Phase 0 — Content schema (the contract)

Create `content/schema/` with JSON Schema (draft 2020-12) for:

| Entity | Fields (minimum) |
|---|---|
| **Character** | `id`, `displayName`, `color`, `sprites` (map of pose→path), `narratId` (optional legacy pin), `voice` (reserved) |
| **Scene** (env) | `id`, `background` (path), `music` (optional), `ambientSfx`, `displayName` |
| **Item** | `id`, `name`, `icon`, `acquiredFlag`, `description` |
| **Mechanic** | `id`, `kind` (`easter_egg` \| `keyword_trigger` \| `guard` \| `cascade`), `trigger` (keyword/condition), `effect` (flag-set, emoji, line), `oneShot` (bool) |
| **DialogNode** | `id` (=label), `scene` (ref), `lines[]` (speaker ref + text), `choices[]` (text, guard, next), `next` (unconditional jump), `onEnter` (mechanic refs), `sacred` (bool — sacred-line invariant) |
| **Flag** | `id`, `type` (`bool`\|`int`\|`string`), `default` |

Co-locate a `content/schema/README.md` with worked examples. Validate every
JSON file in `content/` against its schema in CI via `ajv-cli`.

Bake in the existing invariants from `.claude/rules/narrat-no-autoplay-loops.md`
as schema-enforceable constraints where possible (e.g. every choice option
must have either a guard, a forward-only `next`, or a one-shot flag; a node
marked `sacred: true` must have no outgoing choices). Ship a standalone
`tools/ir-lint/` CLI for the ones that can't be pure schema (graph-level
checks like "every label reachable from `start`", "no unguarded self-loops").

### Phase 1 — Extract v1 narrat → IR

One-time extraction, then IR is authoritative. Build
`tools/adapters/narrat/parse.ts` that reads the existing
`v1-modern/src/scripts/*.narrat` + `config.yaml` and emits `content/*.json`.
Review the output by hand; commit the IR.

After extraction, regenerate `v1-modern/` from IR via
`tools/adapters/narrat/emit.ts` and diff against the original — the round-trip
must be byte-identical or have only whitespace/comment differences, otherwise
the schema is missing a field. Fix until round-trip is clean, **then**
delete the original hand-written `.narrat` files and mark v1-modern as
generated.

### Phase 2 — Sub-agents for engine migration

Create four sub-agents under `.claude/agents/`:

1. **`content-architect`** — owns the IR. Given a natural-language request
   ("add a new scene in Osaka"), edits JSON files in `content/` and runs
   `ir-lint`. Never touches engine output directly. Gatekeeper of the
   contract.
2. **`narrat-adapter`** (migration agent for narrat) — given IR, runs
   `tools/adapters/narrat/emit.ts` and validates that `v1-modern/` still
   builds (`npm run build`) and passes the `game-tester` autoplay check.
3. **`renpy-adapter`** (migration agent for Ren'Py) — given IR, runs
   `tools/adapters/renpy/emit.ts`, produces `v2-renpy/game/*.rpy` +
   `options.rpy`, and drives a Ren'Py SDK build of the web target.
4. **`engine-migrator`** (meta-agent) — orchestrator. Spawns the adapter
   agents in parallel, diffs their outputs against the IR, runs
   `game-tester` against each engine build, and files any gaps as GH
   issues labeled `engine-drift`. Kept minimal on day one (two adapters)
   but the scaffolding exists so adding a third engine later is "register
   the adapter agent, done."

Each adapter agent has a checklist in its frontmatter: schema-version pin,
required invariants, smoke-test command, output destination. `game-tester`
(existing, catches autoplay loops) stays the shared ship gate for all
engine outputs — now invoked per-engine by `engine-migrator`.

### Phase 3 — Ren'Py WASM build (the concrete deliverable)

Under `v2-renpy/`:

1. **Ren'Py SDK vendored** (via `tools/renpy-sdk/` download script, pinned
   version — Ren'Py 8.3.x). Not committed; fetched by a setup script.
2. **Adapter emits** `v2-renpy/game/script.rpy` (one file per scene is
   fine), `v2-renpy/game/characters.rpy` (Character() defines),
   `v2-renpy/game/options.rpy` (resolution, save config, persistent keys —
   match v1 where possible so flags carry over is at least considered),
   `v2-renpy/game/easter_eggs.rpy` (mechanic definitions as Python
   functions that fire on flag set).
3. **Asset pipeline** — backgrounds and sprites from `content/assets/`
   converted to WebP (images) where quality allows; copied to
   `v2-renpy/game/images/`. Audio currently empty in v1 config; leave
   structure in place for future.
4. **Web build** — `tools/build-renpy-web.sh` runs the Ren'Py launcher
   headlessly (`renpy.sh launcher distribute v2-renpy --package web`),
   unzips the output into `dist/v2-renpy/`.
5. **Deploy** — extend `v1-modern`'s existing Vercel setup (or add a root
   `vercel.json`) to serve `/v0`, `/v1`, `/v2` subpaths. Confirm `.wasm` is
   served with `application/wasm` MIME (Vercel does this by default). No
   COOP/COEP needed — Ren'Py Web doesn't require SharedArrayBuffer.
6. **Acceptance** — following `~/.claude/rules/release-acceptance-verification.md`:
   claims matrix for v2 covering "all 61 labels reachable", "6 easter
   eggs fire", "sacred line appears exactly once at end", "autoplay
   terminates". File gaps as `release-gap` issues.

### Phase 4 (follow-on, not in this plan) — Desktop/mobile builds

Ren'Py gives Win/Mac/Linux/Android "for free" from the same project. iOS
needs Xcode + Renios. Add a `tools/build-renpy-all.sh` that drives the
launcher for every target. Not part of the initial ship.

## Critical files

**New:**
- `content/schema/{character,scene,item,mechanic,dialog,flag}.schema.json`
- `content/schema/README.md`
- `content/{characters,scenes,items,mechanics,dialog,flags}/*.json`
- `content/assets/{backgrounds,sprites,audio,ui}/…`
- `tools/ir-lint/` (graph-level invariant checker — TypeScript CLI)
- `tools/adapters/narrat/{parse,emit}.ts`
- `tools/adapters/renpy/emit.ts`
- `tools/build-renpy-web.sh`
- `v2-renpy/` (generated; `.gitignore` the SDK download, commit the emitted
  `.rpy` so a fresh clone without the SDK can still diff source)
- `.claude/agents/content-architect.md`
- `.claude/agents/narrat-adapter.md`
- `.claude/agents/renpy-adapter.md`
- `.claude/agents/engine-migrator.md`

**Modified:**
- `v1-modern/src/scripts/*.narrat` — regenerated from IR; mark as generated
  (header comment: "DO NOT EDIT — emitted by tools/adapters/narrat/emit.ts")
- `v1-modern/public/data/config.yaml` — generated from IR
- `vercel.json` (root-level) — route `/v2` to the Ren'Py web build
- `HANDOVER.md` — document the new IR-first workflow; point writers at
  `content-architect`, not `.narrat` files directly
- `.claude/rules/narrat-no-autoplay-loops.md` — add a preamble noting the
  rule still applies but is now enforced at the IR level via `ir-lint`

**Reused (existing, do not rewrite):**
- `.claude/agents/game-tester.md` — the runtime ship gate, now runs against
  any engine output, not just narrat
- `.claude/agents/game-narrative.md` — redirects writer edits through
  `content-architect`
- `HANDOVER.md` sacred constraints — codified as `sacred: true` field on the
  final `DialogNode` in IR, enforced by `ir-lint`

## Verification

End-to-end test of the foundation:

1. **Schema CI**: `ajv validate -s content/schema/*.schema.json -d "content/**/*.json"` passes.
2. **IR lint**: `pnpm ir-lint` passes (all labels reachable, no unguarded
   self-loops, sacred line appears exactly once, every easter-egg keyword
   referenced in dialog).
3. **narrat round-trip**:
   `pnpm adapter:narrat && cd v1-modern && npm run build && bash scripts/handoff/playtest.sh`
   — build succeeds, autoplay terminates, sacred line reached.
4. **game-tester** sub-agent passes on v1-modern (rotating-choice, 6-visit cap).
5. **Ren'Py web build**:
   `bash tools/build-renpy-web.sh` produces `dist/v2-renpy/index.html` +
   `renpy.wasm`. Serve locally with `python3 -m http.server -d dist/v2-renpy`
   → open in Chrome, complete a full autoplay run, verify all 61 labels
   reachable and sacred line fires exactly once.
6. **game-tester** against the Ren'Py web build via a Playwright driver
   (the existing game-tester agent spec mentions Playwright; web target
   is identical to v1-modern from its perspective).
7. **Deploy preview** (Vercel) serves `/v2` — manual smoke: sacred line on
   mobile Safari + desktop Chrome.

## Decisions (confirmed with user)

- **v2 ship scope**: parity with v1-modern (same assets, no audio, 6 easter
  eggs). Prove the pipeline first; polish comes after.
- **Generated files**: committed to git with "DO NOT EDIT — emitted by …"
  headers. Diffs reviewable in PRs; fresh clones readable without the
  toolchain.
- **Directory**: `v2-renpy/` (matches v0/v1 pattern). No move of v0/v1.
- **Day-one sub-agents**: all four — `content-architect`, `narrat-adapter`,
  `renpy-adapter`, `engine-migrator` (meta).
