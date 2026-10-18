/**
 * Every game in glance. The home screen groups them by skill, and shows a skill only when it has a game,
 * so a new game is one entry here plus its own screens.
 */

export type SkillId = 'memory' | 'attention' | 'problem-solving' | 'speed';

export const SKILLS: Record<SkillId, { title: string; blurb: string }> = {
  memory: { title: 'Memory', blurb: 'Hold on to what you saw' },
  attention: { title: 'Attention', blurb: 'Notice what matters' },
  'problem-solving': { title: 'Problem solving', blurb: 'Work it out' },
  speed: { title: 'Speed', blurb: 'Think fast' },
};

export const SKILL_ORDER: SkillId[] = ['memory', 'attention', 'problem-solving', 'speed'];

export type GameId = 'look-remember';

export interface GameDef {
  id: GameId;
  title: string;
  skill: SkillId;
  /** One line on the card and the game page. */
  tagline: string;
  /** Short steps on the game page. */
  howToPlay: string[];
}

export const GAMES: GameDef[] = [
  {
    id: 'look-remember',
    title: 'Look & Remember',
    skill: 'memory',
    tagline: 'Study a picture, then answer questions about it from memory.',
    howToPlay: [
      'A new picture appears for a few seconds. Take in everything you can.',
      'Answer 5 questions about it: what was there, how many, what colour, where.',
      'Do well and you level up: busier pictures, less time, new places.',
    ],
  },
];

export const getGame = (id: string | undefined): GameDef | undefined => GAMES.find((g) => g.id === id);

/** Rounds saved before games existed have no game id; they all belong to Look & Remember. */
export const gameIdOf = (result: { gameId?: string }): string => result.gameId ?? 'look-remember';
