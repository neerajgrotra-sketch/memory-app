import { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';

/**
 * Space, seen from the surface of the Moon: the black sky with the Earth, grey hills, then the dusty ground
 * where astronauts work. Band edges as fractions of the picture height.
 *
 * Scale: the ground is sized against the people (1 m ≈ 0.115 of the width, like the outdoor places): an
 * astronaut in a spacesuit 1.85 m tall, a lunar rover 3 m, a lander 3.5 m wide, a habitat pod 4 m, solar
 * panels 2 m, a boulder 1 m. Everything in the sky is a long way off and drawn small, as it really looks.
 *
 * Contrast: black sky, grey ground. White spacesuits would vanish on the dust, so they're checked by
 * their dark outline (`framedColour`), as the snowman is on snow.
 */
const SKY = 0.34;
const HILLS = 0.42;
const BACK_TOP = 0.43;
const BACK_BOTTOM = 0.635;
const FRONT_TOP = 0.72;

/** The base sign, between the back and the front; nothing may stand in front of it. */
const SIGN = { x0: 0.28, y0: 0.632, x1: 0.72, y1: 0.712 };

const IN_SPACE = ['space'];
const AT_BACK = ['back'];
const AT_FRONT = ['front'];

const BRIGHT = [C.red, C.blue, C.yellow, C.green, C.orange, C.purple];

const items: ItemDef[] = [
  // ---- In space (far away) ----
  {
    kind: 'earth',
    singular: 'Earth',
    plural: 'Earths',
    article: 'the',
    w: 140,
    h: 140,
    tier: 'medium',
    size: 0.16,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    tone: '#2f80d1',
    draw: () => (
      <G>
        <Circle cx={70} cy={70} r={62} fill="#2f80d1" />
        <G fill="#4caf50" stroke="none">
          <Path d="M34,34 Q54,22 66,36 Q58,52 46,54 Q30,50 34,34 Z" />
          <Path d="M78,62 Q98,56 106,72 Q100,96 84,98 Q72,86 78,62 Z" />
        </G>
        <G fill="#ffffff" stroke="none" opacity={0.8}>
          <Path d="M20,80 Q40,74 60,82 Q40,88 20,80 Z" />
          <Path d="M70,24 Q90,18 108,28 Q90,32 70,24 Z" />
        </G>
      </G>
    ),
  },
  {
    kind: 'satellite',
    singular: 'satellite',
    plural: 'satellites',
    article: 'a',
    w: 150,
    h: 70,
    tier: 'medium',
    size: 0.15,
    zones: IN_SPACE,
    maxCount: 2,
    tone: '#ffd60a',
    draw: () => (
      <G>
        <Rect x={4} y={22} width={46} height={26} fill="#1d70d6" />
        <Rect x={100} y={22} width={46} height={26} fill="#1d70d6" />
        <Path d="M27,22 V48 M123,22 V48" stroke="#a5d8ff" strokeWidth={2} />
        <Path d="M50,35 H100" stroke="#adb5bd" strokeWidth={4} />
        <Rect x={60} y={16} width={30} height={38} rx={4} fill="#ffd60a" />
        <Path d="M75,16 V4 M68,4 H82" stroke="#adb5bd" strokeWidth={3} />
      </G>
    ),
  },
  {
    kind: 'rocket',
    singular: 'rocket',
    plural: 'rockets',
    article: 'a',
    w: 70,
    h: 150,
    tier: 'small',
    size: 0.1,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    noFlip: true,
    colours: [C.red, C.blue, C.orange, C.green],
    colourPrompt: () => 'What colour were the rocket’s fins?',
    draw: (colour) => (
      <G>
        <Path d="M35,4 Q58,30 56,96 H14 Q12,30 35,4 Z" fill="#f8f9fa" />
        <Circle cx={35} cy={50} r={10} fill="#4dabf7" />
        <Path d="M14,74 L2,110 H18 Z M56,74 L68,110 H52 Z" fill={colour} />
        <Path d="M35,4 Q46,16 50,28 H20 Q24,16 35,4 Z" fill={colour} />
        <Path d="M22,98 Q35,150 48,98 Z" fill="#ffd60a" stroke="none" />
        <Path d="M28,98 Q35,130 42,98 Z" fill="#f77f00" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'space-station',
    singular: 'space station',
    plural: 'space stations',
    article: 'a',
    w: 170,
    h: 80,
    tier: 'medium',
    size: 0.18,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    tone: '#dee2e6',
    draw: () => (
      <G>
        {[4, 126].map((x) => (
          <G key={x}>
            <Rect x={x} y={4} width={40} height={30} fill="#1d70d6" />
            <Rect x={x} y={46} width={40} height={30} fill="#1d70d6" />
          </G>
        ))}
        <Path d="M24,34 V46 M146,34 V46 M24,40 H146" stroke="#adb5bd" strokeWidth={4} />
        <Rect x={60} y={28} width={50} height={24} rx={10} fill="#dee2e6" />
        <Rect x={76} y={20} width={18} height={40} rx={6} fill="#dee2e6" />
      </G>
    ),
  },
  {
    kind: 'comet',
    singular: 'comet',
    plural: 'comets',
    article: 'a',
    w: 170,
    h: 70,
    tier: 'medium',
    size: 0.16,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    tone: '#e7f5ff',
    draw: () => (
      <G>
        <Path d="M4,60 Q80,30 140,22 L146,40 Q90,44 4,60 Z" fill="#a5d8ff" stroke="none" opacity={0.6} />
        <Path d="M30,58 Q90,38 142,30" fill="none" stroke="#e7f5ff" strokeWidth={3} opacity={0.8} />
        <Circle cx={150} cy={30} r={14} fill="#e7f5ff" />
      </G>
    ),
  },

  // ---- Near the hills (the back) ----
  {
    kind: 'lander',
    singular: 'lunar lander',
    plural: 'lunar landers',
    article: 'a',
    w: 200,
    h: 136,
    tier: 'xl',
    // About 3.5 m wide on its legs, gold foil round the bottom.
    size: 0.4,
    wide: true,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#e0a526',
    draw: () => (
      <G>
        <Path d="M40,96 L10,132 M160,96 L190,132" stroke="#adb5bd" strokeWidth={7} />
        <Path d="M0,132 H22 M178,132 H200" stroke="#adb5bd" strokeWidth={7} strokeLinecap="round" />
        <Polygon points="30,58 170,58 160,104 40,104" fill="#e0a526" />
        <Path d="M60,58 V104 M100,58 V104 M140,58 V104" stroke="#b8861b" strokeWidth={3} />
        <Path d="M56,58 L64,18 H136 L144,58 Z" fill="#dee2e6" />
        <Path d="M76,26 H96 V46 H72 Z" fill="#1b2a4a" stroke="none" />
        <Path d="M100,18 V4 M92,4 H108" stroke="#adb5bd" strokeWidth={4} />
        <Path d="M86,104 L80,120 H120 L114,104 Z" fill="#868e96" />
      </G>
    ),
  },
  {
    kind: 'habitat',
    singular: 'habitat pod',
    plural: 'habitat pods',
    article: 'a',
    w: 220,
    h: 110,
    tier: 'xl',
    // A pod about 4 m long where the astronauts live, with a round door.
    size: 0.44,
    wide: true,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.orange, C.green],
    colourPrompt: () => 'What colour was the stripe on the habitat pod?',
    draw: (colour) => (
      <G>
        <Path d="M20,104 V54 Q20,14 70,14 H150 Q200,14 200,54 V104 Z" fill="#f1f3f5" />
        <Rect x={20} y={72} width={180} height={12} fill={colour} stroke="none" />
        <Circle cx={160} cy={58} r={22} fill="#adb5bd" />
        <Circle cx={160} cy={58} r={14} fill="#1b2a4a" stroke="none" />
        <G stroke="none" fill="#4dabf7">
          <Circle cx={64} cy={44} r={9} />
          <Circle cx={98} cy={44} r={9} />
        </G>
        <Path d="M30,104 V110 M190,104 V110" stroke="#868e96" strokeWidth={6} />
      </G>
    ),
  },
  {
    kind: 'solar-panel',
    singular: 'solar panel',
    plural: 'solar panels',
    article: 'a',
    w: 170,
    h: 110,
    tier: 'large',
    // A tilted panel about 2 m wide on a stand.
    size: 0.23,
    zones: AT_BACK,
    maxCount: 2,
    spread: true,
    tone: '#1d70d6',
    draw: () => (
      <G>
        <Path d="M85,70 V110 M60,110 H110" stroke="#adb5bd" strokeWidth={6} />
        <Polygon points="10,60 160,60 140,6 30,6" fill="#1d70d6" />
        <Path d="M48,6 L38,60 M85,6 V60 M122,6 L132,60 M20,33 H150" stroke="#a5d8ff" strokeWidth={2} />
      </G>
    ),
  },
  {
    kind: 'dish',
    singular: 'radio dish',
    plural: 'radio dishes',
    article: 'a',
    w: 110,
    h: 130,
    tier: 'medium',
    // About 1.5 m across, pointing at the Earth.
    size: 0.17,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#dee2e6',
    draw: () => (
      <G>
        <Path d="M55,74 V130 M30,130 H80" stroke="#868e96" strokeWidth={7} />
        <Path d="M6,30 Q30,90 104,62 Q70,40 6,30 Z" fill="#dee2e6" />
        <Path d="M50,56 L78,22" stroke="#868e96" strokeWidth={3} />
        <Circle cx={80} cy={20} r={5} fill="#e63946" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 90,
    h: 150,
    tier: 'medium',
    // A flag about 1.2 m wide on a pole, held out by a bar at the top (there's no wind on the Moon).
    size: 0.14,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: BRIGHT,
    draw: (colour) => (
      <G>
        <Rect x={8} y={0} width={6} height={150} fill="#adb5bd" stroke="none" />
        <Rect x={14} y={6} width={74} height={50} fill={colour} />
        <Circle cx={51} cy={31} r={12} fill="#ffffff" stroke="none" opacity={0.9} />
      </G>
    ),
  },

  // ---- On the dusty ground (the front) ----
  {
    kind: 'astronaut',
    singular: 'astronaut',
    plural: 'astronauts',
    article: 'an',
    w: 80,
    h: 130,
    tier: 'medium',
    // In a spacesuit, about 1.85 m tall.
    size: 0.13,
    zones: AT_FRONT,
    maxCount: 3,
    // Space has people in it: picked first for the front.
    usual: true,
    // A white suit on grey dust: what really shows it is its dark outline, so that's what's checked.
    framedColour: true,
    tone: '#495057',
    colours: BRIGHT,
    colourPrompt: (plural) => (plural ? 'What colour were the astronauts’ backpacks?' : 'What colour was the astronaut’s backpack?'),
    draw: (colour) => (
      <G>
        <Rect x={6} y={36} width={24} height={52} rx={6} fill={colour} />
        <Rect x={26} y={80} width={14} height={48} rx={6} fill="#f8f9fa" />
        <Rect x={44} y={80} width={14} height={48} rx={6} fill="#f8f9fa" />
        <Rect x={22} y={36} width={44} height={56} rx={14} fill="#f8f9fa" />
        <Rect x={60} y={42} width={14} height={40} rx={7} fill="#f8f9fa" />
        <Circle cx={44} cy={20} r={20} fill="#f8f9fa" />
        <Path d="M30,16 Q44,6 58,16 Q58,32 44,32 Q30,32 30,16 Z" fill="#e0a526" stroke="none" />
        <Rect x={34} y={52} width={20} height={10} rx={2} fill={colour} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'rover',
    singular: 'moon buggy',
    plural: 'moon buggies',
    article: 'a',
    w: 220,
    h: 100,
    tier: 'xl',
    // A lunar rover about 3 m long, with big wire wheels.
    size: 0.35,
    wide: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.orange, C.yellow],
    colourPrompt: () => 'What colour was the moon buggy’s seat?',
    draw: (colour) => (
      <G>
        <Path d="M20,60 H200 L190,48 H30 Z" fill="#adb5bd" />
        <Rect x={78} y={26} width={50} height={22} rx={4} fill={colour} />
        <Path d="M130,48 L140,14 M150,14 Q160,4 170,14" stroke="#868e96" strokeWidth={4} fill="none" />
        <Path d="M164,14 Q166,0 180,4" fill="none" stroke="#868e96" strokeWidth={3} />
        <G fill="#495057">
          <Circle cx={50} cy={74} r={24} />
          <Circle cx={170} cy={74} r={24} />
        </G>
        <G fill="#adb5bd" stroke="none">
          <Circle cx={50} cy={74} r={10} />
          <Circle cx={170} cy={74} r={10} />
        </G>
      </G>
    ),
  },
  {
    kind: 'moon-rock',
    singular: 'boulder',
    plural: 'boulders',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'small',
    // About 1 m across.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 4,
    tone: '#5c5f66',
    draw: () => (
      <G>
        <Path d="M6,66 Q0,36 24,22 Q44,4 72,12 Q104,20 106,50 Q108,66 96,66 Z" fill="#5c5f66" />
        <G fill="#43464c" stroke="none">
          <Circle cx={40} cy={34} r={5} />
          <Circle cx={72} cy={44} r={4} />
        </G>
      </G>
    ),
  },
  {
    kind: 'robot',
    singular: 'robot',
    plural: 'robots',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'small',
    // A little six-wheeled explorer robot, about 0.9 m long.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={14} y={50} width={72} height={26} rx={4} fill="#f8f9fa" />
        <Path d="M50,50 V22" stroke="#868e96" strokeWidth={4} />
        <Rect x={36} y={8} width={28} height={16} rx={4} fill="#495057" />
        <G fill="#4dabf7" stroke="none">
          <Circle cx={44} cy={16} r={4} />
          <Circle cx={56} cy={16} r={4} />
        </G>
        <G fill="#343a40">
          <Circle cx={22} cy={84} r={10} />
          <Circle cx={50} cy={84} r={10} />
          <Circle cx={78} cy={84} r={10} />
        </G>
      </G>
    ),
  },
  {
    kind: 'crater',
    singular: 'crater',
    plural: 'craters',
    article: 'a',
    w: 200,
    h: 50,
    tier: 'large',
    // A small crater about 2.2 m across, seen from the side as a dark oval with a rim.
    size: 0.25,
    zones: AT_FRONT,
    maxCount: 2,
    // Its shadowed hollow is what shows it on the dust.
    tone: '#4b4e55',
    draw: () => (
      <G>
        {/* A bright rim, then the hollow: shadowed at the back, lit at the front. */}
        <Ellipse cx={100} cy={26} rx={98} ry={22} fill="#b1b4ba" stroke="none" />
        <Ellipse cx={100} cy={28} rx={80} ry={16} fill="#5f6269" />
        <Path d="M24,30 Q100,8 176,30 Q100,18 24,30 Z" fill="#43464c" stroke="none" />
        <Path d="M40,36 Q100,46 160,36 Q100,42 40,36 Z" fill="#7d8087" stroke="none" />
      </G>
    ),
  },
];

const MISSIONS = ['Orion', 'Apollo', 'Artemis', 'Eagle', 'Phoenix', 'Falcon'];

/** Base numbers easy to mix up with `n`: one or two along, or the digits swapped. */
function baseLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 60);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The mission name and base number on the sign, chosen per picture. */
function details(random: Rng): SceneDetails {
  const mission = random.pick(MISSIONS);
  const base = random.int(1, 49);
  return {
    values: { mission, base: String(base) },
    facts: [
      { id: 'mission', type: 'object', prompt: 'What was the mission called on the sign?', answer: mission, wrong: MISSIONS.filter((m) => m !== mission) },
      { id: 'base-number', type: 'number', prompt: 'What number was the moon base on the sign?', answer: String(base), wrong: baseLookalikes(base) },
    ],
  };
}

type Palette = Record<'sky' | 'stars' | 'hills' | 'ground' | 'track', string>;

/** Stars at fixed places (fractions of the width and of the sky's height). */
const STARS: [number, number, number][] = [
  [0.04, 0.12, 2.5], [0.13, 0.5, 2], [0.22, 0.2, 3], [0.31, 0.78, 2], [0.4, 0.35, 2.5], [0.49, 0.1, 2], [0.57, 0.62, 3],
  [0.66, 0.24, 2], [0.75, 0.84, 2.5], [0.84, 0.4, 2], [0.93, 0.15, 3], [0.97, 0.7, 2], [0.08, 0.86, 2], [0.45, 0.9, 2],
];

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const hills = height * HILLS;
  const s = { x: SIGN.x0 * 900, y: SIGN.y0 * height, w: (SIGN.x1 - SIGN.x0) * 900, h: (SIGN.y1 - SIGN.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={hills + 600} fill={p.sky} />
      <G fill={p.stars}>
        {STARS.map(([x, y, r]) => (
          <Circle key={`${x}-${y}`} cx={x * 900} cy={y * sky * 0.95} r={r} />
        ))}
      </G>
      {/* Low grey hills on the horizon, then the dusty ground. */}
      <Path d={`M-600,${hills} L-600,${sky + 30} Q-300,${sky - 10} 0,${sky + 26} Q240,${sky + 50} 450,${sky + 14} Q660,${sky - 16} 900,${sky + 30} Q1200,${sky + 50} 1500,${sky + 10} V${hills} Z`} fill={p.hills} />
      <Rect x={-600} y={hills} width={2100} height={height - hills + 600} fill={p.ground} />
      {/* The base sign on two posts: the mission name, then the base number. */}
      <G>
        <Rect x={s.x + s.w * 0.15} y={s.y + s.h * 0.8} width={8} height={s.h * 0.5} fill="#868e96" />
        <Rect x={s.x + s.w * 0.85 - 8} y={s.y + s.h * 0.8} width={8} height={s.h * 0.5} fill="#868e96" />
        <Rect x={s.x} y={s.y} width={s.w} height={s.h * 0.85} rx={6} fill="#f1f3f5" stroke="#495057" strokeWidth={4} />
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.27} fontSize={Math.min(38, s.h * 0.34)} fontWeight="bold" fontFamily="Arial" fill="#1d70d6" textAnchor="middle" alignmentBaseline="central">
          {`Mission ${d?.values?.mission ?? 'Orion'}`}
        </SvgText>
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.6} fontSize={Math.min(38, s.h * 0.34)} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle" alignmentBaseline="central">
          {`Moon Base ${d?.values?.base ?? '7'}`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Tyre tracks and footprints across the dust.
  return [0.52, 0.8, 0.92].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.track, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  grey: { sky: '#05070f', stars: '#ffffff', hills: '#6c6f76', ground: '#8d9097', track: '#787b82' },
  dusty: { sky: '#0a0818', stars: '#fff3d6', hills: '#77706a', ground: '#9a928a', track: '#857d75' },
};

function surfaceAt(_x: number, y: number): string {
  if (y < SKY) return 'sky';
  if (y < HILLS) return 'hills';
  return 'ground';
}

export const space: Recipe = {
  id: 'space',
  title: 'On the Moon',
  zones: [
    // One row holds three kinds; any more and the smallest (a satellite) would never fit.
    { id: 'space', label: 'Out in space', surface: 'air', top: 0, bottom: SKY, rows: 1, maxGroups: 3, faraway: true },
    { id: 'hills', label: 'On the hills', surface: 'ground', top: SKY, bottom: HILLS, rows: 0 },
    { id: 'back', label: 'Near the hills', surface: 'ground', top: BACK_TOP, bottom: BACK_BOTTOM, rows: 1 },
    { id: 'front', label: 'Close by', surface: 'ground', top: FRONT_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SIGN],
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Sunlight on the dust, a little brighter towards us.
    { top: HILLS, bottom: 1, from: ['#000000', 0.06], to: ['#ffffff', 0.06] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
