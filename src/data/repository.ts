import type { GameImage, Question } from '@/types/game';

/**
 * Data access for the game. The app only talks to this interface, so the local
 * seed data can be swapped for a Supabase-backed implementation in one place
 * (see `src/data/index.ts`).
 */
export interface QuestionRepository {
  listImages(): Promise<GameImage[]>;
  getImage(imageId: string): Promise<GameImage | null>;
  getQuestions(imageId: string): Promise<Question[]>;
}
