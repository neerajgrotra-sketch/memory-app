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

Each enclosure has its own ground, chosen per picture: **grass** or **sand**, at least one of each (`details.palette.enc0`–`enc2`). No one ground suits every animal (they run from a pale zebra to a dark bear), so the contrast rules put each animal where it stands out: giraffes, elephants, zebras and lions on the grass; rhinos, ostriches, kangaroos and bears on the sand. A real zoo gives animals different habitats too.

## Scale

Sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width). An enclosure is a third of the width less the walls and the screen edges, **0.26 at most**, so the elephant and rhino are young ones (about 2.3 m) and the giraffe is a young one (about 3.5 m tall; a grown one would reach off the top of a small phone). Zebra 2.2 m, lion and bear about 2 m, ostrich 2.5 m tall, kangaroo 1.6 m.

**Left out:** penguins, monkeys, parrots and other animals under about 1 m: at the 44 pt minimum they'd be drawn as big as a person.

## Things (18)

- **Sky:** the sun, birds, hot-air balloons, a plane.
- **Enclosures:** giraffe, elephant, zebra, lion, rhino (one of each at most); ostriches and kangaroos (up to 3); bear.
- **Path:** visitors, zookeepers (green uniform and hat), benches, pushchairs, a balloon seller (the balloons' colour is asked), a signpost.

## The feeding-time sign

On the fence in the middle (`keepClear`). Chosen per picture:

- **"What time was feeding time?"** On every level. A printed time on the clock-face steps (whole hours, half past, quarters); wrong answers are digit slips.
- **"Which animals were being fed at feeding time?"** Always an animal that's really in one of the enclosures, and the sign has an arrow pointing at its enclosure (up-left, up or up-right). Wrong answers are other animals that live in this zoo. Chosen after everything is placed (`fitDetails`), so it can match. (It used to pick penguins, seals or monkeys too, none of which live here, and could name elephants with no elephant in sight: testers found that confusing.)

## Colour schemes

`sunny` and `evening`. Light: haze near the trees, sun on the enclosures and shade by the fence, the path a little darker in front.
