import type { Question, QuestionFamily, QuestionType, RoundQuestion } from '@/types/game';

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
 * The variety rule: at most this many of one kind of question in a round, so every round of five mixes
 * at least three kinds. "Where" and "what colour" are the most common in any picture, so one each.
 */
const FAMILY_CAP: Partial<Record<QuestionFamily, number>> = { count: 1, where: 1, colour: 1, 'what-here': 1, seen: 1, compare: 1, most: 1, relation: 1, twins: 1 };
const DEFAULT_CAP = 2;
/** And at most two of one type, so "how many", "more or fewer" and "the most of" don't fill a round together. */
const TYPE_CAP = 2;

/**
 * Picks `count` questions from the pool: unseen before seen, spotlight questions (the clock) first, preferred types
 * before others, random within each group, about different things where possible, and following the
 * variety rule (`FAMILY_CAP`) unless the picture has too few kinds of question.
 */
export function selectQuestions(pool: Question[], options: SelectOptions): Question[] {
  const { count, preferredTypes, seenIds, previousIds } = options;
  const candidates = pool.filter((question) => !previousIds.has(question.id));
  const source = candidates.length >= count ? candidates : pool;

  // A two-choice "where" ("To the left of the moon / To the right of the moon") is easier than one with three or four
  // choices: within its group it comes after them, so a round asks it only when there's no better one about where.
  const easy = (question: Question) => (question.options.length === 2 && question.family === 'where' ? 0.5 : 0);
  const rank = (question: Question) => {
    const preferred = preferredTypes.includes(question.type) ? 0 : 1;
    if (seenIds.has(question.id)) return 3 + preferred + easy(question);
    return question.spotlight ? 0 : 1 + preferred + easy(question);
  };

  const ranked = source
    .map((question) => ({ question, rank: rank(question), tiebreak: Math.random() }))
    .sort((a, b) => a.rank - b.rank || a.tiebreak - b.tiebreak)
    .map(({ question }) => question);

  // First pass keeps to the variety rule and skips questions about something already asked about;
  // the second relaxes the rule; the last fills any gap.
  const picked: Question[] = [];
  const subjects = new Set<string>();
  const families = new Map<QuestionFamily, number>();
  const types = new Map<QuestionType, number>();
  const pass = (keepVariety: boolean) => {
    for (const question of ranked) {
      if (picked.length >= count) break;
      if (picked.includes(question) || (question.subject && subjects.has(question.subject))) continue;
      const family = question.family;
      if (keepVariety && family && (families.get(family) ?? 0) >= (FAMILY_CAP[family] ?? DEFAULT_CAP)) continue;
      if (keepVariety && (types.get(question.type) ?? 0) >= TYPE_CAP) continue;
      picked.push(question);
      types.set(question.type, (types.get(question.type) ?? 0) + 1);
      if (question.subject) subjects.add(question.subject);
      if (family) families.set(family, (families.get(family) ?? 0) + 1);
    }
  };
  pass(true);
  pass(false);
  for (const question of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(question)) picked.push(question);
  }
  return picked;
}

/** Shuffles a question's options and re-points the answer at its new position. */
export function toRoundQuestion(question: Question): RoundQuestion {
  const indexes = question.options.map((_, index) => index);
  const order = question.fixedOrder ? indexes : shuffle(indexes);
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: order.map((index) => question.options[index]),
    answerIndex: order.indexOf(question.answerIndex),
  };
}
