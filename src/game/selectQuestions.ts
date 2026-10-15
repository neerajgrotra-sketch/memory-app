import type { Question, QuestionType, RoundQuestion } from '@/types/game';

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface SelectOptions {
  count: number;
  preferredTypes: QuestionType[];
  /** Questions already asked for this image; avoided while enough fresh ones remain. */
  seenIds: ReadonlySet<string>;
  /** Questions from the round just played; never repeated back-to-back if avoidable. */
  previousIds: ReadonlySet<string>;
}

/**
 * Picks `count` questions from the pool: unseen before seen, preferred types
 * before others, random within each group, and about different things where possible.
 */
export function selectQuestions(pool: Question[], options: SelectOptions): Question[] {
  const { count, preferredTypes, seenIds, previousIds } = options;
  const candidates = pool.filter((question) => !previousIds.has(question.id));
  const source = candidates.length >= count ? candidates : pool;

  const rank = (question: Question) =>
    (seenIds.has(question.id) ? 2 : 0) + (preferredTypes.includes(question.type) ? 0 : 1);

  const ranked = source
    .map((question) => ({ question, rank: rank(question), tiebreak: Math.random() }))
    .sort((a, b) => a.rank - b.rank || a.tiebreak - b.tiebreak)
    .map(({ question }) => question);

  // First pass skips questions about something already asked about; second pass fills any gap.
  const picked: Question[] = [];
  const subjects = new Set<string>();
  for (const question of ranked) {
    if (picked.length >= count) break;
    if (question.subject && subjects.has(question.subject)) continue;
    picked.push(question);
    if (question.subject) subjects.add(question.subject);
  }
  for (const question of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(question)) picked.push(question);
  }
  return picked;
}

/** Shuffles a question's options and re-points the answer at its new position. */
export function toRoundQuestion(question: Question): RoundQuestion {
  const order = shuffle(question.options.map((_, index) => index));
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: order.map((index) => question.options[index]),
    answerIndex: order.indexOf(question.answerIndex),
  };
}
