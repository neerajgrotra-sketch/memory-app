import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, bird, cloudShape, dog, person, plane, tree } from '../items/common';
import { markIfClear, scatterMarks } from '../marks';
import type { ItemDef, Mark, Recipe, Rect as Box, VariantDef } from '../types';

/** Band edges, as fractions of the picture height. */
const ROOF = 0.26;
const GROUND_LINE = 0.56;
const KERB = 0.78;

const SKY = ['sky'];
const WALLS = ['buildings'];
const PAVEMENT = ['pavement'];
const ROAD = ['road'];

const wheel = (cx: number, cy: number, r: number) => (
  <G stroke="none">
    <Circle cx={cx} cy={cy} r={r} fill="#222" />
    <Circle cx={cx} cy={cy} r={r * 0.45} fill="#adb5bd" />
  </G>
);

const items: ItemDef[] = [
  { ...bird, zones: SKY, maxCount: 6 },
  // One plane at a time: two planes in the same patch of sky look like they're flying in formation.
  { ...plane, zones: SKY, maxCount: 1, countable: false },
  { ...balloon, zones: SKY, maxCount: 3 },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 100,
    h: 90,
    tier: 'medium',
    size: 0.14,
    zones: WALLS,
    maxCount: 2,
    colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
    // A flag on a short pole sticking out from the building front.
    draw: (colour) => (
      <G>
        <Rect x={0} y={70} width={12} height={20} rx={2} fill="#343a40" stroke="none" />
        <Line x1={8} y1={80} x2={60} y2={8} stroke="#495057" strokeWidth={5} strokeLinecap="round" />
        <Path d="M60,8 C72,14 84,2 98,8 V50 C84,44 72,56 60,50 Z" fill={colour} />
      </G>
    ),
  },
  {
    kind: 'clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 120,
    h: 110,
    tier: 'medium',
    size: 0.14,
    zones: WALLS,
    maxCount: 1,
    tone: '#343a40',
    countable: false,
    // A street clock on a bracket fixed to the building front.
    draw: () => (
      <G>
        <Rect x={0} y={20} width={14} height={40} rx={3} fill="#343a40" />
        <Rect x={10} y={34} width={28} height={10} fill="#343a40" />
        <Circle cx={76} cy={58} r={42} fill="#ffffff" stroke="#343a40" strokeWidth={8} />
        <Line x1={76} y1={58} x2={76} y2={28} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
        <Line x1={76} y1={58} x2={96} y2={68} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'dish',
    singular: 'satellite dish',
    plural: 'satellite dishes',
    article: 'a',
    w: 80,
    h: 80,
    tier: 'medium',
    size: 0.13,
    zones: WALLS,
    maxCount: 3,
    tone: '#e9ecef',
    draw: () => (
      <G>
        <Rect x={2} y={34} width={12} height={30} rx={2} fill="#495057" stroke="none" />
        <Line x1={10} y1={50} x2={34} y2={46} stroke="#495057" strokeWidth={5} />
        <Path d="M30,6 C10,40 40,74 76,60 Z" fill="#e9ecef" />
        <Line x1={44} y1={40} x2={66} y2={22} stroke="#495057" strokeWidth={4} />
        <Circle cx={67} cy={21} r={5} fill="#495057" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'stall',
    singular: 'market stall',
    plural: 'market stalls',
    article: 'a',
    w: 180,
    h: 160,
    tier: 'large',
    size: 0.26,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.yellow],
    colourPrompt: (plural) => (plural ? 'What colour were the awnings on the market stalls?' : 'What colour was the awning on the market stall?'),
    draw: (colour) => (
      <G>
        <Rect x={12} y={50} width={7} height={110} fill="#5c3d1e" stroke="none" />
        <Rect x={161} y={50} width={7} height={110} fill="#5c3d1e" stroke="none" />
        <Rect x={8} y={105} width={164} height={55} fill="#a0612b" stroke="#5c3d1e" />
        <G stroke="none">
          <Circle cx={40} cy={100} r={12} fill="#e63946" />
          <Circle cx={64} cy={100} r={12} fill="#f77f00" />
          <Circle cx={88} cy={100} r={12} fill="#ffd60a" />
          <Circle cx={112} cy={100} r={12} fill="#2b9348" />
          <Circle cx={136} cy={100} r={12} fill="#e63946" />
        </G>
        <Path d="M10,0 H170 L180,45 Q165,62 150,45 Q135,62 120,45 Q105,62 90,45 Q75,62 60,45 Q45,62 30,45 Q15,62 0,45 Z" fill={colour} />
        <G fill="#ffffff" fillOpacity={0.75} stroke="none">
          <Polygon points="42,0 62,0 64,45 40,45" />
          <Polygon points="106,0 126,0 132,45 108,45" />
        </G>
      </G>
    ),
  },
  { ...person, zones: PAVEMENT, maxCount: 4 },
  { ...dog, zones: PAVEMENT, maxCount: 2 },
  { ...tree, zones: PAVEMENT, maxCount: 2 },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 75,
    tier: 'medium',
    size: 0.17,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.brown, C.yellow],
    draw: (colour) => (
      <G>
        <Rect x={14} y={45} width={8} height={30} fill="#343a40" stroke="none" />
        <Rect x={118} y={45} width={8} height={30} fill="#343a40" stroke="none" />
        <Rect x={4} y={8} width={132} height={14} rx={3} fill={colour} />
        <Rect x={0} y={36} width={140} height={14} rx={3} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'bin',
    singular: 'rubbish bin',
    plural: 'rubbish bins',
    article: 'a',
    w: 55,
    h: 85,
    tier: 'small',
    size: 0.1,
    zones: PAVEMENT,
    maxCount: 3,
    colours: [C.green, C.black, C.blue, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M6,14 H49 L44,85 H11 Z" fill={colour} />
        <Rect x={2} y={4} width={51} height={12} rx={4} fill={colour} />
        <Line x1={20} y1={28} x2={22} y2={74} stroke="#00000033" strokeWidth={3} />
        <Line x1={35} y1={28} x2={33} y2={74} stroke="#00000033" strokeWidth={3} />
      </G>
    ),
  },
  {
    kind: 'bicycle',
    singular: 'bicycle',
    plural: 'bicycles',
    article: 'a',
    w: 115,
    h: 75,
    tier: 'medium',
    size: 0.16,
    zones: PAVEMENT,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.black, C.pink],
    colourPrompt: (plural) => (plural ? 'What colour were the bicycles?' : 'What colour was the bicycle?'),
    draw: (colour) => (
      <G>
        <Circle cx={24} cy={51} r={21} fill="none" stroke="#222" strokeWidth={5} />
        <Circle cx={91} cy={51} r={21} fill="none" stroke="#222" strokeWidth={5} />
        <Path d="M24,51 L46,18 L82,18 L91,51 M46,18 L56,51 L82,18 M24,51 H56" fill="none" stroke={colour} strokeWidth={7} strokeLinejoin="round" />
        <Line x1={42} y1={10} x2={54} y2={10} stroke="#222" strokeWidth={6} strokeLinecap="round" />
        <Path d="M82,18 L78,6 H92" fill="none" stroke="#222" strokeWidth={5} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'hydrant',
    singular: 'fire hydrant',
    plural: 'fire hydrants',
    article: 'a',
    w: 50,
    h: 75,
    tier: 'small',
    size: 0.1,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.yellow],
    draw: (colour) => (
      <G>
        <Rect x={10} y={20} width={30} height={50} rx={5} fill={colour} />
        <Rect x={0} y={34} width={50} height={12} rx={4} fill={colour} />
        <Path d="M10,22 C10,4 40,4 40,22 Z" fill={colour} />
        <Rect x={4} y={68} width={42} height={7} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'lamp-post',
    singular: 'street lamp',
    plural: 'street lamps',
    article: 'a',
    w: 60,
    h: 240,
    tier: 'small',
    size: 0.1,
    tall: true,
    zones: PAVEMENT,
    maxCount: 2,
    tone: '#343a40',
    draw: () => (
      <G>
        <Rect x={26} y={40} width={8} height={200} fill="#343a40" />
        <Rect x={12} y={0} width={36} height={44} rx={6} fill="#343a40" />
        <Rect x={18} y={6} width={24} height={30} fill="#fff3b0" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'car',
    singular: 'car',
    plural: 'cars',
    article: 'a',
    w: 175,
    h: 85,
    tier: 'large',
    size: 0.22,
    zones: ROAD,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.black, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M5,62 V42 C5,34 12,30 20,30 H40 L62,6 H122 L145,30 H158 C166,30 172,36 172,44 V62 Z" fill={colour} />
        <Path d="M70,12 H95 V30 H50 Z M101,12 H118 L136,30 H101 Z" fill="#cfe9ff" stroke="none" />
        {wheel(42, 64, 18)}
        {wheel(134, 64, 18)}
      </G>
    ),
  },
  {
    kind: 'bus',
    singular: 'bus',
    plural: 'buses',
    article: 'a',
    w: 230,
    h: 115,
    tier: 'large',
    size: 0.28,
    zones: ROAD,
    maxCount: 1,
    colours: [C.red, C.blue, C.yellow, C.green, C.white],
    draw: (colour) => (
      <G>
        <Rect x={2} y={2} width={226} height={88} rx={12} fill={colour} />
        <G fill="#cfe9ff" stroke="none">
          <Rect x={14} y={14} width={36} height={30} rx={4} />
          <Rect x={58} y={14} width={36} height={30} rx={4} />
          <Rect x={102} y={14} width={36} height={30} rx={4} />
          <Rect x={146} y={14} width={36} height={30} rx={4} />
          <Rect x={190} y={14} width={30} height={50} rx={4} />
        </G>
        {wheel(48, 94, 20)}
        {wheel(180, 94, 20)}
      </G>
    ),
  },
  {
    kind: 'scooter',
    singular: 'scooter',
    plural: 'scooters',
    article: 'a',
    w: 95,
    h: 75,
    tier: 'medium',
    size: 0.15,
    zones: ROAD,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.white],
    draw: (colour) => (
      <G>
        <Path d="M20,52 C22,34 45,30 62,36 L70,52 Z" fill={colour} />
        <Rect x={30} y={26} width={30} height={9} rx={4} fill="#222" stroke="none" />
        <Path d="M70,52 L78,10 H90" fill="none" stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
        {wheel(18, 58, 15)}
        {wheel(78, 58, 15)}
      </G>
    ),
  },
  {
    kind: 'van',
    singular: 'van',
    plural: 'vans',
    article: 'a',
    w: 190,
    h: 100,
    tier: 'large',
    size: 0.24,
    zones: ROAD,
    maxCount: 2,
    colours: [C.white, C.blue, C.red, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M4,78 V14 C4,8 8,4 14,4 H130 L170,38 C180,40 186,46 186,54 V78 Z" fill={colour} />
        <Path d="M134,12 L162,38 H134 Z" fill="#cfe9ff" stroke="none" />
        {wheel(42, 80, 18)}
        {wheel(150, 80, 18)}
      </G>
    ),
  },
];

type Palette = Record<string, string>;

/** One building front per third of the picture, so anything "on the buildings" is on exactly one. */
const FACADES = [0, 1, 2];

function cityPalette(sky: string, facades: string[], window: string): Palette {
  return {
    sky,
    window,
    pavement: '#ced4da',
    road: '#3a4046',
    ...Object.fromEntries(FACADES.map((i) => [`facade${i}`, facades[i]])),
  };
}

const PALETTES: Record<string, Palette> = {
  day: cityPalette('#8cc8f5', ['#e9c46a', '#f4a261', '#b5838d'], '#e7f5ff'),
  sunset: cityPalette('#ffa98a', ['#c9ada7', '#9a8c98', '#e5989b'], '#fff3bf'),
};

function surfaceAt(x: number, y: number): string {
  if (y < ROOF) return 'sky';
  if (y < GROUND_LINE) return `facade${Math.min(2, Math.max(0, Math.floor(x * 3)))}`;
  if (y < KERB) return 'pavement';
  return 'road';
}

/** Background bands: sky, three building fronts (the outer ones run on past the picture's edges), pavement, kerb, road. */
function backdrop(height: number, palette: Palette) {
  const roof = height * ROOF;
  const ground = height * GROUND_LINE;
  const kerb = height * KERB;
  const spans: [number, number][] = [
    [-600, 300],
    [300, 600],
    [600, 1500],
  ];
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={roof + 600} fill={palette.sky} />
      {spans.map(([x0, x1], i) => (
        <Rect key={x0} x={x0} y={roof} width={x1 - x0} height={ground - roof} fill={palette[`facade${i}`]} />
      ))}
      <Rect x={-600} y={roof} width={2100} height={10} fill="#000000" fillOpacity={0.15} />
      {[300, 600].map((x) => (
        <Rect key={x} x={x - 2} y={roof} width={4} height={ground - roof} fill="#000000" fillOpacity={0.15} />
      ))}
      <Rect x={-600} y={ground} width={2100} height={kerb - ground} fill={palette.pavement} />
      <Rect x={-600} y={kerb} width={2100} height={height - kerb + 600} fill={palette.road} />
      <Rect x={-600} y={kerb} width={2100} height={12} fill="#868e96" />
    </G>
  );
}

/** Faint windows, doors, road markings and clouds, each left out wherever it would touch a thing. */
function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const roof = height * ROOF;
  const ground = height * GROUND_LINE;
  const wallH = ground - roof;
  const out: Mark[] = [];
  for (const i of FACADES) {
    const centre = i * 300 + 150;
    for (const dx of [-75, 25]) {
      const x0 = centre + dx;
      const y0 = roof + wallH * 0.18;
      const r = { x0, y0, x1: x0 + 50, y1: y0 + wallH * 0.24 };
      out.push(...markIfClear(r, boxes, 0.3, <Rect key={`w${i}${dx}`} x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill={variant.palette.window} fillOpacity={0.3} />));
    }
    const door = { x0: centre - 28, y0: ground - wallH * 0.36, x1: centre + 28, y1: ground };
    out.push(...markIfClear(door, boxes, 0.3, <Rect key={`d${i}`} x={door.x0} y={door.y0} width={56} height={door.y1 - door.y0} fill="#3d2412" fillOpacity={0.3} />));
  }
  const dashY = height * 0.885;
  for (const x of [40, 280, 520, 760]) {
    out.push(...markIfClear({ x0: x, y0: dashY - 4, x1: x + 100, y1: dashY + 4 }, boxes, 0.35, <Rect key={`r${x}`} x={x} y={dashY - 4} width={100} height={8} fill="#f8f9fa" fillOpacity={0.35} />));
  }
  out.push(...scatterMarks({ x0: -100, y0: height * 0.03, x1: 1000, y1: roof - 20 }, 150, 66, 3, boxes, random, 0.35, (x, y) => cloudShape(x, y, 150 / 170)));
  return out;
}

export const city: Recipe = {
  id: 'city',
  title: 'City street',
  place: 'in the street',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: ROOF, rows: 2 },
    { id: 'buildings', label: 'On the buildings', surface: 'wall', top: ROOF, bottom: GROUND_LINE, rows: 2, panels: true, minGroups: 1 },
    { id: 'pavement', label: 'On the pavement', surface: 'ground', top: GROUND_LINE, bottom: KERB, rows: 2 },
    { id: 'road', label: 'On the road', surface: 'ground', top: KERB, bottom: 1, rows: 1 },
  ],
  items,
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
