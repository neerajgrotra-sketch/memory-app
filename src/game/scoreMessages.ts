/** Funny result lines, grouped by score (index = number correct out of 5). */
const SCORE_MESSAGES: string[][] = [
  [
    'Were your eyes even open?',
    'Bold strategy: look at nothing, remember nothing.',
    'Goldfish everywhere feel seen.',
    'You blinked for ten seconds, didn’t you?',
    'Zero. Impressively consistent.',
  ],
  [
    'One! It’s not nothing. It’s close, but it’s not nothing.',
    'Your memory called. It’s on holiday.',
    'A single brain cell showed up for work.',
    'One out of five. Participation trophy unlocked.',
    'Somewhere, a goldfish is slow-clapping.',
  ],
  [
    'Two! Your memory is buffering.',
    'Half-glanced, half-guessed.',
    'Your brain took the scenic route.',
    'Two out of five. The picture misses you already.',
    'Solid effort for someone checking their phone.',
  ],
  [
    'Three! More right than wrong. Barely.',
    'Your memory is warming up. Tell it to hurry.',
    'Respectable. Not brag-worthy, but respectable.',
    'Three out of five. The detective badge is in the post.',
    'Squint harder next time.',
  ],
  [
    'Four! So close you can taste it.',
    'One detail got away. It always does.',
    'Eagle-ish eyes.',
    'Four out of five. Your brain is showing off.',
    'Nearly perfect. Annoyingly nearly.',
  ],
  [
    'Flawless. Are you a camera?',
    'Photographic memory confirmed. Please don’t remember my face.',
    'Five out of five. Sherlock wants your number.',
    'Perfect! Did you take a screenshot?',
    'Nothing gets past you. Nothing.',
  ],
];

export function randomScoreMessage(score: number): string {
  const pool = SCORE_MESSAGES[Math.max(0, Math.min(score, SCORE_MESSAGES.length - 1))];
  return pool[Math.floor(Math.random() * pool.length)];
}
