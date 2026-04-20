## P0 — Generate real scene images via Imagen

### Why
Currently `v1-modern/public/img/*.png` are 67-byte placeholder PNGs. The game displays CSS gradients as fallback but real artwork is the whole point.

### Prereq
- I-1 complete (GEMINI_API_KEY is set)

### Done when
- [ ] All 11 images (9 backgrounds + phoenix + k) in `v1-modern/public/img/` are >100KB real PNGs
- [ ] Preview deployment shows them behind the dialogue box
- [ ] A PR was opened from the workflow's auto-commit and merged into the dev branch

### How
```bash
# Trigger the workflow
gh workflow run generate-assets.yml --ref claude/anniversary-game-vp0Vp

# Watch
gh run watch

# Pull the auto-commit
git fetch origin && git pull origin claude/anniversary-game-vp0Vp

# Verify file sizes
ls -lh v1-modern/public/img/
```

### If Imagen rejects a prompt
Edit `v1-modern/scripts/generate-assets.mjs`, tweak the prompt for the failing asset, re-run the workflow. Common triggers: named real people, copyrighted characters.

### Labels
`p0`, `content`
