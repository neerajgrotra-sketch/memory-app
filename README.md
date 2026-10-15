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
2. **Memorise**: a brand-new picture is generated and shown full-screen with a countdown (10 s on Easy, 8 s on Medium, 6 s on Hard).
3. **Quiz**: 5 questions, 4 options each. A right answer flashes green and moves on. A wrong answer shakes red, then shows the right one in green and waits for **Next**.
4. **Result**: your score out of 5 with a random funny message, plus the correct answers.
   - **Next picture** generates a new picture in a different setting.
   - **Play again** keeps the same picture with 5 different questions.

5. **Your progress** (from the home screen):
   - Whether you're improving: your last 5 rounds compared with the 5 before.
   - Totals: rounds, sessions, average score and perfect rounds.
   - A chart of your last 20 rounds, coloured by level.
   - Rounds, average, best and trend for Easy, Medium and Hard.
   - Accuracy per question type, recent sessions, and a reset.

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
2. Fill it: pick which things appear, how many, what colour and where, following the placement rules below.
3. Record every fact: kind, count, colour, band and side.
4. Draw the picture from those facts (`react-native-svg`).
5. Write the questions from the same facts, so every answer is right by construction. Wrong options come from the same recipe so they're believable. A picture that can't give enough questions is quietly replaced.

### Placement rules

- **One real-world scale per setting.** Every item has a real `height` in centimetres (sofa 85, armchair 95, cat 30, mirror 90, bus 280). Each recipe has a `camera` that turns centimetres into picture units, like a real photo: `pxPerCm × (y − horizon) / (ref − horizon)`. Things standing lower in the picture are nearer and bigger, from one horizon for the whole scene. At the beach the horizon is the sea line; the room's back wall is 4.3 m wide at 2.1 units per cm. Sky things are far away, so their `height` is simply how big they look.
- **Realistic counts.** `maxCount` is the most you'd plausibly see: one sofa, one mirror, one TV, one clock; several cushions, frames, cats or cars.
- **Placement habits.** Items carry the habits people follow:
  - `hangAt`: hanging height of the centre above the floor, in cm. Clock 175–200; pictures and mirrors at eye level; windows 140–155, which puts the sill at about 80 cm.
  - `wallGapCm`: a recipe's least gap between things on a wall (35 cm in the room).
  - `avoid: ['rug']`: things that never sit over a rug or stand in front of it (plants, floor lamps, piles of books). Plants only stand along the back wall.
  - `mount`: things fixed to a recipe's mounting points instead of anywhere. A street clock goes on a building corner on a bracket (mirrored on right-hand corners); flags and dishes stand on rooftops.
- **Contrast.** Everything must stand out from the surface behind it: a perceptual colour difference (OKLab, which counts hue as well as lightness) of at least 18, in `src/scenes/contrast.ts`.
  - Each variant has a `palette`, and each recipe has a `surfaceAt(x, y)` that says which surface is behind a point: wall, ceiling, floor, rug, sky, sea, sand, a building, pavement or road.
  - Coloured things only get colours that pass where they stand. Fixed-colour things declare a `tone` and are never placed where it would blend in.
  - Backdrop details (`accents`, such as the ceiling lamp and clouds) must pass in every variant.
- **Fixtures.** A recipe's `fixtures(height)` lists the windows, doors and rug in its backdrop, and the backdrop draws them from the same data. Nothing is hung over a window or door. City buildings have a fixed layout (upper-floor windows, a centred door) that leaves the corners clear for clocks.
- **Surfaces.** Every band is `air` (things float), `wall` (things hang, at the scale of the wall's base) or `ground` (the band is where feet go). An item lists the bands it may go in, so a plant pot only stands on a floor and a flag only hangs on a building.
- **Wall panels.** A wall band can be split into `panels` (one per building). Anything hung there stays entirely on one panel. City buildings line up with the left, middle and right thirds.
- **Free placement, no overlaps.** Groups are placed at random spots in their band, biggest first, so small things fill the gaps. Nothing may touch anything else; rows of the same thing have a gap between them.
- **Never bare.** `minGroups` guarantees some zones get things (a room wall always has at least two).
- **Visible or not at all.** Anything smaller than 42 units where it would stand is moved nearer or left out, never drawn as a speck.
- **Clear sides.** A group's left / middle / right is the third its centre is in, and centres stay clear of the lines between thirds. "What was on the left of the wall?" is only asked when exactly one kind of thing is there.
- **Screen shape.** The picture is 900 wide and as tall as the space below the countdown bar needs (1350–2000). Scales stretch with the height up to 1700, then taller screens just get more space. The controls sit in their own bar, never on top of the picture.

Run `npm run check:scenes` after any change to recipes or placement. It generates 8,100 scenes (every recipe, level and screen height) and fails if anything blends into its background, overlaps, covers a window or door, hangs at the wrong height, sits too close to another thing on a wall, is over a rug it should avoid, isn't on its mounting point, is too small to see, leaves its band, crosses a building edge, isn't standing in its area, sits on the line between two sides, exceeds its realistic count, leaves a must-fill zone bare, never fits anywhere, or if scenes come up short of things or questions.

### Adding a recipe

1. Copy a file in `src/scenes/recipes/` and give it an id, title, bands (`zones`), backdrop variants and items. Reuse shared items from `src/scenes/items/common.tsx` where you can.
2. Set the recipe's `camera` and draw the backdrop at the same scale. Each item has a name, plural, design box (`w`, `h`), real `height` in cm, the bands it may go in, a realistic maximum count, optional colours and a `draw` function. Each band has a surface type; backdrops take the picture height.
3. List the recipe in `src/scenes/recipes/index.ts`.

Aim for 12+ items per recipe, so harder levels have enough to fill the picture and enough absent things for "Which of these was NOT…" questions.

## Project layout

```
src/
  app/                 Expo Router screens (_layout, index = home, play)
  components/          Countdown (Reanimated), Memorise/Quiz/Result stages, Button
  game/                Pure game logic: difficulty config, question selection, option shuffling
  hooks/useGameSession Game state machine: memorise → quiz → result → play again / next picture
  scenes/
    recipes/           One file per setting (beach, city, livingRoom) + the registry
    items/common.tsx   Things shared across settings (people, dogs, birds, trees…)
    generateScene.ts   Fills a recipe with random, fair contents
    generateQuestions.ts  Writes every question a scene can answer
    createStage.ts     Recipe + level → playable picture and question pool
    SceneView.tsx      Draws a scene, filling any screen shape
  stats/
    statsStore.ts      StatsStore interface + on-device (AsyncStorage) store
    index.ts           The one place the active stats store is chosen
    summarize.ts       Pure functions: totals, trends, per-level/type/session summaries
  types/               Domain types (game, stats)
```

## Moving to Supabase

Progress is stored behind a `StatsStore` interface. To sync across devices,: implement `StatsStore` against a `round_results` table shaped like `RoundResult` in `src/types/stats.ts`, and point `statsStore` at it in `src/stats/index.ts`.
