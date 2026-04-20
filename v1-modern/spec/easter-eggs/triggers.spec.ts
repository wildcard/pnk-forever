/**
 * EASTER EGG SYSTEM - TRIGGERS
 *
 * Specifications for when and how Easter eggs should be triggered.
 * These are CRITICAL - they create real-world magic for Anastasia.
 * Every trigger must be tested and validated.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { GameState, EasterEgg, EasterEggTriggerResult } from '../types'

describe('Feature: Easter Egg Discovery and Triggering', () => {
  let game: GameState

  beforeEach(() => {
    game = createNewGame()
  })

  describe('Easter Egg: Mango Revelation 🥭', () => {
    beforeEach(() => {
      // GIVEN: Phoenix is at beach sunset talking to K
      game.navigateToScene('beach_sunset')
      game.talkTo('k')
    })

    it('should be available after FOOD topic', () => {
      // WHEN: Player selects FOOD topic
      game.selectDialogueOption('FOOD')

      // THEN: MANGO option appears
      const topics = game.getAvailableTopics()
      expect(topics).toContainEqual(
        expect.objectContaining({ keyword: 'MANGO' })
      )
    })

    it('should trigger Easter egg when MANGO selected', async () => {
      const triggerSpy = vi.fn()
      game.onEasterEggTrigger(triggerSpy)

      // WHEN: Player reveals mango preference
      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // THEN: Easter egg is triggered
      expect(triggerSpy).toHaveBeenCalledWith({
        id: 'mango',
        name: 'Mango Revelation',
        timestamp: expect.any(Number)
      })
    })

    it('should send correct webhook event', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // THEN: API called with correct event
      expect(apiSpy).toHaveBeenCalledWith('pnk_mango', {
        value1: 'mango'
      })
    })

    it('should show confirmation to player', async () => {
      game.selectDialogueOption('FOOD')
      const result = await game.selectDialogueOption('MANGO')

      // THEN: Player sees magical confirmation
      expect(result.easterEggTriggered).toBe(true)
      expect(result.text).toContain('✨')
      expect(result.text).toMatch(/secret|magical|special/)
    })

    it('should be removed after selection (removeOnRead)', async () => {
      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // THEN: MANGO topic no longer available
      const topics = game.getAvailableTopics()
      expect(topics).not.toContainEqual(
        expect.objectContaining({ keyword: 'MANGO' })
      )
    })

    it('should only trigger once per playthrough', async () => {
      const triggerSpy = vi.fn()
      game.onEasterEggTrigger(triggerSpy)

      // WHEN: Trying to trigger twice (hypothetically)
      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // Load save and try again
      const saveData = game.save()
      const newGame = createGameFromSave(saveData)
      newGame.onEasterEggTrigger(triggerSpy)

      newGame.navigateToScene('beach_sunset')
      newGame.talkTo('k')

      // THEN: MANGO not available again
      const topics = newGame.getAvailableTopics()
      expect(topics).not.toContainEqual(
        expect.objectContaining({ keyword: 'MANGO' })
      )

      // Only triggered once
      expect(triggerSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Easter Egg: Tea Preference 🫖', () => {
    beforeEach(() => {
      game.navigateToScene('beach_sunset')
      game.talkTo('k')
    })

    it('should require DRINK prerequisite', () => {
      const topics = game.getAvailableTopics()

      // TEA not available without DRINK
      expect(topics).not.toContainEqual(
        expect.objectContaining({ keyword: 'TEA' })
      )
    })

    it('should appear after DRINK topic', () => {
      game.selectDialogueOption('DRINK')

      const topics = game.getAvailableTopics()
      expect(topics).toContainEqual(
        expect.objectContaining({ keyword: 'TEA' })
      )
    })

    it('should trigger pnk_drink webhook', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      game.selectDialogueOption('DRINK')
      await game.selectDialogueOption('TEA')

      expect(apiSpy).toHaveBeenCalledWith('pnk_drink', {
        value1: 'tea'
      })
    })

    it('should mention specific tea preferences', async () => {
      game.selectDialogueOption('DRINK')
      const result = await game.selectDialogueOption('TEA')

      expect(result.text).toContain('Mint')
      expect(result.text).toContain('Lemon verbena')
      expect(result.text).toContain('no suger') // Keep typo from v0!
    })
  })

  describe('Easter Egg: Chocolate & Drawer Hint 🍫', () => {
    beforeEach(() => {
      game.navigateToScene('beach_sunset')
      game.talkTo('k')
    })

    it('should require SWEET prerequisite', () => {
      game.selectDialogueOption('DRINK')

      const topics = game.getAvailableTopics()
      expect(topics).not.toContainEqual(
        expect.objectContaining({ keyword: 'CHOCOLATE' })
      )
    })

    it('should appear after SWEET topic', () => {
      game.selectDialogueOption('SWEET')

      const topics = game.getAvailableTopics()
      expect(topics).toContainEqual(
        expect.objectContaining({ keyword: 'CHOCOLATE' })
      )
    })

    it('should trigger pnk_chocolate webhook', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      game.selectDialogueOption('SWEET')
      await game.selectDialogueOption('CHOCOLATE')

      expect(apiSpy).toHaveBeenCalledWith('pnk_chocolate')
    })

    it('should provide real-world hint about drawer #4', async () => {
      game.selectDialogueOption('SWEET')
      const result = await game.selectDialogueOption('CHOCOLATE')

      // THE BRIDGE TO REALITY
      expect(result.text).toContain('**TIP**')
      expect(result.text).toContain('look for a drawer')
      expect(result.text).toContain('number is four')
    })

    it('should mention dark chocolate preference', async () => {
      game.selectDialogueOption('SWEET')
      const result = await game.selectDialogueOption('CHOCOLATE')

      expect(result.text).toContain('dark chocolate')
    })
  })

  describe('Easter Egg: Kite Board Discovery 🪁', () => {
    it('should only appear after using bed in Jaffa apartment', () => {
      game.navigateToScene('jaffa_apt')

      // WHEN: Without using bed
      game.navigateToScene('jaffa_street')
      const items = game.getSceneItems('jaffa_street')

      // THEN: Kite not available
      expect(items).not.toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['Kite'])
        })
      )
    })

    it('should appear in Jaffa Street after sleeping with K', () => {
      game.navigateToScene('jaffa_apt')
      game.command('use bed')

      // WHEN: Going to Jaffa Street
      game.navigateToScene('jaffa_street')
      const items = game.getSceneItems('jaffa_street')

      // THEN: Kite is now available
      expect(items).toContainEqual(
        expect.objectContaining({
          name: expect.arrayContaining(['Kite'])
        })
      )
    })

    it('should trigger when kite is taken', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      game.navigateToScene('jaffa_apt')
      game.command('use bed')
      game.navigateToScene('jaffa_street')

      // WHEN: Taking kite
      await game.command('take kite')

      // THEN: Easter egg triggered
      expect(apiSpy).toHaveBeenCalledWith('pnk_kite')
    })

    it('should reveal discount code', async () => {
      game.navigateToScene('jaffa_apt')
      game.command('use bed')
      game.navigateToScene('jaffa_street')

      const result = await game.command('take kite')

      // THEN: Code is shown
      expect(result.text).toContain('PNK-n3zk7MAMBG-GIFT')
      expect(result.text).toContain('special discout') // Keep typo from v0!
    })
  })

  describe('Easter Egg: Love Declaration 🧡🖤', () => {
    it('should be available in kitchen after reaching Kyoto', () => {
      game.navigateToScene('kitchen')
      game.talkTo('k')

      const topics = game.getAvailableTopics()
      expect(topics).toContainEqual(
        expect.objectContaining({
          keyword: 'LOVE',
          option: expect.stringContaining('I **LOVE** you')
        })
      )
    })

    it('should trigger pnk_love webhook', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      game.navigateToScene('kitchen')
      game.talkTo('k')
      await game.selectDialogueOption('LOVE')

      expect(apiSpy).toHaveBeenCalledWith('pnk_love')
    })

    it('should get loving response from K', async () => {
      game.navigateToScene('kitchen')
      game.talkTo('k')

      const result = await game.selectDialogueOption('LOVE')

      expect(result.text).toContain('I love you too')
      expect(result.text).toContain('🖤')
    })

    it('should set isLove flag', async () => {
      game.navigateToScene('kitchen')
      game.talkTo('k')
      await game.selectDialogueOption('LOVE')

      expect(game.getFlag('isLove')).toBe(true)
    })

    it('should be available again at home (can trigger multiple times)', () => {
      // First trigger in kitchen
      game.navigateToScene('kitchen')
      game.talkTo('k')
      game.selectDialogueOption('LOVE')

      // WHEN: At home
      game.navigateToScene('home')
      game.talkTo('k')

      // THEN: LOVE option available again
      const topics = game.getAvailableTopics()
      expect(topics).toContainEqual(
        expect.objectContaining({ keyword: 'LOVE' })
      )
    })
  })

  describe('Easter Egg: The Flight Home ✈️', () => {
    it('should trigger when Infinity Ouroboros necklace is used', async () => {
      const apiSpy = vi.spyOn(game.api, 'triggerEasterEgg')

      // GIVEN: Player has completed zodiac conversation
      game.navigateToScene('kitchen')
      game.talkTo('k')
      game.command('take chopsticks')
      game.command('use dumplings')
      game.selectDialogueOption('TIGER')
      game.selectDialogueOption('ZODIAC')
      game.selectDialogueOption('FUTURE')

      // WHEN: Using the necklace
      await game.command('use necklace')

      // THEN: Ultimate Easter egg triggered
      expect(apiSpy).toHaveBeenCalledWith('pnk_fly')
    })

    it('should unlock path home', async () => {
      game.navigateToScene('kitchen')
      game.talkTo('k')
      game.command('take chopsticks')
      game.command('use dumplings')
      game.selectDialogueOption('TIGER')
      game.selectDialogueOption('ZODIAC')
      game.selectDialogueOption('FUTURE')

      // WHEN: Using necklace
      await game.command('use necklace')

      // THEN: Can now fly home
      const exit = game.getExit('kitchen', 'south')
      expect(exit?.blocked).toBe(false)
    })

    it('should display emotional message', async () => {
      game.navigateToScene('kitchen')
      game.talkTo('k')
      game.command('take chopsticks')
      game.command('use dumplings')
      game.selectDialogueOption('TIGER')
      game.selectDialogueOption('ZODIAC')
      game.selectDialogueOption('FUTURE')

      const result = await game.command('use necklace')

      expect(result.text).toContain('🧡🖤🧡🖤')
      expect(result.text).toContain('time to fly back to TLV')
      expect(result.text).toContain('together')
    })
  })

  describe('Easter Egg Order and Dependencies', () => {
    it('should track all triggered Easter eggs', async () => {
      // Trigger multiple eggs
      game.navigateToScene('beach_sunset')
      game.talkTo('k')
      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')
      game.selectDialogueOption('DRINK')
      await game.selectDialogueOption('TEA')

      const triggered = game.getTriggeredEasterEggs()

      expect(triggered).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'mango' }),
          expect.objectContaining({ id: 'tea' })
        ])
      )
    })

    it('should allow accessing Easter eggs in any order', async () => {
      // Can do chocolate before mango, etc.
      game.navigateToScene('beach_sunset')
      game.talkTo('k')

      game.selectDialogueOption('SWEET')
      await game.selectDialogueOption('CHOCOLATE')

      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // Both should be triggered
      const triggered = game.getTriggeredEasterEggs()
      expect(triggered).toHaveLength(2)
    })

    it('should persist triggered eggs across save/load', async () => {
      game.navigateToScene('beach_sunset')
      game.talkTo('k')
      game.selectDialogueOption('FOOD')
      await game.selectDialogueOption('MANGO')

      // WHEN: Saving and loading
      const saveData = game.save()
      const newGame = createGameFromSave(saveData)

      // THEN: Easter egg still marked as triggered
      const triggered = newGame.getTriggeredEasterEggs()
      expect(triggered).toContainEqual(
        expect.objectContaining({ id: 'mango' })
      )
    })
  })
})

describe('Feature: Easter Egg Visual and Audio Feedback', () => {
  let game: GameState

  beforeEach(() => {
    game = createNewGame()
  })

  it('should show sparkle effect when Easter egg triggers', async () => {
    game.navigateToScene('beach_sunset')
    game.talkTo('k')
    game.selectDialogueOption('FOOD')

    const result = await game.selectDialogueOption('MANGO')

    expect(result.visualEffect).toBe('sparkle')
  })

  it('should play magical sound when Easter egg triggers', async () => {
    const audioSpy = vi.spyOn(game.audio, 'play')

    game.navigateToScene('beach_sunset')
    game.talkTo('k')
    game.selectDialogueOption('FOOD')
    await game.selectDialogueOption('MANGO')

    expect(audioSpy).toHaveBeenCalledWith('easter-egg-chime')
  })

  it('should show achievement-style notification', async () => {
    game.navigateToScene('beach_sunset')
    game.talkTo('k')
    game.selectDialogueOption('FOOD')

    const result = await game.selectDialogueOption('MANGO')

    expect(result.notification).toEqual({
      type: 'easter-egg',
      title: '✨ Secret Discovered',
      message: expect.stringContaining('Mango')
    })
  })
})

// Type helpers
function createNewGame(): GameState {
  throw new Error('Implementation needed')
}

function createGameFromSave(saveData: any): GameState {
  throw new Error('Implementation needed')
}

declare global {
  interface GameState {
    api: {
      triggerEasterEgg(eventId: string, params?: any): Promise<EasterEggTriggerResult>
    }
    audio: {
      play(soundId: string): void
    }
    onEasterEggTrigger(callback: (egg: EasterEgg) => void): void
    getTriggeredEasterEggs(): EasterEgg[]
    getFlag(name: string): any
  }

  interface EasterEgg {
    id: string
    name: string
    timestamp: number
  }

  interface EasterEggTriggerResult {
    success: boolean
    alreadyTriggered?: boolean
    message?: string
    hint?: string
  }

  interface CommandResult {
    easterEggTriggered?: boolean
    visualEffect?: string
    notification?: {
      type: string
      title: string
      message: string
    }
  }
}
