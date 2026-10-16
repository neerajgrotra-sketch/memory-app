import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { C } from '../colours';
import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { ball, dog, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, Rug, SceneDetails } from '../types';
import type { Rng } from '../random';

/** Band edges, as fractions of the picture height: a thin ceiling, the wall, then the floor. */
const CEILING = 0.1;
const FLOOR = 0.55;

const WALL = ['wall'];
const FLOOR_ZONE = ['floor'];

/** The rug, shared by the drawing, the contrast rules and placement: things are fully on it or off it. */
const RUG: Rug = { cx: 0.5, cy: 0.8, rx: 0.36, ry: 0.09 };

const items: ItemDef[] = [
  {
    kind: 'frame',
    singular: 'picture frame',
    plural: 'picture frames',
    article: 'a',
    w: 110,
    h: 90,
    tier: 'medium',
    size: 0.14,
    zones: WALL,
    maxCount: 2,
    // At eye level, one per stretch of wall.
    hangAt: 0.34,
    spread: true,
    colours: [C.red, C.blue, C.yellow, C.green, C.black, C.white, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the picture frames?' : 'What colour was the picture frame?'),
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={110} height={90} fill={colour} />
        <G stroke="none">
          <Rect x={12} y={12} width={86} height={66} fill="#cfe9ff" />
          <Path d="M12,78 L40,45 L60,65 L75,52 L98,78 Z" fill="#74c69d" />
          <Circle cx={80} cy={28} r={8} fill="#ffd93b" />
        </G>
      </G>
    ),
  },
  {
    kind: 'wall-clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'medium',
    // Big enough to read the hands on a phone.
    size: 0.16,
    zones: WALL,
    maxCount: 1,
    // Above everything else on the wall.
    hangAt: 0.52,
    tone: '#343a40',
    countable: false,
    noFlip: true,
    // The time is chosen per picture (see `details`); 10:10 when drawn on its own.
    draw: (_colour, details) => <ClockFace time={details?.values?.clock ?? '10:10'} />,
  },
  {
    kind: 'mirror',
    singular: 'mirror',
    plural: 'mirrors',
    article: 'a',
    w: 90,
    h: 130,
    tier: 'medium',
    size: 0.15,
    zones: WALL,
    maxCount: 1,
    hangAt: 0.36,
    tone: '#b08d57',
    draw: () => (
      <G>
        <Ellipse cx={45} cy={65} rx={43} ry={63} fill="#b08d57" />
        <Ellipse cx={45} cy={65} rx={33} ry={53} fill="#dbe9f4" stroke="none" />
        <Line x1={30} y1={40} x2={50} y2={20} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'window',
    singular: 'window',
    plural: 'windows',
    article: 'a',
    w: 150,
    h: 175,
    tier: 'large',
    size: 0.22,
    zones: WALL,
    hangAt: 0.36,
    // One window: two would end up one above the other on a single wall.
    maxCount: 1,
    tone: '#5aa9e6',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={150} height={175} fill="#ffffff" />
        <G fill="#5aa9e6" stroke="none">
          <Rect x={11} y={11} width={58} height={71} />
          <Rect x={81} y={11} width={58} height={71} />
          <Rect x={11} y={94} width={58} height={70} />
          <Rect x={81} y={94} width={58} height={70} />
        </G>
      </G>
    ),
  },
  {
    kind: 'sofa',
    singular: 'sofa',
    plural: 'sofas',
    article: 'a',
    w: 230,
    h: 120,
    tier: 'xl',
    size: 0.44,
    wide: true,
    backRow: true,
    zones: FLOOR_ZONE,
    maxCount: 1,
    avoidRug: true,
    colours: [C.red, C.blue, C.green, C.grey, C.yellow, C.purple, C.brown],
    draw: (colour) => (
      <G>
        <Rect x={20} y={0} width={190} height={70} rx={16} fill={colour} />
        <Rect x={0} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={190} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={30} y={62} width={170} height={40} rx={8} fill={colour} />
        <Rect x={10} y={108} width={12} height={12} fill="#5c3d1e" stroke="none" />
        <Rect x={208} y={108} width={12} height={12} fill="#5c3d1e" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'armchair',
    singular: 'armchair',
    plural: 'armchairs',
    article: 'an',
    w: 120,
    h: 120,
    tier: 'large',
    size: 0.2,
    zones: FLOOR_ZONE,
    maxCount: 2,
    backRow: true,
    spread: true,
    avoidRug: true,
    colours: [C.red, C.blue, C.green, C.yellow, C.orange, C.pink],
    draw: (colour) => (
      <G>
        <Rect x={18} y={0} width={84} height={70} rx={14} fill={colour} />
        <Rect x={0} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={90} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={26} y={64} width={68} height={38} rx={8} fill={colour} />
        <Rect x={8} y={108} width={10} height={12} fill="#5c3d1e" stroke="none" />
        <Rect x={102} y={108} width={10} height={12} fill="#5c3d1e" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'floor-lamp',
    singular: 'floor lamp',
    plural: 'floor lamps',
    article: 'a',
    w: 80,
    h: 230,
    tier: 'medium',
    size: 0.13,
    tall: true,
    spread: true,
    zones: FLOOR_ZONE,
    maxCount: 2,
    avoidRug: true,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the lampshades?' : 'What colour was the lampshade?'),
    draw: (colour) => (
      <G>
        <Rect x={36} y={60} width={8} height={160} fill="#495057" stroke="none" />
        <Ellipse cx={40} cy={224} rx={30} ry={6} fill="#495057" stroke="none" />
        <Path d="M14,0 H66 L80,64 H0 Z" fill={colour} />
      </G>
    ),
  },
  {
    kind: 'tv',
    singular: 'television',
    plural: 'televisions',
    article: 'a',
    w: 170,
    h: 140,
    tier: 'large',
    size: 0.28,
    zones: FLOOR_ZONE,
    maxCount: 1,
    backRow: true,
    avoidRug: true,
    tone: '#212529',
    countable: false,
    draw: () => (
      <G>
        <Rect x={20} y={100} width={130} height={40} fill="#8b5a2b" stroke="#4a2f16" />
        <Rect x={0} y={0} width={170} height={100} rx={6} fill="#212529" />
        <Rect x={8} y={8} width={154} height={84} fill="#4dabf7" stroke="none" />
      </G>
    ),
  },
  // Plants stand along the wall, never out in the room or on the rug.
  { ...plantPot, zones: FLOOR_ZONE, maxCount: 3, avoidRug: true, backRow: true, spread: true },
  {
    kind: 'bookshelf',
    singular: 'bookshelf',
    plural: 'bookshelves',
    article: 'a',
    w: 120,
    h: 200,
    tier: 'large',
    size: 0.2,
    tall: true,
    spread: true,
    zones: FLOOR_ZONE,
    maxCount: 2,
    avoidRug: true,
    tone: '#8b5a2b',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={120} height={200} fill="#8b5a2b" />
        <G stroke="none">
          {[0, 1, 2].map((shelf) => (
            <G key={shelf}>
              <Rect x={8} y={8 + shelf * 64} width={104} height={56} fill="#5c3d1e" />
              <Rect x={14} y={20 + shelf * 64} width={14} height={44} fill={['#e63946', '#1d70d6', '#2b9348'][shelf]} />
              <Rect x={30} y={26 + shelf * 64} width={12} height={38} fill="#ffd60a" />
              <Rect x={44} y={18 + shelf * 64} width={16} height={46} fill={['#7b2cbf', '#f77f00', '#e63946'][shelf]} />
            </G>
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'cat',
    singular: 'cat',
    plural: 'cats',
    article: 'a',
    w: 90,
    h: 75,
    tier: 'small',
    size: 0.12,
    zones: FLOOR_ZONE,
    maxCount: 3,
    colours: [C.orange, C.black, C.grey, C.white],
    draw: (colour) => (
      <G>
        <Path d="M72,60 C95,55 92,25 80,20" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Ellipse cx={45} cy={56} rx={32} ry={19} fill={colour} />
        <Circle cx={22} cy={32} r={19} fill={colour} />
        <Path d="M8,22 L8,0 L22,14 Z M36,22 L36,0 L22,14 Z" fill={colour} />
        <Circle cx={15} cy={30} r={3} fill="#111" stroke="none" />
        <Circle cx={29} cy={30} r={3} fill="#111" stroke="none" />
      </G>
    ),
  },
  { ...dog, zones: FLOOR_ZONE, maxCount: 2 },
  { ...ball, zones: FLOOR_ZONE, maxCount: 3 },
  {
    kind: 'cushion',
    singular: 'cushion',
    plural: 'cushions',
    article: 'a',
    w: 75,
    h: 60,
    tier: 'medium',
    size: 0.13,
    zones: FLOOR_ZONE,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple, C.orange],
    draw: (colour) => <Path d="M6,6 Q37,14 69,6 Q62,30 69,54 Q37,46 6,54 Q13,30 6,6 Z" fill={colour} />,
  },
  {
    kind: 'teddy',
    singular: 'teddy bear',
    plural: 'teddy bears',
    article: 'a',
    w: 75,
    h: 90,
    tier: 'small',
    size: 0.11,
    zones: FLOOR_ZONE,
    maxCount: 3,
    tone: '#a0612b',
    draw: () => (
      <G fill="#a0612b">
        <Circle cx={18} cy={12} r={11} />
        <Circle cx={57} cy={12} r={11} />
        <Ellipse cx={37.5} cy={66} rx={26} ry={24} />
        <Circle cx={37.5} cy={30} r={23} />
        <Ellipse cx={37.5} cy={38} rx={10} ry={7} fill="#e9c46a" stroke="none" />
        <Circle cx={29} cy={26} r={3} fill="#111" stroke="none" />
        <Circle cx={46} cy={26} r={3} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'toy-car',
    singular: 'toy car',
    plural: 'toy cars',
    article: 'a',
    w: 85,
    h: 45,
    tier: 'small',
    size: 0.11,
    zones: FLOOR_ZONE,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M2,32 V20 C2,16 6,14 10,14 H22 L32,2 H58 L70,14 H76 C80,14 83,17 83,21 V32 Z" fill={colour} />
        <Circle cx={21} cy={34} r={9} fill="#222" stroke="none" />
        <Circle cx={65} cy={34} r={9} fill="#222" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'books',
    singular: 'pile of books',
    plural: 'piles of books',
    article: 'a',
    w: 90,
    h: 60,
    tier: 'small',
    size: 0.12,
    zones: FLOOR_ZONE,
    maxCount: 3,
    tone: '#1d70d6',
    avoidRug: true,
    draw: () => (
      <G>
        <Rect x={0} y={40} width={90} height={20} fill="#e63946" />
        <Rect x={8} y={20} width={76} height={20} fill="#1d70d6" />
        <Rect x={4} y={0} width={80} height={20} fill="#2b9348" />
      </G>
    ),
  },
];

type Palette = Record<'wall' | 'ceiling' | 'floor' | 'plank' | 'rug' | 'rugEdge', string>;

/** Background bands: ceiling, wall, skirting, floor and the rug. Floorboards are faint marks drawn around the things. */
function backdrop(height: number, { wall, ceiling, floor, rug, rugEdge }: Palette) {
  const ceilingLine = height * CEILING;
  const floorLine = height * FLOOR;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceilingLine + 600} fill={ceiling} />
      <Rect x={-600} y={ceilingLine} width={2100} height={floorLine - ceilingLine} fill={wall} />
      <Rect x={-600} y={ceilingLine} width={2100} height={10} fill="#000000" fillOpacity={0.06} />
      <Rect x={-600} y={floorLine} width={2100} height={height - floorLine + 600} fill={floor} />
      <Rect x={-600} y={floorLine - 14} width={2100} height={14} fill="#ffffff" fillOpacity={0.7} />
      <Ellipse cx={RUG.cx * 900} cy={RUG.cy * height} rx={RUG.rx * 900} ry={RUG.ry * height} fill={rug} stroke={rugEdge} strokeOpacity={0.35} strokeWidth={8} />
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: { palette: Record<string, string> }): Mark[] {
  // Floorboard lines, broken around anything standing on them and kept off the rug.
  const rugTop = (RUG.cy - RUG.ry) * height - 10;
  const rugBottom = (RUG.cy + RUG.ry) * height + 10;
  return [0.62, 0.69, 0.93].flatMap((f) => {
    const y = f * height;
    const rugBlock = y > rugTop && y < rugBottom ? [{ x0: (RUG.cx - RUG.rx) * 900, y0: rugTop, x1: (RUG.cx + RUG.rx) * 900, y1: rugBottom }] : [];
    return lineMarks(y, -600, 1500, [...boxes, ...rugBlock], variant.palette.plank, 3, 0.3);
  });
}

/** Light oak floors so brown pets and teddies stand out; pale solid rugs so every toy colour shows on them. */
const PALETTES: Record<string, Palette> = {
  cream: { wall: '#f3e9d2', ceiling: '#faf6ec', floor: '#d9b98c', plank: '#8a6a43', rug: '#e4ecf4', rugEdge: '#3d5a80' },
  blue: { wall: '#cfe0ec', ceiling: '#eef4f8', floor: '#d4b48c', plank: '#86663f', rug: '#f6efe0', rugEdge: '#9c6644' },
  sage: { wall: '#dce5d1', ceiling: '#f1f5ec', floor: '#c9a47a', plank: '#7d5d38', rug: '#f4e6ea', rugEdge: '#9d4e6a' },
};

/** The time on the clock: something to remember whenever the clock is in the picture, on every level. */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  return {
    values: { clock: time },
    facts: [{ id: 'clock-time', type: 'number', prompt: 'What time was on the clock?', answer: time, wrong: close, fallback: other, needs: 'wall-clock', everyLevel: true, spotlight: true }],
  };
}

function surfaceAt(x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR) return 'wall';
  return ((x - RUG.cx) / RUG.rx) ** 2 + ((y - RUG.cy) / RUG.ry) ** 2 <= 1 ? 'rug' : 'floor';
}

export const livingRoom: Recipe = {
  id: 'living-room',
  title: 'Living room',
  details,
  zones: [
    { id: 'ceiling', label: 'On the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    // Things on the wall hang on two lines: a clock high up (top row of slots), the rest at eye level.
    { id: 'wall', label: 'On the wall', surface: 'wall', top: CEILING, bottom: FLOOR, rows: 2, minGroups: 2 },
    // A deeper back row for furniture against the wall, then two rows for things out on the floor.
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR, bottom: 1, rows: 3, rowSizes: [0.4, 0.3, 0.3], anchors: 2 },
  ],
  items,
  rug: RUG,
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
