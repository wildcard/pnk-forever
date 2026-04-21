/**
 * PNK Forever — open_url command
 *
 * Registers a narrat `CommandPlugin` that exposes one scripting command:
 *
 *   open_url "/some/path"
 *
 * Usage (`game.narrat`):
 *
 *   volume_select:
 *     choice:
 *       "Which volume would you like to play?"
 *       "Volume 1 · Original Throwback":
 *         open_url "/v0-original-text-engine/index.html"
 *       "Volume 2 · Modern Edition":
 *         jump chapter_1_start
 *
 * The runner sets `window.location.href` to the arg and returns — the browser
 * unloads the current page, so no further narrat VM work matters after the
 * call. Matches the lifecycle shape of `tester_route`/`ai_demo_route`: a
 * `CommandPlugin` invoked as a bare top-level command (NOT via `run`, which
 * narrat reserves for scripted labels).
 *
 * Loop-invariant note (`.claude/rules/narrat-no-autoplay-loops.md`):
 *   This command is *monotonic-advance* (pattern (b)) when used in a choice
 *   — it transitions away from narrat entirely, so the block cannot loop on
 *   it. No guard or flag needed. The *other* branches in the choice block
 *   must still satisfy the invariant on their own.
 */
import { CommandPlugin, registerPlugin } from 'narrat';

type OpenUrlArgs = { url: string };

/**
 * Registers the `open_url` plugin with narrat. Safe to call every boot.
 */
export function registerOpenUrlPlugin(): void {
  const openUrl = new CommandPlugin<OpenUrlArgs, {}>(
    'open_url',
    [{ name: 'url', type: 'string' }],
    async (cmd) => {
      if (typeof window === 'undefined') return;
      const { url } = cmd.options;
      if (typeof url !== 'string' || url.length === 0) return;
      window.location.href = url;
    },
  );

  registerPlugin({
    pluginId: 'pnk-open-url',
    customCommands: [openUrl],
  });
}
