import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { ball, balloon, bird, cloudShape, crab, dolphin, kite, person, plane, starfish, sun } from '../items/common';
import { lineMarks, markIfClear, scatterMarks } from '../marks';
import type { ItemDef, Mark, Recipe, Rect as Box, VariantDef } from '../types';

/** Band edges, as fractions of the picture height. */
const HORIZON = 0.35;
const SHORE = 0.6;

const SKY = ['sky'];
const SEA = ['sea'];
const SAND = ['sand'];

const items: ItemDef[] = [
  { ...sun, zones: SKY, maxCount: 1 },
  { ...bird, zones: SKY, maxCount: 6 },
  { ...kite, zones: SKY, maxCount: 3 },
  { ...balloon, zones: SKY, maxCount: 3 },
  // One plane at a time: two planes in the same patch of sky look like they're flying in formation.
  { ...plane, zones: SKY, maxCount: 1, countable: false },
  {
    kind: 'sailboat',
    singular: 'sailboat',
    plural: 'sailboats',
    article: 'a',
    w: 130,
    h: 150,
    tier: 'large',
    size: 0.22,
    zones: SEA,
    maxCount: 3,
    colours: [C.red, C.yellow, C.white, C.orange, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the sails on the boats?' : 'What colour was the sail on the boat?'),
    draw: (colour) => (
      <G>
        <Line x1={65} y1={5} x2={65} y2={118} stroke="#5c3d1e" strokeWidth={5} />
        <Polygon points="68,8 68,110 120,110" fill={colour} />
        <Polygon points="62,20 62,110 18,110" fill={colour} fillOpacity={0.85} />
        <Path d="M5,118 H125 L108,145 H22 Z" fill="#7a4a2a" stroke="#3d2412" />
      </G>
    ),
  },
  {
    kind: 'buoy',
    singular: 'buoy',
    plural: 'buoys',
    article: 'a',
    w: 50,
    h: 65,
    tier: 'small',
    size: 0.1,
    zones: SEA,
    maxCount: 4,
    colours: [C.red, C.yellow, C.orange, C.white],
    // A bold band so even a white or yellow buoy reads clearly on the water.
    draw: (colour) => (
      <G>
        <Path d="M10,60 C10,25 15,10 25,10 C35,10 40,25 40,60 Z" fill={colour} />
        <Rect x={11} y={32} width={28} height={11} fill={colour === C.white.hex || colour === C.yellow.hex ? '#d62828' : '#ffffff'} stroke="none" />
        <Line x1={25} y1={10} x2={25} y2={0} stroke="#333" strokeWidth={3} />
      </G>
    ),
  },
  { ...dolphin, zones: SEA, maxCount: 3 },
  {
    kind: 'umbrella',
    singular: 'beach umbrella',
    plural: 'beach umbrellas',
    article: 'a',
    w: 160,
    h: 180,
    tier: 'large',
    size: 0.24,
    zones: SAND,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple, C.pink],
    draw: (colour) => (
      <G>
        <Line x1={80} y1={60} x2={80} y2={180} stroke="#5c3d1e" strokeWidth={6} />
        <Path d="M2,62 C10,10 150,10 158,62 Z" fill={colour} />
        <Path d="M80,18 C60,30 50,45 48,62 L80,62 Z M80,18 C100,30 110,45 112,62 L80,62 Z" fill="#ffffff" fillOpacity={0.55} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'bucket',
    singular: 'bucket',
    plural: 'buckets',
    article: 'a',
    w: 60,
    h: 65,
    tier: 'small',
    size: 0.11,
    zones: SAND,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple],
    draw: (colour) => (
      <G>
        <Path d="M10,22 C10,0 50,0 50,22" fill="none" stroke="#555" strokeWidth={3} />
        <Path d="M4,22 H56 L48,65 H12 Z" fill={colour} />
      </G>
    ),
  },
  { ...ball, singular: 'beach ball', plural: 'beach balls', zones: SAND, maxCount: 3 },
  { ...crab, zones: SAND, maxCount: 4 },
  {
    kind: 'towel',
    singular: 'beach towel',
    plural: 'beach towels',
    article: 'a',
    w: 160,
    h: 70,
    // About as long as a person is tall.
    tier: 'large',
    size: 0.26,
    zones: SAND,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.pink],
    draw: (colour) => (
      <G>
        <Polygon points="20,0 160,0 140,70 0,70" fill={colour} />
        <Polygon points="50,0 70,0 50,70 30,70" fill="#ffffff" fillOpacity={0.7} stroke="none" />
        <Polygon points="110,0 130,0 110,70 90,70" fill="#ffffff" fillOpacity={0.7} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'palm',
    singular: 'palm tree',
    plural: 'palm trees',
    article: 'a',
    w: 160,
    h: 270,
    tier: 'large',
    size: 0.24,
    // Tall on purpose: it stands at the back of the sand and its leaves rise over the sea. Two are spread apart.
    tall: true,
    spread: true,
    zones: SAND,
    maxCount: 2,
    tone: '#2b9348',
    draw: () => (
      <G>
        <Path d="M70,270 C75,200 70,120 88,55 L100,58 C88,120 92,200 92,270 Z" fill="#8b5a2b" stroke="#5c3a1b" />
        <G fill="#2b9348">
          <Path d="M94,55 C60,20 20,30 0,60 C30,45 60,45 94,55 Z" />
          <Path d="M94,55 C120,15 150,20 160,50 C135,40 115,42 94,55 Z" />
          <Path d="M94,55 C80,10 95,0 110,0 C100,20 98,35 94,55 Z" />
          <Path d="M94,55 C60,60 35,85 30,110 C55,85 75,72 94,55 Z" />
          <Path d="M94,55 C125,60 145,85 150,110 C128,85 112,72 94,55 Z" />
        </G>
        <Circle cx={88} cy={62} r={8} fill="#6b3e1f" stroke="none" />
        <Circle cx={100} cy={64} r={8} fill="#6b3e1f" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'sandcastle',
    singular: 'sandcastle',
    plural: 'sandcastles',
    article: 'a',
    w: 130,
    h: 115,
    tier: 'medium',
    size: 0.17,
    zones: SAND,
    maxCount: 2,
    tone: '#b07d3a',
    draw: () => (
      <G fill="#b07d3a">
        <Rect x={10} y={55} width={110} height={60} />
        <Rect x={0} y={30} width={36} height={85} />
        <Rect x={94} y={30} width={36} height={85} />
        <Rect x={47} y={20} width={36} height={95} />
        <Line x1={65} y1={20} x2={65} y2={0} stroke="#555" strokeWidth={3} />
        <Polygon points="65,0 85,6 65,12" fill="#e63946" stroke="none" />
        <Path d="M55,115 V95 C55,85 75,85 75,95 V115 Z" fill="#7a5426" stroke="none" />
      </G>
    ),
  },
  { ...starfish, zones: SAND, maxCount: 4 },
  { ...person, zones: SAND, maxCount: 4 },
];

type Palette = Record<'sky' | 'sea' | 'sand' | 'foam', string>;

/** Background bands only: sky, sea and sand. Details are faint marks drawn around the things. */
function backdrop(height: number, { sky, sea, sand }: Palette) {
  const horizon = height * HORIZON;
  const shore = height * SHORE;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={horizon + 600} fill={sky} />
      <Rect x={-600} y={horizon} width={2100} height={shore - horizon} fill={sea} />
      <Rect x={-600} y={shore} width={2100} height={height - shore + 600} fill={sand} />
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const { foam } = variant.palette;
  const horizon = height * HORIZON;
  const shore = height * SHORE;
  const wave = (x: number, y: number) => <Path d={`M${x},${y + 10} q15,-10 30,0 t30,0`} fill="none" stroke={foam} strokeWidth={4} strokeLinecap="round" />;
  return [
    // White clouds: scenery, so solid, but never touching anything in the sky.
    ...scatterMarks({ x0: -100, y0: height * 0.03, x1: 1000, y1: horizon - 30 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true),
    ...scatterMarks({ x0: 20, y0: horizon + 20, x1: 880, y1: shore - 10 }, 60, 20, 6, boxes, random, 0.3, wave),
    ...lineMarks(shore, -600, 1500, boxes, foam, 5, 0.35),
    ...[0.2, 0.5, 0.8].flatMap((fx) => {
      const x = fx * 900 + (random() - 0.5) * 200;
      const y = shore + (height - shore) * (0.2 + 0.6 * random());
      return markIfClear(
        { x0: x - 4, y0: y - 4, x1: x + 30, y1: y + 4 },
        boxes,
        0.25,
        <Line key={`r${fx}`} x1={x} y1={y} x2={x + 26} y2={y} stroke="#a07a45" strokeWidth={4} strokeOpacity={0.25} strokeLinecap="round" />,
      );
    }),
  ];
}

const PALETTES: Record<string, Palette> = {
  day: { sky: '#8fd3f4', sea: '#2a9fd6', sand: '#f2d49b', foam: '#ffffff' },
  sunset: { sky: '#ffb38a', sea: '#3d6fa8', sand: '#e9c46a', foam: '#ffd6a5' },
};

export const beach: Recipe = {
  id: 'beach',
  title: 'At the beach',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: HORIZON, rows: 2 },
    // Boats, buoys and dolphins float in the water: clear of the horizon and well clear of the shore.
    { id: 'sea', label: 'In the sea', surface: 'air', top: HORIZON + 0.015, bottom: SHORE - 0.03, rows: 1 },
    { id: 'sand', label: 'On the sand', surface: 'ground', top: SHORE, bottom: 1, rows: 2 },
  ],
  items,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the horizon.
    { top: 0, bottom: HORIZON, from: ['#ffffff', 0], to: ['#ffffff', 0.2] },
    // The sea: deep far out, lighter in the shallows.
    { top: HORIZON, bottom: SHORE, from: ['#000000', 0.14], to: ['#ffffff', 0.08] },
    // Sun on the sand, a little deeper in front.
    { top: SHORE, bottom: 1, from: ['#ffffff', 0.1], to: ['#000000', 0.08] },
  ],
  surfaceAt: (_x, y) => (y < HORIZON ? 'sky' : y < SHORE ? 'sea' : 'sand'),
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
