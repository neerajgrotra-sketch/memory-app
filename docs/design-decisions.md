# Design decisions

Why the rules are what they are. Most came from play-testing: a screenshot showed something wrong, and the fix became a rule that the checker now enforces for every picture. See [CHANGELOG.md](../CHANGELOG.md) for when each change landed.

## Layout

- **Fixed size tiers instead of perspective.** The first versions scaled things by real-world height and camera perspective. Things ended up tiny, inconsistent, and "floating". The picture-book approach is clearer at a glance: one size per kind, measured against the screen width, and never under 44 pt.
- **An extra-large tier for vehicles and the sofa.** With only the original tiers (up to 28%), a bus came out shorter than a person and a door, like a toy. Some things have to be big for the picture to make sense.
- **A slot grid, not free placement.** Random positions caused bunching and big empty areas. Every group gets its own cell, emptiest part of the picture first, and each band gets a share of the things by height.
- **Every third of the screen has something**, and copies are staggered or well apart, never touching in a line.

## Real-world habits

- **Things must be where they'd really be.** Rules that passed the overlap checks still produced nonsense:
  - a boat on the sand
  - flags and satellite dishes on walls
  - a clock bracketed to the middle of a wall
  - pictures stacked in a pyramid
  - a sofa in the middle of the floor
  - two street lamps side by side
  - a bicycle standing on its own
  - two fire hydrants next to each other.

  Each became a habit (`hangAt`, `backRow`, `spread`, `frontRow`, `flush` roofs, `keepClear` doors) with a check in `validateScene`.
- **Against the wall means at the wall line.** Furniture stands with its feet where the floor meets the wall and its back over the wall, as it would in a real room.
- **Traffic goes one way.** Vehicles drive in one direction, and every vehicle drawing faces right. The car was originally drawn backwards, which made a car and a scooter look like they were heading at each other.
- **Moving scooters have riders; parked bicycles lean on walls.**
- **Hydrants are spaced along the kerb**, one per building, and can differ in colour on Hard.

## The backdrop

- **Building fronts are always complete.** An early version left windows and doors out wherever something stood in front of them, so buildings looked broken. Now the fronts are fixed, and tall street things are kept short enough not to cover them.
- **Doors, windows and house numbers are worked out from the band lines**, and the checker fails if any overlap. A change to the band lines once made doors run into windows.
- **Wide screens get more street, not stretched buildings.**
- **Clouds are white**, as scenery. The general "faint marks" rule had turned them pink on a sunset sky.

## Contrast

- **Outlines in each thing's own darker colour, plus a lightness rule.** White buoys on blue water and green toy cars on a mauve rug were hard to see. Buoys got a bold band, and rugs became solid pale colours.

## Questions

- **Questions come only from the scene's facts**, so they are right by construction. Re-layout for a different screen size never changes the facts.
- **"In the picture", not "on the beach".** Players read "on the beach" as "on the sand", so things in the sea or sky felt like trick answers.
- **Every option is shown after the round**, with your pick and the answer marked, and the picture can be enlarged, so players can see exactly what they missed.
- **No giveaway questions.** "How many mirrors?" was always 1, because a room never has two, so things that can only appear once aren't counted. Plural wrong options only use things that can come in groups (never "Suns"). Both were found by reading the generated [question examples](questions-examples.md).
- **House numbers** add Medium and Hard questions that test detail. They rise along the street with uneven gaps, so remembering one doesn't give away the others.

## Games, levels and points

- **A games app, not one game.** The Games tab groups games by skill, like the brain-training apps people know, but a skill shows only when it has a game. Empty "coming soon" rows make an app feel unfinished.
- **Levels that adjust themselves** replaced picking Easy / Medium / Hard. Picking your own difficulty is a guess; a level that follows how you play keeps every round at the edge of what you can do, and the level ring makes progress visible. Easy / Medium / Hard stay as Practice, which never moves your level.
- **Up is earned, down is rare.** 3 good rounds go up; only 2 very poor rounds in a row go down, and best level never drops. One unlucky picture should never cost a level.
- **"What's new" is worked out, never written.** The level-up screen lists exactly what changed between the two levels' settings, so it can't promise something that isn't there. An early version said "trickier questions" on a level where nothing changed.
- **Points reward accuracy, not speed.** Right answers (worth more at higher levels), runs of right answers, and being ready early score; slow answers never cost points. A score that punished slowness would push players to guess and put off older players.
- **No overall "brain score" and no comparing with other people.** Level, points and trends compare you only with yourself. A single brain index would read as a health measure, which glance isn't.
- **A launch animation, kept short.** About 1.5 seconds, once per launch, tap to skip, and none with Reduce Motion. People open the app several times a day; a long intro gets in the way by the second day. The eye blinking once ("taking its glance") says what the app is about without words. The native splash is the same plain background, so the hand-over doesn't flash.
- **Sounds sparingly.** Only for moments that matter (answers, the last seconds, level up, high score), never on ordinary taps and no music; quiet volumes; a phone on silent stays silent; vibration alongside on phones. Each sound is a file with a fixed name so a better pack can replace it without code changes.
- **Our own look.** The layout borrows a familiar structure (a big "carry on" card, games by skill, a game page with records), but keeps glance's dark theme and amber accent, and the art is drawn by the game itself.

## The player

- **The profile is asked for after the first round, not before**, and is optional. Every screen before the first picture loses players.
- **No health claims.** glance is a memory game. Progress compares a player only with themselves, and age bands only adjust the viewing time ("More time to look").
- **"I'm ready" is a button, not a tap on the picture**, because people touch the picture while studying it. It ignores taps for the first second.
