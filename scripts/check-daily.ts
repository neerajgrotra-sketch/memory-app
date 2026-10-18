/**
 * Checks the streak and Daily Challenge rules (src/games/lookRemember/daily.ts): runs of days, a streak
 * staying alive until you play today, breaks, best streaks, midnight, daylight saving, the week strip
 * and the daily seed. Run with `npm run check:daily` (it also runs in two time zones).
 */
import { addDays, dailySeed, streakOf, weekOf } from '@/games/lookRemember/daily';
const at = (day: string, h = 10) => ({ playedAt: new Date(`${day}T${String(h).padStart(2, '0')}:00:00`).toISOString(), mode: 'levels' } as any);
let failed = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(ok ? '✓' : '✗', name, ok ? '' : `got ${JSON.stringify(got)}`);
};
check('3 days to today', streakOf([at('2026-10-15'), at('2026-10-16'), at('2026-10-17')], '2026-10-17'), { current: 3, playedToday: true, best: 3 });
check('alive until played today', streakOf([at('2026-10-15'), at('2026-10-16')], '2026-10-17'), { current: 2, playedToday: false, best: 2 });
check('broken', streakOf([at('2026-10-14'), at('2026-10-15')], '2026-10-17'), { current: 0, playedToday: false, best: 2 });
check('best from history', streakOf([at('2026-10-01'), at('2026-10-02'), at('2026-10-03'), at('2026-10-04'), at('2026-10-17')], '2026-10-17'), { current: 1, playedToday: true, best: 4 });
check('late night and early morning are different days', streakOf([at('2026-10-16', 23), at('2026-10-17', 0)], '2026-10-17'), { current: 2, playedToday: true, best: 2 });
check('across a DST change', [addDays('2026-03-28', 1), addDays('2026-03-29', 1), addDays('2026-10-25', -1)], ['2026-03-29', '2026-03-30', '2026-10-24']);
check('week starts Monday (17 Oct 2026 is a Saturday)', weekOf([at('2026-10-12'), at('2026-10-17')], '2026-10-17').map((d) => `${d.label}${d.played ? '+' : ''}${d.isToday ? '*' : ''}${d.future ? '~' : ''}`), ['M+', 'T', 'W', 'T', 'F', 'S+*', 'S~']);
check('seed same all day, differs by day', [dailySeed('2026-10-17') === dailySeed('2026-10-17'), dailySeed('2026-10-17') !== dailySeed('2026-10-18')], [true, true]);
if (failed) process.exit(1);
