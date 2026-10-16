import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RoundResult } from '@/types/stats';

/**
 * Where finished rounds are kept. The app only uses this interface, so the
 * on-device store can later be swapped for a Supabase table in `src/stats/index.ts`.
 */
export interface StatsStore {
  listResults(): Promise<RoundResult[]>;
  addResult(result: RoundResult): Promise<void>;
  /** Deletes every round and every "start again". */
  clear(): Promise<void>;
  /** When each game was last started again from Level 1 (ISO time), by game id. */
  listRestarts(): Promise<Record<string, string>>;
  /** Starts a game again from Level 1, keeping its rounds (history, high score, best level). */
  restart(gameId: string): Promise<void>;
}

const STORAGE_KEY = 'glance.roundResults.v1';
const RESTARTS_KEY = 'glance.restarts.v1';
/** Keeps storage small; old rounds beyond this are dropped. */
const MAX_RESULTS = 1000;

export function createDeviceStatsStore(): StatsStore {
  // In-memory copy so the app keeps working if device storage is unavailable.
  let cache: RoundResult[] | null = null;

  const load = async (): Promise<RoundResult[]> => {
    if (cache) return cache;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? (parsed as RoundResult[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  };

  const save = async (results: RoundResult[]) => {
    cache = results;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      // Storage full or blocked: keep the in-memory copy for this session.
    }
  };

  let restarts: Record<string, string> | null = null;
  const loadRestarts = async (): Promise<Record<string, string>> => {
    if (restarts) return restarts;
    try {
      const raw = await AsyncStorage.getItem(RESTARTS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      restarts = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {};
    } catch {
      restarts = {};
    }
    return restarts;
  };
  const saveRestarts = async (next: Record<string, string>) => {
    restarts = next;
    try {
      await AsyncStorage.setItem(RESTARTS_KEY, JSON.stringify(next));
    } catch {
      // Keep the in-memory copy for this session.
    }
  };

  return {
    async listResults() {
      return [...(await load())];
    },
    async addResult(result) {
      const results = await load();
      await save([...results, result].slice(-MAX_RESULTS));
    },
    async clear() {
      await save([]);
      await saveRestarts({});
    },
    async listRestarts() {
      return { ...(await loadRestarts()) };
    },
    async restart(gameId) {
      await saveRestarts({ ...(await loadRestarts()), [gameId]: new Date().toISOString() });
    },
  };
}
