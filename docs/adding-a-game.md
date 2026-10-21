# Adding a game

glance is a set of games grouped by skill. The Games tab, the game pages and the Progress tab are built from the registry in `src/games/registry.ts`.

## What's there

- **Skills** (`SKILLS`, `SKILL_ORDER`): Memory, Attention, Problem solving, Speed. A skill appears on the Games tab only when it has at least one game: no "coming soon" placeholders.
- **Games** (`GAMES`): `id`, `title`, `skill`, `tagline` and `howToPlay` steps.
- **Rounds** are saved as `RoundResult` (`src/types/stats.ts`) with a `gameId`. Rounds from before games existed have none and belong to Look & Remember (`gameIdOf`).
- **Progress** per game comes from `progressOf(results, gameId)` in `src/hooks/useGameProgress.ts`: level, best level, high score, plays.

## Steps

1. **Decide what it trains** and which skill it sits under. A game should feel different to play, not be Look & Remember with another picture.
2. **Add it to `GAMES`** and extend `GameId`.
3. **Its rules** in `src/games/<game>/`: what a round is, how it's scored, and its levels. Reuse the shape of `ladder.ts` (good rounds up, very poor rounds in a row down, best never down) so levels feel the same across games.
4. **Its screens.** The game page (`src/app/game/[id].tsx`) and the play screen (`src/app/play.tsx`) are Look & Remember's today. For a second game, move each game's page content and session into its own component, chosen by `gameId`, and keep the shared parts (level ring, tiles, Play / Practice).
5. **Art** for its card: like `GameArt`, made by the game's own drawing code, so nothing is a stock image.
6. **Progress:** save `gameId` on every round, and make sure the Progress tab's per-game card makes sense for it.
7. **Docs and checks:** a page for its rules, its checks in `npm run check:scenes` or its own script, version bump and CHANGELOG entry.

## Later

- **A daily workout** (a few games in a row) once there are at least three games.
- **Skill ratings** (how you're doing at Memory, Attention…) once a skill has two games to average. They'll compare you only with yourself.

## Planned games

`src/games/ComingSoon.tsx` lists the games we're planning, with a title, skill, tagline, colour and a little picture. In tester mode they show on the Games tab as "Coming soon" tiles, to preview how the hub looks with more games; real players never see them. When a planned game is built, take it out of `PLANNED_GAMES` and add it to `GAMES` in `registry.ts`.
