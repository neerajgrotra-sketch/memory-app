# Design decisions

Why the rules are what they are. Most came from play-testing: a screenshot showed something wrong, and the fix became a rule that the checker now enforces for every picture. See [CHANGELOG.md](../CHANGELOG.md) for when each change landed.

## Layout

- **Fixed size tiers instead of perspective.** The first versions scaled things by real-world height and camera perspective. Things ended up tiny, inconsistent, and "floating". The picture-book approach is clearer at a glance: one size per kind, measured against the screen width, and never under 44 pt. Each place has one real-world scale (1 m ≈ 0.115 of the width in wide outdoor places, 0.22 in the classroom), so neighbours are in proportion.
- **Depth where a place clearly has it.** In the classroom the row nearest us is drawn about 1.25 times bigger than the front of the room: with one flat scale, the nearest pupil looked tiny next to the teacher's desk across the room. The same rule may suit the outdoor places next.
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

## Making pictures believable

Rules that pass every overlap and contrast check can still show something that never happens. These came from testers' screenshots:

- **Animals only in their own habitat.** A penguin on grass looked wrong. Each zoo enclosure has a habitat (grassland, sand, rocks, or snow and ice) and every animal only goes where it lives (`fits`), checked on every picture.
- **Signs must match the picture.** The zoo's feeding-time sign once named elephants with no elephant in the zoo. Now it names an animal that's really there, and an arrow points at its enclosure (`fitDetails`). The mountain's warning sign says "DANGER" and the animal in words; coloured dots alone confused players.
- **A warning sign warns about something real.** On harder levels the snowy mountain's danger animal peeks out from behind the tree, the snowmobile or the stand, so "DANGER Bear" means a bear you can find ("Where was the bear hiding?"). It peeks rather than hides fully, so it's fair, and shows less at higher levels.
- **Faraway things are drawn small**, through the airport window or in the Moon's sky (`faraway`), and questions never relate them to things nearby ("above the crater: a satellite").
- **Fixed things don't float.** Things in an air band bob gently while you look, which suits birds and balloons but made the station clock and lamps look loose. They stay still (`still`), and their rods run up off the top of the picture (`hanger`), like the departure board's wires. The sun, the moon and the Earth stay still too.
- **One thing where two would look broken.** The teacher and their desk were separate, so a desk often stood empty. They're one thing now: the teacher stands behind their desk. Pupils face the board, so we see the backs of their heads.
- **A place needs what makes it that place.** A kitchen with no cooker had saucepans steaming on a bare worktop; a canoe sat on the grass with no water in sight. The backdrop now carries an oven and a sink, and a lake behind the pitches.
- **Feet where they'd really stand.** A `tall` thing stands with its feet at the very back of its band; on the beach that's the waterline, so palm trees seemed to grow in the sea. Sheep wandered into the crop field among the scarecrows. A submarine drawn the size of a diver looked like a toy. A cable car hung from its own short stub of cable; now one cable crosses the whole sky.
- **Small things need lighter outlines.** The hanging basket's flowers read as fruit at 50 pt, because every petal got the same thick outline as a bus. Its leaves have none and its petals a thin one.
- **Words, numbers and maps are never mirrored** (`noFlip`): a racer's bib, the NEWS stand, the world map, every clock. Copies are often flipped for variety, and a mirrored "NEWS" read as "SWEN".

## The art

- **Richer drawings, same boxes.** Every thing keeps its size and shape; detail (light and shade, texture, small parts) goes on top in white or black at low opacity, with no outline. So every layout and contrast check still holds, and the asked-about colour stays the main fill.
- **Look at it zoomed in before shipping.** Several details read as something else at phone size (a zebra's mane as a slash, a whiteboard smudge as a stray curve, snow covering the roof whose colour is asked about) and were taken out before release.

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

- **A games app, not one game.** The Games tab groups games by skill, like the brain-training apps people know, but a skill shows only when it has a game. Empty "coming soon" rows make an app feel unfinished. Planned games appear as "Coming soon" tiles in tester mode only, to preview the layout.
- **Each game's progress lives on its own row.** A "Continue" strip per game would push the games down the screen as players take up more of them, and a sideways row of cards hid games off the edge. So every game gets one full-width row (picture, level ring, Play), grouped by skill, and the game played last comes first in its skill, marked "Continue". The home screen stays the same length however many games you play. Next: the daily card should become a daily workout across games.
- **Levels that adjust themselves** replaced picking Easy / Medium / Hard. Picking your own difficulty is a guess; a level that follows how you play keeps every round at the edge of what you can do, and the level ring makes progress visible. Easy / Medium / Hard stay as Practice, which never moves your level.
- **Up is earned, down is rare.** 3 good rounds go up; only 2 very poor rounds in a row go down, and best level never drops. One unlucky picture should never cost a level.
- **"What's new" is worked out, never written.** The level-up screen lists exactly what changed between the two levels' settings, so it can't promise something that isn't there. An early version said "trickier questions" on a level where nothing changed.
- **One cost for a Peek, not two.** A peeked answer earns half points, and that's all: it used to also stop the round counting towards a level up, and testers felt punished twice for a Peek they'd earned. Scarcity (earned, at most 3, one a round) keeps Peeks from carrying anyone up the levels.
- **Points reward accuracy, not speed.** Right answers (worth more at higher levels), runs of right answers, and being ready early score; slow answers never cost points. A score that punished slowness would push players to guess and put off older players.
- **No overall "brain score" and no comparing with other people.** Level, points and trends compare you only with yourself. A single brain index would read as a health measure, which glance isn't.
- **A launch animation, kept short.** About 1.5 seconds, once per launch, tap to skip, and none with Reduce Motion. People open the app several times a day; a long intro gets in the way by the second day. The eye blinking once ("taking its glance") says what the app is about without words. The native splash is the same plain background, so the hand-over doesn't flash.
- **Sounds sparingly.** Only for moments that matter (answers, the last seconds, level up, high score), never on ordinary taps and no music; quiet volumes; a phone on silent stays silent; vibration alongside on phones. Each sound is a file with a fixed name so a better pack can replace it without code changes. The current files are placeholders (a free interface pack plus two generated sounds, mono and low bit rate); the next step is one cohesive, professionally made set. Background music is parked for now.
- **People stay neutral.** Hair and clothes never look like a religious or cultural head covering by accident. A bun on top of the head read as a patka to one tester, so the third hairstyle is a ponytail at the back. Hats only where the place calls for them (a bobble hat on the snowy mountain, a farmer's straw hat).
- **A tick that's late is worse than no tick.** The countdown's tick has to land on its number, or the timer feels broken. On phones every sound is copied onto the phone and kept rewound and ready in two players that take turns, and iPhone's audio session stays on between sounds (`src/feedback/player.ts`). In the browser, sounds are decoded up front and played with Web Audio (`player.web.ts`).
- **A back button that can't hide.** On a real iPhone, players couldn't find their way back from the game page: a see-through arrow over the picture blended in and scrolled away. Back buttons are solid, labelled with where they go ("← Games"), and stay fixed at the top.
- **The welcome shows once.** A "Let's go" screen on every launch would add a tap for nothing; it appears on the first launch only, then the eye animation goes straight in.
- **Our own look.** The layout borrows a familiar structure (a big "carry on" card, games by skill, a game page with records), but keeps glance's dark theme and amber accent, and the art is drawn by the game itself.

## The player

- **The profile is asked for after the first round, not before**, and is optional. Every screen before the first picture loses players.
- **No health claims.** glance is a memory game. Progress compares a player only with themselves, and age bands only adjust the viewing time ("More time to look").
- **"I'm ready" is a button, not a tap on the picture**, because people touch the picture while studying it. It ignores taps for the first second.
