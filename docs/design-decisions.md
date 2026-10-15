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

## The player

- **The profile is asked for after the first round, not before**, and is optional. Every screen before the first picture loses players.
- **No health claims.** glance is a memory game. Progress compares a player only with themselves, and age bands only adjust the viewing time ("More time to look").
- **"I'm ready" is a button, not a tap on the picture**, because people touch the picture while studying it. It ignores taps for the first second.
