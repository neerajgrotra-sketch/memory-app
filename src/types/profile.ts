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
  /** My Places: the places (recipe ids) switched off, so they're never played. Missing means all on. */
  placesOff?: string[];
  /**
   * Tester mode (hidden: tap the version in Profile 7 times): every place counts as unlocked in My places,
   * so any one place can be played at any level. Missing means off.
   */
  tester?: boolean;
  /** The old testing switch: only these recipes were played. Read once to fill `placesOff`, then cleared. */
  recipeFilter: string[] | null;
  /** Sounds for answers, the last seconds and level ups. Missing means on (profiles saved before sounds). */
  sound?: boolean;
  /** Vibration at the same moments (phones only). Missing means on. */
  haptics?: boolean;
  createdAt: string;
  updatedAt: string;
}
