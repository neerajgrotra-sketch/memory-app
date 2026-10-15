import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AgeBand, Profile } from '@/types/profile';

import { createDeviceProfileStore, type ProfileStore } from './profileStore';

// Swap this for a Supabase-backed store when profiles move to the backend.
export const profileStore: ProfileStore = createDeviceProfileStore();

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: '18-34', label: '18–34' },
  { value: '35-54', label: '35–54' },
  { value: '55-plus', label: '55+' },
  { value: 'unsaid', label: 'Prefer not to say' },
];

/** Extra viewing time with "More time to look" on. */
export const EXTRA_SECONDS = 3;

/** Age bands that turn "More time to look" on when picked (it can be turned off again). */
const MORE_TIME_BANDS: AgeBand[] = ['55-plus'];

interface ProfileContextValue {
  /** Null until loaded from the device (a moment after launch). */
  profile: Profile | null;
  update: (patch: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Promise<void>;
  /** Sets the age band, and "More time to look" to match it. */
  setAgeBand: (band: AgeBand | null) => Promise<void>;
  /** Forgets the name and age band (keeps the same id, so progress stays). */
  clearDetails: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Loads the profile once and keeps it in sync for every screen. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    profileStore.load().then(setProfile);
  }, []);

  const update = useCallback<ProfileContextValue['update']>(async (patch) => {
    const current = await profileStore.load();
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    setProfile(next);
    await profileStore.save(next);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      update,
      setAgeBand: (band) => update({ ageBand: band, moreTime: band ? MORE_TIME_BANDS.includes(band) : false }),
      clearDetails: () => update({ name: null, ageBand: null, moreTime: false }),
    }),
    [profile, update],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}

/** First letter of the name for the profile icon, or null. */
export const initialOf = (profile: Profile | null) => profile?.name?.trim().charAt(0).toUpperCase() || null;
