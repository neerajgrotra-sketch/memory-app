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

**Saving it:** every levelled round saves the level it was played at and your level afterwards (`ladder` in `RoundResult`, `src/types/stats.ts`). Your current level is the last round's `after`, so it survives old rounds being trimmed from storage, and you always carry on where you left off.

**Daily challenge and streak** (`src/games/lookRemember/daily.ts`, the card at the top of the Games tab once you've played a round):

- **Streak:** days in a row with at least one finished round, in any mode. It stays alive all day until midnight ("Play today to keep your 3-day streak") and breaks only after a whole day without a round. Any round counts, not just the challenge: losing a streak after ten rounds because you skipped one picture would feel unfair. The best streak ever is kept (Progress tab). Days are the player's local calendar days.
- **Daily Challenge:** one picture a day, the same all day (seeded by the date, `dailySeed`), at your level, from every place you've reached (My places doesn't apply, so it's the day's picture). Double points (`DAILY_MULTIPLIER`), one try: afterwards the card shows "Done ✓" with your score until tomorrow, and opening it again goes straight back. It never changes your level or high score, like Practice, and is saved as `mode: 'daily'`.
- **Result screen:** the first round of the day shows "🔥 N-day streak!" (or "Day 1 of your streak"); the challenge always shows it, with a "Daily ×2" points chip.
- Everything is worked out from saved rounds, so there's nothing extra to store. `npm run check:daily` checks the rules, in two time zones.
- **Not yet:** reminders (they need notifications on a real phone build) and streak freezes.

**My places:** players can switch places off to train on the ones they choose (`src/games/lookRemember/places.ts`, saved as `placesOff` in the profile). Only places the current level has reached can be switched; the rest show a lock and their level. It's saved as the places switched *off*, so a newly unlocked place always joins, as the level-up screen promises. Levels play the reached places that are on; Practice plays every place that isn't off. If nothing would be left, everything allowed plays. Profiles from the old testing switch (`recipeFilter`, places switched *on*) are read as the matching `placesOff`. **Tester mode** (`profile.tester`, hidden: tap the version in Profile 7 times) treats every place as reached, for testing new places at any level.

**Starting again:** two ways, for different needs:

- **Start again from Level 1** (on the game page, under Play; asks first). Your level goes back to 1 but your rounds stay, so the high score, best level, charts and history are kept. The store saves when you started again (`statsStore.restart`, key `glance.restarts.v1`); `ladderStateOf(results, restartedAt)` then ignores levelled rounds from before that moment for your level, and keeps the best level ever. Shown only once you're past Level 1 or partway through it.
- **Delete all progress** (bottom of the Progress tab; tap twice). Deletes every round and every "start again": a clean slate.

**Players from before levels** (no levelled rounds yet) start at a level worked out from their Easy / Medium / Hard rounds: the hardest band where they averaged 3.5 or more over their last rounds (at least 3), Hard → Level 14, Medium → Level 8, Easy → Level 3, otherwise Level 1. The game page says so.

## What each level changes

`knobsForLevel(level)` returns the same settings the pictures and questions have always used (`LevelConfig` in `src/game/difficulty.ts`), changing in small steps:

| Setting | Level 1 | How it changes | Top |
| --- | --- | --- | --- |
| Kinds of thing | 5 | +1 every 4 levels | 9 from Level 17 |
| Most of one kind | 3 | 4 at Level 4, 5 at 10, 6 at 16 | 6 |
| View time | 10 s | −1 s about every 4 levels | 4 s from Level 24 |
| Places | the beach | living room at Level 2, park at 4, city street at 6, kitchen at 8, farm at 10, under the sea at 12, supermarket at 14, train station at 16, zoo at 18, snowy mountain at 20 | all eleven |
| House numbers | no | from Level 8 | |
| Hydrants in mixed colours | no | from Level 12 | |
| Close counting choices | no | from Level 14 | |
| Clock times (living room) | whole hours | half past from Level 8, quarter past and to from Level 18 | quarters |
| Questions asked first | object, colour | + count, position at Level 5; + number at 8; count, position, number from 18 | |

The scene checker plays levels 1, 4, 6, 8, 10, 12, 14, 17 and 30 on three phones with the places each has reached, and checks that no level is easier than the one before or asks for more than Hard.

**What's new** on the level-up screen is worked out from the difference between two levels' settings, so it's always true. Every level also raises what a right answer is worth, so there's always something.

**Titles** every 5 levels: Fresh Eyes (1), Sharp Eyes (5), Keen Observer (10), Detail Spotter (15), Eagle Eye (20), Total Recall (25), Photographic Memory (30).

**Known gap:** from about Level 20 only the view time and points change (the farm, at Level 10, was the first place added after launch). New places (recipes) and new kinds of question are what will make the top levels feel different, and they slot into `RECIPE_UNLOCKS` and `knobsForLevel`.

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

## Peeks

A Peek is a second look at the picture while answering (`src/games/lookRemember/peeks.ts`, `PeekView`).

- **Earning:** every 3,000 points (`PEEK_POINTS`), from any round, earns one. You hold at most 3 (`MAX_PEEKS`); points scored while full still count towards the next. Points scale with level, so Peeks come faster as levels get harder: a 4-of-5 round earns one every 5.8 rounds at Level 1, 3.4 at Level 10, 2.3 at Level 20 and 1.8 at Level 30.
- **Using:** **👀 Peek** on the question screen. The picture flips in over the question for 3 seconds (`PEEK_SECONDS`) with the countdown, held still, then flips away (a fade with "reduce motion" on). One per round, for the question on screen, and never in the Daily Challenge.
- **Why limits:** once you know the question, 3 seconds is plenty to check the answer, so an unlimited peek would turn a memory round into a search round. So a right answer after a peek earns half its points (`PEEKED_SHARE`), shown as a "👀 Peek −95" chip, and no ready-early bonus. It also can't tip a round into a good one: 4 right including the peeked one doesn't count towards a level up (5 right still does). The result screen marks the question "👀 Peeked".
- **Nothing extra stored:** the wallet is rebuilt from saved rounds (each round's points and `peeked`), so "Delete all progress" empties it. A peek used in a round you quit isn't saved, so it comes back. "Start again from Level 1" keeps your Peeks.
- **Never sold.** For a family brain-training game, peeks stay earned only.
- **Testing:** Tester mode (tap the version in Profile 7 times) has an **Unlimited Peeks** switch (`profile.testPeeks`): peek on any question, any number of times (**Peek · ∞**). Those peeks aren't recorded, so they never come off your earned Peeks. Each right answer after a peek still earns half points, and `scoreForLevel` (in `ladder.ts`) takes them all off before a round can count as good.
- `npm run check:peeks` checks the rules.

## Bands

For charts and the Progress tab's "By band" table, levels are grouped into the old names: **Easy** is Levels 1–7, **Medium** 8–17 (house numbers start at 8) and **Hard** 18–30 (mostly harder questions from 18). Practice rounds count in the band picked. (`BAND_LEVELS` and `bandOf` in `ladder.ts`.)

## Practice

Easy, Medium and Hard are the fixed settings from before levels (`LEVELS` in `src/game/difficulty.ts`), with every place. They earn points and never change your level.

## The result screen's buttons

| After | Main button | Also offered |
| --- | --- | --- |
| Going up a level | **Play Level N** | Done |
| A good round (4–5 right) | **Keep going · Level N** ("New picture, same level") | Done |
| A weaker round (0–3 right) | **Try again · Level N** ("New picture, same level") | **Same picture again**, Done |
| Same picture again | **New picture · Level N** ("Back to rounds that count") | Same picture again (after 0–3 right), Done |
| A Practice round | **Next picture** | **Same picture again**, Done |

**Same picture again** plays the picture you just saw with 5 different questions. It's practice: it earns points to show how you did, but never moves your level, never sets a high score and isn't counted as a perfect round (it's saved with `replay: true`). The second time round you know the picture and some answers, so counting it would make going up too easy. On levels it's only offered after a weaker round, when looking again is most useful.
