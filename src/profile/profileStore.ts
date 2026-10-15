import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile } from '@/types/profile';

/**
 * Where the player's profile is kept. The app only uses this interface, so the on-device store can
 * later be swapped for a Supabase `profiles` table in `src/profile/index.ts`.
 */
export interface ProfileStore {
  load(): Promise<Profile>;
  save(profile: Profile): Promise<void>;
}

const STORAGE_KEY = 'glance.profile.v1';

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function newProfile(): Profile {
  const now = new Date().toISOString();
  return { id: makeId(), name: null, ageBand: null, moreTime: false, asked: false, createdAt: now, updatedAt: now };
}

export function createDeviceProfileStore(): ProfileStore {
  // In-memory copy so the app keeps working if device storage is unavailable.
  let cache: Profile | null = null;

  const save = async (profile: Profile) => {
    cache = profile;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Storage full or blocked: keep the in-memory copy for this session.
    }
  };

  return {
    async load() {
      if (cache) return cache;
      let stored: Partial<Profile> | null = null;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        stored = raw ? (JSON.parse(raw) as Partial<Profile>) : null;
      } catch {
        stored = null;
      }
      if (stored?.id) {
        cache = { ...newProfile(), ...stored };
      } else {
        // First launch: keep the new id so it stays the same from now on.
        await save(newProfile());
      }
      return cache!;
    },
    save,
  };
}
