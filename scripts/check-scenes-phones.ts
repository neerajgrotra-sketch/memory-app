import type { SceneSize } from '@/scenes/types';

/** The picture area (below the 72 pt header, inside the safe area) on three iPhones. */
export const PHONES: { name: string; size: SceneSize }[] = [
  { name: 'iPhone SE 375×667', size: { width: 375, height: 667 - 20 - 72 } },
  { name: 'iPhone 15 393×852', size: { width: 393, height: 852 - 59 - 34 - 72 } },
  { name: 'iPhone Pro Max 430×932', size: { width: 430, height: 932 - 59 - 34 - 72 } },
];
