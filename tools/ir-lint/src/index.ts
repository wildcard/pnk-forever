#!/usr/bin/env tsx
/**
 * ir-lint — validate content/ IR against JSON schemas + graph-level invariants.
 *
 * Exit codes:
 *   0 — clean (or content/ empty; lint is a no-op so it can be wired before Phase 1)
 *   1 — schema violation
 *   2 — graph invariant violation
 *   3 — internal error
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { globSync } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");
const CONTENT_DIR = resolve(REPO_ROOT, "content");
const SCHEMA_DIR = resolve(CONTENT_DIR, "schema");

type Diagnostic = {
  level: "error" | "warn";
  code: string;
  file?: string;
  path?: string;
  message: string;
};

const diags: Diagnostic[] = [];
const err = (d: Omit<Diagnostic, "level">) => diags.push({ level: "error", ...d });
const warn = (d: Omit<Diagnostic, "level">) => diags.push({ level: "warn", ...d });

function loadJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err({ code: "parse-error", file: path, message: (e as Error).message });
    return null;
  }
}

// ---- Schema validation ------------------------------------------------------

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const entities = ["character", "scene", "item", "mechanic", "flag", "dialog"] as const;
type EntityKind = (typeof entities)[number];

for (const name of entities) {
  const schemaPath = resolve(SCHEMA_DIR, `${name}.schema.json`);
  const schema = loadJson(schemaPath);
  if (schema) ajv.addSchema(schema as object, name);
}

const entityDir: Record<EntityKind, string> = {
  character: "characters",
  scene: "scenes",
  item: "items",
  mechanic: "mechanics",
  flag: "flags",
  dialog: "dialog",
};

type LoadedEntity<T = unknown> = { file: string; data: T };
const loaded: Record<EntityKind, LoadedEntity[]> = {
  character: [], scene: [], item: [], mechanic: [], flag: [], dialog: [],
};

for (const kind of entities) {
  const pattern = `${CONTENT_DIR}/${entityDir[kind]}/**/*.json`;
  const files = globSync(pattern, { nodir: true });
  const validate = ajv.getSchema(kind);
  if (!validate) {
    err({ code: "schema-missing", message: `No schema loaded for ${kind}` });
    continue;
  }
  for (const file of files) {
    const data = loadJson(file);
    if (data === null) continue;
    if (!validate(data)) {
      for (const e of validate.errors ?? []) {
        err({
          code: "schema",
          file,
          path: e.instancePath,
          message: `${e.message ?? "invalid"} (${e.keyword})`,
        });
      }
      continue;
    }
    loaded[kind].push({ file, data });
  }
}

// ---- Graph invariants -------------------------------------------------------

type StatementAny = { op: string; [k: string]: unknown };
type DialogNode = {
  id: string;
  scene?: string | null;
  sacred?: boolean;
  statements: StatementAny[];
};

const dialogNodes = loaded.dialog.map((e) => e.data as DialogNode);
const dialogById = new Map(dialogNodes.map((d) => [d.id, d]));

const characterIds = new Set(loaded.character.map((e) => (e.data as { id: string }).id));
const sceneIds = new Set(loaded.scene.map((e) => (e.data as { id: string }).id));
const flagIds = new Set(loaded.flag.map((e) => (e.data as { id: string }).id));
const mechanics = loaded.mechanic.map((e) => e.data as {
  id: string;
  kind: string;
  trigger?: { kind: string; word?: string; nodeId?: string };
  effect?: { kind: string; triggerId?: string };
});

// --- Reachability (from `start` or `main` if present) ---

function collectJumpTargets(stmts: StatementAny[], out: Set<string>): void {
  for (const s of stmts) {
    if (s.op === "jump" && typeof s.target === "string") out.add(s.target);
    if (s.op === "choice" && Array.isArray(s.options)) {
      for (const opt of s.options as { statements: StatementAny[] }[]) {
        collectJumpTargets(opt.statements, out);
      }
    }
    if (s.op === "if") {
      if (Array.isArray(s.then)) collectJumpTargets(s.then as StatementAny[], out);
      if (Array.isArray(s.else)) collectJumpTargets(s.else as StatementAny[], out);
    }
  }
}

if (dialogNodes.length > 0) {
  const entryId = dialogById.has("start") ? "start" : dialogById.has("main") ? "main" : null;
  if (!entryId) {
    warn({ code: "no-entry", message: "No `start` or `main` dialog node found. Reachability check skipped." });
  } else {
    const reached = new Set<string>();
    const queue = [entryId];
    while (queue.length) {
      const id = queue.shift()!;
      if (reached.has(id)) continue;
      reached.add(id);
      const node = dialogById.get(id);
      if (!node) {
        err({ code: "ref-missing-dialog", message: `Jump target \`${id}\` not found in content/dialog/` });
        continue;
      }
      const targets = new Set<string>();
      collectJumpTargets(node.statements, targets);
      for (const t of targets) queue.push(t);
    }
    for (const node of dialogNodes) {
      if (!reached.has(node.id)) {
        warn({ code: "unreachable-dialog", message: `Dialog node \`${node.id}\` is not reachable from \`${entryId}\`` });
      }
    }
  }
}

// --- Entity refs ---

function walkStatements(stmts: StatementAny[], visit: (s: StatementAny) => void): void {
  for (const s of stmts) {
    visit(s);
    if (s.op === "choice" && Array.isArray(s.options)) {
      for (const opt of s.options as { statements: StatementAny[] }[]) {
        walkStatements(opt.statements, visit);
      }
    }
    if (s.op === "if") {
      if (Array.isArray(s.then)) walkStatements(s.then as StatementAny[], visit);
      if (Array.isArray(s.else)) walkStatements(s.else as StatementAny[], visit);
    }
  }
}

for (const node of dialogNodes) {
  if (node.scene && !sceneIds.has(node.scene)) {
    err({ code: "ref-scene", file: node.id, message: `scene \`${node.scene}\` referenced by dialog \`${node.id}\` is not defined` });
  }
  walkStatements(node.statements, (s) => {
    if (s.op === "set_scene" && typeof s.scene === "string" && !sceneIds.has(s.scene)) {
      err({ code: "ref-scene", file: node.id, message: `set_scene target \`${s.scene}\` is not defined` });
    }
    if (s.op === "say" && s.speaker && typeof s.speaker === "string" && !characterIds.has(s.speaker)) {
      err({ code: "ref-character", file: node.id, message: `speaker \`${s.speaker}\` is not a defined character` });
    }
    if (s.op === "set_flag" && typeof s.flag === "string" && !flagIds.has(s.flag)) {
      warn({ code: "ref-flag", file: node.id, message: `flag \`${s.flag}\` set but not defined in content/flags/` });
    }
    if (s.op === "run_trigger" && typeof s.triggerId === "string") {
      const m = mechanics.find((x) => x.effect?.kind === "run_trigger" && x.effect?.triggerId === s.triggerId);
      if (!m) warn({ code: "ref-trigger", file: node.id, message: `run_trigger \`${s.triggerId}\` has no mechanic` });
    }
    if (s.op === "jump" && typeof s.target === "string" && !dialogById.has(s.target)) {
      err({ code: "ref-dialog", file: node.id, message: `jump target \`${s.target}\` is not a defined dialog node` });
    }
  });
}

// Unused item / mechanic warnings
for (const item of loaded.item.map((e) => e.data as { id: string; acquiredFlag: string })) {
  if (!flagIds.has(item.acquiredFlag)) {
    warn({ code: "ref-flag", message: `item \`${item.id}\` references undefined flag \`${item.acquiredFlag}\`` });
  }
}

// --- Sacred line invariant ---

const sacredNodes = dialogNodes.filter((d) => d.sacred === true);
if (sacredNodes.length > 1) {
  for (const s of sacredNodes) {
    err({ code: "sacred-multiple", file: s.id, message: `Multiple sacred nodes defined; only one is allowed.` });
  }
}
for (const s of sacredNodes) {
  const hasChoice = s.statements.some((st) => st.op === "choice");
  const hasJump = s.statements.some((st) => st.op === "jump");
  if (hasChoice) err({ code: "sacred-has-choice", file: s.id, message: `Sacred node \`${s.id}\` must not contain a choice.` });
  if (hasJump) err({ code: "sacred-has-jump", file: s.id, message: `Sacred node \`${s.id}\` must be terminal (no jump).` });
}

// --- No unguarded self-loops (see .claude/rules/narrat-no-autoplay-loops.md) ---

for (const node of dialogNodes) {
  for (const stmt of node.statements) {
    if (stmt.op !== "choice" || !Array.isArray(stmt.options)) continue;
    for (const opt of stmt.options as {
      text: string; guard?: string | null; oneShot?: boolean; statements: StatementAny[];
    }[]) {
      const jumpsBack = opt.statements.some((s) => s.op === "jump" && s.target === node.id);
      if (!jumpsBack) continue;
      const hasGuard = opt.guard !== null && opt.guard !== undefined && opt.guard !== "";
      const hasOneShot = opt.oneShot === true;
      const setsFlagFirst = opt.statements.some((s) => s.op === "set_flag");
      if (!hasGuard && !hasOneShot && !setsFlagFirst) {
        err({
          code: "unguarded-self-loop",
          file: node.id,
          message:
            `Choice option "${opt.text}" jumps back to \`${node.id}\` without a guard, oneShot flag, or set_flag. ` +
            `See .claude/rules/narrat-no-autoplay-loops.md.`,
        });
      }
    }
  }
}

// --- Every keyword mechanic referenced somewhere ---

for (const m of mechanics) {
  if (m.trigger?.kind !== "keyword") continue;
  const triggerId = m.effect?.kind === "run_trigger" ? m.effect.triggerId : m.id;
  const referenced = dialogNodes.some((n) =>
    n.statements.some((s) => s.op === "run_trigger" && s.triggerId === triggerId)
  );
  if (!referenced) {
    warn({ code: "mechanic-orphan", message: `Keyword mechanic \`${m.id}\` is never referenced via run_trigger.` });
  }
}

// ---- Report -----------------------------------------------------------------

const errors = diags.filter((d) => d.level === "error");
const warns = diags.filter((d) => d.level === "warn");

const totalContent = entities.reduce((n, k) => n + loaded[k].length, 0);

function fmt(d: Diagnostic): string {
  const loc = d.file ? `${d.file}${d.path ? `:${d.path}` : ""}` : "<global>";
  return `  [${d.level}] ${d.code}  ${loc}\n      ${d.message}`;
}

if (errors.length) console.error("errors:\n" + errors.map(fmt).join("\n"));
if (warns.length) console.error("warnings:\n" + warns.map(fmt).join("\n"));

console.error(
  `ir-lint: ${totalContent} entities · ${errors.length} error(s) · ${warns.length} warning(s)` +
    (totalContent === 0 ? " (content/ empty — no-op pass)" : ""),
);

process.exit(errors.length ? (errors.some((e) => e.code.startsWith("ref-") || e.code.startsWith("sacred") || e.code.startsWith("unguarded")) ? 2 : 1) : 0);
