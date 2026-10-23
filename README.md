# glance

Brain games built with Expo (React Native + TypeScript), Expo Router and Reanimated. The first game is **Look & Remember**: study a picture for a few seconds (or tap **I'm ready** sooner), then answer 5 multiple-choice questions about it from memory. Your level adjusts itself as you play.

## Run it

```bash
npm install
npx expo start --tunnel   # scan the QR code with Expo Go
```

Checks: `npm run typecheck`, `npm run lint` and `npm run check:scenes` (the level rules, points, and 61,800 generated pictures against every layout rule). Review pictures by eye with `npm run gallery` (writes `gallery.html`). After changing a recipe or the levels, run `npm run docs:recipes`. See [docs/testing.md](docs/testing.md).

Every change bumps the version (shown on the Games tab). See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

## Status (4.15.0)

- **Works:** the Look & Remember game with 30 levels, 15 places, points, the Daily Challenge and streak, Peeks, a surprise Super Speed Round and 50:50s, boss rounds with badges at Levels 10, 20 and 30, a journey map of the 30 levels, a guided first round, sounds and vibration. Played and tested in the browser (Expo web), with every automated check passing.
- **Ready, not yet run:** builds for real phones with EAS: TestFlight for iPhone, an APK for Android ([docs/building.md](docs/building.md)).
- **Not yet done:** testing on real phones, crash reporting and analytics, accounts with cloud sync, family profiles, a second game, a professional sound set (the current sounds are placeholders; background music is parked), a colour-blind mode, and a privacy policy and store listing.
- **Branches:** `claude/glance-memory-game-sxcej5` is the main line of work (4.0.0 merged the `claude/glance-games-hub` beta branch into it); `main` is the release line, updated by pull request. New work goes on a short-lived branch per change, not a long-running beta.

## The app

It opens with a short launch animation (an eye opens, **glance** and "Look closer. Remember more." rise in, the eye blinks, about 2.5 s on the first launch and 1.7 s after; a tap skips it). On the very first launch a welcome follows (postcards of the places, "How much can you remember at a glance?" and **Let's go**). Then three tabs:

- **Games**: once you've played, a **daily card** (your 🔥 streak, this week's days, and **today's challenge**: one picture a day, double points, one try), then games grouped by skill, one full-width row each: the game's picture, your level ring and title, and **Play** (straight into your level; **Try it** before your first round). The game you played last comes first in its skill and is marked **Continue**. A skill only appears once it has a game, so today there's **Memory** with Look & Remember. Tapping a row anywhere else opens the game's page.
- **Progress**: each game's level, best level, high score and a chart of your level over time, then your scores, accuracy per question type, practice habits, and **Your levels** (one row per level played, with rounds, best points and average).
- **Profile**: name and age band (optional, asked once after the first round), "More time to look" (+3 s per picture, on by default for 55+), **Sounds** and **Vibration** switches (sound can also be muted in one tap with the speaker button on the Games tab and during a round), and "Clear my details". glance is a game, not a medical test: nothing compares you with other people or claims to measure brain health. Tapping the version number 7 times turns on a hidden tester mode (see [docs/testing.md](docs/testing.md)).

## Look & Remember

**The game page** has a **ⓘ How to play** button by the title (the rules in a pop-up), then shows your level ring and title, what's coming next, then **Play level N** right below it, then your high score, best level, rounds played and perfect rounds, your **Peeks**, **Start again from Level 1**, **My places** (pick which places you train on: places your level hasn't reached show a lock and the level they unlock at, and join automatically when you get there; at least one stays on), and **Practice** (Easy, Medium, Hard). In tester mode it also has a grid to play from any level.

A round:

1. **Memorise**: a brand-new picture with a countdown. Tap **I'm ready** to go to the questions early (it ignores taps in the first second).
2. **Quiz**: 5 questions, 4 options each. The numbered dots turn green or red as you answer. A right answer flashes green and moves on. A wrong answer shakes red, then shows the right one and waits for **Next**. **Skip for now** moves on; skipped questions come back at the end. **👀 Peek** (top right, with how many you hold) flips the picture back in over the question for 3 seconds with a countdown, then flips it away: once a round, never in the Daily Challenge.
3. **Level up** (when you go up a level): an animated ring (it fills, spins, sparks fly, and the new number pops in), your new level, its title at every 5th level, and exactly what's new, with **Play Level N** to carry straight on or **See my results** first.
Closing the app part way through (or leaving with ✕, which asks first) keeps the round: a **Resume** card at the top of the Games tab ("Round in progress · 3 of 5 answered") goes straight back to the next question. It never shows the picture again: remembering it is the game. The countdown pauses while the app is in the background (a phone call).

4. **Result**: your points with how they were earned, how the round moved your level, and every question with all its options (the right answer in green, your wrong pick in red). Tap the picture to see it full size. The main button plays a new picture at your level (**Try again**, **Keep going** or **Play Level N**). After a weaker round, and always in Practice, **Same picture again** replays the picture with different questions as practice: it never moves your level or sets a high score.

**Levels** run from 1 to 30. 3 good rounds (4 or 5 right) take you up a level; 2 very poor rounds in a row (0 or 1 right) take you back one. Your best level never goes down. Every level brings one named new thing: a new place on the even levels (living room at 2, park at 4, city street at 6, kitchen at 8, farm at 10, under the sea at 12, supermarket at 14, train station at 16, zoo at 18, snowy mountain at 20, classroom at 22, night campsite at 24, airport at 26, the Moon at 28), and on the odd ones a new kind of question (details at 3, above and below at 9), a twist (half-past clocks at 7, closer counting at 11, hiding animals at 13, mixed colours at 15) or a step in time or fullness. Sums and sharing come at 11, 27 and 29. Levels 10, 20 and 30 each bring a boss round, with Level 30's the final boss. Players from before levels start at a level worked out from their earlier rounds.

**Points**: each right answer scores 100 at Level 1, plus 10 per level. Right answers in a row add a bonus (+20, +40, +60…), and so does tapping **I'm ready** early (5 points per spare second per right answer). Slow answers never cost points.

**Peeks**: every 3,000 points earns a Peek (about every 6 good rounds at Level 1, every 2 at Level 30); you hold up to 3. A right answer after a peek earns half its points; that's its only cost, and the round still counts towards your level. Peeks are never bought and never cost points you've already scored. The game page shows how many you hold and how far off the next one is.

**Practice** plays a fixed Easy, Medium or Hard round. It earns points but never changes your level.

Full details: [docs/levels-and-scoring.md](docs/levels-and-scoring.md).

## How pictures are generated

Every picture is generated on the device from a **recipe** in a few milliseconds. No network, stored images or AI service is involved. There are 15 recipes: **at the beach**, **living room**, **in the park**, **city street**, **in the kitchen**, **on the farm**, **under the sea**, **in the supermarket**, **at the train station**, **at the zoo**, **on the snowy mountain**, **in the classroom**, **at the campsite at night**, **at the airport** and **on the Moon**, unlocked at Levels 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26 and 28. Each picture picks a different mix of things, counts, colours and positions, and never the same setting twice in a row.

1. **Measure** the picture area (below the header, inside the safe area).
2. **Pick a recipe** and the level's settings:
   - how many kinds of thing
   - the most of one kind
   - whether to ask about house numbers.
3. **Fill and place:**
   - each band (sky, sea, sand…) gets a share of the kinds
   - each group of things gets its own cell of a 3-column slot grid
   - things follow real-world habits: pictures hang at eye level, furniture stands against the wall, flags stand on roofs, hydrants at the kerb, traffic goes one way.
4. **Check** with `validateScene` (overlaps, sizes, spacing, margins, bands, habits, contrast…). A picture that fails is placed again before it is shown.
5. **Draw** with `react-native-svg`: background bands, then faint details, then things back to front, each with an outline in its own darker colour.
6. **Ask** questions written from the same facts (kind, count, colour, band, side, house numbers), so every answer is right by construction.

**Full documentation: [docs/](docs/README.md).**

| Page | What it covers |
| --- | --- |
| [How a picture is made](docs/how-pictures-are-made.md) | The whole pipeline |
| [Layout rules](docs/layout-rules.md) | Sizes, bands, slot grid, spacing, habits, `validateScene` |
| [Drawing](docs/drawing.md) | Layers, outlines, contrast, wide screens, the dev overlay |
| [How questions are generated](docs/questions.md) | Question types, when they're asked, wrong options, picking a round |
| [Question examples](docs/questions-examples.md) | Real pictures and every question written from them (generated) |
| [Recipes](docs/recipes/README.md) | One page per setting, plus generated reference tables |
| [Recipe questionnaire](docs/recipe-questionnaire.md) | The questions that define a new setting |
| [Adding a recipe](docs/adding-a-recipe.md) | Step by step, with a checklist |
| [Testing and reviewing](docs/testing.md) | Scene checker, gallery, overlay in Expo Go |
| [Building for real phones](docs/building.md) | EAS builds: TestFlight for iPhone, an APK for Android, the stores |
| [Levels and scoring](docs/levels-and-scoring.md) | Look & Remember's 30 levels, moving up and down, points |
| [Adding a game](docs/adding-a-game.md) | The game registry and what a new game needs |
| [Design decisions](docs/design-decisions.md) | Why the rules are what they are |
| [Backlog](docs/backlog.md) | Ideas agreed but parked for now |

## Project layout

```
docs/                  How pictures and questions are made (start at docs/README.md)
  recipes/             One page per setting + reference.md (generated)
scripts/
  check-scenes.ts      npm run check:scenes: level rules, points, 61,800 scenes against every rule
  check-questions.ts   npm run check:questions: every question's wrong options are believable
  check-daily.ts       npm run check:daily: streak and Daily Challenge rules, in two time zones
  check-peeks.ts       npm run check:peeks: earning, holding and spending Peeks
  check-speed.ts       npm run check:speed: the Super Speed Round's questions, timing and prizes, and 50:50s
  check-boss.ts        npm run check:boss: boss rounds harder than their levels, valid pictures on every phone, badges
  check-journey.ts     npm run check:journey: a stop for every level, places with stories and postcards
  gallery.tsx          npm run gallery: pictures to gallery.html for reviewing by eye
  lineup.tsx           npm run lineup: a recipe's things side by side at their real sizes
  recipe-reference.ts  npm run docs:recipes: regenerates docs/recipes/reference.md and question examples
  sounds/              The script that made the placeholder applause and "aww"
src/
  app/                 Expo Router screens
    (tabs)/            The tab bar: index (Games), progress, profile
    game/[id].tsx      A game's page: level, records, Play, Practice, how to play
    play.tsx           A session of Look & Remember (levels or practice)
  components/          Countdown (Reanimated), Memorise/Quiz/Result stages, Peek, daily card, level ring, level-up screen, charts, game art
  games/
    registry.ts        Every game and skill; the Games tab is built from it
    lookRemember/      ladder.ts (levels 1–30, moving up and down, unlocks, titles), points.ts, daily.ts (Daily Challenge, streak), peeks.ts,
                       savedRound.ts (the round in progress, for Resume)
  game/                Pure game logic: practice bands, question selection, option shuffling, quiz navigation, score messages
  feedback/            Sounds (placeholder files in assets/sounds/, swap them freely) and vibration for the game's moments
  hooks/               useGameSession (memorise → quiz → result → next picture, scoring and levels), useGameProgress
  scenes/
    recipes/           One file per setting (15: beach, livingRoom, park, city, kitchen, farm, underSea, supermarket,
                       trainStation, zoo, snowyMountain, classroom, nightCampsite, airport, space) + the registry
    items/common.tsx   Things shared across settings (people, dogs, birds, trees…)
    clock.tsx          The clock face and time questions shared by clocks in several places
    texture.tsx        Ground texture (sand grains, grass blades, glints) drawn as one path each
    layout.ts          Layout rules and geometry: tiers, margins, slot grid, arrangements of copies
    generateScene.ts   Fills a recipe with contents and lays them out (and again for another size)
    validateScene.ts   Checks a laid-out scene against every rule
    generateQuestions.ts  Writes every question a scene can answer
    createStage.ts     Recipe + level → playable picture and question pool
    SceneView.tsx      Draws a scene (layers, outlines) and fits it to the screen
    LayoutOverlay.tsx  Dev-only overlay of boxes, slot grid, bands and thirds
    marks.tsx          Faint backdrop details kept clear of things
    contrast.ts        OKLab contrast, lightness and outline shades
    variant.ts         A scene's colour scheme with its per-picture details (house colours)
  profile/             ProfileStore (on-device) and ProfileProvider / useProfile
  stats/               StatsStore (on-device) and pure summaries (trends, practice)
  types/               Domain types (game, stats, profile)
```

## Moving to Supabase

The profile is stored behind a `ProfileStore` interface (`src/profile/profileStore.ts`), shaped like `Profile` in `src/types/profile.ts`. It has a random `id` from first launch, so a future account can claim it.

Progress is stored behind a `StatsStore` interface. To sync across devices, implement `StatsStore` against a `round_results` table shaped like `RoundResult` in `src/types/stats.ts`, and point `statsStore` at it in `src/stats/index.ts`.
