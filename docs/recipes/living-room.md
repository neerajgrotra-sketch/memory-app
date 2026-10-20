# Living room (`living-room`)

Code: `src/scenes/recipes/livingRoom.tsx`. Exact sizes, counts and colours: [reference](reference.md#living-room-living-room).

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| On the ceiling | 0–10% | no slots: a thin ceiling strip |
| On the wall | 10–55% | `wall`, 2 rows, at least 2 kinds. Things hang on lines: a clock high up (top row of slots), everything else at eye level (bottom row). |
| On the floor | 55–100% | `ground`, 3 rows of depth 0.4 : 0.3 : 0.3, 2 anchors first. The deep back row is for furniture against the wall; the front rows are for things out on the floor. |

## Things and their habits

- **Wall** (`hangAt`, the height of the centre above the floor line, in fractions of the width):

  | Thing | `hangAt` | Notes |
  | --- | --- | --- |
  | Picture frames | 0.34 | up to 2, one per stretch of wall |
  | Mirror | 0.36 | |
  | Window | 0.36 | only one, since two would end up one above the other |
  | Clock | 0.52 | above everything else |

  Hung things share one line, so pictures are never stacked in a pyramid.
- **Against the wall** (`backRow`: feet where the floor meets the wall, backs over the wall):
  - the sofa: extra large, about 2 m wide against the room
  - armchairs, spread apart
  - the TV, on its stand
  - potted plants, spread along the wall.
- **Tall anchors** against the wall: bookshelves and floor lamps, spread apart.
- **Out on the floor:** cats, dogs, balls, cushions, teddy bears, toy cars, piles of books, and two spills: a box of crayons spilled across the floor and a spilled cup with its puddle (kept off the rug, where the puddle wouldn't show).
- **Order:** furniture is chosen and placed before the toys, so a room always has at least two pieces of furniture and still has something out in front of them.
- **Wall clearance:** pictures and mirrors keep clear of the furniture, so they can hang above a sofa but never behind a TV or bookshelf.

## The rug

An oval at 50% across, 80% down, 72% of the width wide. Anything touching it must be fully on it (toy cars, pets, balls). Furniture, plants, lamps and piles of books (`avoidRug`) never touch it.

Rugs are solid pale colours, so every toy colour stands out on them. The rug's outline is part of the background and never runs through anything.

## Backdrop

- **Background:** ceiling strip, wall, skirting board, floor and rug.
- **Marks:** faint floorboard lines (30%), broken around anything standing on them and kept off the rug.

## Colour schemes

`cream`, `blue` and `sage`: wall, ceiling, floor and rug colours.

## Questions it gives

Counts and colours, positions ("On the wall, in the middle"), "What was on the wall, on the right?" when only one kind is there, and in / NOT in the picture. Plus questions about the picture's details (`details` and `fitDetails`):

| Question | When | Answers |
| --- | --- | --- |
| "What time was on the clock?" | every level, with the clock | the time, and times close to it |
| "What was on the television?" | from Level 8, with the TV | Nothing, it was off / A cartoon / A football match / Fish swimming (`TV_SHOWS`, all four happen) |
| "Was the floor lamp on or off?" | from Level 8, one floor lamp | On / Off (a lamp that's on has a glow and light spilling down) |
| "Which floor lamp was on?" | from Level 8, two floor lamps | the one on the left / right / both / neither, as for the beach's coconuts |
| "What was the cat playing with?" | from Level 8, one cat | a ball of yarn, a toy mouse or a feather (`PET_TOYS`), with one of the dog's toys as a wrong answer |
| "What was the dog playing with?" | from Level 8, one dog | a bone, a rope toy or a slipper (no ball: balls are things of their own) |
| "How many books were on the top / middle / bottom shelf?" | from Level 14 (`closeCounts`), one bookshelf | 1 to 5 books on each shelf, spaced so they can be counted; the nearest counts as wrong answers |
| "Where was the cat hiding?" | from Level 20, asked first; no cat in the room | behind the sofa (its head over the back) or behind the potted plant (peeking out towards the middle of the picture); less of it shows from Level 25. Never a dog: its head is barely higher than its back, so it looked to be lying on the sofa. The hiding cat is in `alsoSeen`, so it's never offered as "not in the picture". |
