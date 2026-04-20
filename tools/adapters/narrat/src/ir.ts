/**
 * Shared IR types used by the parser and emitter.
 * Keep these in sync with content/schema/*.schema.json — the runtime validator
 * (tools/ir-lint) is the source of truth; this is a convenience mirror for TS.
 */

export type Character = {
  id: string;
  displayName: string;
  color?: string;
  sprites?: Record<string, string>;
  narratId?: string;
};

export type Scene = {
  id: string;
  displayName?: string;
  background: string;
  music?: string | null;
  ambientSfx?: string | null;
};

export type Flag = {
  id: string;
  type: "bool" | "int" | "string";
  default: boolean | number | string;
  description?: string;
};

export type Item = {
  id: string;
  name: string;
  icon?: string | null;
  acquiredFlag: string;
  description?: string;
};

export type Mechanic = {
  id: string;
  kind: "easter_egg" | "keyword_trigger" | "guard" | "cascade";
  trigger?:
    | { kind: "keyword"; word: string; caseInsensitive?: boolean }
    | { kind: "node_enter"; nodeId: string }
    | { kind: "flag"; flag: string; value?: unknown };
  effect?:
    | { kind: "run_trigger"; triggerId: string }
    | { kind: "set_flag"; flag: string; value: unknown }
    | { kind: "say"; text: string };
  oneShot?: boolean;
  description?: string;
};

export type Statement =
  | { op: "say"; speaker?: string | null; pose?: string | null; text: string }
  | { op: "set_scene"; scene: string }
  | { op: "set_flag"; flag: string; value: boolean | number | string }
  | { op: "jump"; target: string }
  | { op: "choice"; prompt: string; options: ChoiceOption[] }
  | { op: "if"; condition: string; then: Statement[]; else?: Statement[] }
  | { op: "run_trigger"; triggerId: string };

export type ChoiceOption = {
  text: string;
  guard?: string | null;
  oneShot?: boolean;
  statements: Statement[];
};

export type DialogNode = {
  id: string;
  scene?: string | null;
  sacred?: boolean;
  sourceFile?: string;
  statements: Statement[];
};
