# Drawing

Rendering lives in `src/scenes/SceneView.tsx` (`SceneContent` draws a scene; `SceneView` measures the space and fits it). Everything is `react-native-svg`.

## Layers (back to front)

1. **Background bands.** Each colour scheme's `background(height, details)` draws only large fills: sky, sea, sand, wall, floor, the rug, building fronts with their windows, doors and house numbers, pavement and road.
2. **Light bands.** Each recipe's `light` list (`LightBand` in `src/scenes/types.ts`) lays soft vertical gradients over the background: haze near a horizon, water deep far out and lighter in the shallows, sun on house fronts, shade at the back of each shelf, under a worktop, or where a floor meets the wall. At most 20% opaque.
3. **Marks and clouds.** The recipe's `marks(height, boxes, random, variant)` returns small details placed around the things (helpers in `src/scenes/marks.tsx`):
   - each mark has a box, and `lineMarks` breaks a line wherever something stands on it
   - faint marks (waves, floorboards, shoreline, sand ripples, road dashes) are at most 35% opaque, so they can't be mistaken for things
   - clouds are `scenery`: white and solid, but kept clear of everything in the sky
   - no mark ever comes within 8 design units of a thing.
4. **Shadows.** A soft dark oval (16% opaque) under everything standing in a `ground` band (the sand, a floor, a shelf, the worktop), so nothing looks pasted on. Things in the air, underwater, hung on a wall or floating (`floats`) have none.
5. **Things**, sorted by the bottom of their box, so nearer things are drawn over farther ones. A thing drawn with `flip` is mirrored (never one with `noFlip`, like a clock).
   - **Light on every thing:** light falls from the top left. Over each thing, a gradient (white 30% at the top fading out, black 18% at the bottom) is drawn through a mask of the thing's own silhouette (`maskType="alpha"`), so it gives every drawing a rounded, lit look without changing any drawing. The light is the same for every thing in the scene, whichever way the thing faces.
   - Gradient and mask ids are unique per picture (`useId`), since several pictures can be on one screen or web page.

## Movement while you look

On the memorise screen only (`SceneView animate`), the picture is drawn in layers so some of it can move gently:

- **Bobbing:** everything in an `air` band (the sky, the sea at the beach, the open water under the sea) moves up and down 3 pt every 3.2 s.
- **Rocking:** things with `floats` (the park's rowing boat and swans) move 1.6 pt every 2.6 s.
- **Drifting:** clouds slide 7 pt side to side every 9 s.
- Each moving kind starts at a different moment, so they don't move in step.

The still parts (background and marks, then shadows and everything else) are their own layers, and each moving kind gets a layer moved by Reanimated on the native side, so it stays cheap. Things never overlap (a 4% gap, at least 15 pt), and nothing moves more than 3 pt, so splitting into layers never changes what covers what, and where something is is never in doubt.

**Reduce motion:** when the phone asks for reduced motion, the picture is drawn still, as one layer. (The countdown is a timer, so it always runs at real speed: `reduceMotion: ReduceMotion.Never`.)

Thumbnails, the full-size picture viewer and the screenshot tools draw the picture still (`layer: 'all'`).

## Small variations

`draw(colour, details, copy)` gets a `copy` number fixed for each copy in each picture (from the scene's seed). People use it for **skin tone, hair colour and hairstyle** (short, long, a bun), so a crowd isn't one person repeated. Variations are never asked about: the shirt colour, which is, comes from the scene's facts as before.

## Richer drawing (detail and texture)

Things are drawn in layers inside their own box: the main shape in the asked-about colour (it gets the outline and is what the contrast rules check), then details with `stroke="none"` on top. Details only use white or black at low opacity, or small fixed colours, so a thing still reads as its colour:

- **Highlights:** a soft white shape where light catches (top left), e.g. the shine on a ball, a balloon's light gores.
- **Shade:** black at 10–15% on the far side or underneath (a kite's two-tone panels, a tree's darker lower leaves).
- **Small real details** that make a thing specific: battlements and windows on a sandcastle, a spade in the bucket, seams on a sail, bows on a kite tail, a dog's collar and tag, eyes and a smile on people.
- Details stay inside the box and never change a thing's size, so layout and every check are unaffected.

**Ground texture** (`src/scenes/texture.tsx`): `speckles` (sand grain, gravel, dust, snow sparkle), `strokes` (grass blades) and `glints` (sun on water), each hundreds of tiny marks drawn as a single path, placed with a fixed seed so a place looks the same every time. Each backdrop adds its texture right after its ground colour, under signs and boards. It's faint on purpose: the contrast rules use the band's plain colour, and texture never makes a thing harder to see.

Redrawn so far: **the beach**, **the living room**, **the park**, **the city street**, **the kitchen**, **the farm**, **under the sea**, **the supermarket**, **the train station**, **the zoo**, **the snowy mountain**, **the classroom** and **the night campsite**. The beach was the first (with a far headland, wet sand at the water's edge and glints on the sea), with the shared things it uses: sun, birds, clouds, balloons, kites, trees, plant pots, balls, dolphins, crabs, starfish, people and dogs.

## Outlines

Each thing is wrapped in a group with `stroke` set to its outline. Shapes without their own `stroke` inherit it, and small details (eyes, highlights, windows) set `stroke="none"`.

- **Colour:** `shade(colour)`, the thing's own colour at half brightness (`src/scenes/contrast.ts`), so a red buoy gets a dark red outline. Things with a fixed colour use their `tone`.
- **Width:** 2.5 pt on screen whatever the thing's size: `2.5 / (drawing scale × points per design unit)`.

## Contrast and lighting

The contrast rules (choosing colours while placing, and the scene checker) use the backdrop colour **as drawn**: the surface's palette colour with the recipe's light bands laid over it at that height (`surfaceColour` in `src/scenes/contrast.ts`). So lighting can never make something hard to see: when it would, the thing just isn't placed there, and the checker reports any thing that can never be placed. (Tuning the lighting found two: a white plane in a hazier park sky, and a wicker basket by shaded kitchen cupboards; the haze, the shade and the basket's colour were adjusted.)

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
