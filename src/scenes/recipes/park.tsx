import { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { C } from '../colours';
import { balloon, bird, cloudShape, dog, kite, person, plane, sun, tree } from '../items/common';
import { lineMarks, scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';

/**
 * A city park on a sunny day: sky, a pond with trees behind it, a gravel path, and the grass in front.
 * Band edges as fractions of the picture height.
 *
 * Scale: everything is sized against the shared person (1.7 m tall, so 1 m ≈ 0.115 of the picture
 * width). Things smaller than about 1 m (ducks, balls, butterflies) can't be drawn 44 pt wide without
 * looking giant next to people, so the park leaves them out.
 */
const BUSHES = 0.24;
const POND = 0.29;
const BANK = 0.455;
const PATH = 0.47;
const GRASS = 0.615;
const GRASS_TOP = 0.64;

const SKY = ['sky'];
const ON_POND = ['pond'];
const ON_PATH = ['path'];
const ON_GRASS = ['grass'];

const items: ItemDef[] = [
  { ...sun, zones: SKY, maxCount: 1, countable: false },
  { ...bird, zones: SKY, maxCount: 4 },
  { ...kite, zones: SKY, maxCount: 3 },
  { ...balloon, zones: SKY, maxCount: 2 },
  { ...plane, zones: SKY, maxCount: 1, countable: false },
  {
    kind: 'boat',
    singular: 'rowing boat',
    plural: 'rowing boats',
    article: 'a',
    w: 220,
    h: 80,
    tier: 'xl',
    // About 3 m long, with someone rowing.
    size: 0.34,
    wide: true,
    zones: ON_POND,
    // One, so "the number on the rowing boat" is never in doubt.
    maxCount: 1,
    floats: true,
    countable: false,
    noFlip: true,
    colours: [C.red, C.yellow, C.green, C.orange, C.white],
    draw: (colour, details) => (
      <G>
        {/* The rower, sitting in the middle, and the oars dipping into the water. */}
        <Path d="M96,44 L56,74 M124,44 L164,74" fill="none" stroke="#8a5a2b" strokeWidth={6} strokeLinecap="round" />
        <Rect x={98} y={18} width={24} height={26} rx={8} fill={C.blue.hex} />
        <Circle cx={110} cy={10} r={10} fill="#e0ac69" />
        <Path d="M0,40 H220 L194,78 H26 Z" fill={colour} />
        <Rect x={0} y={40} width={220} height={7} fill="#ffffff" fillOpacity={0.5} stroke="none" />
        {/* The boat's number, big enough to read at a glance: it's asked about. */}
        <Rect x={84} y={46} width={52} height={30} rx={4} fill="#ffffff" />
        <SvgText x={110} y={62} fontSize={26} fontWeight="bold" fontFamily="Arial" fill="#212529" stroke="none" textAnchor="middle" alignmentBaseline="central">
          {details?.values?.boat ?? '7'}
        </SvgText>
      </G>
    ),
  },
  {
    kind: 'swan',
    singular: 'swan',
    plural: 'swans',
    article: 'a',
    w: 100,
    h: 80,
    tier: 'medium',
    size: 0.14,
    zones: ON_POND,
    maxCount: 3,
    floats: true,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Path d="M10,62 Q14,40 46,46 Q70,48 92,58 Q80,78 40,78 Q14,78 10,62 Z" fill="#f8f9fa" />
        <Path d="M74,52 Q84,32 70,20 Q62,12 68,6" fill="none" stroke="#adb5bd" strokeWidth={12} strokeLinecap="round" />
        <Path d="M74,52 Q84,32 70,20 Q62,12 68,6" fill="none" stroke="#f8f9fa" strokeWidth={7} strokeLinecap="round" />
        <Circle cx={70} cy={8} r={7} fill="#f8f9fa" />
        <Path d="M76,6 L90,11 L76,13 Z" fill="#f77f00" stroke="none" />
        <Circle cx={71} cy={6} r={1.8} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'fountain',
    singular: 'fountain',
    plural: 'fountains',
    article: 'a',
    w: 160,
    h: 120,
    tier: 'large',
    size: 0.28,
    zones: ON_POND,
    maxCount: 1,
    countable: false,
    tone: '#495057',
    // A stone fountain in the pond: a wide basin, a pedestal, a bowl, and water arcing down from the top.
    draw: () => (
      <G>
        <G fill="none" stroke="#cfe9f7" strokeWidth={6} strokeLinecap="round">
          <Path d="M80,14 Q52,10 40,52" />
          <Path d="M80,14 Q108,10 120,52" />
          <Path d="M50,62 Q30,66 24,92" />
          <Path d="M110,62 Q130,66 136,92" />
        </G>
        <Path d="M80,0 V18" stroke="#cfe9f7" strokeWidth={6} strokeLinecap="round" />
        <Path d="M44,50 H116 Q112,66 80,66 Q48,66 44,50 Z" fill="#495057" />
        <Path d="M72,18 H88 L84,50 H76 Z" fill="#495057" />
        <Path d="M72,66 H88 L92,96 H68 Z" fill="#495057" />
        <Path d="M4,92 H156 L146,120 H14 Z" fill="#495057" />
        <Rect x={10} y={92} width={140} height={6} fill="#cfe9f7" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'bicycle',
    singular: 'bicycle',
    plural: 'bicycles',
    article: 'a',
    w: 120,
    h: 118,
    tier: 'large',
    // About 1.7 m long, with its rider.
    size: 0.2,
    zones: ON_PATH,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the bicycles?' : 'What colour was the bicycle?'),
    draw: (colour) => (
      <G>
        <G fill="none" stroke="#343a40" strokeWidth={6}>
          <Circle cx={25} cy={94} r={22} />
          <Circle cx={95} cy={94} r={22} />
        </G>
        <Path d="M25,94 L48,62 H86 L95,94 M48,62 L58,94 L25,94 M58,94 L86,62" fill="none" stroke={colour} strokeWidth={7} strokeLinejoin="round" />
        <Path d="M86,62 L84,46 H94" fill="none" stroke="#343a40" strokeWidth={5} strokeLinecap="round" />
        {/* The rider: body leaning forward, hands on the handlebar, a foot on the pedal. */}
        <Path d="M52,56 L62,94" fill="none" stroke="#343a40" strokeWidth={8} strokeLinecap="round" />
        <Path d="M52,56 L62,20" fill="none" stroke="#457b9d" strokeWidth={16} strokeLinecap="round" />
        <Path d="M62,26 L86,46" fill="none" stroke="#457b9d" strokeWidth={7} strokeLinecap="round" />
        <Circle cx={66} cy={10} r={10} fill="#e0ac69" />
        <Rect x={40} y={54} width={18} height={6} rx={3} fill="#343a40" />
      </G>
    ),
  },
  {
    kind: 'ice-cream',
    singular: 'ice-cream cart',
    plural: 'ice-cream carts',
    article: 'an',
    w: 140,
    h: 130,
    tier: 'large',
    size: 0.21,
    zones: [...ON_PATH, ...ON_GRASS],
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.pink, C.green, C.yellow],
    colourPrompt: () => 'What colour was the umbrella on the ice-cream cart?',
    draw: (colour) => (
      <G>
        <Path d="M66,30 V64" stroke="#495057" strokeWidth={5} />
        <Path d="M10,32 Q66,-8 122,32 Z" fill={colour} />
        <Rect x={14} y={62} width={104} height={46} rx={6} fill="#fff3e0" />
        <G stroke="none">
          <Path d="M54,74 L62,98 L70,74 Z" fill="#d4a373" />
          <Circle cx={62} cy={72} r={9} fill="#ff8fab" />
        </G>
        <Path d="M118,70 L134,66" stroke="#495057" strokeWidth={5} strokeLinecap="round" />
        <Circle cx={36} cy={116} r={12} fill="#343a40" stroke="none" />
        <Circle cx={96} cy={116} r={12} fill="#343a40" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 70,
    tier: 'large',
    // About 1.8 m long.
    size: 0.21,
    zones: ON_GRASS,
    maxCount: 2,
    backRow: true,
    spread: true,
    colours: [C.green, C.brown, C.red, C.blue],
    draw: (colour) => (
      <G>
        <Path d="M16,6 V70 M124,6 V70" fill="none" stroke="#343a40" strokeWidth={6} />
        <Rect x={8} y={6} width={124} height={11} rx={3} fill={colour} />
        <Rect x={8} y={22} width={124} height={11} rx={3} fill={colour} />
        <Rect x={2} y={42} width={136} height={12} rx={3} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'picnic',
    singular: 'picnic blanket',
    plural: 'picnic blankets',
    article: 'a',
    w: 160,
    h: 62,
    tier: 'large',
    size: 0.23,
    zones: ON_GRASS,
    maxCount: 2,
    colours: [C.red, C.blue, C.yellow, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M14,36 H146 L160,62 H0 Z" fill={colour} />
        <Path d="M50,36 L42,62 M84,36 L84,62 M118,36 L126,62 M7,49 H153" fill="none" stroke="#ffffff" strokeWidth={5} />
        {/* A wicker basket on the blanket. */}
        <Path d="M96,20 Q110,0 124,20" fill="none" stroke="#8a5a2b" strokeWidth={4} />
        <Rect x={92} y={18} width={36} height={24} rx={4} fill="#c8955a" />
      </G>
    ),
  },
  {
    kind: 'flowers',
    singular: 'flower bed',
    plural: 'flower beds',
    article: 'a',
    w: 160,
    h: 66,
    tier: 'large',
    size: 0.23,
    zones: ON_GRASS,
    maxCount: 2,
    colours: [C.red, C.yellow, C.pink, C.purple, C.orange, C.white],
    colourPrompt: (plural) => (plural ? 'What colour were the flowers in the flower beds?' : 'What colour were the flowers in the flower bed?'),
    draw: (colour) => (
      <G>
        <Path d="M4,66 Q8,40 80,40 Q152,40 156,66 Z" fill="#7a4a2a" />
        <G stroke="#2b7a2b" strokeWidth={4} fill="none">
          {[22, 46, 70, 94, 118, 140, 34, 82, 130].map((x, i) => (
            <Path key={i} d={`M${x},${i < 6 ? 46 : 50} V${i < 6 ? 24 : 12}`} />
          ))}
        </G>
        {[22, 46, 70, 94, 118, 140].map((x) => (
          <Circle key={x} cx={x} cy={22} r={10} fill={colour} />
        ))}
        {[34, 82, 130].map((x) => (
          <Circle key={x} cx={x} cy={12} r={10} fill={colour} />
        ))}
      </G>
    ),
  },
  {
    kind: 'swings',
    singular: 'swing set',
    plural: 'swing sets',
    article: 'a',
    w: 160,
    h: 140,
    tier: 'large',
    // About 2.5 m wide and 2 m tall.
    size: 0.28,
    zones: ON_GRASS,
    maxCount: 1,
    countable: false,
    tone: '#d62828',
    draw: () => (
      <G>
        <Path d="M14,140 L34,8 M54,140 L34,8 M106,140 L126,8 M146,140 L126,8" fill="none" stroke="#d62828" strokeWidth={9} strokeLinecap="round" />
        <Rect x={28} y={2} width={104} height={11} rx={4} fill="#d62828" />
        <G stroke="#6c757d" strokeWidth={3}>
          <Path d="M60,12 V96 M80,12 V96 M88,12 V88 M104,12 V88" fill="none" />
        </G>
        <Rect x={54} y={94} width={32} height={8} rx={3} fill="#343a40" />
        <Rect x={84} y={86} width={26} height={8} rx={3} fill="#343a40" />
      </G>
    ),
  },
  {
    kind: 'slide',
    singular: 'slide',
    plural: 'slides',
    article: 'a',
    w: 160,
    h: 112,
    tier: 'large',
    size: 0.28,
    zones: ON_GRASS,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M14,112 V14 M44,112 V14 M14,40 H44 M14,64 H44 M14,88 H44" fill="none" stroke="#6c757d" strokeWidth={6} />
        <Rect x={8} y={8} width={44} height={10} rx={3} fill="#6c757d" />
        <Path d="M44,10 Q60,10 80,40 L120,98 Q128,108 152,108 L156,96 Q134,96 128,88 L90,32 Q72,0 44,0 Z" fill={colour} />
      </G>
    ),
  },
  {
    kind: 'park-clock',
    singular: 'park clock',
    plural: 'park clocks',
    article: 'a',
    w: 90,
    h: 300,
    tier: 'small',
    // A clock on a tall post, about 3.5 m high: tall, so it stands at the back of the grass.
    size: 0.12,
    zones: ON_GRASS,
    maxCount: 1,
    countable: false,
    tall: true,
    noFlip: true,
    tone: '#2d3436',
    draw: (_colour, details) => (
      <G>
        <Rect x={39} y={86} width={12} height={200} fill="#2d3436" />
        <Path d="M24,300 H66 L58,282 H32 Z" fill="#2d3436" />
        <G transform="translate(0 0) scale(0.9)">
          <ClockFace time={details?.values?.clock ?? '10:10'} rim="#2d3436" />
        </G>
      </G>
    ),
  },
  // A grown tree, about 4 m tall: stands at the back of the grass and rises over the path behind it.
  { ...tree, size: 0.28, tall: true, zones: ON_GRASS, maxCount: 2 },
  { ...person, zones: [...ON_PATH, ...ON_GRASS], maxCount: 3 },
  { ...dog, zones: [...ON_PATH, ...ON_GRASS], maxCount: 2 },
];

/** Boat numbers easy to mix up with `n`: one or two along, the digits swapped, or ten more. */
function boatLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 30);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The rowing boat's number (from Level 8, like house numbers) and the park clock's time (every level). */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const boat = random.int(1, 24);
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  return {
    values: { boat: String(boat), clock: time },
    facts: [
      { id: 'boat-number', type: 'number', prompt: 'What number was on the rowing boat?', answer: String(boat), wrong: boatLookalikes(boat), needs: 'boat' },
      { id: 'clock-time', type: 'number', prompt: 'What time was on the park clock?', answer: time, wrong: close, fallback: other, needs: 'park-clock', everyLevel: true, spotlight: true },
    ],
  };
}

type Palette = Record<'sky' | 'bushes' | 'bushesDark' | 'pond' | 'ripple' | 'grass' | 'tuft' | 'path' | 'edge', string>;

function backdrop(height: number, p: Palette) {
  const bushes = height * BUSHES;
  const pond = height * POND;
  const bank = height * BANK;
  const path = height * PATH;
  const grass = height * GRASS;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={pond + 600} fill={p.sky} />
      {/* Trees and bushes on the far side of the pond. */}
      <G fill={p.bushesDark}>
        {Array.from({ length: 22 }, (_, i) => (
          <Circle key={i} cx={-600 + i * 100} cy={bushes + 16 + (i % 3) * 6} r={46 + (i % 2) * 10} />
        ))}
      </G>
      <G fill={p.bushes}>
        {Array.from({ length: 22 }, (_, i) => (
          <Circle key={i} cx={-560 + i * 100} cy={pond - 4 + (i % 2) * 6} r={40} />
        ))}
      </G>
      <Rect x={-600} y={pond} width={2100} height={bank - pond} fill={p.pond} />
      <Rect x={-600} y={bank} width={2100} height={path - bank} fill={p.grass} />
      <Rect x={-600} y={path} width={2100} height={grass - path} fill={p.path} />
      <Rect x={-600} y={path} width={2100} height={5} fill={p.edge} />
      <Rect x={-600} y={grass - 5} width={2100} height={5} fill={p.edge} />
      <Rect x={-600} y={grass} width={2100} height={height - grass + 600} fill={p.grass} />
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const tuft = (x: number, y: number) => (
    <Path d={`M${x},${y + 14} l6,-14 l4,14 l6,-10 l4,10`} fill="none" stroke={variant.palette.tuft} strokeWidth={3} strokeLinecap="round" />
  );
  return [
    // White clouds: scenery, so solid, but never touching anything in the sky.
    ...scatterMarks({ x0: -100, y0: height * 0.02, x1: 1000, y1: height * BUSHES - 60 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true),
    // Ripples on the pond and tufts in the grass.
    ...[0.35, 0.41].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.ripple, 3, 0.3)),
    ...scatterMarks({ x0: 20, y0: height * GRASS_TOP + 20, x1: 880, y1: height - 30 }, 24, 16, 8, boxes, random, 0.3, tuft),
  ];
}

const PALETTES: Record<string, Palette> = {
  summer: {
    sky: '#8fd3f4',
    bushes: '#5a9e3e',
    bushesDark: '#3f7f2e',
    pond: '#5fa8d3',
    ripple: '#ffffff',
    grass: '#9ccc5a',
    tuft: '#5d8f2a',
    path: '#e3d3b0',
    edge: '#c2ad84',
  },
  spring: {
    sky: '#a5d8f3',
    bushes: '#6bb04a',
    bushesDark: '#4c8f36',
    pond: '#4f97c4',
    ripple: '#ffffff',
    grass: '#b5d77a',
    tuft: '#6f9a3a',
    path: '#e9dcc0',
    edge: '#c9b48c',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < BUSHES) return 'sky';
  if (y < POND) return 'bushes';
  if (y < BANK) return 'pond';
  if (y < PATH) return 'grass';
  if (y < GRASS) return 'path';
  return 'grass';
}

export const park: Recipe = {
  id: 'park',
  title: 'In the park',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: BUSHES, rows: 1 },
    { id: 'bushes', label: 'By the trees', surface: 'ground', top: BUSHES, bottom: POND, rows: 0 },
    { id: 'pond', label: 'On the pond', surface: 'ground', top: POND, bottom: BANK, rows: 1, maxGroups: 2 },
    // Bikes and walkers all go the same way along the path.
    { id: 'path', label: 'On the path', surface: 'ground', top: PATH, bottom: GRASS, rows: 1, maxGroups: 2, oneWay: true },
    { id: 'grass', label: 'On the grass', surface: 'ground', top: GRASS_TOP, bottom: 1, rows: 2 },
  ],
  items,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the trees.
    { top: 0, bottom: BUSHES, from: ['#ffffff', 0], to: ['#ffffff', 0.1] },
    // The pond: deep in the middle, lighter at the bank.
    { top: POND, bottom: BANK, from: ['#000000', 0.12], to: ['#ffffff', 0.08] },
    // Shade along the path's far edge.
    { top: PATH, bottom: GRASS, from: ['#000000', 0.06], to: ['#000000', 0] },
    // Sun on the grass, a little deeper in front.
    { top: GRASS, bottom: 1, from: ['#ffffff', 0.06], to: ['#000000', 0.1] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
