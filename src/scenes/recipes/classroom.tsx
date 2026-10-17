import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { HAIR, SKINS, person, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * A classroom seen from the back: the wall with the whiteboard, the front of the class (the teacher and
 * their desk), then the pupils at their desks nearest to us. Band edges as fractions of the picture height.
 *
 * Scale: a closer view than the outdoor places, about 4.5 m across (1 m ≈ 0.22 of the width), so a school
 * clock, a globe and a pupil at a desk are big enough to see without being blown up: the teacher 1.6 m
 * tall, a pupil's desk 0.68 m wide, the teacher's desk 1.2 m, the whiteboard 1.8 m, a globe 0.55 m.
 * Nothing smaller than about half a metre (school bags, pencil pots) is in the picture.
 */
const CEILING = 0.05;
const FLOOR = 0.42;
const FRONT_TOP = 0.45;
const FRONT_BOTTOM = 0.63;
const BACK_TOP = 0.67;

/**
 * Everything on the wall hangs on one line above head height (centres this far above the floor, as a
 * fraction of the width, about 1.8 m), because the teacher and the bookcase stand against the wall
 * below it, just as posters in a real classroom go above the furniture.
 */
const HEAD_HEIGHT = 0.4;

/** The whiteboard, in the middle of the wall; nothing may hang over it. */
const BOARD = { x0: 0.3, y0: 0.12, x1: 0.7, y1: 0.28 };

const ON_WALL = ['wall'];
const AT_FRONT = ['front'];
const AT_BACK = ['back'];

/** School jumpers. */
const JUMPERS = [C.red, C.blue, C.green, C.purple, C.grey, C.yellow];

const items: ItemDef[] = [
  // ---- On the wall ----
  {
    kind: 'wall-clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'medium',
    // A big school clock, about 60 cm across: readable on a phone.
    size: 0.14,
    zones: ON_WALL,
    maxCount: 1,
    hangAt: HEAD_HEIGHT,
    tone: '#343a40',
    countable: false,
    noFlip: true,
    // The time is chosen per picture (see `details`); 10:10 when drawn on its own.
    draw: (_colour, details) => <ClockFace time={details?.values?.clock ?? '10:10'} />,
  },
  {
    kind: 'poster',
    singular: 'poster',
    plural: 'posters',
    article: 'a',
    w: 90,
    h: 120,
    tier: 'medium',
    size: 0.13,
    zones: ON_WALL,
    // One per stretch of wall beside the board.
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple],
    // A space poster: a planet with a ring and stars on a coloured background.
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={90} height={120} rx={3} fill={colour} />
        <G stroke="none">
          <Circle cx={45} cy={62} r={22} fill="#ffffff" opacity={0.9} />
          <Ellipse cx={45} cy={62} rx={36} ry={8} fill="none" stroke="#ffffff" strokeWidth={4} />
          <Circle cx={18} cy={20} r={4} fill="#ffffff" />
          <Circle cx={72} cy={28} r={3} fill="#ffffff" />
          <Circle cx={66} cy={100} r={4} fill="#ffffff" />
          <Circle cx={20} cy={98} r={3} fill="#ffffff" />
        </G>
      </G>
    ),
  },
  {
    kind: 'map',
    singular: 'world map',
    plural: 'world maps',
    article: 'a',
    w: 160,
    h: 100,
    tier: 'large',
    // About 1 m wide: fits beside the whiteboard.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    // Mirrored, the continents would be the wrong way round.
    noFlip: true,
    tone: '#4dabf7',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={160} height={100} rx={3} fill="#4dabf7" />
        <G fill="#69b34c" stroke="none">
          {/* The Americas, Europe and Africa, Asia, Australia: simplified. */}
          <Path d="M22,18 Q40,10 52,20 Q50,34 40,40 Q46,52 44,62 Q50,74 42,88 Q34,80 34,66 Q26,54 30,44 Q18,32 22,18 Z" />
          <Path d="M72,18 Q84,12 94,18 Q90,28 84,30 Q92,40 90,56 Q86,72 80,76 Q72,62 74,50 Q66,40 72,30 Z" />
          <Path d="M96,16 Q120,8 142,20 Q140,34 126,40 Q116,48 104,40 Q96,30 96,16 Z" />
          <Path d="M122,64 Q136,60 142,68 Q138,80 126,78 Q118,72 122,64 Z" />
        </G>
      </G>
    ),
  },
  {
    kind: 'noticeboard',
    singular: 'noticeboard',
    plural: 'noticeboards',
    article: 'a',
    w: 140,
    h: 100,
    tier: 'large',
    // About 1 m wide, cork in a wooden frame, with children's work pinned up.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    tone: '#c69c6d',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={140} height={100} rx={3} fill="#c69c6d" />
        <G stroke="none">
          <Rect x={14} y={14} width={34} height={42} fill="#ffffff" />
          <Rect x={58} y={22} width={30} height={30} fill="#ffd60a" />
          <Rect x={96} y={12} width={30} height={40} fill="#a5d8ff" />
          <Rect x={30} y={62} width={40} height={28} fill="#ffc9de" />
          <Rect x={84} y={60} width={36} height={30} fill="#b2f2bb" />
          {[
            [31, 16],
            [73, 24],
            [111, 14],
            [50, 64],
            [102, 62],
          ].map(([x, y]) => (
            <Circle key={`${x}`} cx={x} cy={y} r={3} fill="#e63946" />
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'window',
    singular: 'window',
    plural: 'windows',
    article: 'a',
    w: 140,
    h: 120,
    tier: 'large',
    // About 1 m wide, with curtains either side.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    colours: [C.red, C.blue, C.green, C.yellow, C.purple, C.orange],
    colourPrompt: () => 'What colour were the curtains?',
    draw: (colour) => (
      <G>
        <Rect x={14} y={6} width={112} height={108} fill="#a5d8ff" stroke="#ffffff" strokeWidth={8} />
        <Path d="M70,6 V114 M14,60 H126" stroke="#ffffff" strokeWidth={6} />
        <Rect x={0} y={0} width={140} height={8} rx={3} fill="#868e96" />
        <Path d="M0,6 H34 Q30,60 38,114 H0 Z" fill={colour} />
        <Path d="M140,6 H106 Q110,60 102,114 H140 Z" fill={colour} />
      </G>
    ),
  },

  // ---- At the front of the class ----
  {
    ...person,
    kind: 'teacher',
    singular: 'teacher',
    plural: 'teachers',
    article: 'the',
    // 1.6 m tall: stands in front of the wall.
    size: 0.18,
    tier: 'medium',
    tall: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.purple, C.orange, C.pink],
    colourPrompt: () => 'What colour was the teacher’s jumper?',
  },
  {
    kind: 'teacher-desk',
    singular: 'teacher’s desk',
    plural: 'teacher’s desks',
    article: 'the',
    w: 180,
    h: 100,
    tier: 'large',
    // About 1.2 m wide, with a mug and a pile of books on top.
    size: 0.27,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#7a4e2a',
    draw: () => (
      <G>
        <Rect x={0} y={20} width={180} height={14} rx={3} fill="#7a4e2a" />
        <Rect x={8} y={34} width={56} height={66} fill="#7a4e2a" />
        <Rect x={150} y={34} width={12} height={66} fill="#7a4e2a" />
        <G stroke="none">
          <Rect x={16} y={46} width={40} height={20} rx={2} fill="#5c3a1e" />
          <Rect x={16} y={72} width={40} height={20} rx={2} fill="#5c3a1e" />
          <Rect x={110} y={0} width={44} height={8} fill="#e63946" />
          <Rect x={114} y={8} width={38} height={7} fill="#1d70d6" />
          <Rect x={108} y={15} width={46} height={5} fill="#ffd60a" />
          <Rect x={70} y={2} width={16} height={18} rx={3} fill="#f8f9fa" />
        </G>
      </G>
    ),
  },
  {
    kind: 'globe',
    singular: 'globe',
    plural: 'globes',
    article: 'a',
    w: 80,
    h: 120,
    tier: 'small',
    // About 55 cm wide on its stand.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#1d70d6',
    draw: () => (
      <G>
        <Path d="M40,82 V112 M20,116 H60" stroke="#495057" strokeWidth={6} strokeLinecap="round" />
        <Path d="M8,44 A34,34 0 0 0 64,74" fill="none" stroke="#495057" strokeWidth={5} />
        <Circle cx={40} cy={44} r={32} fill="#1d70d6" />
        <G fill="#69b34c" stroke="none">
          <Path d="M24,24 Q36,18 42,28 Q36,38 28,40 Q20,34 24,24 Z" />
          <Path d="M46,46 Q58,42 62,52 Q56,66 48,64 Q42,56 46,46 Z" />
        </G>
      </G>
    ),
  },
  {
    kind: 'bookcase',
    singular: 'bookcase',
    plural: 'bookcases',
    article: 'a',
    w: 100,
    h: 170,
    tier: 'large',
    // About 0.9 m wide and 1.5 m tall, against the wall.
    size: 0.2,
    tall: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#6b4423',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={100} height={170} rx={3} fill="#6b4423" />
        <G stroke="none">
          {[10, 62, 114].map((y, row) => (
            <G key={y}>
              <Rect x={8} y={y} width={84} height={46} fill="#4a2e16" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Rect
                  key={i}
                  x={12 + i * 13}
                  y={y + (i % 3) * 3 + 6}
                  width={11}
                  height={40 - (i % 3) * 3}
                  fill={[C.red.hex, C.blue.hex, C.yellow.hex, C.green.hex, C.orange.hex, C.purple.hex][(i + row * 2) % 6]}
                />
              ))}
            </G>
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'easel',
    singular: 'easel',
    plural: 'easels',
    article: 'an',
    w: 90,
    h: 150,
    tier: 'medium',
    // About 0.7 m wide, with a painting of a big flower: the art corner at the back.
    size: 0.15,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.purple, C.orange],
    colourPrompt: () => 'What colour was the flower in the painting?',
    draw: (colour) => (
      <G>
        <Path d="M45,4 L12,148 M45,4 L78,148 M45,30 L45,140" stroke="#a0703c" strokeWidth={6} strokeLinecap="round" />
        <Rect x={8} y={20} width={74} height={66} rx={2} fill="#ffffff" stroke="#a0703c" strokeWidth={3} />
        <Rect x={4} y={86} width={82} height={6} fill="#a0703c" />
        <G stroke="none">
          <Path d="M45,58 V82" stroke="#2b9348" strokeWidth={4} />
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={45 + 12 * Math.cos((a * Math.PI) / 180)} cy={48 + 12 * Math.sin((a * Math.PI) / 180)} r={9} fill={colour} />
          ))}
          <Circle cx={45} cy={48} r={6} fill="#ffd60a" />
        </G>
      </G>
    ),
  },
  { ...plantPot, zones: AT_BACK, maxCount: 2 },
  {
    kind: 'piano',
    singular: 'piano',
    plural: 'pianos',
    article: 'a',
    w: 170,
    h: 130,
    tier: 'large',
    // An upright piano, about 1.3 m wide.
    size: 0.28,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    colours: [C.black, C.brown],
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={170} height={70} rx={4} fill={colour} />
        <Rect x={0} y={66} width={170} height={20} fill="#f8f9fa" />
        <G stroke="none" fill="#212529">
          {[14, 28, 52, 66, 80, 104, 118, 142, 156].map((x) => (
            <Rect key={x} x={x} y={66} width={8} height={12} />
          ))}
        </G>
        <Rect x={0} y={86} width={170} height={16} fill={colour} />
        <Rect x={8} y={102} width={12} height={28} fill={colour} />
        <Rect x={150} y={102} width={12} height={28} fill={colour} />
      </G>
    ),
  },

  // ---- At the back of the class ----
  {
    kind: 'pupil',
    singular: 'pupil',
    plural: 'pupils',
    article: 'a',
    w: 100,
    h: 110,
    tier: 'medium',
    // A child at a single junior-school desk, about 0.68 m wide.
    size: 0.15,
    zones: AT_BACK,
    // Two desks side by side is all one third of this close view holds.
    maxCount: 2,
    // Picked first for the back of the class: a classroom nearly always has pupils.
    usual: true,
    colours: JUMPERS,
    colourPrompt: (plural) => (plural ? 'What colour were the pupils’ jumpers?' : 'What colour was the pupil’s jumper?'),
    // Skin and hair vary per pupil (fixed for each copy); only the jumper is asked about.
    // Drawn in the same style as the shared person (the teacher), so a child's head is about 70% of an adult's.
    draw: (colour, _details, copy = 0) => {
      const skin = SKINS[copy % SKINS.length];
      const hair = HAIR[Math.floor(copy / 4) % HAIR.length];
      return (
        <G>
          <Rect x={20} y={42} width={60} height={34} rx={16} fill={colour} />
          <Circle cx={50} cy={24} r={21} fill={skin} stroke="none" />
          <Path d="M28,22 Q29,2 50,2 Q71,2 72,22 Q63,12 50,12 Q37,12 28,22 Z" fill={hair} stroke="none" />
          {/* The desk, with an open book. */}
          <Rect x={0} y={68} width={100} height={10} rx={3} fill="#c8935a" stroke="#8a5a2b" strokeWidth={2} />
          <Path d="M8,78 V110 M92,78 V110" stroke="#6c757d" strokeWidth={6} />
          <G stroke="none">
            <Path d="M34,68 L50,63 L66,68 Z" fill="#f8f9fa" />
            <Circle cx={28} cy={68} r={6} fill={skin} />
            <Circle cx={72} cy={68} r={6} fill={skin} />
          </G>
        </G>
      );
    },
  },
  {
    kind: 'beanbag',
    singular: 'beanbag',
    plural: 'beanbags',
    article: 'a',
    w: 120,
    h: 80,
    tier: 'medium',
    // In the reading corner, about 0.8 m wide.
    size: 0.17,
    zones: AT_BACK,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M10,76 Q0,40 30,24 Q60,4 92,22 Q122,40 110,76 Z" fill={colour} />
        <Path d="M30,46 Q60,34 90,46" fill="none" stroke="#00000026" strokeWidth={4} />
      </G>
    ),
  },
  {
    kind: 'fish-tank',
    singular: 'fish tank',
    plural: 'fish tanks',
    article: 'a',
    w: 130,
    h: 140,
    tier: 'large',
    // About 0.9 m wide, on its cupboard.
    size: 0.2,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#6b4423',
    draw: () => (
      <G>
        <Rect x={10} y={80} width={110} height={60} rx={3} fill="#6b4423" />
        <Rect x={0} y={4} width={130} height={76} rx={4} fill="#a5d8ff" stroke="#495057" strokeWidth={4} />
        <G stroke="none">
          <Rect x={4} y={66} width={122} height={12} fill="#e9c46a" />
          <Path d="M26,66 Q22,46 30,30 M36,66 Q42,50 36,36" fill="none" stroke="#2b9348" strokeWidth={4} />
          <Path d="M64,34 Q76,24 88,34 Q76,44 64,34 Z M88,34 L98,26 V42 Z" fill="#f77f00" />
          <Path d="M84,54 Q94,46 104,54 Q94,62 84,54 Z M84,54 L76,48 V60 Z" fill="#ffd60a" />
        </G>
      </G>
    ),
  },
  {
    kind: 'computer',
    singular: 'computer',
    plural: 'computers',
    article: 'a',
    w: 130,
    h: 120,
    tier: 'large',
    // On a small table about 0.9 m wide; one fits in this view.
    size: 0.2,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#495057',
    draw: () => (
      <G>
        <Rect x={30} y={4} width={70} height={50} rx={4} fill="#495057" />
        <Rect x={36} y={10} width={58} height={38} rx={2} fill="#74c0fc" stroke="none" />
        <Rect x={58} y={54} width={14} height={10} fill="#495057" />
        <Rect x={34} y={64} width={62} height={6} rx={2} fill="#343a40" />
        <Rect x={0} y={70} width={130} height={10} rx={3} fill="#c8935a" stroke="#8a5a2b" strokeWidth={2} />
        <Path d="M10,80 V120 M120,80 V120" stroke="#6c757d" strokeWidth={6} />
      </G>
    ),
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/** Sums easy to mix up with a + b: one number changed by one, or minus for plus. */
function sumLookalikes(a: number, b: number): string[] {
  const near = [
    [a + 1, b],
    [a, b + 1],
    [a - 1, b],
    [a, b - 1],
  ]
    .filter(([x, y]) => x >= 1 && y >= 1 && x <= 9 && y <= 9)
    .map(([x, y]) => `${x} + ${y}`);
  const minus = a > b ? [`${a} − ${b}`] : [];
  return [...new Set([...minus, ...near])].filter((s) => s !== `${a} + ${b}`);
}

/** The time on the clock, and the day and sum the teacher wrote on the board, chosen per picture. */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  const day = random.pick(DAYS);
  const a = random.int(2, 9);
  const b = random.int(1, 9);
  const sum = `${a} + ${b}`;
  return {
    values: { clock: time, day, sum },
    facts: [
      { id: 'clock-time', type: 'number', prompt: 'What time was on the clock?', answer: time, wrong: close, fallback: other, needs: 'wall-clock', everyLevel: true, spotlight: true },
      { id: 'board-day', type: 'object', prompt: 'What day was written on the board?', answer: day, wrong: DAYS.filter((d) => d !== day) },
      { id: 'board-sum', type: 'number', prompt: 'What sum was on the board?', answer: sum, wrong: sumLookalikes(a, b) },
    ],
  };
}

type Palette = Record<'ceiling' | 'wall' | 'skirting' | 'floor' | 'floorLine', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const ceiling = height * CEILING;
  const floor = height * FLOOR;
  const b = { x: BOARD.x0 * 900, y: BOARD.y0 * height, w: (BOARD.x1 - BOARD.x0) * 900, h: (BOARD.y1 - BOARD.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceiling + 600} fill={p.ceiling} />
      {/* Strip lights along the ceiling. */}
      <G fill="#ffffff" stroke="#ced4da" strokeWidth={2}>
        {[120, 420, 720].map((x) => (
          <Rect key={x} x={x} y={ceiling * 0.3} width={60} height={ceiling * 0.4} rx={3} />
        ))}
      </G>
      <Rect x={-600} y={ceiling} width={2100} height={floor - ceiling} fill={p.wall} />
      <Rect x={-600} y={floor} width={2100} height={height - floor + 600} fill={p.floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: floor, x1: 940, y1: height }, 160, '#000000', 0.06, 3)}
      <Rect x={-600} y={floor - 10} width={2100} height={12} fill={p.skirting} />
      {/* The whiteboard: the day at the top, today's sum below, and a pen tray. */}
      <G>
        <Rect x={b.x - 8} y={b.y - 8} width={b.w + 16} height={b.h + 16} rx={6} fill="#adb5bd" />
        <Rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="#ffffff" />
        <Rect x={b.x + b.w * 0.1} y={b.y + b.h + 8} width={b.w * 0.8} height={8} rx={3} fill="#868e96" />
        <SvgText x={b.x + b.w / 2} y={b.y + b.h * 0.26} fontSize={Math.min(36, b.h * 0.24)} fontWeight="bold" fontFamily="Arial" fill="#1d70d6" textAnchor="middle" alignmentBaseline="central">
          {d?.values?.day ?? 'Monday'}
        </SvgText>
        <SvgText x={b.x + b.w / 2} y={b.y + b.h * 0.66} fontSize={Math.min(64, b.h * 0.4)} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle" alignmentBaseline="central">
          {`${d?.values?.sum ?? '3 + 4'} = ?`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Floorboard (or carpet tile) lines across the floor.
  return [0.5, 0.58, 0.7, 0.82, 0.94].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.floorLine, 2, 0.3));
}

const PALETTES: Record<string, Palette> = {
  wood: { ceiling: '#fbf7ee', wall: '#f3e9d2', skirting: '#a07a4c', floor: '#d9b787', floorLine: '#c29e6c' },
  carpet: { ceiling: '#f6f9f7', wall: '#d8ecdf', skirting: '#7c8a96', floor: '#9fb0c2', floorLine: '#8c9db0' },
};

function surfaceAt(_x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR) return 'wall';
  return 'floor';
}

export const classroom: Recipe = {
  id: 'classroom',
  title: 'In the classroom',
  zones: [
    { id: 'ceiling', label: 'On the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    // Things hang on one line either side of the board, above head height.
    { id: 'wall', label: 'On the wall', surface: 'wall', top: CEILING, bottom: FLOOR, rows: 1, minGroups: 2 },
    { id: 'front', label: 'At the front of the class', surface: 'ground', top: FRONT_TOP, bottom: FRONT_BOTTOM, rows: 1, minGroups: 2, maxGroups: 3, anchors: 1 },
    { id: 'back', label: 'At the back of the class', surface: 'ground', top: BACK_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [BOARD],
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Light from the ceiling on the wall.
    { top: CEILING, bottom: FLOOR, from: ['#ffffff', 0.1], to: ['#000000', 0.04] },
    // Shade where the floor meets the wall.
    { top: FLOOR, bottom: 1, from: ['#000000', 0.1], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
