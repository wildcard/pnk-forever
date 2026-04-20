## P1 — Mobile layout pass

### Why
Game likely gets shared by phone link. Untested on mobile. Narrat has mobile layout hooks but we haven't configured or tested them.

### Done when
- [ ] Playable at 375×667 (iPhone SE) and 414×896 (iPhone 11 Pro Max)
- [ ] Dialog box doesn't overflow screen
- [ ] Choice buttons tappable (>44px target)
- [ ] Character portraits don't clip or overlap the dialog
- [ ] Landscape orientation works (or is explicitly locked to portrait)

### How
1. Devtools mobile emulator → walk the golden path.
2. Narrat config knobs already in `config.yaml`:
   - `common.layout.verticalLayoutThreshold: 600` — already set
   - `common.layout.portraits.offset.portrait.{right,bottom}` — tweak if clipping
3. Add to `game.css`:
```css
@media (max-width: 600px) {
  .nrt-dialog-box { padding: 1rem !important; }
  .nrt-choice-button { min-height: 48px !important; }
}
```

### Labels
`p1`, `ui`
