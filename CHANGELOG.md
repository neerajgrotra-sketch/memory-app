# Changelog

Every change to glance gets a new version number, shown at the bottom of the home screen.

Numbers follow `MAJOR.MINOR.PATCH`:

- **Major**: a big change to how the game works.
- **Minor**: a new feature.
- **Patch**: a fix or small tweak.

To release a change, bump `version` in both `app.json` and `package.json`, then add an entry at the top of this file.

## 4.0.0-beta.46 (2026-10-17)

- **A new place: On the Moon** (space), unlocked at **Level 28** (and in Practice). The last of the planned places: every level from 2 to 28 now brings something new.
  - **Bands:** "Out in space" (the black starry sky), low grey hills, then "Near the hills" and "Close by" on the dusty ground.
  - **15 things:** the Earth, satellites, a rocket, a space station and a comet out in space; a lunar lander, a habitat pod, solar panels, a radio dish and a flag near the hills; astronauts, a moon buggy, boulders, a little explorer robot and craters close by.
  - **New questions from the base sign:** "What was the mission called on the sign?" and "What number was the moon base on the sign?", plus the astronauts' backpacks, the rocket's fins, the flag, the moon buggy's seat and the stripe on the habitat pod.
  - **Why the Moon:** floating in space has no ground, so no true sizes and no "where" questions. On the Moon's surface astronauts (1.85 m), a moon buggy (3 m) and a lander (3.5 m) are true to size, and the far-off Earth, rocket and satellites are small in the sky, as they really look.
  - **Contrast:** white spacesuits on grey dust are checked by their dark outline, like the snowman; the flag is held out by a bar because there's no wind on the Moon.
  - **Usually there:** astronauts, in nearly every picture.
  - Two looks: grey dust and warmer, browner dust.
- Scene checker: 61,800 pictures.
- **Fix: "What was above the crater? A satellite."** A new band option, `faraway`, marks things a long way off (space from the Moon; the sky and airfield through the airport window), so they're never "above" or "below" anything. Before, only one-off sky things like the sun were left out.

## 4.0.0-beta.45 (2026-10-17)

- **A new place: At the airport**, unlocked at **Level 26** (and in Practice).
  - **A departure lounge with a big window onto the airfield:** the sky and the airfield through the glass, the flight screen, then the lounge.
  - **15 things:** planes, a helicopter and birds in the sky; a parked plane, a fuel truck, a baggage train and the control tower out on the airfield; travellers, pilots, flight attendants with their cases, luggage trolleys, a row of seats, a coffee kiosk, an information desk and potted plants in the lounge.
  - **New questions from the flight screen:** "What was the flight number?" (like GL 427), "Which gate was the flight leaving from?" (like B12), "Where was the flight on the screen going?", plus the stripe on the parked plane, the flight attendants' uniforms, the suitcases, the seats and the kiosk's awning.
  - **Scale:** inside is true to the person; out of the window everything is far away and drawn small, as it really looks. That's how a 40 m plane and a person share one picture without either being the wrong size.
  - Two looks: a blue day sky and an orange evening one.
- Scene checker: 59,400 pictures.

## 4.0.0-beta.44 (2026-10-17)

- **A new place: At the campsite at night**, unlocked at **Level 24** (and in Practice). The first night scene.
  - **Bands:** a starry sky, a dark line of pine trees, "On the pitches", then "At the front" round the campfire. (Bands are never named after a thing in them, which would ask "Where was the campfire? Around the campfire".)
  - **16 things:** the moon, barn owls, a shooting star and a plane in the sky; tents, a campervan, a canoe, lantern posts and a picnic table on the pitches; the campfire, people, a dog, a fox, log seats, sleeping bags and a pile of firewood at the front.
  - **New questions:** "What shape was the moon?" (full, half or crescent, changing per picture), "What number was on the pitch sign?", plus tent, jumper, sleeping bag, canoe and campervan colours.
  - **Night and contrast:** dark things vanish at night, so the sky only has pale things (an owl, not bats), the camping gear comes in bright colours, and the log seat and firewood are lit by the fire. The sky lightens towards the horizon and the fire's warm glow fades out across the grass.
  - **Usually there:** the campfire is in every picture, and tents in most (the `usual` option).
  - Two looks: a clear navy night and a moonlit violet one.
- Scene checker: 57,000 pictures. `check:questions` now also fails if a band is named after a thing that can stand in it.

## 4.0.0-beta.43 (2026-10-17)

- **A new place: In the classroom**, unlocked at **Level 22** (and in Practice). The first new place past Level 20.
  - **Seen from the back of the room:** the wall with the whiteboard, the front of the class, then the pupils at their desks.
  - **16 things:** a clock, a space poster, a world map, a noticeboard and a window with curtains on the wall; the teacher, the teacher's desk, a globe, a bookcase and a piano at the front; pupils at their desks, beanbags, a fish tank, a computer, an easel and potted plants at the back.
  - **New questions:** "What day was written on the board?", "What sum was on the board?" (wrong answers change one number, or swap plus for minus), "What time was on the clock?", plus the teacher's jumper, the pupils' jumpers, the curtains, the poster, the flower in the painting and the piano.
  - **Scale:** a closer view than the outdoor places (about 4.5 m across), so a school clock, a globe and a pupil at a junior-school desk (0.68 m) are big enough to see without being blown up. The pupils are drawn in the same style as the teacher, so they don't look like toys beside them.
  - **Realistic layout:** the teacher and the bookcase stand against the wall, so the posters, map, noticeboard, window and clock hang above head height, as in a real classroom.
  - Two looks: a wooden floor with a cream wall, and a blue carpet with a mint wall.
- **Pictures:** most classrooms have pupils, thanks to a new `usual` option ("picked first for its band"). The front always gets the teacher or the bookcase.
- Scene checker: 54,600 pictures.
- **Fix: "The curtains was yellow."** True-or-false sentences now take "was" or "were" from the thing's own wording, which also fixes "The stripes on the tea towel was…" (kitchen) and "The balloon seller's balloons was…" (zoo).

## 4.0.0-beta.42 (2026-10-17)

- **Tester mode: Unlimited Peeks is now truly unlimited.** Peek on any question, as often as you like (the button shows **Peek · ∞**). Before, it only kept the count full, and the one-peek-a-round rule still showed "Peek used". Every right answer after a peek still earns half points, and they can't carry a round up a level.
- **Fix: the quit and sound buttons could cover "Question 2 of 5".** On short screens (like the beta inside the Claude app) the questions scroll, and they scrolled underneath the buttons. They now scroll below them.

## 4.0.0-beta.41 (2026-10-17)

- **Tester mode: Unlimited Peeks.** A new switch under Tester mode in Profile (tap the version 7 times to show it). The Peek button never runs out, so Peeks can be tried without earning them first. Everything else stays real: one peek a round, half points for the peeked answer, no level up from it. Tester peeks aren't saved against your earned Peeks, and the game page shows "Unlimited Peeks (tester mode)". Leaving tester mode switches it off.

## 4.0.0-beta.40 (2026-10-17)

- **New: Peeks.** A second look at the picture while answering.
  - **Earn them with points:** one every 3,000 points from any round (about every 6 good rounds at Level 1, every 2 at Level 30). Hold up to 3. Players who have already played start with the Peeks their past points earned.
  - **Use one:** tap **👀 Peek** on a question. The picture flips in over the question for 3 seconds with a countdown, then flips away (a fade with "reduce motion" on). One per round, never in the Daily Challenge.
  - **Fair play:** a right answer after a peek earns half its points ("👀 Peek −95") and can't carry a round up a level. The result screen marks the question "👀 Peeked" and celebrates "You earned a Peek!".
  - The game page shows how many you hold and how far off the next is.
  - Never bought, and never takes away points you've scored. Worked out from saved rounds, so "Delete all progress" clears them too.
  - New `npm run check:peeks`.

## 4.0.0-beta.39 (2026-10-17)

- **Snowy mountain: a danger sign instead of the ski run sign.** Testers found the coloured dot next to a name ("Deer") confusing. The sign on the fence is now a yellow danger sign with a warning triangle, "DANGER" and an animal: deer, bear, wolf, moose or fox. New question: "Which animal was the danger sign about?" The run colour and run name questions are gone.
- **Fix: the ski racer's bib number showed mirrored** when the racer faced left. Racers now always face the same way, so the number reads correctly. They were the only flippable thing with writing on them.

## 4.0.0-beta.38 (2026-10-17)

- **A new place: On the snowy mountain**, unlocked at **Level 20** (and in Practice).
  - **Bands:** the sky with cable cars, snowy peaks, the ski slope, and the snow by the lodge below a fence.
  - **16 things:** cable cars, the sun, birds and a plane; skiers, snowboarders, a ski racer, slalom flags and pine trees on the slope; people in winter coats, dogs, snowmen, sledges, a ski rack, a hot chocolate stand and a snowmobile by the lodge.
  - **New questions:** "What colour was the ski run sign?" (green, blue, red or black, the real difficulty colours), "What was the ski run called?", "What number was on the ski racer's bib?", plus jacket, scarf, cabin and roof colours.
  - **Snow and contrast:** coats never come in white or yellow (they vanish on snow). The white snowman is checked, and outlined, by its grey frame, so it always shows.
  - Two looks: sunny and dusk.
- Scene checker: 52,200 pictures.
- Things whose asked-about colour sits on their own frame now take their outline from the frame (a signal's housing, a snowman's outline), not from that colour.

## 4.0.0-beta.37 (2026-10-17)

- **Fix: no more silly wrong answers.** When a band had too few believable things, "What was in the sky…?" topped up its options from any band ("Zookeepers" in the sky), and "Where was…?" could offer "In the sky" for a dog. Now every wrong option is something that could really be there. When there aren't three believable ones, the question has three options instead of four, and with fewer it isn't asked.
  - An audit of 3,000 pictures across all 10 places found 22,766 such options before (about 7 per picture) and none after. Pictures still give about 33 questions each.
  - "What was above / below…?" only offers things not in the picture if they could be where the answer was.
  - New `npm run check:questions` runs that audit, so a new place can't bring silly options back.

## 4.0.0-beta.36 (2026-10-17)

- **A new place: At the zoo**, unlocked at **Level 18** (and in Practice).
  - **Three enclosures, one kind of animal each**, like a real zoo, with walls between them and the visitors' path in front.
  - **Habitats:** each enclosure is grass or sand, chosen per picture. Each animal goes where it stands out: giraffes, elephants, zebras and lions on grass; rhinos, ostriches, kangaroos and bears on sand.
  - **18 things:** a giraffe, elephant, zebra, lion, rhino, ostriches, kangaroos and a bear; visitors, zookeepers, benches, pushchairs, a balloon seller and a signpost; the sun, birds, balloons and a plane.
  - **New questions:** "What was in the enclosure on the left?", "What time was feeding time?" and "Which animals were being fed?" from the feeding-time sign, plus the balloon seller's balloons.
  - **Scale:** penguins, monkeys and parrots are left out (too small to draw at 44 pt next to people). The elephant, rhino and giraffe are young ones, so they fit their enclosures on every phone.
  - Two looks: sunny and evening.
- Scene checker: 49,800 pictures.

## 4.0.0-beta.35 (2026-10-17)

- **A new place: At the train station**, unlocked at **Level 16** (and in Practice).
  - **Bands:** hanging from the glass roof, the track (with a brick wall behind), and the platform.
  - **14 things:** a station clock, hanging lamps and flower baskets; a train, a freight wagon and a railway signal; passengers, dogs, benches, vending and ticket machines, luggage trolleys, a coffee cart and a newspaper stand.
  - **The departure board: three details on one sign.** "What time was the next train?" (digital, any minute on Hard), "Which platform was the next train leaving from?" and "Where was the next train going?". Plus the station clock's own time when it's there: two different times to keep apart.
  - **Real-world colours:** the signal light is only ever red, yellow or green.
  - Two looks: day and evening.
- **New habit, `framedColour`:** a colour shown on the thing's own dark frame (the signal light in its housing) is checked by its frame against the backdrop. Without it, red and green signals blended into the brick and every signal was yellow.
- Scene checker: 47,400 pictures.

## 4.0.0-beta.34 (2026-10-17)

- **Second visual pass: light and depth.**
  - **Every thing is lit from the top left:** a soft highlight at the top and gentle shade at the bottom, kept inside each thing's own shape. All the drawings (balloons, kites, boxes, animals, vehicles, furniture) look rounded instead of flat, without redrawing any of them.
  - **Every place has its own light:** haze near the horizon (beach, city, farm, park), the sea and the pond deeper far out and lighter in the shallows, sun on the house fronts, light on the living-room and kitchen walls, shade at the back of each supermarket shelf, under the kitchen worktop, and where floors meet walls.
  - **Colours stay fair:** the contrast rules now use each backdrop's colour as lit, so lighting can never make something blend in. Tuning found two things that would have (a white plane in the park's hazier sky, the vegetable basket by shaded kitchen cupboards); both were fixed.
- The gallery gives each picture its own ids, so pictures on one page can't borrow each other's masks.

## 4.0.0-beta.33 (2026-10-17)

- **Visual pass on every place:**
  - **Soft shadows** under everything standing on the ground, a floor or a shelf, so nothing looks pasted on.
  - **Gentle movement while you memorise:** things in the sky or underwater bob a few points, the park's boat and swans rock on the water, and clouds drift. It's small enough that where things are is never in doubt, and each thing moves at its own moment. Thumbnails and the full-size picture stay still.
  - **People look different from each other:** four skin tones, four hair colours and three hairstyles (short, long, a bun), fixed for each person. Shirt colours, which questions ask about, are unchanged.
- **Fix (accessibility):** with the phone's **Reduce Motion** setting on, the picture was skipped entirely and the round went straight to the questions, because the countdown ran as an animation and finished at once. The countdown now always runs at real speed, and with Reduce Motion on the picture is shown still.
- Scripts that draw pictures in Node (gallery, lineup, scene checker, recipe reference) use a small stand-in for the animation library.

## 4.0.0-beta.32 (2026-10-17)

- **Daily challenge and streak**, on a card at the top of the Games tab (once you've played a round):
  - **🔥 Streak:** days in a row you've played at least one round, in any mode. It stays alive until midnight ("Play today to keep your 3-day streak"). Your best streak is kept.
  - **This week:** Monday to Sunday, with a tick on each day you played and today outlined.
  - **Today's challenge:** one special picture a day, the same all day, at your level, from every place you've reached. **Double points, one try.** Afterwards the card shows "Done ✓" with your score until tomorrow. It never changes your level or high score.
  - The result screen celebrates the first round of each day ("🔥 3-day streak!") and shows a "Daily ×2" points chip for the challenge.
- **Progress tab:** "Day streak" now shows 🔥, and there's a new "Best streak" tile.
- **New check:** `npm run check:daily` tests the streak rules (midnight, daylight saving, the week strip) in two time zones; it's part of the project, not a one-off script.
- Reminders aren't included yet: they need notifications in a real phone build.

## 4.0.0-beta.31 (2026-10-16)

- **A new place: In the kitchen**, unlocked at **Level 8** (and in Practice).
  - **Bands:** an open shelf, the tiled wall, the worktop, and the floor in front of the cupboards.
  - **25 things:** plates, cookbooks, pasta jars, a teapot, a cookie jar and herb pots on the shelf; frying pans, oven gloves, a tea towel, a utensil rail and a window on the wall; a microwave, kettle, toaster, fruit bowl, chopping board, saucepans, coffee machine and food mixer on the worktop; a bin, mop and bucket, step stool, recycling box, basket of vegetables and pet bowls on the floor.
  - **A close-up, at one scale:** objects only (no people or pets), everything sized so 1 m ≈ half the screen width. Mugs, spoons and spice jars are left out because they'd have to be drawn too big.
  - **New questions:** "What time was on the microwave?", the game's first **digital clock** (any minute on Hard, with digit-slip wrong answers like 7:45 vs 7:54), and "What was in the fruit bowl?" (apples, oranges, bananas or lemons). Plus lid, stripe, pot and bucket colours, and on Hard a rack of plates in mixed colours.
  - Two looks: modern and farmhouse.
- Scene checker: 44,400 pictures.

## 4.0.0-beta.30 (2026-10-16)

- **A new place: In the park**, unlocked at **Level 4** (and in Practice).
  - **Bands:** the sky, a pond with trees on the far bank, a gravel path, and the grass.
  - **19 things:** sun, birds, kites, hot-air balloons and a plane; a rowing boat, swans and a fountain on the pond; bicycles with riders and an ice-cream cart on the path; benches, picnic blankets, flower beds, swings, a slide, the park clock and trees on the grass; people and dogs.
  - **At one real-world scale:** everything is sized against a person (a bench 1.8 m, the boat 3 m, the clock 3.5 m tall). Ducks, balls and butterflies are left out: at the 44 pt minimum they'd look giant next to people.
  - **New questions:** "What time was on the park clock?" (every level) and "What number was on the rowing boat?" (from Level 8), plus bicycle, umbrella, flower and slide colours.
  - Two looks: summer and spring.
- **The living room now unlocks at Level 2** (was 3), so new players get variety sooner.
- **The city's street clock shows a real time** too, asked on every level whenever it's in the picture.
- **"The sun"**, never "A sun", in answers; and the sun and planes are never used in "What was above / below…?" (they're far away, not above anything).
- `npm run lineup` makes room for tall things (trees, clocks on posts).
- Scene checker: 39,000 pictures.

## 4.0.0-beta.29 (2026-10-16)

- **Supermarket: everything at one real-world scale.** Testers said the shoppers looked like toys. The cause: the shelves are a close-up (every product at least 44 pt wide, so a 30 cm cereal box is 0.16 of the screen tall), but the floor was drawn at a far smaller scale, so a person was barely taller than a cereal box and a trolley shorter than one.
  - **Shoppers and trolleys are gone** from the supermarket: at the shelves' scale a person would be taller than the whole floor and cover the shelves.
  - **Everything on the floor is now drawn at the products' scale:** baskets (about 45 cm), crates of apples and oranges (50 cm, one each), watermelons, cardboard boxes, the wet floor sign (60 cm tall).
  - **Two new floor things:** paper shopping bags and sacks of potatoes.
  - Eggs and bread are a little wider, to match a cereal box.

## 4.0.0-beta.28 (2026-10-16)

- **Tester mode,** for testing every place at any level again: in Profile, tap the version number 7 times. Every place is then unlocked in My places, so you can play just one place (a brand-new one, say) whatever your level. A "Tester mode" section appears in Profile to turn it off (which switches every place back on), and the game page shows a red reminder while it's on. Players never see it unless they tap the version 7 times.

## 4.0.0-beta.27 (2026-10-16)

- **My places**, a proper feature replacing the temporary testing switch. On the Look & Remember page, pick the places you want to train on: only the beach, say, or just the city and the supermarket.
  - Places your level hasn't reached show a lock and the level they unlock at, a preview of what's coming. They join automatically when you unlock them.
  - At least one place stays on. "Play all places" switches everything back on.
  - Works in levelled play and Practice. The Games tab shows a quiet "My places: …  Change" line while some are off (the red testing banner is gone).
- Profile no longer has the "Testing (temporary)" section. An existing testing selection carries over into My places.

## 4.0.0-beta.26 (2026-10-16)

- **A new place: In the supermarket**, unlocked at **Level 14** (and in Practice).
  - **Bands:** signs hanging from the ceiling, the top, middle and bottom shelves, and the floor.
  - **17 things:** cereal boxes, toilet rolls, bottles of water, tins, jars of honey, bottles of juice, milk, eggs and bread on the shelves; trolleys, baskets, shoppers, crates of apples and oranges, watermelons, a wet floor sign and cardboard boxes on the floor.
  - **Like a real aisle:** each section of a shelf (left, middle, right) holds one kind of product, standing in a neat row on the shelf. "Where were the tins?" → "On the middle shelf, on the right".
  - **New questions:** "What was the aisle number?" and "What was on special offer?" (apples, bananas, bread, milk or cheese, shown on the red sign), plus the lid colour on the honey jars, and on Hard a row of juice bottles in different flavours.
  - Two looks: a bright modern shop and a cosy corner shop.
- **New placement habit, `lineUp`:** copies stand side by side in one row, a little apart so they're easy to count. Ready for a kitchen, a toy shop or a classroom.
- Sign and house-number text now uses a sans-serif font everywhere (it showed as serif on the web).
- Scene checker: 32,400 pictures. [Supermarket docs](docs/recipes/supermarket.md); the recipe reference (now listing each place's real detail questions) and question examples are regenerated.

## 4.0.0-beta.25 (2026-10-16)

- **Start again from Level 1,** on the game page under Play. It asks first, then puts you back at Level 1 while **keeping** your high score, best level and round history (charts and "Your levels" too). It only shows once you're past Level 1 or partway through it.
- **Delete all progress** (formerly "Reset progress", bottom of the Progress tab) is the clean-slate option: it deletes every round, level and score, and says so when it asks you to tap again.
- You still carry on from where you left off by default: your level is saved after every round.

## 4.0.0-beta.24 (2026-10-16)

- **New kinds of question,** so rounds stop being "how many / what colour / where" every time:
  - **Compare:** "Were there more kites or more birds?" (or the same number)
  - **The most / just one:** "Which was there the most of?", "Which was there just one of?"
  - **Above and below:** "What was above the buoys?"
  - **Colour twins:** "What else was the same colour as the kites?"
  - **True or false:** "There were three kites." Two big buttons, for a quick change of pace.
- **The variety rule:** every round mixes at least three kinds of question: at most one "where", one "what colour", one "how many", and so on, and at most two of any one type.
- **The living-room clock shows a real time,** and the game asks "What time was on the clock?" on every level whenever the clock is in the picture:
  - whole hours up to Level 7, half past from Level 8, quarter past and quarter to from Level 18
  - wrong answers tempt anyone who only half looked: the hands mirrored (3:00 → 9:00), swapped (3:00 → 12:15), or an hour off
  - a clearer, bigger face (bold ticks at 12, 3, 6 and 9; a short thick hour hand and a long thin minute hand), never drawn mirrored.
- Seaweed is now "seaweed plants", so "There were three seaweed plants" reads right.
- Dropped after review: "Which way was the boat sailing?" and "What time of day was it?" (too hard to judge), and "How many green things?" (the grass and trees are green too, so the answer could be argued).
- Docs: [Questions](docs/questions.md) covers the new kinds, the clock and the variety rule; the question examples are regenerated.

## 4.0.0-beta.23 (2026-10-16)

- **One-tap mute:** a speaker button on the Games tab (top right), in the bar above the picture (next to the countdown), and next to ✕ during the questions. It shows a speaker when sound is on and a crossed-out speaker when it's off, takes effect at once (even mid-countdown), and is the same setting as Profile → Sounds, so it's remembered.

## 4.0.0-beta.22 (2026-10-16)

- **iPhone web: every sound plays again, not just the countdown.** Sounds started by a tap (Play, answers, the result after your last answer) were being cut off instantly: switching a player on (a silent start and stop) finished just after the real sound began and stopped it. Now:
  - a real sound is never stopped by that "switch on" step (each play gets a ticket, and the stop only applies if nothing has played since)
  - a pool of 4 players, switched on by your first tap with a moment of silence, plays every sound (iPhone grants permission per player).
- Checked as an iPhone in the browser: start, 10 ticks, 5 answers and the round result all played, none cut off.

## 4.0.0-beta.21 (2026-10-16)

- **Sound on iPhone and iPad (web), properly this time.** On iOS the web version now plays every sound through ordinary audio elements, the method that worked on iPhone in 4.0.0-beta.10, instead of Web Audio (which iOS mutes in many situations, and which 4.0.0-beta.17 didn't fix on a real iPhone). Each sound is preloaded and unlocked by your first tap. Every tap also checks sound is still on, in case iOS paused it (after the screen locks, say). Desktop and Android keep Web Audio.
  - On iPhone the volume of each sound can't be set from a web page, so web sounds there play at full volume.

## 4.0.0-beta.20 (2026-10-16)

- **A new place: Under the sea**, unlocked at **Level 12** (and in Practice).
  - **Bands:** near the surface, the open water, and the seabed, under a wavy surface with sunlight rays.
  - **15 things:** a whale, dolphins, sea turtles and jellyfish near the surface; fish, clownfish, a shark, divers and a submarine in the open water; an octopus, crabs, starfish, seashells, coral and tall seaweed on the seabed.
  - **Real-world habits:** whales and dolphins stay near the surface; one shark, one whale and one submarine at most; seaweed grows from the sand up into the water; divers are bigger than the fish.
  - **New questions:** "What was in the treasure chest?" (gold coins, pearls, red jewels, or nothing because it was closed; chosen per picture, with the chest in a corner nobody covers), the diver's wetsuit colour, and on Hard a school of fish in different colours.
  - Two colour schemes: tropical and deep blue.
- The dolphin, crab and starfish are now shared things (beach and sea).
- Scene checker: 28,800 pictures.

## 4.0.0-beta.19 (2026-10-16)

- **Farm drawings:**
  - The **wheelbarrow** is redrawn the way one really stands: wheel at the front, a deep tray over it, two handles sloping back to a grip, and legs under the back on the ground. Same size: about as long as the farmer is tall.
  - The **goat's** head now joins its neck.
- **`npm run lineup`** draws a recipe's things side by side at their real sizes, to check sizes and shapes before reviewing whole pictures (added to the recipe checklist).

## 4.0.0-beta.18 (2026-10-16)

- **A new place: On the farm**, unlocked at **Level 10** (and in Practice Easy, Medium and Hard).
  - **Bands:** sky, the barn and hills behind, a field with crop rows (the tractor drives one way; at most 2 kinds of thing), a fence, and the farmyard.
  - **17 things:** sun, crows, hot-air balloons; a tractor, scarecrows, pumpkins, hay bales and grazing sheep in the field; cows, horses, pigs, sheep, goats, chickens, a dog, the farmer (straw hat), a wheelbarrow and milk churns in the farmyard.
  - **Real-world habits:** one tractor at most, facing the way it drives; cows, horses, hay bales and scarecrows spread out; milk churns at the front; chickens and sheep can bunch together.
  - **New questions:** "What colour was the barn?" (the barn's colour and side change every picture; asked from Level 8 settings, like house numbers), and on Hard a flock can include a **black sheep** ("What colours were the sheep?").
  - Two colour schemes: summer and harvest. The farmyard is grass so golden hay, pink pigs and silver churns all stand out.
- **Built for many more places:**
  - Any recipe can now declare **facts** about its backdrop (like the barn's colour) and they're asked automatically; no question code per place.
  - The sun is now a shared thing, like birds, people and the dog.
  - `ONLY=<recipe> npm run check:scenes` checks one place while it's being built.
  - New [recipe questionnaire](docs/recipe-questionnaire.md), and [farm docs](docs/recipes/farm.md).
- The scene checker now also plays Level 10, and covers 24,600 pictures.

## 4.0.0-beta.17 (2026-10-16)

- **Sound on iPhone web again.** Since 4.0.0-beta.11 the web version used Web Audio, which iPhones mute when the ring/silent switch is on silent. The page now asks for the "playback" audio session (iOS 17 and later), so web sounds play as they did before, and falls back to ordinary audio elements wherever Web Audio can't start. More kinds of first touch now switch sound on. (The phone app in Expo Go still follows the silent switch, on purpose.)

## 4.0.0-beta.16 (2026-10-16)

- **Time to read the launch screen.** "glance / Look closer. Remember more." now stays up for about 1.6 seconds after it appears on the first launch (before the welcome), and about 0.8 seconds on later launches. The eye's blink moved into that pause. A tap still skips it.

## 4.0.0-beta.15 (2026-10-16)

- **Welcome screen on the first launch.** After the eye animation, three postcards of the places (living room, beach, city street, drawn by the game) fan out, then the **glance** logo, the hook **"How much can you remember at a glance?"**, the line "Quick picture games for your memory. A few minutes a day.", a **Let's go** button and "Free to play · No account needed".
  - It shows only until **Let's go** is tapped once; later launches go from the eye animation straight into the app.
  - The hook is set in a classic serif, the one place glance uses one.

## 4.0.0-beta.14 (2026-10-16)

- **Every countdown tick is identical:** the same sound at the same volume for every number, from the first down to 1. No vibration on the ticks.

## 4.0.0-beta.13 (2026-10-16)

- **One countdown sound:** every tick from the first number down to 1 is now the same tick, quiet until the last 4 and clearly louder for 4, 3, 2, 1. (The early ticks were a different click before, which didn't match.)

## 4.0.0-beta.12 (2026-10-16)

- **A "start" sound on every button that begins a round:** Play on the Games tab and game page, Practice, Try again / Keep going / Play Level N, Same picture again, and Play on the level-up screen (with a light tap on phones).
- **Ticks for the whole countdown:** a soft clock tick as each number appears, then clearly louder ticks for 4, 3, 2, 1. The soft ticks don't vibrate.

## 4.0.0-beta.11 (2026-10-16)

- **Countdown ticks on 4, 3, 2, 1**, exactly as each number appears. They're now driven by the countdown itself, so they can't drift from it.
- **A sound for how the round went**, one at a time:
  - **Applause** for a perfect round (5 right), and as the new level lands on the level-up screen.
  - A bright chime for 4 right, the high-score sparkle for a new high score.
  - A gentle "aww" for 0 or 1 right.
  - Nothing for 2 or 3 right: an ordinary round shouldn't sound like a failure.
- **Web sound is more reliable:** the web version now uses Web Audio with every sound decoded in advance, so sounds start instantly, and it works on iPhone Safari after the first tap.
- The applause and "aww" are generated by `scripts/sounds/make-round-sounds.py` (no free applause could be downloaded). Like every sound, they're one file each in `assets/sounds/` and can be replaced.

## 4.0.0-beta.10 (2026-10-16)

- **Sounds** for the game's moments: a soft chime for a right answer, a gentle low sound for a wrong one, quiet ticks in the last 3 seconds of looking, a flourish as the level-up ring spins, and a sparkle for a new high score. No sounds on ordinary taps and no music.
  - A phone on silent stays silent.
  - The sounds are free ones from uisfx (MIT licence). Each is one file in `assets/sounds/`, so a premium pack can replace them one by one with no code changes (see `assets/sounds/README.md`).
- **Vibration** on phones at the same moments: a light tap for a right answer, a firmer one for a wrong answer, a tick for each last second, and a success buzz for a level up or high score.
- **Profile → Playing** has **Sounds** and **Vibration** switches (both on to start).
- Uses Expo's `expo-audio` (playback only, so the app never asks for the microphone) and `expo-haptics`. Run `npm ci` after pulling.

## 4.0.0-beta.9 (2026-10-16)

- **A way out of the level-up screen:** the ✕ in the top-left corner (as on the picture and quiz screens) goes back to where you started. Your new level is already saved.

## 4.0.0-beta.8 (2026-10-16)

- **Your levels** replaces Recent sessions on the Progress tab: one row per level you've played, highest first, with rounds, best points and average, and a **Now** badge on your current level. Practice bands are listed underneath. (The "Level 3 → 5" session lines were confusing.)
- **Animated level-up ring** (about 1.8 s): the ring shows your old level and its last segment fills, the full ring spins once as a glow ripples out and sparks fly, the old number drops away as the new level pops in, then the segments fade back to empty for the new level. With Reduce Motion on it just shows the new level. The rest of the screen fades in after the ring's moment.

## 4.0.0-beta.7 (2026-10-16)

- **Progress says which level, not just "Levels".**
  - Recent sessions show **Level 4**, or **Level 3 → 5** when you moved during the session, plus the points scored. Practice sessions show **Practice · Easy** and so on.
  - The score chart's details say **Level 4** for a levelled round and **Practice · Hard** for a practice one.
- **Bands explained:** the "By band" table shows the levels in each band: Easy is Levels 1–7, Medium 8–17 (house numbers start at 8), Hard 18–30 (mostly harder questions from 18). Practice rounds count in the band you picked.

## 4.0.0-beta.6 (2026-10-15)

- **Launch animation.** When the app starts, an amber eye opens, **glance** and the tagline **"Look closer. Remember more."** rise in, the eye blinks once, and it all fades into the Games tab, in about 1.5 seconds.
  - It plays only when the app starts, not when you come back to it. A tap skips it.
  - With Reduce Motion on, it simply appears and fades.
- **Native splash** (`expo-splash-screen`): a plain dark screen in glance's background colour while the app loads, so there's no white flash and the animation follows on seamlessly. It shows in installed builds (EAS); Expo Go always shows its own loading screen first.

## 4.0.0-beta.5 (2026-10-15)

- **Beach art for Look & Remember.** The game card and game page now show a beach (palms, a white sailboat, a strip of sand) instead of the city houses. It's still drawn by the game's own engine, picked by eye, and shown at the same shape everywhere, so it looks the same on the card and the page.

## 4.0.0-beta.4 (2026-10-15)

- **Play straight on from the level-up screen.** It now has **Play Level N** (a new picture at your new level) as the main button, with **See my results** below it for checking the round's answers first.

## 4.0.0-beta.3 (2026-10-15)

- **Clearer next step after a round.** The main button now says what it does: **Try again · Level 1** after a weaker round, **Keep going · Level 1** after a good one, **Play Level 2** after going up, each with "New picture, same level" underneath where it helps.
- **Same picture again** on levels, after a weaker round (0–3 right): the picture you just saw with 5 different questions, to see what you missed. It's practice: it earns points to show how you did, but never moves your level, never sets a high score and isn't counted as a perfect round. Practice rounds offer it every time (it replaces Play again).
- **Coloured question dots:** the numbers above each question turn green for a right answer and red for a wrong one.
- The quiz and result screens stay a phone-width column on wide screens, like the tabs.

## 4.0.0-beta.2 (2026-10-15)

- **Calmer Games tab.** The big "Start here" card with a large street picture is gone: it repeated the game card below it and was oversized, worst on wide screens.
  - New players see a one-line intro and the game cards; tapping one opens its page with how to play.
  - Once you've played, a slim **Continue** strip shows your level ring, the game and a **Play** button.
- **Wide screens and tablets:** the Games, Progress and Profile tabs and game pages stay a phone-width column in the middle, so pictures and text aren't blown up.

## 4.0.0-beta.1 (2026-10-15)

On the `claude/glance-games-hub` branch for testing; it becomes 4.0.0 if kept.

- **glance is now a games app.** Three tabs at the bottom:
  - **Games**: a big card to carry on (your level ring and **Play level N**), then games grouped by skill. Today that's **Memory** with **Look & Remember**, the picture game. A skill appears only once it has a game.
  - **Progress**: each game's level, title, best level, high score and a chart of your level over time, then everything that was on the progress screen.
  - **Profile**: what was behind the profile icon.
- **A page for each game**: art drawn by the game itself, your level ring and title, how many good rounds to the next level and the next big unlock, high score, best level, rounds played, perfect rounds, **Play level N**, **Practice** (Easy, Medium, Hard) and how to play.
- **Levels that adjust themselves**, 1 to 30:
  - 3 good rounds (4 or 5 right) take you up a level. 2 very poor rounds in a row (0 or 1 right) take you back one. Your best level never goes down.
  - Each level adds a little: more kinds of thing, more of each, less time, the living room at Level 3, the city street at 6, house numbers at 8, mixed-colour hydrants at 12, closer counting choices at 14.
  - A **level-up screen** shows your new level, a title every 5 levels (Fresh Eyes, Sharp Eyes, Keen Observer, Detail Spotter, Eagle Eye, Total Recall, Photographic Memory) and exactly what's new.
  - Players from before levels start at a level worked out from their earlier rounds.
- **Points** for every round: right answers (100 at Level 1, +10 per level), a bonus for right answers in a row, and one for tapping **I'm ready** early. Slow answers never cost points. The result screen shows how the points were earned, **New high score!**, and how the round moved your level.
- **Practice** replaces picking Easy / Medium / Hard on the home screen. It earns points but never changes your level, and keeps **Play again**. Progressive is gone: levels do its job. Levelled play has no Play again, so the same picture can't be used twice to go up.
- Rounds are saved with the game, the level and points, so each game keeps its own progress.
- **Checks:** `npm run check:scenes` now checks the level rules and points, and plays levels 1, 4, 6, 8, 12, 14, 17 and 30 with the places each has reached (18,000 scenes).
- **Docs:** new [levels and scoring](docs/levels-and-scoring.md) and [adding a game](docs/adding-a-game.md) pages, a generated table of all 30 levels in `docs/recipes/reference.md`, and updates to the README, testing, recipes and design decisions.

## 3.6.1 (2026-10-15)

- **Documentation:**
  - `docs/questions.md` now explains exactly how questions are generated: each question type, when it's asked, how its wrong options are chosen, how a round's 5 are picked, ids and determinism, and how to add a question type.
  - New `docs/questions-examples.md`, generated by `npm run docs:recipes`: one real picture per setting, the facts recorded for it, and every question written from them, with the answer marked.
- **Question fixes** found by reading the examples:
  - No more giveaway count questions ("How many mirrors?" was always 1). Only things that can appear more than once are counted.
  - Plural "What was here?" answers no longer offer things that never come in groups ("Suns", "Buses") as wrong options.

## 3.6.0 (2026-10-15)

- **Testing (temporary)** section in the profile:
  - Switch settings (At the beach, City street, Living room) on or off. Only the ones on are played, in every mode, so you can focus on one while tuning it. With one on, every picture comes from it.
  - At least one always stays on, and "Use all settings" resets it.
  - The home screen shows a red reminder ("Testing: only City street") while it's on.
  - It's saved with your profile on this phone, and kept separate so it's easy to remove later.

## 3.5.1 (2026-10-15)

- **Documentation:** a new `docs/` folder explains how pictures and questions are made, in enough detail to review the logic or rebuild it:
  - how a picture is made
  - layout rules
  - drawing
  - questions
  - one page per recipe, plus reference tables generated from the code
  - adding a recipe, with a checklist
  - testing and reviewing
  - design decisions.
- `npm run docs:recipes` regenerates `docs/recipes/reference.md` from the recipes, so the tables never drift from the code.
- `npm run gallery` renders pictures for every setting on iPhone SE, 15 and Pro Max to `gallery.html`, with the layout overlay, for reviewing by eye.
- README updated: how pictures are generated, the docs index, scripts and project layout.

## 3.5.0 (2026-10-15)

- **House numbers and named house colours in the street:**
  - Each picture's three houses get three different colours from yellow, blue, green, pink, orange and purple.
  - Each house has a number on a white plaque above a slightly shorter door. Numbers rise along the street with uneven gaps (like 1560, 1564, 1594), so each one must be remembered.
  - Doors sit left, right and right, so no two doors or numbers are side by side.
  - Nothing covers a door or its number.
- **New questions on Medium and Hard:**
  - "What number was on the yellow house?" Wrong options are the other houses' numbers and lookalikes (swapped digits, a few doors along).
  - "What colour was house number 1564?"
  - At most one per house per round. Easy draws the numbers but doesn't ask about them.
  - Number questions are a new type, "Numbers", tracked on the progress screen. Hard prefers them.
- On wide screens, the extra buildings beyond the picture are plain beige with no numbers, so "the yellow house" is always exactly one house.
- Bicycles lean against the walls side by side, clear of doors.

## 3.4.0 (2026-10-15)

- **"I'm ready" button** in the header while you study the picture: go to the questions as soon as you're ready instead of waiting for the countdown.
  - It's a deliberate button, not a tap on the picture, because people touch the picture while studying it.
  - It ignores taps for the first second, so a stray tap can't skip a picture you haven't seen.
- **How long you looked is recorded** with each round. "Your practice" on the progress screen shows how many seconds early you're ready on average, compared with your earlier rounds.

## 3.3.3 (2026-10-15)

- **The result screen shows every option for every question:**
  - the right answer in green, with ✓
  - your pick, if it was wrong, in red and struck through, labelled "your answer"
  - the other options dimmed.

  You can see exactly what you chose between. Screen readers hear the options too.

## 3.3.2 (2026-10-15)

- **"Which of these was (NOT) in the picture?"** replaces "…on the beach / in the street / in the room?". Players read "on the beach" as "on the sand", so a dolphin in the sea or a plane in the sky looked like a trick. The setting's name is no longer used in questions.

## 3.3.1 (2026-10-15)

- **Wrong answers show both answers on the result screen:** "You said ~~4~~" in red, then "Answer 2" in green. Right answers show a tick and the answer, as before. Screen readers hear "Wrong. You said 4. The answer was 2."
- The right and wrong marks are drawn badges instead of ✓ / ✗ characters, which looked different on some devices and fonts.

## 3.3.0 (2026-10-15)

- **Profile:**
  - After your first round (never before the first picture), a card asks "What should we call you?" and your age band (Under 18, 18–34, 35–54, 55+ or Prefer not to say). Both are optional, with a "Not now" button.
  - Saving or skipping means it never asks again. Your details are remembered on this phone every time the app opens.
- **Profile icon** on the home screen (your initial, or 👤) opens the profile screen:
  - edit your name and age band
  - "More time to look"
  - About, with "glance is a memory game, not a medical test"
  - "Clear my details".
  The screen is built in sections, so account and subscription settings can be added later.
- **Greeting:** the home screen says "Hi, Priya" once you've given a name.
- **More time to look:** every picture stays 3 seconds longer. It turns on when you pick 55+, and you can switch it on or off in the profile. The home screen says when it's on.
- **Your practice**, on the progress screen. These compare you only with yourself:
  - days played and your day streak
  - how steady your scores are (how much your last 10 rounds vary)
  - each question type's accuracy over your last 10 rounds against the 10 before, e.g. "Counting 50% → 70% ↑".
  - A note says it's a memory game, not a medical test.
- Your profile has a random id from first launch, and is kept behind a `ProfileStore` interface (like scores), ready to move to Supabase with accounts.

## 3.2.0 (2026-10-15)

- **Tap the picture on the result screen to see it full size**, so you can check your answers against it. It's exactly the picture you memorised, as large as the screen allows. Tap anywhere or ✕ to close. The thumbnail now has the picture's own shape and a "Tap to enlarge" hint.

## 3.1.5 (2026-10-15)

- **Fire hydrants stand at the kerb**, the front edge of the pavement by the road, at most one per building, so two are always well apart. Pairs of anything spread along the street (hydrants, lamps, flags, trees) go at opposite ends when there's room.
- **On Hard, hydrants can be different colours** (red, yellow or orange), half the time. The question then asks "What colours were the fire hydrants?", with answers like "Red and yellow". Easy and Medium keep one colour per kind.
- `validateScene` checks that kerb things stand at the front edge, and that per-copy colours match the copies and stand out.

## 3.1.4 (2026-10-15)

- **Bicycles are parked against the buildings** (a bicycle can't stand on its own in the middle of the pavement). Their wheels sit at the building line, never in front of a door, and several are spread along the street.

## 3.1.3 (2026-10-15)

- **Furniture stands against the wall.** The TV, sofa, armchairs, plants, bookshelves and floor lamps stand where the floor meets the wall, with their backs over the wall, instead of out on the floor. Pictures and mirrors still hang clear of them (above a sofa, never behind a TV). Palm trees stand at the back of the sand the same way. `validateScene` checks it.
- The TV is bigger (about 1.3 m wide next to a 2 m sofa).

## 3.1.2 (2026-10-15)

- **No more stretched buildings on wide screens.** When the screen is wider than the picture (a tablet or a browser window), the street carries on with more buildings, each with its own windows and door, instead of the end buildings being painted wider.
- **Street lamps, the street clock and trees stand on the pavement** and are never taller than it is deep, so they no longer cover a building's windows or door.
- **Doors are taller than people** (about 1.25×), with the upper windows above them.
- City sky is a little taller and has a **helicopter**. The road holds at most two kinds of vehicle (one lane), and the roofs at most two kinds.
- When a layout can't fit every kind, the generator tries again and keeps the fullest valid picture.

## 3.1.1 (2026-10-15)

- **Doors no longer overlap windows.** City building fronts are now worked out from the roof and pavement lines: two upper-floor windows, and on the ground floor a door to one side and a shop window on the other. The scene checker fails if any window or door overlaps another or leaves its building.
- **Traffic goes one way.** Every vehicle on the road faces the same way, chosen once per picture. All vehicle drawings now face the same way (the car was drawn backwards), and cars, vans and buses have headlights and tail lights so their direction is clear.
- **Scooters have riders** in a helmet and a dark jacket, so the scooter's colour is still the one to remember. Bicycles stay rider-less because they're parked on the pavement.
- Spread-out things (lamps, flags, trees, the street clock) stand near the middle of their building or stretch of pavement, so neighbours never end up side by side at a boundary.
- Fire hydrants are squatter, so they're well under knee height next to a person.

## 3.1.0 (2026-10-15)

Fixes for the 3.0.0 layout, which placed things without regard to how they are used in real life.

- **Things follow their habits again:**
  - **Beach:** boats, buoys and dolphins float in the water, clear of the shoreline (a boat was sitting on the sand). Palm trees spread out along the back of the beach.
  - **City:**
    - Every building always has its door and two windows. 3.0.0 left them out wherever something was in front.
    - Flags and satellite dishes stand on the roofs, one per building. The clock is a street clock on a post on the pavement, instead of a clock bracketed to the middle of a wall.
    - Street lamps, trees and the clock spread out along the pavement on one line, and never stand in front of a door. Doors sit to one side of each building so there is room.
  - **Room:**
    - Pictures, mirrors and windows hang on one eye-level line, and the clock hangs above them. Pictures were stacked in a pyramid in 3.0.0.
    - The sofa, armchairs, TV, plants, bookshelves and lamps stand against the back wall, spread out. They are placed before the toys, so they actually appear.
  - **Everywhere:** copies of something on the ground stand side by side, never stacked up like a ladder.
- **Believable sizes:**
  - Vehicles and the sofa get a new extra-large size (30–62% of the width), so a bus is bigger than a person and a door rather than a toy. They may span more than one column.
  - People have arms and are drawn at 44 pt wide.
  - Beach towels are about as long as a person.
- **The scooter is redrawn** as a proper motor scooter.
- **Clouds are white again.** They count as scenery: drawn solid, but never touching anything.
- `validateScene` checks the new habits:
  - spread-out things are one per third and on one line
  - hung things are at their height
  - nothing stands in front of a door
  - rooftop things stand on the roofline
  - ground copies aren't stacked.

## 3.0.0 (2026-10-15)

A new layout engine, so every picture lays out cleanly on iPhone portrait screens (SE to Pro Max).

- **Same thing, same size.** The real-world camera and perspective scaling are gone. Every thing has a fixed size tier, measured against the picture's width:
  - large anchors (umbrella, sailboat, palm tree, bookshelf, sofa, window): 20–28%
  - medium (plane, kite, lamp, plant, mirror, clock, dolphin, cushion): 13–18%
  - small countables (ball, starfish, buoy, bird, toy car, bucket): 10–13%, and never under 44 pt.
- **Measured, normalized coordinates.** Positions and sizes are stored as fractions of the picture, which is measured with onLayout below the header and down to the bottom safe-area inset. If the measured area differs from the estimate, the same contents are laid out again (same kinds, counts, colours, bands and sides).
- **Bands and a slot grid:**
  - Beach: sky 0–35%, sea 35–60%, sand 60–100%.
  - Room: ceiling 0–10% (much thinner), wall 10–55%, floor 55–100%.
  - City: sky, building fronts, pavement, road.
  - Each band is split into 3 columns × rows. Every group of things gets its own slot, emptiest parts of the picture first.
  - Every band gets a share of the things in proportion to its height, and every third of the screen has something to remember.
- **Placement rules:**
  - Copies of a thing are staggered (zigzag, diagonal, arc) or kept 0.6× their width apart, never touching in a line.
  - Nothing comes within 4% of anything else.
  - Things stay 5% from the sides and out of the bottom 4% (home indicator).
  - Nothing crosses out of its band except tall anchors (palm trees, bookshelves, street lamps, floor lamps), which do so on purpose.
  - Toy cars and other things are either fully on the rug or off it.
- **Draw order:** background bands, then faint marks (clouds, waves, floorboards, building windows, road markings), then things from back to front. Marks are at most 35% opaque and are left out wherever they would touch a thing.
- **Contrast:**
  - Every thing has a 2.5 pt outline in a darker shade of its own colour.
  - A thing's fill or outline must differ clearly in lightness from what it sits on.
  - Buoys get a bold red or white band.
  - The room's rugs are now solid pale colours, so toy cars show clearly.
  - City roads are darker.
- **`validateScene()`** checks overlaps, sizes, duplicate gaps, edge margins, band membership, rug rule, contrast, marks and that each third has content. A scene that fails is placed again (up to 12 tries) before it is shown.
- **Layout overlay (development builds only):** a ▦ button in the header draws every box, its 4% clearance, the slot grid, the bands and the thirds, with a green or red banner from `validateScene`. The timer waits while it's on.
- **Header:** the timer ring now sits on the left next to ✕, so nothing floating in the top-right corner (like Expo Go's tools button) can cover it. ✕ and the Back button on the progress screen are 44 pt.
- City: flags and satellite dishes hang on the building fronts. The room has at most one window. Question answers use the new band names ("On the sand", "On the floor").
- `npm run check:scenes` checks 5,400 scenes (3 iPhone sizes × 3 settings × 3 levels × 200) with `validateScene`, and checks that laying a scene out again never changes its facts.

## 2.6.1 (2026-10-15)

- Fix for Expo Go on iPhone failing to start with "Cannot find native module 'ExpoAsset'": `expo-asset` is now a direct dependency at the SDK 57 version, so it is installed at the top level as Expo expects.

## 2.6.0 (2026-10-15)

- **Skip a question and come back to it:**
  - **Skip for now** moves to the next unanswered question.
  - Skipped questions come back round once you reach the end, marked "You skipped this one".
  - Numbered dots show every question (filled = answered, dashed = skipped, ringed = current); tap any unanswered dot to jump to it.
  - Skip is hidden on the last remaining question, and the round ends once every question is answered. Scores and progress count each question once.

## 2.5.1 (2026-10-15)

- **Nothing flying overlaps a cloud.** Clouds are placed first and the sky keeps clear of them, so a white plane can no longer sit on a white cloud.
- **Balloons and kites don't fly in formation.** Each one has its own height, size and direction, and they are never lined up.
- **Only one plane** appears in a picture.
- The scene checker tests both rules.

## 2.5.0 (2026-10-15)

- **Contrast rules:** every object must clearly stand out from what's behind it, measured as a colour difference that counts hue as well as lightness.
  - Objects that come in several colours only get colours that show up where they stand (no yellow bucket on yellow sand, no orange cat on an oak floor).
  - Fixed-colour objects are never placed where they'd blend in.
- **The ceiling lamp** is now an amber shade with a dark outline, so it's clearly visible.
- **Windows** have deeper blue glass so they show on every wall colour.
- **Floors** are lighter oak, so brown dogs and teddies stand out.
- **Skies, planes, dolphins and satellite dishes** were recoloured so clouds, planes, dolphins and dishes show clearly.
- The scene checker tests the contrast of every object, and of the lamp and clouds in every colour variant.

## 2.4.0 (2026-10-15)

- **Placement habits:** objects now follow the rules people use when arranging a room or street.
  - **Hanging heights:** pictures, mirrors and clocks hang at their normal height (clock centre 175–200 cm, pictures at eye level), and windows sit at sill height.
  - **Wall spacing:** things on a wall keep at least 35 cm apart, so no more clock jammed against a window.
  - **Plants stand along the wall.** Plants, floor lamps and piles of books stay off the rug. Pets, cushions and toys may sit on it.
- **Buildings have real windows and doors** that nothing may cover.
  - Street clocks are fixed to a building's corner on a bracket, at the right height between the door and the upper windows.
  - Flags and satellite dishes stand on the rooftops, and flags are now drawn as rooftop flagpoles.
- The scene checker tests all of these rules on every generated scene.

## 2.3.0 (2026-10-15)

- **Real-world scale:** every object now has a real height in centimetres, and each setting has a camera that turns that into picture size. Objects are in proportion to the room or street and to each other: in the room, a sofa is about a third of the back wall and a cat looks like a cat next to it.
- **True perspective from one horizon:** at the beach, boats far out are small and boats near the shore are big; things further back in a room are smaller.
- **Realistic counts:** one mirror, one sofa, one TV and one clock in a room. Counting questions are about things you'd expect several of (cushions, frames, cats, cars).
- **Free placement:** big things such as sofas, buses and palm trees get the room they need, and several kinds can share an area. Nothing overlaps.
- **Never bare:** a room wall always has at least two things, and the city buildings at least one.
- **Visible or not at all:** anything too small to spot where it would stand is moved nearer or left out.
- The living room now shows its ceiling and a hanging light, and city buildings have doors and windows at the same scale as the people.
- "What was on the left…" questions are only asked when exactly one kind of thing is there.

## 2.2.3 (2026-10-15)

- The ✕ button, timer bar and countdown now sit in a bar above the picture instead of on top of it, so they can never hide anything, whatever the phone or viewer. The picture fills the space below the bar.

## 2.2.2 (2026-10-15)

- Clocks, flags and satellite dishes now always sit on a single building. They used to cross the edge between two buildings of different heights and look like they were floating. City buildings now line up with the left, middle and right areas.
- Street clocks hang from a wall bracket.
- Rows of the same thing (towels, crabs, cats…) have a small gap between them, so they no longer overlap and are easy to count.
- New `npm run check:scenes`: generates 8,100 scenes and fails if anything overlaps, floats, crosses a building edge, leaves its area, hides under the controls or never fits.

## 2.2.1 (2026-10-15)

- Flags and satellite dishes are bolted to the walls with a bracket, so they no longer look like they float.
- Shop awnings are replaced by market stalls standing on the pavement.
- The sky and wall areas start below the ✕ button and the countdown, so nothing hides behind them.
- Palm trees, buses and sofas appear again; they were too big to fit. Tall things are now checked for height as well as width.

## 2.2.0 (2026-10-15)

- **Realistic sizes:** a sofa is now bigger than a cat, a bus bigger than a scooter, and a palm tree taller than a person.
- **Perspective:** things further back are smaller and higher up; things at the front are bigger and lower.
- **Surface rules:** furniture, pots, people and animals always stand on the floor, sand or pavement; flags, clocks and frames hang on walls; boats float on the water. No more floating plant pots.
- **Clouds:** 2–4 clouds are spread across every sky. They're scenery and never asked about.
- **Fuller pictures:**
  - pictures are built to your screen's shape, so there's no empty band
  - beaches now have a "near the water" and an "at the front" area
  - living rooms have a rug
  - every level shows one more kind of thing (Easy 5, Medium 7, Hard 9)

## 2.1.1 (2026-10-15)

- Fixed the question overlapping "Question 1 of 5" on shorter screens, such as inside the Claude app. The quiz and home screens now scroll when space is tight.

## 2.1.0 (2026-10-15)

- The app version now shows at the bottom of the home screen.
- Added this changelog.

## 2.0.0 (2026-10-15)

- Every picture is now generated fresh, with its questions, from recipes: beach, city street and living room.
- Difficulty shapes the picture too:
  - Easy: 4 kinds of thing, 10 seconds to look.
  - Medium: 6 kinds, 8 seconds.
  - Hard: 8 kinds, 6 seconds, with wrong counts right next to the answer.
- A round never asks two questions about the same thing.
- Removed the three fixed hand-drawn pictures.

## 1.3.0 (2026-10-14)

- New **Your progress** screen:
  - whether you're improving
  - totals
  - a chart of recent rounds
  - per-difficulty table
  - accuracy by question type
  - recent sessions
  - reset
- Every finished round is saved on the device.

## 1.2.0 (2026-10-14)

- **Next picture** button on the results screen.
- Random funny messages above the score.
- Result buttons are pinned to the bottom of the screen.

## 1.1.0 (2026-10-14)

- A wrong answer turns red and shakes, then the right answer turns green and the game waits for **Next**. Right answers still move on by themselves.

## 1.0.0 (2026-10-14)

- First version:
  - home screen with Easy, Medium, Hard and Progressive
  - a picture with a 10-second countdown
  - 5 multiple-choice questions
  - a score with Play again
