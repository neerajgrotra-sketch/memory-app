# glance documentation

How glance's first game, Look & Remember, builds its pictures and questions, how its levels and points work, in enough detail to review the logic or rebuild it from scratch. The code is the source of truth; these pages explain it and point to it.

| Page | What it covers |
| --- | --- |
| [How a picture is made](how-pictures-are-made.md) | The whole pipeline, from the screen size to a drawn picture and its questions |
| [Layout rules](layout-rules.md) | Sizes, bands, the slot grid, spacing, real-world habits and `validateScene` |
| [Drawing](drawing.md) | Layers, outlines, contrast, faint marks, wide screens, the dev overlay |
| [How questions are generated](questions.md) | Every question type, when it's asked, how wrong options are chosen, how a round's 5 are picked |
| [Question examples](questions-examples.md) | Real pictures, their facts and every question written from them (generated) |
| [Recipes](recipes/) | One page per setting: [beach](recipes/beach.md), [city street](recipes/city.md), [living room](recipes/living-room.md), plus the generated [reference tables](recipes/reference.md) |
| [Recipe questionnaire](recipe-questionnaire.md) | The questions that define a new setting, with a worked example (a park) |
| [Adding a recipe](adding-a-recipe.md) | Step by step, with a checklist |
| [Testing and reviewing](testing.md) | The scene checker, the gallery, the overlay in Expo Go |
| [Levels and scoring](levels-and-scoring.md) | Look & Remember's 30 levels, how your level moves, what each level changes, points |
| [Adding a game](adding-a-game.md) | The game registry, skills, and what a new game needs |
| [Design decisions](design-decisions.md) | Why the rules are what they are (most came from play-testing feedback) |

## In one paragraph

A **recipe** describes a setting: horizontal **bands** (sky, sea, sand…), the **things** that can appear and the bands they belong in, their **size tier**, their real-world **habits** (hangs at eye level, stands against the wall, one per roof…), and a backdrop. Each picture is generated on the device: pick a recipe, choose which things appear and how many, place each group in its own cell of a **slot grid**, check the result with **`validateScene`** (and try again if anything is wrong), then draw it with `react-native-svg`. The same records that say what was placed (kind, count, colour, band, side, house numbers) are used to write the **questions**, so every answer is right by construction.

## Keeping these docs current

- `docs/recipes/reference.md` and `docs/questions-examples.md` are generated from the code: run `npm run docs:recipes` after changing a recipe or the questions.
- The other pages are written by hand. When a rule changes, update the matching page and add a line to [CHANGELOG.md](../CHANGELOG.md).
