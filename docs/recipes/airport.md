# At the airport (`airport`)

Code: `src/scenes/recipes/airport.tsx`. Exact sizes, counts and colours: [reference](reference.md#at-the-airport-airport). First appears at **Level 26**.

## Bands

| Band | Height | How things sit |
| --- | --- | --- |
| In the sky | 0–24% | `air`, 1 row, seen through the window, `faraway` |
| Out on the airfield | 26–42% | `ground`, 1 row, at most 3 kinds, seen through the window (a runway in the backdrop), `faraway` |
| (the wall) | 43–62% | backdrop only: the wall below the glass, with the flight screen on its stand (`keepClear`) |
| In the departure lounge | 62–100% | `ground`, 2 rows |

## Scale

Two scales, on purpose. **Inside**, the lounge is true to the shared person (1.7 m, 1 m ≈ 0.115 of the width): a luggage trolley 1.4 m, a row of seats 2.2 m, a coffee kiosk and the information desk 2 m. **Out of the window** everything is a long way off, so it's drawn much smaller, as it really looks (about 1 m ≈ 0.02): a parked jet about 25 m, a fuel truck and a baggage train about 8 m, the control tower. That's how a 40 m plane and a person can share one picture without either being the wrong size, which an outdoor apron scene couldn't do.

This also keeps it different from the train station: no platform clock or departure time, but a flight number and a gate.

## Things (15)

- **Sky:** planes, a helicopter (colour asked), birds.
- **Airfield:** a parked plane (extra wide; the stripe in its airline colour asked), a fuel truck, a baggage train, the control tower.
- **Lounge:** travellers (shirt colour asked), pilots (navy uniform, gold cuffs, peaked cap), flight attendants pulling a wheeled case (uniform colour asked), luggage trolleys (the big suitcase's colour asked), a row of seats (colour asked), a coffee kiosk (awning colour asked), an information desk (in the airport's blue, so it shows on the pale floor), potted plants.

## Detail facts

From the flight screen, chosen per picture:

- **"What was the flight number?"** GL 121–879; wrong answers one along, ten more, or two digits swapped.
- **"Which gate was the flight leaving from?"** A–D and 2–28 (like B12); wrong answers one along, ten more, or the same number at the next letter.
- **"Where was the flight on the screen going?"** Paris, Rome, Madrid, Berlin, Athens, Lisbon, Dublin or Oslo.

## Colour schemes

`day` (a blue sky) and `evening` (an orange sky). Light: haze over the far airfield, light from the window on the lounge floor. Marks: floor tile lines.
