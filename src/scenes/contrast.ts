/**
 * Colour contrast for scenes, measured as the perceptual difference between two colours in
 * OKLab (×100), which counts hue as well as lightness: a blue window on a cream wall reads
 * clearly even though both are light.
 */

/** Least difference for something to stand out at a glance from what it is drawn on. */
export const MIN_CONTRAST = 18;
/** Least lightness difference (OKLab L ×100) between a thing's fill or outline and what it sits on. */
export const MIN_LIGHTNESS = 15;

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function toOklab(hex: string): [number, number, number] {
  const [r, g, b] = channels(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Perceptual difference between two `#rrggbb` colours (0 = identical; 18+ stands out). */
export function contrast(a: string, b: string): number {
  const [l1, a1, b1] = toOklab(a);
  const [l2, a2, b2] = toOklab(b);
  return 100 * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** `top` laid over `base` at `alpha` opacity, e.g. a see-through rug on a floor. */
export function blend(base: string, top: string, alpha: number): string {
  const b = channels(base);
  const t = channels(top);
  return `#${b.map((v, i) => Math.round(v + (t[i] - v) * alpha).toString(16).padStart(2, '0')).join('')}`;
}

/** Lightness, 0 (black) to 100 (white). */
export const lightness = (hex: string) => 100 * toOklab(hex)[0];

/** The darker shade of a colour used for a thing's outline: same hue, much darker. */
export function shade(hex: string, amount = 0.5): string {
  return `#${channels(hex).map((v) => Math.round(v * amount).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * True if a thing drawn in `fill` (with its darker outline) stands out from `surface`: clearly
 * different colours, and either the fill or the outline clearly lighter or darker than the surface.
 */
export function standsOut(fill: string, surface: string): boolean {
  const l = lightness(surface);
  return (
    contrast(fill, surface) >= MIN_CONTRAST &&
    Math.max(Math.abs(lightness(fill) - l), Math.abs(lightness(shade(fill)) - l)) >= MIN_LIGHTNESS
  );
}
