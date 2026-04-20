# Content IR — Schema Reference

This directory defines the **typed content contract** for PNK Forever.
All narrative data lives under `content/` and is the **source of truth** for
every engine (narrat v1, Ren'Py v2, future). Engine adapters under
`tools/adapters/<engine>/` compile this IR down to each engine's native
project format.

**Do not edit engine-specific files** (e.g. `v1-modern/src/scripts/*.narrat`,
`v2-renpy/game/*.rpy`) by hand — they are regenerated from the IR.

See [`docs/plans/ir-renpy-milestone.md`](../../docs/plans/ir-renpy-milestone.md)
for the wider architecture plan.

## Entity types

| Schema | Lives in | Purpose |
|---|---|---|
| [character.schema.json](./character.schema.json) | `content/characters/*.json` | Speakers (name, color, sprite poses) |
| [scene.schema.json](./scene.schema.json) | `content/scenes/*.json` | Environments (background, music, ambient sfx) |
| [item.schema.json](./item.schema.json) | `content/items/*.json` | Inventory-like acquisitions |
| [mechanic.schema.json](./mechanic.schema.json) | `content/mechanics/*.json` | Easter eggs, keyword triggers, guards, cascades |
| [flag.schema.json](./flag.schema.json) | `content/flags/*.json` | Tracked runtime state |
| [dialog.schema.json](./dialog.schema.json) | `content/dialog/*.json` | Dialog nodes (labels) with ordered statements |

## Worked examples

### Character — `content/characters/phoenix.json`

```json
{
  "id": "phoenix",
  "displayName": "Phoenix",
  "color": "#FF6B35",
  "sprites": { "idle": "phoenix.png" },
  "narratId": "phoenix"
}
```

### Scene — `content/scenes/beach.json`

```json
{
  "id": "beach",
  "displayName": "Tel Aviv Beach",
  "background": "backgrounds/beach.png",
  "music": null,
  "ambientSfx": null
}
```

### Item — `content/items/shekel.json`

```json
{
  "id": "shekel",
  "name": "Shekel",
  "icon": null,
  "acquiredFlag": "data.has_shekel",
  "description": "A coin on the beach."
}
```

### Mechanic (easter egg) — `content/mechanics/pnk_mango.json`

```json
{
  "id": "pnk_mango",
  "kind": "easter_egg",
  "trigger": { "kind": "keyword", "word": "MANGO", "caseInsensitive": true },
  "effect": { "kind": "run_trigger", "triggerId": "pnk_mango" },
  "oneShot": true,
  "description": "🥭 Mango — a sunset-walk easter egg."
}
```

### Flag — `content/flags/knows_name.json`

```json
{
  "id": "data.knows_name",
  "type": "bool",
  "default": false,
  "description": "True once K. has told you his name."
}
```

### DialogNode — `content/dialog/beach_scene.json`

```json
{
  "id": "beach_scene",
  "scene": "beach",
  "sacred": false,
  "statements": [
    { "op": "set_scene", "scene": "beach" },
    { "op": "say", "text": "Sand, warm under your feet. The sea hisses in." },
    { "op": "say", "text": "The dog is here, his Brompton folded neatly beside him." },
    { "op": "set_flag", "flag": "data.knows_name",     "value": false },
    { "op": "set_flag", "flag": "data.has_shekel",     "value": false },
    { "op": "jump", "target": "beach_choice" }
  ]
}
```

### DialogNode with a choice — `content/dialog/beach_choice.json`

```json
{
  "id": "beach_choice",
  "scene": "beach",
  "sacred": false,
  "statements": [
    {
      "op": "choice",
      "prompt": "What do you want to do on the beach?",
      "options": [
        { "text": "Talk to the dog", "guard": null, "statements": [ { "op": "jump", "target": "talk_to_k" } ] },
        { "text": "Try to go south", "guard": null, "statements": [ { "op": "jump", "target": "try_go_sunset" } ] },
        { "text": "Take the shekel", "guard": "!data.has_shekel", "statements": [ { "op": "jump", "target": "take_shekel" } ] },
        { "text": "Look at the beach", "oneShot": true, "statements": [
            { "op": "say", "text": "Wide sand, turquoise water. Tel Aviv in gentle chaos behind you." },
            { "op": "jump", "target": "beach_choice" }
        ] }
      ]
    }
  ]
}
```

### Sacred terminal node — `content/dialog/home_scene.json`

```json
{
  "id": "home_scene",
  "scene": "home",
  "sacred": true,
  "statements": [
    { "op": "set_scene", "scene": "home" },
    { "op": "say", "speaker": "game", "text": "For Anastasia. Forever." }
  ]
}
```

A `sacred: true` node **must not** contain any `choice` statements (enforced
by `dialog.schema.json`) and must appear exactly once in the reachability
graph (enforced by `tools/ir-lint/`).

## Invariants

The schemas enforce what they can. Graph-level invariants are checked by
`tools/ir-lint/`:

| Invariant | Enforced by |
|---|---|
| Every field is the right type / required fields present | JSON Schema |
| Sacred node has no choices | JSON Schema (`allOf.if` on `dialog.schema.json`) |
| Every label reachable from the `start` node | `ir-lint` |
| No unguarded self-loops in choice blocks | `ir-lint` (see [narrat-no-autoplay-loops.md](../../.claude/rules/narrat-no-autoplay-loops.md)) |
| Sacred line appears exactly once and is terminal | `ir-lint` |
| Every keyword mechanic is referenced in some dialog | `ir-lint` |
| Every character / scene / item id referenced in dialog exists | `ir-lint` |

## Validation

```bash
# Schema validation (once ir-lint is wired up in #19)
npm run ir-lint
```

Until ir-lint lands, you can validate ad-hoc with any JSON Schema 2020-12
validator (e.g. `ajv-cli`).

## Changelog

- **v0.1 (2026-04-20)** — initial schema. Six entity types. Statement model
  covers `say`, `set_scene`, `set_flag`, `jump`, `choice`, `if`, `run_trigger`.
  Invariants enforced: sacred-no-choices (schema), rest pending ir-lint.
