# Living room (`living-room`)

Code: `src/scenes/recipes/livingRoom.tsx`. Exact sizes, counts and colours: [reference](reference.md#living-room-living-room).

## Bands

- **What's happening:** one cat on its own may be asleep (eyes shut, "z"s); the window's curtains are open or closed.

| Band | Height | How things sit |
| --- | --- | --- |
| On the ceiling | 0–10% | no slots: a thin ceiling strip |
| On the wall | 10–55% | `wall`, 2 rows, at least 2 kinds. Things hang on lines: a clock high up (top row of slots), everything else at eye level (bottom row). |
| On the floor | 55–100% | `ground`, 3 rows of depth 0.4 : 0.3 : 0.3, 2 anchors first. The deep back row is for furniture against the wall; the front rows are for things out on the floor. |

## Things and their habits

- **Wall** (`hangAt`, the height of the centre above the floor line, in fractions of the width):

  | Thing | `hangAt` | Notes |
  | --- | --- | --- |
  | Picture frames | 0.34 | up to 2, one per stretch of wall; each shows hills and a lake, a sailing boat, flowers in a vase or a house and a tree ("What was in the picture frame?", asked with one frame) |
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
- **Table lamps** on little side tables, against the wall, spread apart (up to 2). Shade colours are asked as "the floor lamp's shade" and "the table lamp's shade", so the two never get mixed up.
- **The TV** has an aerial on top, so it isn't taken for a fish tank when it shows fish.
- **Out on the floor:** cats, dogs, balls, cushions, teddy bears, toy cars, piles of books, and two spills: a box of crayons spilled across the floor and a spilled cup with its puddle (kept off the rug, where the puddle wouldn't show).
- **Order:** furniture is chosen and placed before the toys, so a room always has at least two pieces of furniture and still has something out in front of them.
- **Wall clearance:** pictures and mirrors keep clear of the furniture, so they can hang above a sofa but never behind a TV or bookshelf.

## The rug

An oval at 50% across, 80% down, 72% of the width wide. Anything touching it must be fully on it (toy cars, pets, balls). Furniture, plants, lamps and piles of books (`avoidRug`) never touch it.

Rugs are solid pale colours, so every toy colour stands out on them.

In questions the rug is **"the carpet"** (`RUG.label`), the word players use. Each group records whether it's on it (`onRug`: all copies, none, or some), and laying the picture out again keeps that, so "Where were the dogs? On the carpet" stays true on every screen. Things on it are never the answer to "What was on the floor, in the middle?"; instead "What was on the carpet?" asks about them when one or two kinds are there ("A cat and a cushion"). The rug's outline is part of the background and never runs through anything.

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
| "Was the floor lamp on or off?" / "Was the table lamp on or off?" | from Level 8, one of them | On / Off (a lamp that's on has a bright yellow bulb with rays and a beam of light; off, a grey bulb) |
| "Which floor lamp was on?" / "Which table lamp was on?" | from Level 8, two of them | the one on the left / right / both / neither, as for the beach's coconuts |
| "What was the cat playing with?" | from Level 8, one cat | a ball of yarn, a toy mouse or a feather (`PET_TOYS`), with one of the dog's toys as a wrong answer |
| "What was the dog playing with?" | from Level 8, one dog | a bone, a rope toy or a sock, held in its mouth (no ball: balls are things of their own; a slipper looked like a paddle, and toys lying by its paws weren't clear) |
| "How many books were on the top / middle / bottom shelf?" | from Level 14 (`closeCounts`), one bookshelf | 1 to 5 books on each shelf, spaced so they can be counted; the nearest counts as wrong answers |
| "Where was the cat?" | from Level 8; no other cat in the room | a cat curled up on the sofa or the armchair (one of it): On the sofa / On the armchair / On the carpet / On the floor |
| "Where was the cat hiding?" / "Where was the dog hiding?" | from Level 20, asked first; none of that animal in the room | a cat behind the sofa (its head over the back), the potted plant, the armchair or the TV; a dog behind the armchair or the TV (out from the side facing the middle of the picture); less of it shows from Level 25. A dog never peeks over the sofa: its head is barely higher than its back, so it looked to be lying on it. The hiding cat is in `alsoSeen`, so it's never offered as "not in the picture". |
