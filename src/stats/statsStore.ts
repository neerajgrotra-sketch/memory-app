import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RoundResult } from '@/types/stats';

/**
 * Where finished rounds are kept. The app only uses this interface, so the
 * on-device store can later be swapped for a Supabase table in `src/stats/index.ts`.
 */
export interface StatsStore {
  listResults(): Promise<RoundResult[]>;
  addResult(result: RoundResult): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = 'glance.roundResults.v1';
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
    },
  };
}
