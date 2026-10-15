# glance

A picture memory game built with Expo (React Native + TypeScript), Expo Router and Reanimated.

Study a picture for 10 seconds (or tap **I'm ready** sooner), then answer 5 multiple-choice questions about it from memory.

## Run it

```bash
npm install
npx expo start --tunnel   # scan the QR code with Expo Go
```

Checks: `npm run typecheck`, `npm run lint` and `npm run check:scenes` (5,400 generated pictures against every layout rule). Review pictures by eye with `npm run gallery` (writes `gallery.html`). After changing a recipe, run `npm run docs:recipes`. See [docs/testing.md](docs/testing.md).

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
   - **Testing (temporary)**: switch settings on or off to play only the ones you're tuning. The home screen shows a reminder while it's on.
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
| Hard        | 6 s       | 9              | 6                | right next to it  | count, position, number |

Medium and Hard also ask about house numbers and house colours in the street. On Hard, fire hydrants can differ in colour.

**Progressive** plays Easy, then Medium, then Hard, stepping up every round.

A round never asks two questions about the same thing, and Play again never repeats the previous round's questions.

## How pictures are generated

Every picture is generated on the device from a **recipe** in a few milliseconds. No network, stored images or AI service is involved. There are 3 recipes: **at the beach**, **city street** and **living room**. Each picture picks a different mix of things, counts, colours and positions, and never the same setting twice in a row.

1. **Measure** the picture area (below the header, inside the safe area).
2. **Pick a recipe** and the level's settings:
   - how many kinds of thing
   - the most of one kind
   - whether to ask about house numbers.
3. **Fill and place:**
   - each band (sky, sea, sand…) gets a share of the kinds
   - each group of things gets its own cell of a 3-column slot grid
   - things follow real-world habits: pictures hang at eye level, furniture stands against the wall, flags stand on roofs, hydrants at the kerb, traffic goes one way.
4. **Check** with `validateScene` (overlaps, sizes, spacing, margins, bands, habits, contrast…). A picture that fails is placed again before it is shown.
5. **Draw** with `react-native-svg`: background bands, then faint details, then things back to front, each with an outline in its own darker colour.
6. **Ask** questions written from the same facts (kind, count, colour, band, side, house numbers), so every answer is right by construction.

**Full documentation: [docs/](docs/README.md).**

| Page | What it covers |
| --- | --- |
| [How a picture is made](docs/how-pictures-are-made.md) | The whole pipeline |
| [Layout rules](docs/layout-rules.md) | Sizes, bands, slot grid, spacing, habits, `validateScene` |
| [Drawing](docs/drawing.md) | Layers, outlines, contrast, wide screens, the dev overlay |
| [Questions](docs/questions.md) | Question types, wrong options, picking a round |
| [Recipes](docs/recipes/README.md) | One page per setting, plus generated reference tables |
| [Adding a recipe](docs/adding-a-recipe.md) | Step by step, with a checklist |
| [Testing and reviewing](docs/testing.md) | Scene checker, gallery, overlay in Expo Go |
| [Design decisions](docs/design-decisions.md) | Why the rules are what they are |

## Project layout

```
docs/                  How pictures and questions are made (start at docs/README.md)
  recipes/             One page per setting + reference.md (generated)
scripts/
  check-scenes.ts      npm run check:scenes: 5,400 scenes against every rule
  gallery.tsx          npm run gallery: pictures to gallery.html for reviewing by eye
  recipe-reference.ts  npm run docs:recipes: regenerates docs/recipes/reference.md
src/
  app/                 Expo Router screens: _layout, index (home), play, stats (progress), profile
  components/          Countdown (Reanimated), Memorise/Quiz/Result stages, picture viewer, profile prompt, buttons
  game/                Pure game logic: difficulty, question selection, option shuffling, quiz navigation, score messages
  hooks/useGameSession Game state machine: memorise → quiz → result → play again / next picture
  scenes/
    recipes/           One file per setting (beach, city, livingRoom) + the registry
    items/common.tsx   Things shared across settings (people, dogs, birds, trees…)
    layout.ts          Layout rules and geometry: tiers, margins, slot grid, arrangements of copies
    generateScene.ts   Fills a recipe with contents and lays them out (and again for another size)
    validateScene.ts   Checks a laid-out scene against every rule
    generateQuestions.ts  Writes every question a scene can answer
    createStage.ts     Recipe + level → playable picture and question pool
    SceneView.tsx      Draws a scene (layers, outlines) and fits it to the screen
    LayoutOverlay.tsx  Dev-only overlay of boxes, slot grid, bands and thirds
    marks.tsx          Faint backdrop details kept clear of things
    contrast.ts        OKLab contrast, lightness and outline shades
    variant.ts         A scene's colour scheme with its per-picture details (house colours)
  profile/             ProfileStore (on-device) and ProfileProvider / useProfile
  stats/               StatsStore (on-device) and pure summaries (trends, practice)
  types/               Domain types (game, stats, profile)
```

## Moving to Supabase

The profile is stored behind a `ProfileStore` interface (`src/profile/profileStore.ts`), shaped like `Profile` in `src/types/profile.ts`. It has a random `id` from first launch, so a future account can claim it.

Progress is stored behind a `StatsStore` interface. To sync across devices,: implement `StatsStore` against a `round_results` table shaped like `RoundResult` in `src/types/stats.ts`, and point `statsStore` at it in `src/stats/index.ts`.
