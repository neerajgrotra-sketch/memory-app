import { Path } from 'react-native-svg';

/**
 * Subtle texture for backdrops (sand grain, grass, dust, carpet): many small dots or dashes drawn as one
 * path, so even hundreds cost a single shape. Placed the same way every time (a fixed seed), and faint
 * enough that it never changes how things stand out: the contrast rules use the band's plain colour.
 */

/** A small fixed-seed random generator, so a texture looks the same in every picture. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Area {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Round dots (sand grains, gravel, dust): `count` of them, `size` across, in `colour` at `opacity`. */
export function speckles(area: Area, count: number, colour: string, opacity: number, size = 4, seed = 7) {
  const rand = seeded(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = area.x0 + (area.x1 - area.x0) * rand();
    const y = area.y0 + (area.y1 - area.y0) * rand();
    d += `M${x.toFixed(1)},${y.toFixed(1)}h0`;
  }
  return <Path d={d} stroke={colour} strokeOpacity={opacity} strokeWidth={size} strokeLinecap="round" fill="none" />;
}

/** Short strokes (grass blades, carpet pile, snow sparkle): `length` long, leaning by `lean`. */
export function strokes(area: Area, count: number, colour: string, opacity: number, length = 10, lean = 3, width = 2.5, seed = 11) {
  const rand = seeded(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = area.x0 + (area.x1 - area.x0) * rand();
    const y = area.y0 + (area.y1 - area.y0) * rand();
    const tilt = (rand() - 0.5) * 2 * lean;
    d += `M${x.toFixed(1)},${y.toFixed(1)}l${tilt.toFixed(1)},${-length}`;
  }
  return <Path d={d} stroke={colour} strokeOpacity={opacity} strokeWidth={width} strokeLinecap="round" fill="none" />;
}

/** Short level dashes (glints of sun on water, ripples): `length` long. */
export function glints(area: Area, count: number, colour: string, opacity: number, length = 16, width = 3, seed = 31) {
  const rand = seeded(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = area.x0 + (area.x1 - area.x0) * rand();
    const y = area.y0 + (area.y1 - area.y0) * rand();
    d += `M${x.toFixed(1)},${y.toFixed(1)}h${(length * (0.5 + rand())).toFixed(1)}`;
  }
  return <Path d={d} stroke={colour} strokeOpacity={opacity} strokeWidth={width} strokeLinecap="round" fill="none" />;
}
