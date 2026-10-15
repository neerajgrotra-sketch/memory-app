import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, bird, clouds, dog, person, plane, tree } from '../items/common';
import { heightFactor, type Fixture, type ItemDef, type Mount, type Recipe } from '../types';

const SKY = ['sky'];
const WALLS = ['buildings'];
const PAVEMENT = ['pavement'];
const ROAD = ['road'];

const wheel = (cx: number, cy: number, r: number) => (
  <G>
    <Circle cx={cx} cy={cy} r={r} fill="#222" />
    <Circle cx={cx} cy={cy} r={r * 0.45} fill="#adb5bd" />
  </G>
);

const items: ItemDef[] = [
  { ...bird, zones: SKY, maxCount: 6 },
  { ...plane, zones: SKY, maxCount: 2 },
  { ...balloon, zones: SKY, maxCount: 3 },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 80,
    h: 160,
    height: 300,
    zones: WALLS,
    maxCount: 2,
    mount: 'roof',
    colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
    // A flagpole standing on the roof.
    draw: (colour) => (
      <G>
        <Rect x={4} y={152} width={14} height={8} rx={2} fill="#343a40" />
        <Line x1={11} y1={2} x2={11} y2={154} stroke="#495057" strokeWidth={5} strokeLinecap="round" />
        <Path d="M13,8 C35,2 52,18 78,10 V52 C52,60 35,44 13,50 Z" fill={colour} stroke="#00000033" strokeWidth={2} />
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
    height: 72,
    zones: WALLS,
    maxCount: 1,
    countable: false,
    mount: 'corner',
    // A street clock on a bracket fixed to a building's corner (bracket on the left; mirrored on right-hand corners).
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
    height: 90,
    zones: WALLS,
    maxCount: 3,
    mount: 'roof',
    draw: () => (
      <G>
        <Line x1={40} y1={50} x2={40} y2={74} stroke="#495057" strokeWidth={6} />
        <Rect x={28} y={70} width={24} height={10} rx={2} fill="#343a40" />
        <Path d="M8,10 C0,45 40,65 70,50 Z" fill="#dee2e6" stroke="#868e96" strokeWidth={3} />
        <Line x1={39} y1={30} x2={62} y2={12} stroke="#868e96" strokeWidth={4} />
        <Circle cx={63} cy={11} r={5} fill="#868e96" />
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
    height: 230,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.yellow],
    colourPrompt: (plural) => (plural ? 'What colour were the awnings on the market stalls?' : 'What colour was the awning on the market stall?'),
    draw: (colour) => (
      <G>
        <Rect x={12} y={50} width={7} height={110} fill="#5c3d1e" />
        <Rect x={161} y={50} width={7} height={110} fill="#5c3d1e" />
        <Rect x={8} y={105} width={164} height={55} fill="#a0612b" stroke="#00000033" strokeWidth={2} />
        <G>
          <Circle cx={40} cy={100} r={12} fill="#e63946" />
          <Circle cx={64} cy={100} r={12} fill="#f77f00" />
          <Circle cx={88} cy={100} r={12} fill="#ffd60a" />
          <Circle cx={112} cy={100} r={12} fill="#2b9348" />
          <Circle cx={136} cy={100} r={12} fill="#e63946" />
        </G>
        <Polygon points="10,0 170,0 180,45 0,45" fill={colour} stroke="#00000033" strokeWidth={2} />
        <G fill="#ffffff" fillOpacity={0.75}>
          <Polygon points="42,0 62,0 64,45 40,45" />
          <Polygon points="106,0 126,0 132,45 108,45" />
        </G>
        <Path d="M0,45 Q15,62 30,45 Q45,62 60,45 Q75,62 90,45 Q105,62 120,45 Q135,62 150,45 Q165,62 180,45" fill={colour} />
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
    height: 85,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.brown, C.yellow],
    draw: (colour) => (
      <G>
        <Rect x={14} y={45} width={8} height={30} fill="#343a40" />
        <Rect x={118} y={45} width={8} height={30} fill="#343a40" />
        <Rect x={4} y={8} width={132} height={14} rx={3} fill={colour} stroke="#00000033" strokeWidth={2} />
        <Rect x={0} y={36} width={140} height={14} rx={3} fill={colour} stroke="#00000033" strokeWidth={2} />
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
    height: 100,
    zones: PAVEMENT,
    maxCount: 3,
    colours: [C.green, C.black, C.blue, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M6,14 H49 L44,85 H11 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Rect x={2} y={4} width={51} height={12} rx={4} fill={colour} stroke="#00000044" strokeWidth={2} />
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
    height: 100,
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
    height: 75,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.yellow],
    draw: (colour) => (
      <G stroke="#00000044" strokeWidth={2}>
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
    height: 450,
    zones: PAVEMENT,
    maxCount: 2,
    draw: () => (
      <G>
        <Rect x={26} y={40} width={8} height={200} fill="#343a40" />
        <Rect x={12} y={0} width={36} height={44} rx={6} fill="#343a40" />
        <Rect x={18} y={6} width={24} height={30} fill="#fff3b0" />
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
    height: 145,
    zones: ROAD,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.black, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M5,62 V42 C5,34 12,30 20,30 H40 L62,6 H122 L145,30 H158 C166,30 172,36 172,44 V62 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Path d="M70,12 H95 V30 H50 Z M101,12 H118 L136,30 H101 Z" fill="#cfe9ff" />
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
    height: 280,
    zones: ROAD,
    maxCount: 1,
    colours: [C.red, C.blue, C.yellow, C.green, C.white],
    draw: (colour) => (
      <G>
        <Rect x={2} y={2} width={226} height={88} rx={12} fill={colour} stroke="#00000044" strokeWidth={2} />
        <G fill="#cfe9ff">
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
    height: 115,
    zones: ROAD,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.white],
    draw: (colour) => (
      <G>
        <Path d="M20,52 C22,34 45,30 62,36 L70,52 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Rect x={30} y={26} width={30} height={9} rx={4} fill="#222" />
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
    height: 230,
    zones: ROAD,
    maxCount: 2,
    colours: [C.white, C.blue, C.red, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M4,78 V14 C4,8 8,4 14,4 H130 L170,38 C180,40 186,46 186,54 V78 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Path d="M134,12 L162,38 H134 Z" fill="#cfe9ff" />
        {wheel(42, 80, 18)}
        {wheel(150, 80, 18)}
      </G>
    ),
  },
];

/**
 * The three main buildings line up with the left, middle and right thirds, so
 * anything on "the buildings" is always on exactly one building.
 */
const FACADES: [number, number][] = [
  [0, 305],
  [305, 595],
  [595, 900],
];

const BUILDINGS = [
  { x: -600, w: 600, rise: 0.01 },
  { x: FACADES[0][0], w: FACADES[0][1] - FACADES[0][0], rise: 0.03, facade: 0 },
  { x: FACADES[1][0], w: FACADES[1][1] - FACADES[1][0], rise: 0, facade: 1 },
  { x: FACADES[2][0], w: FACADES[2][1] - FACADES[2][0], rise: 0.02, facade: 2 },
  { x: 900, w: 600, rise: 0.005 },
];

/** Where the building fronts meet the pavement, and the roofline (fractions of the height). */
const GROUND_LINE = 0.6;
const ROOF = 0.31;
/** Picture units per cm on the building fronts; the same scale as the camera at the pavement line. */
const unitFor = (height: number) => 1.03 * heightFactor(height);

/**
 * Each building's real layout, shared by the drawing and the placement rules: two upper-floor
 * windows (sill at 290 cm, 110 cm tall) and an 85 cm door (215 cm tall), all centred, which leaves the
 * corners clear for a bracket clock at 240 cm.
 */
function facadeLayout(height: number) {
  const unit = unitFor(height);
  const ground = height * GROUND_LINE;
  const winW = 70 * unit;
  const winH = 110 * unit;
  const doorW = 85 * unit;
  const doorH = 215 * unit;
  return BUILDINGS.map((b) => {
    const centre = b.x + b.w / 2;
    const sill = ground - 290 * unit;
    return {
      ...b,
      top: height * (ROOF - b.rise),
      windows: [
        { x0: centre - 20 * unit - winW, y0: sill - winH, x1: centre - 20 * unit, y1: sill },
        { x0: centre + 20 * unit, y0: sill - winH, x1: centre + 20 * unit + winW, y1: sill },
      ],
      door: { x0: centre - doorW / 2, y0: ground - doorH, x1: centre + doorW / 2, y1: ground },
    };
  });
}

function fixtures(height: number): Fixture[] {
  return facadeLayout(height)
    .filter((b) => b.facade !== undefined)
    .flatMap((b) => [...b.windows, b.door].map((r) => ({ kind: 'opening' as const, ...r })));
}

function mounts(height: number): Mount[] {
  const clockAt = height * GROUND_LINE - 240 * unitFor(height);
  return facadeLayout(height).flatMap((b): Mount[] =>
    b.facade === undefined
      ? []
      : [
          { kind: 'corner', panel: b.facade, side: 'left', x: b.x + 2, y: clockAt },
          { kind: 'corner', panel: b.facade, side: 'right', x: b.x + b.w - 2, y: clockAt },
          { kind: 'roof', panel: b.facade, x0: b.x + 16, x1: b.x + b.w - 16, y: b.top },
        ],
  );
}

function backdrop(height: number, sky: string, walls: string[], window: string) {
  const pavement = height * GROUND_LINE;
  const kerb = height * 0.73;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={pavement + 600} fill={sky} />
      {facadeLayout(height).map((b, i) => (
        <G key={b.x}>
          <Rect x={b.x} y={b.top} width={b.w} height={pavement - b.top} fill={walls[i % walls.length]} />
          <Rect x={b.x} y={b.top} width={b.w} height={10} fill="#000000" fillOpacity={0.12} />
          {b.windows.map((w) => (
            <Rect key={w.x0} x={w.x0} y={w.y0} width={w.x1 - w.x0} height={w.y1 - w.y0} fill={window} fillOpacity={0.6} />
          ))}
          <Rect x={b.door.x0} y={b.door.y0} width={b.door.x1 - b.door.x0} height={b.door.y1 - b.door.y0} fill="#5c3d1e" fillOpacity={0.85} />
        </G>
      ))}
      <Rect x={-600} y={pavement} width={2100} height={kerb - pavement} fill="#ced4da" />
      <G stroke="#b8bfc6" strokeWidth={3}>
        {[-300, 0, 150, 300, 450, 600, 750, 900, 1200].map((x) => (
          <Line key={x} x1={x} y1={pavement} x2={x - 40} y2={kerb} />
        ))}
      </G>
      <Rect x={-600} y={kerb} width={2100} height={14} fill="#868e96" />
      <Rect x={-600} y={kerb + 14} width={2100} height={height - kerb + 600} fill="#495057" />
      <G fill="#f8f9fa">
        {[-200, 40, 280, 520, 760, 1000].map((x) => (
          <Rect key={x} x={x} y={height * 0.88} width={110} height={8} />
        ))}
      </G>
    </G>
  );
}

export const city: Recipe = {
  id: 'city',
  title: 'City street',
  place: 'in the street',
  // A slightly raised camera: gentle perspective, with buildings drawn at the same scale as people.
  camera: { horizon: -0.6, ref: 0.6, pxPerCm: 1.03 },
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0.04, bottom: 0.25 },
    { id: 'buildings', label: 'On the buildings', surface: 'wall', top: 0.05, bottom: 0.5, plane: GROUND_LINE, panels: FACADES, minGroups: 1 },
    { id: 'pavement', label: 'On the pavement', surface: 'ground', top: 0.63, bottom: 0.72, singleRow: true },
    { id: 'road', label: 'On the road', surface: 'ground', top: 0.79, bottom: 0.97 },
  ],
  items,
  fixtures,
  mounts,
  wallGapCm: 30,
  decor: [{ ...clouds, top: 0.02, bottom: 0.2 }],
  variants: [
    { id: 'day', background: (h) => backdrop(h, '#a5d8ff', ['#e9c46a', '#f4a261', '#b5838d', '#90be6d'], '#e7f5ff') },
    { id: 'sunset', background: (h) => backdrop(h, '#ffc9a9', ['#c9ada7', '#9a8c98', '#e5989b', '#b5c99a'], '#fff3bf') },
  ],
};
