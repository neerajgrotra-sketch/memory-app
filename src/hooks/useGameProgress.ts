import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { gameIdOf, type GameId } from '@/games/registry';
import { ladderStateOf, type LadderState } from '@/games/lookRemember/ladder';
import { statsStore } from '@/stats';
import type { RoundResult } from '@/types/stats';

export interface GameProgress {
  /** This game's rounds, oldest first. */
  results: RoundResult[];
  ladder: LadderState;
  /** The level was worked out from rounds played before levels existed. */
  fromHistory: boolean;
  highScore: number;
  plays: number;
  /** Best score out of 5, and how many perfect rounds. */
  perfectRounds: number;
  lastPlayedAt: string | null;
  /** When you last started again from Level 1, if ever. */
  restartedAt: string | null;
}

/** `restarts`: when each game was started again (from `statsStore.listRestarts`). */
export function progressOf(all: RoundResult[], gameId: GameId, restarts: Record<string, string> = {}): GameProgress {
  const results = all.filter((r) => gameIdOf(r) === gameId).sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const restartedAt = restarts[gameId] ?? null;
  const { state, fromHistory } = ladderStateOf(results, restartedAt);
  return {
    results,
    ladder: state,
    fromHistory,
    highScore: results.reduce((best, r) => (r.replay ? best : Math.max(best, r.points ?? 0)), 0),
    plays: results.length,
    perfectRounds: results.filter((r) => !r.replay && r.score === r.total).length,
    lastPlayedAt: results.at(-1)?.playedAt ?? null,
    restartedAt,
  };
}

/** A game's progress, read from the store. */
export async function loadProgress(gameId: GameId): Promise<GameProgress> {
  const [all, restarts] = await Promise.all([statsStore.listResults(), statsStore.listRestarts()]);
  return progressOf(all, gameId, restarts);
}

/** A game's saved progress, reloaded whenever the screen comes into view. Null while loading. */
export function useGameProgress(gameId: GameId): GameProgress | null {
  return useReloadableGameProgress(gameId).progress;
}

/** The same, plus `reload` for when the screen itself changes progress (starting again). */
export function useReloadableGameProgress(gameId: GameId): { progress: GameProgress | null; reload: () => void } {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const reload = useCallback(() => {
    loadProgress(gameId).then(setProgress);
  }, [gameId]);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      loadProgress(gameId).then((p) => {
        if (live) setProgress(p);
      });
      return () => {
        live = false;
      };
    }, [gameId]),
  );
  return { progress, reload };
}
