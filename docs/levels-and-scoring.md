# Levels and scoring (Look & Remember)

How a player's level moves, what each level changes, and how points are worked out. The code is in `src/games/lookRemember/ladder.ts` and `src/games/lookRemember/points.ts`; the full table of every level is generated into [recipes/reference.md](recipes/reference.md#levels) by `npm run docs:recipes`.

## Moving up and down

| Round | What happens |
| --- | --- |
| **Good** (4 or 5 of 5 right) | +1 towards the next level. The 3rd good round takes you up a level. |
| **Middle** (2 or 3 right) | No change, but it ends a run of very poor rounds. |
| **Very poor** (0 or 1 right) | Nothing on its own. The 2nd in a row takes you back one level. |

- Good rounds don't need to be in a row: middle and poor rounds never take them away.
- Going down a level starts the count for the next level again, and says so kindly ("Back to Level 5 for now… you'll climb back").
- Levels run from 1 to 30. Your **best level** never goes down; at 30 the ring stays full.
- The **level ring** has 3 segments, one per good round needed, filled for the ones you have.

**Why this shape:** going up should feel earned but reachable (3 good rounds is a few minutes of play). Going down should be rare and never caused by one unlucky picture. That's why it needs two very poor rounds in a row, and why 2–3 right never costs anything.

**Saving it:** every levelled round saves the level it was played at and your level afterwards (`ladder` in `RoundResult`, `src/types/stats.ts`). Your current level is the last round's `after`, so it survives old rounds being trimmed from storage, and resetting progress starts you again at Level 1.

**Players from before levels** (no levelled rounds yet) start at a level worked out from their Easy / Medium / Hard rounds: the hardest band where they averaged 3.5 or more over their last rounds (at least 3), Hard → Level 14, Medium → Level 8, Easy → Level 3, otherwise Level 1. The game page says so.

## What each level changes

`knobsForLevel(level)` returns the same settings the pictures and questions have always used (`LevelConfig` in `src/game/difficulty.ts`), changing in small steps:

| Setting | Level 1 | How it changes | Top |
| --- | --- | --- | --- |
| Kinds of thing | 5 | +1 every 4 levels | 9 from Level 17 |
| Most of one kind | 3 | 4 at Level 4, 5 at 10, 6 at 16 | 6 |
| View time | 10 s | −1 s about every 4 levels | 4 s from Level 24 |
| Places | the beach | living room at Level 3, city street at 6 | all three |
| House numbers | no | from Level 8 | |
| Hydrants in mixed colours | no | from Level 12 | |
| Close counting choices | no | from Level 14 | |
| Questions asked first | object, colour | + count, position at Level 5; + number at 8; count, position, number from 18 | |

The scene checker plays levels 1, 4, 6, 8, 12, 14, 17 and 30 on three phones with the places each has reached, and checks that no level is easier than the one before or asks for more than Hard.

**What's new** on the level-up screen is worked out from the difference between two levels' settings, so it's always true. Every level also raises what a right answer is worth, so there's always something.

**Titles** every 5 levels: Fresh Eyes (1), Sharp Eyes (5), Keen Observer (10), Detail Spotter (15), Eagle Eye (20), Total Recall (25), Photographic Memory (30).

**Known gap:** from about Level 20 only the view time and points change. New places (recipes) and new kinds of question are what will make the top levels feel different, and they slot into `RECIPE_UNLOCKS` and `knobsForLevel`.

## Points

| Part | Rule | Example (Level 1, 4 right: ✓✓✕✓✓, ready 3.5 s early) |
| --- | --- | --- |
| Right answers | each worth 100 + 10 × (level − 1) | 4 × 100 = 400 |
| In a row | each right answer in a run adds 20 × (its place in the run − 1): the 2nd +20, the 3rd +40… | +20 (2nd) +20 (2nd of the next run) = 40 |
| Ready early | 5 × whole spare seconds × right answers | 5 × 3 × 4 = 60 |
| **Total** | | **500** |

- A perfect round at Level 1 is 700 points (500 + 200 in a row), about 900 if you're ready after a second or two. At Level 30 a perfect round is 2,150 before the ready bonus.
- **No penalty for slow answers.** Racing the answers would stress slower and older players and reward guessing. The ready bonus scales with right answers, so tapping ready at once and guessing earns little.
- **High score** is the best points in one round, over levelled and Practice rounds. "New high score!" shows only when you beat an earlier one.
- **Practice** rounds use the level they play like: Easy 2, Medium 9, Hard 18.

## Practice

Easy, Medium and Hard are the fixed settings from before levels (`LEVELS` in `src/game/difficulty.ts`), with every place. They earn points, never change your level, and offer **Play again** (the same picture with other questions). Levelled play doesn't offer Play again, because seeing a picture twice would make going up too easy.
