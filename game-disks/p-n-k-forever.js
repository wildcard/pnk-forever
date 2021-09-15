// This simple game disk can be used as a starting point to create a new adventure.
// Change anything you want, add new rooms, etc.

bullet = "&ast;";

// customize the help menu
help = () =>
  println(`LOOK :: repeat room description
LOOK AT [OBJECT NAME] e.g. 'look at key'
TAKE [OBJECT NAME] e.g. 'take book'
GO [DIRECTION] e.g. 'go north'
USE [OBJECT NAME] e.g. 'use door'
INV :: list inventory items
HELP :: this help menu`);

const fly = (args) => {
  const [_, name] = args;
  if (['japan', 'home'].includes(name)) {
    println(`You fly to ${name}!`);
    getCharacter('k').roomId = name;
    enterRoom(name);
  } else {
    println(`You don't know how to fly to ${name}.`);
    println("You hover in the sky! 🐦");
  }
};

const talesOfPhonixAndK = {
  roomId: "beach_rest", // Set this to the ID of the room you want the player to start in.
  rooms: [
    {
      id: "beach_rest", // Unique identifier for this room. Entering a room will set the disk's roomId to this.
      name: "Phoenix favorite beach Slushy place", // Displayed each time the player enters the room.
      desc: `Welcome to the tales of P. Who?
      P. it's short for Phoenix

      Type **LOOK** to have a look around.

      There's a door to the NORTH, but it is overgrown with VINES. Type ITEMS to see a list of items in the room.`, // Displayed when the player first enters the room.
      items: [
        {
          name: "door",
          desc: "It leads NORTH.", // Displayed when the player looks at the item.
          onUse: () => println(`Type GO NORTH to try the door.`), // Called when the player uses the item.
        },
        {
          name: ["vines", "vine"], // The player can refer to this item by either name. The game will use the first name.
          desc: `They grew over the DOOR, blocking it from being opened.`,
        },
        {
          name: "axe",
          desc: `You could probably USE it to cut the VINES, unblocking the door.`,
          isTakeable: true, // Allows the player to take the item.
          onUse: () => {
            // Remove the block on the room's only exit.
            const room = getRoom("start");
            const exit = getExit("north", room.exits);

            if (exit.block) {
              delete exit.block;
              println(
                `You cut through the vines, unblocking the door to the NORTH.`
              );
            } else {
              println(`There is nothing to use the axe on.`);
            }
          },
        },
      ],
      exits: [
        {
          dir: "north", // "dir" can be anything. If it's north, the player will type "go north" to get to the room called "A Forest Clearing".
          id: "clearing",
          block: `The DOOR leading NORTH is overgrown with VINES.`, // If an exit has a block, the player will not be able to go that direction until the block is removed.
        },
      ],
    },
    {
      name: "🏖 The Beach",
      id: "beach",
      desc: `You are on the beach.`,
      items: [
        { name: "🏖", desc: `You are on the beach.` }, // The player can refer to this item by either name. The game will use the first name.
      ],
    },
    {
      id: "beach_sunset",
      name: "🏖️ Sunset Beach 🌄",
      desc: `You're walking tword Jaffa, the beach is cleared of most people it's more peace & quite now.
      
      It's good time as any to talk with K.
      `,
      exits: [
        {
          dir: "south",
          id: "jaffa_apt",
        },
      ],
    },
    {
      name: "Jaffa Apartment",
      id: "jaffa_apt",
      desc: `You're in the Jaffa Apartment.
      Your flat is full of memories & items you've collected in your past travels.
      K is sleeping in your LIVING ROOM BED.
      `,
      items: [
        {
          name: "bed",
          desc: `K. cuddles you & you sleep togther until morning 💤`,
          onUse: () => {
              const street = getRoom("jaffa_street")
              street.items.push({
                name: ["Kite equipement","Kite", "Kite Board"],
                desc: `You found your Kite Board.`,                
              })
              street.exits.push({
                dir: "north",
                id: "beach",
              })

              println([
                `K. cuddles you & you sleep togther until morning 💤`,
                `You sleep with K. 😴`,
                `You wake up to the sound of Jaffa's streets. K. is still snoring 😪`,
              ])
            }
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
          onUse: () => println(`Type GO SOUTH to go to the Jaffa Apartment.`),
        },
      ],
      exits: [
        {
          dir: "south",
          id: "jaffa_apt",
        },
      ],
    },
    // {
    //   id: 'clearing',
    //   name: 'A Forest Clearing',
    //   desc: `It's a forest clearing. To the SOUTH is The First Room.`,
    //   exits: [
    //     {
    //       dir: 'south',
    //       id: 'start',
    //     },
    //   ],
    // }
  ],
  characters: [
    {
      id: "k",
      name: "peacockdog",
      desc: `He looks like a very nice person.
      also a bit of a loner, but he seems pleasant.
      `,
      roomId: "beach",
      onTalk: () => println(`"Hi," he says, "How can I help you?"`),
      topics: [
        {
          option: "What's your **NAME**?",
          removeOnRead: true,
          onSelected() {
            println(`"My name is K.`) 
          }
        },
      ]
    }
  ]
};



document.getElementById("styles").setAttribute("href", "styles/retro.css");
