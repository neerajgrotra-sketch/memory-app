# Drawing

Rendering lives in `src/scenes/SceneView.tsx` (`SceneContent` draws a scene; `SceneView` measures the space and fits it). Everything is `react-native-svg`.

## Layers (back to front)

1. **Background bands.** Each colour scheme's `background(height, details)` draws only large fills: sky, sea, sand, wall, floor, the rug, building fronts with their windows, doors and house numbers, pavement and road.
2. **Marks and clouds.** The recipe's `marks(height, boxes, random, variant)` returns small details placed around the things (helpers in `src/scenes/marks.tsx`):
   - each mark has a box, and `lineMarks` breaks a line wherever something stands on it
   - faint marks (waves, floorboards, shoreline, sand ripples, road dashes) are at most 35% opaque, so they can't be mistaken for things
   - clouds are `scenery`: white and solid, but kept clear of everything in the sky
   - no mark ever comes within 8 design units of a thing.
3. **Things**, sorted by the bottom of their box, so nearer things are drawn over farther ones. A thing drawn with `flip` is mirrored.

## Outlines

Each thing is wrapped in a group with `stroke` set to its outline. Shapes without their own `stroke` inherit it, and small details (eyes, highlights, windows) set `stroke="none"`.

- **Colour:** `shade(colour)`, the thing's own colour at half brightness (`src/scenes/contrast.ts`), so a red buoy gets a dark red outline. Things with a fixed colour use their `tone`.
- **Width:** 2.5 pt on screen whatever the thing's size: `2.5 / (drawing scale × points per design unit)`.

## Contrast

`standsOut(fill, surface)` in `src/scenes/contrast.ts`:

- the colours differ by at least 18 in OKLab (×100), which counts hue as well as lightness (`MIN_CONTRAST`), **and**
- the fill or its outline differs in lightness by at least 15 (OKLab L × 100, `MIN_LIGHTNESS`).

A thing is checked against every surface it is drawn over, using `recipe.surfaceAt(x, y)` at 9 points in its box. Things with colours only get colours that pass. Things with a fixed `tone` are only placed where it passes.

## Screen shapes

- The picture is laid out for the measured area (ratio clamped to 1.3–2.2).
- If the screen is a different shape (a tablet, a wide browser window), the view box is widened or heightened. The backdrop carries on around the picture: more sky and sea, more buildings along the street. It is never stretched.
- In the city, the extra buildings at the edges are plain beige, with no numbers or named colours.

## The layout overlay (development only)

The ▦ button in the memorise header (development builds, such as Expo Go) turns on `LayoutOverlay` (`src/scenes/LayoutOverlay.tsx`):

- the shaded margins
- band edges and the slot grid in blue
- the thirds in pink
- every box, with its 4% clearance dashed
- labels like `kite×2 L`
- a green "✓ layout OK" banner, or a red one with the first problem from `validateScene`.

The timer waits while the overlay is on. Its state lives in `src/scenes/debugOverlay.ts`.
