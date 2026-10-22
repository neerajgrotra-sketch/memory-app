import { knobsForLevel } from '@/games/lookRemember/ladder';
import { generateScene } from '@/scenes/generateScene';
import { generateQuestions } from '@/scenes/generateQuestions';
import { getRecipe } from '@/scenes/recipes';
import { validateScene } from '@/scenes/validateScene';
const SE = { width: 375, height: 667 - 20 - 72 };
for (const [level, id] of [[10, 'farm'], [20, 'snowy-mountain'], [30, 'space'], [20, 'zoo'], [30, 'night-campsite'], [30, 'airport']] as const) {
  for (const extra of [1, 2, 3]) {
    const base = knobsForLevel(level);
    const k = { ...base, groups: base.groups + extra, maxCount: Math.min(7, base.maxCount + 1) };
    let placed = 0, issues = 0, qs = 0, short = 0; const N = 150;
    for (let n = 1; n <= N; n++) { const s = generateScene(getRecipe(id), k, n * 7919, SE); placed += s.groups.length; if (s.groups.length < k.groups) short++; issues += validateScene(s, SE.width, SE.height).length; qs += generateQuestions(s, getRecipe(id), k).length; }
    console.log(level, id, `+${extra} want ${k.groups}`, 'placed', (placed / N).toFixed(1), 'short', short, 'issues', issues, 'qs', (qs / N).toFixed(0));
  }
}
