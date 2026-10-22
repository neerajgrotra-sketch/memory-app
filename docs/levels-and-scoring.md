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
- **Daily Challenge:** one picture a day, the same all day (seeded by the date, `dailySeed`), at your level, from every place you've reached (My places doesn't apply, so it's the day's picture). Double points (`DAILY_MULTIPLIER`), one try (a Daily closed part way through resumes at its questions, see [Resuming a round](#resuming-a-round)): afterwards the card shows "Done ✓" with your score until tomorrow, and opening it again goes straight back. It never changes your level or high score, like Practice, and is saved as `mode: 'daily'`.
- **Result screen:** the first round of the day shows "🔥 N-day streak!" (or "Day 1 of your streak"); the challenge always shows it, with a "Daily ×2" points chip.
- Everything is worked out from saved rounds, so there's nothing extra to store. `npm run check:daily` checks the rules, in two time zones.
- **Not yet:** reminders (they need notifications on a real phone build) and streak freezes.

**My places:** players can switch places off to train on the ones they choose (`src/games/lookRemember/places.ts`, saved as `placesOff` in the profile). Only places the current level has reached can be switched; the rest show a lock and their level. It's saved as the places switched *off*, so a newly unlocked place always joins, as the level-up screen promises. Levels play the reached places that are on; Practice plays every place that isn't off. If nothing would be left, everything allowed plays. Profiles from the old testing switch (`recipeFilter`, places switched *on*) are read as the matching `placesOff`. **Tester mode** (`profile.tester`, hidden: tap the version in Profile 7 times) treats every place as reached, for testing new places at any level.

**Starting again:** two ways, for different needs:

- **Start again from Level 1** (on the game page, under Play; asks first). Your level goes back to 1 but your rounds stay, so the high score, best level, charts and history are kept. The store saves when you started again (`statsStore.restart`, key `glance.restarts.v1`); `ladderStateOf(results, restartedAt)` then ignores levelled rounds from before that moment for your level, and keeps the best level ever. Shown only once you're past Level 1 or partway through it.
- **Delete all progress** (bottom of the Progress tab; tap twice). Deletes every round and every "start again": a clean slate.

**Players from before levels** (no levelled rounds yet) start at a level worked out from their Easy / Medium / Hard rounds: the hardest band where they averaged 3.5 or more over their last rounds (at least 3), Hard → Level 14, Medium → Level 8, Easy → Level 3, otherwise Level 1. The game page says so.

## What each level changes

Every level brings one named new thing, shown on the level-up screen (`unlocksAt`): a place on the even levels, and on the odd ones a kind of question, a twist or a step in time or fullness. `knobsForLevel(level)` in `src/games/lookRemember/ladder.ts` sets them, spread out so none bunch up and no level is a jump (4.4.0; before that, ten levels brought only points, Level 2 was a little easier than Level 1, and the shift to hard questions all came at Level 18).

| Level | New | Level | New |
| --- | --- | --- | --- |
| 1 | The beach: what was there, colours, how many, true or false | 16 | The train station · up to 6 of one kind · 6 s |
| 2 | The living room · up to 4 of one kind · 9 s to look · "Where was it?" questions | 17 | 9 kinds of thing · clocks at quarter past and to |
| 3 | Questions about details: clocks, signs, what was on TV | 18 | The zoo · fewer colour questions |
| 4 | The park · more on how many and where | 19 | Hiding animals show less of themselves |
| 5 | 6 kinds of thing · two-step questions ("Only one kind of thing was on the pond. What colour was it?") | 20 | The snowy mountain · fewer "what was there" questions |
| 6 | The city street, with house numbers and colours | 21 | 5 s to look |
| 7 | Clocks at half past | 22 | The classroom |
| 8 | The kitchen · more on numbers and times · 8 s | 23 | Mostly harder questions: how many, where and numbers |
| 9 | 7 kinds of thing · above and below questions | 24 | The campsite at night |
| 10 | The farm · up to 5 of one kind | 25 | 4 s to look |
| 11 | Closer choices when counting · sums: "How many … and … altogether?" | 26 | The airport |
| 12 | Under the sea · 7 s | 27 | Sums: "How many more … than …?" |
| 13 | Animals hiding in the picture | 28 | The Moon, out in space |
| 14 | The supermarket · 8 kinds of thing | 29 | Sharing (division): "If the … were split into two equal groups, how many in each?" |
| 15 | Things in mixed colours (fish, sheep, plates, juice, hydrants) | 30 | *(kept for a final round)* |

- **Kinds of question** come in one by one (`FAMILY_FROM`, as `LevelConfig.families`): what was there, not there, colour, same colour, true or false, how many / more or fewer / the most, and what was happening (story questions: the kettle steaming, the person's hat) from Level 1; where from 2; details from 3; two-step from 5; above and below from 9; altogether from 11; how many more from 27; sharing from 29. Practice asks everything.
- **The question mix** (`preferredTypes`) moves in steps, at 4, 8 and 18, then "what was there" questions fade out in two: at most one a round from 20 (`typeCaps`), no longer preferred from 23. The share of hard questions (where, above / below, details) climbs from 0% to about 50% by at most about 7 points a level (one step at 23 used to be 15).
- **Time and fullness:** look time 10 s, then 9 (2), 8 (8), 7 (12), 6 (16), 5 (21), 4 (25); kinds of thing 5, then 6 (5), 7 (9), 8 (14), 9 (17); most of one kind 3, then 4 (2), 5 (10), 6 (16). The seconds of looking per thing fall from 1.3 to 0.35 and never rise from one level to the next.
- **No repeats in a row:** a round avoids the wordings (`Question.template`) of the round before ("How many … were there?" twice running), even over a less preferred question.
- Level 30 (`LEVELS_TO_FILL`) is kept for the final round still to come.

`npm run check:levels` keeps this true: something new on every level, no level easier than the one before (looking time per thing), no jump of more than 10 points in hard questions, no kind of question before its level, and 10-round sessions where no wording is asked much more than its share. The scene checker plays levels 1, 3, 4, 6, 8, 10, 13, 15, 17 and 30 on three phones with the places each has reached, and checks that no level asks for more than Hard.

**What's new** on the level-up screen is worked out from the difference between two levels' settings, so it's always true. Every level also raises what a right answer is worth.

**Titles** every 5 levels: Fresh Eyes (1), Sharp Eyes (5), Keen Observer (10), Detail Spotter (15), Eagle Eye (20), Total Recall (25), Photographic Memory (30).

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
- **Why limits:** once you know the question, 3 seconds is plenty to check the answer, so an unlimited peek would turn a memory round into a search round. So a right answer after a peek earns half its points (`PEEKED_SHARE`), shown as a "👀 Peek −95" chip, and no ready-early bonus. That's the only cost: the round counts towards your level as usual. (Until 4.0.6 a peeked answer also couldn't tip a round into a good one, so 4 right with a peek didn't count; players felt punished twice for a Peek they'd earned. Peeks are already scarce: earned with points, at most 3 held, one a round, none in the Daily Challenge.) The result screen marks the question "👀 Peeked".
- **Nothing extra stored:** the wallet is rebuilt from saved rounds (each round's points and `peeked`), so "Delete all progress" empties it. A peek used in a round you quit isn't saved, so it comes back. "Start again from Level 1" keeps your Peeks.
- **Never sold.** For a family brain-training game, peeks stay earned only.
- **Testing:** Tester mode (tap the version in Profile 7 times) has an **Unlimited Peeks** switch (`profile.testPeeks`): peek on any question, any number of times (**Peek · ∞**). Those peeks aren't recorded, so they never come off your earned Peeks. Its **Peek time** setting (1 to 5 seconds, `profile.peekSeconds`, read through `peekSecondsFor` in `peeks.ts`) changes how long a Peek shows the picture, to find the best length; each peeked round saves the length used (`peekSeconds`). Each right answer after a peek still earns half points, and the round counts for your level as usual.
- **Won:** a Super Speed Round also wins Peeks (below).
- `npm run check:peeks` checks the rules.

## Super Speed Round

A surprise bonus round (`src/games/lookRemember/speed.ts`, `SpeedRound`), to break up the rhythm of round after round.

- **When:** in Levels, from Level 5, after every 4 to 6 rounds (`speedCounterOf`, `speedDue`). Replays and Practice rounds don't count, and it never comes in the Daily Challenge or Practice. The gap is picked from the last speed round's id (`speedGap`), so it changes each time but stays the same if you close the app and come back. It comes when you tap the button for the next picture, before that picture.
- **The intro:** a lightning bolt springs in on spinning rays with a flash (just the picture with "reduce motion" on), then "Super Speed Round", one line on what to do and what you can win. Nothing starts until you tap **Start**.
- **The round:** a new picture of its own (a different place from the last), looked at as usual, then 8 Yes or No questions with 4 seconds each (6 with "More time to look"), against a draining bar. Running out of time counts as wrong. After each answer it says "Right!" or "No, it was Yes" for half a second and moves on: no skipping, no Peeks.
- **The questions** (`speedQuestions`) are the picture's own questions, so each answer is always right: the kinds that are quick to read (what was there, how many, what colour, true or false, details and "what was happening?"), never "Which of these…" or "more boats or more kites?". A question with options becomes the question and one guess, either its answer or one of its wrong options ("How many birds were there? 3?"); a true-or-false one is just the statement ("The bus was yellow."). Each is about something different (failing that, never the same thing asked the same way twice, so one can't give another away) and about half are Yes. Pictures that don't give 8 (about 1 in 50) are passed over for another; after four tries the round is skipped.
- **Prizes** (`speedPrize`): 8 of 8 wins a Peek and a 50:50, 7 of 8 a Peek, and 6 or more bonus points (two answers' worth). A Peek or 50:50 you have no room for becomes bonus points instead. Each right answer earns half an answer's points.
- **Never counts against you:** the round is saved (`speed: true`, with `bonus` for prizes) but never moves your level or counts for the high score, perfect rounds or the Progress tab. Its points count towards Peeks as usual.
- **Sounds** (`assets/sounds/speed-*.mp3`): the lightning's zap and thunder with the intro, racing notes on Start, a tick on each question's last two seconds, a buzzer for too slow, and a fanfare for a prize.
- **Testing:** tester mode's **Speed Round every round** switch brings one as soon as you tap Play and before every picture, at any level.
- `npm run check:speed` checks the questions on 1,500 pictures, the timing, the prizes and 50:50s.

## 50:50

A second lifeline, won in a Super Speed Round: it takes away two wrong answers (one when there are three).

- **Using:** **50:50 · n** on the question screen, next to the Peek, once you hold one (it takes the place of the question-type chip). One per round, not on a question with two answers, never in the Daily Challenge. The answers it takes away are picked from the question's id (`fiftyHidden`), so a resumed round shows the same ones.
- **The cost:** like a Peek, a right answer after a 50:50 earns half its points ("50:50 −95" on the result screen, which marks the question "50:50"); the round counts for your level as usual.
- **Holding:** at most 2 (`MAX_FIFTY`). Worked out again from saved rounds like Peeks (`fiftyOf`: a round's `fifty` spends one, a speed round's `bonus.fifty` wins one).

## Bands

For charts and the Progress tab's "By band" table, levels are grouped into the old names: **Easy** is Levels 1–7, **Medium** 8–17 (house numbers start at 8) and **Hard** 18–30 (mostly harder questions from 18). Practice rounds count in the band picked. (`BAND_LEVELS` and `bandOf` in `ladder.ts`.)

## Practice

Easy, Medium and Hard are the fixed settings from before levels (`LEVELS` in `src/game/difficulty.ts`), with every place. They earn points and never change your level.

## Resuming a round

A round closed part way through can be resumed (`src/games/lookRemember/savedRound.ts`): the round in progress is saved on the phone after every answer, with its picture, questions, answers so far and any Peek used.

- **Only the questions resume, never the picture.** Remembering the picture is the game, so a resumed round goes straight to its next unanswered question. Coming back later only makes the questions harder, so it can't be used to do better. A Peek still works if one is left (a Peek used before closing stays used).
- **Levels and Practice** are saved once the questions start, and shown on a **Resume** card at the top of the Games tab. A round closed while looking at the picture is simply dropped: there's nothing to lose but a few seconds. Starting another round while one is saved asks "Resume round" or "Start a new round" (which loses it). A saved round lasts 24 hours, and "Start again" on the game page drops it.
- **The Daily Challenge** is saved from the moment its picture shows, and the daily card says **Resume** ("In progress · 3 of 5 answered"). Closed while looking, it comes back at the questions: before 4.3.0 a Daily quit part way wasn't saved at all, so it could be played again with the same picture already seen. It lasts until midnight; a Daily not finished by then is missed.
- **✕ asks first** during the questions ("Leave this round? Your answers are saved…"), and while looking at the Daily ("You've seen the picture, so when you come back it goes straight to the questions"). Leaving a Levels picture while looking doesn't ask.
- **The countdown pauses** while the app is in the background (a phone call, switching apps), and carries on from where it was. Time away doesn't count as looking for the ready-early bonus.
- Points, level, streak and Peeks earned count as for any round.

## The result screen's buttons

| After | Main button | Also offered |
| --- | --- | --- |
| Going up a level | **Play Level N** | Done |
| A good round (4–5 right) | **Keep going · Level N** ("New picture, same level") | Done |
| A weaker round (0–3 right) | **Try again · Level N** ("New picture, same level") | **Same picture again**, Done |
| Same picture again | **New picture · Level N** ("Back to rounds that count") | Same picture again (after 0–3 right), Done |
| A Practice round | **Next picture** | **Same picture again**, Done |

**Same picture again** plays the picture you just saw with 5 different questions. It's practice: it earns points to show how you did, but never moves your level, never sets a high score and isn't counted as a perfect round (it's saved with `replay: true`). The second time round you know the picture and some answers, so counting it would make going up too easy. On levels it's only offered after a weaker round, when looking again is most useful.
