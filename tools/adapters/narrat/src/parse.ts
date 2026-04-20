#!/usr/bin/env tsx
/**
 * Parse narrat project (v1-modern/src/scripts/*.narrat + public/data/config.yaml)
 * into content/ IR JSON files.
 *
 * Usage:
 *   npm run parse                    # from tools/adapters/narrat/
 *   tsx src/parse.ts [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type {
  Character, Scene, Flag, Item, Mechanic, DialogNode, Statement, ChoiceOption,
} from "./ir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../../..");
const V1_SCRIPTS = resolve(REPO_ROOT, "v1-modern/src/scripts");
const V1_CONFIG = resolve(REPO_ROOT, "v1-modern/public/data/config.yaml");
const CONTENT = resolve(REPO_ROOT, "content");

const DRY = process.argv.includes("--dry-run");

// ---- YAML config → characters / scenes --------------------------------------

type YamlConfig = {
  common?: {
    images?: Record<string, string>;
  };
  screens?: {
    screens?: Record<string, { background?: string }>;
  };
  characters?: {
    config?: { imagesPath?: string };
    characters?: Record<string, {
      name?: string;
      style?: { color?: string };
      sprites?: Record<string, string>;
    }>;
  };
  audio?: unknown;
};

const cfg = yaml.load(readFileSync(V1_CONFIG, "utf8")) as YamlConfig;

const characters: Character[] = [];
for (const [id, c] of Object.entries(cfg.characters?.characters ?? {})) {
  characters.push({
    id,
    displayName: c.name ?? "",
    color: c.style?.color,
    sprites: c.sprites,
    narratId: id,
  });
}

const scenes: Scene[] = [];
const images = cfg.common?.images ?? {};
for (const [id, screen] of Object.entries(cfg.screens?.screens ?? {})) {
  const bgId = screen.background ?? id;
  const bgPath = images[bgId] ?? `img/${bgId}.png`;
  scenes.push({
    id,
    background: bgPath,
    music: null,
    ambientSfx: null,
  });
}

// ---- narrat → dialog nodes --------------------------------------------------

type Line = { raw: string; content: string; indent: number; lineNo: number; file: string };

function tokenize(file: string, src: string): Line[] {
  const out: Line[] = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    if (/^\s*$/.test(raw)) return;
    if (/^\s*#/.test(raw)) return;
    const m = raw.match(/^(\s*)(.*)$/);
    if (!m) return;
    const spaces = m[1].replace(/\t/g, "  ").length;
    out.push({ raw, content: m[2], indent: spaces, lineNo: i + 1, file });
  });
  return out;
}

/** Parse a value literal after `set data.flag VALUE` */
function parseFlagValue(raw: string): boolean | number | string {
  const t = raw.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d*\.\d+$/.test(t)) return parseFloat(t);
  // strip surrounding quotes if any
  const q = t.match(/^"(.*)"$/);
  return q ? q[1] : t;
}

/** Extract quoted string payload: "text" → text; "" → "" */
function unquote(s: string): string | null {
  const m = s.match(/^"((?:[^"\\]|\\.)*)"\s*:?\s*$/);
  if (!m) return null;
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

/** True if line ends with `:` (label / choice option / if / else / choice) */
function isBlockHeader(s: string): boolean {
  return /:\s*$/.test(s);
}

function parseLabelBody(lines: Line[], baseIndent: number, cursor: { i: number }): Statement[] {
  const stmts: Statement[] = [];
  while (cursor.i < lines.length) {
    const ln = lines[cursor.i];
    if (ln.indent < baseIndent) break;
    if (ln.indent > baseIndent) {
      throw new Error(`${ln.file}:${ln.lineNo}: unexpected over-indent ${ln.indent} > ${baseIndent}`);
    }
    stmts.push(parseStatement(lines, cursor));
  }
  return stmts;
}

function parseStatement(lines: Line[], cursor: { i: number }): Statement {
  const ln = lines[cursor.i];
  const c = ln.content;

  // say — bare quoted string
  const bare = unquote(c);
  if (bare !== null && !c.endsWith(":")) {
    cursor.i++;
    return { op: "say", speaker: null, text: bare };
  }

  // tokens
  const head = c.split(/\s+/, 1)[0];
  const rest = c.slice(head.length).trim();

  switch (head) {
    case "set_screen": {
      cursor.i++;
      return { op: "set_scene", scene: rest };
    }
    case "jump": {
      cursor.i++;
      return { op: "jump", target: rest };
    }
    case "return": {
      // narrat's `return` is uncommon here; treat as implicit end
      cursor.i++;
      return { op: "jump", target: "__return__" };
    }
    case "set": {
      // `set data.X VALUE`
      const m = rest.match(/^(\S+)\s+(.*)$/);
      if (!m) throw new Error(`${ln.file}:${ln.lineNo}: malformed set: ${ln.raw}`);
      cursor.i++;
      return { op: "set_flag", flag: m[1], value: parseFlagValue(m[2]) };
    }
    case "run": {
      // e.g. `run trigger_easter_egg pnk_mango`
      const m = rest.match(/^trigger_easter_egg\s+(\S+)/);
      if (m) {
        cursor.i++;
        return { op: "run_trigger", triggerId: m[1] };
      }
      throw new Error(`${ln.file}:${ln.lineNo}: unsupported run: ${rest}`);
    }
    case "talk": {
      // `talk <char> <pose> "text"`
      const m = c.match(/^talk\s+(\S+)\s+(\S+)\s+"((?:[^"\\]|\\.)*)"\s*$/);
      if (!m) throw new Error(`${ln.file}:${ln.lineNo}: malformed talk: ${ln.raw}`);
      cursor.i++;
      return { op: "say", speaker: m[1], pose: m[2], text: m[3].replace(/\\"/g, '"') };
    }
    case "choice:": {
      cursor.i++;
      return parseChoice(lines, cursor, ln.indent + 2);
    }
    case "if": {
      return parseIf(lines, cursor);
    }
  }

  // Trailing single-word directives like `choice:` matched above; `if …:` handled via head="if".
  // Fallback: unknown statement — record and advance
  throw new Error(`${ln.file}:${ln.lineNo}: unknown statement: ${ln.raw}`);
}

function parseChoice(lines: Line[], cursor: { i: number }, bodyIndent: number): Statement {
  // First body line is the prompt (quoted string). Subsequent lines are option headers.
  const first = lines[cursor.i];
  if (!first || first.indent !== bodyIndent) {
    throw new Error(`${(first ?? lines[cursor.i - 1]).file}:${(first ?? lines[cursor.i - 1]).lineNo}: expected choice prompt`);
  }
  const prompt = unquote(first.content);
  if (prompt === null || first.content.endsWith(":")) {
    throw new Error(`${first.file}:${first.lineNo}: choice prompt must be bare quoted string`);
  }
  cursor.i++;

  const options: ChoiceOption[] = [];
  while (cursor.i < lines.length && lines[cursor.i].indent === bodyIndent) {
    const opt = lines[cursor.i];
    const optText = unquote(opt.content);
    if (optText === null) throw new Error(`${opt.file}:${opt.lineNo}: expected choice option (quoted string ending in :)`);
    cursor.i++;
    const body = parseLabelBody(lines, bodyIndent + 2, cursor);
    options.push({ text: optText, statements: body });
  }
  return { op: "choice", prompt, options };
}

function parseIf(lines: Line[], cursor: { i: number }): Statement {
  const ln = lines[cursor.i];
  // `if <cond>:`
  const m = ln.content.match(/^if\s+(.*):\s*$/);
  if (!m) throw new Error(`${ln.file}:${ln.lineNo}: malformed if: ${ln.raw}`);
  const condition = m[1].trim();
  cursor.i++;
  const then = parseLabelBody(lines, ln.indent + 2, cursor);
  let els: Statement[] | undefined;
  if (cursor.i < lines.length && lines[cursor.i].indent === ln.indent && lines[cursor.i].content === "else:") {
    cursor.i++;
    els = parseLabelBody(lines, ln.indent + 2, cursor);
  }
  return { op: "if", condition, then, ...(els ? { else: els } : {}) };
}

function parseNarrat(file: string): DialogNode[] {
  const src = readFileSync(file, "utf8");
  const lines = tokenize(file, src);
  const nodes: DialogNode[] = [];
  const cursor = { i: 0 };
  const sourceFile = file.split("/").pop()!.replace(/\.narrat$/, "");

  while (cursor.i < lines.length) {
    const head = lines[cursor.i];
    if (head.indent !== 0) throw new Error(`${head.file}:${head.lineNo}: expected label at column 0`);
    const labelMatch = head.content.match(/^([a-z_][a-z0-9_]*):$/);
    const triggerMatch = head.content.match(/^trigger_[a-z_]+\s+[a-z_][a-z0-9_]*:$/);
    if (triggerMatch) {
      // Skip narrat trigger-function definitions (e.g. `trigger_easter_egg event_name:`).
      // These are runtime hooks mirrored in content/mechanics/; no dialog IR node needed.
      cursor.i++;
      parseLabelBody(lines, 2, cursor);
      continue;
    }
    if (!labelMatch) throw new Error(`${head.file}:${head.lineNo}: expected label declaration, got: ${head.raw}`);
    const id = labelMatch[1];
    cursor.i++;
    const statements = parseLabelBody(lines, 2, cursor);
    nodes.push({ id, scene: null, sacred: false, sourceFile, statements });
  }
  return nodes;
}

// ---- Collect all --------------------------------------------------

const narratFiles = readdirSync(V1_SCRIPTS).filter((f) => f.endsWith(".narrat")).sort();
const dialog: DialogNode[] = [];
for (const f of narratFiles) {
  const nodes = parseNarrat(resolve(V1_SCRIPTS, f));
  dialog.push(...nodes);
}

// Mark the sacred node (home_scene ending with "For Anastasia. Forever.")
for (const node of dialog) {
  const last = node.statements[node.statements.length - 1];
  if (
    last &&
    last.op === "say" &&
    typeof last.text === "string" &&
    /For Anastasia\.?\s*Forever\.?/i.test(last.text)
  ) {
    node.sacred = true;
  }
}

// ---- Infer oneShot on unguarded self-loop flavor options ------------------
// narrat source uses bare "Look at X" options that narrate and return to the
// parent label. Under first-option autoplay this loops forever; the game-tester
// rotating strategy eventually escapes. The narrat-no-autoplay-loops rule
// demands either guard/oneShot/set_flag. Mark flavor options (body has say,
// no set_flag, jumps back to parent) as oneShot so the IR is well-formed and
// the emitter can translate to narrat's cascade-via-sub-label pattern.
function inferOneShot(node: DialogNode): void {
  for (const s of node.statements) {
    if (s.op !== "choice") continue;
    for (const opt of s.options) {
      if (opt.oneShot || (opt.guard != null && opt.guard !== "")) continue;
      const jumpsBack = opt.statements.some((x) => x.op === "jump" && x.target === node.id);
      if (!jumpsBack) continue;
      const setsFlag = opt.statements.some((x) => x.op === "set_flag");
      if (setsFlag) continue;
      opt.oneShot = true;
    }
  }
}
for (const node of dialog) inferOneShot(node);

// ---- Flags (infer from set_flag statements) --------------------------------

const flagMap = new Map<string, Flag>();
function collectFlags(stmts: Statement[]): void {
  for (const s of stmts) {
    if (s.op === "set_flag") {
      if (!flagMap.has(s.flag)) {
        const type = typeof s.value === "boolean" ? "bool" : typeof s.value === "number" ? "int" : "string";
        flagMap.set(s.flag, { id: s.flag, type, default: typeof s.value === "boolean" ? false : s.value });
      }
    }
    if (s.op === "choice") {
      for (const o of s.options) collectFlags(o.statements);
    }
    if (s.op === "if") {
      collectFlags(s.then);
      if (s.else) collectFlags(s.else);
    }
  }
}
for (const node of dialog) collectFlags(node.statements);
const flags = [...flagMap.values()].sort((a, b) => a.id.localeCompare(b.id));

// ---- Mechanics (from run_trigger statements + known keywords) --------------

// Known keyword list from v1 — see HANDOVER and sunset/jaffa/japan narrats
const KEYWORDS: Record<string, string> = {
  pnk_mango: "MANGO",
  pnk_drink: "TEA",
  pnk_chocolate: "CHOCOLATE",
  pnk_kite: "KITE",
  pnk_love: "LOVE",
  pnk_fly: "FLY",
};

const seenTriggers = new Set<string>();
function collectTriggers(stmts: Statement[]): void {
  for (const s of stmts) {
    if (s.op === "run_trigger") seenTriggers.add(s.triggerId);
    if (s.op === "choice") for (const o of s.options) collectTriggers(o.statements);
    if (s.op === "if") {
      collectTriggers(s.then);
      if (s.else) collectTriggers(s.else);
    }
  }
}
for (const node of dialog) collectTriggers(node.statements);

const mechanics: Mechanic[] = [];
for (const [triggerId, word] of Object.entries(KEYWORDS)) {
  mechanics.push({
    id: triggerId,
    kind: "easter_egg",
    trigger: { kind: "keyword", word, caseInsensitive: true },
    effect: { kind: "run_trigger", triggerId },
    oneShot: true,
  });
}
// Any run_trigger not covered above → warn (not used yet) — add stub entries
for (const t of seenTriggers) {
  if (!mechanics.some((m) => m.effect?.kind === "run_trigger" && m.effect.triggerId === t)) {
    mechanics.push({
      id: t, kind: "easter_egg",
      effect: { kind: "run_trigger", triggerId: t },
      oneShot: true,
    });
  }
}

// ---- Items (heuristic — scan for set data.has_X / acquired) ----------------

const items: Item[] = [];
for (const flag of flags) {
  const m = flag.id.match(/^data\.has_(.+)$/);
  if (!m) continue;
  items.push({
    id: m[1],
    name: m[1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    acquiredFlag: flag.id,
    icon: null,
  });
}

// ---- Write IR ---------------------------------------------------------------

function writeEntity(dir: string, id: string, data: unknown): void {
  const path = resolve(CONTENT, dir, `${id.replace(/\./g, "_")}.json`);
  const body = JSON.stringify(data, null, 2) + "\n";
  if (DRY) {
    console.log(`[dry] ${path} (${body.length} bytes)`);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}

for (const c of characters) writeEntity("characters", c.id, c);
for (const s of scenes) writeEntity("scenes", s.id, s);
for (const f of flags) writeEntity("flags", f.id, f);
for (const m of mechanics) writeEntity("mechanics", m.id, m);
for (const i of items) writeEntity("items", i.id, i);
for (const d of dialog) writeEntity("dialog", d.id, d);

const counts = {
  characters: characters.length,
  scenes: scenes.length,
  flags: flags.length,
  items: items.length,
  mechanics: mechanics.length,
  dialog: dialog.length,
};
console.error(`parse: ${JSON.stringify(counts)}${DRY ? " (dry)" : ""}`);
