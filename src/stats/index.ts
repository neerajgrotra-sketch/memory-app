import { createDeviceStatsStore, type StatsStore } from './statsStore';

// Swap this for a Supabase-backed store when results move to the backend.
export const statsStore: StatsStore = createDeviceStatsStore();

export type { StatsStore } from './statsStore';
