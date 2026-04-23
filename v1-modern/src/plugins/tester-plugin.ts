/**
 * PNK Forever — Tester escape hatch
 *
 * Registers a narrat `CommandPlugin` that exposes one scripting command:
 *
 *   tester_route
 *
 * Invoked directly as a top-level command in `main:` (NOT via `run` — narrat's
 * built-in `run` keyword calls scripted labels, while `registerPlugin({
 * customCommands: [...] })` adds our keyword to the parser's root vocabulary).
 *
 * When the URL contains `?tester=1`, calling `tester_route` from `main:` jumps
 * the VM to the `chapter_select` label so the tester can pick any of the five
 * chapters (plus the Ch 6 epilogue). When the URL has no tester flag, the
 * command is a no-op — a regular player experiences zero change.
 *
 * Design notes
 * ------------
 * - We intentionally do NOT modify the start menu. `startMenuButtons` fires
 *   before the VM has a running frame, so calling `useVM().jumpToLabel()`
 *   from a button action is a lifecycle race. Putting the tester check inside
 *   `main:` via `run tester_route` runs *after* the VM is initialized — no
 *   races, no DOM hacks.
 * - Companion to this plugin: `index.ts` flips `debug: true` on the same URL
 *   flag so testers also get narrat's built-in developer panel (jump-to-label,
 *   skip, data inspector). The panel is auto-hidden in production builds
 *   unless the flag opts in.
 *
 * See also:
 *   - https://docs.narrat.dev/guides/custom-start-buttons.html
 *   - https://docs.narrat.dev/plugins/plugins.html
 *   - `.claude/rules/narrat-no-autoplay-loops.md` (the loop invariant)
 */
import { CommandPlugin, registerPlugin, useVM } from 'narrat';

const TESTER_QUERY_KEY = 'tester';
const TESTER_QUERY_VALUE = '1';
const TESTER_TARGET_LABEL = 'chapter_select';

/**
 * True if the URL carries `?tester=1`. Cheap to call — reads `location.search`
 * fresh each time so deep-links still work if the param is added mid-session.
 */
export function isTesterMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(TESTER_QUERY_KEY) === TESTER_QUERY_VALUE;
}

/**
 * Registers the tester plugin with narrat. Safe to call every boot — the
 * `tester_route` command itself guards on `isTesterMode()`, so a normal
 * player's run-time cost is one function call that returns immediately.
 */
export function registerTesterPlugin(): void {
  const testerRoute = new CommandPlugin<{}, {}>(
    'tester_route',
    [], // no args
    async () => {
      if (!isTesterMode()) return;
      // Fire-and-forget: jumpToLabel sets jumpTarget on the VM, which the
      // outer run loop picks up on its next tick and uses to replace the
      // current frame. The remaining commands in `main:` (the narrator
      // lines + the `jump chapter_1_start`) are discarded.
      await useVM().jumpToLabel(TESTER_TARGET_LABEL);
    },
  );

  registerPlugin({
    pluginId: 'pnk-tester',
    customCommands: [testerRoute],
  });
}

/**
 * Mounts a small fixed-position ribbon so testers can see at a glance that
 * they're in tester mode and are not looking at the real player flow.
 * Inert — no clicks, no narrative impact.
 */
export function mountTesterRibbon(): void {
  if (!isTesterMode()) return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('pnk-tester-ribbon')) return;

  const ribbon = document.createElement('div');
  ribbon.id = 'pnk-tester-ribbon';
  ribbon.textContent = 'TESTER MODE · ?tester=1';
  Object.assign(ribbon.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    zIndex: '99999',
    padding: '4px 12px',
    background: 'rgba(255, 107, 53, 0.92)', // Phoenix orange
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '11px',
    letterSpacing: '0.08em',
    borderBottomLeftRadius: '6px',
    pointerEvents: 'none',
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  } as Partial<CSSStyleDeclaration>);

  // Defer until document.body exists.
  if (document.body) {
    document.body.appendChild(ribbon);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(ribbon);
    });
  }

  // Hide the `.pnk-switcher` volume deep-link chip in tester mode — testers
  // already have a dedicated chapter-picker panel; the extra overlay is
  // noise that also collides with this ribbon in the top-right corner.
  hideSwitcherChip();
}

function hideSwitcherChip(): void {
  const hide = () => {
    const el = document.querySelector<HTMLElement>('.pnk-switcher');
    if (el) el.style.display = 'none';
  };
  if (document.body) hide();
  else window.addEventListener('DOMContentLoaded', hide);
}
