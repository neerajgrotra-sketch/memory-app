/**
 * Checks the boss rounds (src/games/lookRemember/boss.ts): each boss is harder than its level (more kinds of thing,
 * no more time to look, less time per thing); its pictures pass every scene rule on three iPhones and always give a
 * full round of 5; its level announces it; and badges, Peeks and the speed round's count read saved rounds right.
 * Run with `npm run check:boss`.
 */
import { ROUND_SIZE } from '@/game/difficulty';
import { selectQuestions } from '@/game/selectQuestions';
import { BOSSES, BOSS_TO_WIN, bossKnobs, bossesBeaten, bossesOpen } from '@/games/lookRemember/boss';
import { knobsForLevel, unlocksAt } from '@/games/lookRemember/ladder';
import { speedCounterOf } from '@/games/lookRemember/speed';
import { createStage } from '@/scenes/createStage';
import { validateScene } from '@/scenes/validateScene';
import type { RoundResult } from '@/types/stats';

import { PHONES } from './check-scenes-phones';

let failed = 0;
const fail = (message: string) => {
  failed++;
  if (failed < 25) console.log('✗', message);
};
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  else console.log('✓', name);
};

const PICTURES = Number(process.env.SCENES ?? 150);
for (const boss of BOSSES) {
  const base = knobsForLevel(boss.level);
  const knobs = bossKnobs(boss);
  if (knobs.groups <= base.groups) fail(`${boss.badge}: no more kinds of thing than Level ${boss.level}`);
  if (knobs.viewSeconds > base.viewSeconds) fail(`${boss.badge}: more time to look than Level ${boss.level}`);
  if (knobs.viewSeconds / knobs.groups >= base.viewSeconds / base.groups) fail(`${boss.badge}: no less time per thing than Level ${boss.level}`);
  if (!unlocksAt(boss.level).some((n) => n.includes(boss.badge))) fail(`Level ${boss.level} doesn't announce ${boss.badge}`);
  for (const phone of PHONES) {
    let short = 0;
    const issues = new Map<string, number>();
    for (let k = 1; k <= PICTURES; k++) {
      const stage = createStage(knobs, phone.size, undefined, 7919 * k + boss.level, { unlocked: [boss.recipeId] });
      if (stage.scene.recipeId !== boss.recipeId) fail(`${boss.badge}: a picture of ${stage.scene.recipeId}`);
      if (stage.scene.groups.length < knobs.groups) short++;
      for (const issue of validateScene(stage.scene, phone.size.width, phone.size.height)) issues.set(issue.rule, (issues.get(issue.rule) ?? 0) + 1);
      for (const q of stage.questions) if (q.family && !knobs.families?.includes(q.family)) fail(`${boss.badge}: asks "${q.prompt}" (${q.family}), not yet brought in`);
      const round = selectQuestions(stage.questions, { count: ROUND_SIZE, preferredTypes: knobs.preferredTypes, typeCaps: knobs.typeCaps, seenIds: new Set(), previousIds: new Set() });
      if (round.length !== ROUND_SIZE) fail(`${boss.badge}: a round of ${round.length}`);
    }
    if (issues.size) fail(`${boss.badge} on ${phone.name}: ${[...issues].map(([r, n]) => `${r} ×${n}`).join(', ')}`);
    // A busy picture that's a kind short now and then is fine; often short isn't the boss it says.
    if (short / PICTURES > 0.05) fail(`${boss.badge} on ${phone.name}: ${short} of ${PICTURES} pictures short of ${knobs.groups} kinds`);
    else console.log(`✓ ${boss.badge} on ${phone.name}: ${knobs.groups} kinds, ${knobs.viewSeconds} s (Level ${boss.level}: ${base.groups} kinds, ${base.viewSeconds} s); ${short} short`);
  }
}

// Saved rounds.
const r = (o: Partial<RoundResult>) => ({ id: Math.random().toString(36), playedAt: '2026-01-01T00:00:00Z', mode: 'levels', score: 0, total: 5, ...o }) as RoundResult;
check('a boss is beaten with 4 of 5', [...bossesBeaten([r({ boss: 10, score: BOSS_TO_WIN }), r({ boss: 20, score: BOSS_TO_WIN - 1 })])], [10]);
check('bosses open from their level', bossesOpen(19).map((b) => b.level), [10]);
check('a tester can take on any boss', bossesOpen(1, true).map((b) => b.level), [10, 20, 30]);
check('boss rounds never count towards the speed round', speedCounterOf([r({ boss: 10 }), r({ boss: 10 })]).since, 0);

console.log(failed ? `✗ boss: ${failed} problem(s)` : '✓ boss: harder than their levels, valid pictures on every phone, badges counted right');
if (failed) process.exit(1);
