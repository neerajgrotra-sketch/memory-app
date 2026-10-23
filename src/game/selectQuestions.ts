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
  /** At most this many of a type in a round, instead of `TYPE_CAP` (see `LevelConfig.typeCaps`). */
  typeCaps?: Partial<Record<QuestionType, number>>;
  /** Questions already asked for this image; avoided while enough fresh ones remain. */
  seenIds: ReadonlySet<string>;
  /** Questions from the round just played; never repeated back-to-back if avoidable. */
  previousIds: ReadonlySet<string>;
  /** Wordings (`Question.template`) asked in the round before, on any picture: asked again only after fresh ones. */
  previousTemplates?: ReadonlySet<string>;
  /** At least this many fresh "what was happening?" questions, when there are, before the type caps apply (`LevelConfig.storyMin`). */
  storyMin?: number;
}

/**
 * The variety rule: at most this many of one kind of question in a round, so every round of five mixes
 * at least three kinds. "Where" and "what colour" are the most common in any picture, so one each.
 */
const FAMILY_CAP: Partial<Record<QuestionFamily, number>> = {
  count: 1,
  where: 1,
  colour: 1,
  'what-here': 1,
  seen: 1,
  compare: 1,
  most: 1,
  relation: 1,
  twins: 1,
  'two-step': 1,
  story: 1,
  altogether: 1,
  difference: 1,
  sharing: 1,
};
const DEFAULT_CAP = 2;
/** And at most two of one type, so "how many", "more or fewer" and "the most of" don't fill a round together. */
const TYPE_CAP = 2;

/**
 * Picks `count` questions from the pool: unseen before seen, spotlight questions (the clock) first, preferred types
 * before others, random within each group, about different things where possible, and following the
 * variety rule (`FAMILY_CAP`) unless the picture has too few kinds of question.
 */
export function selectQuestions(pool: Question[], options: SelectOptions): Question[] {
  const { count, preferredTypes, typeCaps = {}, seenIds, previousIds, previousTemplates, storyMin = 0 } = options;
  const candidates = pool.filter((question) => !previousIds.has(question.id));
  const source = candidates.length >= count ? candidates : pool;

  // A two-choice "where" ("To the left of the moon / To the right of the moon") is easier than one with three or four
  // choices: within its group it comes after them, so a round asks it only when there's no better one about where.
  const easy = (question: Question) => (question.options.length === 2 && question.family === 'where' ? 0.5 : 0);
  // The same sentence two rounds running ("How many … were there?" each time) made a session feel samey: a wording
  // from the round before comes after every fresh one, even of a less preferred type.
  const repeated = (question: Question) => (question.template && previousTemplates?.has(question.template) ? 1.05 : 0);
  const rank = (question: Question) => {
    const preferred = preferredTypes.includes(question.type) ? 0 : 1;
    if (seenIds.has(question.id)) return 3 + preferred + easy(question);
    // What was happening (the kettle steaming, the dog's stick) is the fun part of a picture, and rare: asked when
    // there is one, just after a spotlight question.
    const story = question.family === 'story' ? -0.5 : 0;
    return question.spotlight ? 0 : 1 + preferred + easy(question) + repeated(question) + story;
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
  const cap = (family: QuestionFamily) => (family === 'story' ? Math.max(storyMin, FAMILY_CAP.story ?? 1) : (FAMILY_CAP[family] ?? DEFAULT_CAP));
  const pass = (keepVariety: boolean, only?: (question: Question) => boolean, most = count) => {
    for (const question of ranked) {
      if (picked.length >= most) break;
      if (only && !only(question)) continue;
      if (picked.includes(question) || (question.subject && subjects.has(question.subject))) continue;
      const family = question.family;
      if (keepVariety && family && (families.get(family) ?? 0) >= cap(family)) continue;
      if (keepVariety && (types.get(question.type) ?? 0) >= (typeCaps[question.type] ?? TYPE_CAP)) continue;
      picked.push(question);
      types.set(question.type, (types.get(question.type) ?? 0) + 1);
      if (question.subject) subjects.add(question.subject);
      if (family) families.set(family, (families.get(family) ?? 0) + 1);
    }
  };
  // Story questions first, up to `storyMin`, ahead of the type caps (they're mostly "object" questions, capped at one).
  if (storyMin) pass(false, (question) => question.family === 'story' && !seenIds.has(question.id), Math.min(storyMin, count));
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
    template: question.template,
    prompt: question.prompt,
    options: order.map((index) => question.options[index]),
    answerIndex: order.indexOf(question.answerIndex),
  };
}
