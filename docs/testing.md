# Testing and reviewing

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (Expo config) |
| `npm run check:scenes` | Generates 5,400 scenes and checks every rule (below) |
| `npm run gallery` | Renders pictures to `gallery.html` for reviewing by eye |
| `npm run docs:recipes` | Regenerates `docs/recipes/reference.md` from the recipes |

Run all of them before shipping a change to recipes, layout or questions.

## The scene checker (`scripts/check-scenes.ts`)

For iPhone SE (375 × 575 pt picture), iPhone 15 (393 × 687) and Pro Max (430 × 767), every recipe and every level, it generates 200 scenes (`SCENES=40 npm run check:scenes` for a quick run). For each scene:

- runs `validateScene`; any problem fails the run, with a count per problem
- checks that the level's kinds were placed. One kind short in more than 20% of pictures, two short in more than 2%, or three short ever, fails.
- checks the question count. More than 10% of pictures with fewer than 12 questions fails.
- for every 10th scene, lays it out again for the other two phones and checks that the facts (kind, count, colour, band, side) never change.

It also checks every recipe as a whole:

- every thing's size is inside its tier
- every thing has something to check contrast with, and can stand out somewhere
- the city's windows, doors and house numbers never overlap or leave their building
- every thing turns up at least once.

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
- **Fresh install:** to see the first-round profile prompt again, use a private browser window (web), or clear the app's data.
