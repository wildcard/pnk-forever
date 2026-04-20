# P&K Forever v1 - Modern Reimagining

> **Same soul, modern canvas**

This is v1 of P&K Forever - a modern, spec-driven reimplementation of the original v0 text adventure game, preserving every emotional beat while enabling enhanced presentation and AI-powered magic.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run specifications
npm run spec

# Run specs in watch mode
npm run spec:watch

# Start development server (when implementation begins)
npm run dev

# Build for production
npm run build
```

---

## Project Status

**Current Phase:** ✍️ **Specification Development**

- ✅ Project structure created
- ✅ Test infrastructure configured (Vitest)
- ✅ Act 1 narrative specs complete
- ✅ Easter egg system specs complete
- ✅ Easter egg API specs complete
- ⏳ Act 2-4 narrative specs
- ⏳ Character specs
- ⏳ Item specs
- ⏳ System specs
- ⏳ AI integration specs

**Next:** Complete all specifications before implementation begins.

---

## Philosophy

### Specification-Driven Development

We write the specs first. The specs describe **what** the game should do, independent of **how** it's implemented.

**Process:**
1. Write spec (describing desired behavior)
2. Run spec → fails (RED)
3. Implement minimum code to pass
4. Run spec → passes (GREEN)
5. Refactor code for quality
6. Run spec → still passes (GREEN)
7. Repeat

This ensures:
- ✅ v0 behaviors are preserved exactly
- ✅ Easter eggs work perfectly
- ✅ AI features respect canon
- ✅ Confident refactoring (specs don't break)
- ✅ Living documentation

### Core Principles

1. **Preserve the Original** - v0 is sacred, every behavior must be replicated
2. **Story First** - Technology serves the narrative, not the reverse
3. **Spec First** - Write specifications before implementation
4. **Test Continuously** - Specs run on every change
5. **For Anastasia** - This game was made for one person, never forget that

---

## Documentation

### Primary Documents

- **[SPECIFICATIONS.md](SPECIFICATIONS.md)** - Master specification index
- **[spec/README.md](spec/README.md)** - Specification philosophy and guide
- **[../docs/v1-architecture.md](../docs/v1-architecture.md)** - Technical architecture
- **[../docs/v1-engine-research.md](../docs/v1-engine-research.md)** - Engine comparison
- **[../STORY.md](../STORY.md)** - The complete narrative
- **[../README.md](../README.md)** - Project overview

### Specifications (Living Documentation)

All specifications are in `spec/`:

```
spec/
├── narrative/          # Story flow specs
├── characters/         # Character behavior specs
├── items/             # Item interaction specs
├── easter-eggs/       # Easter egg system specs
├── ai/                # AI integration specs
└── systems/           # Core systems specs
```

Read the specs to understand how the game works.

---

## Technology Stack

### Recommended (from research)

**Game Engine:** Narrat
- Story-first narrative RPG engine
- Web-native, TypeScript-based
- Active 2025 development

**Core Stack:**
- TypeScript - Type-safe development
- Vite - Fast build tool
- Vue 3 - UI framework
- Vitest - Testing framework

**Backend:**
- Node.js + Express (or Cloudflare Workers)
- PostgreSQL or Supabase
- Secure Easter egg API

**See:** [v1-engine-research.md](../docs/v1-engine-research.md) for full analysis

---

## Development Workflow

### Before Writing Code

1. **Read v0** - Understand the original (`../v0-original-text-engine/`)
2. **Read Specs** - See what's already specified (`spec/`)
3. **Read Architecture** - Understand the technical design (`../docs/v1-architecture.md`)
4. **Read Story** - Know the narrative deeply (`../STORY.md`)

### Writing Specs

1. **Choose a feature** from the backlog
2. **Write a spec** describing its behavior (Given/When/Then)
3. **Run the spec** - it should fail (nothing implemented yet)
4. **Commit the spec** to version control

### Implementing Features

1. **Pick a failing spec**
2. **Write minimum code** to make it pass
3. **Run specs** - should turn green
4. **Refactor** - improve code quality
5. **Run specs** - should stay green
6. **Commit** the implementation

### Continuous Testing

```bash
# Keep this running while developing
npm run spec:watch
```

Specs re-run automatically on file changes.

---

## Project Structure

```
v1-modern/
├── package.json                 # Dependencies
├── vite.config.ts              # Build configuration
├── tsconfig.json               # TypeScript config
│
├── spec/                        # Specifications (THE SOURCE OF TRUTH)
│   ├── README.md
│   ├── narrative/
│   ├── characters/
│   ├── items/
│   ├── easter-eggs/
│   ├── ai/
│   └── systems/
│
├── src/                         # Implementation (serves the specs)
│   ├── scripts/                # Narrat narrative scripts
│   ├── data/                   # Game data (YAML)
│   ├── integrations/           # Easter egg system
│   ├── ai/                     # AI features
│   └── utils/
│
├── backend/                     # Backend API
│   ├── routes/
│   ├── db/
│   └── middleware/
│
├── public/                      # Static assets
│   ├── images/
│   ├── audio/
│   └── fonts/
│
└── tests/                       # Integration tests
```

---

## Key Features

### v0 Parity (Phase 1)

✅ **Complete Narrative Port**
- Every scene from v0
- Every conversation topic
- Every item interaction
- Exact dialogue preservation
- ASCII art preservation

✅ **Easter Egg System**
- All 6 Easter eggs from v0
- Secure backend API (keys not exposed)
- Webhook integration (IFTTT)
- Trigger tracking and prevention of duplicates
- Real-world hints (like drawer #4)

### Enhancements (Phase 2)

🎨 **Visual Design**
- Retro-modern aesthetic
- Location artwork
- Character portraits
- Smooth animations
- Mobile-responsive

🎵 **Audio Atmosphere**
- Ambient soundscapes
- Music themes per act
- Sound effects
- Easter egg chimes

💾 **Better Save System**
- Local + cloud hybrid
- Cross-device sync
- Version-safe migrations

📱 **Mobile Optimization**
- Touch-first interactions
- PWA capability (offline play)
- Responsive layouts

### AI Magic (Phase 3)

🤖 **Dynamic Dialogue**
- Open conversation mode with K
- AI maintains character consistency
- Canon constraints enforced

✨ **Personalized Reflections**
- Choice-based poetry generation
- Emotional milestone summaries

🖼️ **Memory Photographs**
- AI-generated scene illustrations
- Collectible gallery of moments

---

## Easter Eggs

The game contains 6 Easter eggs that trigger real-world surprises:

| Trigger | Event | What Happens |
|---------|-------|--------------|
| Phoenix loves MANGO 🥭 | `pnk_mango` | Mangoes appear in real life |
| Phoenix drinks TEA 🫖 | `pnk_drink` | Tea is prepared (Mint & Lemon verbena, no sugar) |
| Phoenix loves CHOCOLATE 🍫 | `pnk_chocolate` | Check drawer #4... |
| Phoenix finds KITE 🪁 | `pnk_kite` | Discount code: `PNK-n3zk7MAMBG-GIFT` |
| Phoenix says "I LOVE you" 🧡🖤 | `pnk_love` | Something beautiful happens |
| Phoenix uses necklace ✈️ | `pnk_fly` | The ultimate surprise |

**See:** [spec/easter-eggs/](spec/easter-eggs/) for complete specifications

---

## Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| Narrative (v0 parity) | 100% | 25% |
| Easter Eggs | 100% | 100% |
| Characters | 100% | 0% |
| Items | 100% | 0% |
| Core Systems | 90% | 0% |
| AI Features | 80% | 0% |
| **Overall** | **95%** | **20%** |

**Before launch:** All specs must be written and passing.

---

## Contributing

This is a personal project, but contributions to the specification phase are welcome.

### How to Contribute

1. **Read the specs** - Understand what's already specified
2. **Pick an unspecified feature** - Check SPECIFICATIONS.md for gaps
3. **Write a spec** - Following BDD format (Given/When/Then)
4. **Submit PR** - With the new specification

**Do NOT implement features before specs are written.**

---

## Development Phases

### Phase 1: Specification (Current)
**Goal:** Write complete specifications for all features
**Duration:** 2-3 weeks
**Deliverable:** 95%+ spec coverage, all specs passing

### Phase 2: v0 Parity Implementation
**Goal:** Perfect recreation of v0 in new tech
**Duration:** 4-6 weeks
**Deliverable:** v1 that plays identically to v0

### Phase 3: Enhancement
**Goal:** Visual, audio, mobile improvements
**Duration:** 4 weeks
**Deliverable:** Beautiful, polished experience

### Phase 4: AI Integration
**Goal:** Add AI features safely
**Duration:** 2 weeks
**Deliverable:** AI-enhanced but canon-respectful

### Phase 5: Beta & Launch
**Goal:** Test with Anastasia, fix issues
**Duration:** 1-2 weeks
**Deliverable:** Production-ready v1 🧡🖤

---

## Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Testing
npm run test               # Run all tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report
npm run spec               # Run specifications
npm run spec:watch         # Watch specifications

# Type Checking
npm run typecheck          # Check TypeScript
```

---

## Resources

### Internal
- [v0 Original Game](../v0-original-text-engine/)
- [Complete Story](../STORY.md)
- [Architecture](../docs/v1-architecture.md)
- [Engine Research](../docs/v1-engine-research.md)

### External
- [Narrat Documentation](https://narrat.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [BDD Guide](https://cucumber.io/docs/bdd/)

---

## The Promise

v1 will preserve everything that makes v0 special, while making it:
- ✨ More beautiful
- 🎵 More atmospheric
- 📱 More accessible
- 🤖 More magical
- 🧡🖤 More of itself

**The specs are how we prove we kept that promise.**

---

**For Anastasia. Forever. 🧡🖤**

*Built with Claude Code, continuing the tradition of AI helping create love letters in code.*

**Status:** Specifications in progress
**Last Updated:** 2024-12-17
