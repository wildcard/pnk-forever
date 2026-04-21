# Easter Eggs & Real-World Connections

## Philosophy

The Easter eggs in P&K Forever aren't traditional video game secrets - they're **bridges between the digital and physical world**. When Anastasia plays the game and discovers something, something real appears in the physical world.

This gamification of reality creates a unique experience where:
1. Progress in the game triggers real-world surprises
2. Real objects appear or become available
3. The line between story and reality blurs
4. The game becomes a treasure hunt in both worlds

---

## Canonical Keyword List

This is the authoritative machine-readable keyword list. It is parsed at
runtime by `scripts/handoff/playtest.sh` (presence check in rendered page
content) and by `scripts/check-easter-eggs.sh` (CI check that every keyword
appears in at least one `v1-modern/src/scripts/*.narrat` file).

**Format:** one keyword per line inside the fenced block below. Do not
reformat, add prose, or split the block — the parsers look for
```` ```keywords ```` as the block fence.

```keywords
MANGO
TEA
CHOCOLATE
KITE
LOVE
FLY
TIGER
SNAKE
ZODIAC
FUTURE
NECKLACE
BROMPTON
JAFFA
JAPAN
PNK-n3zk7MAMBG-GIFT
```

When adding a new easter egg, append its keyword here *and* reference this
list from any runtime or docs that would otherwise hard-code it.

---

## IFTTT Integration System

All Easter eggs use IFTTT (If This Then That) webhooks to trigger real-world actions.

**Base URL:** `https://maker.ifttt.com/trigger/{EVENT_NAME}/with/key/buN0S2VUtrVLjyoCLowl7X`

**Security Note:** The webhook key is embedded in the game code. This is intentional for this specific use case (personal game for Anastasia), but should be reconsidered for any public version.

---

## Easter Egg Catalog

### 1. Mango Revelation 🥭

**Trigger Location:** Beach Sunset
**Conversation Topic:** FOOD → MANGO
**Player Action:** Selecting the MANGO dialogue option

**In-Game:**
```javascript
{
  option: "**MANGO**! 🥭",
  line: "I like them so much, I eat them all the time",
  prereqs: ["food"],
  removeOnRead: true,
  onSelected: () => {
    fetch(
      `https://maker.ifttt.com/trigger/pnk_mango/with/key/buN0S2VUtrVLjyoCLowl7X?value1=mango`
    );
  },
}
```

**IFTTT Event:** `pnk_mango`
**Parameter:** `value1=mango`

**Real-World Effect:**
Potentially triggers delivery or appearance of fresh mangoes 🥭

**Narrative Significance:**
Phoenix revealing her favorite fruit - a personal detail that becomes real

---

### 2. Tea Preference 🫖

**Trigger Location:** Beach Sunset
**Conversation Topic:** DRINK → TEA
**Player Action:** Selecting the TEA dialogue option

**In-Game:**
```javascript
{
  option: "**TEA** 🫖",
  line: "YES! I love to take my tea with herbs: Mint & Lemon verbena. no suger please",
  removeOnRead: true,
  prereqs: ["drink"],
  onSelected: () => {
    fetch(
      `https://maker.ifttt.com/trigger/pnk_drink/with/key/buN0S2VUtrVLjyoCLowl7X?value1=tea`
    );
  },
}
```

**IFTTT Event:** `pnk_drink`
**Parameter:** `value1=tea`

**Real-World Effect:**
Potentially triggers tea preparation or delivery (Mint & Lemon verbena, no sugar)

**Narrative Significance:**
Specific preferences matter - the game remembers "no sugar"

---

### 3. Chocolate & Drawer Hint 🍫

**Trigger Location:** Beach Sunset
**Conversation Topic:** SWEET → CHOCOLATE
**Player Action:** Selecting the CHOCOLATE dialogue option

**In-Game:**
```javascript
{
  option: "**CHOCOLATE** 🍫",
  prereqs: ["sweet"],
  removeOnRead: true,
  line: `I like many chocolates, I love them all. But many dark chocolate

  **TIP** look for a drawer it number is four
  `,
  onSelected: () => {
    fetch(
      `https://maker.ifttt.com/trigger/pnk_chocolate/with/key/buN0S2VUtrVLjyoCLowl7X`
    );
  },
}
```

**IFTTT Event:** `pnk_chocolate`
**No parameters**

**Real-World Effect:**
Triggers chocolate placement, likely in a specific location

**Physical World Hint:** "look for a drawer it number is four"
- Drawer #4 contains something
- Dark chocolate preference noted
- Direct bridge between game text and physical search

**Narrative Significance:**
The game explicitly tells the player to look in the real world - breaking the fourth wall intentionally

---

### 4. Kite Board Discovery 🪁

**Trigger Location:** Jaffa Street
**Item:** Kite Equipment
**Player Action:** TAKE kite

**In-Game:**
```javascript
{
  name: ["Kite equipement", "Kite", "Kite Board"],
  desc: `You found your Kite Board.`,
  isTakeable: true,
  onTake: () => {
    println(`You took your Kite Board

    Use this code in the future for a special discout: \`PNK-n3zk7MAMBG-GIFT\`
    `);
    fetch(
      `https://maker.ifttt.com/trigger/pnk_kite/with/key/buN0S2VUtrVLjyoCLowl7X`
    );
  },
}
```

**IFTTT Event:** `pnk_kite`
**No parameters**

**Discount Code:** `PNK-n3zk7MAMBG-GIFT`

**Real-World Effect:**
- Webhook trigger (possible notification or physical reveal)
- Discount code has real commercial value
- Can be used for kite surfing/boarding equipment or lessons

**Narrative Significance:**
- Phoenix's hobby revealed
- Direct economic value (discount)
- Connects to real-life activity they might do together

**Item Appears:** Only after using the bed in Jaffa Apartment (sleeping together unlocks it)

---

### 5. Love Declaration 🧡🖤

**Trigger Location:** Kitchen (Kyoto) OR Home (TLV)
**Conversation Topic:** LOVE
**Player Action:** Selecting "I LOVE you"

**In-Game (Kitchen):**
```javascript
{
  option: "I **LOVE** you 🧡",
  line: `I love you too. 🖤`,
  onSelected: () => {
    isLove = true;
    fetch(
      `https://maker.ifttt.com/trigger/pnk_love/with/key/buN0S2VUtrVLjyoCLowl7X`
    );
  },
}
```

**In-Game (Home):**
```javascript
{
  option: "I Love you 🧡",
  line: `I love you too. 🖤`,
  onSelected: () => {
    fetch(
      `https://maker.ifttt.com/trigger/pnk_love/with/key/buN0S2VUtrVLjyoCLowl7X`
    );
  },
}
```

**IFTTT Event:** `pnk_love`
**No parameters**

**Real-World Effect:**
Potentially the most significant trigger - could activate lights, music, message, or physical surprise

**Narrative Significance:**
- The core of the game
- Can be triggered multiple times (in Kitchen and at Home)
- Sets global flag `isLove = true`
- 🧡 (orange - Phoenix) 🖤 (black - K)

**Available:** In the Kitchen after entering, and in the final Home location

---

### 6. The Flight Home ✈️

**Trigger Location:** Kitchen (Kyoto)
**Item:** Infinity Ouroboros Necklace
**Player Action:** USE necklace

**In-Game:**
```javascript
{
  name: ["necklace", "Infinity Ouroboros double necklace"],
  desc: "A gift from K. a unique design that symbolize our relationship",
  onUse: () => {
    println(
      `You put the necklace sign on your neck. 🧡🖤🧡🖤`
    );

    println(`K. Says I think it's time to fly back to TLV
    Let's got out of here together & fly`);
    const kitchen = getRoom("kitchen");
    const exit = getExit("south", kitchen.exits);
    delete exit.block;

    fetch(
      `https://maker.ifttt.com/trigger/pnk_fly/with/key/buN0S2VUtrVLjyoCLowl7X`
    );
  },
}
```

**IFTTT Event:** `pnk_fly`
**No parameters**

**Real-World Effect:**
The ultimate trigger - potentially the most significant physical surprise or reveal

**Narrative Significance:**
- The necklace is the most important gift
- Using it completes the game's emotional arc
- Unlocks the ending
- Represents eternal commitment (Ouroboros - infinity)

**Symbolism:**
- Double necklace: two parts of one whole
- Infinity Ouroboros: eternal cycle, no beginning, no end
- Kite connector: Freedom, flight, connection
- 🧡🖤🧡🖤: Their colors intertwined

**Item Acquisition:** Only given through K's conversation after the FUTURE topic

---

## Easter Egg Progression

### Early Game (Beach Sunset)
1. Mango (optional, conversation-based)
2. Tea (optional, conversation-based)
3. Chocolate + Physical hint (optional, conversation-based)

**Characteristics:**
- All optional
- Can be missed
- Light, playful
- Build trust in the Easter egg system

### Mid Game (Jaffa)
4. Kite Board (conditional on sleeping with K)

**Characteristics:**
- Requires relationship progression
- Has economic value (discount code)
- Unlocked by intimacy (using bed together)

### Late Game (Kyoto)
5. Love declaration (requires reaching Japan)
6. Flight Home (requires completing the zodiac conversation chain and using the necklace)

**Characteristics:**
- Mandatory for completion
- Emotionally significant
- Tied to the narrative climax
- The "ultimate" surprises

---

## Hidden Mechanics

### State Flags

**`isFlyOn` (boolean)**
- Starts as `false`
- Set to `true` when FLY command is unlocked
- Controls whether FLY command is available

**`isLove` (boolean)**
- Starts as `false`
- Set to `true` when player first says "I LOVE you" in the kitchen
- No current gameplay effects, but tracks that the declaration was made

**`k.agreedToTravel` (boolean)**
- Set to `true` when player selects JAPAN destination
- Determines if K follows Phoenix when flying
- Critical for story coherence

### Dynamic Command System

The FLY command isn't available at game start - it's added dynamically:

```javascript
commands[2] = Object.assign(commands[2], { fly });
updateHelpCommand(`FLY TO [ROOM NAME] e.g. 'fly to room'`);
isFlyOn = true;
```

This teaches the player that the game world can change based on narrative progression.

---

## Real-World Treasure Hunt Design

The Easter eggs create a multi-layered experience:

**Layer 1: Digital Discovery**
Player finds the trigger in the game (conversation, item)

**Layer 2: Game Feedback**
Game acknowledges the discovery (dialogue, unlock, code reveal)

**Layer 3: Real-World Effect**
IFTTT webhook triggers physical surprise

**Layer 4: Physical Discovery**
Anastasia finds the real-world result
(mangoes appear, tea is prepared, drawer #4 contains something, etc.)

**Layer 5: Connection Realization**
Understanding that the game and reality are linked

---

## Technical Implementation Notes

### Fetch API
Uses browser's native `fetch()` API - no dependencies
Webhooks fire asynchronously - game doesn't wait for response

### Error Handling
No error handling on webhook calls - intentional for simplicity
Failed webhooks fail silently (won't break game experience)

### Replay Considerations
Most Easter eggs can trigger multiple times if:
- Player reloads the game
- Player loads a save before triggering
- Topics are set to NOT `removeOnRead`

Exception: Most topics are `removeOnRead: true`, preventing repeated triggers in single playthrough

---

## Preservation for v2

When modernizing, consider:

1. **Keep the IFTTT system?**
   - Pro: Works, it's meaningful to the original
   - Con: Exposes webhook key in client code

2. **Alternative: Backend service**
   - Proxy webhooks through a server
   - Add authentication
   - Track which Easter eggs have been triggered

3. **Enhanced feedback**
   - Confirm webhook succeeded/failed
   - Show more theatrical response in-game
   - Save state of which Easter eggs were found

4. **New Easter eggs**
   - Add more for the new narrative content
   - Consider progressive hints
   - Multi-step Easter eggs

---

## The Magic

The brilliance of this system is that it makes the game **a love letter that unfolds in both digital and physical space simultaneously**.

Anastasia isn't just playing a game about how they met - she's experiencing new surprises in real-time, orchestrated through her progress in the story.

The game becomes:
- A narrative
- A treasure hunt
- A series of surprises
- A demonstration of thoughtfulness
- A bridge between code and reality
- A love letter that **does things**

This is what makes P&K Forever special. It's not just a game you play - it's a game that plays out in your life.
