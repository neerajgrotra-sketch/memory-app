# In the kitchen (`kitchen`)

Code: `src/scenes/recipes/kitchen.tsx`. Exact sizes, counts and colours: [reference](reference.md#in-the-kitchen-kitchen). First appears at **Level 8**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| On the shelf | 5.5–20.5% | `ground`, `flush`: things stand on the open shelf, repeats in a neat row (`lineUp`) |
| On the wall | 24–43% | `wall`: things hang on hooks and rails, plus a window |
| On the worktop | 45–63% | `ground`, `flush`: things stand on the worktop |
| On the floor | 70–100% | `ground`, `flush`, at most 3 kinds: things stand on the floor in front of the cupboards |

## Scale: a close-up, objects only

Like the supermarket, the kitchen is a close-up, so **no people or pets**, and everything is at one scale: 1 m ≈ 0.53 of the picture width. The smallest thing that can be drawn 44 pt wide is about 22 cm, so **mugs, spoons and spice jars are left out**. A plate is 0.14 wide, a kettle 0.12, the microwave 0.28 (52 cm), the bin about 60 cm tall.

## Things (25)

- **Shelf:** plates standing in a rack (a row can mix colours on Hard), cookbooks, jars of pasta (lid colour asked), a teapot, a cookie jar, pots of herbs.
- **Wall:** frying pans hanging by their handles (spread apart), oven gloves, a tea towel (stripe colour asked), a utensil rail (ladle, whisk, spatula, spoon), a window.
- **Worktop:** the microwave, a kettle, a toaster, a fruit bowl, a chopping board with carrots, saucepans, a coffee machine, a food mixer. The teapot and cookie jar can also stand here.
- **Floor:** a pedal bin, a mop and bucket (bucket colour asked), a step stool, a recycling box, a basket of vegetables, pet bowls.

## Detail facts

- **"What time was on the microwave?"**, the game's first **digital** clock, asked on every level whenever the microwave is there. Below Hard it follows the clock-face steps (whole hours, then half past); on Hard it can show **any minute** (12:17), because digits read at a glance. Wrong answers: the minute digits swapped (7:45 → 7:54), an hour off, ten minutes off, a 1 and a 7 mixed up; then twenty minutes or two hours off. (`randomDigitalTime`, `digitalLookalikes` in `src/scenes/clock.tsx`.)
- **"What was in the fruit bowl?"** Apples, oranges, bananas or lemons, chosen per picture, whenever the bowl is there.

## Colour schemes

The backdrop has a built-in oven in the middle of the cupboards and a sink with a tap on the right, so the steaming saucepans have somewhere to come from.

`modern` (warm white tiles, navy cupboards, dark worktop, light grey floor) and `farmhouse` (pale blue tiles, sage cupboards, wooden worktop and floor). The microwave is mid-silver so it stands out on both walls. Marks: faint tile lines on the wall.
