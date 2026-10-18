# At the train station (`train-station`)

Code: `src/scenes/recipes/trainStation.tsx`. Exact sizes, counts and colours: [reference](reference.md#at-the-train-station-train-station). First appears at **Level 16**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| Hanging from the roof | 3–23% | `air`, 1 row: things hang under the glass roof, either side of the departure board (kept clear) |
| On the track | 27–53% | `ground`, 1 row, at most 2 kinds: a train or a freight wagon (one extra-wide thing), and a signal |
| On the platform | 58.5–100% | `ground`, 2 rows |

The backdrop: a glass roof on arched steel trusses, a brick wall behind the track, gravel, sleepers and rails, the platform edge with its yellow safety line, and paving lines (marks).

## Scale

A wide scene, sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a bench 1.8 m, a vending machine about 1.8 m tall, a coffee cart and luggage trolley about waist to chest high. The train is drawn about 3 m tall (a little short of life) so it fits the track band on small phones. **Suitcases and bins are left out:** at the 44 pt minimum they'd look giant next to people, so a luggage trolley piled with cases stands in for them.

## Things (14)

- **Roof:** a station clock (one), hanging lamps (spread apart), hanging baskets of flowers.
- **Track:** a train (the front of one, with its windscreen and lights; colour asked), a freight wagon, a railway signal.
- **Platform:** passengers (the shared person), dogs, benches (spread apart), a vending machine, a ticket machine, luggage trolleys (the big suitcase's colour is asked), a coffee cart, a newspaper stand.

**The signal** only ever shows real signal colours: red, yellow or green. Its light sits inside a black housing, so it's marked `framedColour`: the contrast rules check the housing against the wall, not the light. (Before that, red and green lights blended into the brick, so every signal was yellow and the question always had the same answer.)

## The departure board: three details on one sign

Always there, at the top in the middle (`keepClear`, so nothing hangs in front of it). Chosen per picture:

- **"What time was the next train?"** A digital time, asked on every level: whole hours or half past below Hard, **any minute on Hard** (wrong answers: the minute digits swapped, an hour or ten minutes off, a 1 and a 7 mixed up).
- **"Which platform was the next train leaving from?"** Platform 1–9; wrong answers one or two along, or ten more.
- **"Where was the next train going?"** Seaside, Hilltop, Riverside, Castle Town, Airport or Lakeside.

Plus **"What time was on the station clock?"** whenever the clock is hanging there (a clock face, so it follows the clock-face steps). Two different times in one picture is the challenge: the board's and the clock's.

A round asks at most two of these (the variety rule's limit for detail questions), so station rounds usually include two.

## Colour schemes

`day` (a pale glass roof) and `evening` (a warm sunset through the glass). Light: daylight through the roof, shade under its edge on the far wall, the platform a little darker in front.
