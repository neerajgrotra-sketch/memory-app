/** Broad age bands only, never an exact age or birth date. */
export type AgeBand = 'under-18' | '18-34' | '35-54' | '55-plus' | 'unsaid';

/**
 * The player, kept on this device (mirrors a future `profiles` row once there are accounts).
 * Everything is optional: the game works the same without a name or age band.
 */
export interface Profile {
  /** Random, made on first launch, so results and a future account can be linked to it. */
  id: string;
  name: string | null;
  ageBand: AgeBand | null;
  /** Show each picture for a few extra seconds. */
  moreTime: boolean;
  /** The "what should we call you?" card has been answered or skipped, so it never shows again. */
  asked: boolean;
  createdAt: string;
  updatedAt: string;
}
