/**
 * Points for a round of Look & Remember. Right answers are worth more at higher levels; answering several
 * right in a row and being ready before the time is up add a bonus. Slow answers never cost points.
 */

export interface PointsBreakdown {
  /** Right answers × points per answer at this level. */
  answers: number;
  perAnswer: number;
  /** Right answers in a row. */
  streak: number;
  /** Ready before the time ran out. */
  ready: number;
  total: number;
}

export const pointsPerAnswer = (level: number) => 100 + 10 * (Math.max(1, level) - 1);
/** Extra for each answer in a run of right answers, times its place in the run (2nd +20, 3rd +40…). */
const STREAK_STEP = 20;
/** Per spare second, per right answer. */
const READY_STEP = 5;

export function pointsFor({
  correct,
  level,
  viewSeconds,
  lookedSeconds,
}: {
  /** Per question, in order: answered right or not. */
  correct: boolean[];
  level: number;
  viewSeconds: number;
  lookedSeconds: number;
}): PointsBreakdown {
  const right = correct.filter(Boolean).length;
  const perAnswer = pointsPerAnswer(level);
  let run = 0;
  let streak = 0;
  for (const c of correct) {
    run = c ? run + 1 : 0;
    if (run >= 2) streak += STREAK_STEP * (run - 1);
  }
  const spare = Math.max(0, Math.floor(viewSeconds - lookedSeconds));
  const ready = spare * READY_STEP * right;
  const answers = right * perAnswer;
  return { answers, perAnswer, streak, ready, total: answers + streak + ready };
}

export const formatPoints = (n: number) => n.toLocaleString('en-US');
