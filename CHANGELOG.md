# Changelog

Every change to glance gets a new version number, shown at the bottom of the home screen.

Numbers follow `MAJOR.MINOR.PATCH`:

- **Major**: a big change to how the game works.
- **Minor**: a new feature.
- **Patch**: a fix or small tweak.

To release a change, bump `version` in both `app.json` and `package.json`, then add an entry at the top of this file.

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
