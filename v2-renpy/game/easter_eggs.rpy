# DO NOT EDIT — emitted by tools/adapters/renpy/emit.ts from content/ IR.

# Keyword-triggered easter eggs. Ren'Py has no built-in keyword
# watch; we expose a `run_trigger(id)` helper that dialog labels
# call via `$ run_trigger('pnk_mango')` et al.

init python:
    def run_trigger(trigger_id):
        # Hook for keyword mechanic effects. Extend per mechanic.
        pass

# mechanic: pnk_chocolate (keyword: CHOCOLATE)
# mechanic: pnk_drink (keyword: TEA)
# mechanic: pnk_fly (keyword: FLY)
# mechanic: pnk_kite (keyword: KITE)
# mechanic: pnk_love (keyword: LOVE)
# mechanic: pnk_mango (keyword: MANGO)
