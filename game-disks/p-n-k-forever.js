// This simple game disk can be used as a starting point to create a new adventure.
// Change anything you want, add new rooms, etc.

bullet = "&ast;";

const updateHelpCommand = (additionalCommands) => {
  // customize the help menu
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
updateHelpCommand();

document.getElementById("styles").setAttribute("href", "styles/retro.css");

const getFlyableRooms = () => {
  return disk.rooms.filter((r) => r.isFlyableFrom);
};

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

commands[0].fly = fly;
commands[1].fly = fly;
commands[2] = Object.assign(commands[2], { fly: flyTo });

let isFlyOn = false;
let isLove = false;

const debug_room = null //"japan";

const talesOfPhonixAndK = {
  roomId: debug_room || "beach_rest", // Set this to the ID of the room you want the player to start in.
  rooms: [
    {
      id: "beach_rest", // Unique identifier for this room. Entering a room will set the disk's roomId to this.
      name: "Phoenix favorite beach Slushy place", // Displayed each time the player enters the room.
      img: `
         __             __
      .-'.'    Ä.-.Ä    '.'-.
    .'.((      ( ^ \`>     )).'.
   /\`'- \\'._____\\ (_____.'/ -'\`\\
   |-''\`.'------' '------'.\`''-|
   |.-'\`.'.'.\`/ | | \`.'.'.\`'-.|
    \\ .' . /  | | | |  \\ . '. /
     '._. :  _|_| |_|_  : ._.'
        \`\`\`\`\` /T"Y"T\\ \`\`\`\`\`
             / | | | \\
            \`'\`'\`'\`'\`'\`
      `,
      desc: `Welcome to the tales of P. Who?
      P. it's short for Phoenix, but everyone calls her P.
      P. is a very nice, friendly, and helpful bird or a cat. depends on how you look at it. or her mood.

      She's a curious little "birdcat". she is alway on the look for new adventures & challenges.
      We meet Phox in another ordinary day of adventures at the TLV beach, Phox like the salty air at the beach & the humans catching sun. 
      P.  Like to stretch her feathers & glide above the open waters of the sea. 

      Type **LOOK** to have a look around.
      `,
      onLook: () => {
        const room = getRoom("beach_rest");
        room.desc = `
        P. is taking a rest at her favorite beach restaurant, gulping her Slushy 🥤 (acai 🫐 duhh) waiting for the winds to calm so she could enjoy the warm winds of this particular summer day 🌞
        P. Was contemplating about her business, P. Is very talented & has many skills and she was think what will be her next endeavor.  

        Suddenly she spotted a dog on a bicycle, not just any dog 🤷‍♀️ a "peacockdog" 🐕🦚  & the little that she know is that this doggo is a "shiba" 🐾 and that both of them will be her next adventure.
        She never seen a dog like that, this dog was wearing some colorful feathers - "intriguing! She thought to herself" 
        Fascinated by this dog, she decided to approach him 💬 
        `;
      },
      items: [
        {
          name: "door",
          desc: "It leads WEST.",
          onUse: () => println(`Type GO WEST to try the door.`),
        },
        {
          name: [
            "slushy",
            "shake",
            "frozen drink",
            "Acai Smoodie",
            "cold drink",
          ], // The player can refer to this item by either name. The game will use the first name.
          desc: `Yummy, cold & nutritional exactly like P loves it 😋`,
          isTakeable: true,
          gulps: 3,
          ontake: () => println(`You take the slushy 🥤`),
          onUse: () => {
            const drink = getItemInInventory("slushy");
            if (!drink) {
              println(`You don't have any slushy 🥤 
                       Maybe you need to TAKE it first`);
              return;
            }

            if (drink && drink.gulps > 0) {
              if (drink.gulps === 3) {
                const room = getRoom("beach_rest");
                const exit = getExit("west", room.exits);

                if (exit.block) {
                  delete exit.block;
                  println(`You cool down with a big gulp of slushy`);
                }
              }

              println(`gulp`);
              drink.gulps -= 1;
              if (drink.gulps > 0) {
                println(`You have ${drink.gulps} slushy 🥤 left`);
              } else {
                println(`That was the last drop`);
              }
            } else {
              disk.inventory.splice(disk.inventory.indexOf(drink), 1);
              println(`You don't have any slushy left.`);
              println(`You dropped the empty slushy`);
            }
          },
        },
      ],
      exits: [
        {
          dir: "west", // "dir" can be anything. If it's north, the player will type "go north" to get to the room called "A Forest Clearing".
          id: "beach",
          block: `It's too hot outside! 🥵
                  Maybe something COLD can help`, // If an exit has a block, the player will not be able to go that direction until the block is removed.
        },
      ],
    },
    {
      name: "🏖 The Beach",
      id: "beach",
      img: `
       _\\/_                 |                _\\/_
       /o\\              \\       /            //o\\
        |                 .---.                |
       _|_______     --  /     \\  --     ______|__
             \`~^~^~^~^~^~^~^~^~^~^~^~\`
      `,
      desc: `You are on the beach.
            the fascinating **DOG** is here`,
      items: [
        {
          name: ["🏖", "beach", "sand"],
          desc: `You are on the sandy beach of TLV.`,
        },
        {
          name: ["bicycle", "Brompton", "colorful bike", "bike"],
          desc: `a bicycle`,
        },
        {
          name: ["shekel", "dime", "coin"],
          desc: `Wow, you found a Shekel in the sand.`,
          isTakeable: true, // allow the player to TAKE this item
          onTake: () =>
            println(`You bend down and pick up the tiny, shiny coin.

          *Now it's in your **inventory**, and you can use it at any time, in anywhere. (Don't spend it all in one place!)

          Type **INV** to see a list of items in your inventory.*`),
          // using the dime randomly prints HEADS or TAILS
          onUse: () => {
            const side = Math.random() > 0.5 ? "HEADS" : "TAILS";
            println(`You flip the shekel. It lands on ${side}.`);
          },
        },
      ],
      exits: [
        {
          dir: "south",
          id: "beach_sunset",
          block: `There's still much to do here`,
        },
      ],
    },
    {
      id: "beach_sunset",
      name: "🏖️ Sunset Beach 🌄",
      desc: `You're walking tword Jaffa, the beach is cleared of most people it's more peace & quite now.
      
      It's good time as any to talk with K.
      `,
      onEnter: () => {
        println(
          `P. says: "You know I'm living near here in Jaffa we can go to my place`
        );
        const k = getCharacter("k");
        k.roomId = "beach_sunset";
        k.roomTopics["beach"] = k.topics;
        k.topics = k.roomTopics["beach_sunset"] || [
          {
            option: "What's your favorite type of **FOOD**?",
            line: "Easy Fruits & Vegetables 🍓🥦 What's yours?",
            removeOnRead: true,
          },
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
          },
          {
            option:
              "What's your favorite type of hot beverage you like to **DRINK**? Coffee or Tea?",
            removeOnRead: true,
            line: "Coffee 🍵 & yours?",
          },
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
          },
          {
            option: "Do you have a **SWEET** you can't resist?",
            line: "I like many sweets, I love Ice cream 🍨. You?",
            removeOnRead: true,
          },
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
          },
          {
            option: "Do you want to **TRAVEL** the world?",
            line: `I love to travel, I've traveled a lot.
            I want to be a digital nomad in the future`,
            removeOnRead: true,
          },
          {
            option: `Digital what? What's a digital **NOMAD**`,
            line: `A digital nomad is a person who lives all over the world traveling & working in a remote manner.
            
            Read more about it: https://en.wikipedia.org/wiki/Digital_nomad`,
            prereqs: ["travel"],
            removeOnRead: true,
          },
          {
            option: "Do you want to travel with me around the **WORLD**?",
            line: `I would love to travel with you, Where do you think we should head first?.`,
            prereqs: ["travel", "nomad"],
            removeOnRead: true,
          },
          {
            option: "**JAPAN** 🇯🇵",
            line: `I love asian culture. The food, the people & their style
            My ancestors are from Japan`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
            onSelected: () => {
              const k = getCharacter("k");
              k.agreedToTravel = true;
            },
          },
          {
            option: "How can we **FLY** to **Japan** ✈️?",
            line: `Maybe we should take a plane? 
            P. says: I know! I can take us their. I can fly ✈️
            
            Use **FLY** to [a place] to use your skill to fly, it's your secret trick`,
            prereqs: ["travel", "nomad", "world", "japan"],
            removeOnRead: true,
            onSelected: () => {
              if (!isFlyOn) {
                commands[2] = Object.assign(commands[2], { fly });

                updateHelpCommand(`FLY TO [ROOM NAME] e.g. 'fly to room'`);

                isFlyOn = true;
              }
            },
          },
          {
            option: "**GERMANY** 🇩🇪",
            line: `I love Berlin. Ich bin berliner 🐻 
            P. says: On a second thought I hate german people.
            Did I tell you about my german teacher 😖`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
          {
            option: "**CHINA** 🇨🇳",
            line: `I'm looking for something more western civilization`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
          {
            option: "**HONG KONG** 🇭🇰",
            line: `Sounds good, but I'll pass`,
            prereqs: ["travel", "nomad", "world", "china"],
            removeOnRead: true,
          },
          {
            option: "**INDIA** 🇮🇳",
            line: `Indians are sticky, love their food though 🙈`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
          {
            option: "**FRANCE** 🇫🇷",
            line: `I hate French people`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
          {
            option: "**ITALY** 🇮🇹",
            line: `I love italy, I love their food 🍝
            but I don't see myself living their. at least for now`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
          {
            option: "**USA** 🇺🇸",
            line: `YES! let's go right now! USA USA I love america
            P. says: In second thought, I don't this it is the right move for us right now`,
            prereqs: ["travel", "nomad", "world"],
            removeOnRead: true,
          },
        ];
      },
      exits: [
        {
          dir: "south",
          id: "jaffa_apt",
        },
      ],
    },
    {
      name: "Jaffa Apartment",
      img: `
            |\\      _,,,---,,_
      ZZZzz /,\`.-'\`'    -.  ;-;;,_
           |,4-  ) )-,_. ,\\ (  \`'-'
          '---''(_/--'  \`-'\\_)
      `,
      id: "jaffa_apt",
      desc: `You're in the Jaffa Apartment.
      Your flat is full of memories & items you've collected in your past travels.
      K is sleeping in your LIVING ROOM BED.
      `,
      items: [
        {
          name: "bed",
          desc: `K. is laying on the bed`,
          onUse: () => {
            const street = getRoom("jaffa_street");
            street.items.push({
              name: ["Kite equipement", "Kite", "Kite Board"],
              desc: `You found your Kite Board.`,
              isTakeable: true,
              onTake: () => {
                println(`You took your Kite Board
              
              Use this code in the future for a special discout: \`PNK-n3zk7MAMBG-GIFT
              \` `);
                fetch(
                  `https://maker.ifttt.com/trigger/pnk_kite/with/key/buN0S2VUtrVLjyoCLowl7X`
                );
              },
            });
            street.exits.push({
              dir: "north",
              id: "beach_sunset",
            });

            println([
              `K. cuddles you & you sleep togther until morning 💤`,
              `You sleep with K. 😴`,
              `You wake up to the sound of Jaffa's streets. K. is still snoring 😪`,
            ]);
          },
        },
        {
          name: "door",
          desc: `You can go NORTH to Jaffa street.`,
          onUse: () => println(`Type GO NORTH to go to the Jaffa street.`),
        },
      ],
      exits: [
        {
          dir: "north",
          id: "jaffa_street",
        },
      ],
    },
    {
      name: "Jaffa Street",
      id: "jaffa_street",
      desc: `You're on the Jaffa Street.`,
      items: [
        {
          name: "door",
          desc: `You can go SOUTH to the Jaffa Apartment.`,
          onUse: () => println(`Type GO SOUTH to enter the Jaffa Apartment.`),
        },
      ],
      exits: [
        {
          dir: "south",
          id: "jaffa_apt",
        },
      ],
    },
    {
      name: "Kyoto, Japan 🏯",
      id: "japan",
      img: `
                                      /\\
                                      /\\
                                      /\\
                                      /\\
                                    _\`=='_
                                 _-~......~-_
                             _--~............~--_
                       __--~~....................~~--__
           .___..---~~~................................~~~---..___,
            \`=.________________________________________________,='
               @^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^@
                        |  |  I   I   II   I   I  |  |
                        |  |__I___I___II___I___I__|  |
                        | /___I_  I   II   I  _I___\ |
                        |'_     ~~~~~~~~~~~~~~     _\`|
                    __-~...~~~~~--------------~~~~~...~-__
            ___---~~......................................~~---___
.___..---~~~......................................................~~~---..___,
 \`=.______________________________________________________________________,='
    @^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^@
              |   |    | |    |  |    ||    |  |    | |    |   |
              |   |____| |____|  |    ||    |  |____| |____|   |
              |__________________|____||____|__________________|
            _-|_____|_____|_____|__|------|__|_____|_____|_____|-_

      `,
      desc: `You're in Kyoto, Japan 🏯
      
      K. is with you 🖤`,
      isFlyableFrom: "beach_sunset",
      onEnter: () => {
        println(`You landed in Kyoto, Japan. 
        3 Year have passed...
        
        You're now outside of your Kyoto apartment`);
      },
      items: [
        {
          name: ["book"],
          desc: `you found a book with Japanese drawing.`,
        },
      ],
      exits: [
        {
          dir: "north",
          id: "kyoto_apt",
        },
      ],
    },
    {
      name: "Kyoto Apartment",
      desc: `You're in your cusy Japanese apratment
      
      You smell a wonderful smell, something is cooking in the **KITCHEN**.
      `,
      id: "kyoto_apt",
      onEnter: () => {
        const k = getCharacter("k");
        k.roomId = "kitchen";
        k.roomTopics["beach_sunset"] = k.topics;
        k.topics = k.roomTopics["kitchen"] || [
          {
            option: "What're you **MAKING**? 🍜",
            line: `I'm making dim sum.`,
            removeOnRead: true,
          },
          {
            option: "I **LOVE** you 🧡",
            line: `I love you too. 🖤`,
            onSelected: () => {
              isLove = true;
              fetch(
                `https://maker.ifttt.com/trigger/pnk_love/with/key/buN0S2VUtrVLjyoCLowl7X`
              );
            },
          },
        ];
      },
      items: [
        {
          name: ["Uwabaki", "slippers"],
          desc: `You found your slippers.`,
          onUse: () => {
            const room = getRoom("kyoto_apt");
            const exit = getExit("east", room.exits);
            delete exit.block;

            println(
              `You wear your nice & clean house slippers "Uwabaki" instead of your dirty shoes`
            );
          },
        },
        {
          name: "Tiger Zodiac Sign",
          isTakeable: true,
          desc: `You found your Zodiac sign. The Tiger`,
        },
      ],
      exits: [
        {
          dir: "east",
          id: "kitchen",
          block: "K. yells at you! No walking in the house with dirty shoes!",
        },
      ],
    },
    {
      name: "Kitchen",
      id: "kitchen",
      desc: `You're in the KITCHEN.

      K. is cooking Dim Sum famous japanse dumplings`,
      items: [
        {
          name: ["chop sticks", "fancy chop sticks"],
          desc: `You found your fancy chop sticks.`,
          isTakeable: true,
          onTake: () => {
            const dumplings = getItemInRoom("dumplings", "kitchen");
            dumplings.isTakeable = true;
            dumplings.onUse = () => {
              println(`You eat the japanese dumpling. yum yum yum`);
              const k = getCharacter("k");
              k.topics.push({
                option: "What's the deal with the **TIGER** sign? 🐅📖",
                line: `This is your Zodiac sign the Tiger`,
                removeOnRead: true,
              });
              k.topics.push({
                option: "What is your **ZODIAC** sign?",
                line: `I'm Snake 🐍`,
                prereqs: ["tiger"],
                removeOnRead: true,
                onSelected: () => {
                  k.topics.push({
                    option: "How our **FUTURE** be like?",
                    line: `Our relationship will grow only stornger & stroger with the year.
                    We will continue to challenge each other & my each other stronger, better togther as whole.
                    
                    You're my protector & I'm yours
                    Stronger togther, we're one. to eternity.
                    
                    I've prepared a small gift for you. It's my **ZODIAC** sign. the **SNAKE** to alway protect you and help you be strong.
                    `,
                    onSelected: () => {
                      println(`**K.** pulls a beautiful silver double necklace with an infinity Ouroboros amulet connected with a kite connector.

                      "Here, put this on your neck." K. says. use it to wear it.
                      `);
                      disk.inventory.push({
                        name: [
                          "necklace",
                          "Infinity Ouroboros double necklace",
                        ],
                        desc: "A gift from K. a uniqe design that symbolize our relationship",
                        onUse: () => {
                          println(
                            `You put the necklace sign on your neck. 🧡🖤🧡🖤`
                          );

                          println(`K. Says I think it's time to fly back to TLV
                          Let's got out of here togther & fly`);
                          const kitchen = getRoom("kitchen");
                          const exit = getExit("south", kitchen.exits);
                          delete exit.block;

                          fetch(
                            `https://maker.ifttt.com/trigger/pnk_fly/with/key/buN0S2VUtrVLjyoCLowl7X`
                          );
                        },
                      });
                    },
                  });
                },
              });
            };
          },
        },
        {
          name: ["dumplings", "dumpling", "japanese dumpling"],
          desc: `You found a japanese dumpling. it's now cooking`,
        },
      ],
      exits: [
        {
          dir: "south",
          id: "japan",
          block: `K.: "I've a suprise for you." You can't go out of here yet.",`,
        },
      ],
    },
    {
      name: "TLV Apartment",
      id: "home",
      img: `
       /\\
      //\\
 ____//__\\\\____
 \\.-//----\\\\-,/
  \\v/      \\v/
  /\\\\      //\\
 //_\\\\____//_\\\\
'----\\\\--//----\`
      \\\\//
       \\/  
      `,
      desc: `You're in your home.
      
      and They lived happly ever after. in TLV Israel ✡️

      THE END
      `,
      onEnter: () => {
        const k = getCharacter("k");
        k.topics = [
          {
            option: "I Love you 🧡",
            line: `I love you too. 🖤`,
            onSelected: () => {
              fetch(
                `https://maker.ifttt.com/trigger/pnk_love/with/key/buN0S2VUtrVLjyoCLowl7X`
              );
            },
          },
        ];
        const room = getRoom("home");
        delete room.isFlyableFrom;
      },
      isFlyableFrom: "japan",
    },
  ],
  characters: [
    {
      id: "k",
      name: ["dog", "peacockdog", "Ehecatl", "Kobi", "shiba"],
      desc: `He looks like a very nice person.
      also a bit of a loner, but he seems pleasant.
      `,
      roomId: "beach",
      onTalk: () => {
        println(`"Hi," he says, "How can I help you?"`);
      },
      roomTopics: {},
      topics: [
        {
          option: "What's your **NAME**?",
          removeOnRead: true,
          onSelected() {
            println(
              `"My name is **K.** It actually "Ehecatl" but everybody call me **K.**`
            );

            const k = getCharacter("k");
            k.name.unshift("K.");
            k.desc = `It's K.`;

            const room = getRoom("beach");
            room.desc = `You are on the beach.
            **K.** is here
            `;
            const bike = getItemInRoom("bicycle", room.id);
            bike.desc = `K's bicycle`;
          },
        },
        {
          option: "Your **BICYCLE** is cool, what's it?",
          line: `It's a Brompton, it's a folding bicycle`,
        },
        {
          option: "I've a **BUSINESS** question, do you mind?",
          line: `Not at all, ask away`,
          prereqs: ["name"],
          removeOnRead: true,
        },
        {
          option:
            "I'm an **ARTIST**, I thought to start dog portrait business. since you're a dog I thought you would know a thing or two about it",
          line: `I'm not sure I'm up to it, but I'm sure I you can help me out here. I know various dog association persona & I've some business experince myself
          I'll be glad to help out`,
          removeOnRead: true,
          prereqs: ["business"],
        },
        {
          option:
            "The sun is going down but, I think we have much to talk about. Want to **CONTINUE** our conversation to the sunset?",
          line: `Sure, I've never met someone like you. I would love that
          Let's walk beside the sunset to Jaffa it's **SOUTH** of here`,
          removeOnRead: true,
          prereqs: ["business", "artist"],
          onSelected: () => {
            const room = getRoom("beach");
            const exit = getExit("south", room.exits);

            if (exit.block) {
              delete exit.block;
            }
          },
        },
      ],
    },
  ],
};
