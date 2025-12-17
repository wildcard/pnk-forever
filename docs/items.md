# Items & Objects

## Interactive Items by Location

### Beach Rest (Phoenix's Favorite Slushy Place)

#### Slushy (Açai Smoothie)
**Names:** `slushy`, `shake`, `frozen drink`, `Acai Smoodie`, `cold drink`
**Description:** "Yummy, cold & nutritional exactly like P loves it 😋"
**Takeable:** Yes

**State:**
- `gulps: 3` - Number of remaining sips

**Mechanics:**
- Must TAKE before USE
- Each USE decreases gulp counter and prints "gulp"
- First USE removes the exit block to go WEST
- After 3 uses, item is removed from inventory
- Trying to use with 0 gulps drops the empty cup

**Purpose:**
- Tutorial item teaching TAKE and USE
- Unlocks progression from Beach Rest to Beach
- Cooling down mechanic (too hot outside without it)

#### Door (West Exit)
**Names:** `door`
**Description:** "It leads WEST."
**Takeable:** No

**onUse:** Hints to player: "Type GO WEST to try the door."

---

### Beach (The Meeting Place)

#### Beach/Sand
**Names:** `🏖`, `beach`, `sand`
**Description:** "You are on the sandy beach of TLV."
**Takeable:** No

#### Bicycle
**Names:** `bicycle`, `Brompton`, `colorful bike`, `bike`
**Description:**
- Initial: "a bicycle"
- After learning K's name: "K's bicycle"
**Takeable:** No

**Significance:** K's defining possession, conversation starter

#### Shekel (Coin)
**Names:** `shekel`, `dime`, `coin`
**Description:** "Wow, you found a Shekel in the sand."
**Takeable:** Yes

**Mechanics:**
- onTake: Explains inventory system to player
- onUse: Coin flip - randomly shows "HEADS" or "TAILS"

**Purpose:**
- Tutorial for inventory system
- Metaphor for chance/fate (heads or tails? the universe deciding)
- Israeli currency grounding the story in Tel Aviv

---

### Beach Sunset

No unique items in this location - focus is on conversation with K.

---

### Jaffa Apartment

#### Bed
**Names:** `bed`
**Description:** "K. is laying on the bed"
**Takeable:** No

**Mechanics (onUse):**
- Adds Kite Equipment to Jaffa Street location
- Opens exit north to Beach Sunset from Jaffa Street
- Prints sleep/cuddle messages (random selection):
  - "K. cuddles you & you sleep together until morning 💤"
  - "You sleep with K. 😴"
  - "You wake up to the sound of Jaffa's streets. K. is still snoring 😪"

**Purpose:** Time progression mechanic, relationship intimacy

#### Door (North Exit)
**Names:** `door`
**Description:** "You can go NORTH to Jaffa street."
**Takeable:** No

**onUse:** Hints: "Type GO NORTH to go to the Jaffa street."

---

### Jaffa Street

#### Door (South Exit)
**Names:** `door`
**Description:** "You can go SOUTH to the Jaffa Apartment."
**Takeable:** No

**onUse:** Hints: "Type GO SOUTH to enter the Jaffa Apartment."

#### Kite Equipment
**Names:** `Kite equipement`, `Kite`, `Kite Board`
**Description:** "You found your Kite Board."
**Takeable:** Yes
**Appears:** Only after using bed in Jaffa Apartment

**onTake:**
- Prints discount code: `PNK-n3zk7MAMBG-GIFT`
- Triggers IFTTT webhook: `pnk_kite`

**Purpose:**
- Easter egg with real-world value (discount code)
- Connection to Phoenix's hobbies and identity
- Real-life surprise trigger

---

### Kyoto, Japan (Outside)

#### Book
**Names:** `book`
**Description:** "you found a book with Japanese drawing."
**Takeable:** No (implied)

**Purpose:** Environmental detail, cultural atmosphere

---

### Kyoto Apartment

#### Uwabaki (House Slippers)
**Names:** `Uwabaki`, `slippers`
**Description:** "You found your slippers."
**Takeable:** No (worn, not carried)

**Mechanics (onUse):**
- Removes block on east exit to kitchen
- Prints: "You wear your nice & clean house slippers 'Uwabaki' instead of your dirty shoes"

**Cultural Note:** Japanese custom of removing outdoor shoes indoors

#### Tiger Zodiac Sign
**Names:** `Tiger Zodiac Sign`
**Description:** "You found your Zodiac sign. The Tiger"
**Takeable:** Yes

**Significance:**
- Phoenix's zodiac sign
- Represents the protector
- Sets up the zodiac conversation in the kitchen
- Part of the paired symbolism (Tiger + Snake)

---

### Kitchen (Kyoto)

#### Chopsticks
**Names:** `chop sticks`, `fancy chop sticks`
**Description:** "You found your fancy chop sticks."
**Takeable:** Yes

**Mechanics (onTake):**
- Makes dumplings takeable
- Enables dumpling USE function
- Unlocks additional conversation topics with K about zodiac

**Purpose:**
- Cultural authenticity (eating dim sum with chopsticks)
- Puzzle mechanic (need right tool to eat)
- Conversation gate (eating together leads to deeper talks)

#### Dumplings (Dim Sum)
**Names:** `dumplings`, `dumpling`, `japanese dumpling`
**Initial Description:** "You found a japanese dumpling. it's now cooking"
**Takeable:** No (initially), Yes (after taking chopsticks)

**Mechanics (onUse - after taking chopsticks):**
- Prints: "You eat the japanese dumpling. yum yum yum"
- Adds conversation topics to K about Tiger zodiac
- Enables the zodiac conversation chain

**Purpose:**
- Sharing a meal = intimacy and trust
- Gateway to the most important conversation in the game

#### Infinity Ouroboros Necklace
**Names:** `necklace`, `Infinity Ouroboros double necklace`
**Description:** "A gift from K. a unique design that symbolize our relationship"
**Takeable:** Auto-added to inventory (via K's dialogue)
**Appears:** After completing the zodiac conversation chain

**Mechanics (onUse):**
- Prints: "You put the necklace on your neck. 🧡🖤🧡🖤"
- K says it's time to fly back to TLV
- Removes south exit block from kitchen
- Triggers IFTTT webhook: `pnk_fly`

**Symbolism:**
- **Ouroboros:** Snake eating its tail - infinity, eternity, cycles
- **Double necklace:** Two parts of one whole
- **Kite connector:** References Phoenix's hobby, connection between two souls
- **Colors:** 🧡 (Phoenix/orange) 🖤 (K/black)

**Purpose:**
- The climactic gift, the emotional peak
- Represents commitment and eternal connection
- Most important Easter egg trigger
- Unlocks the ending

---

## Item Design Patterns

### Tutorial Items
1. **Slushy:** Teaches TAKE and USE
2. **Shekel:** Teaches inventory system
3. **Doors:** Teach directional movement

### Puzzle Items
- **Slippers:** Must wear to enter kitchen (cultural puzzle)
- **Chopsticks:** Must have to eat dumplings (tool puzzle)
- **Dumplings:** Must eat to unlock deep conversation (social puzzle)

### Easter Egg Items
- **Kite Equipment:** Discount code + webhook
- **Chocolate (conversation):** Hint about drawer #4
- **Necklace:** Ultimate Easter egg trigger

### Symbolic Items
- **Tiger Zodiac Sign:** Phoenix's identity, protector
- **Snake (in necklace):** K's identity, guide
- **Ouroboros:** Eternal love, infinite cycle
- **Bicycle:** K's character, adventure, freedom
- **Slushy:** Phoenix's personality, summer, beach life

### State-Changing Items
Items that modify game state when used:
- Slushy (removes exit block)
- Bed (adds item to other room, opens exit)
- Slippers (removes exit block)
- Chopsticks (makes other item takeable/useable)
- Necklace (removes exit block, triggers ending)

---

## Item Interaction Philosophy

Items aren't just objects - they're:
1. **Narrative devices:** Each tells part of the story
2. **Memory anchors:** Real items from real life
3. **Cultural markers:** Açai, chopsticks, Uwabaki ground the locations
4. **Emotional beats:** The necklace, the bed, the meal together
5. **Bridges to reality:** Easter eggs connect game to physical world

Every item has intention. Nothing is decorative. Every USE, every TAKE, every LOOK matters.
