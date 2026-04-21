/**
 * PNK Forever — AI NPC plugin
 *
 * Registers a narrat `CommandPlugin` that lets a scripted scene delegate a
 * single line of NPC dialog to a free OpenRouter model. Syntax:
 *
 *     ai_say <speaker> <pose> "<prompt>"
 *
 * Example:
 *
 *     "K. pauses, thinking…"
 *     ai_say k idle "What would you say to someone who just told you they love you?"
 *
 * Behaviour
 * ---------
 * - The runner awaits the HTTP response, then injects a single dialog line
 *   via `useDialogStore().addDialog({...interactive: true})` — identical
 *   shape to what `talk` produces, so the VM waits for a click-through.
 * - While the HTTP call is in flight, narrat's UI freezes on the previous
 *   dialog line (typically a "K. pauses, thinking…" narrator line placed
 *   just before `ai_say`). First response usually lands in 1–3 s.
 * - The key lives in `VITE_OPENROUTER_KEY` (read from `.env.local` at build
 *   time). If missing or the HTTP call fails, we fall back to a canned line
 *   so the scene always advances — an AI outage never breaks the game.
 *
 * Why it's gated on `?ai=1`
 * --------------------------
 * - The OpenRouter key is baked into the client bundle by Vite (necessary
 *   for a static deploy with no backend). A malicious visitor could scrape
 *   it and spend the free-tier quota. Gating the feature on a URL flag
 *   keeps the attack surface to people who know the flag exists, and keeps
 *   the key's blast radius contained to a single free model.
 * - `isAiMode()` uses the same URL-flag pattern as a future tester plugin
 *   would, so the two escape-hatches could compose cleanly once a
 *   `?tester=1` plugin lands (e.g. `?tester=1&ai=1`).
 *
 * See also
 * --------
 * - `.claude/rules/narrat-no-autoplay-loops.md` — the `ai_say` command itself
 *   is not a `choice:`, so loop invariants don't apply. Scenes that USE
 *   `ai_say` must still obey the loop invariant.
 * - https://openrouter.ai/docs — API reference.
 */
import { CommandPlugin, registerPlugin, useDialogStore, useVM } from 'narrat';

const AI_QUERY_KEY = 'ai';
const AI_QUERY_VALUE = '1';

/**
 * True when the URL carries `?ai=1`. Without the flag, `ai_say` becomes a
 * no-op fallback that injects the canned off-line line — regular players
 * never see an HTTP call or spin up API usage.
 */
export function isAiMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(AI_QUERY_KEY) === AI_QUERY_VALUE;
}

// Models are tried in order; the first one that returns usable content wins.
//
// z-ai/glm-4.5-air is a reasoning model that works WITHOUT the OpenRouter
// "Enable training of prompts" privacy toggle, which is why it's primary —
// other free tiers (gpt-oss-20b, gemma-4-*, etc.) return HTTP 404 unless
// that toggle is on. See callOpenRouter() for the full gotcha note.
//
// Because it's a reasoning model, it burns tokens on an internal chain of
// thought before emitting `content`. We set max_tokens high enough to leave
// room for both the reasoning and the answer (see MAX_TOKENS below).
const PRIMARY_MODEL = 'z-ai/glm-4.5-air:free';
const FALLBACK_MODEL = 'openai/gpt-oss-20b:free';
const SECOND_FALLBACK_MODEL = 'google/gemma-4-26b-a4b-it:free';
const MAX_TOKENS = 400;

// The API key is read lazily so tests can mutate it at runtime.
function getApiKey(): string | undefined {
  // Vite replaces `import.meta.env.VITE_OPENROUTER_KEY` at build time with a
  // string literal. Local dev reads it from `v1-modern/.env.local`.
  const key = (import.meta.env.VITE_OPENROUTER_KEY as string | undefined) ?? '';
  // Allow tester override via localStorage so someone can point a local
  // build at their own key without editing .env.local.
  if (typeof localStorage !== 'undefined') {
    const override = localStorage.getItem('openrouter_key');
    if (override && override.trim()) return override.trim();
  }
  return key && key.trim() ? key.trim() : undefined;
}

// System prompt keeps the model on-character for K. (Ehecatl). It's intentionally
// narrow: we want 1-3 sentences of warm, witty dialog — not essay-length output.
const SYSTEM_PROMPT = [
  'You are K. (pronounced "Kay", full name Ehecatl) — a peacock-tailed shiba dog in an anniversary visual novel called PNK Forever.',
  'Your companion is P. (Phoenix), a bird-cat. You are in love. Your tone is warm, witty, and intimate.',
  'Speak in 1-3 short sentences. First-person. Present tense. Never break character, never mention being an AI.',
  'Weave in one of these keywords if it fits naturally (but never force it): MANGO, TEA, CHOCOLATE, KITE, LOVE, FLY, TIGER, SNAKE, ZODIAC, FUTURE, NECKLACE, BROMPTON, JAFFA, JAPAN.',
  'Never produce markdown, code blocks, or stage directions. Just the spoken line.',
].join(' ');

// A short cache of canned fallbacks — used when the API is unreachable or
// the key is missing. The game never "stalls": if the network dies, K.
// says something sweet and the scene advances.
const FALLBACKS = [
  'Wherever you go, I go. That\'s the deal.',
  'You, me, a KITE, a slow afternoon. That\'s the whole plan.',
  'I don\'t need a map. I just need you nearby.',
  'We have TEA, we have time. The rest will figure itself out.',
];

function pickFallback(): string {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

/**
 * POST the prompt to OpenRouter and return the model's reply, or `undefined`
 * on any failure. Non-throwing — the caller decides what to do on `undefined`.
 */
async function callOpenRouter(prompt: string, apiKey: string): Promise<string | undefined> {
  const body = {
    // First model; if it fails we retry with the fallbacks below.
    model: PRIMARY_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    // Generous budget: reasoning models (PRIMARY_MODEL is one) burn tokens on
    // an internal chain of thought before emitting `content`. Too low and the
    // response finishes in reasoning with empty content.
    max_tokens: MAX_TOKENS,
    temperature: 0.9,
  };

  async function tryOnce(model: string): Promise<string | undefined> {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          // OpenRouter recommends these two headers for free-tier attribution.
          'HTTP-Referer': 'https://pnk-forever.vercel.app',
          'X-Title': 'PNK Forever',
        },
        body: JSON.stringify({ ...body, model }),
      });
      if (!res.ok) {
        // OpenRouter gotcha: if you see HTTP 404 with
        // "No endpoints available matching your guardrail restrictions",
        // your account needs the "Enable training of prompts" toggle at
        // https://openrouter.ai/settings/privacy — free models are hidden
        // from accounts that opt out of prompt training. The key itself
        // is fine; the setting is what unlocks the free tier.
        const bodyText = await res.text().catch(() => '');
        console.warn(
          `[ai-npc] ${model} HTTP ${res.status}${bodyText ? ` — ${bodyText.slice(0, 200)}` : ''}`,
        );
        return undefined;
      }
      const json = await res.json();
      const line = json?.choices?.[0]?.message?.content;
      if (typeof line === 'string' && line.trim()) return line.trim();
      return undefined;
    } catch (err) {
      console.warn('[ai-npc] fetch failed:', err);
      return undefined;
    }
  }

  return (
    (await tryOnce(PRIMARY_MODEL)) ??
    (await tryOnce(FALLBACK_MODEL)) ??
    (await tryOnce(SECOND_FALLBACK_MODEL))
  );
}

interface AiSayArgs {
  speaker: string;
  pose: string;
  prompt: string;
}

/**
 * Registers the `ai_say` and `ai_demo_route` custom commands. Must be
 * called before `startApp` so the narrat parser has the keywords in its
 * vocabulary when it reads the scripts.
 */
export function registerAiNpcPlugin(): void {
  const aiSay = new CommandPlugin<AiSayArgs, {}>(
    'ai_say',
    [
      { name: 'speaker', type: 'string' },
      { name: 'pose', type: 'string' },
      { name: 'prompt', type: 'string' },
    ],
    async (cmd) => {
      const { speaker, pose, prompt } = cmd.options;
      const dialog = useDialogStore();

      // Feature-gate: without ?ai=1 we always use the canned fallback. This
      // means scripts can safely include `ai_say` in authored scenes and a
      // normal player sees a fine hand-crafted line, while someone with
      // `?ai=1` sees live model output.
      if (!isAiMode()) {
        dialog.addDialog({ speaker, pose, text: pickFallback(), interactive: true });
        return;
      }

      const key = getApiKey();
      if (!key) {
        console.warn('[ai-npc] VITE_OPENROUTER_KEY missing — using fallback line');
        dialog.addDialog({ speaker, pose, text: pickFallback(), interactive: true });
        return;
      }

      const line = await callOpenRouter(prompt, key);
      dialog.addDialog({
        speaker,
        pose,
        text: line ?? pickFallback(),
        interactive: true,
      });
    },
  );

  // Companion route: when `?ai=1` is set, calling `ai_demo_route` from
  // `main:` jumps the VM straight to `ai_demo_start`, skipping the
  // prologue. Without the flag it's a no-op — the regular player never
  // leaves the authored flow.
  const aiDemoRoute = new CommandPlugin<{}, {}>(
    'ai_demo_route',
    [],
    async () => {
      if (!isAiMode()) return;
      await useVM().jumpToLabel('ai_demo_start');
    },
  );

  registerPlugin({
    pluginId: 'pnk-ai-npc',
    customCommands: [aiSay, aiDemoRoute],
  });
}

/**
 * Mounts a small fixed-position ribbon so testers can see `?ai=1` is on.
 * Positioned below the tester ribbon so both can coexist.
 */
export function mountAiRibbon(): void {
  if (!isAiMode()) return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('pnk-ai-ribbon')) return;

  const ribbon = document.createElement('div');
  ribbon.id = 'pnk-ai-ribbon';
  ribbon.textContent = 'AI NPC · ?ai=1';
  Object.assign(ribbon.style, {
    position: 'fixed',
    // Offset below the tester ribbon (which sits at top:0).
    top: '28px',
    right: '0',
    zIndex: '99999',
    padding: '4px 12px',
    background: 'rgba(20, 120, 200, 0.92)', // K.-peacock blue
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '11px',
    letterSpacing: '0.08em',
    borderBottomLeftRadius: '6px',
    pointerEvents: 'none',
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  } as Partial<CSSStyleDeclaration>);

  if (document.body) {
    document.body.appendChild(ribbon);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(ribbon);
    });
  }
}
