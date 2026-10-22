# On the snowy mountain (`snowy-mountain`)

Code: `src/scenes/recipes/snowyMountain.tsx`. Exact sizes, counts and colours: [reference](reference.md#on-the-snowy-mountain-snowy-mountain). First appears at **Level 20**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| In the sky | 0–22% | `air`, 1 row |
| (the peaks) | 22–34% | backdrop only: far and near mountains with snowy tops |
| On the ski slope | 36–63.5% | `ground`, 2 rows |
| By the lodge | 68–100% | `ground`, 2 rows, below the fence at the foot of the slope |

## Scale

A wide scene sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a skier about 1.7 m on their skis, a snowman 1.6 m, a cable car cabin about 2.5 m, a snowmobile 2.5 m, a pine tree about 4 m (a young one, so it fits on small phones).

## Snow and contrast

White and yellow can't be seen on snow, so coats, jackets and scarves come in red, blue, green, orange, purple and pink only. The snowman is white too: what really shows it is its dark outline, so it's marked `framedColour` with a grey `tone`: the contrast rules check the outline against the snow, its outline is drawn grey (not in its scarf's colour), and its scarf can be any coat colour.

## Things (16)

- **What's happening:** a snowman on its own wears a top hat, a woolly hat or a bucket ("What was the snowman wearing on its head?").

- **Sky:** the sun, birds, a plane, cable cars on one cable running right across the sky (spread apart, never mirrored so the cables stay parallel; cabin colour asked).
- **Ski slope:** skiers and snowboarders (jacket colour asked), a ski racer with a bib number, slalom flags (red or blue, spread apart), pine trees (tall, at the back of the slope, spread apart).
- **By the lodge:** people in winter coats, dogs, snowmen (scarf colour asked), sledges, a ski rack, a hot chocolate stand (roof colour asked), a snowmobile.

## Detail facts

- **The danger sign** on the fence (`keepClear`): a yellow sign with a red warning triangle, "DANGER" and the wild animal it warns about, chosen per picture. **"Which animal was the danger sign about?"** Deer, Bear, Wolf, Moose or Fox. (It replaced a ski run sign with a difficulty-colour dot: testers found the dot confusing, since few people know the run colour code.)
- **The hiding animal** (from Level 20, and Hard practice): the danger sign's animal really is there, peeking out from behind the pine tree, the snowmobile or the hot chocolate stand (whichever of them is in the picture, one of it), so the sign still matches the picture. **"Where was the bear hiding?"** is asked first in the round. Levels 20 to 24 show a clear peek (head and ears); from Level 25 only ears and eyes. Wrong answers are the other hiding spots in the picture first. The head is drawn as part of the thing it hides behind (`peeking` in the recipe), so no layout rule is bent. The ski rack was tried as a spot and dropped: between the skis the animal was nearly invisible.
- **"What number was on the ski racer's bib?"** (1–49) whenever the racer is there; wrong answers one or two along, the digits swapped, or ten more.

All from Level 8 like other details, so always asked here.

## Colour schemes

`sunny` (blue sky, white snow) and `dusk` (a violet evening, pinkish snow). Light: haze near the peaks, sun on the upper slope, snow a little deeper in front. Marks: clouds, ski tracks across the slope, paths by the lodge.
