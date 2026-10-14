# glance

A picture memory game built with Expo (React Native + TypeScript), Expo Router and Reanimated.

Study a picture for 10 seconds, then answer 5 multiple-choice questions about it from memory.

## Run it

```bash
npm install
npx expo start --tunnel   # scan the QR code with Expo Go
```

Checks: `npm run typecheck` and `npm run lint`.

## How it plays

1. **Home**: pick Easy, Medium, Hard or Progressive.
2. **Memorise**: the picture is shown full-screen with a countdown from 10 to 1.
3. **Quiz**: 5 questions, 4 options each. A right answer flashes green and moves on. A wrong answer shakes red, then shows the right one in green and waits for **Next**.
4. **Result**: your score out of 5 with a random funny message, plus the correct answers.
   - **Next picture** moves on to another picture. Pictures come in shuffled order, with no picture twice in a row.
   - **Play again** keeps the same picture with 5 different questions.
   - Questions already asked are remembered per picture for the whole session.

5. **Your progress** (from the home screen):
   - Whether you're improving: your last 5 rounds compared with the 5 before.
   - Totals: rounds, sessions, average score and perfect rounds.
   - A chart of your last 20 rounds, coloured by level.
   - Rounds, average, best and trend for Easy, Medium and Hard.
   - Accuracy per question type, recent sessions, and a reset.

   Every finished round is saved on the device. Progressive rounds count under the level they were played at. A session runs from picking a mode until you go home.

Difficulty decides which question types come first:

| Mode        | Preferred types                                      |
| ----------- | ---------------------------------------------------- |
| Easy        | object, colour                                       |
| Medium      | all types                                            |
| Hard        | count, position                                      |
| Progressive | easy → medium → hard, stepping up every round     |

Questions you haven't seen yet always come before repeats, and the previous round's questions are never repeated back to back.

## Project layout

```
src/
  app/                 Expo Router screens (_layout, index = home, play)
  components/          Countdown (Reanimated), Memorise/Quiz/Result stages, Button
  game/                Pure game logic: difficulty config, question selection, option shuffling
  hooks/useGameSession Game state machine: memorise → quiz → result → play again
  data/
    repository.ts      QuestionRepository interface
    index.ts           The one place the active repository is chosen
    local/             Hardcoded seed data (3 images × 10 questions)
  stats/
    statsStore.ts      StatsStore interface + on-device (AsyncStorage) store
    index.ts           The one place the active stats store is chosen
    summarize.ts       Pure functions: totals, trends, per-level/type/session summaries
  types/               Domain types (game, stats)
assets/images/         Scene images
design/scenes/         SVG sources for the scene images
```

## Moving questions to Supabase

Screens only use the `QuestionRepository` interface. To switch over:

1. Create tables that mirror `GameImage` and `Question` in `src/types/game.ts`, for example `images(id, title, url)` and `questions(id, image_id, type, prompt, options text[], answer_index)`.
2. Implement `QuestionRepository` with `@supabase/supabase-js`, mapping rows to the domain types. `GameImage.source` already accepts a remote URL string.
3. Point `repository` at it in `src/data/index.ts`.

Progress works the same way: implement `StatsStore` against a `round_results` table shaped like `RoundResult` in `src/types/stats.ts`, and point `statsStore` at it in `src/stats/index.ts`.

## About the images

The 3 scenes are simple illustrations, bundled with the app, rather than random stock photos. A placeholder photo's contents are unknown, so its questions can't be guaranteed correct. These scenes were drawn with exact counts, colours and positions so every answer is verifiable.
