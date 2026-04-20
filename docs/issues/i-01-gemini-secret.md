## P0 — Add GEMINI_API_KEY to GitHub Actions + Vercel

### Why
The asset generation workflow and any runtime image features require a Google AI Studio API key. Right now the workflow can't run because `secrets.GEMINI_API_KEY` is undefined.

### Done when
- [ ] `gh secret list` shows `GEMINI_API_KEY` on this repo
- [ ] `vercel env ls` shows `GEMINI_API_KEY` in production, preview, development
- [ ] Manual trigger of `.github/workflows/generate-assets.yml` succeeds
- [ ] Secret value never appears in any commit, log, or comment

### How
```bash
# GitHub
gh secret set GEMINI_API_KEY --repo <owner>/<repo>

# Vercel (interactive — don't pass value as arg)
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview
vercel env add GEMINI_API_KEY development

# Verify
gh secret list | grep GEMINI_API_KEY
vercel env ls | grep GEMINI_API_KEY
```

### Labels
`p0`, `infra`, `no-pr` (close by commit referencing the secret names, not values)
