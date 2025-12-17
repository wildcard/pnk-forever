# Characters

## Phoenix (P)

**Names:** Phoenix, P
**Type:** Protagonist (Player Character)
**Species:** "Birdcat" - sometimes a bird, sometimes a cat, depending on how you look at it or her mood

### Description
A curious little "birdcat" who is always on the look for new adventures and challenges. Very nice, friendly, and helpful. Talented with many skills.

### Characteristics
- Loves the salty air at the beach
- Enjoys watching humans catching sun
- Likes to stretch her feathers and glide above the open waters
- Contemplative about business and next endeavors
- An artist considering a dog portrait business
- Lives in Jaffa

### Abilities
- **Flight:** Unlocked through the FLY command after the conversation about traveling to Japan
  - Can fly to specific locations marked as `isFlyableFrom`
  - Secret power revealed through connection with K

### Preferences
- **Drink:** Slushy (açai 🥤)
- **Favorite Fruit:** Mango 🥭 - "I eat them all the time"
- **Hot Beverage:** Tea 🫖 (with herbs: Mint & Lemon verbena, no sugar)
- **Sweet:** Chocolate 🍫 (all kinds, especially dark chocolate)
- **Hobbies:** Kite surfing/boarding

### Zodiac Sign
**Tiger 🐅** - The Protector

### ASCII Art
```
     __             __
  .-'.'    Ä.-.Ä    '.'-.
.'.((      ( ^ `>     )).'.
/`'- \'._____\ (_____.'/ -'`\
|-''`.'------' '------'.`''-|
|.-'`.'.'.'`/ | | `.'.'.'`'-.|
 \ .' . /  | | | |  \ . '. /
  '._. :  _|_| |_|_  : ._.'
     ````` /T"Y"T\ `````
         / | | | \
        `'`'`'`'`'`
```

---

## K (Ehecatl)

**Full Name:** Ehecatl
**Nickname:** K.
**Aliases:** dog, peacockdog, Kobi, shiba
**Type:** Main Character (NPC)
**Species:** Shiba Inu (peacockdog 🐕🦚)

### Description
"He looks like a very nice person, also a bit of a loner, but he seems pleasant."

Not just any dog - wearing colorful feathers, riding a Brompton folding bicycle.

### Characteristics
- Pleasant and helpful
- Has business experience
- Knows various dog association people
- A bit of a loner
- Well-traveled
- Wants to be a digital nomad

### Ancestry
"My ancestors are from Japan"

### Preferences
- **Food:** Fruits & Vegetables 🍓🥦
- **Hot Beverage:** Coffee 🍵
- **Sweet:** Ice cream 🍨
- **Travel:** Loves to travel, aspires to digital nomad lifestyle

### Zodiac Sign
**Snake 🐍** - The Guide and Protector

Represents:
- Wisdom
- Protection
- Strength through support
- Eternity (Ouroboros)

### Skills
- Cooking (makes dim sum in Kyoto)
- Business consulting
- Bicycle maintenance (Brompton)

### Character Development

#### Location-Based Topics

K's conversation topics change based on the room/location:

**Beach Conversations:**
- Introduction and name
- About the bicycle
- Business discussion
- Phoenix's artist ambitions
- Invitation to continue talking at sunset

**Beach Sunset Conversations:**
- Favorite foods
- Mango revelation (triggers Easter egg)
- Hot beverage preferences
- Tea revelation (triggers Easter egg)
- Sweet preferences
- Chocolate revelation (triggers Easter egg + drawer hint)
- Travel dreams
- Digital nomad explanation
- Traveling the world together
- Destination discussions (Japan, Germany, China, France, Italy, USA, India, etc.)
- How to fly to Japan (unlocks FLY command)

**Kitchen Conversations (Kyoto):**
- What's cooking (dim sum)
- "I LOVE you" declaration (triggers Easter egg)
- Tiger zodiac sign explanation
- Snake zodiac sign revelation
- Future together prophecy
- Gift of the Infinity Ouroboros necklace

### Relationship System

**Stored in:** `k.chatLog[]` - array of keywords from selected conversation topics
**Prerequisites:** Many conversation options require previous topics to be selected first

Example flow:
1. FOOD → unlocks MANGO option
2. DRINK → unlocks TEA option
3. SWEET → unlocks CHOCOLATE option
4. TRAVEL → unlocks NOMAD option
5. TRAVEL + NOMAD → unlocks WORLD option
6. TRAVEL + NOMAD + WORLD → unlocks country options
7. TRAVEL + NOMAD + WORLD + JAPAN → unlocks FLY option

### Room Presence

- **beach:** Starting location
- **beach_sunset:** Moves here with player (set in onEnter)
- **kitchen:** Appears here when player enters Kyoto apartment
- **home:** Final location (TLV apartment)

### State Tracking

**k.agreedToTravel** (boolean)
- Set to `true` when player selects JAPAN option
- Determines if K follows Phoenix when using FLY command

**k.roomTopics** (object)
- Stores conversation topics for each location
- Allows topic switching when entering new rooms
- Preserves previous conversations

---

## Character Interactions

### Talking System
- Use command: `TALK TO [character name]`
- K's onTalk greeting: *"Hi, how can I help you?"*
- Topics presented as options with KEYWORDS in uppercase
- Player types keyword to select topic
- Some topics are `removeOnRead: true` (disappear after selection)
- Some topics have `prereqs: []` (require other topics first)
- Some topics trigger `onSelected()` functions for game state changes or Easter eggs

### Dynamic Description Updates
- K's description changes from "dog" to "K." after learning his name
- Room descriptions update to reflect K's presence
- Beach description updates after name reveal

---

## Design Philosophy

**Phoenix:** Abstract, whimsical, hard to pin down - represents the mystery and uniqueness of Anastasia that the creator felt they could "never fully comprehend."

**K:** More grounded and defined - represents the creator's self-perception in this story.

The contrast is intentional - celebrating the enigmatic nature of the beloved while staying true to the narrator's perspective.
