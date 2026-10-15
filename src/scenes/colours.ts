import type { ColourDef } from './types';

/** Clearly different colours only, so colour questions are fair. */
export const C = {
  red: { name: 'Red', hex: '#e63946' },
  blue: { name: 'Blue', hex: '#1d70d6' },
  yellow: { name: 'Yellow', hex: '#ffd60a' },
  green: { name: 'Green', hex: '#2b9348' },
  orange: { name: 'Orange', hex: '#f77f00' },
  purple: { name: 'Purple', hex: '#7b2cbf' },
  pink: { name: 'Pink', hex: '#ff5fa2' },
  white: { name: 'White', hex: '#f8f9fa' },
  black: { name: 'Black', hex: '#262626' },
  brown: { name: 'Brown', hex: '#8b5a2b' },
  grey: { name: 'Grey', hex: '#8d99ae' },
} satisfies Record<string, ColourDef>;

export const ALL_COLOURS: ColourDef[] = Object.values(C);
