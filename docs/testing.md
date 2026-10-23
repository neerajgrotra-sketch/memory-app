# Testing and reviewing

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (Expo config) |
| `npm run check:questions` | Checks every question's wrong options are believable in every place (nothing offered in a band it can't be in, no empty options) and every picture gives at least 12 questions; no band is named after a thing that can stand in it ("Where was the campfire? Around the campfire") |
| `npm run check:levels` | Plays rounds and 10-round sessions at every level: something new on every level, no level easier than the one before, no jump in hard questions, no kind of question before its level, no wording asked round after round |
| `npm run check:daily` | Checks the streak and Daily Challenge rules (days in a row, midnight, daylight saving, the week strip), in two time zones |
| `npm run check:peeks` | Checks the Peek rules (earning, the cap of 3, spending, the wallet rebuilt from saved rounds, half points for a peeked answer) and prints how often Peeks come at a few levels |
| `npm run check:speed` | Checks the Super Speed Round: 8 quick questions from 1,500 pictures at Levels 5–30, each answer true to the picture, about half Yes, none giving another away; when it comes (4 to 6 rounds from Level 5); the prizes; and 50:50s won, spent, capped and the answers they take away |
| `npm run check:boss` | Checks the boss rounds: each harder than its level (more kinds of thing, less time per thing), 150 pictures of each on three iPhones against every scene rule, always a round of 5, announced by its level, and badges counted from saved rounds |
| `npm run check:journey` | Checks the journey: a stop for every level, each place at the level it unlocks with a line of story, challenges between, the Final Boss last, and every place's postcard picked and inside its picture |
| `npm run check:scenes` | Checks the level rules and points, then generates 61,800 scenes and checks every rule (below) |
| `npm run gallery` | Renders pictures to `gallery.html` for reviewing by eye |
| `RECIPE=farm npm run lineup` | Draws a recipe's things side by side at their real sizes (`lineup.html`), to check sizes and shapes against each other |
| `npm run docs:recipes` | Regenerates `docs/recipes/reference.md` and `docs/questions-examples.md` from the code |

Run all of them before shipping a change to recipes, layout or questions.

**Not automated yet:** these run by hand before each release; nothing runs them on every push, and the browser play-tests used during the betas (Playwright scripts that play rounds in the web build) aren't in the repo. Both are next steps, along with testing on real phones.

## The scene checker (`scripts/check-scenes.ts`)

First it checks the [level rules](levels-and-scoring.md): 3 good rounds go up, 2 very poor rounds in a row go down, never below 1 or above 30, best never drops, no level easier than the one before, and a worked points example.

Then, for iPhone SE (375 × 575 pt picture), iPhone 15 (393 × 687) and Pro Max (430 × 767), every recipe, the three Practice bands and levels 1, 4, 6, 8, 10, 12, 14, 17 and 30 (each with only the places it has reached), it generates 200 scenes (`SCENES=40 npm run check:scenes` for a quick run, `ONLY=farm npm run check:scenes` for one recipe). For each scene:

- runs `validateScene`; any problem fails the run, with a count per problem
- checks that the level's kinds were placed. One kind short in more than 20% of pictures, two short in more than 2%, or three short ever, fails.
- checks the question count. More than 10% of pictures with fewer than 12 questions fails.
- for every 10th scene, lays it out again for the other two phones and checks that the facts (kind, count, colour, band, side) never change.

It also checks every recipe as a whole:

- every thing's size is inside its tier
- every thing has something to check contrast with, and can stand out somewhere
- the city's windows, doors and house numbers never overlap or leave their building
- every thing turns up at least once (checked on the Practice bands; small low-level pictures may never pick some things).

Sizes, rules and thresholds are kept in the code, not here. The checker prints what failed in words, such as `zone: palm tree crosses out of sand (×3)`.

## The gallery (`scripts/gallery.tsx`)

```bash
npm run gallery                                     # Hard, 2 pictures per setting and phone, with the overlay
RECIPES=city LEVEL=medium N=4 OVERLAY=0 npm run gallery
SEEDS="977 3908" RECIPES=city npm run gallery       # exact pictures
```

Open `gallery.html` in a browser. Each picture is captioned with its setting, level, seed, phone and `validateScene` result. With the overlay you see boxes, clearances, the slot grid, bands and thirds.

**Look at the pictures, not just the checker.** The rules prove that nothing overlaps; only a person can see that something is in a silly place. Most of the habits in [Design decisions](design-decisions.md) came from looking.

## On a phone (Expo Go)

```bash
npx expo start --tunnel --clear
```

- **Layout overlay:** in the memorise header, ▦ turns it on. The timer waits while it's on, so you can check the layout on the real screen.
- **"I'm ready"** skips to the questions, so you can check them quickly.
- **My places** (on the Look & Remember page): switch off the places you're not tuning.
- **Tester mode** (hidden; not in store builds, see [building.md](building.md)): in Profile, tap the version number 7 times. Every place then counts as unlocked in My places, so you can play any one place at any level, in levelled play and Practice. A "Tester mode" section appears in Profile to turn it off again (which also switches every place back on); the game page shows a red reminder while it's on. The game page gets a **Tester: play any level** grid (1 to 30): tap a level and Play starts there (a "start again" at that level, `statsStore.restart(gameId, level)`; history, high score and best level are kept). It also shows six **planned games** on the Games tab as "Coming soon" tiles (`src/games/ComingSoon.tsx`), to preview the hub with more games. Its **Peek time** setting (1 to 5 s; 3 s is the standard) changes how long a Peek lasts, to find the best length. Its **Unlimited Peeks** switch lets you peek on any question, any number of times, without earning Peeks first (half points still apply; these peeks aren't saved against real ones). The game page gets a **Tester: play** card to start each kind of round straight away: **Normal round** (at your level), **Speed Round** (a Super Speed Round first, then the normal picture) and **Boss 10 / 20 / 30**. Every boss is also open from the Boss rounds card. On the **journey map** every stop is open in tester mode: its picture shows, and its card's **Tester: play Level N here** plays that level in that stop's place (a "start again" at that level, like the level grid). Its **Speed Round every round** switch (`profile.testSpeed`) opens a Super Speed Round as soon as you tap Play, and another before every new picture, at any level and in Practice (never the Daily Challenge), so the intro, sounds, timer and prizes can be tried again and again; its results and prizes count as usual.
- **Fresh install:** to see the first-launch welcome, the guided first round and the first-round profile prompt again, use a private browser window (web), or clear the app's data.

## On a real phone

Everything so far has been tested in a browser. The first phone builds (see [building.md](building.md)) should check what a browser can't:

- **Speed:** the journey map (up to 15 place pictures at once) scrolls smoothly; pictures appear without a pause; the marker's travel and the postcard flip are smooth.
- **Timing:** the countdown, the Speed Round's 4 seconds and the boss looks feel fair, for children and older players too ("More time to look" on and off).
- **Sound and vibration:** every sound plays on time with the phone's silent switch off, none plays with Sounds off, and vibration matches the moment (a heavy bump for the boss badge, none for ticks).
- **Layout:** nothing hides under the notch, the home bar or a small screen (iPhone SE); text stays readable with the phone's larger text sizes.
- **Interruptions:** a phone call, locking the screen or switching apps while looking at a picture pauses the countdown, and a closed round resumes from Home.
- **First launch:** the welcome, the guided first round, then Level 1; the profile prompt after the first round.
- **Tester tools:** 7 taps on the version in Profile turn them on in `testflight` and `preview` builds only.

