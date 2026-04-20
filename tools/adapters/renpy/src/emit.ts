#!/usr/bin/env tsx
/**
 * Emit Ren'Py project (v2-renpy/game/*.rpy) from content/ IR.
 *
 * Produces:
 *   v2-renpy/game/script.rpy           — main label/jump graph
 *   v2-renpy/game/characters.rpy       — Character() defines
 *   v2-renpy/game/options.rpy          — window title, resolution, saves
 *   v2-renpy/game/easter_eggs.rpy      — keyword mechanic hooks
 *   v2-renpy/game/images.rpy           — image tag registrations
 *
 * Ren'Py uses Python-flavored indentation-sensitive syntax. `label X:`
 * declares a label; inside it, quoted strings are narration, `menu:` is a
 * choice, `jump X` jumps, `$ var = value` sets persistent state, and
 * `return` terminates. Our IR maps cleanly.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Character, Scene, DialogNode, Statement, ChoiceOption, Flag, Mechanic,
} from "./ir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../../..");
const CONTENT = resolve(REPO_ROOT, "content");
const V2 = resolve(REPO_ROOT, "v2-renpy");
const GAME = resolve(V2, "game");

const DRY = process.argv.includes("--dry-run");
const HEADER = "# DO NOT EDIT — emitted by tools/adapters/renpy/emit.ts from content/ IR.";

function loadAll<T>(subdir: string): T[] {
  const dir = resolve(CONTENT, subdir);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return files.map((f) => JSON.parse(readFileSync(resolve(dir, f), "utf8")) as T);
}

const characters = loadAll<Character>("characters");
const scenes = loadAll<Scene>("scenes");
const flags = loadAll<Flag>("flags");
const mechanics = loadAll<Mechanic>("mechanics");
const dialog = loadAll<DialogNode>("dialog");
const dialogById = new Map(dialog.map((d) => [d.id, d]));

// ---- helpers ---------------------------------------------------------------

function indent(level: number): string {
  return "    ".repeat(level);
}

function pyString(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// Translate a narrat-style guard expression to Ren'Py Python.
// narrat syntax examples:
//   (== $data.has_shekel false) → not store.has_shekel
//   (!= $data.talked_love true) → not store.talked_love
//   $data.wearing_slippers → store.wearing_slippers
function convertGuard(expr: string): string {
  let e = expr.trim();
  // strip surrounding parens if top-level
  if (e.startsWith("(") && e.endsWith(")")) {
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < e.length - 1; i++) {
      if (e[i] === "(") depth++;
      if (e[i] === ")") depth--;
      if (depth === 0 && i < e.length - 1) { balanced = false; break; }
    }
    if (balanced) e = e.slice(1, -1).trim();
  }
  // $data.x → store.x
  e = e.replace(/\$data\.([a-z_][a-z0-9_]*)/gi, "store.data_$1");
  // (== A B) → A == B
  const m = e.match(/^(==|!=|<=|>=|<|>)\s+(\S+)\s+(.+)$/);
  if (m) return `${m[2]} ${m[1]} ${m[3]}`;
  return e;
}

// ---- emit characters.rpy ----------------------------------------------------

function emitCharacters(): string {
  const lines = [HEADER, ""];
  for (const c of characters) {
    const args: string[] = [pyString(c.displayName)];
    if (c.color) args.push(`color=${pyString(c.color)}`);
    lines.push(`define ${c.id} = Character(${args.join(", ")})`);
  }
  return lines.join("\n") + "\n";
}

// ---- emit images.rpy (scene backgrounds) -----------------------------------

function emitImages(): string {
  const lines = [HEADER, ""];
  for (const sc of scenes) {
    // background tag bg_<id> → images/<bg>.webp (fallback png)
    const base = sc.background.replace(/^img\//, "").replace(/\.(png|webp|jpg)$/i, "");
    lines.push(`image bg ${sc.id} = "images/${base}.webp"`);
  }
  return lines.join("\n") + "\n";
}

// ---- emit options.rpy -------------------------------------------------------

function emitOptions(): string {
  return [
    HEADER,
    "",
    `define config.name = "P&K Forever"`,
    `define gui.show_name = True`,
    `define config.version = "2.0.0"`,
    `define config.save_directory = "pnk-forever-save"`,
    `define config.window_icon = "gui/window_icon.png"`,
    `define config.screen_width = 1280`,
    `define config.screen_height = 720`,
    `define config.has_sound = True`,
    `define config.has_music = True`,
    "",
  ].join("\n");
}

// ---- emit easter_eggs.rpy ---------------------------------------------------

function emitEasterEggs(): string {
  const lines = [HEADER, ""];
  lines.push("# Keyword-triggered easter eggs. Ren'Py has no built-in keyword");
  lines.push("# watch; we expose a `run_trigger(id)` helper that dialog labels");
  lines.push("# call via `$ run_trigger('pnk_mango')` et al.");
  lines.push("");
  lines.push("init python:");
  lines.push("    def run_trigger(trigger_id):");
  lines.push("        # Hook for keyword mechanic effects. Extend per mechanic.");
  lines.push("        pass");
  lines.push("");
  for (const m of mechanics) {
    if (m.trigger?.kind !== "keyword") continue;
    lines.push(`# mechanic: ${m.id} (keyword: ${m.trigger.word})`);
  }
  return lines.join("\n") + "\n";
}

// ---- emit script.rpy (the label graph) -------------------------------------

function emitStatement(s: Statement, level: number): string[] {
  const pad = indent(level);
  switch (s.op) {
    case "say": {
      if (s.speaker) return [`${pad}${s.speaker} ${pyString(s.text)}`];
      return [`${pad}${pyString(s.text)}`];
    }
    case "set_scene":
      return [`${pad}scene bg ${s.scene}`, `${pad}with dissolve`];
    case "set_flag": {
      const v = typeof s.value === "string" ? pyString(s.value) : String(s.value).replace("true", "True").replace("false", "False");
      return [`${pad}$ store.${s.flag.replace(/\./g, "_")} = ${v}`];
    }
    case "jump":
      return [`${pad}jump ${s.target}`];
    case "run_trigger":
      return [`${pad}$ run_trigger(${pyString(s.triggerId)})`];
    case "choice": {
      const out: string[] = [`${pad}menu:`];
      out.push(`${indent(level + 1)}${pyString(s.prompt)}`);
      for (const opt of s.options) out.push(...emitChoiceOption(opt, level + 1));
      return out;
    }
    case "if": {
      const cond = convertGuard(s.condition);
      const out: string[] = [`${pad}if ${cond}:`];
      for (const st of s.then) out.push(...emitStatement(st, level + 1));
      if (s.else && s.else.length) {
        out.push(`${pad}else:`);
        for (const st of s.else) out.push(...emitStatement(st, level + 1));
      }
      return out;
    }
  }
}

function emitChoiceOption(opt: ChoiceOption, level: number): string[] {
  const pad = indent(level);
  // Build menu choice line, optionally with an `if` guard suffix.
  const parts: string[] = [`${pad}${pyString(opt.text)}`];
  const guards: string[] = [];
  if (opt.guard) guards.push(convertGuard(opt.guard));
  if (opt.oneShot) guards.push(`not store._seen_${optHash(opt.text)}`);
  const head = guards.length > 0
    ? `${pad}${pyString(opt.text)} if ${guards.join(" and ")}:`
    : `${parts[0]}:`;
  const out: string[] = [head];
  if (opt.oneShot) {
    out.push(`${indent(level + 1)}$ store._seen_${optHash(opt.text)} = True`);
  }
  for (const st of opt.statements) out.push(...emitStatement(st, level + 1));
  return out;
}

function optHash(text: string): string {
  // deterministic hash for oneShot guard flag names
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function emitLabel(node: DialogNode): string[] {
  const out: string[] = [`label ${node.id}:`];
  if (node.statements.length === 0) {
    out.push(indent(1) + "return");
    return out;
  }
  for (const s of node.statements) out.push(...emitStatement(s, 1));
  if (node.sacred) out.push(indent(1) + "return");
  return out;
}

function emitScript(): string {
  const lines = [HEADER, ""];
  // Flag defaults — Ren'Py init
  lines.push("init python:");
  for (const f of flags) {
    const v = f.type === "bool" ? (f.default ? "True" : "False") :
              typeof f.default === "string" ? pyString(f.default) :
              String(f.default);
    lines.push(`    store.${f.id.replace(/\./g, "_")} = ${v}`);
  }
  lines.push("");
  // Entry point: Ren'Py uses `label start`. Our IR uses `main` or `start`.
  const entry = dialogById.has("start") ? "start" : dialogById.has("main") ? "main" : null;
  if (entry && entry !== "start") {
    lines.push("label start:");
    lines.push(`    jump ${entry}`);
    lines.push("");
  }
  for (const n of dialog) {
    lines.push(...emitLabel(n));
    lines.push("");
  }
  return lines.join("\n");
}

// ---- write ------------------------------------------------------------------

const outputs: Array<[string, string]> = [
  ["characters.rpy", emitCharacters()],
  ["images.rpy", emitImages()],
  ["options.rpy", emitOptions()],
  ["easter_eggs.rpy", emitEasterEggs()],
  ["script.rpy", emitScript()],
];

if (DRY) {
  for (const [name, body] of outputs) {
    console.log(`--- ${name} ---\n${body}`);
  }
} else {
  mkdirSync(GAME, { recursive: true });
  for (const [name, body] of outputs) {
    writeFileSync(resolve(GAME, name), body, "utf8");
  }
}

console.log("renpy-emit:", JSON.stringify({
  characters: characters.length,
  scenes: scenes.length,
  flags: flags.length,
  mechanics: mechanics.length,
  labels: dialog.length,
  files: outputs.length,
  dry: DRY,
}));
