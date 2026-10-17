import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { digitalLookalikes, randomDigitalTime } from '../clock';
import { C } from '../colours';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { lineMarks } from '../marks';
import { speckles } from '../texture';

/**
 * A kitchen, close up: an open shelf, the tiled wall, the worktop, and the floor in front of the
 * cupboards. Band edges as fractions of the picture height.
 *
 * Scale: a close-up like the supermarket, so objects only (no people or pets) and everything at one
 * scale, 1 m ≈ 0.53 of the picture width: the smallest thing that can be drawn 44 pt wide is about
 * 22 cm, so mugs, spoons and spice jars are left out. A kettle is about 0.12 wide, the microwave 0.28.
 */
const SHELF: [number, number] = [0.055, 0.205];
const SHELF_BOARD = 0.016;
const WALL: [number, number] = [0.24, 0.43];
const COUNTER: [number, number] = [0.45, 0.63];
const WORKTOP = 0.025;
const FLOOR_LINE = 0.885;
const FLOOR_TOP = 0.7;

const ON_SHELF = ['shelf'];
const ON_WALL = ['wall'];
const ON_COUNTER = ['counter'];
const ON_FLOOR = ['floor'];

/** Shelf things stand in a neat row on the shelf board. */
const shelved = { tier: 'small' as const, lineUp: true };

/** What can be in the fruit bowl (chosen per picture, and asked about). */
const FRUIT = ['Apples', 'Oranges', 'Bananas', 'Lemons'] as const;

function fruitIn(kind: string | undefined) {
  switch (kind) {
    case 'Oranges':
      return (
        <G fill={C.orange.hex} stroke="#8a4500" strokeWidth={3}>
          {[34, 60, 86, 47, 73].map((cx, i) => (
            <Circle key={i} cx={cx} cy={i < 3 ? 30 : 16} r={13} />
          ))}
        </G>
      );
    case 'Bananas':
      return (
        <G fill="#ffd60a" stroke="#a07800" strokeWidth={3} strokeLinejoin="round">
          <Path d="M24,30 Q60,48 100,22 Q96,34 60,40 Q34,40 24,30 Z" />
          <Path d="M28,22 Q62,36 98,10 Q94,24 62,30 Q38,32 28,22 Z" />
        </G>
      );
    case 'Lemons':
      return (
        <G fill="#ffe14d" stroke="#a08a00" strokeWidth={3}>
          {[34, 60, 86, 47, 73].map((cx, i) => (
            <Ellipse key={i} cx={cx} cy={i < 3 ? 30 : 17} rx={14} ry={10} />
          ))}
        </G>
      );
    default:
      return (
        <G fill={C.red.hex} stroke="#8f1d26" strokeWidth={3}>
          {[34, 60, 86, 47, 73].map((cx, i) => (
            <Circle key={i} cx={cx} cy={i < 3 ? 30 : 16} r={13} />
          ))}
        </G>
      );
  }
}

const items: ItemDef[] = [
  // ---- On the shelf ----
  {
    kind: 'plate',
    singular: 'plate',
    plural: 'plates',
    article: 'a',
    w: 100,
    h: 100,
    size: 0.14,
    zones: ON_SHELF,
    ...shelved,
    tier: 'medium',
    maxCount: 3,
    // Standing on their edge in a plate rack; on Hard, a row can mix colours.
    mixedColours: true,
    colours: [C.blue, C.red, C.green, C.yellow, C.orange],
    draw: (colour) => (
      <G>
        <Circle cx={50} cy={50} r={48} fill={colour} />
        <Circle cx={50} cy={50} r={30} fill="#ffffff" fillOpacity={0.55} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'cookbook',
    singular: 'cookbook',
    plural: 'cookbooks',
    article: 'a',
    w: 80,
    h: 100,
    size: 0.11,
    zones: ON_SHELF,
    ...shelved,
    maxCount: 3,
    colours: [C.red, C.blue, C.green, C.orange, C.purple],
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={80} height={100} rx={3} fill={colour} />
        <G stroke="none">
          <Rect x={0} y={0} width={10} height={100} fill="#000000" fillOpacity={0.2} />
          <Circle cx={45} cy={46} r={20} fill="#ffffff" />
          <Path d="M32,46 H58 Q56,60 45,60 Q34,60 32,46 Z" fill="#adb5bd" />
          <Rect x={22} y={76} width={46} height={6} rx={3} fill="#ffffff" />
        </G>
      </G>
    ),
  },
  {
    kind: 'pasta-jar',
    singular: 'jar of pasta',
    plural: 'jars of pasta',
    article: 'a',
    w: 60,
    h: 95,
    size: 0.1,
    zones: ON_SHELF,
    ...shelved,
    maxCount: 3,
    colours: [C.red, C.blue, C.green, C.yellow, C.white],
    colourPrompt: (plural) => (plural ? 'What colour were the lids on the pasta jars?' : 'What colour was the lid on the pasta jar?'),
    draw: (colour) => (
      <G>
        <Rect x={4} y={16} width={52} height={79} rx={8} fill="#e3f2fd" />
        <G stroke="none" fill="#f4c430">
          {[30, 44, 58, 72].map((y) => (
            <Path key={y} d={`M12,${y + 8} Q30,${y} 48,${y + 8}`} fill="none" stroke="#d4a017" strokeWidth={5} strokeLinecap="round" />
          ))}
        </G>
        <Rect x={0} y={4} width={60} height={14} rx={4} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'teapot',
    singular: 'teapot',
    plural: 'teapots',
    article: 'a',
    w: 120,
    h: 90,
    size: 0.14,
    zones: [...ON_SHELF, ...ON_COUNTER],
    ...shelved,
    tier: 'medium',
    maxCount: 1,
    countable: false,
    colours: [C.blue, C.red, C.yellow, C.green, C.pink],
    draw: (colour) => (
      <G>
        <Path d="M90,46 Q112,40 118,20" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Path d="M28,40 Q4,40 6,62 Q8,76 26,72" fill="none" stroke={colour} strokeWidth={8} strokeLinecap="round" />
        <Ellipse cx={60} cy={56} rx={36} ry={32} fill={colour} />
        <Ellipse cx={60} cy={26} rx={22} ry={6} fill={colour} />
        <Circle cx={60} cy={16} r={6} fill={colour} />
        <Rect x={40} y={84} width={40} height={6} rx={3} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'cookie-jar',
    singular: 'cookie jar',
    plural: 'cookie jars',
    article: 'a',
    w: 80,
    h: 100,
    size: 0.11,
    zones: [...ON_SHELF, ...ON_COUNTER],
    ...shelved,
    maxCount: 1,
    countable: false,
    tone: '#c8955a',
    draw: () => (
      <G>
        <Rect x={6} y={24} width={68} height={76} rx={14} fill="#c8955a" />
        <Rect x={2} y={12} width={76} height={16} rx={6} fill="#a0703c" />
        <Circle cx={40} cy={8} r={8} fill="#a0703c" />
        <G stroke="none">
          <Circle cx={40} cy={62} r={18} fill="#e9c46a" />
          <Circle cx={34} cy={58} r={3} fill="#5c3d1e" />
          <Circle cx={45} cy={64} r={3} fill="#5c3d1e" />
          <Circle cx={38} cy={70} r={2.5} fill="#5c3d1e" />
        </G>
      </G>
    ),
  },
  {
    kind: 'herbs',
    singular: 'pot of herbs',
    plural: 'pots of herbs',
    article: 'a',
    w: 80,
    h: 100,
    size: 0.11,
    zones: ON_SHELF,
    ...shelved,
    maxCount: 3,
    colours: [C.orange, C.blue, C.white, C.yellow, C.pink],
    colourPrompt: (plural) => (plural ? 'What colour were the herb pots?' : 'What colour was the herb pot?'),
    draw: (colour) => (
      <G>
        <G fill="#2b9348" stroke="#1b5e2f" strokeWidth={3}>
          <Ellipse cx={26} cy={30} rx={14} ry={22} transform="rotate(-25 26 30)" />
          <Ellipse cx={54} cy={30} rx={14} ry={22} transform="rotate(25 54 30)" />
          <Ellipse cx={40} cy={22} rx={13} ry={22} />
        </G>
        <Path d="M10,52 H70 L62,100 H18 Z" fill={colour} />
      </G>
    ),
  },

  // ---- On the wall ----
  {
    kind: 'frying-pan',
    singular: 'frying pan',
    plural: 'frying pans',
    article: 'a',
    w: 90,
    h: 160,
    tier: 'medium',
    size: 0.14,
    zones: ON_WALL,
    maxCount: 2,
    spread: true,
    tone: '#343a40',
    draw: () => (
      <G>
        {/* Hanging on a hook by its handle. */}
        <Circle cx={45} cy={6} r={5} fill="none" stroke="#868e96" strokeWidth={3} />
        <Rect x={38} y={10} width={14} height={66} rx={6} fill="#5c3d1e" />
        <Circle cx={45} cy={116} r={44} fill="#343a40" />
        <Circle cx={45} cy={116} r={34} fill="#495057" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'oven-glove',
    singular: 'oven glove',
    plural: 'oven gloves',
    article: 'an',
    w: 70,
    h: 110,
    size: 0.11,
    tier: 'small',
    zones: ON_WALL,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow, C.orange, C.pink],
    draw: (colour) => (
      <G>
        <Circle cx={35} cy={6} r={5} fill="none" stroke="#868e96" strokeWidth={3} />
        <Path d="M16,14 H54 V60 Q70,56 66,74 L58,96 Q52,110 36,110 H22 Q10,110 10,96 V30 Q10,14 16,14 Z" fill={colour} />
        <Rect x={10} y={14} width={44} height={14} fill="#ffffff" fillOpacity={0.6} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'tea-towel',
    singular: 'tea towel',
    plural: 'tea towels',
    article: 'a',
    w: 100,
    h: 140,
    tier: 'medium',
    size: 0.15,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.yellow],
    colourPrompt: () => 'What colour were the stripes on the tea towel?',
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={100} height={10} rx={5} fill="#868e96" />
        <Rect x={10} y={8} width={80} height={130} fill="#f8f9fa" />
        <G stroke="none" fill={colour}>
          <Rect x={10} y={28} width={80} height={14} />
          <Rect x={10} y={56} width={80} height={6} />
          <Rect x={10} y={104} width={80} height={14} />
        </G>
      </G>
    ),
  },
  {
    kind: 'utensils',
    singular: 'utensil rail',
    plural: 'utensil rails',
    article: 'a',
    w: 170,
    h: 110,
    tier: 'large',
    size: 0.26,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    tone: '#868e96',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={170} height={10} rx={5} fill="#868e96" />
        <G fill="#495057">
          {/* A ladle, a whisk, a spatula and a slotted spoon. */}
          <Rect x={24} y={8} width={7} height={70} rx={3} />
          <Path d="M14,78 Q14,100 28,100 Q42,100 42,78 Z" />
          <Rect x={66} y={8} width={7} height={52} rx={3} />
          <Ellipse cx={69.5} cy={82} rx={13} ry={24} fill="none" stroke="#495057" strokeWidth={4} />
          <Rect x={106} y={8} width={7} height={58} rx={3} />
          <Rect x={96} y={64} width={27} height={36} rx={5} />
          <Rect x={146} y={8} width={7} height={62} rx={3} />
          <Ellipse cx={149.5} cy={88} rx={13} ry={18} />
        </G>
      </G>
    ),
  },
  {
    kind: 'window',
    singular: 'window',
    plural: 'windows',
    article: 'a',
    w: 150,
    h: 140,
    tier: 'large',
    size: 0.28,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    tone: '#5aa9e6',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={150} height={140} fill="#ffffff" />
        <G fill="#5aa9e6" stroke="none">
          <Rect x={10} y={10} width={60} height={120} />
          <Rect x={80} y={10} width={60} height={120} />
        </G>
      </G>
    ),
  },

  // ---- On the counter ----
  {
    kind: 'microwave',
    singular: 'microwave',
    plural: 'microwaves',
    article: 'a',
    w: 220,
    h: 130,
    tier: 'large',
    // About 52 cm wide.
    size: 0.28,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    noFlip: true,
    tone: '#868e96',
    // The time on its display is chosen per picture (see `details`): a digital clock.
    draw: (_colour, details) => (
      <G>
        <Rect x={0} y={0} width={220} height={124} rx={8} fill="#868e96" />
        <Rect x={10} y={12} width={124} height={100} rx={5} fill="#343a40" />
        <Rect x={20} y={22} width={104} height={80} rx={3} fill="#495057" stroke="none" />
        <Rect x={140} y={12} width={72} height={38} rx={4} fill="#111111" />
        <SvgText x={176} y={32} fontSize={27} fontWeight="bold" fontFamily="Arial" fill="#7CFC00" stroke="none" textAnchor="middle" alignmentBaseline="central">
          {details?.values?.microwave ?? '7:45'}
        </SvgText>
        <G fill="#ced4da" stroke="none">
          {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={148 + c * 21} y={60 + r * 16} width={14} height={9} rx={2} />))}
        </G>
        <Rect x={20} y={124} width={18} height={6} fill="#495057" stroke="none" />
        <Rect x={182} y={124} width={18} height={6} fill="#495057" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'kettle',
    singular: 'kettle',
    plural: 'kettles',
    article: 'a',
    w: 90,
    h: 100,
    tier: 'small',
    size: 0.12,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.white, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M64,30 Q90,30 86,58 Q84,74 66,76" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Path d="M16,36 L2,24" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Path d="M14,30 Q14,14 38,14 Q62,14 62,30 L68,94 H8 Z" fill={colour} />
        <Rect x={4} y={92} width={68} height={8} rx={3} fill="#343a40" />
        <Rect x={30} y={6} width={16} height={10} rx={3} fill="#343a40" />
      </G>
    ),
  },
  {
    kind: 'toaster',
    singular: 'toaster',
    plural: 'toasters',
    article: 'a',
    w: 110,
    h: 80,
    tier: 'medium',
    size: 0.16,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.green, C.white],
    draw: (colour) => (
      <G>
        <G fill="#d4a373" stroke="#8a5a2b" strokeWidth={3}>
          <Rect x={26} y={0} width={24} height={26} rx={6} />
          <Rect x={60} y={4} width={24} height={22} rx={6} />
        </G>
        <Rect x={4} y={18} width={102} height={62} rx={18} fill={colour} />
        <Rect x={92} y={34} width={14} height={8} rx={3} fill="#343a40" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'fruit-bowl',
    singular: 'fruit bowl',
    plural: 'fruit bowls',
    article: 'a',
    w: 120,
    h: 72,
    tier: 'medium',
    size: 0.16,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    tone: '#b07d45',
    // Its fruit is chosen per picture (see `details`): "What was in the fruit bowl?".
    draw: (_colour, details) => (
      <G>
        {fruitIn(details?.values?.fruit)}
        <Path d="M4,32 H116 Q112,72 60,72 Q8,72 4,32 Z" fill="#b07d45" />
      </G>
    ),
  },
  {
    kind: 'chopping-board',
    singular: 'chopping board',
    plural: 'chopping boards',
    article: 'a',
    w: 160,
    h: 50,
    tier: 'large',
    size: 0.21,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    tone: '#c8955a',
    draw: () => (
      <G>
        {/* Carrots on the board. */}
        <G fill={C.orange.hex} stroke="#8a4500" strokeWidth={3}>
          <Path d="M30,30 L96,22 L96,34 Z" />
          <Path d="M46,40 L112,30 L112,42 Z" />
        </G>
        <Path d="M96,22 l10,-8 M96,26 l12,-2 M112,30 l10,-8" stroke="#2b9348" strokeWidth={4} strokeLinecap="round" />
        <Rect x={0} y={38} width={160} height={12} rx={5} fill="#c8955a" />
      </G>
    ),
  },
  {
    kind: 'saucepan',
    singular: 'saucepan',
    plural: 'saucepans',
    article: 'a',
    w: 150,
    h: 70,
    tier: 'medium',
    size: 0.18,
    zones: ON_COUNTER,
    maxCount: 2,
    colours: [C.red, C.blue, C.orange, C.green],
    draw: (colour) => (
      <G>
        <Rect x={96} y={14} width={54} height={10} rx={5} fill="#343a40" />
        <Rect x={4} y={10} width={96} height={60} rx={8} fill={colour} />
        <Rect x={0} y={4} width={104} height={10} rx={4} fill={colour} />
      </G>
    ),
  },
  {
    kind: 'coffee-machine',
    singular: 'coffee machine',
    plural: 'coffee machines',
    article: 'a',
    w: 80,
    h: 120,
    tier: 'small',
    size: 0.12,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    tone: '#343a40',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={80} height={30} rx={6} fill="#343a40" />
        <Rect x={0} y={24} width={22} height={86} fill="#343a40" />
        <Rect x={0} y={108} width={80} height={12} rx={4} fill="#343a40" />
        <Rect x={30} y={30} width={14} height={14} fill="#495057" />
        <Path d="M30,76 H58 V100 Q58,106 52,106 H36 Q30,106 30,100 Z" fill="#f8f9fa" />
        <Circle cx={60} cy={14} r={6} fill="#7CFC00" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'mixer',
    singular: 'food mixer',
    plural: 'food mixers',
    article: 'a',
    w: 100,
    h: 120,
    tier: 'medium',
    size: 0.14,
    zones: ON_COUNTER,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.pink, C.green],
    draw: (colour) => (
      <G>
        {/* A stand mixer: base, column, the head over a steel bowl. */}
        <Rect x={54} y={40} width={18} height={72} fill={colour} />
        <Path d="M12,62 H66 Q66,106 39,106 Q12,106 12,62 Z" fill="#ced4da" />
        <Rect x={36} y={46} width={6} height={22} fill="#868e96" stroke="none" />
        <Path d="M28,10 H86 Q98,10 98,22 V36 Q98,48 86,48 H28 Z" fill={colour} />
        <Rect x={4} y={106} width={92} height={14} rx={4} fill={colour} />
      </G>
    ),
  },

  // ---- On the floor, in front of the cupboards ----
  {
    kind: 'bin',
    singular: 'pedal bin',
    plural: 'pedal bins',
    article: 'a',
    w: 80,
    h: 130,
    tier: 'medium',
    size: 0.17,
    zones: ON_FLOOR,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.white, C.yellow, C.green],
    draw: (colour) => (
      <G>
        <Path d="M6,18 H74 L68,130 H12 Z" fill={colour} />
        <Rect x={2} y={4} width={76} height={16} rx={6} fill={colour} />
        <Rect x={30} y={0} width={20} height={6} rx={3} fill="#495057" />
        <Rect x={26} y={124} width={28} height={6} rx={2} fill="#495057" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'bucket',
    singular: 'mop and bucket',
    plural: 'mops and buckets',
    article: 'a',
    w: 90,
    h: 140,
    tier: 'medium',
    size: 0.17,
    zones: ON_FLOOR,
    maxCount: 1,
    countable: false,
    colours: [C.blue, C.red, C.yellow, C.green],
    colourPrompt: () => 'What colour was the bucket?',
    draw: (colour) => (
      <G>
        <Path d="M56,0 L44,80" stroke="#c8955a" strokeWidth={7} strokeLinecap="round" />
        <Path d="M30,58 Q45,40 60,58" fill="none" stroke="#adb5bd" strokeWidth={4} />
        <Path d="M10,70 H80 L72,140 H18 Z" fill={colour} />
        <Path d="M10,70 Q45,52 80,70" fill="none" stroke="#495057" strokeWidth={4} />
        <G fill="#e9ecef" stroke="#adb5bd" strokeWidth={2}>
          <Rect x={34} y={60} width={6} height={16} rx={3} />
          <Rect x={44} y={58} width={6} height={18} rx={3} />
          <Rect x={54} y={60} width={6} height={16} rx={3} />
        </G>
      </G>
    ),
  },
  {
    kind: 'stool',
    singular: 'step stool',
    plural: 'step stools',
    article: 'a',
    w: 100,
    h: 110,
    tier: 'large',
    size: 0.2,
    zones: ON_FLOOR,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.green, C.white],
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={100} height={14} rx={4} fill={colour} />
        <Rect x={10} y={54} width={80} height={12} rx={4} fill={colour} />
        <Path d="M10,14 L4,110 M90,14 L96,110" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'recycling',
    singular: 'recycling box',
    plural: 'recycling boxes',
    article: 'a',
    w: 120,
    h: 90,
    tier: 'large',
    size: 0.21,
    zones: ON_FLOOR,
    maxCount: 1,
    countable: false,
    tone: '#2b9348',
    draw: () => (
      <G>
        {/* Bottles and a carton sticking out. */}
        <G stroke="#1b5e2f" strokeWidth={3}>
          <Path d="M30,40 V18 Q30,10 36,6 V0 H44 V6 Q50,10 50,18 V40 Z" fill="#a7d7a9" />
          <Rect x={62} y={14} width={24} height={30} fill="#f8f9fa" />
          <Path d="M92,40 V22 Q92,16 98,12 V6 H104 V12 Q110,16 110,22 V40 Z" fill="#9ad1f5" />
        </G>
        <Path d="M2,34 H118 L110,90 H10 Z" fill="#2b9348" />
        <Path d="M50,56 L60,48 L70,56 M56,72 H72 L66,62" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
  },
  {
    kind: 'veg-basket',
    singular: 'basket of vegetables',
    plural: 'baskets of vegetables',
    article: 'a',
    w: 110,
    h: 90,
    tier: 'medium',
    size: 0.18,
    zones: ON_FLOOR,
    maxCount: 1,
    countable: false,
    tone: '#a86a32',
    draw: () => (
      <G>
        <G strokeWidth={3}>
          <Path d="M30,40 L24,4 M38,40 L40,2" stroke="#2b9348" strokeWidth={7} strokeLinecap="round" />
          <Circle cx={66} cy={30} r={14} fill="#7b2cbf" stroke="#4a1a73" />
          <Circle cx={88} cy={32} r={12} fill={C.red.hex} stroke="#8f1d26" />
          <Ellipse cx={50} cy={34} rx={12} ry={9} fill="#d4a373" stroke="#8a5a2b" />
        </G>
        <Path d="M2,38 H108 L98,90 H12 Z" fill="#a86a32" />
        <Path d="M8,56 H102 M12,72 H98" fill="none" stroke="#6b4420" strokeWidth={3} />
      </G>
    ),
  },
  {
    kind: 'pet-bowl',
    singular: 'pet bowl',
    plural: 'pet bowls',
    article: 'a',
    w: 90,
    h: 40,
    tier: 'small',
    size: 0.12,
    zones: ON_FLOOR,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow, C.pink],
    draw: (colour) => (
      <G>
        <Path d="M6,8 H84 L74,40 H16 Z" fill={colour} />
        <Ellipse cx={45} cy={8} rx={39} ry={6} fill="#8a5a2b" stroke="none" />
      </G>
    ),
  },
];

/** The time on the microwave (every level) and what's in the fruit bowl, chosen per picture. */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const time = randomDigitalTime(random, clockStep);
  const { close, other } = digitalLookalikes(time);
  const fruit = random.pick(FRUIT);
  return {
    values: { microwave: time, fruit },
    facts: [
      { id: 'microwave-time', type: 'number', prompt: 'What time was on the microwave?', answer: time, wrong: close, fallback: other, needs: 'microwave', everyLevel: true, spotlight: true },
      { id: 'fruit', type: 'object', prompt: 'What was in the fruit bowl?', answer: fruit, wrong: FRUIT.filter((f) => f !== fruit), needs: 'fruit-bowl' },
    ],
  };
}

type Palette = Record<'wall' | 'grout' | 'shelf' | 'worktop' | 'cupboard' | 'cupboardEdge' | 'handle' | 'floor' | 'floorLine', string>;

function backdrop(height: number, p: Palette) {
  const shelfLine = SHELF[1] * height;
  const counterLine = COUNTER[1] * height;
  const cupboardTop = (COUNTER[1] + WORKTOP) * height;
  const floorLine = FLOOR_LINE * height;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={counterLine + 600} fill={p.wall} />
      {/* The open shelf, on two brackets. */}
      <Rect x={-600} y={shelfLine} width={2100} height={SHELF_BOARD * height} fill={p.shelf} />
      {/* The worktop and the cupboards under it, with handles. */}
      <Rect x={-600} y={counterLine} width={2100} height={WORKTOP * height} fill={p.worktop} />
      <Rect x={-600} y={cupboardTop} width={2100} height={floorLine - cupboardTop} fill={p.cupboard} />
      {Array.from({ length: 10 }, (_, i) => (
        <G key={i}>
          <Rect x={-600 + i * 225 + 8} y={cupboardTop + 10} width={209} height={floorLine - cupboardTop - 24} rx={6} fill="none" stroke={p.cupboardEdge} strokeWidth={5} />
          <Rect x={-600 + i * 225 + 100} y={cupboardTop + 24} width={26} height={8} rx={4} fill={p.handle} />
        </G>
      ))}
      <Rect x={-600} y={floorLine} width={2100} height={height - floorLine + 600} fill={p.floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: floorLine, x1: 940, y1: height }, 120, '#000000', 0.05, 3)}
      <Rect x={-600} y={floorLine} width={2100} height={6} fill="#000000" fillOpacity={0.15} />
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Tile lines on the wall, broken around anything in front of them.
  return [0.29, 0.36, 0.43, 0.24].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.grout, 3, 0.25));
}

const PALETTES: Record<string, Palette> = {
  // White tiles, navy cupboards, a dark worktop and a light grey floor.
  modern: {
    wall: '#f3efe6',
    grout: '#b8b0a0',
    shelf: '#8a5a2b',
    worktop: '#495057',
    cupboard: '#2f4858',
    cupboardEdge: '#24384a',
    handle: '#ced4da',
    floor: '#d9d9d9',
    floorLine: '#b0b0b0',
  },
  // Pale blue tiles, sage cupboards, a wooden worktop and floor.
  farmhouse: {
    wall: '#cfe3e8',
    grout: '#9fbcc4',
    shelf: '#a0703c',
    worktop: '#c8955a',
    cupboard: '#7a9e7e',
    cupboardEdge: '#5f7f63',
    handle: '#f1e7d0',
    floor: '#e3d3b0',
    floorLine: '#b39470',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < COUNTER[1]) return 'wall';
  if (y < FLOOR_LINE) return 'cupboard';
  return 'floor';
}

export const kitchen: Recipe = {
  id: 'kitchen',
  title: 'In the kitchen',
  zones: [
    { id: 'shelf', label: 'On the shelf', surface: 'ground', top: SHELF[0], bottom: SHELF[1], rows: 1, flush: true },
    { id: 'wall', label: 'On the wall', surface: 'wall', top: WALL[0], bottom: WALL[1], rows: 1 },
    { id: 'counter', label: 'On the worktop', surface: 'ground', top: COUNTER[0], bottom: COUNTER[1], rows: 1, flush: true },
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR_TOP, bottom: 1, rows: 1, flush: true, maxGroups: 3 },
  ],
  items,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Light from above on the tiles, shade by the worktop.
    { top: SHELF[1] + SHELF_BOARD, bottom: COUNTER[1], from: ['#ffffff', 0.08], to: ['#000000', 0.08] },
    // Shade under the worktop's edge.
    { top: COUNTER[1] + WORKTOP, bottom: FLOOR_LINE, from: ['#000000', 0.08], to: ['#000000', 0] },
    // Shade on the floor by the cupboards.
    { top: FLOOR_LINE, bottom: 1, from: ['#000000', 0.06], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
