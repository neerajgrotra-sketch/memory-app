# Questions

Written by `generateQuestions(scene, recipe, knobs)` in `src/scenes/generateQuestions.ts`, purely from the scene's groups and details, so every answer is right by construction. Each question has exactly 4 options; the answer is stored first and shuffled when a round is built.

## Question types

| Type (shown as) | Template | When it's asked | Wrong options |
| --- | --- | --- | --- |
| `count` (Count) | "How many kites were there?" | every countable kind | Easy and Medium: within 3 of the answer. Hard: the nearest numbers (4 vs 5). |
| `colour` (Colour) | "What colour was the sail on the boat?" (or the thing's `colourPrompt`) | kinds that have a colour | the thing's other colours first, then any colour |
| `colour` | "What colours were the fire hydrants?" → "Red and yellow" | Hard, when copies differ in colour | other combinations of its colours, "All yellow"… |
| `position` (Position) | "Where was the umbrella?" → "On the sand, on the left" | every kind except ones spread across thirds | the other sides of its bands first, then other bands |
| `object` (Object) | "What was on the wall, in the middle?" | only when exactly one kind of thing is in that band and side | other kinds that belong in that band |
| `object` | "Which of these was in the picture?" / "Which of these was NOT in the picture?" | when at least 3 kinds are present and 3 absent | absent kinds / present kinds |
| `number` (Number) | "What number was on the yellow house?" | Medium and Hard, city | the other houses' numbers, swapped digits, a few doors along |
| `colour` | "What colour was house number 1564?" | Medium and Hard, city | the other houses' colours, then other house colours |

Band names come from each band's `label` ("In the sky", "On the sand", "On the roofs"). Bands without slot rows are never offered as answers.

The in/NOT-in questions deliberately say "**in the picture**", never "on the beach" or "in the street". Players read "on the beach" as "on the sand", so a dolphin in the sea looked like a trick.

## Picking a round

`selectQuestions` (`src/game/selectQuestions.ts`) picks 5:

1. Questions from the round just played are left out, if there are enough others (Play again).
2. They are ranked: not yet asked about this picture, then the level's preferred types:
   - Easy: object, colour
   - Medium: all types
   - Hard: count, position, number.
3. In order, but never two questions about the same `subject`. The house number and house colour of one house share a subject.
4. Each question's options are shuffled (`toRoundQuestion`).

A picture that can give fewer than 12 questions is replaced before it is shown (`createStage`).

## After the round

The result screen lists every question with all four options:

- the right answer in green with ✓
- a wrong pick in red, struck through, labelled "your answer"
- the other options dimmed.

Tapping the picture shows it full size (`src/components/PictureViewer.tsx`). Each round's score per question type is saved (`RoundResult.byType`) for the progress screen.
