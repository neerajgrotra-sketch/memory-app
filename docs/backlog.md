# Backlog

Ideas we've agreed are worth doing but have parked for now, with enough detail to pick each one up later (in any chat). Newest decisions at the top of each section. When one is built, move it to the CHANGELOG and delete it here.

## Next up

- **Real-phone builds.** Android test build (`--profile preview`) now; iPhone TestFlight once there's a personal Apple Developer account (not the Gildan one). See [building.md](building.md).
- **Tests on every change.** Run the checks automatically on each push, and move the browser play-tests into the repo.

## Games

- **Pairs (card matching), game #2.** Cards shown face up for a few seconds, then flipped; find the pairs. Card faces are our own item drawings, one place's deck per round (a beach deck, a farm deck), unlocking with Look & Remember's places. Self-adjusting levels: bigger grids (2×3 up to 5×6), less look-first time, lookalike pairs (same thing, different colour) at high levels. Timed rounds give +5 s per match and never end in "you lost"; a relaxed mode has no timer. Build in its own chat and branch (`claude/match-game`); the starter message is in the conversation of 19 Oct 2026.
- **Daily workout across games.** Once there's a second real game, the daily card becomes one quick round of two or three games, with one streak for the whole app.
- **Other planned games** (tester-mode "Coming soon" tiles, `src/games/ComingSoon.tsx`): Where Was It?, Spot the Change, Odd One Out, What Comes Next?, Quick Count.

## Celebrations

- **A proper level-up moment.** Light rays bursting behind the level ring, confetti in glance colours, the new number popping in, a praise line about what you actually did ("Sharp eyes! 5 out of 5 at the zoo"), then one big "Play Level N" button.
- **Bigger milestones.** Every 5th level (a new title) gets the biggest version: a title badge, a longer burst and a fanfare.
- **The glance eye as a mascot.** The logo's eye, drawn in our flat style, blinking, winking and "smiling" on celebrations (and later on the welcome and empty screens). Not a 3D character: we can't match that quality, and a weak copy looks cheap.
- **Keep the ladder of moments:** nothing loud for an ordinary round; respect Reduce Motion (a plain fade); a tap skips the animation.

## Sound

- **A professional sound set.** One cohesive palette (soft marimba, kalimba, felt piano, light bells, all in one key), AAC at 128 kbps or more, matched loudness, no silence at the start. Includes the missing moments: Peek, a place unlocking, the streak, the daily challenge, level-up and milestone fanfares. Best done by a hired sound designer from a written brief, or from licensed libraries.
- **Music (parked).** A relaxed loop for menus only, ducking under effects, with separate Music and Effects switches; no music while looking at a picture by default.
- **Place ambiences.** Waves at the beach, birdsong in the park, a crackling campfire, station announcements.

## Pictures

- **Depth in the outdoor places.** Things in the nearest band drawn bigger than those at the back (as in the classroom, about 1.25×): beach, park, farm, campsite, zoo.
- **Fuller supermarket shelves.** Faint background stock so shelves don't look half empty, without being confused with the things questions ask about.
- **People with their dogs, prams and kites.** Owners walking dogs, someone pushing a pram, a child holding a kite string.
- **Art direction.** A written style guide (light, outlines, palette, faces, animals); decide whether an illustrator redraws the shared things.

## The app

- **Accounts, cloud sync and family profiles** (behind the existing `ProfileStore` and `StatsStore` interfaces; see the README).
- **Colour-blind mode and a text-size setting.**
- **Onboarding:** a guided first round.
- **Reminders** and a weekly progress card.
- **Crash reporting and analytics**, then tuning difficulty on real data.
- **A business model:** a generous free tier; a subscription or one-off purchase for more places, unlimited Peeks and future games.
- **Store readiness:** privacy policy, listings, screenshots, removing the tester tools from store builds (done: `EXPO_PUBLIC_TESTER_TOOLS=off`).
