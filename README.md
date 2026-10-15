# glance

A picture memory game built with Expo (React Native + TypeScript), Expo Router and Reanimated.

Study a picture for 10 seconds, then answer 5 multiple-choice questions about it from memory.

## Run it

```bash
npm install
npx expo start --tunnel   # scan the QR code with Expo Go
```

Checks: `npm run typecheck` and `npm run lint`.

Every change bumps the version (shown on the home screen). See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

## How it plays

1. **Home**: pick Easy, Medium, Hard or Progressive.
2. **Memorise**: a brand-new picture is generated and shown full-screen with a countdown (10 s on Easy, 8 s on Medium, 6 s on Hard). Tap **I'm ready** to go to the questions early (it ignores taps in the first second).
3. **Quiz**: 5 questions, 4 options each. A right answer flashes green and moves on. A wrong answer shakes red, then shows the right one in green and waits for **Next**.
   - **Skip for now** moves to the next unanswered question. Skipped questions come back round once the end is reached, marked "You skipped this one".
   - The numbered dots show every question (filled = answered, dashed = skipped, ringed = current); tap an unanswered dot to jump to it.
   - Skip is hidden on the last unanswered question, and the round ends when every question has an answer.
4. **Result**: your score out of 5 with a random funny message, plus every question with all its options: the right answer in green and your wrong pick in red. Tap the picture to see it full size and check your answers.
   - **Next picture** generates a new picture in a different setting.
   - **Play again** keeps the same picture with 5 different questions.

5. **Profile** (the icon at the top right of the home screen):
   - After your first round, a card asks once for a name and an age band. Both are optional; saving or skipping means it never asks again.
   - Your details are remembered on this phone.
   - The profile screen edits them, has "More time to look" (+3 s per picture, on by default for 55+) and "Clear my details".
   - It's built in sections, so account and subscription settings can be added later.
   - glance is a memory game, not a medical test: nothing compares you with other people or claims to measure brain health.

6. **Your progress** (from the home screen):
   - Whether you're improving: your last 5 rounds compared with the 5 before.
   - Totals: rounds, sessions, average score and perfect rounds.
   - A chart of your last 20 rounds, coloured by level.
   - Rounds, average, best and trend for Easy, Medium and Hard.
   - Accuracy per question type, recent sessions, and a reset.
   - Your practice: days played, day streak, how steady your scores are, and each question type's accuracy now against before. It always compares you with yourself.

   Every finished round is saved on the device. Progressive rounds count under the level they were played at. A session runs from picking a mode until you go home.

Difficulty changes the picture and the questions:

| Mode        | View time | Kinds of thing | Most of one kind | Wrong counts      | Questions asked first |
| ----------- | --------- | -------------- | ---------------- | ----------------- | --------------------- |
| Easy        | 10 s      | 5              | 3                | spread out        | object, colour        |
| Medium      | 8 s       | 7              | 4                | spread out        | all types             |
| Hard        | 6 s       | 9              | 6                | right next to it  | count, position       |

**Progressive** plays Easy, then Medium, then Hard, stepping up every round.

A round never asks two questions about the same thing, and Play again never repeats the previous round's questions.

## How pictures are generated

Every picture is built on the device from a **recipe** in a fraction of a second. No network or AI service is involved.

1. Pick a recipe (beach, city street, living room), never the same as the last picture.
2. Fill it: pick which things appear, how many, what colour and where, following the layout rules below.
3. Record every fact: kind, count, colour, band and side.
4. Draw the picture from those facts (`react-native-svg`).
5. Write the questions from the same facts, so every answer is right by construction. Wrong options come from the same recipe so they're believable. A picture that can't give enough questions is quietly replaced.

### Layout rules

Every picture is laid out for the space it is shown in: the area below the header, down to the bottom safe-area inset, measured with `onLayout`. Positions and sizes are stored as fractions of that area (`x` and `w` of the width, `y` of the height) and converted when drawn, so nothing assumes a fixed or square canvas. If the measured area differs from the estimate the scene was made for, the same contents are laid out again: same kinds, counts, colours, bands and sides, so the questions stay right.

- **Size tiers, measured against the width.** Things of one kind are always the same size:
  - extra large (bus, van, car, sofa): 30–62%, so they look right next to people and doors. They may span more than one column.
  - large anchors (umbrella, sailboat, palm tree, bookshelf, sofa, window): 20–28% of the width
  - medium (plane, kite, lamp, plant, mirror, clock, dolphin, cushion): 13–18%
  - small countables (ball, starfish, buoy, bird, toy car, bucket): 10–13%, and never under 44 pt.
- **Bands.** Each setting is split into horizontal bands, and each thing lists the bands it belongs in:
  - Beach: sky 0–35%, sea 35–60%, sand 60–100%.
  - Room: ceiling 0–10%, wall 10–55%, floor 55–100%.
  - City: sky (with rooftops along its bottom edge), building fronts (one per third, each with two windows and a door), pavement, road.
- **Slot grid.** Each band is split into 3 columns (left / middle / right) × a few rows. Every group of things gets its own slot, preferring the emptiest parts of the picture. Positions are jittered only a little inside the slot.
- **Spread out.**
  - Each band gets a share of the kinds in proportion to its height.
  - Every third of the screen (top, middle, bottom) has something to remember.
- **Copies.** 2–4 of the same thing are staggered (zigzag, diagonal or arc) or kept at least 0.6× their width apart. They never touch or sit in a tight line.
- **No overlaps.** Nothing comes within 4% of the width of anything else.
- **Wider screens** get the backdrop carried on around the picture (more buildings along the street, more sea and sand), never stretched.
- **Margins.** Things stay 5% from the left and right edges, and the bottom 4% stays clear for the home indicator.
- **Habits.** Things go where they would in real life:
  - `hangAt`: pictures, mirrors and windows hang on one eye-level line, and a clock hangs above it.
  - `backRow`: sofas, armchairs, TVs and plants stand against the back wall: feet where the floor meets the wall, backs over the wall.
  - `spread`: street lamps, trees, palm trees, bookshelves, flags and dishes on roofs go one per column, standing on one line. City street lamps, clocks and trees stand within the pavement's depth, never in front of the buildings.
  - `flush` bands (rooftops): things stand exactly on the line.
  - `keepClear`: nothing stands in front of a building's door.
  - `frontRow`: fire hydrants stand at the kerb, one per building.
  - `mixedColours`: on Hard, copies of some things (fire hydrants) may each be a different colour; the question asks which colours they were.
  - `oneWay` bands (the road): every vehicle faces the same way. Vehicle drawings all face right, and moving scooters have riders.
  - Boats float in the water, clear of the shore.
  - Copies of something on the ground stand side by side, never stacked like a ladder.
- **Bands are respected.** Nothing crosses out of its band. Tall anchors (palm trees, bookshelves, street and floor lamps) are the exception: they stand in the back row of their band and rise above it on purpose.
- **Rugs.** Anything touching the rug is fully on it (toy cars); furniture and plants stay off it.
- **Draw order.**
  1. Background bands.
  2. Faint marks (waves, floorboards, road markings), at most 35% opaque, and white clouds (scenery, solid). None of them ever touches a thing's box.
  3. Things, back to front by their bottom edge.
- **Contrast.** Every thing has a 2–3 pt outline in a darker shade of its own colour. Its colour must differ clearly from what it sits on, in colour (OKLab difference ≥ 18) and in lightness (fill or outline ≥ 15 lighter or darker). Coloured things only get colours that pass wherever they are drawn.
- **Sides.** A group's left / middle / right is the third its centre is in, and centres stay clear of the lines between thirds. "What was on the left of the wall?" is only asked when exactly one kind of thing is there.

`validateScene(scene, width, height)` (`src/scenes/validateScene.ts`) checks all of this: overlaps, sizes, duplicate gaps, edge margins, band membership, habits, doors, the rug rule, contrast, marks and that each third has content. A generated scene that fails is placed again (up to 12 tries) before it is shown.

**Checking layouts on a phone.** In a development build (Expo Go), the ▦ button in the memorise header turns on the layout overlay:
- every box, with its 4% clearance dashed around it
- the slot grid and band edges in blue
- the thirds in pink
- the margins shaded
- a banner that is green ("layout OK") or red with the first problem.

The timer waits while the overlay is on.

Run `npm run check:scenes` after any change to recipes or layout. It generates 5,400 scenes (iPhone SE, 15 and Pro Max picture sizes × every setting × every level × 200) and fails if any scene breaks a rule, or if any of these happen:
- a size is outside its tier
- a thing can't stand out anywhere
- laying a scene out again changes its facts
- scenes come up short of kinds or questions.

### Adding a recipe

1. Copy a file in `src/scenes/recipes/` and give it an id, title, bands (`zones`), backdrop variants and items. Reuse shared items from `src/scenes/items/common.tsx` where you can.
2. Define the bands (`zones`: top and bottom as fractions of the height, a surface type and slot rows) and a backdrop that draws only the background bands for a picture 900 wide and any height. Faint details go in `marks`, which are kept clear of every thing.
3. Give each item a name, plural, design box (`w`, `h`), a size `tier` and `size` (fraction of the width), the bands it may go in, a realistic maximum count, optional colours and a `draw` function. Shapes without their own stroke get the outline; small details use `stroke="none"`.
4. List the recipe in `src/scenes/recipes/index.ts`, then run `npm run check:scenes`.

Aim for 12+ items per recipe, so harder levels have enough to fill the picture and enough absent things for "Which of these was NOT in the picture?" questions.

## Project layout

```
src/
  app/                 Expo Router screens (_layout, index = home, play)
  components/          Countdown (Reanimated), Memorise/Quiz/Result stages, Button
  game/                Pure game logic: difficulty config, question selection, option shuffling, quiz navigation (skip / come back)
  hooks/useGameSession Game state machine: memorise → quiz → result → play again / next picture
  scenes/
    recipes/           One file per setting (beach, city, livingRoom) + the registry
    items/common.tsx   Things shared across settings (people, dogs, birds, trees…)
    layout.ts          Layout rules and geometry: tiers, margins, slot grid, duplicate arrangements
    generateScene.ts   Fills a recipe with random, fair contents and lays them out (and lays them out again for another size)
    validateScene.ts   Checks a laid-out scene against every layout rule
    LayoutOverlay.tsx  Dev-only overlay of boxes, slot grid, bands and thirds
    generateQuestions.ts  Writes every question a scene can answer
    createStage.ts     Recipe + level → playable picture and question pool
    SceneView.tsx      Draws a scene, filling any screen shape
  profile/
    profileStore.ts    ProfileStore interface + on-device (AsyncStorage) store
    index.tsx          ProfileProvider / useProfile, age bands, "More time to look"
  stats/
    statsStore.ts      StatsStore interface + on-device (AsyncStorage) store
    index.ts           The one place the active stats store is chosen
    summarize.ts       Pure functions: totals, trends, per-level/type/session summaries
  types/               Domain types (game, stats)
```

## Moving to Supabase

The profile is stored behind a `ProfileStore` interface (`src/profile/profileStore.ts`), shaped like `Profile` in `src/types/profile.ts`. It has a random `id` from first launch, so a future account can claim it.

Progress is stored behind a `StatsStore` interface. To sync across devices,: implement `StatsStore` against a `round_results` table shaped like `RoundResult` in `src/types/stats.ts`, and point `statsStore` at it in `src/stats/index.ts`.
