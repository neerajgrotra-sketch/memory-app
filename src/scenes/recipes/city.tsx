import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, bird, cloud, dog, person, plane, plantPot, tree } from '../items/common';
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
  { ...cloud, zones: SKY, maxCount: 3 },
  { ...plane, zones: SKY, maxCount: 2 },
  { ...balloon, zones: SKY, maxCount: 3 },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 90,
    h: 110,
    zones: WALLS,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Line x1={6} y1={0} x2={6} y2={110} stroke="#495057" strokeWidth={6} />
        <Path d="M9,6 C35,0 55,16 86,8 V56 C55,64 35,48 9,54 Z" fill={colour} stroke="#00000033" strokeWidth={2} />
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
    zones: WALLS,
    maxCount: 3,
    draw: () => (
      <G>
        <Line x1={40} y1={50} x2={40} y2={80} stroke="#495057" strokeWidth={6} />
        <Path d="M8,10 C0,45 40,65 70,50 Z" fill="#dee2e6" stroke="#868e96" strokeWidth={3} />
        <Line x1={39} y1={30} x2={62} y2={12} stroke="#868e96" strokeWidth={4} />
        <Circle cx={63} cy={11} r={5} fill="#868e96" />
      </G>
    ),
  },
  {
    kind: 'awning',
    singular: 'shop awning',
    plural: 'shop awnings',
    article: 'a',
    w: 170,
    h: 70,
    zones: WALLS,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.yellow],
    draw: (colour) => (
      <G>
        <Polygon points="10,0 160,0 170,50 0,50" fill={colour} stroke="#00000033" strokeWidth={2} />
        <G fill="#ffffff" fillOpacity={0.75}>
          <Polygon points="40,0 60,0 62,50 38,50" />
          <Polygon points="100,0 120,0 126,50 102,50" />
        </G>
        <Path d="M0,50 Q14,68 28,50 Q42,68 56,50 Q70,68 85,50 Q99,68 113,50 Q127,68 141,50 Q155,68 170,50" fill={colour} />
      </G>
    ),
  },
  { ...plantPot, singular: 'window plant', plural: 'window plants', zones: WALLS, maxCount: 3 },
  { ...person, zones: PAVEMENT, maxCount: 4 },
  { ...dog, zones: PAVEMENT, maxCount: 3 },
  { ...tree, zones: PAVEMENT, maxCount: 2 },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 75,
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
  { x: 0, w: 240, top: 390 },
  { x: 240, w: 210, top: 440 },
  { x: 450, w: 230, top: 400 },
  { x: 680, w: 220, top: 450 },
];

function backdrop(sky: string, walls: string[], window: string) {
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={1500} fill={sky} />
      {BUILDINGS.map((b, i) => (
        <G key={b.x}>
          <Rect x={b.x} y={b.top} width={b.w} height={900 - b.top} fill={walls[i]} />
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2].map((col) => (
              <Rect
                key={`${row}-${col}`}
                x={b.x + 22 + col * ((b.w - 44) / 3)}
                y={b.top + 30 + row * 92}
                width={(b.w - 44) / 3 - 18}
                height={56}
                fill={window}
                fillOpacity={0.55}
              />
            )),
          )}
        </G>
      ))}
      <Rect x={-600} y={880} width={2100} height={210} fill="#ced4da" />
      <Rect x={-600} y={1080} width={2100} height={14} fill="#868e96" />
      <Rect x={-600} y={1094} width={2100} height={860} fill="#495057" />
      <G fill="#f8f9fa">
        {[40, 280, 520, 760].map((x) => (
          <Rect key={x} x={x} y={1335} width={110} height={8} />
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
    { id: 'sky', label: 'In the sky', top: 30, bottom: 360 },
    { id: 'buildings', label: 'On the buildings', top: 470, bottom: 800 },
    { id: 'pavement', label: 'On the pavement', top: 800, bottom: 1075, ground: true, singleRow: true },
    { id: 'road', label: 'On the road', top: 1110, bottom: 1325, ground: true },
  ],
  items,
  variants: [
    { id: 'day', background: () => backdrop('#a5d8ff', ['#e9c46a', '#f4a261', '#b5838d', '#90be6d'], '#e7f5ff') },
    { id: 'sunset', background: () => backdrop('#ffc9a9', ['#c9ada7', '#9a8c98', '#e5989b', '#b5c99a'], '#fff3bf') },
  ],
};
