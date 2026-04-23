# Ambient-Texture Audit — 2026-04-20

**Reviewer:** Veteran VN reviewer (NITW / Florence / A Short Hike lens), dispatched via `general-purpose`.
**Lens:** Night in the Woods — intimate games earn weight in quiet scenes, not plot beats.
**Scope:** 7 flags across all 5 narrat files where personal-detail density can go up one notch.

---

## Flag 1 — Beach café has no weight of place

- **Location:** `game.narrat:beach_rest_look` (~lines 113–119)
- **Current state:** "Midday sun is relentless. P. sips a slushy acai" — the café is named but never *furnished*.
- **What's missing:** A single lived-in detail on the table itself — what sits next to the slushy.
- **Candidate:** `"A sandy flip-flop under the chair. A napkin pinned by a seashell. The café is hers, today."` — or CANDIDATE: author-supplied personal detail (the specific book / sketchbook / notebook Anastasia actually carries to cafés).
- **Why it lands:** Gives P. a pre-K. self — she existed before he rolled up, and the player feels it.

## Flag 2 — The Brompton moment is visual, not sensory

- **Location:** `beach.narrat:beach_scene` (~lines 3–4) and the "Look at the bicycle" flavor (~line 27)
- **Current state:** "his Brompton folded neatly beside him" + "Folds neat as a promise."
- **What's missing:** The *sound or texture* of a Brompton — the clack of the hinge, a sticker, a scuff. One tactile beat.
- **Candidate:** Extend the look line: `"A BROMPTON. Folds neat as a promise. A single scuff on the frame — earned."` Or CANDIDATE: a sticker/keyring Kobi actually has on his.
- **Why it lands:** The Brompton is K.'s signature object. Right now it's a noun. One scar turns it into a character.

## Flag 3 — "A good moment to really talk" skips the walk itself

- **Location:** `sunset.narrat:sunset_scene` (~lines 3–7)
- **Current state:** Three lines of scenery then straight to "A good moment to really talk" and K.'s invitation.
- **What's missing:** One ambient *between-beat* before the conversation opens — the small synchronization of two bodies walking at the same pace for the first time.
- **Candidate:** Insert one line before "A good moment to really talk.": `"His paws match your pace without trying. You notice."` or `"He walks the sea side. Keeps the traffic on his tail. You notice."`
- **Why it lands:** Courtship is the first time you catch someone being quietly considerate. Planting it now makes the Kyoto "You protect me. I protect you." land three chapters later.

## Flag 4 — Sunset food/drink answers are too symmetrical

- **Location:** `sunset.narrat:sunset_food` / `sunset_drink` (~lines 94–116)
- **Current state:** K. states preference, P. echoes, K. affirms ("Same. We should've met sooner."). Clean, but no texture.
- **What's missing:** One sensory particular from P.'s past — *where* she first had the mango / the tea.
- **Candidate:** After P.'s mango line add: `talk phoenix idle "My grandmother cut them in a grid. I still eat them like that."` — or CANDIDATE: author-supplied personal detail (the specific way Anastasia was taught to eat mango / brew tea).
- **Why it lands:** Inside jokes compound when a family ritual is named. Generic mango is forgettable; *her grandmother's* mango is not.

## Flag 5 — Jaffa apartment has "souvenirs" but names zero of them

- **Location:** `jaffa.narrat:jaffa_apt_scene` (~line 3)
- **Current state:** "Souvenirs on every shelf — proof of places you've loved." — asserted, never shown.
- **What's missing:** Two specific shelf-objects. The phrase "every shelf" promises density; the room delivers zero nouns.
- **Candidate:** Split into two lines: `"A Lisbon tram ticket taped to the mirror. A dried bougainvillea from somewhere older."` Or CANDIDATE: author-supplied (two real objects on Anastasia's shelf — one from a trip she took alone, one from a trip with Kobi).
- **Why it lands:** Biggest leverage gap in the file. NITW's Possum Springs is *made of* unnamed-then-named objects. Current line is the opposite pattern.

## Flag 6 — Jaffa Street is a single sentence

- **Location:** `jaffa.narrat:jaffa_street_scene` (~line 27)
- **Current state:** `"Jaffa Street. Stone walls, bougainvillea, and the smell of fresh bread."` — one line, then straight to choices.
- **What's missing:** A human on the street. A cat. A sound. Right now it's a postcard.
- **Candidate:** Add one line: `"A grandmother waters a pot without looking up. A cat considers her."` Or CANDIDATE: a specific Jaffa vendor / corner Anastasia remembers.
- **Why it lands:** The scene is transit between bed and kite-shop. Thirty words of ambient life make it feel like somewhere K. actually lives, not a corridor.

## Flag 7 — Morning-after is one beat, not two

- **Location:** `jaffa.narrat:use_bed` (~lines 18–22)
- **Current state:** Sleep → "Morning. Market noise. K. is still snoring."
- **What's missing:** A single domestic detail on waking — who made what, what's on the nightstand.
- **Candidate:** After the snoring line: `"His Brompton leans in the hallway like it's waiting too."` Or CANDIDATE: author-supplied (the actual thing in their real morning routine — a specific mug, a plant, a view).
- **Why it lands:** Pairs the Brompton across chapters (Flag 2 reward). Small recurring objects are NITW's bread and butter.

---

## Producer note

Spend the ambient-polish budget on **Chapter 3 (Jaffa apartment + street)** — Flags 5, 6, 7 are clustered there and the file is the thinnest of the five. Second priority: the **sunset walk opener** (Flag 3) — one line of physical synchronization retroactively grounds the kitchen's "protect me" crescendo. Chapter 1's café (Flag 1) is third. Kitchen was right to polish first; the Jaffa middle is now the weakest link.

## Author-supplied-detail flags

Four of the seven flags include a `CANDIDATE: author-supplied personal detail` option — these are places where a real memory from Kobi & Anastasia's life would land harder than an invented detail. Flagged here so `game-producer` can decide whether to:
- (a) ship the invented candidate lines as-is and accept generic-but-grounded texture,
- (b) ask the user for the real details before the game-narrative dispatch,
- (c) skip these four flags and ship the other three.
