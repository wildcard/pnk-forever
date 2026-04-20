/**
 * ACT 1: THE MEETING AT THE BEACH
 *
 * Specification for the opening act where Phoenix meets K.
 * This is the most critical part - it must perfectly preserve
 * the magic of the original v0 experience.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { GameState, CommandResult } from '../types'

describe('Feature: Beach Rest - Opening Scene', () => {
  let game: GameState

  beforeEach(() => {
    // GIVEN: A new game starts at the beach rest
    game = createNewGame()
  })

  describe('Scene Introduction', () => {
    it('should introduce Phoenix as the protagonist', () => {
      // WHEN: The game begins
      const intro = game.getCurrentSceneDescription()

      // THEN: Phoenix is introduced as a curious birdcat
      expect(intro).toContain('Phoenix')
      expect(intro).toContain('P.')
      expect(intro).toContain('birdcat')
      expect(intro).toContain('curious')
    })

    it('should set the scene at a beach slushy place', () => {
      const scene = game.getCurrentScene()

      expect(scene.name).toBe('Phoenix favorite beach Slushy place')
      expect(scene.location).toBe('beach_rest')
    })

    it('should prompt player to LOOK around', () => {
      const intro = game.getCurrentSceneDescription()

      expect(intro).toContain('Type **LOOK**')
      expect(intro).toContain('look around')
    })
  })

  describe('Scene: After Looking', () => {
    it('should reveal more details about Phoenix after LOOK command', () => {
      // WHEN: Player types LOOK
      const result = game.command('look')

      // THEN: Extended description appears
      expect(result.text).toContain('contemplating')
      expect(result.text).toContain('business')
      expect(result.text).toContain('talented')
      expect(result.text).toContain('skills')
    })

    it('should introduce the inciting incident - spotting K', () => {
      game.command('look')
      const description = game.getCurrentSceneDescription()

      // THEN: The dog on bicycle is mentioned
      expect(description).toContain('dog on a bicycle')
      expect(description).toContain('peacockdog')
      expect(description).toContain('shiba')
      expect(description).toContain('colorful feathers')
      expect(description).toContain('intriguing')
      expect(description).toContain('Fascinated')
    })
  })

  describe('Item: Slushy (The Opening Puzzle)', () => {
    it('should have a slushy available in the scene', () => {
      const items = game.getSceneItems('beach_rest')

      expect(items).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['slushy'])
        })
      )
    })

    it('should describe the slushy as yummy and cold', () => {
      const result = game.command('look at slushy')

      expect(result.text).toContain('Yummy')
      expect(result.text).toContain('cold')
      expect(result.text).toContain('nutritional')
      expect(result.text).toContain('exactly like P loves it')
      expect(result.text).toContain('😋')
    })

    it('should allow taking the slushy', () => {
      // WHEN: Player takes the slushy
      const result = game.command('take slushy')

      // THEN: Slushy is added to inventory
      expect(result.success).toBe(true)
      expect(game.getInventory()).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['slushy'])
        })
      )
    })

    it('should have exactly 3 gulps', () => {
      game.command('take slushy')
      const slushy = game.getInventoryItem('slushy')

      expect(slushy?.gulps).toBe(3)
    })

    it('should decrease gulps when used', () => {
      game.command('take slushy')

      // WHEN: Using the slushy
      game.command('use slushy')

      // THEN: Gulps decrease
      const slushy = game.getInventoryItem('slushy')
      expect(slushy?.gulps).toBe(2)
    })

    it('should print "gulp" when drinking', () => {
      game.command('take slushy')

      const result = game.command('use slushy')

      expect(result.text).toContain('gulp')
    })

    it('should remove exit block after first gulp', () => {
      game.command('take slushy')

      // WHEN: First gulp
      game.command('use slushy')

      // THEN: Can now go west
      const westExit = game.getExit('beach_rest', 'west')
      expect(westExit?.blocked).toBe(false)
    })

    it('should show remaining gulps after each use', () => {
      game.command('take slushy')

      const result = game.command('use slushy')

      expect(result.text).toMatch(/2.*slushy.*left/)
    })

    it('should remove slushy from inventory after 3 uses', () => {
      game.command('take slushy')
      game.command('use slushy')
      game.command('use slushy')

      // WHEN: Last gulp
      const result = game.command('use slushy')

      // THEN: Slushy is gone
      expect(result.text).toContain('last drop')
      expect(game.getInventory()).not.toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['slushy'])
        })
      )
    })

    it('should print cooling down message on first use', () => {
      game.command('take slushy')

      const result = game.command('use slushy')

      expect(result.text).toContain('cool down')
      expect(result.text).toContain('big gulp')
    })
  })

  describe('Navigation: Blocked Exit', () => {
    it('should block going west when too hot', () => {
      // WHEN: Trying to go west without slushy
      const result = game.command('go west')

      // THEN: Player is blocked
      expect(result.blocked).toBe(true)
      expect(result.text).toContain("too hot outside")
      expect(result.text).toContain("🥵")
    })

    it('should suggest using something COLD', () => {
      const result = game.command('go west')

      expect(result.text).toContain('COLD')
      expect(result.text).toMatch(/Maybe something.*can help/i)
    })

    it('should allow going west after drinking slushy', () => {
      game.command('take slushy')
      game.command('use slushy')

      // WHEN: Trying to go west after cooling down
      const result = game.command('go west')

      // THEN: Player can proceed
      expect(result.blocked).toBe(false)
      expect(game.getCurrentScene().id).toBe('beach')
    })
  })

  describe('Item: Door', () => {
    it('should have a door item that explains navigation', () => {
      const result = game.command('look at door')

      expect(result.text).toContain('WEST')
    })

    it('should hint to use GO command when door is used', () => {
      const result = game.command('use door')

      expect(result.text).toContain('Type GO WEST')
    })
  })
})

describe('Feature: The Beach - First Meeting with K', () => {
  let game: GameState

  beforeEach(() => {
    // GIVEN: Phoenix has moved to the beach
    game = createNewGame()
    game.enterScene('beach_rest')
    game.command('take slushy')
    game.command('use slushy')
    game.command('go west')
  })

  describe('Scene Description', () => {
    it('should show Phoenix is on the beach', () => {
      const scene = game.getCurrentScene()

      expect(scene.name).toContain('Beach')
      expect(scene.name).toContain('🏖')
    })

    it('should mention the fascinating DOG is here', () => {
      const description = game.getCurrentSceneDescription()

      expect(description).toContain('fascinating')
      expect(description).toContain('**DOG**')
      expect(description).toContain('here')
    })

    it('should update to show K by name after introductions', () => {
      // WHEN: Player learns K's name
      game.talkTo('dog')
      game.selectDialogueOption('NAME')

      // THEN: Description updates
      const description = game.getCurrentSceneDescription()
      expect(description).toContain('**K.**')
    })
  })

  describe('Character: K is present', () => {
    it('should have K as a character in this scene', () => {
      const characters = game.getCharactersInScene('beach')

      expect(characters).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['dog'])
        })
      )
    })

    it('should allow talking to K using various names', () => {
      const names = ['dog', 'peacockdog', 'shiba']

      names.forEach(name => {
        const result = game.command(`talk to ${name}`)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Item: Bicycle', () => {
    it('should have a bicycle in the scene', () => {
      const items = game.getSceneItems('beach')

      expect(items).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['bicycle', 'Brompton'])
        })
      )
    })

    it('should initially describe as "a bicycle"', () => {
      const result = game.command('look at bicycle')

      expect(result.text).toContain('bicycle')
    })

    it('should update to "K\'s bicycle" after learning name', () => {
      game.talkTo('dog')
      game.selectDialogueOption('NAME')

      const result = game.command('look at bicycle')

      expect(result.text).toContain("K's bicycle")
    })

    it('should not be takeable', () => {
      const result = game.command('take bicycle')

      expect(result.success).toBe(false)
    })
  })

  describe('Item: Shekel (Tutorial Item)', () => {
    it('should have a shekel coin hidden in the sand', () => {
      const result = game.command('look at shekel')

      expect(result.text).toContain('Shekel')
      expect(result.text).toContain('sand')
    })

    it('should be takeable', () => {
      const result = game.command('take shekel')

      expect(result.success).toBe(true)
      expect(game.getInventory()).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['shekel', 'coin', 'dime'])
        })
      )
    })

    it('should explain inventory system when taken', () => {
      const result = game.command('take shekel')

      expect(result.text).toContain('inventory')
      expect(result.text).toContain('Type **INV**')
      expect(result.text).toContain('use it at any time')
    })

    it('should flip heads or tails when used', () => {
      game.command('take shekel')

      const result = game.command('use shekel')

      expect(result.text).toMatch(/HEADS|TAILS/)
      expect(result.text).toContain('flip')
    })

    it('should be random (test multiple flips)', () => {
      game.command('take shekel')

      const results = new Set()
      // Flip 20 times, should get both heads and tails
      for (let i = 0; i < 20; i++) {
        const result = game.command('use shekel')
        results.add(result.text.includes('HEADS') ? 'HEADS' : 'TAILS')
      }

      expect(results.size).toBe(2) // Both outcomes should occur
    })
  })

  describe('Conversation: First Meeting with K', () => {
    beforeEach(() => {
      game.talkTo('dog')
    })

    it('should greet player when talked to', () => {
      const greeting = game.getLastDialogue()

      expect(greeting).toContain('Hi')
      expect(greeting).toContain('How can I help you')
    })

    it('should offer name topic', () => {
      const topics = game.getAvailableTopics()

      expect(topics).toContainEqual(
        expect.objectContaining({
          keyword: 'NAME',
          option: expect.stringContaining("What's your **NAME**")
        })
      )
    })

    describe('Topic: NAME', () => {
      it('should reveal K\'s name', () => {
        const result = game.selectDialogueOption('NAME')

        expect(result.text).toContain('Ehecatl')
        expect(result.text).toContain('everybody call me **K.**')
      })

      it('should update character name array', () => {
        game.selectDialogueOption('NAME')

        const k = game.getCharacter('dog')
        expect(k?.name).toContain('K.')
        expect(k?.name[0]).toBe('K.') // First name is now K.
      })

      it('should update character description', () => {
        game.selectDialogueOption('NAME')

        const k = game.getCharacter('K.')
        expect(k?.desc).toContain("It's K.")
      })

      it('should be removed after selection', () => {
        game.selectDialogueOption('NAME')

        const topics = game.getAvailableTopics()
        expect(topics).not.toContainEqual(
          expect.objectContaining({ keyword: 'NAME' })
        )
      })
    })

    describe('Topic: BICYCLE', () => {
      it('should be available from the start', () => {
        const topics = game.getAvailableTopics()

        expect(topics).toContainEqual(
          expect.objectContaining({
            keyword: 'BICYCLE',
            option: expect.stringContaining('BICYCLE')
          })
        )
      })

      it('should explain it\'s a Brompton', () => {
        const result = game.selectDialogueOption('BICYCLE')

        expect(result.text).toContain('Brompton')
        expect(result.text).toContain('folding bicycle')
      })
    })

    describe('Topic: BUSINESS', () => {
      it('should require NAME prerequisite', () => {
        const topics = game.getAvailableTopics()

        // Should not be available yet
        expect(topics).not.toContainEqual(
          expect.objectContaining({ keyword: 'BUSINESS' })
        )
      })

      it('should appear after NAME is selected', () => {
        game.selectDialogueOption('NAME')

        const topics = game.getAvailableTopics()
        expect(topics).toContainEqual(
          expect.objectContaining({ keyword: 'BUSINESS' })
        )
      })

      it('should show K is willing to help', () => {
        game.selectDialogueOption('NAME')
        const result = game.selectDialogueOption('BUSINESS')

        expect(result.text).toContain('ask away')
      })
    })

    describe('Topic: ARTIST', () => {
      it('should require BUSINESS prerequisite', () => {
        game.selectDialogueOption('NAME')

        const topics = game.getAvailableTopics()
        expect(topics).not.toContainEqual(
          expect.objectContaining({ keyword: 'ARTIST' })
        )
      })

      it('should mention dog portrait business', () => {
        game.selectDialogueOption('NAME')
        game.selectDialogueOption('BUSINESS')
        const result = game.selectDialogueOption('ARTIST')

        expect(result.text).toContain('dog portrait business')
        expect(result.text).toContain('help out')
      })
    })

    describe('Topic: CONTINUE (Unlock Sunset)', () => {
      it('should require both BUSINESS and ARTIST', () => {
        game.selectDialogueOption('NAME')
        game.selectDialogueOption('BUSINESS')

        const topics = game.getAvailableTopics()
        expect(topics).not.toContainEqual(
          expect.objectContaining({ keyword: 'CONTINUE' })
        )
      })

      it('should appear after prerequisites met', () => {
        game.selectDialogueOption('NAME')
        game.selectDialogueOption('BUSINESS')
        game.selectDialogueOption('ARTIST')

        const topics = game.getAvailableTopics()
        expect(topics).toContainEqual(
          expect.objectContaining({ keyword: 'CONTINUE' })
        )
      })

      it('should invite to walk to Jaffa', () => {
        game.selectDialogueOption('NAME')
        game.selectDialogueOption('BUSINESS')
        game.selectDialogueOption('ARTIST')

        const result = game.selectDialogueOption('CONTINUE')

        expect(result.text).toContain('sunset')
        expect(result.text).toContain('Jaffa')
        expect(result.text).toContain('**SOUTH**')
      })

      it('should unlock south exit', () => {
        game.selectDialogueOption('NAME')
        game.selectDialogueOption('BUSINESS')
        game.selectDialogueOption('ARTIST')
        game.selectDialogueOption('CONTINUE')

        const southExit = game.getExit('beach', 'south')
        expect(southExit?.blocked).toBe(false)
      })
    })
  })

  describe('Navigation: To Sunset', () => {
    it('should block south initially', () => {
      const result = game.command('go south')

      expect(result.blocked).toBe(true)
      expect(result.text).toContain("There's still much to do here")
    })

    it('should allow south after conversation complete', () => {
      game.talkTo('dog')
      game.selectDialogueOption('NAME')
      game.selectDialogueOption('BUSINESS')
      game.selectDialogueOption('ARTIST')
      game.selectDialogueOption('CONTINUE')

      const result = game.command('go south')

      expect(result.blocked).toBe(false)
      expect(game.getCurrentScene().id).toBe('beach_sunset')
    })
  })
})

describe('Feature: Narrative Preservation from v0', () => {
  it('should preserve exact ASCII art from v0', () => {
    const game = createNewGame()
    const art = game.getSceneArt('beach_rest')

    // Exact preservation of the birdcat ASCII art
    expect(art).toContain('.-\'.\'    Ä.-.Ä    \'.\'-.')
    expect(art).toContain('( ^ \\`>')
  })

  it('should preserve exact wording from v0 descriptions', () => {
    const game = createNewGame()
    game.command('look')
    const desc = game.getCurrentSceneDescription()

    // Key phrases from v0 must be preserved
    expect(desc).toContain('acai 🫐 duhh')
    expect(desc).toContain('contemplating about her business')
    expect(desc).toContain('P. Is very talented & has many skills')
  })

  it('should preserve emoji usage from v0', () => {
    const game = createNewGame()
    game.command('look')
    const desc = game.getCurrentSceneDescription()

    expect(desc).toContain('🥤')
    expect(desc).toContain('🫐')
    expect(desc).toContain('🌞')
    expect(desc).toContain('🐕🦚')
    expect(desc).toContain('🐾')
  })
})

// Helper type definitions
function createNewGame(): GameState {
  throw new Error('Implementation needed')
}

declare global {
  interface GameState {
    getCurrentScene(): Scene
    getCurrentSceneDescription(): string
    getSceneItems(sceneId: string): Item[]
    getCharactersInScene(sceneId: string): Character[]
    getInventory(): Item[]
    getInventoryItem(name: string): Item | undefined
    getExit(sceneId: string, direction: string): Exit | undefined
    getCharacter(name: string): Character | undefined
    getAvailableTopics(): Topic[]
    getLastDialogue(): string
    getSceneArt(sceneId: string): string

    command(input: string): CommandResult
    enterScene(sceneId: string): void
    talkTo(characterName: string): void
    selectDialogueOption(keyword: string): CommandResult
  }

  interface Scene {
    id: string
    name: string
    location: string
  }

  interface Item {
    name: string[]
    desc: string
    gulps?: number
  }

  interface Character {
    name: string[]
    desc: string
  }

  interface Exit {
    dir: string
    id: string
    blocked: boolean
  }

  interface Topic {
    keyword: string
    option: string
    prereqs?: string[]
  }
}
