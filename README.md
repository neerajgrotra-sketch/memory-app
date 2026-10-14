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
3. **Quiz**: 5 questions, 4 options each, with instant right/wrong feedback.
4. **Result**: your score out of 5 and the correct answers. **Play again** uses the same picture with 5 different questions.

Difficulty decides which question types come first:

| Mode        | Preferred types                                      |
| ----------- | ---------------------------------------------------- |
| Easy        | object, colour                                       |
| Medium      | all types                                            |
| Hard        | count, position                                      |
| Progressive | easy → medium → hard, stepping up each "Play again"  |

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
  types/game.ts        Domain types
assets/images/         Scene images
design/scenes/         SVG sources for the scene images
```

## Moving questions to Supabase

Screens only use the `QuestionRepository` interface. To switch over:

1. Create tables that mirror `GameImage` and `Question` in `src/types/game.ts`, for example `images(id, title, url)` and `questions(id, image_id, type, prompt, options text[], answer_index)`.
2. Implement `QuestionRepository` with `@supabase/supabase-js`, mapping rows to the domain types. `GameImage.source` already accepts a remote URL string.
3. Point `repository` at it in `src/data/index.ts`.

## About the images

The 3 scenes are simple illustrations, bundled with the app, rather than random stock photos. A placeholder photo's contents are unknown, so its questions can't be guaranteed correct. These scenes were drawn with exact counts, colours and positions so every answer is verifiable.
