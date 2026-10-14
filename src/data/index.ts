import { localRepository } from './local/localRepository';
import type { QuestionRepository } from './repository';

// Swap this for a Supabase-backed repository when questions move to the backend.
export const repository: QuestionRepository = localRepository;

export type { QuestionRepository } from './repository';
