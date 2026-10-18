# At the zoo (`zoo`)

Code: `src/scenes/recipes/zoo.tsx`. Exact sizes, counts and colours: [reference](reference.md#at-the-zoo-zoo). First appears at **Level 18**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| In the sky | 0–22% | `air`, 1 row |
| In the enclosure | 24–56.5% | `ground`, **1 row** and `panels`: three enclosures side by side, one kind of animal each, nothing crossing a wall |
| On the path | 67–100% | `ground`, 2 rows |

**One kind per enclosure, like a real zoo.** With one slot row, each third holds one group, and `panels` keeps every animal inside its third (clear of the walls drawn at a third and two thirds). Lions never share with zebras, and "What was in the enclosure on the left?" has a clear answer.

## Habitats

Each enclosure has its own habitat, chosen per picture (`details.values.habitat0`–`2`, drawn in `details.palette.enc0`–`enc2`), and **every animal lives only in its own**. This is a hard rule (the recipe's `fits`), not left to contrast, and the scene checker fails any picture that breaks it:

| Habitat | Drawn as | Animals |
| --- | --- | --- |
| Grassland | green, with grass tufts | giraffes, elephants, zebras, lions |
| Sandy paddock | pale sand | rhinos, ostriches, kangaroos |
| Rocks | grey, with boulders at the back | bears |
| Snow and ice | white, with a pool and drifts | penguins |

Every picture has grassland and a sandy paddock (most animals live there); the third enclosure is often rocks or ice. Checked independently on 1,800 pictures (and their layouts for another phone): 3,250 animals, none in the wrong habitat. Before, the habitats were only grass or sand and contrast decided where animals went, so bears ended up on sand.

## Scale

Sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width). An enclosure is a third of the width less the walls and the screen edges, **0.26 at most**, so the elephant and rhino are young ones (about 2.3 m) and the giraffe is a young one (about 3.5 m tall; a grown one would reach off the top of a small phone). Zebra 2.2 m, lion and bear about 2 m, ostrich 2.5 m tall, kangaroo 1.6 m.

**Left out:** penguins, monkeys, parrots and other animals under about 1 m: at the 44 pt minimum they'd be drawn as big as a person.

## Things (19)

- **Sky:** the sun, birds, hot-air balloons, a plane.
- **Enclosures:** giraffe, elephant, zebra, lion, rhino (one of each at most); ostriches and kangaroos (up to 3); bear; penguins (up to 4, about 1.2 m tall, like emperor penguins).
- **Path:** visitors, zookeepers (green uniform and hat), benches, pushchairs, a balloon seller (the balloons' colour is asked), a signpost.

## The feeding-time sign

On the fence in the middle (`keepClear`). Chosen per picture:

- **"What time was feeding time?"** On every level. A printed time on the clock-face steps (whole hours, half past, quarters); wrong answers are digit slips.
- **"Which animals were being fed at feeding time?"** Always an animal that's really in one of the enclosures, and the sign has an arrow pointing at its enclosure (up-left, up or up-right). Wrong answers are other animals that live in this zoo. Chosen after everything is placed (`fitDetails`), so it can match. (It used to pick penguins, seals or monkeys too, none of which live here, and could name elephants with no elephant in sight: testers found that confusing.)

## Colour schemes

`sunny` and `evening`. Light: haze near the trees, sun on the enclosures and shade by the fence, the path a little darker in front.
