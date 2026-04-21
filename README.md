# P&K Forever

> **A Love Letter in Code**
>
> *From Phoenix to Anastasia*
>
> *April 21, 2021 - Forever*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://pnk-forever.vercel.app)

---

## What Is This?

This is the story of how two souls met on a beach in Tel Aviv, gamified into a text adventure where discovering things in the game causes real surprises to appear in the physical world.

It's a love letter. A treasure hunt. A memory made interactive. A bridge between the digital and the real.

Created on April 21, 2022 - the first anniversary of the day Phoenix met Anastasia at Geula Beach.

---

## The Story

**April 21, 2021. Friday. Geula Beach, Tel Aviv.**

*K* came down from Geula on his Brompton, Caro curled up in the front basket. Just a water stop. Somewhere to cool off, fold the back wheel, catch his breath.

He looked up.

*P* was there.

From her side of the beach, what she saw was this: a dog on a bicycle. Not just any dog — a peacockdog wearing colorful feathers. A shiba riding a Brompton folding bicycle.

From that moment on, they've been inseparable.

---

## Project Structure

This is a **monorepo** containing multiple versions of the P&K Forever game, preserving the original while evolving the story into new forms.

```
pnk-forever/
├── README.md                    ← You are here
├── STORY.md                     ← The complete narrative
├── vercel.json                  ← Deployment configuration
│
├── v0-original-text-engine/     ← The sacred original (April 2022)
│   ├── index.html
│   ├── index.js                 ← Text engine
│   ├── game-disks/
│   │   └── p-n-k-forever.js    ← The game/story data
│   ├── styles/
│   └── README.md
│
├── docs/                        ← Comprehensive documentation
│   ├── characters.md            ← Phoenix, K, and their evolution
│   ├── items.md                 ← Every object and its meaning
│   ├── scenes.md                ← Every location, transition, beat
│   ├── easter-eggs.md           ← The game-to-reality bridges
│   └── integrations.md          ← Technical systems & architecture
│
└── v1-modern/                   ← Future: Modern reimagining
    └── (coming soon)
```

---

## The Versions

### v0: The Original Text Adventure (2022)

**Technology:** Vanilla JavaScript, text-engine, pure HTML/CSS
**Created With:** GitHub Copilot (Tab9 era)
**Status:** 🔒 **PRESERVED - DO NOT MODIFY**

The original game created with GitHub Copilot on the first anniversary. It tells the story of Day 1 - how Phoenix and K met, their first conversations, and a flash-forward to an imagined future in Japan.

**[Play v0 →](https://pnk-forever.vercel.app/v0-original-text-engine/)** · [source](v0-original-text-engine/)

### v1: Modern Reimagining (In Planning)

**Technology:** TBD (researching modern web game engines)
**Created With:** Claude Code (2024-2025)
**Status:** 📋 **PLANNING**

Same narrative essence, same characters, same emotional beats - but brought to life with modern web technology and smart AI integration.

**Goals:**
- Preserve the story and soul
- Enhanced presentation (visuals, sound, interactivity)
- Smarter Easter egg system
- Better mobile experience
- Potential for expanded narrative (more years, more moments)
- AI-enhanced dialogue and scenarios

---

## Core Principles

### 1. Preserve the Original

The v0 game is **sacred**. It represents a specific moment in time - both when Phoenix met Anastasia, and when the game was created one year later. It must never be modified.

All git history is preserved. The original files live in their own folder. Future versions exist alongside, not replacing.

### 2. Respect the Story

This isn't just a game - it's a love letter. Every detail matters:
- The slushy with three gulps
- The shekel found in the sand
- K's colorful feathers
- The conversations about mango and tea and chocolate
- The drawer #4 hint
- The Tiger and the Snake
- The Infinity Ouroboros necklace
- "I love you" 🧡🖤

These aren't arbitrary game mechanics - they're memories, promises, symbols.

### 3. The Game is For Anastasia

This game was created for one player: Anastasia. When she plays, things happen in the real world. The Easter eggs aren't just achievements - they're surprises orchestrated through IFTTT webhooks.

When she finds the chocolate conversation, she should look in drawer #4.
When she discovers the kite equipment, a discount code unlocks.
When she says "I love you," something beautiful happens in the physical world.

The game is a bridge between code and reality.

### 4. Honor the Tools

- **v0** was built with GitHub Copilot - the early days of AI-assisted development
- **v1** is being planned with Claude Code - continuing the tradition

There's a poetic continuity: AI helped create something deeply human, twice, years apart.

### 5. Don't Over-Engineer

The original's beauty is its simplicity:
- No dependencies
- No build process
- No frameworks
- Just HTML, JavaScript, CSS, and a story

Any modernization must ask: "Does this serve the story and the player, or just the technology?"

---

## Documentation

Every aspect of the game is meticulously documented:

- **[STORY.md](STORY.md)** - The complete narrative, act by act, scene by scene
- **[characters.md](docs/characters.md)** - Phoenix and K in detail
- **[items.md](docs/items.md)** - Every object, its purpose, its meaning
- **[scenes.md](docs/scenes.md)** - Every location, every transition, every emotional beat
- **[easter-eggs.md](docs/easter-eggs.md)** - The bridges between game and reality
- **[integrations.md](docs/integrations.md)** - Technical architecture and systems

This documentation serves two purposes:
1. **Preservation:** Capturing every detail of the original
2. **Blueprint:** Foundation for reimagining in new forms

---

## The Technology Journey

### v0 Technology Stack (2022)

**Engine:** text-engine v2.0.0 (fork of okaybenji/text-engine)
- Pure vanilla JavaScript
- No dependencies
- JSON-based game data ("disk" metaphor)
- Browser localStorage for save/load
- Terminal aesthetic (retro.css)
- Ultimate Apple II font

**Infrastructure:**
- Static HTML/CSS/JS
- Vercel hosting
- IFTTT webhooks for Easter eggs

**Total Size:** ~100KB including ASCII art

**Development Assistant:** GitHub Copilot (Tab9 era)

### v1 Technology (TBD - In Research)

**Goals:**
- Modern web game engine (researching options)
- Enhanced visuals while respecting the story
- Smarter Easter egg system (backend, not exposed keys)
- AI integration for dynamic elements
- Mobile-first responsive design
- Improved accessibility

**Candidates:**
- Phaser (popular, mature, 2D focused)
- Ren'Py Web (visual novel oriented)
- ink + inkjs (narrative scripting)
- Custom React/Vue + game engine
- Godot (web export)
- Three.js / PixiJS (if going visual)

**Must Maintain:**
- Browser-based (no installation)
- Story-first focus
- Lightweight and fast
- Respect for the original's aesthetic

**Development Assistant:** Claude Code (2024-2025)

---

## The Easter Eggs

The game contains hidden triggers that cause real-world events via IFTTT webhooks:

| Trigger | Event | What Happens IRL? |
|---------|-------|-------------------|
| Phoenix reveals she loves MANGO 🥭 | `pnk_mango` | Mangoes appear |
| Phoenix shares she drinks TEA 🫖 | `pnk_drink` | Tea is prepared (Mint & Lemon verbena, no sugar) |
| Phoenix loves CHOCOLATE 🍫 | `pnk_chocolate` | Check drawer #4... |
| Phoenix finds KITE equipment 🪁 | `pnk_kite` | Discount code unlocked: `PNK-n3zk7MAMBG-GIFT` |
| Phoenix says "I LOVE you" 🧡🖤 | `pnk_love` | Something beautiful happens |
| Phoenix uses the necklace ✈️ | `pnk_fly` | The ultimate surprise |

The brilliance: **The game isn't just played - it plays out in real life.**

**[Full Easter Egg Documentation →](docs/easter-eggs.md)**

---

## Playing the Original Game

The v0 game is deployed and playable:

**[Play P&K Forever v0 →](https://pnk-forever.vercel.app/v0-original-text-engine/)**

Or run locally:
```bash
cd v0-original-text-engine
open index.html
```

**Commands:**
- `LOOK` - Examine surroundings
- `TALK TO [character]` - Conversation
- `TAKE [item]` - Pick up items
- `USE [item]` - Use items
- `GO [direction]` - Move around
- `FLY TO [location]` - Unlocked through gameplay
- `INV` - Check inventory
- `SAVE` / `LOAD` - Save progress
- `HELP` - Show all commands

---

## Development History

### April 21, 2021
**The Day It Happened**

Phoenix met Anastasia at Geula Beach, Tel Aviv. A dog on a Brompton bicycle with colorful feathers. A conversation that felt like it could last forever. The sunset walk to Jaffa.

Everything in the game comes from this day.

### April 21, 2022
**First Anniversary - v0 Created**

One year later, Phoenix created the game with GitHub Copilot. A way to say: "This is what I know how to do. I know how to build software. And you gave me back the belief that I can make games."

A love letter in code. A memory made interactive.

### December 2024
**Preservation & Planning - v1 Begins**

With Claude Code, the project evolves:
1. Restructured into monorepo
2. Original preserved with full git history
3. Complete documentation extracted
4. Planning the modern reimagining

The story continues.

---

## For Developers

### Contributing

This is a personal project, but if you're interested in:
- The text-engine architecture
- Game-to-reality Easter egg systems
- Narrative game design
- Preserving digital artifacts
- AI-assisted game development

Feel free to explore the code and documentation. Learn from it, be inspired by it.

### Git History

Every commit is preserved. You can trace the development of the original game through the git log. The restructure into monorepo used `git mv` to maintain that history.

```bash
# See the original development
git log --follow -- v0-original-text-engine/game-disks/p-n-k-forever.js
```

### Technical Deep Dive

**[Read the technical documentation →](docs/integrations.md)**

Topics covered:
- text-engine architecture
- Command system
- Save/load mechanics
- IFTTT integration
- Dynamic game state modification
- Conversation system
- ASCII art and styling

---

## The Philosophy

### Why Games?

*"I always wanted to make games because that brings me joy and makes my connection with computers more meaningful. Technology gave me so much, and she gave me back the belief in myself that I can maybe someday make a game."*

This isn't about showing off technical skills. It's about using technology to express something human - love, memory, hope, the feeling of meeting someone and knowing.

### Why Text Adventure?

Text adventures are:
- **Intimate:** Just you and the story
- **Imaginative:** Your mind fills in the details
- **Timeless:** No graphics to age poorly
- **Accessible:** Works anywhere, for anyone
- **Focused:** Story first, mechanics second

Perfect for a love letter.

### Why Easter Eggs in Real Life?

Because love isn't just abstract - it's real. It's mangoes and tea and chocolate. It's finding surprises in drawer #4. It's discount codes for kite boarding. It's necklaces and zodiac signs and flying home together.

The game makes the story interactive. The Easter eggs make the game *real*.

---

## The Characters

### Phoenix (P)

Sometimes a bird, sometimes a cat, depending on how you look at it or her mood. Curious, adventurous, talented. Loves açai slushies, mango, tea with mint and lemon verbena, and dark chocolate. Her zodiac sign is Tiger 🐅 - the protector.

She can fly when she believes in it enough.

### K (Ehecatl)

A peacockdog shiba wearing colorful feathers, riding a Brompton bicycle. Pleasant, a bit of a loner, well-traveled, dreams of being a digital nomad. Loves fruits & vegetables, coffee, and ice cream. His zodiac sign is Snake 🐍 - the guide.

His ancestors are from Japan.

### Together

Tiger and Snake. Phoenix and K. Protector and guide. Two souls that make each other stronger, better together as a whole.

*"Stronger together, we're one. To eternity."*

**[Full Character Documentation →](docs/characters.md)**

---

## Symbolism

Every element in the game carries meaning:

- **Slushy (3 gulps):** The stages of cooling down, opening up, approaching
- **Shekel in sand:** Chance, fate, the universe deciding (flip it: heads or tails?)
- **Brompton bicycle:** Freedom, adventure, the journey
- **Sunset walk:** Time passing, romance, transition from meeting to connection
- **Sleeping together:** Trust, intimacy, time skip to morning
- **Kite boarding:** Phoenix's passion, freedom in the wind
- **Flying:** The power unlocked through connection
- **Japan (3 years later):** The imagined future, cultural immersion, growth
- **Uwabaki (slippers):** Respect for customs, domesticity, caring about details
- **Dim sum:** Cooking together, building life together, cultural fusion
- **Chopsticks:** Having the right tools, sharing a meal, intimacy
- **Tiger & Snake:** Complementary strengths, zodiac compatibility
- **Infinity Ouroboros:** Eternal cycle, no beginning, no end, two halves of one whole
- **Kite connector:** Freedom, connection, the link between souls
- **🧡🖤:** Phoenix and K, orange and black, forever intertwined

Nothing is arbitrary. Everything matters.

**[Full Symbolism Analysis →](STORY.md)**

---

## What's Next

### Immediate (Current)

- ✅ Restructure into monorepo
- ✅ Preserve v0 with git history
- ✅ Extract and document complete narrative
- ✅ Document all mechanics, characters, items, Easter eggs
- 🔄 Research modern web game engines
- 🔄 Design v1 architecture
- ⏳ Plan AI integration strategy

### v1 Development

- Choose technology stack
- Design visual style (honoring original aesthetic)
- Implement core engine
- Port narrative to new format
- Enhance Easter egg system (secure backend)
- Add new content? (More years, more moments)
- Mobile optimization
- Accessibility improvements
- Beta testing with Anastasia
- Launch

### Future Possibilities

- **v2+:** Continued evolution
- **Other formats:** Visual novel? Point-and-click? Interactive fiction?
- **Other stories:** New chapters, new adventures
- **Community:** Tools for others to create game-to-reality experiences?

---

## License

The original text-engine is GPL licensed (see `v0-original-text-engine/license.md`).

The P&K Forever game content and story are personal creative works.

---

## A Note From Phoenix

*A year into knowing Anastasia, I still find myself unable to fully grasp who she is — not in a frustrating way, but in the way that keeps you paying attention. I am lucky to know her. I am lucky she's in my life.*

*This is my way of making something. I build software, and I have always wanted to make games — because games are where craft and meaning meet, and that matters to me.*

*She gave me back the belief that I had it in me to actually do it.*

*So I made this game.*

*For her.*

*Forever.*

---

## Contact & Links

- **Original Engine:** [text-engine by okaybenji](https://github.com/okaybenji/text-engine)
- **Deployment:** [Vercel](https://vercel.com)
- **Easter Eggs:** [IFTTT Maker Webhooks](https://ifttt.com/maker_webhooks)

---

**Created with 🧡 by Phoenix**

**For Anastasia 🖤**

**April 21, 2021 - Forever**

*And they lived happily ever after. In TLV Israel ✡️*

**THE END**

*(But also: the beginning)*
