import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, bird, clouds, dog, person, plane, tree } from '../items/common';
import type { ItemDef, Recipe } from '../types';

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
    w: 100,
    h: 112,
    size: 120,
    zones: WALLS,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
    // Bolted to the wall: a bracket plate with the pole sticking out at an angle.
    draw: (colour) => (
      <G>
        <Path d="M42,49 L67,13 C78,22 86,20 97,48 C86,46 80,60 72,84 Z" fill={colour} stroke="#00000033" strokeWidth={2} />
        <Line x1={10} y1={98} x2={70} y2={8} stroke="#495057" strokeWidth={6} strokeLinecap="round" />
        <Rect x={0} y={88} width={16} height={24} rx={3} fill="#343a40" />
      </G>
    ),
  },
  {
    kind: 'clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 100,
    h: 100,
    size: 100,
    zones: WALLS,
    maxCount: 1,
    countable: false,
    draw: () => (
      <G>
        <Circle cx={50} cy={50} r={46} fill="#ffffff" stroke="#343a40" strokeWidth={8} />
        <Line x1={50} y1={50} x2={50} y2={18} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
        <Line x1={50} y1={50} x2={72} y2={60} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
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
    size: 80,
    zones: WALLS,
    maxCount: 3,
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
    size: 150,
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
  { ...dog, size: 70, zones: PAVEMENT, maxCount: 3 },
  { ...tree, size: 240, zones: PAVEMENT, maxCount: 2 },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 75,
    size: 70,
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
    size: 85,
    zones: PAVEMENT,
    maxCount: 4,
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
    size: 75,
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
    size: 65,
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
    size: 260,
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
    size: 75,
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
    size: 95,
    zones: ROAD,
    maxCount: 2,
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
    size: 70,
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
    size: 95,
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

const BUILDINGS = [
  { x: -600, w: 600, rise: 0 },
  { x: 0, w: 240, rise: 0.03 },
  { x: 240, w: 210, rise: 0 },
  { x: 450, w: 230, rise: 0.025 },
  { x: 680, w: 220, rise: 0.005 },
  { x: 900, w: 600, rise: 0.02 },
];

function backdrop(height: number, sky: string, walls: string[], window: string) {
  const roof = height * 0.31;
  const pavement = height * 0.6;
  const kerb = height * 0.73;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={pavement + 600} fill={sky} />
      {BUILDINGS.map((b, i) => {
        const top = roof - b.rise * height;
        const rows = Math.floor((pavement - top - 30) / 90);
        return (
          <G key={b.x}>
            <Rect x={b.x} y={top} width={b.w} height={pavement - top} fill={walls[i % walls.length]} />
            {Array.from({ length: rows }, (_, row) =>
              [0, 1, 2].map((col) => (
                <Rect
                  key={`${row}-${col}`}
                  x={b.x + 22 + col * ((b.w - 44) / 3)}
                  y={top + 28 + row * 90}
                  width={(b.w - 44) / 3 - 18}
                  height={54}
                  fill={window}
                  fillOpacity={0.55}
                />
              )),
            )}
          </G>
        );
      })}
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
          <Rect key={x} x={x} y={height * 0.855} width={110} height={8} />
        ))}
      </G>
    </G>
  );
}

export const city: Recipe = {
  id: 'city',
  title: 'City street',
  place: 'in the street',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0.12, bottom: 0.27 },
    { id: 'buildings', label: 'On the buildings', surface: 'wall', top: 0.33, bottom: 0.5 },
    {
      id: 'pavement',
      label: 'On the pavement',
      surface: 'ground',
      top: 0.51,
      bottom: 0.72,
      floor: 0.65,
      farScale: 0.85,
      nearScale: 0.9,
      singleRow: true,
    },
    { id: 'road', label: 'On the road', surface: 'ground', top: 0.75, bottom: 0.98, farScale: 0.9, nearScale: 1 },
  ],
  items,
  decor: [{ ...clouds, top: 0.03, bottom: 0.2 }],
  variants: [
    { id: 'day', background: (h) => backdrop(h, '#a5d8ff', ['#e9c46a', '#f4a261', '#b5838d', '#90be6d'], '#e7f5ff') },
    { id: 'sunset', background: (h) => backdrop(h, '#ffc9a9', ['#c9ada7', '#9a8c98', '#e5989b', '#b5c99a'], '#fff3bf') },
  ],
};
