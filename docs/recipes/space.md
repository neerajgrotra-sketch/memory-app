# On the Moon (`space`)

Code: `src/scenes/recipes/space.tsx`. Exact sizes, counts and colours: [reference](reference.md#on-the-moon-space). First appears at **Level 28**: the last of the planned places.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| Out in space | 0–34% | `air`, 1 row, at most 3 kinds (one per third), `faraway` (never "above" anything on the ground); stars in the backdrop |
| (the hills) | 34–42% | backdrop only: low grey hills on the horizon |
| Near the hills | 43–63.5% | `ground`, 1 row |
| Close by | 72–100% | `ground`, 2 rows; astronauts are picked first (`usual`) |

The base sign stands between the back and the front (`keepClear`).

## Why the Moon, not open space

Floating in space has no ground, so there are no true sizes and no "where" questions. On the Moon's surface everything on the ground is true to the astronauts (1 m ≈ 0.115 of the width, like the outdoor places): an astronaut in a spacesuit 1.85 m tall, a moon buggy 3 m, a lunar lander 3.5 m wide, a habitat pod 4 m, solar panels 2 m, a boulder 1 m. Everything in the sky (the Earth, satellites, a rocket, a space station, a comet) is a long way off and drawn small, as it really looks.

## Contrast

Black sky, grey dust. White spacesuits would vanish on the dust, so astronauts are `framedColour` with a dark `tone`: their outline is what's checked, and their backpack can be any bright colour. The crater's tone is its shadowed hollow, the part that really shows.

## Things (15)

- **What's happening:** the rocket's engines are firing or not ("Was there fire coming out of the rocket?"); one astronaut on their own may hold a camera or a torch.

- **Out in space:** the Earth, satellites, a rocket (fins colour asked, never mirrored), a space station, a comet.
- **Near the hills:** a lunar lander (extra wide), a habitat pod (extra wide, stripe colour asked), solar panels (spread apart), a radio dish, a flag (held out by a bar at the top, because there's no wind on the Moon).
- **Close by:** astronauts (backpack colour asked), a moon buggy (extra wide, seat colour asked), boulders, a little six-wheeled explorer robot, craters.

## Detail facts

From the base sign, chosen per picture:

- **"What was the mission called on the sign?"** Orion, Apollo, Artemis, Eagle, Phoenix or Falcon.
- **"What number was the moon base on the sign?"** (1–49); wrong answers one or two along, the digits swapped, or ten more.

## Colour schemes

`grey` (grey dust, a black sky) and `dusty` (warmer, browner dust, a deep violet-black sky). Light: sunlight on the dust, a little brighter towards us. Marks: tyre tracks and footprints.
