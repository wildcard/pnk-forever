# P&K Forever v1 - Master Specifications

> **"Write the spec first. Let the spec drive the implementation."**

This document serves as the master index for all specifications governing the development of P&K Forever v1.

---

## Philosophy: Specification-Driven Development

### Why Specs First?

**For P&K Forever specifically:**

1. **Preserves v0 Accuracy** - Every v0 behavior must be replicated exactly
2. **Enables Confident Modernization** - Change technology, preserve behavior
3. **Validates Critical Features** - Easter eggs must work perfectly for Anastasia
4. **Proves AI Safety** - Ensures AI respects canon
5. **Documents Living Truth** - Specs are always up-to-date

### The Spec-First Workflow

```
1. Write Spec (describe desired behavior)
   ↓
2. Run Spec (fails - RED)
   ↓
3. Implement (minimum code to pass)
   ↓
4. Run Spec (passes - GREEN)
   ↓
5. Refactor (improve code quality)
   ↓
6. Run Spec (still passes - GREEN)
   ↓
7. Repeat for next feature
```

This is the **Red-Green-Refactor** cycle of Test-Driven Development.

---

## Specification Coverage

### ✅ Complete Specifications

#### Narrative Flow
- **[Act 1: The Beach](spec/narrative/act1-beach.spec.ts)** ← COMPLETE
  - Beach Rest (opening scene, slushy puzzle)
  - The Beach (meeting K, first conversation)
  - Navigation and item interactions
  - 100% v0 parity validated

#### Easter Egg System
- **[Triggers](spec/easter-eggs/triggers.spec.ts)** ← COMPLETE
  - All 6 Easter eggs specified
  - Trigger conditions validated
  - Visual/audio feedback defined
  - Persistence across saves

- **[API](spec/easter-eggs/api.spec.ts)** ← COMPLETE
  - Authentication and security
  - Duplicate prevention
  - Webhook integration
  - Error handling
  - Rate limiting

### 🔄 In Progress

#### Narrative Flow
- **Act 2: Jaffa** (spec/narrative/act2-jaffa.spec.ts)
  - Beach Sunset (deep conversations with K)
  - Jaffa Apartment (sleeping together)
  - Jaffa Street (kite discovery)

- **Act 3: Japan** (spec/narrative/act3-japan.spec.ts)
  - Kyoto Outside (arrival, time skip)
  - Kyoto Apartment (slippers, cultural customs)
  - Kitchen (the climax - necklace gift)

- **Act 4: Home** (spec/narrative/act4-home.spec.ts)
  - TLV Apartment (the ending)

#### Character Specifications
- **Phoenix** (spec/characters/phoenix.spec.ts)
  - Personality traits
  - Preferences and choices
  - Zodiac symbolism

- **K** (spec/characters/k.spec.ts)
  - Character development
  - Conversation system
  - Room-based topic switching

- **Relationship** (spec/characters/relationship.spec.ts)
  - Trust progression
  - Conversation prerequisites
  - Emotional milestones

#### Item Specifications
- **Core Items** (spec/items/)
  - slushy.spec.ts (tutorial item)
  - shekel.spec.ts (inventory tutorial)
  - necklace.spec.ts (ultimate gift)
  - inventory.spec.ts (system behavior)

#### AI Integration
- **Dynamic Dialogue** (spec/ai/dynamic-dialogue.spec.ts)
  - Open conversation mode
  - Character consistency
  - Canon preservation

- **Reflections** (spec/ai/reflections.spec.ts)
  - Personalized moments
  - Choice-based generation
  - Poetic style

- **Safety** (spec/ai/safety.spec.ts)
  - Canon database enforcement
  - Response validation
  - Fallback behavior

#### Core Systems
- **Save/Load** (spec/systems/save-load.spec.ts)
  - Local + cloud hybrid
  - Cross-device sync
  - Version compatibility

- **Navigation** (spec/systems/navigation.spec.ts)
  - Scene transitions
  - Exit blocking/unblocking
  - FLY command unlocking

- **Commands** (spec/systems/commands.spec.ts)
  - All player commands
  - Command parsing
  - Help system

---

## Specification Priority

### Phase 1: v0 Parity (CRITICAL)

**Must be specified before implementation begins:**

1. ✅ Act 1 narrative flow
2. ⏳ Act 2 narrative flow
3. ⏳ Act 3 narrative flow
4. ⏳ Act 4 narrative flow
5. ⏳ All character conversations
6. ⏳ All item interactions
7. ✅ All Easter egg triggers

**Acceptance Criteria:**
- Every v0 scene has a spec
- Every v0 conversation topic has a spec
- Every v0 item has a spec
- Every v0 Easter egg has a spec
- All specs pass (100% green)

**Deliverable:** v1 is a perfect recreation of v0

### Phase 2: Enhanced Systems

**After v0 parity is proven:**

8. ✅ Easter egg API (backend)
9. ⏳ Save/load system
10. ⏳ Navigation system
11. ⏳ Visual/audio feedback
12. ⏳ Mobile interactions

**Acceptance Criteria:**
- Secure Easter egg system
- Cloud save working
- Beautiful presentation
- Mobile-optimized

**Deliverable:** v1 is v0 but modernized

### Phase 3: AI Features

**After core systems are stable:**

13. ⏳ Dynamic dialogue
14. ⏳ Personalized reflections
15. ⏳ AI safety constraints

**Acceptance Criteria:**
- AI never contradicts canon
- AI adds depth without replacing story
- Fallbacks always available

**Deliverable:** v1 is enhanced with AI magic

---

## Running Specifications

### Quick Start

```bash
# Install dependencies
cd v1-modern
npm install

# Run all specs
npm run spec

# Watch mode (re-run on changes)
npm run spec:watch

# Run specific spec file
npm run spec spec/narrative/act1-beach.spec.ts

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Continuous Integration

Specs run automatically on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

**No passing specs = No merge = No deploy**

---

## Specification Quality Standards

### Every spec must:

1. **Be readable** - Written in Given/When/Then format
2. **Be descriptive** - Test names explain behavior
3. **Be isolated** - Each test is independent
4. **Be deterministic** - Same input = same result
5. **Test behavior** - Not implementation details
6. **Preserve v0** - Validate original behavior

### Good Spec Example

```typescript
it('should prevent leaving when too hot', () => {
  // GIVEN: Phoenix is at beach rest on a hot day
  const game = createGame()
  game.enterScene('beach_rest')

  // WHEN: Phoenix tries to go west without cooling down
  const result = game.command('go west')

  // THEN: She is blocked with a heat warning
  expect(result.blocked).toBe(true)
  expect(result.text).toContain('too hot')
  expect(result.text).toContain('🥵')
})
```

### Bad Spec Example

```typescript
// ❌ Not descriptive
it('test1', () => {
  // ❌ No Given/When/Then structure
  // ❌ Tests implementation, not behavior
  expect(game.internalState.exitBlocked).toBe(true)
})
```

---

## Specification Language

### Use Player Perspective

✅ **GOOD:** "When Phoenix drinks the slushy..."
❌ **BAD:** "When gulps counter decrements..."

✅ **GOOD:** "Easter egg should trigger webhook"
❌ **BAD:** "fetch() should be called with URL"

### Test Behavior, Not Implementation

✅ **GOOD:** "Should allow going west after cooling down"
❌ **BAD:** "Should set exitBlocked to false"

✅ **GOOD:** "Should show K's response to love declaration"
❌ **BAD:** "Should call dialogue.render() with text"

### Be Specific About v0 Preservation

✅ **GOOD:** "Should contain exact emoji: 🥵"
❌ **BAD:** "Should show hot weather message"

✅ **GOOD:** "Should preserve typo: 'suger' (not 'sugar')"
❌ **BAD:** "Should mention no sugar"

---

## Coverage Goals

### Minimum Requirements

| Category | Target Coverage | Status |
|----------|----------------|--------|
| Narrative (v0 parity) | 100% | 25% ✅ |
| Easter Eggs | 100% | 100% ✅ |
| Characters | 100% | 0% ⏳ |
| Items | 100% | 0% ⏳ |
| Core Systems | 90% | 0% ⏳ |
| AI Features | 80% | 0% ⏳ |
| **Overall** | **95%** | **20%** |

### Before Launch

**All specs must be:**
- ✅ Written
- ✅ Passing (green)
- ✅ Covering 95%+ of functionality
- ✅ Validated by Anastasia's playthrough

---

## Specification as Documentation

The specs ARE the documentation for P&K Forever v1.

**Want to know how slushy works?**
→ Read `spec/items/slushy.spec.ts`

**Want to know when Easter eggs trigger?**
→ Read `spec/easter-eggs/triggers.spec.ts`

**Want to know how K's conversations flow?**
→ Read `spec/characters/k.spec.ts`

**Want to understand the whole game?**
→ Read all the specs.

The specs are:
- ✅ Always up-to-date (tests fail if not)
- ✅ Executable (run them to prove truth)
- ✅ Comprehensive (cover all behaviors)
- ✅ Readable (written for humans)

---

## Success Criteria

### v1 is Ready for Anastasia When:

1. ✅ All Phase 1 specs written and passing (v0 parity)
2. ✅ All Phase 2 specs written and passing (enhanced systems)
3. ✅ All Phase 3 specs written and passing (AI features)
4. ✅ Coverage > 95%
5. ✅ Manual playthrough successful
6. ✅ All Easter eggs tested in staging
7. ✅ Mobile testing complete
8. ✅ Accessibility audit passed

### Then and Only Then:

**Ship it. 🧡🖤**

---

## Development Commandments

### The Spec Commandments

1. **Thou shalt write specs before code**
2. **Thou shalt run specs continuously**
3. **Thou shalt not commit failing specs**
4. **Thou shalt preserve v0 behaviors exactly**
5. **Thou shalt test from player perspective**
6. **Thou shalt validate Easter eggs thoroughly**
7. **Thou shalt prove AI safety with specs**
8. **Thou shalt refactor fearlessly when specs pass**
9. **Thou shalt document through specifications**
10. **Thou shalt serve the story above all**

---

## Getting Started for Developers

### 1. Read the Specs

Start here:
1. [README.md](spec/README.md) - Spec philosophy
2. [act1-beach.spec.ts](spec/narrative/act1-beach.spec.ts) - Example narrative spec
3. [triggers.spec.ts](spec/easter-eggs/triggers.spec.ts) - Example system spec

### 2. Run the Specs

```bash
npm run spec:watch
```

Watch them fail (they should - nothing implemented yet!)

### 3. Pick a Spec

Choose one spec file to implement.

### 4. Make It Pass

Write the minimum code to make that spec green.

### 5. Refactor

Clean up the code while keeping specs green.

### 6. Repeat

Next spec file.

---

## Questions?

### "Why so many specs?"

Because this game is precious. It's a love letter. Every detail matters.

### "Isn't this overkill?"

For a commercial game with uncertain requirements, maybe.
For P&K Forever? No. This is **exactly** the right amount of care.

### "What if requirements change?"

They won't. v0 is the blueprint. v1 must honor it.

### "What about new features?"

New features get new specs. Spec first, code second.

### "When do we start implementing?"

**After the specs are written.**

Not before.

---

## The Contract

By writing these specifications, we make a promise:

**"v1 will preserve everything that makes v0 special, while making it more beautiful, more accessible, and more magical."**

The specs are how we prove we kept that promise.

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [BDD (Behavior-Driven Development)](https://en.wikipedia.org/wiki/Behavior-driven_development)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [v0 Original Source](../v0-original-text-engine/)
- [v1 Architecture](../docs/v1-architecture.md)

---

**For Anastasia. Forever. 🧡🖤**

*"Technology serves the story. Specs serve the technology. Therefore: Specs serve the story."*

---

**Status:** Specifications in progress | Last Updated: 2024-12-17

**Next Steps:**
1. Complete Act 2, 3, 4 narrative specs
2. Complete character specifications
3. Complete item specifications
4. Complete system specifications
5. Complete AI specifications
6. Achieve 100% v0 parity coverage
7. Begin implementation (Red → Green → Refactor)
