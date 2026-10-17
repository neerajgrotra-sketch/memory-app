import { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { ClockFace, digitalLookalikes, randomDigitalTime, randomTime, timeLookalikes } from '../clock';
import { C } from '../colours';
import { dog, person } from '../items/common';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * A railway station, seen from the platform: the glass roof with things hanging from it and the
 * departure board, the track with the far wall behind it, and the platform in front.
 * Band edges as fractions of the picture height.
 *
 * Scale: a wide scene, sized against the shared person (1.7 m, so 1 m ≈ 0.115 of the width). Suitcases
 * and bins are too small to draw 44 pt wide without looking giant, so a luggage trolley piled with
 * cases stands in for them. The train is drawn a little shorter than life (about 3 m) so it fits.
 */
const ROOF = 0.25;
const WALL = 0.45;
const PLATFORM_EDGE = 0.53;
const PLATFORM = 0.555;

/** The departure board, at the top in the middle; nothing may hang in front of it. */
const BOARD = { x0: 0.27, y0: 0.035, x1: 0.73, y1: 0.165 };

const ON_ROOF = ['roof'];
const ON_TRACK = ['track'];
const ON_PLATFORM = ['platform'];

const items: ItemDef[] = [
  // ---- Hanging from the roof ----
  {
    kind: 'station-clock',
    singular: 'station clock',
    plural: 'station clocks',
    article: 'a',
    w: 100,
    h: 130,
    tier: 'medium',
    size: 0.15,
    zones: ON_ROOF,
    maxCount: 1,
    countable: false,
    noFlip: true,
    tone: '#2d3436',
    // Hangs on a rod from the roof; its time is chosen per picture (see `details`).
    draw: (_colour, details) => (
      <G>
        <Rect x={46} y={0} width={8} height={32} fill="#2d3436" />
        <G transform="translate(0 30)">
          <ClockFace time={details?.values?.clock ?? '10:10'} rim="#2d3436" />
        </G>
      </G>
    ),
  },
  {
    kind: 'lamp',
    singular: 'hanging lamp',
    plural: 'hanging lamps',
    article: 'a',
    w: 70,
    h: 110,
    tier: 'small',
    size: 0.1,
    zones: ON_ROOF,
    maxCount: 3,
    spread: true,
    colours: [C.green, C.red, C.blue, C.black],
    colourPrompt: (plural) => (plural ? 'What colour were the hanging lamps?' : 'What colour was the hanging lamp?'),
    draw: (colour) => (
      <G>
        <Rect x={33} y={0} width={4} height={50} fill="#495057" stroke="none" />
        <Path d="M10,90 Q10,52 35,50 Q60,52 60,90 Z" fill={colour} />
        <Path d="M16,90 H54 Q50,108 35,108 Q20,108 16,90 Z" fill="#fff3b0" />
      </G>
    ),
  },
  {
    kind: 'flower-basket',
    singular: 'hanging basket',
    plural: 'hanging baskets',
    article: 'a',
    w: 90,
    h: 110,
    tier: 'small',
    size: 0.12,
    zones: ON_ROOF,
    maxCount: 2,
    spread: true,
    colours: [C.red, C.pink, C.purple, C.yellow, C.white],
    colourPrompt: (plural) => (plural ? 'What colour were the flowers in the hanging baskets?' : 'What colour were the flowers in the hanging basket?'),
    draw: (colour) => (
      <G>
        <Path d="M45,0 L15,60 M45,0 L75,60" fill="none" stroke="#495057" strokeWidth={3} />
        <G fill="#2b9348" stroke="#1b5e2f" strokeWidth={3}>
          <Path d="M14,66 Q6,92 20,104 M76,66 Q84,92 70,104" fill="none" strokeWidth={6} />
        </G>
        <G fill={colour}>
          {[22, 38, 54, 70, 30, 46, 62].map((x, i) => (
            <Circle key={i} cx={x} cy={i < 4 ? 56 : 46} r={9} />
          ))}
        </G>
        <Path d="M8,60 H82 Q78,96 45,96 Q12,96 8,60 Z" fill="#8a5a2b" />
      </G>
    ),
  },

  // ---- On the track ----
  {
    kind: 'train',
    singular: 'train',
    plural: 'trains',
    article: 'a',
    w: 320,
    h: 190,
    tier: 'xl',
    // The front of a train at the platform, about 5 m of it in view.
    size: 0.56,
    wide: true,
    zones: ON_TRACK,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.yellow, C.orange],
    draw: (colour) => (
      <G>
        {/* The carriage behind, then the rounded nose with its windscreen and lights. */}
        <Rect x={0} y={16} width={230} height={150} rx={10} fill={colour} />
        <Path d="M226,16 H260 Q320,16 320,96 V166 H226 Z" fill={colour} />
        <G stroke="none">
          {[18, 82, 146].map((x) => (
            <Rect key={x} x={x} y={40} width={50} height={46} rx={6} fill="#cfe9f7" />
          ))}
          <Path d="M240,34 H262 Q300,36 306,86 H240 Z" fill="#2f3e46" />
          <Rect x={0} y={112} width={320} height={12} fill="#ffffff" fillOpacity={0.6} />
          <Circle cx={300} cy={140} r={8} fill="#fff3b0" />
        </G>
        <Rect x={196} y={96} width={22} height={66} rx={3} fill="#ffffff" fillOpacity={0.35} />
        <Rect x={0} y={166} width={320} height={10} fill="#343a40" />
        {[40, 110, 200, 270].map((x) => (
          <Circle key={x} cx={x} cy={180} r={10} fill="#212529" stroke="none" />
        ))}
      </G>
    ),
  },
  {
    kind: 'wagon',
    singular: 'freight wagon',
    plural: 'freight wagons',
    article: 'a',
    w: 300,
    h: 150,
    tier: 'xl',
    size: 0.5,
    wide: true,
    zones: ON_TRACK,
    maxCount: 1,
    countable: false,
    colours: [C.brown, C.blue, C.green, C.orange, C.grey],
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={300} height={124} rx={4} fill={colour} />
        <G stroke="#000000" strokeOpacity={0.25} strokeWidth={4}>
          {[50, 100, 150, 200, 250].map((x) => (
            <Path key={x} d={`M${x},6 V118`} />
          ))}
        </G>
        <Rect x={0} y={124} width={300} height={10} fill="#343a40" />
        {[40, 90, 210, 260].map((x) => (
          <Circle key={x} cx={x} cy={140} r={10} fill="#212529" stroke="none" />
        ))}
      </G>
    ),
  },
  {
    kind: 'signal',
    singular: 'railway signal',
    plural: 'railway signals',
    article: 'a',
    w: 60,
    h: 200,
    tier: 'small',
    size: 0.1,
    zones: ON_TRACK,
    maxCount: 1,
    countable: false,
    // Only the colours a real signal shows, lit in its black housing (which is what meets the wall).
    colours: [C.red, C.yellow, C.green],
    framedColour: true,
    tone: '#212529',
    colourPrompt: () => 'What colour was the signal light?',
    draw: (colour) => (
      <G>
        <Rect x={26} y={60} width={8} height={140} fill="#495057" />
        <Rect x={6} y={0} width={48} height={74} rx={10} fill="#212529" />
        <Circle cx={30} cy={22} r={13} fill={colour} />
        <Circle cx={30} cy={52} r={11} fill="#495057" stroke="none" />
      </G>
    ),
  },

  // ---- On the platform ----
  { ...person, singular: 'passenger', plural: 'passengers', zones: ON_PLATFORM, maxCount: 4, colourPrompt: (plural) => (plural ? 'What colour were the passengers’ shirts?' : 'What colour was the passenger’s shirt?') },
  { ...dog, zones: ON_PLATFORM, maxCount: 2 },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 70,
    tier: 'large',
    size: 0.21,
    zones: ON_PLATFORM,
    maxCount: 2,
    spread: true,
    colours: [C.green, C.red, C.blue, C.brown],
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
    kind: 'vending',
    singular: 'vending machine',
    plural: 'vending machines',
    article: 'a',
    w: 80,
    h: 160,
    tier: 'small',
    // About 1 m wide and 1.8 m tall.
    size: 0.12,
    zones: ON_PLATFORM,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.orange],
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={80} height={160} rx={6} fill={colour} />
        <Rect x={8} y={10} width={46} height={110} rx={3} fill="#e9ecef" />
        <G stroke="none">
          {[22, 46, 70, 94].map((y) => (
            <G key={y}>
              <Rect x={12} y={y} width={10} height={16} rx={2} fill="#e63946" />
              <Rect x={26} y={y} width={10} height={16} rx={2} fill="#2b9348" />
              <Rect x={40} y={y} width={10} height={16} rx={2} fill="#1d70d6" />
            </G>
          ))}
          <Rect x={60} y={20} width={14} height={30} rx={2} fill="#212529" />
        </G>
        <Rect x={10} y={130} width={42} height={18} rx={3} fill="#212529" />
      </G>
    ),
  },
  {
    kind: 'ticket-machine',
    singular: 'ticket machine',
    plural: 'ticket machines',
    article: 'a',
    w: 80,
    h: 150,
    tier: 'small',
    size: 0.12,
    zones: ON_PLATFORM,
    maxCount: 1,
    countable: false,
    tone: '#495057',
    draw: () => (
      <G>
        <Rect x={10} y={0} width={60} height={150} rx={6} fill="#495057" />
        <Rect x={18} y={12} width={44} height={36} rx={3} fill="#4dabf7" />
        <G fill="#ced4da" stroke="none">
          {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={22 + c * 13} y={58 + r * 12} width={9} height={8} rx={2} />))}
        </G>
        <Rect x={22} y={100} width={36} height={8} rx={2} fill="#212529" stroke="none" />
        <Rect x={0} y={142} width={80} height={8} rx={3} fill="#343a40" />
      </G>
    ),
  },
  {
    kind: 'luggage',
    singular: 'luggage trolley',
    plural: 'luggage trolleys',
    article: 'a',
    w: 120,
    h: 110,
    tier: 'medium',
    size: 0.16,
    zones: ON_PLATFORM,
    maxCount: 2,
    colours: [C.red, C.blue, C.yellow, C.purple, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the big suitcases on the luggage trolleys?' : 'What colour was the big suitcase on the luggage trolley?'),
    draw: (colour) => (
      <G>
        <Path d="M8,4 V96 H112" fill="none" stroke="#868e96" strokeWidth={6} strokeLinejoin="round" />
        <Rect x={18} y={34} width={86} height={58} rx={8} fill={colour} />
        <Rect x={30} y={8} width={60} height={28} rx={6} fill="#495057" />
        <Path d="M50,34 V24 H70 V34" fill="none" stroke="#212529" strokeWidth={4} />
        <Circle cx={22} cy={102} r={8} fill="#212529" stroke="none" />
        <Circle cx={98} cy={102} r={8} fill="#212529" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'coffee-cart',
    singular: 'coffee cart',
    plural: 'coffee carts',
    article: 'a',
    w: 140,
    h: 140,
    tier: 'large',
    size: 0.21,
    zones: ON_PLATFORM,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.green, C.blue, C.black],
    colourPrompt: () => 'What colour was the coffee cart?',
    draw: (colour) => (
      <G>
        <Path d="M6,30 H134 L124,8 H16 Z" fill="#f8f9fa" />
        <Rect x={10} y={30} width={4} height={30} fill="#495057" stroke="none" />
        <Rect x={126} y={30} width={4} height={30} fill="#495057" stroke="none" />
        <Rect x={4} y={58} width={132} height={64} rx={6} fill={colour} />
        <G stroke="none">
          <Path d="M54,76 H82 V98 Q82,106 74,106 H62 Q54,106 54,98 Z" fill="#f8f9fa" />
          <Path d="M82,82 Q92,82 90,92 Q88,98 82,96" fill="none" stroke="#f8f9fa" strokeWidth={4} />
        </G>
        <Circle cx={30} cy={128} r={11} fill="#212529" stroke="none" />
        <Circle cx={110} cy={128} r={11} fill="#212529" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'newspapers',
    singular: 'newspaper stand',
    plural: 'newspaper stands',
    article: 'a',
    w: 100,
    h: 120,
    tier: 'medium',
    size: 0.14,
    zones: ON_PLATFORM,
    maxCount: 1,
    countable: false,
    tone: '#1d70d6',
    draw: () => (
      <G>
        <Rect x={0} y={20} width={100} height={100} rx={4} fill="#1d70d6" />
        <Rect x={0} y={0} width={100} height={24} rx={4} fill="#ffd60a" />
        <G stroke="none">
          {[0, 1, 2].map((i) => (
            <G key={i}>
              <Rect x={10 + i * 30} y={36} width={22} height={30} fill="#f8f9fa" />
              <Rect x={14 + i * 30} y={42} width={14} height={4} fill="#495057" />
              <Rect x={14 + i * 30} y={50} width={14} height={2} fill="#adb5bd" />
              <Rect x={10 + i * 30} y={74} width={22} height={30} fill="#f8f9fa" />
              <Rect x={14 + i * 30} y={80} width={14} height={4} fill="#495057" />
            </G>
          ))}
        </G>
      </G>
    ),
  },
];

/** Where the next train goes: short, different words, so the board reads at a glance. */
const DESTINATIONS = ['Seaside', 'Hilltop', 'Riverside', 'Castle Town', 'Airport', 'Lakeside'];

/** Platform numbers easy to mix up with `n`: one or two along, or ten more. */
function platformLookalikes(n: number): string[] {
  return [...new Set([n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 20 && x !== n).map(String))];
}

/**
 * The departure board (always there): the next train's time, where it's going and its platform. Three
 * details on one sign, a step up for Level 16. Plus the station clock's time, when it's hanging there.
 */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const departs = randomDigitalTime(random, clockStep);
  const dep = digitalLookalikes(departs);
  const platform = random.int(1, 9);
  const destination = random.pick(DESTINATIONS);
  const clock = randomTime(random, clockStep);
  const clk = timeLookalikes(clock, clockStep);
  return {
    values: { departs, platform: String(platform), destination, clock },
    facts: [
      { id: 'departs', type: 'number', prompt: 'What time was the next train?', answer: departs, wrong: dep.close, fallback: dep.other, everyLevel: true },
      { id: 'platform', type: 'number', prompt: 'Which platform was the next train leaving from?', answer: `Platform ${platform}`, wrong: platformLookalikes(platform).map((p) => `Platform ${p}`) },
      { id: 'destination', type: 'object', prompt: 'Where was the next train going?', answer: destination, wrong: DESTINATIONS.filter((d) => d !== destination) },
      { id: 'clock-time', type: 'number', prompt: 'What time was on the station clock?', answer: clock, wrong: clk.close, fallback: clk.other, needs: 'station-clock', everyLevel: true, spotlight: true },
    ],
  };
}

type Palette = Record<'sky' | 'glass' | 'truss' | 'wall' | 'brick' | 'gravel' | 'rail' | 'edge' | 'platform' | 'tile', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const roof = height * ROOF;
  const wall = height * WALL;
  const edge = height * PLATFORM_EDGE;
  const platform = height * PLATFORM;
  const b = { x: BOARD.x0 * 900, y: BOARD.y0 * height, w: (BOARD.x1 - BOARD.x0) * 900, h: (BOARD.y1 - BOARD.y0) * height };
  const row = b.h / 2;
  return (
    <G>
      {/* The glass roof on its arched steel trusses. */}
      <Rect x={-600} y={-600} width={2100} height={roof + 600} fill={p.sky} />
      {Array.from({ length: 11 }, (_, i) => (
        <Rect key={i} x={-600 + i * 210 + 12} y={-600} width={186} height={roof + 600} fill={p.glass} />
      ))}
      <G fill="none" stroke={p.truss} strokeWidth={10}>
        <Path d={`M-600,${roof} Q450,${-roof * 0.9} 1500,${roof}`} />
        <Path d={`M-600,${roof * 0.55} H1500`} strokeWidth={6} />
      </G>
      {/* The far wall: bricks behind the track. */}
      <Rect x={-600} y={roof} width={2100} height={wall - roof} fill={p.wall} />
      <G fill={p.brick}>
        {Array.from({ length: 7 }, (_, r) =>
          Array.from({ length: 24 }, (_, c) => (
            <Rect key={`${r}-${c}`} x={-600 + c * 90 + (r % 2) * 45} y={roof + 8 + r * ((wall - roof - 16) / 7)} width={80} height={(wall - roof - 16) / 7 - 6} rx={2} />
          )),
        )}
      </G>
      {/* The track: gravel, sleepers, two rails. */}
      <Rect x={-600} y={wall} width={2100} height={edge - wall} fill={p.gravel} />
      <G fill={p.rail}>
        {Array.from({ length: 40 }, (_, i) => (
          <Rect key={i} x={-600 + i * 55} y={wall + (edge - wall) * 0.35} width={30} height={(edge - wall) * 0.5} fill="#6b4f36" />
        ))}
        <Rect x={-600} y={wall + (edge - wall) * 0.38} width={2100} height={8} />
        <Rect x={-600} y={wall + (edge - wall) * 0.72} width={2100} height={8} />
      </G>
      {/* The platform edge with its yellow safety line, then the platform. */}
      <Rect x={-600} y={edge} width={2100} height={platform - edge} fill={p.edge} />
      <Rect x={-600} y={platform} width={2100} height={height - platform + 600} fill={p.platform} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: platform, x1: 940, y1: height }, 220, '#000000', 0.09, 3)}
      <Rect x={-600} y={platform + 10} width={2100} height={10} fill="#ffd60a" />
      {/* The departure board: time, destination and platform. */}
      <G>
        <Path d={`M${b.x + 40},-600 V${b.y} M${b.x + b.w - 40},-600 V${b.y}`} stroke="#495057" strokeWidth={4} />
        <Rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill="#212529" stroke="#495057" strokeWidth={5} />
        <SvgText x={b.x + 22} y={b.y + row * 0.55} fontSize={Math.min(44, row * 0.7)} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" alignmentBaseline="central">
          {d?.values?.departs ?? '10:45'}
        </SvgText>
        <SvgText x={b.x + b.w - 22} y={b.y + row * 0.55} fontSize={Math.min(40, row * 0.62)} fontWeight="bold" fontFamily="Arial" fill="#f8f9fa" textAnchor="end" alignmentBaseline="central">
          {d?.values?.destination ?? 'Seaside'}
        </SvgText>
        <SvgText x={b.x + b.w / 2} y={b.y + row * 1.45} fontSize={Math.min(36, row * 0.58)} fontWeight="bold" fontFamily="Arial" fill="#74c0fc" textAnchor="middle" alignmentBaseline="central">
          {`Platform ${d?.values?.platform ?? '3'}`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Lines between the platform's paving slabs, broken around anything standing on them.
  return [0.66, 0.76, 0.87].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.tile, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  day: {
    sky: '#9fb3c2',
    glass: '#cfe3ef',
    truss: '#2f4858',
    wall: '#b56a4f',
    brick: '#a35b42',
    gravel: '#8d8579',
    rail: '#ced4da',
    edge: '#e9ecef',
    platform: '#c9ced3',
    tile: '#868e96',
  },
  evening: {
    sky: '#c98a6a',
    glass: '#f2c49b',
    truss: '#3d2f2a',
    wall: '#9c5a45',
    brick: '#8a4d3a',
    gravel: '#7a7268',
    rail: '#c0b8ae',
    edge: '#e3ddd5',
    platform: '#bfb8b0',
    tile: '#7d756d',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < ROOF) return 'glass';
  if (y < WALL) return 'wall';
  if (y < PLATFORM_EDGE) return 'gravel';
  return 'platform';
}

export const trainStation: Recipe = {
  id: 'train-station',
  title: 'At the train station',
  zones: [
    { id: 'roof', label: 'Hanging from the roof', surface: 'air', top: 0.03, bottom: ROOF - 0.02, rows: 1 },
    // A train or a wagon at the platform, and a signal.
    { id: 'track', label: 'On the track', surface: 'ground', top: ROOF + 0.02, bottom: PLATFORM_EDGE, rows: 1, maxGroups: 2 },
    { id: 'platform', label: 'On the platform', surface: 'ground', top: PLATFORM + 0.03, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [BOARD],
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Daylight through the glass roof.
    { top: 0, bottom: ROOF, from: ['#ffffff', 0.12], to: ['#ffffff', 0] },
    // Shade under the roof's edge on the far wall.
    { top: ROOF, bottom: WALL, from: ['#000000', 0.16], to: ['#000000', 0] },
    // The platform, a little darker in front.
    { top: PLATFORM, bottom: 1, from: ['#000000', 0], to: ['#000000', 0.1] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
