# P&K Forever v1 - Specifications

## Specification-Driven Development

This directory contains executable specifications that define the behavior of P&K Forever v1. Each specification describes **what** the game should do, independent of **how** it's implemented.

## Philosophy

> "Write the specification first. Let the spec drive the implementation. The implementation serves the spec, the spec serves the story, the story serves the player."

### Principles

1. **Specifications are executable** - Every spec can be run as a test
2. **Specifications are readable** - Written in BDD style (Given/When/Then)
3. **Specifications are comprehensive** - Cover all game behaviors
4. **Specifications preserve the original** - v0 behaviors are sacred
5. **Specifications enable evolution** - New features get new specs

## Structure

```
spec/
├── README.md                          # This file
├── narrative/                         # Story flow specifications
│   ├── act1-beach.spec.ts            # Meeting at the beach
│   ├── act2-jaffa.spec.ts            # Sunset walk and apartment
│   ├── act3-japan.spec.ts            # Flash-forward to Kyoto
│   └── act4-home.spec.ts             # Return to TLV
├── characters/                        # Character behavior specs
│   ├── phoenix.spec.ts               # Phoenix behaviors
│   ├── k.spec.ts                     # K behaviors and conversations
│   └── relationship.spec.ts          # Relationship progression
├── items/                             # Item and inventory specs
│   ├── slushy.spec.ts                # The opening puzzle
│   ├── shekel.spec.ts                # Tutorial item
│   ├── necklace.spec.ts              # The ultimate gift
│   └── inventory.spec.ts             # Inventory system
├── easter-eggs/                       # Easter egg system specs
│   ├── triggers.spec.ts              # When eggs should trigger
│   ├── api.spec.ts                   # Backend API behavior
│   └── tracking.spec.ts              # Preventing duplicates
├── ai/                                # AI integration specs
│   ├── dynamic-dialogue.spec.ts      # AI conversation mode
│   ├── reflections.spec.ts           # Personalized reflections
│   └── safety.spec.ts                # Canon preservation
└── systems/                           # Core systems
    ├── save-load.spec.ts             # Save/load functionality
    ├── navigation.spec.ts            # Scene transitions
    └── commands.spec.ts              # Player commands

```

## Running Specs

```bash
# Run all specs
npm run spec

# Watch mode (re-run on changes)
npm run spec:watch

# Run specific spec file
npm run spec spec/narrative/act1-beach.spec.ts

# Run with UI
npm run test:ui
```

## Writing Specs

### BDD Format

Use Given/When/Then structure:

```typescript
describe('Feature: Phoenix discovers the slushy', () => {
  it('should prevent leaving when too hot', () => {
    // GIVEN: Phoenix is at beach rest on a hot day
    const game = createGame()
    game.enterScene('beach_rest')

    // WHEN: Phoenix tries to go west without cooling down
    const result = game.command('go west')

    // THEN: She is blocked with a heat warning
    expect(result.blocked).toBe(true)
    expect(result.message).toContain('too hot')
  })

  it('should allow leaving after drinking slushy', () => {
    // GIVEN: Phoenix has taken and used the slushy
    const game = createGame()
    game.enterScene('beach_rest')
    game.command('take slushy')
    game.command('use slushy')
    game.command('use slushy')
    game.command('use slushy') // 3 gulps

    // WHEN: Phoenix tries to go west
    const result = game.command('go west')

    // THEN: She can proceed to the beach
    expect(result.blocked).toBe(false)
    expect(game.currentScene).toBe('beach')
  })
})
```

### Specification Language

**Use descriptive names:**
- ✅ `should prevent leaving when Phoenix hasn't cooled down`
- ❌ `test1`

**Write from player perspective:**
- ✅ "When Phoenix says 'I love you'"
- ❌ "When love flag is set to true"

**Test behavior, not implementation:**
- ✅ "Easter egg should trigger webhook"
- ❌ "fetch() should be called with IFTTT URL"

## Spec Coverage Goals

- ✅ Every v0 behavior preserved (100% parity)
- ✅ Every new v1 feature specified
- ✅ Every Easter egg validated
- ✅ Every conversation path tested
- ✅ Every item interaction verified
- ✅ Every scene transition confirmed

## Validation

Before implementation begins, specs should cover:

1. **Complete narrative flow** - All scenes, transitions, and story beats
2. **All conversations** - Every dialogue tree, topic, and prerequisite
3. **All items** - Every item, its properties, and interactions
4. **All Easter eggs** - Triggers, webhooks, confirmations, tracking
5. **Save/load** - State preservation, cloud sync, version compatibility
6. **AI features** - Dynamic dialogue, safety constraints, fallbacks

## The Spec-First Workflow

1. **Write spec** describing desired behavior
2. **Run spec** - it should fail (red)
3. **Implement** minimum code to make spec pass
4. **Run spec** - it should pass (green)
5. **Refactor** - improve code quality
6. **Run spec** - still passes (green)
7. **Repeat** for next feature

This is **Red-Green-Refactor** TDD cycle.

## Why Spec-Driven?

**For P&K Forever specifically:**

1. **Preserves v0 accuracy** - Specs ensure every v0 behavior is replicated exactly
2. **Enables confident refactoring** - Change implementation, specs ensure behavior unchanged
3. **Documents the game** - Specs are living documentation
4. **Prevents regressions** - New features can't break old behaviors
5. **Validates Easter eggs** - Critical that these work perfectly
6. **Proves AI safety** - Specs enforce canon preservation
7. **Honors the original** - Implementation can change, behavior cannot

## Success Criteria

v1 is ready for Anastasia when:

- ✅ All specs pass (100% green)
- ✅ Coverage > 90%
- ✅ Every v0 behavior validated
- ✅ Every Easter egg tested
- ✅ AI features proven safe
- ✅ Save/load verified
- ✅ Mobile interactions confirmed

Then and only then: **Ship it. 🧡🖤**

---

*"Technology serves the story. Specs serve the technology. Therefore: Specs serve the story."*

**Let the specifications guide us.**
