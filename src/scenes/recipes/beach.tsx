import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { shade } from '../contrast';
import { ball, balloon, bird, cloudShape, crab, dolphin, kite, person, plane, starfish, sun } from '../items/common';
import { lineMarks, markIfClear, scatterMarks } from '../marks';
import { glints, speckles } from '../texture';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';

/** Band edges, as fractions of the picture height. */
const HORIZON = 0.35;
const SHORE = 0.6;

const SKY = ['sky'];
const SEA = ['sea'];
const SAND = ['sand'];

/**
 * Where a crab can hide on harder levels (one of each in the picture, so "under the beach towel" means one
 * place): where the crab's top-left corner goes and how big it's drawn, in the hiding spot's own drawing units,
 * so it's the size of the other crabs. A clear peek shows its claws, eyes and the top of its shell; a small one its claws
 * and eyes. (Testers on phones found less than that too hard to see.)
 * It's drawn before the spot, so the spot covers the rest of it.
 */
const CRAB_SPOTS: Record<string, { name: string; w: number; scale: number; clear: [number, number]; small: [number, number] }> = {
  // Under the towel, peeking out past the far edge.
  towel: { name: 'Under the beach towel', w: 160, scale: 0.92, clear: [64, -34], small: [64, -22] },
  // Behind the sandcastle, peeking out past a side tower: the right one, or the left one when the castle is on the
  // right of the picture, so the crab is never cut off by the edge. (Not the bucket: a crab behind it looked to be in it.)
  sandcastle: { name: 'Behind the sandcastle', w: 130, scale: 1.15, clear: [104, 50], small: [94, 50] },
};

/** The hiding crab, behind the thing at `kind` when the picture's details put it there. */
function hidingCrab(kind: string, details?: SceneDetails) {
  if (details?.values?.crab !== kind) return null;
  const spot = CRAB_SPOTS[kind];
  const [x0, y] = details.values.peek === '2' ? spot.small : spot.clear;
  // Peeking out of the other side: the same distance out past the left edge.
  const x = details.values.crabSide === 'left' ? spot.w - x0 - 80 * spot.scale : x0;
  return (
    <G transform={`translate(${x} ${y}) scale(${spot.scale})`} stroke={shade(crab.tone!)} strokeWidth={2.5}>
      {crab.draw('')}
    </G>
  );
}

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
        <Polygon points="65,0 82,5 65,10" fill="#e63946" stroke="none" />
        <Polygon points="68,8 68,110 120,110" fill={colour} />
        <Polygon points="62,20 62,110 18,110" fill={colour} fillOpacity={0.85} />
        <G stroke="none">
          {/* Sail seams, a little shade on the jib, and the rigging. */}
          <Path d="M68,40 L95,72 M68,72 L110,98" stroke="#000000" strokeOpacity={0.15} strokeWidth={2} />
          <Polygon points="62,20 62,110 40,110" fill="#000000" fillOpacity={0.1} />
          <Path d="M65,8 L8,118 M65,8 L122,118" stroke="#5c3d1e" strokeOpacity={0.5} strokeWidth={1.2} />
        </G>
        <Path d="M5,118 H125 L108,145 H22 Z" fill="#7a4a2a" stroke="#3d2412" />
        <G stroke="none">
          <Path d="M7,121 H123 L120,126 H10 Z" fill="#ffffff" fillOpacity={0.85} />
          <Circle cx={45} cy={133} r={4} fill="#f1e3c6" />
          <Circle cx={85} cy={133} r={4} fill="#f1e3c6" />
        </G>
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
    // A bold band so even a white or yellow buoy reads clearly on the water.
    draw: (colour) => (
      <G>
        <Line x1={25} y1={10} x2={25} y2={2} stroke="#333" strokeWidth={3} />
        <Circle cx={25} cy={3} r={3} fill="#ffd60a" stroke="none" />
        <Path d="M10,60 C10,25 15,10 25,10 C35,10 40,25 40,60 Z" fill={colour} />
        <G stroke="none">
          <Rect x={11} y={32} width={28} height={11} fill={colour === C.white.hex || colour === C.yellow.hex ? '#d62828' : '#ffffff'} />
          <Path d="M16,56 C15,30 18,18 23,14 C20,24 20,40 21,56 Z" fill="#ffffff" fillOpacity={0.35} />
          <Path d="M2,62 Q14,56 25,62 T48,62" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
        </G>
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
        <Path d="M77,90 H83 M77,120 H83 M77,150 H83" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={4} />
        {/* A scalloped canopy in panels, alternating white, with a tip on top. */}
        <Path d="M2,62 C10,10 150,10 158,62 Q148,70 138,62 Q128,70 118,62 Q108,70 99,62 Q90,70 80,62 Q70,70 61,62 Q52,70 42,62 Q32,70 22,62 Q12,70 2,62 Z" fill={colour} />
        <G stroke="none">
          <Path d="M80,18 C62,30 52,46 48,64 Q55,68 61,62 Q70,68 80,62 Z" fill="#ffffff" fillOpacity={0.6} />
          <Path d="M80,18 C120,24 146,42 156,62 Q148,68 138,62 Q128,68 118,62 C112,44 98,28 80,18 Z" fill="#ffffff" fillOpacity={0.6} />
          <Path d="M8,58 C22,30 50,20 80,18" fill="none" stroke="#000000" strokeOpacity={0.12} strokeWidth={3} />
        </G>
        <Circle cx={80} cy={16} r={5} fill="#5c3d1e" />
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
        {/* A spade stuck in the sand inside. */}
        <Path d="M44,22 L54,2" stroke="#8b5a2b" strokeWidth={4} strokeLinecap="round" />
        <Path d="M49,0 L60,4 L56,12 L46,8 Z" fill="#adb5bd" />
        <Path d="M4,22 H56 L48,65 H12 Z" fill={colour} />
        <G stroke="none">
          <Path d="M4,22 H56 L55,28 H5 Z" fill="#ffffff" fillOpacity={0.4} />
          <Path d="M8,23 Q30,18 52,23 L52,25 Q30,21 8,25 Z" fill="#c9a26b" />
          <Path d="M14,30 L18,62 H24 L20,30 Z" fill="#ffffff" fillOpacity={0.3} />
          <Path d="M44,30 L40,62 H46 L50,30 Z" fill="#000000" fillOpacity={0.12} />
        </G>
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
    draw: (colour, details) => (
      <G>
        {hidingCrab('towel', details)}
        <Polygon points="20,0 160,0 140,70 0,70" fill={colour} />
        <G stroke="none">
          <Polygon points="50,0 70,0 50,70 30,70" fill="#ffffff" fillOpacity={0.7} />
          <Polygon points="110,0 130,0 110,70 90,70" fill="#ffffff" fillOpacity={0.7} />
          <Polygon points="76,0 82,0 62,70 56,70" fill="#ffffff" fillOpacity={0.45} />
          {/* A soft fold and fringed ends. */}
          <Path d="M24,26 L156,26 L154,32 L22,32 Z" fill="#000000" fillOpacity={0.08} />
          <Path d="M22,0 V-4 M30,0 V-4 M38,0 V-4 M46,0 V-4 M150,0 V-4 M142,0 V-4 M2,70 V74 M10,70 V74 M18,70 V74 M132,70 V74 M124,70 V74 M116,70 V74" stroke={colour} strokeWidth={2.5} />
        </G>
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
    // Stands on the sand, its leaves reaching up towards the sea. Not `tall`: tall things stand with their
    // feet at the very back of their band, which on the beach is the waterline, so it looked to grow in the sea.
    // Two are spread apart.
    spread: true,
    zones: SAND,
    maxCount: 2,
    tone: '#2b9348',
    // Coconuts dropped on the sand by its foot, when the picture's details put them there (see `fitDetails`).
    draw: (_colour, details, _copy, index = 0) => (
      <G>
        {droppedCoconuts(details, index)}
        <Path d="M70,270 C75,200 70,120 88,55 L100,58 C88,120 92,200 92,270 Z" fill="#8b5a2b" stroke="#5c3a1b" />
        {/* Rings up the trunk. */}
        <Path d="M72,250 Q81,244 91,250 M73,220 Q82,214 91,220 M74,190 Q83,184 91,190 M76,160 Q85,154 92,160 M78,130 Q87,124 94,130 M82,100 Q90,94 96,100" fill="none" stroke="#5c3a1b" strokeOpacity={0.55} strokeWidth={2.5} />
        <G fill="#2b9348">
          <Path d="M94,55 C60,20 20,30 0,60 C30,45 60,45 94,55 Z" />
          <Path d="M94,55 C120,15 150,20 160,50 C135,40 115,42 94,55 Z" />
          <Path d="M94,55 C80,10 95,0 110,0 C100,20 98,35 94,55 Z" />
          <Path d="M94,55 C60,60 35,85 30,110 C55,85 75,72 94,55 Z" />
          <Path d="M94,55 C125,60 145,85 150,110 C128,85 112,72 94,55 Z" />
        </G>
        <G fill="none" stroke="#1f6b2a" strokeWidth={2} strokeOpacity={0.7}>
          <Path d="M92,54 C64,36 30,38 6,56" />
          <Path d="M96,54 C120,30 140,30 154,46" />
          <Path d="M94,52 C90,26 96,10 106,4" />
          <Path d="M92,58 C64,70 44,86 34,104" />
          <Path d="M96,58 C122,70 138,86 146,104" />
        </G>
        <G fill="#56b45f" fillOpacity={0.5} stroke="none">
          <Path d="M90,52 C60,30 30,34 10,54 C36,42 62,42 90,52 Z" />
          <Path d="M98,52 C118,24 140,24 152,42 C132,36 116,40 98,52 Z" />
        </G>
        <Circle cx={88} cy={62} r={8} fill="#6b3e1f" stroke="none" />
        <Circle cx={100} cy={64} r={8} fill="#6b3e1f" stroke="none" />
        <Circle cx={94} cy={70} r={7} fill="#5a3418" stroke="none" />
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
    // Never mirrored, so the hiding crab peeks out of the side `crabSide` says.
    noFlip: true,
    draw: (_colour, details) => (
      <G>
        {hidingCrab('sandcastle', details)}
        <G fill="#b07d3a">
          <Rect x={10} y={55} width={110} height={60} />
          {/* Towers with battlements. */}
          <Path d="M0,115 V30 H8 V22 H14 V30 H22 V22 H28 V30 H36 V115 Z" />
          <Path d="M94,115 V30 H102 V22 H108 V30 H116 V22 H122 V30 H130 V115 Z" />
          <Path d="M47,115 V20 H55 V12 H61 V20 H69 V12 H75 V20 H83 V115 Z" />
          <Line x1={65} y1={12} x2={65} y2={0} stroke="#555" strokeWidth={3} />
        </G>
        <G stroke="none">
          <Polygon points="65,0 85,6 65,12" fill="#e63946" />
          {/* Doorway, windows, a shell, and sand texture where the bucket left ridges. */}
          <Path d="M55,115 V95 C55,85 75,85 75,95 V115 Z" fill="#7a5426" />
          <Path d="M14,52 h8 v10 h-8 Z M108,52 h8 v10 h-8 Z M61,40 h8 v12 h-8 Z" fill="#7a5426" />
          <Path d="M2,70 H34 M2,90 H34 M96,70 H128 M96,90 H128 M49,62 H81" stroke="#8a5f2a" strokeWidth={2} strokeOpacity={0.6} />
          <Path d="M24,104 Q30,96 36,104 Z" fill="#ffc9de" />
          <Path d="M4,34 L6,112 L12,112 L10,34 Z" fill="#ffffff" fillOpacity={0.2} />
          <Path d="M10,112 H120 L120,115 H10 Z" fill="#000000" fillOpacity={0.12} />
        </G>
      </G>
    ),
  },
  { ...starfish, zones: SAND, maxCount: 4 },
  { ...person, zones: SAND, maxCount: 4 },
];

type Palette = Record<'sky' | 'sea' | 'sand' | 'foam' | 'headland' | 'wetSand' | 'grain', string>;

/** Sky, sea and sand, with a far headland, wet sand at the water's edge and the grain of the sand. Waves and clouds are marks drawn around the things. */
function backdrop(height: number, { sky, sea, sand, headland, wetSand, grain }: Palette) {
  const horizon = height * HORIZON;
  const shore = height * SHORE;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={horizon + 600} fill={sky} />
      {/* A low headland far away on the horizon. */}
      <Path d={`M560,${horizon} Q640,${horizon - 34} 720,${horizon - 30} Q820,${horizon - 44} 900,${horizon - 22} Q1100,${horizon - 30} 1500,${horizon - 10} V${horizon} Z`} fill={headland} />
      <Rect x={-600} y={horizon} width={2100} height={shore - horizon} fill={sea} />
      {/* A bright line where the sea meets the sky. */}
      <Rect x={-600} y={horizon} width={2100} height={4} fill="#ffffff" fillOpacity={0.35} />
      {/* Glints of sun on the water, thicker and brighter nearer the shore. */}
      {glints({ x0: -40, y0: horizon + 8, x1: 940, y1: horizon + (shore - horizon) * 0.45 }, 40, '#ffffff', 0.35, 14, 2)}
      {glints({ x0: -40, y0: horizon + (shore - horizon) * 0.45, x1: 940, y1: shore - 10 }, 36, '#ffffff', 0.45, 22, 3, 37)}
      <Rect x={-600} y={shore} width={2100} height={height - shore + 600} fill={sand} />
      {/* Wet, darker sand along the water's edge, then the grain of the dry sand. */}
      <Path d={`M-600,${shore} H1500 V${shore + 26} Q1200,${shore + 34} 900,${shore + 22} Q600,${shore + 36} 300,${shore + 24} Q0,${shore + 34} -600,${shore + 24} Z`} fill={wetSand} />
      {speckles({ x0: -40, y0: shore + 30, x1: 940, y1: height }, 260, grain, 0.35, 4)}
      {speckles({ x0: -40, y0: shore + 30, x1: 940, y1: height }, 90, '#ffffff', 0.35, 3, 23)}
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

/** Which of two palm trees has coconuts on the sand by it: the question's answer for each choice. */
const COCONUT_ANSWERS: Record<string, string> = {
  left: 'The one on the left',
  right: 'The one on the right',
  both: 'Both of them',
  none: 'Neither of them',
};

/** The coconuts at a palm's foot, beside the trunk, if this palm (0 on the left, 1 on the right) has them. */
function droppedCoconuts(details: SceneDetails | undefined, index: number) {
  const where = details?.values?.coconuts;
  if (!where || !(where === 'both' || where === (index === 0 ? 'left' : 'right'))) return null;
  return (
    <G stroke="#3d2412" strokeWidth={2}>
      {[
        [112, 256, 13],
        [140, 258, 12],
        [126, 235, 12],
      ].map(([cx, cy, r]) => (
        <G key={cx}>
          <Circle cx={cx} cy={cy} r={r} fill="#6b3e1f" />
          <Circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.3} fill="#9c6b3f" stroke="none" />
        </G>
      ))}
    </G>
  );
}

/** Once things are placed: the dropped coconuts, then the hiding crab. */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  return hideCrab(dropCoconuts(d, groups, random), groups, random);
}

/**
 * On harder levels a crab hides under the beach towel or behind the sandcastle (one of
 * each in the picture), and the round opens with "Where was the crab hiding?". Only when no other crabs are
 * in the picture, so "How many crabs were there?" stays clear; and it's never offered as "not in the picture".
 */
function hideCrab(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  if (!d.values?.peek || groups.some((g) => g.kind === 'crab')) return d;
  const spots = groups.filter((g) => CRAB_SPOTS[g.kind] && g.count === 1).map((g) => g.kind);
  if (!spots.length) return d;
  const hiding = random.pick(spots);
  const answer = CRAB_SPOTS[hiding].name;
  // Other spots in the picture first, so the answer can't be told from the choices.
  const inPicture = spots.filter((k) => k !== hiding).map((k) => CRAB_SPOTS[k].name);
  const elsewhere = Object.keys(CRAB_SPOTS).filter((k) => !spots.includes(k)).map((k) => CRAB_SPOTS[k].name);
  return {
    ...d,
    values: { ...d.values, crab: hiding, crabSide: groups.find((g) => g.kind === hiding)!.region === 'right' ? 'left' : 'right' },
    alsoSeen: [...(d.alsoSeen ?? []), 'crab'],
    facts: [
      ...(d.facts ?? []),
      {
        id: 'crab-hiding',
        type: 'position',
        prompt: 'Where was the crab hiding?',
        answer,
        wrong: [...inPicture, ...elsewhere],
        fallback: ['Behind the bucket', 'Under the beach umbrella', 'Behind the palm tree'],
        spotlight: true,
      },
    ],
  };
}

/**
 * With two palm trees, coconuts can lie on the sand by one of them, both or neither, and "Which palm tree had
 * coconuts by it?" asks which. All four answers happen, so none of them can be ruled out. One palm tree: none.
 */
function dropCoconuts(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  const palms = groups.find((g) => g.kind === 'palm');
  if (!palms || palms.count !== 2) return d;
  const r = random.next();
  const coconuts = r < 0.35 ? 'left' : r < 0.7 ? 'right' : r < 0.85 ? 'both' : 'none';
  const answer = COCONUT_ANSWERS[coconuts];
  return {
    ...d,
    values: { ...d.values, coconuts },
    facts: [
      ...(d.facts ?? []),
      {
        id: 'coconuts',
        type: 'position',
        prompt: 'Which palm tree had coconuts on the sand by it?',
        answer,
        wrong: Object.values(COCONUT_ANSWERS).filter((a) => a !== answer),
        needs: 'palm',
      },
    ],
  };
}

const PALETTES: Record<string, Palette> = {
  day: { sky: '#8fd3f4', sea: '#2a9fd6', sand: '#f2d49b', foam: '#ffffff', headland: '#7fb0c9', wetSand: '#dcb97c', grain: '#c99e5c' },
  sunset: { sky: '#ffb38a', sea: '#3d6fa8', sand: '#e9c46a', foam: '#ffd6a5', headland: '#c98a7a', wetSand: '#d2aa55', grain: '#b88a3a' },
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
  // No backdrop details of its own: the coconuts and the hiding crab are chosen once things are placed.
  details: (_random, { hidden = 0 }: DetailKnobs) => (hidden ? { values: { peek: String(hidden) } } : {}),
  fitDetails,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
