import { writeFileSync } from 'fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { knobsForLevel } from '@/games/lookRemember/ladder';
import { generateScene } from '@/scenes/generateScene';
import { getRecipe } from '@/scenes/recipes';
import { SceneContent } from '@/scenes/SceneView';
import { SCENE_WIDTH, ratioOf } from '@/scenes/types';
const SIZE = { width: 393, height: 511 };
const picks: [string, number, number, string[]?][] = JSON.parse(process.env.PICKS!);
const aspect = Number(process.env.ASPECT ?? 1.5);
const cells = picks.map(([id, seed, focus, leftOut], i) => {
  const made = generateScene(getRecipe(id), knobsForLevel(9), seed, SIZE);
  const spec = { ...made, groups: made.groups.filter((g) => !leftOut?.includes(g.kind)) };
  const h = SCENE_WIDTH * ratioOf(SIZE); const ch = SCENE_WIDTH / aspect;
  const W = 260;
  return `<figure><figcaption>${id} ${seed} ${focus}${focus * h + ch > h + 0.5 ? ' ✗ past bottom' : ''}</figcaption>` + renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 ${focus * h} ${SCENE_WIDTH} ${ch}`} width={W} height={W / aspect} style={{ borderRadius: aspect === 1 ? W / 2 : 10 }}>
      <SceneContent spec={spec} pointsPerUnit={W / SCENE_WIDTH} overlay={false} />
    </svg>).replace(/\bs(«|R|_)/g, `c${i}$1`) + '</figure>';
});
writeFileSync(process.argv[2], `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:8px;background:#222;color:#ddd;font:11px system-ui;display:flex;flex-wrap:wrap;gap:8px}figure{margin:0}</style>${cells.join('')}`);
