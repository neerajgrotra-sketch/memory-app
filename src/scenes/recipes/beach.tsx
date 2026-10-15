import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, ball, bird, clouds, kite, person, plane } from '../items/common';
import type { ItemDef, Recipe } from '../types';

const SKY = ['sky'];
const SEA = ['sea'];
const SAND = ['shore', 'front'];

const items: ItemDef[] = [
  {
    kind: 'sun',
    singular: 'sun',
    plural: 'suns',
    article: 'a',
    w: 140,
    h: 140,
    size: 150,
    zones: SKY,
    maxCount: 1,
    countable: false,
    draw: () => <Circle cx={70} cy={70} r={62} fill="#ffd93b" />,
  },
  { ...bird, zones: SKY, maxCount: 6 },
  { ...kite, zones: SKY, maxCount: 3 },
  { ...balloon, zones: SKY, maxCount: 3 },
  { ...plane, zones: SKY, maxCount: 2 },
  {
    kind: 'sailboat',
    singular: 'sailboat',
    plural: 'sailboats',
    article: 'a',
    w: 130,
    h: 150,
    size: 170,
    zones: SEA,
    maxCount: 4,
    colours: [C.red, C.yellow, C.white, C.orange, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the sails on the boats?' : 'What colour was the sail on the boat?'),
    draw: (colour) => (
      <G>
        <Line x1={65} y1={5} x2={65} y2={118} stroke="#5c3d1e" strokeWidth={5} />
        <Polygon points="68,8 68,110 120,110" fill={colour} stroke="#00000033" strokeWidth={2} />
        <Polygon points="62,20 62,110 18,110" fill={colour} fillOpacity={0.85} stroke="#00000033" strokeWidth={2} />
        <Path d="M5,118 H125 L108,145 H22 Z" fill="#7a4a2a" />
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
    size: 60,
    zones: SEA,
    maxCount: 5,
    colours: [C.red, C.yellow, C.orange, C.white],
    draw: (colour) => (
      <G>
        <Path d="M10,60 C10,25 15,10 25,10 C35,10 40,25 40,60 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Rect x={11} y={34} width={28} height={8} fill="#ffffff" fillOpacity={0.8} />
        <Line x1={25} y1={10} x2={25} y2={0} stroke="#333" strokeWidth={3} />
        <Ellipse cx={25} cy={61} rx={24} ry={4} fill="#ffffff" fillOpacity={0.6} />
      </G>
    ),
  },
  {
    kind: 'dolphin',
    singular: 'dolphin',
    plural: 'dolphins',
    article: 'a',
    w: 130,
    h: 75,
    size: 75,
    zones: SEA,
    maxCount: 3,
    draw: () => (
      <G>
        <Path d="M8,62 C20,15 85,2 118,30 C108,30 100,36 98,40 C80,22 40,25 22,62 Z" fill="#8d99ae" />
        <Polygon points="62,14 75,0 80,18" fill="#8d99ae" />
        <Polygon points="8,62 0,50 16,56" fill="#8d99ae" />
        <Circle cx={104} cy={30} r={3} fill="#222" />
        <Path d="M0,70 Q30,62 60,70 T120,70" fill="none" stroke="#ffffff" strokeWidth={4} />
      </G>
    ),
  },
  {
    kind: 'umbrella',
    singular: 'beach umbrella',
    plural: 'beach umbrellas',
    article: 'a',
    w: 160,
    h: 180,
    size: 190,
    zones: SAND,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple, C.pink],
    draw: (colour) => (
      <G>
        <Line x1={80} y1={60} x2={80} y2={180} stroke="#5c3d1e" strokeWidth={6} />
        <Path d="M2,62 C10,10 150,10 158,62 Z" fill={colour} stroke="#00000033" strokeWidth={2} />
        <Path d="M80,18 C60,30 50,45 48,62 L80,62 Z M80,18 C100,30 110,45 112,62 L80,62 Z" fill="#ffffff" fillOpacity={0.55} />
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
    size: 55,
    zones: SAND,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple],
    draw: (colour) => (
      <G>
        <Path d="M10,22 C10,0 50,0 50,22" fill="none" stroke="#555" strokeWidth={3} />
        <Path d="M4,22 H56 L48,65 H12 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
      </G>
    ),
  },
  { ...ball, singular: 'beach ball', plural: 'beach balls', size: 45, zones: SAND, maxCount: 4 },
  {
    kind: 'crab',
    singular: 'crab',
    plural: 'crabs',
    article: 'a',
    w: 80,
    h: 50,
    size: 38,
    zones: SAND,
    maxCount: 5,
    draw: () => (
      <G stroke="#9d0208" strokeWidth={4} strokeLinecap="round">
        <Line x1={22} y1={34} x2={8} y2={46} />
        <Line x1={28} y1={38} x2={20} y2={50} />
        <Line x1={58} y1={34} x2={72} y2={46} />
        <Line x1={52} y1={38} x2={60} y2={50} />
        <Path d="M20,24 C10,20 6,10 10,4" fill="none" />
        <Path d="M60,24 C70,20 74,10 70,4" fill="none" />
        <Ellipse cx={40} cy={30} rx={24} ry={15} fill="#e63946" />
        <Circle cx={10} cy={4} r={6} fill="#e63946" />
        <Circle cx={70} cy={4} r={6} fill="#e63946" />
        <Circle cx={33} cy={20} r={3} fill="#111" stroke="none" />
        <Circle cx={47} cy={20} r={3} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'towel',
    singular: 'beach towel',
    plural: 'beach towels',
    article: 'a',
    w: 160,
    h: 70,
    size: 50,
    zones: SAND,
    maxCount: 3,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.pink],
    draw: (colour) => (
      <G>
        <Polygon points="20,0 160,0 140,70 0,70" fill={colour} stroke="#00000033" strokeWidth={2} />
        <Polygon points="50,0 70,0 50,70 30,70" fill="#ffffff" fillOpacity={0.7} />
        <Polygon points="110,0 130,0 110,70 90,70" fill="#ffffff" fillOpacity={0.7} />
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
    size: 330,
    zones: SAND,
    maxCount: 3,
    draw: () => (
      <G>
        <Path d="M70,270 C75,200 70,120 88,55 L100,58 C88,120 92,200 92,270 Z" fill="#8b5a2b" />
        <G fill="#2b9348">
          <Path d="M94,55 C60,20 20,30 0,60 C30,45 60,45 94,55 Z" />
          <Path d="M94,55 C120,15 150,20 160,50 C135,40 115,42 94,55 Z" />
          <Path d="M94,55 C80,10 95,0 110,0 C100,20 98,35 94,55 Z" />
          <Path d="M94,55 C60,60 35,85 30,110 C55,85 75,72 94,55 Z" />
          <Path d="M94,55 C125,60 145,85 150,110 C128,85 112,72 94,55 Z" />
        </G>
        <Circle cx={88} cy={62} r={8} fill="#6b3e1f" />
        <Circle cx={100} cy={64} r={8} fill="#6b3e1f" />
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
    size: 100,
    zones: SAND,
    maxCount: 2,
    draw: () => (
      <G fill="#d4a259" stroke="#a87b3d" strokeWidth={2}>
        <Rect x={10} y={55} width={110} height={60} />
        <Rect x={0} y={30} width={36} height={85} />
        <Rect x={94} y={30} width={36} height={85} />
        <Rect x={47} y={20} width={36} height={95} />
        <Line x1={65} y1={20} x2={65} y2={0} stroke="#555" />
        <Polygon points="65,0 85,6 65,12" fill="#e63946" stroke="none" />
        <Path d="M55,115 V95 C55,85 75,85 75,95 V115 Z" fill="#a87b3d" />
      </G>
    ),
  },
  {
    kind: 'starfish',
    singular: 'starfish',
    plural: 'starfish',
    article: 'a',
    w: 55,
    h: 55,
    size: 38,
    zones: SAND,
    maxCount: 5,
    colours: [C.orange, C.pink, C.red, C.purple],
    draw: (colour) => (
      <Polygon
        points="27.5,0 34,19 54,20 38,32 44,52 27.5,40 11,52 17,32 1,20 21,19"
        fill={colour}
        stroke="#00000044"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    ),
  },
  { ...person, zones: SAND, maxCount: 4 },
];

function backdrop(height: number, sky: string, sea: string, sand: string, foam: string) {
  const horizon = height * 0.33;
  const shore = height * 0.55;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={horizon + 610} fill={sky} />
      <Path d={`M-600,${horizon} H0 Q120,${horizon - 30} 240,${horizon} H1500 V${horizon + 4} H-600 Z`} fill="#6c9a8b" fillOpacity={0.6} />
      <Rect x={-600} y={horizon} width={2100} height={shore - horizon + 20} fill={sea} />
      <G stroke={foam} strokeWidth={4} fill="none" strokeOpacity={0.5}>
        {[0.37, 0.42, 0.47, 0.52].map((f, i) => (
          <Path key={f} d={`M${60 + i * 190},${height * f} q30,-12 60,0 M${520 - i * 110},${height * f + 30} q30,-12 60,0`} />
        ))}
      </G>
      <Path d={`M-600,${shore} H0 Q225,${shore - 20} 450,${shore} T900,${shore} H1500 V${height + 600} H-600 Z`} fill={sand} />
      <Path d={`M-600,${shore} H0 Q225,${shore - 20} 450,${shore} T900,${shore} H1500`} fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={6} />
    </G>
  );
}

export const beach: Recipe = {
  id: 'beach',
  title: 'At the beach',
  place: 'on the beach',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0.07, bottom: 0.31 },
    { id: 'sea', label: 'In the sea', surface: 'ground', top: 0.34, bottom: 0.54, farScale: 0.7, nearScale: 0.85 },
    { id: 'shore', label: 'Near the water', surface: 'ground', top: 0.56, bottom: 0.75, farScale: 0.8, nearScale: 0.9 },
    { id: 'front', label: 'At the front', surface: 'ground', top: 0.76, bottom: 0.97, farScale: 0.92, nearScale: 1.05 },
  ],
  items,
  decor: [{ ...clouds, top: 0.04, bottom: 0.28 }],
  variants: [
    { id: 'day', background: (h) => backdrop(h, '#8fd3f4', '#2a9fd6', '#f2d49b', '#ffffff') },
    { id: 'sunset', background: (h) => backdrop(h, '#ffb38a', '#3d6fa8', '#e9c46a', '#ffd6a5') },
  ],
};
