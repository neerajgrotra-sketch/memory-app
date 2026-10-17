# Recipe questionnaire

Answer these to define a new setting (a recipe). Plain words are fine: the answers are turned into the recipe file by following [Adding a recipe](adding-a-recipe.md). The example answers are for a **park**.

## 1. The setting

| # | Question | Example (park) |
| --- | --- | --- |
| 1.1 | What's the place called, as players will see it? | "In the park" |
| 1.2 | Indoors or outdoors? Time of day or season? | Outdoors, a sunny afternoon in summer |
| 1.3 | At which level should it first appear? (Today: beach 1, living room 2, park 4, city 6, kitchen 8, farm 10, under the sea 12, supermarket 14, train station 16.) | Level 10 |
| 1.4 | What makes it different from the settings we already have? | Grass and trees everywhere, a pond, people relaxing |

## 2. The bands (top to bottom)

Every picture is split into horizontal bands. Things only ever appear in their own band, and every "Where was…?" answer names one ("On the grass, on the left").

| # | Question | Example (park) |
| --- | --- | --- |
| 2.1 | List the bands from top to bottom, with roughly how much of the height each takes. | Sky 30%, trees and pond 25%, path 15%, grass 30% |
| 2.2 | What does each band sound like in an answer? | "In the sky", "By the pond", "On the path", "On the grass" |
| 2.3 | Is each band air (things fly or float), wall (things hang) or ground (things stand)? | air, ground, ground, ground |
| 2.4 | Is any band backdrop only, with nothing placed in it? | No |
| 2.5 | Any band with a limit, e.g. "at most 2 kinds of thing" or "traffic goes one way"? | The path: at most 2 kinds, bikes all ride the same way |

## 3. The backdrop

| # | Question | Example (park) |
| --- | --- | --- |
| 3.1 | What colours are the sky, ground, walls, water…? | Light blue sky, green grass, pale gravel path, blue-green pond |
| 3.2 | Should there be colour schemes that vary between pictures (e.g. sunset, autumn)? | Summer (green) and autumn (orange-brown grass) |
| 3.3 | Fixed scenery that's always there and never asked about? | Distant hills, a fence along the back |
| 3.4 | Faint background details (clouds, grass tufts, waves, floorboards)? | White clouds, grass tufts, ripples on the pond |
| 3.5 | Anything special per picture, like the city's house numbers, that could be asked about? | A bench plaque with a 2-digit number? (optional) |

## 4. The things (at least 12)

Answer these for **each** thing. Twelve or more is needed so Hard pictures can be full and there are enough absent things for "Which of these was NOT in the picture?".

| # | Question | Example (duck) |
| --- | --- | --- |
| 4.1 | Name, one and many ("a duck", "ducks"). | duck, ducks |
| 4.2 | Which band(s) can it be in? | By the pond |
| 4.3 | How big next to its neighbours? (tiny like a bird, small like a bucket, medium like a person, large like a sofa, very large like a bus) | Small |
| 4.4 | Most there would really be at once? | 4 |
| 4.5 | Which colours can it be, or is it always one colour? | Always brown and green (fixed) |
| 4.6 | If only part of it changes colour, which part? (e.g. "the sail on the boat") | — |
| 4.7 | Where would it really be? Pick any that apply: hangs at eye level, stands against the back, stays at the front, spread out (never side by side), lined up in a row (products on a shelf), tall, wide, on/off the rug, leans on something, moves in one direction. | In the water near the edge, can be in a little group |
| 4.8 | Can copies be different colours on Hard (like the fire hydrants)? | No |
| 4.9 | Is it worth counting ("How many ducks?"), or is there only ever one (like a sun)? | Yes, count it |
| 4.10 | Anything it must never be next to, or always be near? | Never on the path |

Example list for a park (12): tree, bench, duck, swan, kite, bicycle (with rider), dog, person, picnic blanket, ball, flower bed, lamp post, fountain, ice-cream cart, butterfly.

## 5. Real-world rules

The checks prove nothing overlaps; only real-world rules stop silly pictures (a boat on the sand, a sofa in the middle of the floor).

| # | Question | Example (park) |
| --- | --- | --- |
| 5.1 | What would look wrong to a person? | Ducks on the grass far from the pond; a bench floating; bikes riding into each other |
| 5.2 | What should be spaced out rather than bunched? | Trees, lamp posts, benches |
| 5.3 | Is there an area nothing may cover? | The fountain's base |
| 5.4 | Anything that only makes sense in a group, or only alone? | One fountain at most; ducks often in twos or threes |

## 6. Questions

| # | Question | Example (park) |
| --- | --- | --- |
| 6.1 | Any question ideas beyond what, how many, what colour and where? | "What colour was the kite's tail?" |
| 6.2 | Any wording players might misread? (Players read "on the beach" as "on the sand", so questions say "in the picture".) | "By the pond" vs "in the pond" |

## What happens next

1. The answers become `src/scenes/recipes/<name>.tsx`, with drawings for each thing, and the setting is given its level in `RECIPE_UNLOCKS`.
2. `npm run check:scenes` generates thousands of pictures on three iPhone sizes and every level, and fails on any rule broken.
3. You review pictures by eye (`npm run gallery`, or My places on the game page) and say what looks wrong; each fix becomes a rule.
4. The docs (`docs/recipes/<name>.md`, the reference tables) are updated, the version is bumped, and it ships.
