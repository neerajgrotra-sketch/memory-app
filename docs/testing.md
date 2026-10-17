# Testing and reviewing

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (Expo config) |
| `npm run check:questions` | Checks every question's wrong options are believable in every place (nothing offered in a band it can't be in, no empty options) and every picture gives at least 12 questions; no band is named after a thing that can stand in it ("Where was the campfire? Around the campfire") |
| `npm run check:daily` | Checks the streak and Daily Challenge rules (days in a row, midnight, daylight saving, the week strip), in two time zones |
| `npm run check:peeks` | Checks the Peek rules (earning, the cap of 3, spending, the wallet rebuilt from saved rounds, half points for a peeked answer) and prints how often Peeks come at a few levels |
| `npm run check:scenes` | Checks the level rules and points, then generates 59,400 scenes and checks every rule (below) |
| `npm run gallery` | Renders pictures to `gallery.html` for reviewing by eye |
| `RECIPE=farm npm run lineup` | Draws a recipe's things side by side at their real sizes (`lineup.html`), to check sizes and shapes against each other |
| `npm run docs:recipes` | Regenerates `docs/recipes/reference.md` and `docs/questions-examples.md` from the code |

Run all of them before shipping a change to recipes, layout or questions.

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
- **Tester mode** (hidden): in Profile, tap the version number 7 times. Every place then counts as unlocked in My places, so you can play any one place at any level, in levelled play and Practice. A "Tester mode" section appears in Profile to turn it off again (which also switches every place back on); the game page shows a red reminder while it's on. Its **Unlimited Peeks** switch lets you peek on any question, any number of times, without earning Peeks first (half points still apply; these peeks aren't saved against real ones).
- **Fresh install:** to see the first-launch welcome and the first-round profile prompt again, use a private browser window (web), or clear the app's data.
