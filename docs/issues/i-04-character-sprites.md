## P0 — Show character sprites during dialogue

### Why
`talk phoenix idle "..."` is everywhere in the scripts but no sprite ever appears. `config.yaml` has the sprites defined but Narrat only renders them after a `show` command.

### Done when
- [ ] Phoenix portrait appears during her lines at beach_rest, beach, sunset scenes
- [ ] K portrait appears during his lines at beach, sunset, jaffa, kitchen scenes
- [ ] Both portraits hide when a scene naturally ends
- [ ] No visual glitches (portrait clipping, overlap, wrong side) on desktop viewport

### How
Add `show`/`hide` commands at scene transitions. Minimal set:

```narrat
beach_rest:                # game.narrat
  set_screen beach_rest
  show phoenix idle right
  ...

beach_scene:               # beach.narrat
  set_screen beach
  show phoenix idle right
  ...

talk_to_k:
  show k idle left
  talk k idle "..."
  ...

sunset_scene:              # sunset.narrat
  set_screen beach_sunset
  show phoenix idle right
  show k idle left
  ...

kitchen_conversation:      # japan.narrat
  show k idle left
  talk k idle "..."
```

Hide sprites before major transitions (`fly_to_japan`, `home_scene`) with:
```narrat
hide phoenix
hide k
```

### Test
Walk through the first 4 scenes and screenshot each. Sprites should be on the right (Phoenix) and left (K) sides of the screen, not overlapping the dialogue box.

### Labels
`p0`, `feature`
