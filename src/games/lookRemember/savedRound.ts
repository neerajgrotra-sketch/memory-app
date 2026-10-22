import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Answers } from '@/game/quizNavigation';
import type { Round } from '@/hooks/useGameSession';
import type { Stage } from '@/scenes/createStage';
import type { PlayMode } from '@/types/game';

import { localDay } from './daily';

/**
 * A round in progress, saved after every answer so a player who closes the app can resume it. Only the
 * questions are resumed, never the picture: remembering it is the game, so coming back later only makes
 * the questions harder. Levels and Practice rounds are saved once the questions start (a round closed
 * while looking is simply dropped); the Daily Challenge is saved from the moment its picture shows, so
 * quitting can't be used to look at the day's picture again (it resumes at the questions).
 */
export interface SavedRound {
  mode: PlayMode;
  /** ISO time of the last save. */
  savedAt: string;
  /** The local day it was played (the Daily Challenge only resumes on its own day). */
  day: string;
  /** 'memorise' only for the Daily Challenge closed while looking. */
  phase: 'memorise' | 'quiz';
  stage: Stage;
  round: Round;
  answers: Answers;
  peeked: number[];
  /** The question a 50:50 was used on (rounds saved before 50:50s have none). */
  fiftied?: number[];
  /** Seconds looked at the picture (for points). */
  looked: number;
  sessionId: string;
  /** Question ids already asked about this picture in earlier rounds (Play again). */
  seenIds: string[];
}

/** The Daily Challenge has a slot of its own, so starting a Levels round never throws away today's. */
export type Slot = 'daily' | 'play';
export const slotFor = (mode: PlayMode): Slot => (mode === 'daily' ? 'daily' : 'play');

const keyOf = (slot: Slot) => `glance.savedRound.${slot}.v1`;
/** A Levels or Practice round can be resumed for a day. */
const KEEP_MS = 24 * 60 * 60 * 1000;

function fresh(saved: SavedRound, now: Date): boolean {
  if (saved.mode === 'daily') return saved.day === localDay(now);
  return now.getTime() - Date.parse(saved.savedAt) < KEEP_MS;
}

/** The round saved in `slot`, if there is one still fresh enough to resume. */
export async function loadSavedRound(slot: Slot, now = new Date()): Promise<SavedRound | null> {
  try {
    const raw = await AsyncStorage.getItem(keyOf(slot));
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedRound;
    if (saved?.round?.questions?.length && Array.isArray(saved.answers) && fresh(saved, now)) return saved;
    await AsyncStorage.removeItem(keyOf(slot));
  } catch {
    // Unreadable: treat as nothing saved.
  }
  return null;
}

export async function saveRound(saved: SavedRound): Promise<void> {
  try {
    await AsyncStorage.setItem(keyOf(slotFor(saved.mode)), JSON.stringify(saved));
  } catch {
    // Storage full or blocked: the round just can't be resumed.
  }
}

export async function clearSavedRound(slot: Slot): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyOf(slot));
  } catch {
    // Nothing to do.
  }
}

/** How many questions of a saved round have been answered. */
export const answeredOf = (saved: SavedRound) => saved.answers.filter((a) => a !== null).length;
