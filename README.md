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

- **Bands and cells.** A recipe has bands (sky, sea, near the water, at the front…) given as fractions of the picture height. Each band is split into left / middle / right cells with clear gaps between them. Each cell holds at most one kind of thing, so nothing overlaps and nothing sits on a boundary.
- **Surfaces.** Every band is `air` (things float), `wall` (things hang) or `ground` (things stand). An item lists the bands it may go in, so a plant pot can only stand on a floor and a flag can only hang on a building. Ground bands can set a `floor` line (where the floor meets the wall) that feet must stay below.
- **Real sizes.** Every item has a `size`: its real-world height relative to the others (sofa 150, cat 60, toy car 38). Everything is drawn 35% larger than that so small things are easy to spot. Big things may shrink to at most 75% to fit a cell; otherwise fewer of them are placed.
- **Perspective.** Ground bands have `farScale` and `nearScale`. Things stand in rows, each row further back a little higher and smaller, and only the bottom 10% of a back-row thing may tuck behind the row in front.
- **Scenery.** `decor` (such as clouds) is spread across a band, drawn behind everything, and never asked about.
- **Screen shape.** The picture is 900 wide and as tall as the screen's shape needs (1350–2000), so it fills the phone.

Generation is seeded, so the same seed always rebuilds the same picture (handy for a future daily challenge).

### Adding a recipe

1. Copy a file in `src/scenes/recipes/` and give it an id, title, bands (`zones`), backdrop variants and items. Reuse shared items from `src/scenes/items/common.tsx` where you can.
2. Each item has a name, plural, design box (`w`, `h`), real-world `size`, the bands it may go in, a maximum count, optional colours and a `draw` function. Each band has a surface type; backdrops take the picture height.
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
