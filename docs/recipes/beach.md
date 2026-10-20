# At the beach (`beach`)

Code: `src/scenes/recipes/beach.tsx`. Exact sizes, counts and colours: [reference](reference.md#at-the-beach-beach).

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| In the sky | 0–35% | `air`, 2 rows: float anywhere in their slot |
| In the sea | 36.5–57% | `air`, 1 row: boats, buoys and dolphins float in the water, clear of the horizon (35%) and well clear of the shoreline (60%) |
| On the sand | 60–100% | `ground`, 2 rows: stand near the bottom of their row |

The sea band is drawn from 35% to 60%. Its placement band is inset at both ends, so a boat never looks beached on the sand or stuck to the horizon.

## Things and their habits

- **Sky:** sun (one, not counted), birds (up to 6), kites, hot-air balloons, one plane.
- **Sea:** sailboats (large), buoys (with a bold red or white band, so white and yellow buoys read clearly on blue water), dolphins.
- **Sand:**
  - beach umbrellas and beach towels (large; a towel is about as long as a person)
  - buckets, beach balls, crabs, sandcastles, starfish and people
  - **palm trees**: stand on the sand, leaves reaching up towards the sea. Two are spread apart, one per third. (They were `tall` anchors until 4.0.2, which put their feet at the waterline, so they seemed to grow out of the sea.)

## Backdrop

- **Background:** three flat bands (sky, sea, sand).
- **Marks**, kept clear of every thing:
  - white clouds in the sky (solid)
  - faint waves in the sea (30%)
  - the foam line along the shore, broken wherever something stands on it (35%)
  - a few sand ripples (25%).

## Colour schemes

`day` (light blue sky, blue sea) and `sunset` (peach sky, deep blue sea). The yellow sun doesn't stand out enough from the sunset sky, so it only appears on `day`. This is chosen automatically by the contrast rule.

## Questions it gives

Counts and colours of everything, positions ("In the sea, on the right"), "What was on the sand, on the left?" when only one kind is there, and in / NOT in the picture.

With two palm trees, coconuts may lie on the sand by the one on the left, the one on the right, both or neither (`fitDetails`), and from Level 8 "Which palm tree had coconuts on the sand by it?" asks which. All four answers happen, so none is a giveaway.
