/** One entry per question in the round: the chosen option, or null while unanswered. */
export type Answers = (number | null)[];

export const emptyAnswers = (count: number): Answers => Array.from({ length: count }, () => null);

export const unansweredCount = (answers: Answers) => answers.filter((a) => a === null).length;

/**
 * The next unanswered question after `from`, wrapping round to the start, so skipped questions
 * come back once the end is reached. Null when every other question has been answered.
 */
export function nextUnanswered(answers: Answers, from: number): number | null {
  for (let step = 1; step < answers.length; step++) {
    const i = (from + step) % answers.length;
    if (answers[i] === null) return i;
  }
  return null;
}
