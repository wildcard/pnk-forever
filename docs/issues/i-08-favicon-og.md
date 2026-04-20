## P1 — Favicon + OG metadata

### Why
`vite.svg` returns 404 (Vite template leftover). Shared links on Slack/WhatsApp look bad with no preview image.

### Done when
- [ ] Custom favicon (SVG or PNG) in `public/`, referenced correctly in `index.html`
- [ ] `<meta name="description">`, `<meta property="og:*">`, `<meta name="twitter:*">` tags set
- [ ] OG preview image at `public/og.png` (use a generated scene image or a composite)
- [ ] No 404s in browser console on a fresh load

### How
Edit `v1-modern/index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="description" content="P&K Forever — an interactive love story." />
<meta property="og:title" content="P&K Forever" />
<meta property="og:description" content="An interactive love story." />
<meta property="og:image" content="/og.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### Labels
`p1`, `ui`
