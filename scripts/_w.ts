import { selectQuestions } from '@/game/selectQuestions';
import { knobsForLevel, recipesForLevel } from '@/games/lookRemember/ladder';
import { createStage } from '@/scenes/createStage';
const size = { width: 393, height: 640 };
const repeats: Record<string, number> = {}; let total = 0, rep = 0;
for (const level of [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]) {
  const knobs = knobsForLevel(level); const unlocked = recipesForLevel(level);
  for (let s = 0; s < 40; s++) {
    let prev: string | undefined; let last = new Set<string>(); const prompts = new Set<string>();
    for (let r = 0; r < 10; r++) {
      const st = createStage(knobs, size, prev, 99991 * level + 7919 * s + 131 * r, { unlocked }); prev = st.scene.recipeId;
      const qs = selectQuestions(st.questions, { count: 5, preferredTypes: knobs.preferredTypes, typeCaps: knobs.typeCaps, seenIds: new Set(), previousIds: new Set(), previousTemplates: last });
      last = new Set(qs.flatMap((q) => (q.template ? [q.template] : [])));
      for (const q of qs) { total++; const shape = q.prompt.replace(/the [a-z' -]+?(\?|,| on | in | above | below | between |$)/gi, 'the X$1'); if (prompts.has(shape)) { rep++; repeats[shape] = (repeats[shape] ?? 0) + 1; } prompts.add(shape); }
    }
  }
}
console.log('repeat %', ((100 * rep) / total).toFixed(1));
for (const [k, v] of Object.entries(repeats).sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(((100 * v) / rep).toFixed(1).padStart(5), k.replace(/\n/g, ' / '));
