# How a picture is made

Every picture is generated on the device in a few milliseconds (the slowest in the checker takes about 30 ms). There is no network, no stored images and no AI service. The same seed and screen size always give the same picture.

```
screen size ─► createStage ─► generateScene ─┬─► validateScene ─► (retry) ─► SceneSpec ─► SceneView (draw)
                                             │                                 │
                    recipe + level ──────────┘                                 └─► generateQuestions ─► round
```

## 1. Measure the space

`src/hooks/useGameSession.ts` works out the picture area: the window minus the safe-area insets and the 72 pt header (`layout.memoriseBarHeight`). On the memorise screen the picture is also measured with `onLayout` (`src/scenes/SceneView.tsx`).

The layout works in **width units**: x runs 0–1 across, y runs 0–`ratio` down, where `ratio = height ÷ width`, clamped to 1.3–2.2 (`ratioOf` in `src/scenes/types.ts`). Stored boxes are normalized: `x` and `w` as fractions of the width, `y` as a fraction of the height. Drawings use a design space 900 units wide.

## 2. Pick a recipe and a level

`createStage(level, size, previousRecipeId)` (`src/scenes/createStage.ts`):

- picks a recipe from `src/scenes/recipes/index.ts`, never the one just played
- takes the level's knobs from `src/game/difficulty.ts`: how many kinds of thing, the most of one kind, close or spread wrong counts, mixed colours, house numbers
- generates the scene, then its questions. If a picture can give fewer than 12 questions, it quietly tries the next seed (up to 10 times).

## 3. Fill and place (`generateScene`)

`src/scenes/generateScene.ts`, function `build`, for one attempt:

1. **Colour scheme and details.** Pick one of the recipe's `variants`. If the recipe has `details` (the city), choose this picture's details too: three house colours and house numbers. `variantOf` (`src/scenes/variant.ts`) merges them into the palette.
2. **Shares per band.** Each band with slot rows gets a share of the level's kinds in proportion to its height (largest remainders), at least 1, at least `minGroups`, at most `maxGroups`.
3. **Choose kinds per band.** A band's `anchors` come first (the room always gets furniture), and only one extra-wide kind per band (one lane of road).
4. **Place the chosen kinds, anchored first, then biggest first.** Anchored means tall, against the back or extra wide. For each kind (`tryItem`):
   - the count is random from 1 to the lower of the thing's `maxCount` and the level's maximum (1 for things that aren't counted)
   - try its bands in random order, and fewer copies if the wanted number doesn't fit
   - `place` finds a slot (see [Layout rules](layout-rules.md)), or `placeSpread` for things that spread one per third
   - pick a colour that stands out everywhere the copies are drawn. On Hard, half of the pairs of things with `mixedColours` (fire hydrants) get a different colour each.
   - if nothing fits, the band gets another kind instead.
5. **Every third has something.** If the top, middle or bottom third of the height is still empty, try kinds that can go there.
6. **Top up** with the remaining kinds, biggest first, until the level's number of kinds is reached or nothing more fits.

`generateScene` runs this up to 12 times (`LAYOUT_ATTEMPTS`) with different random choices. It returns the first attempt that passes `validateScene` and has every kind. Otherwise it returns the best one: fewest problems, then most kinds. The scene checker makes sure the fallback is never needed in practice.

## 4. The result: `SceneSpec`

`src/scenes/types.ts`:

- `recipeId`, `variantId`, `seed`, `size` (points)
- `details`: house colours and numbers (city)
- `groups`: one per kind, with:
  - `kind`, `count`, `colour` (or `colours`, one per copy), `zoneId`, `region` (left / centre / right)
  - `slot`, for the overlay
  - `boxes`: `{ x, y, w, flip }` per copy.

**The groups and details are the single source of truth.** Questions are written from them, and laying the picture out again never changes them.

## 5. Lay out again for the real size (`relayoutScene`)

If the measured picture area differs from the size it was made for, `relayoutScene` places the same groups again: same kind, count, colour, band and side. Things spread across thirds may move between them, because their side isn't asked about. If that can't be done cleanly within 12 attempts, the original layout is kept and scaled. Thumbnails and the full-size viewer on the result screen never lay out again, so they show exactly the memorised picture.

## 6. Draw it (`SceneView` / `SceneContent`)

Back to front: background bands, then faint marks and clouds, then things sorted by their bottom edge. Each thing gets a 2.5 pt outline in a darker shade of its own colour. Details in [Drawing](drawing.md).

## 7. Write the questions (`generateQuestions`)

Count, colour, where, what-here, in / NOT in the picture, and house number and house colour. Wrong options come from the same recipe so they're believable. A round picks 5. Details in [Questions](questions.md).

## Determinism and ids

- `createRng(seed)` (`src/scenes/random.ts`, mulberry32) drives every random choice in a scene. Marks use `seed ^ 0x51ed27`, and question wording and options use `seed ^ 0x9e3779b9`.
- Scene id: `${recipeId}-${seed in base 36}`. Question ids start with the scene id.
