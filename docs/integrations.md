# Technical Integrations & Systems

## Game Engine: text-engine

**Source:** Fork/customization of open-source text-engine by okaybenji
**Repository:** https://github.com/okaybenji/text-engine
**Version:** 2.0.0
**License:** GPL

### Core Architecture

**Engine File:** `index.js` (26,081 bytes)
**Game Data:** `game-disks/p-n-k-forever.js` (JavaScript object/JSON)
**Frontend:** `index.html` (minimal HTML structure)
**Styling:** `styles/retro.css` (terminal aesthetic)

### Key Concepts

**Disk Metaphor:**
The game uses a "disk" metaphor from floppy disk era. The entire game is represented as a single JavaScript object (the "disk") that gets loaded into the engine.

```javascript
const talesOfPhonixAndK = {
  roomId: "beach_rest",  // Starting location
  rooms: [...],           // All locations
  characters: [...],      // All NPCs
  inventory: [],          // Player's items
  // Custom properties can be added
};

loadDisk(talesOfPhonixAndK);
```

---

## Command System

### Built-in Commands

The engine provides a global `commands` array organized by argument count:

**commands[0]** - No arguments:
- `look` - Describe current room
- `items` - List items in room
- `inv` - List inventory
- `save` - Save game to localStorage
- `load` - Load game from localStorage
- `help` - Show help menu
- `go` - List available exits

**commands[1]** - One argument:
- `take [item]` - Pick up an item
- `use [item]` - Use an item
- `go [direction]` - Move in a direction

**commands[2]** - Two arguments:
- `look at [item]` - Examine an item
- `talk to [character]` - Start conversation
- `fly to [location]` - (Custom, added dynamically)

### Custom Commands

P&K Forever adds the FLY command:

```javascript
const fly = (name) => {
  if (name && name.length > 0) {
    flyTo([null, name]);
  } else {
    flyTo(name);
  }
};

const flyTo = (args) => {
  const [_, name] = args;
  const flyableRooms = getFlyableRooms();
  const flyableRoomsNames = flyableRooms.map((r) => r.id);

  if (flyableRoomsNames.includes(name)) {
    const destRoom = flyableRooms.find((r) => r.id === name);
    if (disk.roomId === destRoom.isFlyableFrom) {
      println(`You fly to ${name}!`);

      if (typeof destRoom.onFly === "function") {
        destRoom.onFly({ disk, println });
      }

      const k = getCharacter("k");
      if (k.agreedToTravel) {
        k.roomId = name;
      }
      enterRoom(name);
    } else {
      println(`You can't fly to ${name} from ${disk.roomId}!`);
    }
  } else {
    if (name) {
      println(`You don't know how to fly to ${name}.`);
    }
    println("You hover in the sky! 🐦");
  }
};

// Register with command system
commands[0].fly = fly;
commands[1].fly = fly;
commands[2] = Object.assign(commands[2], { fly: flyTo });
```

### Help Menu Customization

```javascript
const updateHelpCommand = (additionalCommands) => {
  help = () =>
    println(`
  The following commands are available:
  ========================================================

    LOOK :: repeat room description

    LOOK AT [OBJECT NAME] e.g. 'look at key'
    TAKE [OBJECT NAME] e.g. 'take book'
    TALK TO [CHARACTER NAME]  e.g. 'talk to mary'
    GO [DIRECTION] e.g. 'go north'
    USE [OBJECT NAME] e.g. 'use door'

    ${additionalCommands || ``}

    ITEMS:  list items in the room
    INV :: list inventory items
    SAVE:   save the current game
    LOAD:   load the last saved game
    HELP :: this help menu
  `);

  commands[0].help = help;
};

updateHelpCommand();  // Initial call
// Later, when FLY is unlocked:
updateHelpCommand(`FLY TO [ROOM NAME] e.g. 'fly to room'`);
```

---

## Styling & Theme

### CSS Themes

**Retro Theme** (`styles/retro.css`) - Used by P&K Forever:
- Terminal/console aesthetic
- Green on black (classic terminal)
- Monospace font
- Scanline effects (optional)
- ASCII art friendly

**Modern Theme** (`styles/modern.css`) - Available but not used:
- Clean, contemporary design
- Better readability
- Sans-serif fonts

### Dynamic Theme Loading

```javascript
document.getElementById("styles").setAttribute("href", "styles/retro.css");
```

### Font

**Ultimate Apple II Font** from KreativeKorp
- Location: `fonts/font.ttf`
- Authentic retro computing aesthetic
- Excellent for ASCII art
- License: `fonts/font-license.txt`

---

## Data Persistence

### Save/Load System

**Storage:** Browser localStorage
**Format:** JSON string with function serialization

**Save Function:**
```javascript
let save = (name = 'save') => {
  const save = JSON.stringify(disk, (key, value) =>
    typeof value === 'function' ? value.toString() : value
  );
  localStorage.setItem(name, save);
  println(`Game saved.`)
};
```

**Load Function:**
```javascript
let load = (name = 'save') => {
  const save = localStorage.getItem(name);

  if (!save) {
    println(`Save file not found.`);
    return;
  }

  disk = JSON.parse(save, (key, value) => {
    try {
      return eval(value);  // Deserialize functions
    } catch (error) {
      return value;
    }
  });
  println(`Game loaded.`)
  enterRoom(disk.roomId);
};
```

### Limitations & Considerations

1. **Function Serialization:**
   - Functions are converted to strings
   - Closures are lost
   - Must use function expressions, not shorthand methods
   - Okay: `onUse: () => { ... }`
   - Not okay: `onUse() { ... }`

2. **Circular References:**
   - JSON doesn't support circular structures
   - Must avoid object properties that reference ancestors

3. **Reserved Keywords:**
   - Can't use JavaScript reserved words as object names
   - "key", "window", etc. must be avoided
   - Workaround: Use descriptive names ("silver key", "tall window")

4. **Version Compatibility:**
   - Saves contain the entire disk
   - Loading overwrites current disk completely
   - Publishing updates breaks old saves

5. **Security:**
   - `eval()` is used for function deserialization
   - Safe for personal use
   - Would need hardening for public deployment

---

## External Integrations

### IFTTT Webhooks

**Service:** IFTTT Maker Webhooks
**Purpose:** Trigger real-world actions from game events

**Implementation:**
```javascript
fetch(`https://maker.ifttt.com/trigger/{EVENT_NAME}/with/key/buN0S2VUtrVLjyoCLowl7X`)
```

**Events Used:**
- `pnk_mango` - Mango preference revealed
- `pnk_drink` - Tea preference revealed
- `pnk_chocolate` - Chocolate preference revealed
- `pnk_kite` - Kite equipment discovered
- `pnk_love` - Love declaration made
- `pnk_fly` - Necklace used, ready to fly home

**IFTTT Applet Setup (hypothetical):**

Each event would have corresponding IFTTT applet:

Example for `pnk_chocolate`:
```
IF Maker Event "pnk_chocolate" received
THEN
  - Send notification to phone
  - Or trigger smart home action
  - Or send email
  - Or add to shopping list
  - Or [any IFTTT integration]
```

**Security Notes:**
- Webhook key is public in game code
- Appropriate for personal use (game for one person)
- For public version, would need:
  - Backend proxy
  - Authentication
  - Rate limiting
  - Key rotation

---

## Deployment

### Netlify

**Status Badge:**
```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/4f0e996c-d0d0-419c-b7e2-8b1e4ff805ac/deploy-status)](https://app.netlify.com/sites/p-n-k-forever/deploys)
```

**Configuration** (`netlify.toml`):
```toml
[build]
  publish = "v0-original-text-engine"
  command = "echo 'No build needed - static HTML'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deployment:**
- Static site hosting
- No build process needed (pure HTML/JS/CSS)
- Automatic deploys from git
- HTTPS provided
- CDN distribution

**Site URL:** https://p-n-k-forever.netlify.app (presumed)

---

## Browser Compatibility

### Requirements

**Minimum:**
- JavaScript ES6 support (arrow functions, const/let, template literals)
- Fetch API support
- localStorage support
- Basic CSS3 support

**Tested On:**
- Modern Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Android)

**Not Supported:**
- Internet Explorer
- Very old mobile browsers
- Browsers with JavaScript disabled

### Polyfills

None used - assumes modern browser environment

---

## Input System

### Input Handling

**Input Element:**
```html
<input id="input" autofocus spellcheck="false">
```

**Event Listeners:**

**ENTER key** - Submit command:
```javascript
input.addEventListener('keypress', (e) => {
  const ENTER = 13;
  if (e.keyCode === ENTER) {
    applyInput();
  }
});
```

**UP/DOWN arrows** - Command history:
```javascript
input.addEventListener('keydown', (e) => {
  const UP = 38;
  const DOWN = 40;
  const TAB = 9;

  if (e.keyCode === UP) {
    navigateHistory('prev');
  } else if (e.keyCode === DOWN) {
    navigateHistory('next');
  } else if (e.keyCode === TAB) {
    e.preventDefault();
    autocomplete();
  }
});
```

**Focus management:**
```javascript
input.addEventListener('focusout', () => {
  input.focus({preventScroll: true});
});
```

### Command History

```javascript
let inputs = [''];  // History of commands
let inputsPos = 0;  // Current position in history
```

- UP arrow: Navigate to previous command
- DOWN arrow: Navigate to next command
- History persists through session

### Autocomplete

TAB key triggers autocomplete:
- Suggests available commands
- Suggests items in room
- Suggests character names
- Suggests directions

---

## Output System

### Output Element

```html
<div id="output"></div>
```

### println Function

```javascript
let println = (line, className) => {
  const output = document.querySelector('#output');
  const lineElement = document.createElement('div');

  if (className) {
    lineElement.classList.add(className);
  }

  // Handle arrays (random selection)
  if (Array.isArray(line)) {
    line = pickOne(line);
  }

  lineElement.innerHTML = line;
  output.appendChild(lineElement);

  // Auto-scroll to bottom
  output.scrollTop = output.scrollHeight;
};
```

**Features:**
- Accepts string or array (array = random choice)
- Optional CSS class for styling
- Auto-scrolls to show new content
- Supports HTML/Markdown formatting

---

## Game Loop

### Initialization

```javascript
loadDisk(talesOfPhonixAndK);
```

**Process:**
1. `init(disk)` - Add default values
2. `setup()` - Register event listeners
3. `enterRoom(disk.roomId)` - Enter starting room

### Room Entry

```javascript
enterRoom(id) {
  const room = getRoom(id);

  // Update disk state
  disk.roomId = id;

  // Increment visit counter
  room.visits++;

  // Display room
  if (room.img) println(room.img);
  println(room.name, 'room-name');
  println(room.desc);

  // List characters
  const characters = getCharactersInRoom(id);
  if (characters.length) {
    println(`Characters: ${characters.map(c => c.name[0]).join(', ')}`);
  }

  // List items
  if (room.items && room.items.length) {
    println(`Items: ${room.items.map(i => i.name[0]).join(', ')}`);
  }

  // Callback
  if (typeof room.onEnter === 'function') {
    room.onEnter();
  }
}
```

### Command Processing

1. User types command
2. ENTER pressed
3. `applyInput()` called
4. Command parsed (split by spaces)
5. Matched against commands[argumentCount]
6. Corresponding function executed
7. Result printed to output
8. Input cleared, ready for next command

---

## Helper Functions

### Utility Functions

**pickOne(arr)** - Random array element:
```javascript
let pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
```

**getRoom(id)** - Find room by ID:
```javascript
let getRoom = (id) => disk.rooms.find(room => room.id === id);
```

**getCharacter(name)** - Find character by name:
```javascript
let getCharacter = (name, chars = disk.characters) => {
  return chars.find(char => {
    const names = Array.isArray(char.name) ? char.name : [char.name];
    return names.includes(name);
  });
};
```

**getExit(dir, exits)** - Find exit by direction:
```javascript
let getExit = (dir, exits) => {
  return exits.find(exit => exit.dir === dir);
};
```

### Custom Helpers (P&K Forever)

**getFlyableRooms()** - Get rooms that can be flown to:
```javascript
const getFlyableRooms = () => {
  return disk.rooms.filter((r) => r.isFlyableFrom);
};
```

---

## Special Mechanics

### Visit Tracking

```javascript
room.visits = 0;  // Initialized for each room
```

Incremented each time room is entered. Could be used for:
- Different descriptions on repeat visits
- Unlocking content after multiple visits
- Tracking exploration completeness

(Not heavily used in P&K Forever, but available)

### Dynamic Room/Character Modification

Characters can move between rooms:
```javascript
const k = getCharacter("k");
k.roomId = "beach_sunset";  // Move K to new location
```

Items can be added to rooms dynamically:
```javascript
const street = getRoom("jaffa_street");
street.items.push({
  name: ["Kite Board"],
  desc: "Your kite equipment",
  // ...
});
```

Exits can be added/removed:
```javascript
// Add exit
street.exits.push({
  dir: "north",
  id: "beach_sunset",
});

// Remove exit block
const exit = getExit("east", room.exits);
delete exit.block;
```

### Topic System for Conversations

```javascript
k.roomTopics = {};  // Storage for location-specific topics
k.roomTopics["beach"] = k.topics;  // Save current topics
k.topics = k.roomTopics["kitchen"] || [ /* new topics */ ];  // Switch
```

Allows characters to have different conversations in different locations while preserving history.

---

## Debug Features

### Debug Room Override

```javascript
const debug_room = null;  // "japan"
const talesOfPhonixAndK = {
  roomId: debug_room || "beach_rest",
  // ...
};
```

Set `debug_room` to skip to specific location for testing.

### Console Access

All game functions are global, allowing console debugging:
```javascript
// In browser console:
disk.roomId = "japan";
enterRoom("japan");
getCharacter("k").roomId = "japan";
disk.inventory.push({name: "test item"});
```

---

## Performance Considerations

### Lightweight Architecture

- **No frameworks:** Pure vanilla JavaScript
- **No bundling:** Direct script loading
- **No compilation:** Runs as-is
- **Total size:** ~100KB including ASCII art
- **Load time:** Near-instant on any connection

### Optimization Opportunities (for v2)

1. **Code splitting:** Separate engine from game data
2. **Lazy loading:** Load rooms/assets on demand
3. **Image sprites:** If adding graphics
4. **Compression:** Minify JS/CSS
5. **Caching:** Service worker for offline play

---

## Accessibility

### Current State

**Good:**
- Keyboard-only navigation
- Text-based (screen reader friendly)
- High contrast (retro theme)
- Semantic HTML structure

**Could Improve:**
- ARIA labels
- Skip to content links
- Configurable text size
- Alternative themes (light mode, high contrast, dyslexia-friendly)
- Screen reader optimizations
- Keyboard shortcut documentation

### Recommendations for v2

- Add ARIA landmarks
- Provide alt text for ASCII art (or semantic replacements)
- Implement theme switcher
- Add text scaling controls
- Test with actual screen readers
- Consider audio descriptions for visual elements

---

## Security Considerations

### Current Implementation

**Safe:**
- Static content only
- No server-side code
- No user data collection
- No authentication system

**Potential Concerns:**
- `eval()` in load function (mitigated by localStorage-only access)
- IFTTT key in client code (acceptable for personal use)
- No rate limiting on webhooks (could be spammed)

### For Public Version

Would need:
1. Backend API for webhooks
2. Authentication/authorization
3. Rate limiting
4. Input sanitization
5. CSP headers
6. HTTPS only
7. Remove eval(), use safer deserialization

---

## Future Integration Opportunities

### Potential Additions for v2

1. **Analytics:** Track which Easter eggs are discovered
2. **Achievements:** Steam-like achievement system
3. **Social:** Share progress, screenshots
4. **Multiplayer:** Collaborative puzzle solving
5. **Voice:** Voice commands/narration
6. **AR:** Real-world object scanning
7. **Blockchain:** NFT Easter eggs (if appropriate)
8. **AI:** Dynamic conversation generation
9. **Haptics:** Controller/phone vibration
10. **Music:** Dynamic soundtrack

### Maintaining Simplicity

Any additions should honor the original's elegance:
- No forced complexity
- User choice for features
- Graceful degradation
- Progressive enhancement
- Keep core experience pure

---

## Technical Philosophy

The original P&K Forever makes powerful choices:

1. **No dependencies** = No breaking changes, eternal compatibility
2. **Simple architecture** = Easy to understand, modify, preserve
3. **JSON-based** = Human-readable, version-controllable
4. **Browser-native** = No installation, universal access
5. **Lightweight** = Fast, accessible, sustainable

When modernizing, we must ask: "Does this addition serve the story and the player, or just the technology?"

The goal isn't to show off what's possible - it's to honor what's meaningful.
