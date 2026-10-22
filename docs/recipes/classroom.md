# In the classroom (`classroom`)

Code: `src/scenes/recipes/classroom.tsx`. Exact sizes, counts and colours: [reference](reference.md#in-the-classroom-classroom). First appears at **Level 22**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| (the ceiling) | 0–5% | backdrop only: strip lights |
| On the wall | 5–42% | `wall`, 1 row: everything hangs on one line above head height, either side of the whiteboard |
| At the front of the class | 45–63% | `ground`, 1 row, 2–3 kinds, always the teacher or the bookcase (`anchors: 1`); the teacher is picked first (`usual`) |
| At the back of the class | 67–100% | `ground`, 2 rows; pupils are picked first (`usual`), their desks in a row across the room (`spread`) |

The whiteboard sits in the middle of the wall (`keepClear`), so wall things go on the left and right.

## Scale

A closer view than the outdoor places: about 4.5 m across at the front of the class (1 m ≈ 0.22 of the width), so a school clock (60 cm), a globe (55 cm) and the teacher are big enough to see without being blown up. The teacher is 1.6 m tall behind a desk about 1.05 m wide, a piano 1.3 m, the whiteboard 1.8 m. Nothing smaller than about half a metre (school bags, pencil pots) is in the picture.

- **Depth:** the back of the class is the row nearest us, so everything there is drawn about 1.25 times bigger (1 m ≈ 0.28), as nearer things look in a photo: a pupil at a 0.68 m desk is 0.2 of the width, and beanbags, the fish tank, the computer, plants and the easel grow to match. Without this, the nearest pupil looked tiny next to the teacher's desk across the room.

- **Head height:** the teacher and the bookcase stand against the wall and rise over it, so everything on the wall hangs on one line above them (`HEAD_HEIGHT`), as posters do in a real classroom. Children's coat pegs were left out for this reason: they'd hang exactly where the teacher stands.
- **Pupils:** seen from behind, facing the board like a real class: the back of the head (some with a ponytail), the jumper and the back of their chair, with the desk beyond them. Up to 3, one desk to each third of the room (`spread`).
- **The teacher:** one thing with their desk (the teacher stands behind it, with books, a mug of tea and an apple on top), so there's never an empty desk or a teacher with nowhere to stand.

## Things (15)

- **What's happening:** 1 to 4 fish swim in the fish tank ("How many fish were in the fish tank?").

- **Wall:** a clock (real time, never mirrored), a space poster (background colour asked), a world map (never mirrored, so the continents are the right way round), a noticeboard, a window with curtains (curtain colour asked).
- **Front of the class:** the teacher at their desk (jumper colour asked), a globe, a bookcase (tall), a piano (black or brown).
- **Back of the class:** pupils at their desks (jumper colour asked), beanbags, a fish tank, a computer, an easel (the flower in the painting asked), potted plants.

## Detail facts

- **"What day was written on the board?"** Monday to Friday.
- **"What sum was on the board?"** The board shows a sum with plus, minus, times or divide, like "7 + 5 = ?", "9 − 4 = ?", "6 × 7 = ?" or "24 ÷ 6 = ?". Small numbers, never a negative or a remainder. Wrong answers are the same numbers with another sign ("6 + 7" for "6 × 7"), or one number changed by one; for divide, only sums that still divide exactly ("30 ÷ 6", "18 ÷ 6").
- **"What time was on the clock?"** whenever the clock is there, on every level (like the living room's).

## Colour schemes

`wood` (a wooden floor, cream wall) and `carpet` (blue-grey carpet, mint wall). Light from the ceiling on the wall, shade where the floor meets the wall. Marks: floorboard (or carpet tile) lines.
