# City street (`city`)

Code: `src/scenes/recipes/city.tsx`. Exact sizes, counts and colours: [reference](reference.md#city-street-city).

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| In the sky | 0–25% | `air`, 2 rows |
| On the roofs | 11–25% (overlaps the bottom of the sky) | `ground`, `flush`, `panels`, 1 row, at most 2 kinds: flags and satellite dishes stand exactly on the roofline, one per roof |
| On the buildings | 25–53% | no slots: the building fronts are backdrop, nothing is hung on them |
| On the pavement | 53–75% | `ground`, 2 rows |
| On the road | 75–100% | `ground`, 1 row, `oneWay`, at most 2 kinds: one lane of traffic, all facing the same way |

## The street: houses, numbers and colours

- **Three houses**, one per third of the picture, so "the house on the left" is never in doubt. Each front has two upper windows, a ground-floor shop window, and a door with a house-number plaque above it. `facade(i)` works these out from the roof and pavement lines, and the scene checker fails if any of them overlap.
- **Doors:** left, right, right, so no two doors or numbers end up side by side.
- **Per-picture details** (`details`):
  - three different named colours, chosen from yellow, blue, green, pink, orange and purple
  - house numbers that rise along the street with uneven gaps (like 1560, 1564, 1594), so each must be remembered
  - a chimney on every house, with grey smoke rising from one of them, or now and then none ("Which house had smoke coming out of its chimney?"); the smoke is grey, never white, so it isn't taken for a cloud, and clouds keep clear of it
  - they are stored in `SceneSpec.details` and asked about on Medium and Hard.
- **Doors and their numbers, and each chimney with the space its smoke rises into, are `keepClear`:** nothing stands in front of them.
- **Wide screens:** the street carries on with plain beige buildings, with no numbers and no named colours, so "the yellow house" is always exactly one house.

## Things and their habits

- **Sky:** birds, one plane, one helicopter, hot-air balloons.
- **Roofs:** flags on poles, satellite dishes. Both are `spread`, one per roof.
- **Pavement:**
  - market stalls, people, dogs, benches and rubbish bins
  - street lamps, trees and the street clock (a clock on its own post, showing a time chosen per picture: "What time was on the street clock?" is asked on every level whenever it's there). They stand within the pavement's depth, so they never cover a window or door. Lamps and trees are spread one per third.
  - **bicycles** are parked against the building fronts (`backRow`): a bicycle can't stand on its own. They sit side by side, clear of doors.
  - **fire hydrants** stand at the kerb (`frontRow`), at most one per building and as far apart as possible. On Hard, half of the pairs are different colours (red, yellow, orange).
- **Road:**
  - cars, vans and the bus are extra large (`xl`), so they are bigger than people and doors, not toys. Only one extra-large kind per picture fits the lane.
  - scooters have a rider in a helmet and a dark jacket, because a moving scooter needs one.
  - every vehicle faces the same way, with headlights at the front and red tail lights at the back.

## Sizes, relative to each other

At the smallest phone size:

- a person is about 86 pt tall
- a door is a little taller
- a car is shorter than a person but twice as long
- the bus is the biggest thing in the street.

Hydrants are squat (knee height) and bins about waist height.

## Backdrop

- **Background:** sky, the three house fronts (plus side buildings for wide screens), pavement, kerb and road.
- **Marks:** faint road dashes (left out where a vehicle is) and white clouds kept clear of everything in the sky.

## Colour schemes

`day` and `sunset`, which change the sky and windows. House colours come from each picture's details.

## Questions it gives

All the usual ones, plus on Medium and Hard: "What number was on the yellow house?" and "What colour was house number 1564?". On Hard: "What colours were the fire hydrants?".
