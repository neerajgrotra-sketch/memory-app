import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';

/**
 * A supermarket aisle: signs hang from the ceiling, three shelves of products, and the floor in front.
 * Band edges as fractions of the picture height. Each shelf band ends on the shelf board, where
 * products stand in neat rows (`lineUp`), one kind per third of each shelf, like a real aisle.
 */
const CEILING = 0.135;
const SHELVES: [number, number][] = [
  [0.15, 0.32],
  [0.345, 0.505],
  [0.53, 0.685],
];
/** Thickness of a shelf board, below each shelf band. */
const BOARD = 0.018;
const FLOOR_LINE = 0.71;
const FLOOR_TOP = 0.72;

const TOP = ['top'];
const MIDDLE = ['middle'];
const BOTTOM = ['bottom'];
const FLOOR = ['floor'];

/** Product colours; purple, black and brown are left out because they'd vanish on the dark shelves. */
const PRODUCT = [C.red, C.blue, C.yellow, C.green, C.orange, C.pink];

/**
 * Things on a shelf: one neat row, small enough that two or three fit in a third of the shelf.
 *
 * Scale: the shelves are a close-up (products must be at least 44 pt wide to read on a phone), so a
 * 30 cm cereal box is about 0.16 of the picture width tall: 1 m ≈ 0.53. Everything on the floor is
 * drawn at that same scale, which is why there are no shoppers or trolleys here: a person would be
 * taller than the floor and cover the shelves, and a smaller one looks like a toy next to the boxes.
 */
const shelved = { tier: 'small' as const, lineUp: true, maxCount: 3 };

const items: ItemDef[] = [
  {
    kind: 'cereal',
    singular: 'cereal box',
    plural: 'cereal boxes',
    article: 'a',
    w: 70,
    h: 100,
    size: 0.11,
    zones: [...TOP, ...MIDDLE],
    ...shelved,
    colours: PRODUCT,
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={70} height={100} rx={3} fill={colour} />
        <G stroke="none">
          <Rect x={56} y={0} width={14} height={100} fill="#000000" fillOpacity={0.15} />
          <Ellipse cx={30} cy={30} rx={22} ry={13} fill="#ffffff" />
          <Path d="M10,62 H50 A20,16 0 0 1 10,62 Z" fill="#ffffff" />
          <Circle cx={20} cy={59} r={5} fill="#f4c430" />
          <Circle cx={31} cy={57} r={5} fill="#f4c430" />
          <Circle cx={41} cy={59} r={5} fill="#f4c430" />
        </G>
      </G>
    ),
  },
  {
    kind: 'toilet-rolls',
    singular: 'pack of toilet rolls',
    plural: 'packs of toilet rolls',
    article: 'a',
    w: 90,
    h: 80,
    size: 0.12,
    zones: TOP,
    ...shelved,
    maxCount: 2,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={0} y={6} width={90} height={74} rx={10} fill="#f8f9fa" />
        <G stroke="none">
          <Rect x={0} y={36} width={90} height={18} fill={C.blue.hex} />
          {[16, 45, 74].map((cx) => (
            <G key={cx}>
              <Ellipse cx={cx} cy={10} rx={13} ry={6} fill="#e9ecef" />
              <Ellipse cx={cx} cy={10} rx={4} ry={2.5} fill="#c9a27a" />
            </G>
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'water',
    singular: 'bottle of water',
    plural: 'bottles of water',
    article: 'a',
    w: 50,
    h: 85,
    size: 0.1,
    zones: [...TOP, ...BOTTOM],
    ...shelved,
    tone: '#5fb3e8',
    draw: () => (
      <G>
        <Path d="M16,14 H34 V20 Q46,26 46,38 V78 Q46,85 39,85 H11 Q4,85 4,78 V38 Q4,26 16,20 Z" fill="#5fb3e8" />
        <Rect x={17} y={2} width={16} height={12} rx={2} fill="#1e4fb8" />
        <Rect x={4} y={48} width={42} height={16} fill="#ffffff" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'tin',
    singular: 'tin',
    plural: 'tins',
    article: 'a',
    w: 60,
    h: 75,
    size: 0.1,
    zones: [...MIDDLE, ...BOTTOM],
    ...shelved,
    colours: PRODUCT,
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={60} height={75} rx={5} fill={colour} />
        <G stroke="none">
          <Rect x={0} y={0} width={60} height={9} rx={4} fill="#c0c7cf" />
          <Rect x={0} y={66} width={60} height={9} rx={4} fill="#c0c7cf" />
          <Ellipse cx={30} cy={38} rx={19} ry={11} fill="#ffffff" />
        </G>
      </G>
    ),
  },
  {
    kind: 'jar',
    singular: 'jar of honey',
    plural: 'jars of honey',
    article: 'a',
    w: 60,
    h: 75,
    size: 0.1,
    zones: MIDDLE,
    ...shelved,
    colours: [C.red, C.blue, C.yellow, C.green],
    colourPrompt: (plural) => (plural ? 'What colour were the lids on the honey jars?' : 'What colour was the lid on the honey jar?'),
    draw: (colour) => (
      <G>
        <Rect x={4} y={14} width={52} height={61} rx={12} fill="#f2a93b" />
        <Rect x={2} y={0} width={56} height={16} rx={4} fill={colour} />
        <Rect x={12} y={36} width={36} height={22} rx={4} fill="#ffffff" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'juice',
    singular: 'bottle of juice',
    plural: 'bottles of juice',
    article: 'a',
    w: 50,
    h: 85,
    size: 0.1,
    zones: [...TOP, ...MIDDLE],
    ...shelved,
    // On Hard, a row can mix flavours.
    mixedColours: true,
    colours: [C.orange, C.red, C.green, C.yellow, C.pink],
    draw: (colour) => (
      <G>
        <Path d="M16,14 H34 V20 Q46,26 46,38 V78 Q46,85 39,85 H11 Q4,85 4,78 V38 Q4,26 16,20 Z" fill={colour} />
        <Rect x={17} y={2} width={16} height={12} rx={2} fill="#f8f9fa" />
        <G stroke="none">
          <Rect x={4} y={46} width={42} height={20} fill="#ffffff" />
          <Circle cx={25} cy={56} r={6} fill={colour} />
        </G>
      </G>
    ),
  },
  {
    kind: 'milk',
    singular: 'carton of milk',
    plural: 'cartons of milk',
    article: 'a',
    w: 55,
    h: 85,
    size: 0.1,
    zones: [...BOTTOM, ...MIDDLE],
    ...shelved,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={0} y={22} width={55} height={63} fill="#f8f9fa" />
        <Path d="M0,22 L9,4 H46 L55,22 Z" fill={C.blue.hex} />
        <Path d="M27.5,40 C34,50 36,55 36,59 A8.5,8.5 0 0 1 19,59 C19,55 21,50 27.5,40 Z" fill={C.blue.hex} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'eggs',
    singular: 'box of eggs',
    plural: 'boxes of eggs',
    article: 'a',
    w: 100,
    h: 55,
    size: 0.15,
    zones: [...BOTTOM, ...MIDDLE],
    ...shelved,
    tier: 'medium',
    maxCount: 2,
    tone: '#d8b98a',
    draw: () => (
      <G>
        <Rect x={0} y={12} width={100} height={43} rx={8} fill="#d8b98a" />
        {[14, 38, 62, 86].map((cx) => (
          <Ellipse key={cx} cx={cx} cy={14} rx={11} ry={9} fill="#d8b98a" />
        ))}
        <G stroke="none">
          <Rect x={30} y={27} width={40} height={18} rx={3} fill="#ffffff" />
          <Ellipse cx={50} cy={36} rx={6} ry={7} fill="#f2dcb3" />
        </G>
      </G>
    ),
  },
  {
    kind: 'bread',
    singular: 'loaf of bread',
    plural: 'loaves of bread',
    article: 'a',
    w: 100,
    h: 60,
    size: 0.15,
    zones: [...BOTTOM, ...TOP],
    ...shelved,
    tier: 'medium',
    maxCount: 2,
    tone: '#c98b4a',
    draw: () => (
      <G>
        <Path d="M4,58 V30 Q4,4 30,6 Q50,0 70,6 Q96,4 96,30 V58 Z" fill="#c98b4a" />
        <Path d="M28,16 l8,10 M48,12 l8,10 M68,16 l8,10" fill="none" stroke="#8a5a2b" strokeWidth={4} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'basket',
    singular: 'shopping basket',
    plural: 'shopping baskets',
    article: 'a',
    w: 90,
    h: 65,
    tier: 'large',
    size: 0.22,
    zones: FLOOR,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M22,24 Q22,2 45,2 Q68,2 68,24" fill="none" stroke={colour} strokeWidth={7} />
        <Path d="M4,22 H86 L77,63 H13 Z" fill={colour} />
        <G fill="#ffffff" fillOpacity={0.5} stroke="none">
          {[20, 36, 52, 68].map((x) => (
            <Rect key={x} x={x - 4} y={32} width={8} height={20} rx={3} />
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'apples',
    singular: 'crate of apples',
    plural: 'crates of apples',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'large',
    size: 0.26,
    zones: FLOOR,
    maxCount: 1,
    tone: '#8a5a2b',
    draw: () => fruitCrate(C.red.hex, '#8f1d26'),
  },
  {
    kind: 'oranges',
    singular: 'crate of oranges',
    plural: 'crates of oranges',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'large',
    size: 0.26,
    zones: FLOOR,
    maxCount: 1,
    tone: '#8a5a2b',
    draw: () => fruitCrate(C.orange.hex, '#8a4500'),
  },
  {
    kind: 'watermelon',
    singular: 'watermelon',
    plural: 'watermelons',
    article: 'a',
    w: 90,
    h: 62,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 3,
    tone: '#3a8f3a',
    draw: () => (
      <G>
        <Ellipse cx={45} cy={31} rx={44} ry={30} fill="#3a8f3a" />
        <Path d="M20,8 Q10,31 20,54 M45,2 Q36,31 45,60 M70,8 Q80,31 70,54" fill="none" stroke="#1f5f24" strokeWidth={5} />
      </G>
    ),
  },
  {
    kind: 'wet-floor',
    singular: 'wet floor sign',
    plural: 'wet floor signs',
    article: 'a',
    w: 60,
    h: 90,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 1,
    countable: false,
    tone: '#ffd60a',
    draw: () => (
      <G>
        <Path d="M8,88 L22,4 H38 L52,88 Z" fill="#ffd60a" />
        <Path d="M30,32 L44,58 H16 Z" fill="none" stroke="#212529" strokeWidth={4} strokeLinejoin="round" />
        <Path d="M30,40 V49" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
        <Circle cx={30} cy={54} r={2.2} fill="#212529" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'box',
    singular: 'cardboard box',
    plural: 'cardboard boxes',
    article: 'a',
    w: 90,
    h: 75,
    tier: 'large',
    size: 0.21,
    zones: FLOOR,
    maxCount: 2,
    tone: '#b07d45',
    draw: () => (
      <G>
        <Rect x={0} y={10} width={90} height={65} fill="#b07d45" />
        <Path d="M0,10 L10,0 H80 L90,10 Z" fill="#c8955a" />
        <Rect x={39} y={10} width={12} height={28} fill="#e8d3a8" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'shopping-bag',
    singular: 'shopping bag',
    plural: 'shopping bags',
    article: 'a',
    w: 80,
    h: 95,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 2,
    tone: '#c8955a',
    draw: () => (
      <G>
        <Path d="M22,22 L30,4 M44,4 L36,22" fill="none" stroke="#2b9348" strokeWidth={6} strokeLinecap="round" />
        <Path d="M48,24 L58,2 L66,6 L58,26" fill="#e9c46a" stroke="#a07800" strokeWidth={3} strokeLinejoin="round" />
        <Path d="M4,24 H76 L72,95 H8 Z" fill="#c8955a" />
        <Path d="M4,24 L12,34 H68 L76,24" fill="none" stroke="#8a5a2b" strokeWidth={3} />
      </G>
    ),
  },
  {
    kind: 'potatoes',
    singular: 'sack of potatoes',
    plural: 'sacks of potatoes',
    article: 'a',
    w: 90,
    h: 100,
    tier: 'large',
    size: 0.2,
    zones: FLOOR,
    maxCount: 2,
    tone: '#a68a64',
    draw: () => (
      <G>
        <Path d="M14,20 Q4,60 8,92 Q45,102 82,92 Q86,60 76,20 Z" fill="#a68a64" />
        <Path d="M14,20 Q30,8 45,16 Q60,8 76,20 Q60,28 45,22 Q30,28 14,20 Z" fill="#c4a77d" />
        <G fill="#c9a26b" stroke="#7a5a32" strokeWidth={3}>
          <Ellipse cx={34} cy={14} rx={10} ry={7} />
          <Ellipse cx={54} cy={12} rx={10} ry={7} />
        </G>
        <Rect x={26} y={48} width={38} height={24} rx={4} fill="#f1e7d0" stroke="none" />
      </G>
    ),
  },
];

/** A wooden crate heaped with round fruit. */
function fruitCrate(fruit: string, edge: string) {
  return (
    <G>
      <G fill={fruit} stroke={edge} strokeWidth={3}>
        {[18, 41, 64, 87].map((cx) => (
          <Circle key={cx} cx={cx + 2} cy={30} r={12} />
        ))}
        {[30, 53, 76].map((cx) => (
          <Circle key={cx} cx={cx + 2} cy={16} r={12} />
        ))}
      </G>
      <Rect x={0} y={34} width={110} height={36} rx={3} fill="#8a5a2b" />
      <Path d="M4,46 H106 M4,58 H106" fill="none" stroke="#5c3a1a" strokeWidth={3} />
    </G>
  );
}

/** What the offer sign can show, with its little picture (drawn around 0,0, about 50 across). */
const OFFERS: { name: string; icon: () => ReactElement }[] = [
  {
    name: 'Apples',
    icon: () => (
      <G>
        <Circle cx={0} cy={4} r={20} fill={C.red.hex} />
        <Path d="M0,-14 Q2,-22 8,-24" fill="none" stroke="#5c3d1e" strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={11} cy={-17} rx={8} ry={4} fill={C.green.hex} />
      </G>
    ),
  },
  {
    name: 'Bananas',
    icon: () => <Path d="M-22,-10 Q-18,22 22,14 Q4,14 -12,-12 Z" fill="#ffd60a" stroke="#a07800" strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    name: 'Bread',
    icon: () => <Path d="M-24,16 V0 Q-24,-18 -8,-16 Q0,-20 8,-16 Q24,-18 24,0 V16 Z" fill="#c98b4a" stroke="#8a5a2b" strokeWidth={3} />,
  },
  {
    name: 'Milk',
    icon: () => (
      <G>
        <Rect x={-13} y={-8} width={26} height={30} fill="#f8f9fa" stroke="#1d70d6" strokeWidth={3} />
        <Path d="M-13,-8 L-9,-20 H9 L13,-8 Z" fill="#1d70d6" />
      </G>
    ),
  },
  {
    name: 'Cheese',
    icon: () => (
      <G>
        <Path d="M-22,14 L22,14 L22,-6 L-22,-14 Z" fill="#ffc43d" stroke="#b07800" strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={-8} cy={4} r={4} fill="#e0a21a" />
        <Circle cx={10} cy={2} r={3} fill="#e0a21a" />
      </G>
    ),
  },
];

/** Aisle numbers easy to mix up with `n`: one or two along, or the digits swapped. */
function aisleLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 25);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The aisle number and what's on offer, both on signs hanging from the ceiling. */
function details(random: Rng): SceneDetails {
  const aisle = random.int(1, 15);
  const offer = random.pick(OFFERS);
  return {
    values: { aisle: String(aisle), offer: offer.name, aisleSide: random.next() < 0.5 ? 'left' : 'right' },
    facts: [
      { id: 'aisle-number', type: 'number', prompt: 'What was the aisle number?', answer: String(aisle), wrong: aisleLookalikes(aisle) },
      {
        id: 'offer',
        type: 'object',
        prompt: 'What was on special offer?',
        answer: offer.name,
        wrong: OFFERS.filter((o) => o !== offer).map((o) => o.name),
      },
    ],
  };
}

type Palette = Record<'ceiling' | 'light' | 'backing' | 'board' | 'tag' | 'upright' | 'floor' | 'tile', string>;

/** A sign hanging on two wires from the ceiling, centred on `cx`, its bottom at `bottom`. */
function hanging(cx: number, bottom: number, w: number, h: number, body: ReactElement) {
  const top = bottom - h;
  return (
    <G>
      <Path d={`M${cx - w / 2 + 24},-600 V${top} M${cx + w / 2 - 24},-600 V${top}`} stroke="#6c757d" strokeWidth={3} />
      <G transform={`translate(${cx - w / 2} ${top})`}>{body}</G>
    </G>
  );
}

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const ceiling = height * CEILING;
  const floorLine = height * FLOOR_LINE;
  const aisle = d?.values?.aisle ?? '7';
  const offer = OFFERS.find((o) => o.name === d?.values?.offer) ?? OFFERS[0];
  const aisleX = d?.values?.aisleSide === 'right' ? 640 : 260;
  const offerX = d?.values?.aisleSide === 'right' ? 250 : 650;
  // The signs hang just above the top shelf, as big as the ceiling band allows.
  const signH = Math.min(96, ceiling - 22);
  const signBottom = ceiling - 10;
  const s = signH / 96;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceiling + 600} fill={p.ceiling} />
      {/* Strip lights. */}
      {[-300, 150, 600, 1050].map((x) => (
        <Rect key={x} x={x} y={Math.max(4, ceiling * 0.08)} width={300} height={10} rx={5} fill={p.light} />
      ))}
      {/* The shelving unit: dark backing, uprights at each end, a board under each shelf, a plinth. */}
      <Rect x={-600} y={ceiling} width={2100} height={floorLine - ceiling} fill={p.backing} />
      {SHELVES.map(([, bottom]) => (
        <G key={bottom}>
          <Rect x={-600} y={bottom * height} width={2100} height={BOARD * height} fill={p.board} />
          {/* Price labels along the shelf edge. */}
          {Array.from({ length: 6 }, (_, i) => (
            <Rect key={i} x={70 + i * 150} y={bottom * height + BOARD * height * 0.2} width={34} height={BOARD * height * 0.6} fill={p.tag} />
          ))}
        </G>
      ))}
      <Rect x={-600} y={ceiling} width={612} height={floorLine - ceiling} fill={p.upright} />
      <Rect x={888} y={ceiling} width={612} height={floorLine - ceiling} fill={p.upright} />
      <Rect x={-600} y={floorLine} width={2100} height={height - floorLine + 600} fill={p.floor} />
      <Rect x={-600} y={floorLine} width={2100} height={6} fill="#000000" fillOpacity={0.12} />
      {/* The aisle sign: what number? */}
      {hanging(
        aisleX,
        signBottom,
        200 * s,
        signH,
        <G transform={`scale(${s})`}>
          <Rect x={0} y={0} width={200} height={96} rx={12} fill={C.blue.hex} stroke="#ffffff" strokeWidth={5} />
          <SvgText x={62} y={50} fontSize={26} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle" alignmentBaseline="central">
            AISLE
          </SvgText>
          <SvgText x={148} y={52} fontSize={58} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle" alignmentBaseline="central">
            {aisle}
          </SvgText>
        </G>,
      )}
      {/* The offer sign: what was on offer? */}
      {hanging(
        offerX,
        signBottom,
        240 * s,
        signH,
        <G transform={`scale(${s})`}>
          <Rect x={0} y={0} width={240} height={96} rx={12} fill={C.red.hex} stroke="#ffffff" strokeWidth={5} />
          <SvgText x={82} y={50} fontSize={30} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" textAnchor="middle" alignmentBaseline="central">
            OFFER
          </SvgText>
          <Circle cx={188} cy={48} r={42} fill="#ffffff" />
          <G transform="translate(188 50) scale(1.35)">{offer.icon()}</G>
        </G>,
      )}
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Lines between the floor tiles, broken around anything standing on them.
  return [0.79, 0.87, 0.95].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.tile, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  // A bright modern shop: white ceiling, dark slate shelves so every product colour pops, pale tiles.
  modern: {
    ceiling: '#f1f4f7',
    light: '#ffffff',
    backing: '#3b4a5c',
    board: '#e9eef2',
    tag: '#ffd60a',
    upright: '#2b3644',
    floor: '#dfe5ea',
    tile: '#8c99a6',
  },
  // A cosy corner shop: cream ceiling, dark wooden shelves, light oak floor.
  corner: {
    ceiling: '#f6efe2',
    light: '#fffaf0',
    backing: '#4b3a2c',
    board: '#a0703c',
    tag: '#f8f9fa',
    upright: '#3a2c20',
    floor: '#e6d2b5',
    tile: '#9c7a50',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR_LINE) return 'backing';
  return 'floor';
}

export const supermarket: Recipe = {
  id: 'supermarket',
  title: 'In the supermarket',
  zones: [
    // Signs only (backdrop): nothing else hangs here.
    { id: 'ceiling', label: 'Hanging from the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    { id: 'top', label: 'On the top shelf', surface: 'ground', top: SHELVES[0][0], bottom: SHELVES[0][1], rows: 1, flush: true },
    { id: 'middle', label: 'On the middle shelf', surface: 'ground', top: SHELVES[1][0], bottom: SHELVES[1][1], rows: 1, flush: true },
    { id: 'bottom', label: 'On the bottom shelf', surface: 'ground', top: SHELVES[2][0], bottom: SHELVES[2][1], rows: 1, flush: true },
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR_TOP, bottom: 1, rows: 2 },
  ],
  items,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // The ceiling, darker towards the shelves.
    { top: 0, bottom: CEILING, from: ['#ffffff', 0], to: ['#000000', 0.06] },
    // Shade at the back of each shelf, under the one above.
    { top: CEILING, bottom: SHELVES[0][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    { top: SHELVES[0][1] + BOARD, bottom: SHELVES[1][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    { top: SHELVES[1][1] + BOARD, bottom: SHELVES[2][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    // Shade on the floor by the shelves.
    { top: FLOOR_LINE, bottom: 1, from: ['#000000', 0.12], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
