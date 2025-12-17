# Scenes & Rooms

## Scene Structure

Each scene (room) in the game has:
- **Narrative purpose:** What story beats happen here
- **Gameplay mechanics:** What the player learns or does
- **Emotional tone:** The feeling this location conveys
- **Transition:** How/why the player moves to the next scene

---

## Act I: How We Met (April 21, 2021 - Day 1)

### Scene 1: Beach Rest (Phoenix's Favorite Slushy Place)

**Room ID:** `beach_rest`
**Name:** "Phoenix favorite beach Slushy place"

**ASCII Art:**
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

**Initial Description:**
Welcome text introducing Phoenix, explaining she's a "birdcat," curious and adventurous. Context of the beach, the salty air, the gliding above water. Prompts player to type LOOK.

**After LOOK:**
Phoenix is gulping her açai slushy, contemplating her next business endeavor. She's talented with many skills but wondering what comes next. The day is hot 🌞. Then she spots a dog on a bicycle - not just any dog, a peacockdog 🐕🦚, a shiba wearing colorful feathers. Fascinated, she decides to approach.

**Narrative Purpose:**
- Introduce protagonist
- Set the scene (beach, summer, Tel Aviv)
- Create the inciting incident (seeing K)
- Tutorial moment (teaching LOOK command)

**Gameplay:**
- Starting room
- Tutorial for LOOK, TAKE, USE commands
- Slushy mechanic (must use to cool down before progressing)
- Exit blocked until player takes and uses slushy

**Emotional Tone:** Contemplative, warm, anticipatory

**Exits:**
- **WEST → Beach** (blocked by heat until slushy is used)

**Items:** Slushy, Door

**Characters:** None (K is in the next room)

**Special Mechanics:**
- Dynamic description change after LOOK
- Exit block removed by using slushy

---

### Scene 2: Beach (The Meeting)

**Room ID:** `beach`
**Name:** "🏖 The Beach"

**ASCII Art:**
```
   _\/_                 |                _\/_
   /o\              \       /            //o\
    |                 .---.                |
   _|_______     --  /     \  --     ______|__
         `~^~^~^~^~^~^~^~^~^~^~^~`
```

**Description:**
"You are on the beach. The fascinating **DOG** is here"

Updates to: "You are on the beach. **K.** is here" (after learning his name)

**Narrative Purpose:**
- The first meeting
- First conversation with K
- Learning about each other
- Building connection through questions
- Business discussion (Phoenix's artist dreams)
- Setup for sunset walk

**Gameplay:**
- Introduction to TALK TO command
- Conversation tree system
- Topic prerequisites (some questions unlock others)
- Character name reveal updates descriptions
- Exit unlocked through conversation (prerequisite: business + artist topics)

**Emotional Tone:** Curious, friendly, engaging, surprising

**Exits:**
- **SOUTH → Beach Sunset** (blocked until conversation progresses)

**Items:** Beach/sand, Bicycle, Shekel

**Characters:** K (starts here)

**Conversation Flow:**
1. NAME → Updates K's description
2. BICYCLE → Learn about Brompton
3. BUSINESS → Opens up deeper questions
4. ARTIST → Dog portrait business idea
5. CONTINUE → Unlocks path south to sunset

**Special Mechanics:**
- Item description changes (bicycle becomes "K's bicycle" after name reveal)
- Room description updates with K's name
- Exit block removed by conversation choice
- Character's `name` array gets updated (K. prepended)

---

### Scene 3: Beach Sunset

**Room ID:** `beach_sunset`
**Name:** "🏖️ Sunset Beach 🌄"

**ASCII Art:** None (focus on conversation)

**Description:**
Walking toward Jaffa, the beach cleared of most people, peaceful and quiet. Good time to talk with K.

P says: "You know I'm living near here in Jaffa we can go to my place"

**Narrative Purpose:**
- Deep conversation and connection
- Learning preferences (food, drinks, sweets)
- Revealing dreams (travel, digital nomad life)
- Planning the future together (where to travel)
- Unlocking Phoenix's flight ability
- CRITICAL: Easter egg conversations (mango, tea, chocolate with real-world hints)

**Gameplay:**
- Most complex conversation tree in the game
- Multiple branching paths with prerequisites
- Easter egg triggers via IFTTT webhooks
- FLY command unlock through conversation
- Real-world hint: "Look for a drawer, its number is four"

**Emotional Tone:** Intimate, dreamy, romantic, playful

**Exits:**
- **SOUTH → Jaffa Apartment** (always open)

**Items:** None

**Characters:** K (moves here via onEnter)

**Conversation Topics:**

**Food/Preferences Chain:**
- FOOD → MANGO (Easter egg: `pnk_mango`)
- DRINK → TEA (Easter egg: `pnk_drink`)
- SWEET → CHOCOLATE (Easter egg: `pnk_chocolate` + drawer hint)

**Travel Chain:**
- TRAVEL → Digital nomad concept
- NOMAD → Explanation of digital nomad
- WORLD → Traveling together
- Country options (JAPAN, GERMANY, CHINA, HONG KONG, INDIA, FRANCE, ITALY, USA)
- JAPAN (correct choice) → K agrees, sets `agreedToTravel = true`
- FLY (after JAPAN) → Unlocks FLY command, updates help menu

**Special Mechanics:**
- `k.roomTopics["beach"]` stores previous conversation
- `k.topics` gets replaced with beach_sunset topics
- First use of IFTTT webhook Easter eggs
- Dynamic command system (FLY command added to `commands[2]`)
- Help menu updated with FLY instruction

**Design Note:** This is where the real connection happens - not just meeting, but truly learning about each other.

---

### Scene 4: Jaffa Apartment

**Room ID:** `jaffa_apt`
**Name:** "Jaffa Apartment"

**ASCII Art:**
```
        |\      _,,,---,,_
  ZZZzz /,`.-'`'    -.  ;-;;,_
       |,4-  ) )-,_. ,\ (  `'-'
      '---''(_/--'  `-'\_)
```
(Cat sleeping - representing rest, intimacy)

**Description:**
You're in the Jaffa Apartment. Your flat is full of memories & items you've collected in your past travels. K is sleeping in your LIVING ROOM BED.

**Narrative Purpose:**
- First shared intimate space
- Sleeping together (relationship progression)
- Time skip to morning
- Transition preparation for Japan journey

**Gameplay:**
- USE bed to progress time
- Bed interaction adds kite equipment to Jaffa Street
- Teaches that using items can affect other locations
- Opens new exit when bed is used

**Emotional Tone:** Cozy, intimate, peaceful, domestic

**Exits:**
- **NORTH → Jaffa Street**

**Items:** Bed, Door

**Characters:** K (present, sleeping)

**Special Mechanics:**
- Using bed modifies different room (Jaffa Street)
- Random sleep message selection
- State change affects navigation options

---

### Scene 5: Jaffa Street

**Room ID:** `jaffa_street`
**Name:** "Jaffa Street"

**Description:** "You're on the Jaffa Street."

**Narrative Purpose:**
- Breathing room between apartment and flight
- Discovery of kite equipment (Phoenix's hobby revealed)
- Easter egg with real-world discount code
- Morning after the first night together

**Gameplay:**
- Kite equipment appears here (only after using bed)
- TAKE kite triggers Easter egg (`pnk_kite`)
- Reveals discount code for real-world use

**Emotional Tone:** Bright, morning light, hopeful, adventurous

**Exits:**
- **SOUTH → Jaffa Apartment**
- **NORTH → Beach Sunset** (added after using bed)

**Items:** Door, Kite Equipment (conditional)

**Special Mechanics:**
- Items added dynamically from other room's onUse
- Easter egg with real commercial value (discount code)
- IFTTT trigger for real-world surprise

---

## Act II: The Flash-Forward (3 Years Later - Imagined Future)

### Scene 6: Kyoto, Japan 🏯

**Room ID:** `japan`
**Name:** "Kyoto, Japan 🏯"

**ASCII Art:**
```
                                  /\
                                  /\
                                  /\
                                  /\
                                _`=='_
                             _-~......~-_
                         _--~............~--_
                   __--~~....................~~--__
       .___..---~~~................................~~~---..___,
        `=.________________________________________________,='
           @^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^@
                    |  |  I   I   II   I   I  |  |
                    |  |__I___I___II___I___I__|  |
                    | /___I_  I   II   I  _I___\ |
                    |'_     ~~~~~~~~~~~~~~     _`|
                __-~...~~~~~--------------~~~~~...~-__
        ___---~~......................................~~---___
.___..---~~~......................................................~~~---..___,
 `=.______________________________________________________________________,='
    @^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^@
          |   |    | |    |  |    ||    |  |    | |    |   |
          |   |____| |____|  |    ||    |  |____| |____|   |
          |__________________|____||____|__________________|
        _-|_____|_____|_____|__|------|__|_____|_____|_____|-_
```
(Elaborate Japanese temple/castle)

**Description:**
"You're in Kyoto, Japan 🏯

K. is with you 🖤"

**onEnter Message:**
"You landed in Kyoto, Japan. 3 Year have passed...

You're now outside of your Kyoto apartment"

**Narrative Purpose:**
- TIME JUMP: The flash-forward
- Showing the imagined future together
- Setting up domestic life in a new culture
- Leading to the climactic kitchen scene

**Gameplay:**
- Accessed via FLY TO japan command
- Only flyable from beach_sunset
- K automatically moves here if `agreedToTravel` is true
- onFly callback can be triggered

**Emotional Tone:** Awe, accomplishment, "we made it," cultural immersion

**Exits:**
- **NORTH → Kyoto Apartment**

**Items:** Book (Japanese drawing)

**Characters:** K (if traveled together)

**Special Mechanics:**
- `isFlyableFrom: "beach_sunset"` enables flying here
- Time skip explicitly stated (3 years)
- K's roomId updated to this location

---

### Scene 7: Kyoto Apartment

**Room ID:** `kyoto_apt`
**Name:** "Kyoto Apartment"

**Description:**
"You're in your cozy Japanese apartment

You smell a wonderful smell, something is cooking in the **KITCHEN**."

**Narrative Purpose:**
- Domestic life together in future
- Cultural element (Japanese house customs)
- Setup for kitchen scene
- Transition space with cultural puzzle

**Gameplay:**
- Must find and USE slippers to remove shoes (Japanese custom)
- Teaches cultural respect through gameplay
- K moves to kitchen automatically (onEnter)
- Topics switched to kitchen conversation set

**Emotional Tone:** Homey, cultural, anticipatory, warm

**Exits:**
- **EAST → Kitchen** (blocked until slippers used)

**Items:** Uwabaki (slippers), Tiger Zodiac Sign

**Characters:** K (in kitchen)

**Special Mechanics:**
- `k.roomTopics["beach_sunset"]` saves previous topics
- `k.topics` replaced with kitchen topics
- `k.roomId` set to "kitchen"
- Exit block teaching cultural customs
- Zodiac sign foreshadowing kitchen conversation

**Cultural Note:** Removing outdoor shoes is fundamental Japanese etiquette

---

### Scene 8: Kitchen (The Heart)

**Room ID:** `kitchen`
**Name:** "Kitchen"

**Description:**
"You're in the KITCHEN.

K. is cooking Dim Sum famous japanese dumplings"

**Narrative Purpose:**
- THE CLIMAX of the game
- Deepest conversation (I LOVE you)
- Zodiac sign revelations
- Future prophecy
- The Infinity Ouroboros necklace gift
- The promise of eternity

**Gameplay:**
- Must take chopsticks to eat dumplings
- Eating together unlocks deeper conversation
- Conversation chain leads to THE GIFT
- Using necklace triggers final Easter egg
- Using necklace unlocks path home

**Emotional Tone:** Intimate, profound, eternal, loving, culminating

**Exits:**
- **SOUTH → Japan** (blocked until necklace is used)

**Items:** Chopsticks, Dumplings, (Necklace added via dialogue)

**Characters:** K (cooking)

**Conversation Flow:**
1. MAKING → Dim sum
2. LOVE → "I love you too" (Easter egg: `pnk_love`)
3. (After eating dumplings)
4. TIGER → Your zodiac sign
5. ZODIAC → I'm Snake 🐍
6. FUTURE → Prophecy of growing stronger together
7. → Gift of Infinity Ouroboros necklace
8. USE necklace → "Time to fly back to TLV" (Easter egg: `pnk_fly`)

**Special Mechanics:**
- Taking chopsticks makes dumplings useable
- Using dumplings adds new topics to K
- FUTURE topic adds necklace to inventory via dialogue
- Using necklace removes exit block
- Multiple IFTTT triggers (`pnk_love`, `pnk_fly`)

**Symbolism:**
- Cooking together = building life together
- Eating together = trust and intimacy
- Zodiac signs = complementary strengths
- Necklace = eternal commitment
- Flying home = completing the circle

**Design Note:** This is the emotional peak. Every conversation choice has led here. The gift, the prophecy, the promise - this is what the whole journey was building toward.

---

### Scene 9: TLV Apartment (Home)

**Room ID:** `home`
**Name:** "TLV Apartment"

**ASCII Art:**
```
   /\
  //\
____//__\\____
\.-//----\\-,/
 \v/      \v/
 /\\      //\
//_\\____//_\\
'----\\--//----`
      \\//
       \/
```
(House/home)

**Description:**
"You're in your home.

and They lived happily ever after. in TLV Israel ✡️

THE END"

**Narrative Purpose:**
- THE ENDING
- Coming full circle (back to TLV)
- Happily ever after
- Completion

**Gameplay:**
- Accessed by flying from Japan
- Only accessible after obtaining and using necklace
- K's topics reset to simple love declaration
- Flying capability removed (journey complete)

**Emotional Tone:** Fulfilled, circular, eternal, complete

**Exits:** None (this is the end)

**Items:** None

**Characters:** K

**Special Mechanics:**
- `onEnter` resets K's topics to simple love conversation
- `isFlyableFrom` deleted (can't fly from here - journey is over)
- No exits (narrative complete)

**Conversation:**
- Simple "I Love you" exchange
- Triggers `pnk_love` Easter egg

**Design Note:** The simplicity is intentional. The journey is complete. They're home. Together. Forever.

---

## Narrative Flow Design

### Three-Act Structure

**Act I - How We Met (Scenes 1-5):**
- Inciting incident: Seeing K on the beach
- Rising action: Conversations building connection
- First plot point: Invitation to sunset walk
- Development: Deep preferences and dreams
- Act climax: Unlocking flight ability

**Act II - The Flash-Forward (Scenes 6-8):**
- Time jump: 3 years later
- New world: Living in Japan
- Cultural immersion: Japanese apartment customs
- Rising action: Cooking together, eating together
- Climax: The necklace, the prophecy, the love declaration

**Act III - Resolution (Scene 9):**
- Flying home together
- Circle complete
- Happily ever after
- THE END

### Pacing

- **Fast:** Scenes 1-2 (tutorial, meeting)
- **Medium:** Scenes 3-5 (building connection)
- **Jump:** Time skip to Scene 6
- **Slow:** Scenes 7-8 (savoring the future)
- **Complete:** Scene 9 (resolution)

### Player Agency vs. Linear Narrative

The game gives the illusion of choice while maintaining a linear love story:
- Conversations branch but rejoin
- Wrong answers are playful but don't block progress
- Japan is the "correct" answer, but others are entertaining
- The FLY command must be unlocked, but will be unlocked
- The player drives pacing, but destination is predetermined

This mirrors the feeling of fate - "when you know, you know."

---

## Scene Transitions

All transitions are intentional:

1. **Beach Rest → Beach:** Physical (cooling down, approaching)
2. **Beach → Beach Sunset:** Temporal (sun setting, time passing)
3. **Beach Sunset → Jaffa Apt:** Spatial (walking together)
4. **Jaffa Apt → Jaffa Street:** Temporal (sleeping, waking, morning)
5. **Jaffa Street → Japan:** Magical (FLYING - ability unlocked)
6. **Japan → Kyoto Apt:** Spatial (entering home)
7. **Kyoto Apt → Kitchen:** Physical (smelling food, entering room)
8. **Kitchen → Home:** Magical (FLYING - journey complete)

Physical, temporal, spatial, magical - each transition type serves the story.
