# Layout rules

Constants live in `src/scenes/layout.ts` unless noted. Placement is in `src/scenes/generateScene.ts` (`place`, `placeSpread`, `verticalSpot`). Every rule is checked again, independently, by `validateScene` (`src/scenes/validateScene.ts`).

All distances are in **width units** (fractions of the picture width) unless they say "of the height".

## Sizes

Every thing has a `tier` and a fixed `size` (its width). Copies of a kind are always the same size.

| Tier | Width | Examples |
| --- | --- | --- |
| `xl` | 30–62% | bus, van, car, sofa, so they look right next to people and doors |
| `large` | 20–28% | beach umbrella, sailboat, palm tree, bookshelf, TV, window, market stall |
| `medium` | 13–18% | plane, kite, floor lamp, plant, mirror, clock, dolphin, cushion, bicycle |
| `small` | 10–13% | ball, starfish, buoy, bird, toy car, bucket, person, fire hydrant |

Nothing is drawn narrower than **44 pt** on screen (`MIN_POINTS`): `itemWidth = max(size, 44 / screen width)`. Height follows from the drawing's design box (`h / w`).

## Bands

A recipe's `zones` split the picture into horizontal bands (`top`, `bottom` as fractions of the height). Each band has:

- `surface`:
  - `air`: floats anywhere in its slot (sky, the sea for floating things)
  - `wall`: hung things
  - `ground`: stands near the bottom of its slot row
- `rows`: slot rows. 0 means no things go there (the room's ceiling, the city's building fronts). `rowSizes` gives rows different depths.
- optional settings:
  - `minGroups` / `maxGroups`: the fewest and most kinds
  - `anchors`: furniture first (and the classroom's front always gets the teacher or the bookcase)
  - `flush`: things stand exactly on its bottom line (rooftops)
  - `panels`: things stay inside their own third (rooftops)
  - `oneWay`: everything faces the same way (road traffic).
  - `faraway`: everything here is a long way off (space seen from the Moon, the airfield through the airport window), so it's never "above" or "below" anything.

The top 2% (`TOP_CLEAR`) and bottom 4% (`BOTTOM_CLEAR`, the home indicator) of the picture are never used.

Nothing crosses out of its band, except things that stand against the back of their band: **tall anchors** (palm trees, bookshelves, floor lamps) and **back-row** things (sofa, TV, armchairs, plants, parked bicycles). These rise over what's behind them on purpose.

## The slot grid

Each band is split into **3 columns** (left / middle / right thirds) × its rows. Every group of things gets its own cells: one column, one or more rows.

- A group may spill 3% past its third (`SPILL`), but never on `panels` bands. Things stay 5% from the left and right edges (`EDGE`).
- **Side.** A group's left / middle / right is the third its centre is in, and the centre stays 5% clear of the lines between thirds (`THIRD_MARGIN`), so its side is never in doubt.
- **Extra-wide things** (`wide`, e.g. a bus) may use the whole width. They use every column they really cover, and their centre still decides their side.
- **Choosing cells:** fewest rows first, then the emptiest part of the picture. A cell is crowded if the same row of the band, the same column of the band, or the same column anywhere is taken, plus a little randomness. Things spread out instead of bunching up.

## Copies of a thing

2 or more copies use an arrangement from `arrangements(n, w, h)`. Every pair of copies must satisfy `duplicatesOk`:

- **apart**: a gap of at least 0.6 × their width (`DUPLICATE_GAP`), or
- **staggered**: offset by at least half a width across and a quarter of a height down (`STAGGER_X`, `STAGGER_Y`), and still 4% apart.

Arrangements: a row or column with wide gaps (used only if nothing else fits), zigzags across and down, rising and falling diagonals, an arc (odd counts), and two staggered rows like bricks.

Further limits:

| Things | Rule |
| --- | --- |
| On the ground | May step back at most 0.45 × their height from each other (`MAX_GROUND_STEP`). They stand side by side, never stacked like a ladder. |
| Hung, or against the back | All on one line. |
| `spread` (street lamps, trees, palm trees, flags and dishes on roofs, armchairs, plants, bookshelves, floor lamps, fire hydrants) | One copy per third, all standing on one line. Each sits within 7% of the middle of its third (`SPREAD_JITTER`). Two copies go in the left and right thirds when both are free. Things on the ground taller than a row use the band's full depth. |

## No overlaps

Every box keeps **4% of the width** (`GAP`) from every other box. Copies of one thing follow the copies rule above instead.

## Habits (where things go in real life)

| Setting on the thing or band | Rule |
| --- | --- |
| `hangAt` | Hung with its centre this far above the bottom of the wall band, give or take 1%. Pictures, mirrors and windows share an eye-level line; the clock hangs above it and uses the wall's top row of slots (`HIGH_HANG` = 0.45). |
| `backRow` / `tall` | Stands against the back: its feet 5–17% into the band's first row (`AGAINST_BACK`), i.e. where the floor meets the wall or at the back of the sand. Anchors are placed before everything else. |
| `frontRow` | Stands at the front edge of its band, within 10% of the room left in the row (`AT_FRONT`): fire hydrants at the kerb. |
| `flush` band | Feet exactly on the band's bottom line: flags and dishes on the roofline, products on a shelf. |
| `lineUp` | Copies stand side by side in one straight row on the band's line, `LINE_GAP` (0.3 × their width) apart, instead of the staggered arrangements: products on a supermarket shelf. `duplicatesOk(a, b, true)` checks the same baseline and that gap. |
| `fits` (recipe) | A hard rule for where things may stand in this picture: each zoo animal only in an enclosure with its own habitat. Checked for every picture and every re-layout by `check:scenes`. |
| `fitDetails` (recipe) | Finishes a recipe's details once everything is placed, for a sign that must match the picture: the zoo's feeding-time sign names, and points at, an animal that's really there. |
| `usual` | Picked first for its band whenever the band gets at least two kinds, so most pictures have it (pupils in a classroom, tents and the campfire at the campsite). It still varies in count, colour and place, so its questions stay fresh. |
| `framedColour` | The asked-about colour sits on the thing's own dark frame (a signal light in its housing), so the contrast rules check `tone` (the frame) against the backdrop, the outline is drawn from `tone`, and any of its colours can be used anywhere. Also used for a white snowman on snow (its grey outline is what shows it). |
| `noFlip` | Never drawn mirrored: the clock (a mirrored face shows the wrong time). |
| `avoidRug` | Never touches the rug. Everything else touching the rug must be fully on it (all four corners inside the oval). |
| `keepClear` (recipe) | Nothing may come within 1% of these areas: building doors and the house numbers above them. |
| `oneWay` band | Everything in it faces the same way, fixed by the scene's seed. Vehicle drawings all face right; the whole road is mirrored together. |
| `countable: false` | Only one: the sun, the plane, the clock, the TV, the helicopter. |
| `maxCount` | The realistic most you'd see: one sofa, one mirror, several cushions. |

## Spread across the picture

- **Shares per band**: in proportion to the band's height (see [How a picture is made](how-pictures-are-made.md)).
- **Thirds of the height**: the top, middle and bottom thirds of the picture each contain at least one thing's centre.

## Contrast

Every thing must stand out from every surface it is drawn over (sampled at a 3 × 3 grid of points inside its box). See [Drawing](drawing.md#contrast).

## `validateScene(scene, width, height)`

Returns a list of problems (`rule`, `message`, `kinds`); an empty list means the picture can be shown.

| Rule | Checks |
| --- | --- |
| `count` | Drawn copies match the recorded count; no more than `maxCount`; per-copy colours match the copies |
| `size` | Same size per kind, inside the tier, never under 44 pt |
| `duplicates` | Every pair of copies apart or staggered |
| `edges` | 5% side margins, bottom 4% and top 2% clear |
| `zone` | In a band the thing belongs in; inside the band (except back-of-band things); inside its third on `panels` bands |
| `placement` | Habits: spread copies one per third on one line; hung things at their height; against the back; at the front edge; on the roofline; not in front of a door; ground copies not stacked; one-way traffic |
| `side` | The recorded side matches the drawing and the centre is clear of the thirds lines (not for spread groups, whose side isn't asked about) |
| `rug` | Fully on the rug or clear of it |
| `contrast` | Stands out everywhere it is drawn |
| `overlap` | 4% between different things |
| `thirds` | Something in each third of the height |
| `bare` | Each band has its `minGroups` |
| `marks` | Faint marks ≤ 35% opaque (clouds excepted) and never touching a thing |
