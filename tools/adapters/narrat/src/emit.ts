#!/usr/bin/env tsx
/**
 * Emit narrat project (v1-modern/src/scripts/*.narrat + public/data/config.yaml)
 * from content/ IR JSON files.
 *
 * Usage:
 *   npm run emit                     # from tools/adapters/narrat/
 *   tsx src/emit.ts [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type {
  Character, Scene, DialogNode, Statement, ChoiceOption,
} from "./ir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../../..");
const V1_SCRIPTS = resolve(REPO_ROOT, "v1-modern/src/scripts");
const V1_CONFIG = resolve(REPO_ROOT, "v1-modern/public/data/config.yaml");
const CONTENT = resolve(REPO_ROOT, "content");

const DRY = process.argv.includes("--dry-run");
const HEADER = "# DO NOT EDIT — emitted by tools/adapters/narrat/emit.ts from content/ IR.";

// ---- Load IR ---------------------------------------------------------------

function loadAll<T>(subdir: string): T[] {
  const dir = resolve(CONTENT, subdir);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return files.map((f) => JSON.parse(readFileSync(resolve(dir, f), "utf8")) as T);
}

const characters = loadAll<Character>("characters");
const scenes = loadAll<Scene>("scenes");
const dialog = loadAll<DialogNode>("dialog");

// ---- Emit config.yaml ------------------------------------------------------

const imagesMap: Record<string, string> = {};
for (const sc of scenes) imagesMap[sc.id] = sc.background;

const screensMap: Record<string, { background: string }> = {};
for (const sc of scenes) screensMap[sc.id] = { background: sc.id };

const charsOut: Record<string, unknown> = {};
for (const c of characters) {
  const entry: Record<string, unknown> = {
    name: c.displayName,
  };
  if (c.color) {
    entry.style = { color: c.color };
  } else {
    // game character has empty name + style with color white in source
    entry.style = { color: "white" };
  }
  if (c.sprites && Object.keys(c.sprites).length > 0) {
    entry.sprites = c.sprites;
  }
  charsOut[c.id] = entry;
}

const config = {
  common: {
    gameTitle: "P&K Forever",
    saveFileName: "pnk-forever-save",
    layout: {
      backgrounds: { width: 1280, height: 720 },
      dialogBottomPadding: "2rem",
      verticalLayoutThreshold: 600,
      portraits: { width: 150, height: 225 },
    },
    images: imagesMap,
    hudStats: {},
  },
  dialoguePanel: { textSpeed: 30, animateText: true, timeBetweenLines: 100 },
  saves: { mode: "manual", slots: 10 },
  audio: { files: {}, audioTriggers: {}, options: {} },
  screens: { screens: screensMap },
  characters: {
    config: { imagesPath: "img/" },
    characters: charsOut,
  },
};

const yamlOut = `# DO NOT EDIT — emitted by tools/adapters/narrat/emit.ts from content/ IR.\n` +
  yaml.dump(config, { lineWidth: -1, quotingType: '"', forceQuotes: false });

if (DRY) {
  console.log("--- config.yaml ---");
  console.log(yamlOut);
} else {
  writeFileSync(V1_CONFIG, yamlOut, "utf8");
}

// ---- Emit .narrat files ----------------------------------------------------

function indent(level: number): string {
  return "  ".repeat(level);
}

function quote(s: string): string {
  // narrat strings are double-quoted; escape " inside
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function emitStatements(stmts: Statement[], level: number): string[] {
  const out: string[] = [];
  for (const s of stmts) {
    out.push(...emitStatement(s, level));
  }
  return out;
}

function emitStatement(s: Statement, level: number): string[] {
  const pad = indent(level);
  switch (s.op) {
    case "say": {
      if (s.speaker) {
        const pose = s.pose ?? "idle";
        return [`${pad}talk ${s.speaker} ${pose} ${quote(s.text)}`];
      }
      return [`${pad}${quote(s.text)}`];
    }
    case "set_scene":
      return [`${pad}set_screen ${s.scene}`];
    case "set_flag": {
      const v = typeof s.value === "string" ? quote(s.value) : String(s.value);
      return [`${pad}set ${s.flag} ${v}`];
    }
    case "jump":
      return [`${pad}jump ${s.target}`];
    case "run_trigger":
      return [`${pad}run trigger_easter_egg ${s.triggerId}`];
    case "choice": {
      const lines: string[] = [`${pad}choice:`];
      lines.push(`${indent(level + 1)}${quote(s.prompt)}`);
      for (const opt of s.options) {
        lines.push(...emitChoiceOption(opt, level + 1));
      }
      return lines;
    }
    case "if": {
      const lines: string[] = [`${pad}if ${s.condition}:`];
      lines.push(...emitStatements(s.then, level + 1));
      if (s.else && s.else.length > 0) {
        lines.push(`${pad}else:`);
        lines.push(...emitStatements(s.else, level + 1));
      }
      return lines;
    }
  }
}

function emitChoiceOption(opt: ChoiceOption, level: number): string[] {
  const pad = indent(level);
  const lines: string[] = [`${pad}${quote(opt.text)}:`];
  lines.push(...emitStatements(opt.statements, level + 1));
  return lines;
}

function emitLabel(node: DialogNode): string[] {
  const lines: string[] = [`${node.id}:`];
  if (node.statements.length === 0) {
    lines.push(`  return true`);
  } else {
    lines.push(...emitStatements(node.statements, 1));
  }
  return lines;
}

// Group dialog by sourceFile; collect mechanics triggers for game.narrat
const byFile = new Map<string, DialogNode[]>();
for (const n of dialog) {
  const key = n.sourceFile ?? "game";
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key)!.push(n);
}

// Load mechanics to append trigger_easter_egg functions to game.narrat
type Mechanic = {
  id: string;
  kind: string;
  trigger?: { kind: string; word?: string };
};
const mechanics = loadAll<Mechanic>("mechanics");
const keywordMechs = mechanics.filter((m) => m.trigger?.kind === "keyword");

for (const [file, nodes] of byFile) {
  const body: string[] = [];
  body.push(HEADER);
  body.push("");
  for (let i = 0; i < nodes.length; i++) {
    body.push(...emitLabel(nodes[i]));
    body.push("");
  }
  // Append trigger functions only to the file that owned them originally.
  // In v1, trigger_easter_egg lives in sunset.narrat (per source inspection).
  if (file === "sunset") {
    for (const m of keywordMechs) {
      body.push(`trigger_easter_egg ${m.id}:`);
      body.push(`  return true`);
      body.push("");
    }
  }
  const outPath = resolve(V1_SCRIPTS, `${file}.narrat`);
  const text = body.join("\n").replace(/\n+$/, "\n");
  if (DRY) {
    console.log(`--- ${file}.narrat ---`);
    console.log(text);
  } else {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, text, "utf8");
  }
}

console.log(
  "emit:",
  JSON.stringify({
    files: [...byFile.keys()].length,
    labels: dialog.length,
    characters: characters.length,
    scenes: scenes.length,
    dry: DRY,
  }),
);
