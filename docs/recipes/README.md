# Recipes

A recipe is one setting the game can draw. There are 4:

| Recipe | Page | Code | Things |
| --- | --- | --- | --- |
| At the beach | [beach.md](beach.md) | `src/scenes/recipes/beach.tsx` | 17 |
| City street | [city.md](city.md) | `src/scenes/recipes/city.tsx` | 20, plus house colours and numbers |
| Living room | [living-room.md](living-room.md) | `src/scenes/recipes/livingRoom.tsx` | 17 |
| On the farm | [farm.md](farm.md) | `src/scenes/recipes/farm.tsx` | 17, plus the barn's colour |

[reference.md](reference.md) lists every band, colour scheme and thing (size, count, colours, habits), generated from the code with `npm run docs:recipes`.

Each recipe first appears at a level (`RECIPE_UNLOCKS` in `src/games/lookRemember/ladder.ts`): beach 1, living room 3, city street 6, farm 10. The game never plays the same recipe twice in a row. To add one, see [Adding a recipe](../adding-a-recipe.md).
