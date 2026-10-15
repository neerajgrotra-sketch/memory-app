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
}

export function progressOf(all: RoundResult[], gameId: GameId): GameProgress {
  const results = all.filter((r) => gameIdOf(r) === gameId).sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const { state, fromHistory } = ladderStateOf(results);
  return {
    results,
    ladder: state,
    fromHistory,
    highScore: results.reduce((best, r) => (r.replay ? best : Math.max(best, r.points ?? 0)), 0),
    plays: results.length,
    perfectRounds: results.filter((r) => !r.replay && r.score === r.total).length,
    lastPlayedAt: results.at(-1)?.playedAt ?? null,
  };
}

/** A game's saved progress, reloaded whenever the screen comes into view. Null while loading. */
export function useGameProgress(gameId: GameId): GameProgress | null {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      statsStore.listResults().then((all) => {
        if (live) setProgress(progressOf(all, gameId));
      });
      return () => {
        live = false;
      };
    }, [gameId]),
  );
  return progress;
}
