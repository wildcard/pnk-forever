## P0 — Wire IFTTT easter egg webhooks

### Why
v0 had 6 easter eggs that fire IFTTT webhooks when the player hits specific choices (MANGO, TEA, CHOCOLATE, KITE, LOVE, FLY). Our `trigger_easter_egg` is a no-op stub. The whole point of the anniversary game is these triggers actually do something (lights, phone notifications, etc.).

### Done when
- [ ] `IFTTT_WEBHOOK_KEY` is set in GitHub and Vercel (same pattern as I-1)
- [ ] `v1-modern/src/index.ts` registers a `trigger_easter_egg` command via `registerCommand`
- [ ] The command `fetch`es `https://maker.ifttt.com/trigger/${event}/with/key/${key}`
- [ ] The stub `trigger_easter_egg event_name: return` is removed from `sunset.narrat`
- [ ] Playing through MANGO dialogue fires the webhook (verified in IFTTT activity log)
- [ ] Key is never in source

### How

1. Add the env var.
```bash
vercel env add IFTTT_WEBHOOK_KEY production preview development
gh secret set IFTTT_WEBHOOK_KEY
```

2. Expose it to the client at build time in `vite.config.ts`:
```ts
define: {
  __IFTTT_KEY__: JSON.stringify(process.env.IFTTT_WEBHOOK_KEY ?? ''),
}
```

3. Add to `src/index.ts`:
```ts
import { registerCommand } from 'narrat';
declare const __IFTTT_KEY__: string;

registerCommand('trigger_easter_egg', {
  argTypes: [{ name: 'event', type: 'string' }],
  runner: async (_ctx, event: string) => {
    if (!__IFTTT_KEY__) return;
    try {
      await fetch(
        `https://maker.ifttt.com/trigger/${event}/with/key/${__IFTTT_KEY__}`,
        { method: 'POST', mode: 'no-cors' }
      );
    } catch { /* fire-and-forget */ }
  },
});
```

4. Remove the stub from `v1-modern/src/scripts/sunset.narrat`:
```diff
-trigger_easter_egg event_name:
-  return
```

### Security note
The IFTTT webhook key is effectively public once it ships to the browser. This is fine for the anniversary use case — if someone wants to spam the owner's lights, that's a feature, not a bug. If the user disagrees, route through a Vercel function instead (separate issue).

### Labels
`p0`, `feature`
