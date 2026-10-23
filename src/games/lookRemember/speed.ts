import type { LevelConfig } from '@/game/difficulty';
import { pointsPerAnswer } from '@/games/lookRemember/points';
import { createRng } from '@/scenes/random';
import type { Question } from '@/types/game';
import type { RoundResult } from '@/types/stats';

/**
 * The Super Speed Round: a surprise bonus round of quick Yes / No questions about a picture of its own, every 4 to 6
 * Levels rounds from Level 5. It wins Peeks and 50:50s, and never moves your level or sets a high score.
 */

export const SPEED_FROM_LEVEL = 5;
export const SPEED_QUESTIONS = 8;
/** Seconds to answer each question (more with "More time to look"). */
export const SPEED_SECONDS = 4;
export const SPEED_EXTRA_SECONDS = 2;

/** A quick question: a question from the picture's pool and one guess at its answer ("How many boats were there? 3?"). */
export interface SpeedQuestion {
  id: string;
  /** The question, or for a statement ("The kites were red.") the statement itself. */
  prompt: string;
  /** The guess to say Yes or No to; missing when the prompt is a Yes / No question or a statement. */
  guess?: string;
  /** Whether Yes is right. */
  yes: boolean;
}

const YES_NO = /^(Yes|No)\b/;
/** Kinds of question quick enough to read and answer in a few seconds. */
const QUICK = new Set(['true-false', 'count', 'colour', 'what-here', 'detail', 'story', 'seen']);
/**
 * At most this many of the commonest kinds a round, so speed rounds don't feel alike (how many and what colour were
 * over half of them). Lifted only if a picture can't make eight without.
 */
const SPEED_CAPS: Record<string, number> = { count: 2, colour: 2 };

/**
 * A speed round's picture asks what the level asks, plus true or false at any level: every speed question is a Yes
 * or No, so a statement is what it's made of (normal rounds stop true or false after Level 10).
 */
export const speedKnobs = (knobs: LevelConfig): LevelConfig =>
  knobs.families && !knobs.families.includes('true-false') ? { ...knobs, families: [...knobs.families, 'true-false'] } : knobs;
/** "To the right of the plane": one a round, or the bird's and the plane's would answer each other. */
const BESIDE = /^(To the (left|right) of|Between) /;
/** Questions that pick one of several options ("Which of these…", "more boats or more kites?") make no sense with one guess. */
const CHOOSES = /\bNOT\b|Which of these|One of these|Which was there| or more |Which (house|one)/;

/**
 * Eight quick questions from a picture's question pool (already the kinds the level asks), about different things,
 * about half of them Yes. Each one's answer comes from the pool, so it is always right: a guess is the real answer
 * or one of the question's wrong options.
 */
export function speedQuestions(pool: Question[], seed: number, count = SPEED_QUESTIONS): SpeedQuestion[] {
  const rng = createRng(seed ^ 0x5eed);
  const wanted = rng.shuffle(Array.from({ length: count }, (_, i) => i < count / 2));
  const subjects = new Set<string>();
  const picked: SpeedQuestion[] = [];
  const families: Record<string, number> = {};
  const take = (q: Question, s: SpeedQuestion) => {
    const i = wanted.indexOf(s.yes);
    if (i < 0) return;
    wanted.splice(i, 1);
    subjects.add(q.subject ?? q.id);
    subjects.add(`${q.subject ?? q.id}|${q.type}`);
    families[q.family!] = (families[q.family!] ?? 0) + 1;
    picked.push(s);
  };
  for (const pass of [0, 1, 2]) {
    for (const q of rng.shuffle(pool)) {
      if (picked.length >= count) break;
      // The second pass may ask about something twice, if the picture had too few things for eight, but never the same
      // way: "The kettle was yellow" and "What colour was the kettle? Blue?" would answer each other.
      if (picked.some((p) => p.id === q.id) || subjects.has(pass === 0 ? (q.subject ?? q.id) : `${q.subject ?? q.id}|${q.type}`)) continue;
      if (pass < 2 && q.family && (families[q.family] ?? 0) >= (SPEED_CAPS[q.family] ?? Infinity)) continue;
      const answer = q.options[q.answerIndex];
      if (!q.family || !QUICK.has(q.family) || CHOOSES.test(q.prompt) || q.prompt.includes('\n') !== (q.family === 'true-false')) continue;
      if (q.family === 'true-false') {
        take(q, { id: q.id, prompt: q.prompt.replace(/^True or false\?\n/, ''), yes: answer === 'True' });
      } else if (q.options.length === 2 && q.options.includes('Yes') && q.options.includes('No')) {
        take(q, { id: q.id, prompt: q.prompt, yes: answer === 'Yes' });
      } else if (q.options.length >= 2 && !q.options.some((o) => YES_NO.test(o))) {
        // "Was there anything on the table? No, nothing?" reads badly, so options that are answers in themselves are left out.
        const yes = wanted.filter(Boolean).length >= wanted.filter((w) => !w).length;
        const wrong = q.options.filter((_, i) => i !== q.answerIndex);
        const guess = yes ? answer : rng.pick(wrong);
        if (BESIDE.test(guess) && picked.some((p) => p.guess && BESIDE.test(p.guess))) continue;
        take(q, { id: q.id, prompt: q.prompt, guess, yes });
      }
    }
  }
  return picked;
}

/** Levels rounds (no replays) played since the last Super Speed Round, and how many to wait for the next. */
export interface SpeedCounter {
  since: number;
  gap: number;
}

/**
 * Where the count to the next Super Speed Round stands: 4 to 6 Levels rounds after the last one, the number picked from
 * that round so it changes each time but stays the same between sessions.
 */
export function speedCounterOf(results: RoundResult[]): SpeedCounter {
  const sorted = [...results].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  let last = -1;
  sorted.forEach((r, i) => {
    if (r.speed) last = i;
  });
  const since = sorted.slice(last + 1).filter((r) => r.mode === 'levels' && !r.replay && !r.speed && !r.boss).length;
  return { since, gap: speedGap(last >= 0 ? sorted[last].id : 'first') };
}

/** Whether a Super Speed Round comes before the next picture: from Level 5, once enough rounds have been played. */
export const speedDue = (counter: SpeedCounter, level: number) => level >= SPEED_FROM_LEVEL && counter.since >= counter.gap;

/** 4, 5 or 6 rounds between speed rounds. */
export function speedGap(key: string): number {
  let h = 0;
  for (const c of key) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return 4 + (Math.abs(h) % 3);
}

export interface SpeedPrize {
  right: number;
  peeks: number;
  fifty: number;
  /** Bonus points: for 6 or more right, and in place of a Peek or 50:50 there's no room for. */
  bonus: number;
  /** The round's points: half an answer's points for each right one, plus the bonus. */
  points: number;
}

/** What each score wins: all 8 a Peek and a 50:50, 7 a Peek, 6 bonus points. */
export const SPEED_PRIZES: { right: number; label: string }[] = [
  { right: 8, label: 'A Peek and a 50:50' },
  { right: 7, label: 'A Peek' },
  { right: 6, label: 'Bonus points' },
];

/** What `right` answers win. A Peek or 50:50 won while you already hold all you can becomes bonus points instead. */
export function speedPrize(right: number, level: number, full: { peeks: boolean; fifty: boolean }): SpeedPrize {
  const perAnswer = pointsPerAnswer(level);
  const peekWon = right >= 7;
  const fiftyWon = right >= SPEED_QUESTIONS;
  const peeks = peekWon && !full.peeks ? 1 : 0;
  const fifty = fiftyWon && !full.fifty ? 1 : 0;
  const bonus = (right >= 6 ? 2 * perAnswer : 0) + (peekWon && !peeks ? 2 * perAnswer : 0) + (fiftyWon && !fifty ? 2 * perAnswer : 0);
  return { right, peeks, fifty, bonus, points: Math.round((right * perAnswer) / 2) + bonus };
}
