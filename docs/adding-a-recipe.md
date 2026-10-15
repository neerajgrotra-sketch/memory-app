# Adding a recipe

A recipe is one file in `src/scenes/recipes/` that exports a `Recipe` (`src/scenes/types.ts`). Start by copying the closest existing one.

## Steps

1. **Bands (`zones`).** Split the picture into horizontal bands. For each band set:
   - `top` / `bottom` as fractions of the height
   - `surface`: `air`, `wall` or `ground`
   - `rows` (0 for bands nothing goes in)
   - a `label` for answers ("On the grass").

   Add `minGroups`, `maxGroups`, `anchors`, `flush`, `panels` or `oneWay` where the setting needs them (see [Layout rules](layout-rules.md#bands)).
2. **Backdrop (`variants`).** One or more colour schemes. Each has:
   - a `palette` naming every surface `surfaceAt(x, y)` can return
   - `background(height, details?)`, which draws only large fills for a picture 900 wide and `height` tall, spilling past the edges (x −900…1800) so wide screens are filled.

   Write `surfaceAt(x, y)`, which says which palette key is behind a point (fractions of width and height).
3. **Marks (optional).** `marks(height, boxes, random, variant)` returns small details placed around the things:
   - use `lineMarks`, `markIfClear` and `scatterMarks` from `src/scenes/marks.tsx`
   - keep them at most 35% opaque, or `scenery` for clouds.
4. **Things (`items`).** Reuse shared things from `src/scenes/items/common.tsx` where you can. Each needs:
   - `kind`, `singular`, `plural`, `article`
   - a design box (`w`, `h`) and a `draw(colour)`
   - `tier` and `size` (width as a fraction of the picture width, inside the tier)
   - the `zones` it may go in
   - a realistic `maxCount`
   - `colours` (or a fixed `tone`), plus a `colourPrompt` if only part of it is coloured.

   Then add its habits: `hangAt`, `backRow`, `tall`, `frontRow`, `spread`, `wide`, `avoidRug`, `mixedColours`, `countable: false`. Ask "where would this really be, and how many?".
5. **Drawing rules.**
   - Shapes without their own `stroke` get the outline; small details use `stroke="none"`.
   - Things that move (vehicles) are drawn facing right.
   - Things that can't stand on their own (bicycles) lean against something.
6. **Optional:**
   - `rug` (an oval things are fully on or off)
   - `keepClear` (areas nothing may cover)
   - `details(random)` (per-picture facts, such as house numbers, which also need questions in `generateQuestions.ts`).
7. **Register it** in `src/scenes/recipes/index.ts`.

## Checklist before shipping

- [ ] `npm run check:scenes` passes (5,400 scenes on three iPhone sizes, every level)
- [ ] Played on a phone with only this setting switched on (Profile → Testing), on Easy, Medium and Hard, reading every question against the picture
- [ ] `npm run gallery` reviewed by eye, with and without `OVERLAY=0`. Ask of every thing: is it where it would really be, the right size next to its neighbours, and not floating, bunched, or covering something it shouldn't?
- [ ] At least 12 things, so Hard has enough to fill the picture and enough absent things for "NOT in the picture" questions
- [ ] Every thing can stand out somewhere (the checker reports any that can't)
- [ ] `npm run docs:recipes` run, a page added in `docs/recipes/`, and the README's recipe list updated
- [ ] `npm run typecheck` and `npm run lint` pass; version bumped and CHANGELOG entry added
