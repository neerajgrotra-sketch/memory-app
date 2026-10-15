# Changelog

Every change to glance gets a new version number, shown at the bottom of the home screen.

Numbers follow `MAJOR.MINOR.PATCH`:

- **Major**: a big change to how the game works.
- **Minor**: a new feature.
- **Patch**: a fix or small tweak.

To release a change, bump `version` in both `app.json` and `package.json`, then add an entry at the top of this file.

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
