# In the supermarket (`supermarket`)

Code: `src/scenes/recipes/supermarket.tsx`. Exact sizes, counts and colours: [reference](reference.md#in-the-supermarket-supermarket). First appears at **Level 14**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| Hanging from the ceiling | 0–13.5% | backdrop only: the two signs |
| On the top shelf | 15–32% | `ground`, 1 row, `flush`: products stand on the shelf board |
| On the middle shelf | 34.5–50.5% | the same |
| On the bottom shelf | 53–68.5% | the same |
| On the floor | 72–100% | `ground`, 2 rows |

Each shelf's third holds one kind of product, like a real aisle: the slot grid's left, middle and right are the shelf's sections, so "Where were the tins?" reads "On the middle shelf, on the right".

## Things and their habits

- **Products (9):** cereal boxes, packs of toilet rolls, bottles of water, tins, jars of honey (lid colour asked), bottles of juice (a row can mix flavours on Hard), cartons of milk, boxes of eggs, loaves of bread. Each belongs on one or two shelves.
  - **New habit, `lineUp`:** copies stand side by side in one neat row on the shelf, `LINE_GAP` (0.3 × their width) apart, never staggered. Close like real shelves, but easy to count. Two copies fit in a third of the shelf on every phone; three only on bigger screens, so shelf counts are 1–3.
  - Product colours leave out purple, black and brown, which would vanish on the dark shelving.
- **On the floor (8):** shopping trolleys (red, blue or green; about waist-high to a shopper), shopping baskets, shoppers (the shared person; shirt colour asked), crates of apples, crates of oranges, watermelons, a wet floor sign (one at most, not counted), cardboard boxes. No dogs: they don't belong in a supermarket.

## Backdrop

- **The shelving:** a dark backing, a pale (or wooden) board under each shelf with price labels along its edge, uprights at both ends, a plinth on the floor.
- **Two signs hang from the ceiling**, swapping sides per picture:
  - the blue **aisle sign**, with a number from 1 to 15: "What was the aisle number?" Wrong answers are one or two along, the digits swapped, or ten more.
  - the red **offer sign**, with a picture of apples, bananas, bread, milk or cheese: "What was on special offer?"
  - Both are detail facts, asked on levels with detail questions (Level 8+, so always here).
- **No prices:** "How much were the apples?" would need a currency. The aisle number gives the same "remember the number" challenge.
- **Marks:** lines between the floor tiles (30%), broken around anything standing on them.

## Colour schemes

`modern` (white ceiling, dark slate shelves, pale grey tiles) and `corner` (cream ceiling, dark wooden shelves, light oak floor). White shirts never stand on either floor, and the yellow wet floor sign only appears in the modern shop, where it stands out.

## Questions it gives

Everything the engine asks: counts, colours, "Where were the cereal boxes?", "What was on the top shelf, on the left?", in / NOT in the picture, compare ("Were there more tins or more jars of honey?"), above / below ("What was above the cartons of milk?"), colour twins, true or false, plus the aisle number and the offer.
