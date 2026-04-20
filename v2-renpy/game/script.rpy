# DO NOT EDIT — emitted by tools/adapters/renpy/emit.ts from content/ IR.

init python:
    store.data_agreed_to_travel = False
    store.data_ate_dumplings = False
    store.data_can_fly = False
    store.data_can_go_sunset = False
    store.data_can_leave = False
    store.data_has_chopsticks = False
    store.data_has_kite = False
    store.data_has_necklace = False
    store.data_has_shekel = False
    store.data_has_slushy = False
    store.data_has_tiger_sign = False
    store.data_knows_name = False
    store.data_slept_with_k = False
    store.data_slushy_gulps = 3
    store.data_talked_artist = False
    store.data_talked_business = False
    store.data_talked_china = False
    store.data_talked_chocolate = False
    store.data_talked_drink = False
    store.data_talked_food = False
    store.data_talked_future = False
    store.data_talked_japan = False
    store.data_talked_love = False
    store.data_talked_making = False
    store.data_talked_mango = False
    store.data_talked_nomad = False
    store.data_talked_sweet = False
    store.data_talked_tea = False
    store.data_talked_tiger = False
    store.data_talked_travel = False
    store.data_talked_world = False
    store.data_talked_zodiac = False
    store.data_wearing_slippers = False

label start:
    jump main

label beach_choice:
    menu:
        "What do you want to do on the beach?"
        "Talk to the dog":
            jump talk_to_k
        "Try to go south":
            jump try_go_sunset
        "Take the shekel":
            jump take_shekel
        "Look at the beach" if not store._seen_oa6oso:
            $ store._seen_oa6oso = True
            "Wide sand, turquoise water. Tel Aviv in gentle chaos behind you."
            jump beach_choice
        "Look at the bicycle" if not store._seen_13pa0ro:
            $ store._seen_13pa0ro = True
            "A BROMPTON. Folds neat as a promise."
            jump beach_choice

label beach_rest_look:
    "The midday sun is relentless. P. sips a slushy acai, waiting for the wind to settle."
    "She's been turning an idea over in her head — what comes next?"
    ""
    "Then she sees him. A dog on a BROMPTON folding bicycle. Shiba face, peacock feathers."
    "She's never seen anything like it. Her tail flicks once. Curious."
    "She decides to say hello."
    $ store.data_has_slushy = False
    $ store.data_slushy_gulps = 3
    $ store.data_can_leave = False
    menu:
        "There's a slushy on the table. What do you do?"
        "Take the slushy":
            $ store.data_has_slushy = True
            "Cold condensation drips down your feathers. You take it."
            jump slushy_choice
        "Leave it":
            "The heat wins. You grab the slushy anyway."
            $ store.data_has_slushy = True
            jump slushy_choice

label beach_scene:
    scene bg beach
    with dissolve
    "Sand, warm under your feet. The sea hisses in."
    "The dog is here, his Brompton folded neatly beside him."
    $ store.data_knows_name = False
    $ store.data_talked_business = False
    $ store.data_talked_artist = False
    $ store.data_has_shekel = False
    $ store.data_can_go_sunset = False
    jump beach_choice

label chapter_1_start:
    "Chapter 1 — Meet Cute"
    "Tel Aviv. A hot beach café. A slushy melting in your hand."
    ""
    jump intro_scene

label chapter_2_start:
    "Chapter 2 — The Sunset Walk"
    "You and K. are leaving the beach, heading south toward Jaffa."
    ""
    $ store.data_knows_name = True
    $ store.data_talked_business = True
    $ store.data_talked_artist = True
    $ store.data_can_go_sunset = True
    $ store.data_has_shekel = True
    jump sunset_scene

label chapter_3_start:
    "Chapter 3 — Jaffa Nights"
    "Your Jaffa apartment. K. is beside you. Tomorrow you leave for Japan."
    ""
    $ store.data_knows_name = True
    $ store.data_talked_business = True
    $ store.data_talked_artist = True
    $ store.data_can_go_sunset = True
    $ store.data_has_shekel = True
    $ store.data_talked_food = True
    $ store.data_talked_mango = True
    $ store.data_talked_drink = True
    $ store.data_talked_tea = True
    $ store.data_talked_sweet = True
    $ store.data_talked_chocolate = True
    $ store.data_talked_travel = True
    $ store.data_talked_nomad = True
    $ store.data_talked_world = True
    $ store.data_talked_japan = True
    $ store.data_talked_china = False
    $ store.data_agreed_to_travel = True
    $ store.data_can_fly = True
    jump jaffa_apt_scene

label chapter_4_start:
    "Chapter 4 — Kyoto Kitchen"
    "Three years later. Kyoto. Lanterns, rain, cedar."
    ""
    $ store.data_knows_name = True
    $ store.data_talked_business = True
    $ store.data_talked_artist = True
    $ store.data_can_go_sunset = True
    $ store.data_has_shekel = True
    $ store.data_talked_food = True
    $ store.data_talked_mango = True
    $ store.data_talked_drink = True
    $ store.data_talked_tea = True
    $ store.data_talked_sweet = True
    $ store.data_talked_chocolate = True
    $ store.data_talked_travel = True
    $ store.data_talked_nomad = True
    $ store.data_talked_world = True
    $ store.data_talked_japan = True
    $ store.data_talked_china = False
    $ store.data_agreed_to_travel = True
    $ store.data_can_fly = True
    $ store.data_slept_with_k = True
    $ store.data_has_kite = True
    jump japan_scene

label chapter_5_start:
    "Chapter 5 — Forever Home"
    "Back in Tel Aviv. The balcony. Two cups of tea."
    ""
    jump home_scene

label chapter_select:
    menu:
        "Which chapter?"
        "Chapter 1 · Meet Cute (Tel Aviv Beach)":
            jump chapter_1_start
        "Chapter 2 · The Sunset Walk":
            jump chapter_2_start
        "Chapter 3 · Jaffa Nights":
            jump chapter_3_start
        "Chapter 4 · Kyoto Kitchen":
            jump chapter_4_start
        "Chapter 5 · Forever Home":
            jump chapter_5_start

label eat_dumplings:
    if store.data_has_chopsticks == false:
        jump take_chopsticks
    if store.data_ate_dumplings:
        jump talk_tiger
    "One dumpling. Hot. Perfect. You close your eyes for a second."
    $ store.data_ate_dumplings = True
    jump kitchen_conversation

label fly_branch:
    if store.data_can_fly == false:
        "K. hasn't shown you how yet."
        jump jaffa_street_scene
    if store.data_agreed_to_travel == false:
        "You haven't chosen where to go yet."
        jump jaffa_street_scene
    jump fly_to_japan

label fly_home:
    "You step onto the balcony. He spreads his tail. You lift off."
    "The world curves beneath you — Kyoto, then cloud, then sea."
    jump home_scene

label fly_to_japan:
    phoenix "Let's FLY. Together."
    "K. spreads his peacock tail. You lift off from the Jaffa rooftop."
    ""
    "Clouds. Ocean. Clouds again. The light shifts from gold to pearl."
    ""
    "Three years pass in a single breath."
    ""
    "You land softly outside your Kyoto apartment."
    jump japan_scene

label give_necklace:
    "K. opens a small wooden box."
    "Inside — a silver double NECKLACE. An infinity ouroboros amulet, joined by a tiny kite charm."
    k "Here. Put it on."
    $ store.data_has_necklace = True
    jump kitchen_conversation

label go_kitchen:
    if store.data_wearing_slippers == false:
        k "Hey! No shoes in the house. You know better."
        jump kyoto_apt_choice
    jump kitchen_scene

label go_to_beach:
    jump beach_scene

label home_scene:
    scene bg home
    with dissolve
    "Home. Tel Aviv light through the window. Two cups of tea."
    "And they lived, and loved, and kept going — forever."
    ""
    "THE END"
    ""
    "For Anastasia. Forever."
    return

label intro_scene:
    "The tales of P."
    "P. — short for Phoenix — is a bird-cat, depending on who you ask."
    "Some days a feathered thing. Some days a purring one. Always curious."
    ""
    "She lives for salty air, warm sand, and small adventures."
    "Today she's at her favorite beach café in Tel Aviv, watching the sea."
    ""
    phoenix "Type LOOK to have a look around."
    menu:
        "What will you do?"
        "Look around":
            jump beach_rest_look
        "Continue":
            jump beach_rest_look

label jaffa_apt_scene:
    scene bg jaffa_apt
    with dissolve
    "Your Jaffa apartment. Souvenirs on every shelf — proof of places you've loved."
    "K. is already half-asleep on the living-room bed, breathing slow."
    $ store.data_slept_with_k = False
    menu:
        "What do you want to do?"
        "Use the bed":
            jump use_bed
        "Go north to Jaffa Street":
            jump jaffa_street_scene

label jaffa_street_scene:
    scene bg jaffa_street
    with dissolve
    "Jaffa Street. Stone walls, bougainvillea, and the smell of fresh bread."
    menu:
        "Where to next?"
        "Look for kite equipment":
            jump kite_branch
        "Fly to Japan":
            jump fly_branch
        "Go south to apartment":
            jump jaffa_apt_scene

label japan_scene:
    scene bg japan
    with dissolve
    "KYOTO. Red lanterns glow along the street. The air smells like rain and cedar."
    "K. is beside you, tail relaxed. Home."
    menu:
        "Where to?"
        "Go north to the apartment":
            jump kyoto_apt_scene
        "Linger a moment longer":
            "You stand still. Watch the lantern light catch the rain."
            jump kyoto_apt_scene

label kitchen_conversation:
    if store.data_has_necklace:
        jump use_necklace
    k "What would you like to know?"
    menu:
        "What do you want to talk about or do?"
        "What're you MAKING?":
            jump talk_making
        "I LOVE you":
            jump talk_love
        "Take fancy chopsticks":
            jump take_chopsticks
        "Eat the dumplings":
            jump eat_dumplings
        "What's the deal with the TIGER sign?":
            jump talk_tiger
        "What is your ZODIAC sign?":
            jump talk_zodiac
        "How will our FUTURE be like?":
            jump talk_future
        "Use the necklace":
            jump use_necklace_branch

label kitchen_scene:
    scene bg kitchen
    with dissolve
    "The KITCHEN. Steam curls from bamboo baskets."
    "K. is making DIM SUM — pleated, plump, glistening."
    $ store.data_has_chopsticks = False
    $ store.data_ate_dumplings = False
    $ store.data_talked_making = False
    $ store.data_talked_love = False
    $ store.data_talked_tiger = False
    $ store.data_talked_zodiac = False
    $ store.data_talked_future = False
    $ store.data_has_necklace = False
    jump kitchen_conversation

label kite_branch:
    if store.data_has_kite:
        jump fly_branch
    if store.data_slept_with_k == false:
        jump use_bed
    "A shop window. Your KITE board, finally."
    ""
    "Use this code in the future for a special discount: PNK-n3zk7MAMBG-GIFT"
    $ run_trigger("pnk_kite")
    $ store.data_has_kite = True
    jump jaffa_street_scene

label kyoto_apt_choice:
    menu:
        "What do you want to do?"
        "Use the slippers Uwabaki":
            jump kyoto_wear_slippers
        "Take Tiger Zodiac Sign":
            jump kyoto_take_tiger
        "Go east to the kitchen":
            jump go_kitchen

label kyoto_apt_scene:
    scene bg kyoto_apt
    with dissolve
    "Your Kyoto apartment. Tatami, soft light, the slide of shoji doors."
    "Something is cooking in the KITCHEN. Warm, savory steam."
    $ store.data_wearing_slippers = False
    $ store.data_has_tiger_sign = False
    jump kyoto_apt_choice

label kyoto_take_tiger:
    if store.data_has_tiger_sign:
        jump go_kitchen
    "A small carved wooden TIGER. Your ZODIAC. You pocket it with a smile."
    $ store.data_has_tiger_sign = True
    jump kyoto_apt_choice

label kyoto_wear_slippers:
    if store.data_wearing_slippers:
        jump kyoto_take_tiger
    "You slip into your uwabaki — soft, clean, house-only SLIPPERS."
    $ store.data_wearing_slippers = True
    jump kyoto_apt_choice

label main:
    scene bg beach_rest
    with dissolve
    "P. & K. — A Love Story in Two Volumes"
    ""
    jump chapter_1_start

label slushy_choice:
    menu:
        "The slushy is in your hand. What now?"
        "Use the slushy":
            jump use_slushy
        "Try to leave":
            jump try_leave

label sunset_conversation:
    if store.data_can_fly:
        k "We've walked and talked. Let's head to JAFFA."
        jump jaffa_apt_scene
    k "What would you like to talk about?"
    menu:
        "Pick a topic to discuss"
        "What's your favorite type of FOOD?":
            jump sunset_food_branch
        "What's your favorite hot beverage to DRINK?":
            jump sunset_drink_branch
        "Do you have a SWEET you can't resist?":
            jump sunset_sweet_branch
        "Do you want to TRAVEL the world?":
            jump sunset_travel_branch
        "What's a digital NOMAD?":
            jump sunset_nomad_branch
        "Do you want to travel with me around the WORLD?":
            jump sunset_world_branch
        "Go to Jaffa":
            jump jaffa_apt_scene

label sunset_drink:
    menu:
        "What's your favorite drink?"
        "TEA":
            phoenix "TEA. With mint and lemon verbena. No sugar."
            k "Same. We should've met sooner."
            $ store.data_talked_tea = True
            $ run_trigger("pnk_drink")
            jump sunset_conversation
        "Back":
            jump sunset_conversation

label sunset_drink_branch:
    if store.data_talked_drink:
        jump sunset_sweet_branch
    k "Coffee, always. And you?"
    $ store.data_talked_drink = True
    jump sunset_drink

label sunset_fly:
    menu:
        "How should we get to Japan?"
        "How can we FLY to Japan?":
            phoenix "A plane? That's the obvious way."
            k "Or — I can take us there myself. I can FLY."
            ""
            "Use FLY in a place to unlock K.'s secret."
            $ store.data_can_fly = True
            jump sunset_conversation
        "Back":
            jump sunset_conversation

label sunset_food:
    menu:
        "What's your favorite food?"
        "MANGO!":
            phoenix "Mango. I'd eat it every day if I could."
            k "Noted. I'll find you the best ones."
            $ store.data_talked_mango = True
            $ run_trigger("pnk_mango")
            jump sunset_conversation
        "Back":
            jump sunset_conversation

label sunset_food_branch:
    if store.data_talked_food:
        jump sunset_drink_branch
    k "Easy. Fruit and vegetables. Nothing beats them. You?"
    $ store.data_talked_food = True
    jump sunset_food

label sunset_nomad_branch:
    if store.data_talked_travel == false:
        jump sunset_travel_branch
    if store.data_talked_nomad:
        jump sunset_world_branch
    k "A nomad works from anywhere. A new view every season."
    $ store.data_talked_nomad = True
    jump sunset_conversation

label sunset_scene:
    scene bg beach_sunset
    with dissolve
    "You walk south. The crowds thin. The sky turns coral."
    "A gull wheels once and is gone. Peaceful."
    ""
    "A good moment to really talk."
    k "I live nearby. In JAFFA. We could go to my place."
    $ store.data_talked_food = False
    $ store.data_talked_mango = False
    $ store.data_talked_drink = False
    $ store.data_talked_tea = False
    $ store.data_talked_sweet = False
    $ store.data_talked_chocolate = False
    $ store.data_talked_travel = False
    $ store.data_talked_nomad = False
    $ store.data_talked_world = False
    $ store.data_talked_china = False
    $ store.data_talked_japan = False
    $ store.data_can_fly = False
    jump sunset_conversation

label sunset_sweet:
    menu:
        "What's your favorite sweet?"
        "CHOCOLATE":
            phoenix "Dark CHOCOLATE. The kind you break with a snap."
            k "The bitter ones. Yes."
            ""
            "TIP: look for a drawer. Its number is four."
            $ store.data_talked_chocolate = True
            $ run_trigger("pnk_chocolate")
            jump sunset_conversation
        "Back":
            jump sunset_conversation

label sunset_sweet_branch:
    if store.data_talked_sweet:
        jump sunset_travel_branch
    k "Ice cream. I'd eat it in winter. What about you?"
    $ store.data_talked_sweet = True
    jump sunset_sweet

label sunset_travel_branch:
    if store.data_talked_travel:
        jump sunset_nomad_branch
    k "I love to travel. I've been everywhere I could."
    k "My dream is to live as a digital nomad."
    $ store.data_talked_travel = True
    jump sunset_conversation

label sunset_world:
    menu:
        "Where should we travel?"
        "JAPAN":
            phoenix "JAPAN. The food, the quiet streets, the lanterns."
            phoenix "My ancestors are from there. It's been calling me."
            $ store.data_talked_japan = True
            $ store.data_agreed_to_travel = True
            jump sunset_fly
        "GERMANY" if not store._seen_am2y6r:
            $ store._seen_am2y6r = True
            k "Berlin? Ich bin ein Berliner."
            phoenix "Hmm. On second thought — not Germany."
            jump sunset_world
        "CHINA":
            phoenix "Too big. I want somewhere we can actually live."
            $ store.data_talked_china = True
            jump sunset_world_china
        "INDIA" if not store._seen_15k8if:
            $ store._seen_15k8if = True
            k "The food is incredible. The rest — maybe another life."
            jump sunset_world
        "FRANCE" if not store._seen_yfftwb:
            $ store._seen_yfftwb = True
            phoenix "Pass. You know why."
            jump sunset_world
        "ITALY" if not store._seen_15o0ar:
            $ store._seen_15o0ar = True
            k "I love Italy. But not to live in. Not yet."
            jump sunset_world
        "USA" if not store._seen_1t2b:
            $ store._seen_1t2b = True
            phoenix "USA? Maybe. But not right now."
            jump sunset_world
        "Back":
            jump sunset_conversation

label sunset_world_branch:
    if store.data_talked_nomad == false:
        jump sunset_nomad_branch
    if store.data_talked_world:
        jump sunset_conversation
    k "I'd love that. Where should we go first?"
    $ store.data_talked_world = True
    jump sunset_world

label sunset_world_china:
    menu:
        "Where in China?"
        "HONG KONG":
            phoenix "Beautiful. But not for us, not now."
            jump sunset_world
        "Back":
            jump sunset_world

label take_chopsticks:
    if store.data_has_chopsticks:
        jump eat_dumplings
    "A pair of fancy lacquered chopsticks. You pick them up."
    $ store.data_has_chopsticks = True
    jump kitchen_conversation

label take_shekel:
    if store.data_has_shekel == false:
        $ store.data_has_shekel = True
        "A tiny shiny coin in the sand. You pick it up."
        ""
        "Pocketed. For luck."
    jump beach_choice

label talk_future:
    if store.data_talked_zodiac == false:
        jump talk_zodiac
    if store.data_talked_future:
        jump give_necklace
    k "Our FUTURE? Only stronger. Year after year."
    k "We'll challenge each other. Make each other better."
    k "You protect me. I protect you."
    k "Stronger together. One. To eternity."
    k "I have something for you. My zodiac — the SNAKE. To watch over you."
    $ store.data_talked_future = True
    jump give_necklace

label talk_love:
    if store.data_talked_love:
        jump take_chopsticks
    k "I LOVE you too. Always."
    $ store.data_talked_love = True
    $ run_trigger("pnk_love")
    jump kitchen_conversation

label talk_making:
    if store.data_talked_making:
        jump talk_love
    k "DIM SUM. Your favorite. Almost ready."
    $ store.data_talked_making = True
    jump kitchen_conversation

label talk_tiger:
    if store.data_ate_dumplings == false:
        jump eat_dumplings
    if store.data_talked_tiger:
        jump talk_zodiac
    k "The TIGER. That's your ZODIAC. Fierce when it matters."
    $ store.data_talked_tiger = True
    jump kitchen_conversation

label talk_to_k:
    k "Hey. You looked like you had a question."
    menu:
        "What will you ask the dog?"
        "What's your NAME?":
            k "Ehecatl. Aztec wind god — but everyone just calls me K."
            $ store.data_knows_name = True
            jump talk_to_k_named
        "Your BICYCLE is cool, what is it?" if not store._seen_1etb0yd:
            $ store._seen_1etb0yd = True
            k "A BROMPTON. I can fold it up and take it anywhere."
            jump talk_to_k
        "Back":
            jump beach_choice

label talk_to_k_business:
    if store.data_talked_business == false:
        jump talk_to_k_named
    menu:
        "What's your business idea?"
        "I'm an ARTIST, I thought to start a dog portrait business":
            k "A dog portrait painter? I love that."
            k "I know people in the dog world. I've run a shop before."
            k "Let me help you."
            $ store.data_talked_artist = True
            jump talk_to_k_continue
        "Back":
            jump beach_choice

label talk_to_k_continue:
    if store.data_talked_artist == false:
        jump talk_to_k_business
    menu:
        "The sun is setting. What now?"
        "The sun is going down. Want to CONTINUE to the sunset?":
            k "I've never met anyone like you. Yes."
            k "Let's walk south, along the SUNSET, toward JAFFA."
            $ store.data_can_go_sunset = True
            jump sunset_scene
        "Back":
            jump beach_choice

label talk_to_k_named:
    if store.data_knows_name == false:
        jump talk_to_k
    menu:
        "Now that you know his name, what next?"
        "I've a BUSINESS question, do you mind?":
            k "Not at all. Ask away."
            $ store.data_talked_business = True
            jump talk_to_k_business
        "Back":
            jump beach_choice

label talk_zodiac:
    if store.data_talked_tiger == false:
        jump talk_tiger
    if store.data_talked_zodiac:
        jump talk_future
    k "Me? I'm SNAKE. Quiet. Watchful. Patient."
    $ store.data_talked_zodiac = True
    jump kitchen_conversation

label try_go_sunset:
    if store.data_can_go_sunset:
        jump sunset_scene
    "Not yet. There's still something here."
    jump beach_choice

label try_leave:
    if store.data_can_leave:
        jump go_to_beach
    "The air outside shimmers. Not yet."
    "Maybe something COLD would help."
    jump slushy_choice

label use_bed:
    if store.data_slept_with_k:
        jump jaffa_street_scene
    "You curl up next to him. He pulls you in without opening his eyes."
    "You fall asleep to the soft hum of Jaffa at night."
    ""
    "Morning. Market noise. K. is still snoring — a warm, happy rumble."
    $ store.data_slept_with_k = True
    jump jaffa_street_scene

label use_necklace:
    "The silver rests cool on your chest. A perfect weight."
    k "It's time. Let's FLY home. To TLV."
    k "Together."
    $ run_trigger("pnk_fly")
    jump fly_home

label use_necklace_branch:
    if store.data_has_necklace == false:
        "K. hasn't given you the NECKLACE yet."
        jump kitchen_conversation
    jump use_necklace

label use_slushy:
    if store.data_slushy_gulps == 3:
        "A long, icy pull. The world slows. You can breathe again."
        $ store.data_can_leave = True
    "gulp"
    $ store.data_slushy_gulps = "(- $data.slushy_gulps 1)"
    if store.data_slushy_gulps > 0:
        "A little slushy left, clinging to the cup."
        jump slushy_choice
    "The last drop. Purple-pink on your beak."
    "You set the empty cup down."
    jump go_to_beach
