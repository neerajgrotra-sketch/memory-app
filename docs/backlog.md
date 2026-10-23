# Backlog

Ideas we've agreed are worth doing but have parked for now, with enough detail to pick each one up later (in any chat). Newest decisions at the top of each section. When one is built, move it to the CHANGELOG and delete it here.

## Next up

- **Real-phone builds.** Android test build (`--profile preview`) now; iPhone TestFlight once there's a personal Apple Developer account (not the Gildan one). See [building.md](building.md).
- **Tests on every change.** Run the checks automatically on each push, and move the browser play-tests into the repo.

## The journey (step 1 built in 4.13.0)

Agreed with the tester feedback of 22 Oct 2026: every level is a stop on one trip; build it in steps.

- **Step 2, story and travel:** short story lines between stops, and different ways of travelling on the map (a boat to under the sea, a train to the station, a rocket to the Moon); bosses drawn as landmarks.
- **Step 3, new places, one per release,** each filling a stop that has no place yet (the odd levels), picked from user feedback: a bakery, a fairground, a harbour, a castle, a jungle, a toy shop.
- **Step 4, collections:** a postcard album of the places visited, and the bosses' badges on the map.
- **Unlocking the whole journey** is one of the revenue options below.

## The revenue model (to decide, 23 Oct 2026)

Not decided yet. These are the options on the table, to compare once there are real players and some numbers (how far people get, how often they come back). Whatever we pick, these hold: no pressure on children, never mid-round, never "you lost, pay to continue", and the free game stays a good game.

### Option A: 10 levels free, then $2.99 to unlock the rest (one-off)

- **How it plays:** Levels 1–10 are free (6 places, the guided round, Speed Rounds from Level 5 and the Farm Boss at 10). After the Farm Boss, a friendly screen offers the rest of the journey: Levels 11–30, 9 more places, the Mountain and Final Bosses.
- **Why 10:** it's a natural milestone (the first boss, the farm and a new title), and it's long enough to know whether you like the game: at least 27 good rounds, roughly 30–50 rounds in all.
- **Also unlocks:** every stop on the journey map to visit and play any time, as tester mode does today (4.13.2: every stop open, **Play Level N here**). Keep "your level" separate from "stops open", so the climb still counts.
- **Good:** simple, honest, suits families and older players; one price, no subscriptions; a store "Free with in-app purchase" listing.
- **Watch:** the first-boss wall must feel like an invitation, not a cut-off; a Daily Challenge should stay free for everyone, so lapsed players have a reason to come back.

### Option B: rewarded ads only

- **How it plays:** the player chooses to watch a short video for a reward: a Peek when they have none, another try at a boss, double points for a round. Never interstitials (ads that appear on their own between rounds): they drive casual players away, and in a memory game they'd land right before or after a picture.
- **Earns:** roughly $5–20 per 1,000 rewarded views in the US, much less in many other countries (to check with real numbers). Needs a sizeable audience to matter.
- **Needs:** Google AdMob (`react-native-google-mobile-ads`, which works with our Expo setup through a config setting, in our own build, not Expo Go or the web beta); Google's consent form for Europe and the UK; Apple's "allow tracking?" prompt if ads are personalised; the privacy policy and store privacy forms updated (ads collect device data, ending "nothing leaves the phone").

### Option C: Peek packs (and other small purchases)

- **How it plays:** buy Peeks or 50:50s in packs, for example 10 Peeks for $0.99.
- **Conflicts with a decision on record:** Peeks are "never sold: for a family brain-training game, peeks stay earned only" (`docs/levels-and-scoring.md`). Selling help to answer also blurs what a score means. If we do this, revisit that decision deliberately, and keep the half-points cost so a bought Peek never buys a full score.
- **Gentler variants:** cosmetic purchases (map themes, a marker character, postcard frames) that don't touch scores.

### Combinations to consider

- **A + B:** free to Level 10, optional rewarded ads for Peeks; the $2.99 unlock also removes the ad offers. Likely the best balance.
- **A + more places:** later places sold as packs ("the seaside pack", "the city pack") once there are more than 15.
- **A subscription** (all games, as more arrive): only once there are several games; a single game at $2.99 is easier to say yes to.

### To decide first, whichever we choose

- **Family game or children's app?** If children play, the strictest rules apply: COPPA (no personalised ads for under-13s), Apple's Kids category (no third-party ads in practice), Google's Families programme (certified ad networks only), and parental gates in front of any purchase. This shapes every option.
- **Purchases need:** App Store and Google Play in-app purchases (Expo's in-app purchase options or a service such as RevenueCat), restoring a purchase on a new phone, a clear "what you get" screen, and a way to remember the purchase (a store receipt, or accounts later; today progress lives only on the phone).
- **Store setup:** a paid Apple Developer account and a Google Play developer account, tax and banking details, the privacy policy (see "Store readiness" below), and the stores' privacy forms.
- **Numbers before pricing:** crash reporting and analytics (with the privacy policy updated first) to see how many players reach Level 10, where they stop, and how often they come back. Then pick, and test the price.

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

- **A professional sound set** (prompts to generate one with an AI tool: [sound-prompts.md](sound-prompts.md)). One cohesive palette (soft marimba, kalimba, felt piano, light bells, all in one key), AAC at 128 kbps or more, matched loudness, no silence at the start. Includes the missing moments: Peek, a place unlocking, the streak, the daily challenge, level-up and milestone fanfares. Best done by a hired sound designer from a written brief, or from licensed libraries.
- **Music (parked).** A relaxed loop for menus only, ducking under effects, with separate Music and Effects switches; no music while looking at a picture by default.
- **Place ambiences.** Waves at the beach, birdsong in the park, a crackling campfire, station announcements.

## More question variety (carry the living room's ideas to other places)

The living room (4.1.0) and the beach use five kinds of detail question that any place can reuse:

| Kind | Living room / beach | Good next places |
| --- | --- | --- |
| **Something hiding** (`alsoSeen`, peeking drawn before the spot) | cat behind the sofa or plant; crab under the towel or behind the sandcastle; the mountain's danger-sign animal | park: a squirrel behind a tree trunk; farm: a cat in the haystack, a mouse by the barn door; kitchen: a mouse behind the bin; campsite: a fox behind a tent; zoo: a meerkat behind a rock |
| **Which of two** (left / right / both / neither, by `index`) | which floor lamp was on; which palm tree had coconuts | campsite: which tent had its light on; city: which house had a light in the window; park: which bench had someone on it; farm: which field had the tractor |
| **What's showing / what's it doing** (a per-picture choice drawn on the thing) | what was on the TV; what the cat or dog was playing with | airport and train station: what was on the screens; kitchen: what was in the oven or on the hob; classroom: what was drawn on the board; park: what the dog was chasing (a ball, a stick, a frisbee) |
| **On or off** | the floor lamp | kitchen: the oven light, a tap running; city: street lamps at dusk; classroom: the projector |
| **Counting parts of a thing** (from Level 14) | books on one shelf; coconuts by the palm trees | kitchen: eggs in the box, apples in the bowl; supermarket: tins on the top shelf; city: lit windows on a house; farm: eggs under the hen; zoo: bananas by the monkey |

Rules learned so far: every answer of a "which" or "what" question must really happen, or players learn to rule some out; something hidden or small must still be easy to see on a phone (check at real size); one question per detail per picture when one would give the other away; never a pet or thing that could be confused with one of the place's own countable things.

## Pictures

- **Game pictures that follow your progress** (tester feedback, 22 Oct 2026: the tile and the game page always show the same beach). Today both are one fixed beach picture (`GAME_ART`, `GAME_THUMB` in `src/components/GameArt.tsx`) drawn live by the scene engine, so any of the 15 places can be shown instead. Agreed design:
  - **Games tab tile:** the place of your last round (from the last result's `recipeId`), so it changes most sessions.
  - **Game page picture:** your newest place (the last one `RECIPE_UNLOCKS` gave at your level), so it reflects your level.
  - **Under the level card:** a small postcard of the next place beside "Level 4: A new place: the park"; "All 15 places unlocked" from Level 28. A sample picture, never one you'll be quizzed on.
  - A new player still sees the beach.
  - **The work:** smaller now: 4.13.0 picked a postcard for every place (`placePostcard` and `placeThumb` in `GameArt.tsx`, checked by `check:journey`), so the tile and page can use those; check the tile and the page's wide crop by eye at iPhone SE size.
- **Depth in the outdoor places.** Things in the nearest band drawn bigger than those at the back (as in the classroom, about 1.25×): beach, park, farm, campsite, zoo.
- **Fuller supermarket shelves.** Faint background stock so shelves don't look half empty, without being confused with the things questions ask about.
- **People with their dogs, prams and kites.** Owners walking dogs, someone pushing a pram, a child holding a kite string.
- **Art direction.** A written style guide (light, outlines, palette, faces, animals); decide whether an illustrator redraws the shared things.

## The app

- **Accounts, cloud sync and family profiles** (behind the existing `ProfileStore` and `StatsStore` interfaces; see the README).
- **Colour-blind mode and a text-size setting.**
- **Reminders** and a weekly progress card.
- **Crash reporting and analytics**, then tuning difficulty on real data.
- **A business model:** see "The revenue model" above.
- **Store readiness:** privacy policy, listings, screenshots, removing the tester tools from store builds (done: `EXPO_PUBLIC_TESTER_TOOLS=off`).
