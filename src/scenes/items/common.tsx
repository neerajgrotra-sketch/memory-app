import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import type { ItemDef } from '../types';

/**
 * Things that turn up in several settings. Each recipe sets which bands they may go in and may
 * adjust counts. Shapes without their own stroke get the thing's outline; details use `stroke="none"`.
 */
type CommonItem = Omit<ItemDef, 'zones' | 'maxCount'>;

export const bird: CommonItem = {
  kind: 'bird',
  singular: 'bird',
  plural: 'birds',
  article: 'a',
  w: 60,
  h: 30,
  tier: 'small',
  size: 0.1,
  tone: '#222222',
  draw: () => (
    <Path d="M5,12 Q17,0 30,16 Q43,0 55,12" fill="none" stroke="#222" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  ),
};

/** A faint cloud for a recipe's backdrop marks: never asked about. Drawn in a 170 × 75 box. */
export const cloudShape = (x: number, y: number, scale: number) => (
  <G transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff">
    <Ellipse cx={85} cy={50} rx={80} ry={25} />
    <Ellipse cx={110} cy={32} rx={45} ry={28} />
    <Ellipse cx={60} cy={36} rx={38} ry={24} />
  </G>
);

export const balloon: CommonItem = {
  kind: 'balloon',
  singular: 'hot-air balloon',
  plural: 'hot-air balloons',
  article: 'a',
  w: 90,
  h: 135,
  tier: 'medium',
  size: 0.14,
  colours: [C.red, C.blue, C.purple, C.green, C.orange, C.pink],
  draw: (colour) => (
    <G>
      <Path d="M45,0 C90,0 95,50 75,78 L58,96 H32 L15,78 C-5,50 0,0 45,0 Z" fill={colour} />
      <Path d="M45,2 C30,30 30,70 38,96 M45,2 C60,30 60,70 52,96" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={5} />
      <Line x1={34} y1={96} x2={37} y2={112} stroke="#555" strokeWidth={2} />
      <Line x1={56} y1={96} x2={53} y2={112} stroke="#555" strokeWidth={2} />
      <Rect x={33} y={112} width={24} height={20} rx={3} fill="#8b5a2b" />
    </G>
  ),
};

export const kite: CommonItem = {
  kind: 'kite',
  singular: 'kite',
  plural: 'kites',
  article: 'a',
  w: 80,
  h: 160,
  tier: 'medium',
  size: 0.13,
  colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
  draw: (colour) => (
    <G>
      <Polygon points="40,0 78,45 40,105 2,45" fill={colour} />
      <Line x1={40} y1={0} x2={40} y2={105} stroke="#00000055" strokeWidth={3} />
      <Line x1={2} y1={45} x2={78} y2={45} stroke="#00000055" strokeWidth={3} />
      <Path d="M40,105 C55,125 25,140 45,160" fill="none" stroke="#333" strokeWidth={3} />
    </G>
  ),
};

export const plane: CommonItem = {
  kind: 'plane',
  singular: 'plane',
  plural: 'planes',
  article: 'a',
  w: 170,
  h: 60,
  tier: 'medium',
  size: 0.18,
  tone: '#ffffff',
  draw: () => (
    <G>
      <Polygon points="70,30 100,30 75,2 62,2" fill="#adb5bd" />
      <Polygon points="70,32 100,32 75,58 62,58" fill="#adb5bd" />
      <Polygon points="14,28 30,20 22,4 12,4" fill="#adb5bd" />
      <Path d="M10,30 C10,22 20,20 30,20 H140 C160,20 168,30 168,30 C168,30 160,40 140,40 H30 C20,40 10,38 10,30 Z" fill="#ffffff" />
      <G fill="#4dabf7" stroke="none">
        <Circle cx={120} cy={29} r={4} />
        <Circle cx={105} cy={29} r={4} />
        <Circle cx={45} cy={29} r={4} />
      </G>
    </G>
  ),
};

export const person: CommonItem = {
  kind: 'person',
  singular: 'person',
  plural: 'people',
  article: 'a',
  w: 64,
  h: 125,
  tier: 'small',
  size: 0.1,
  colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple, C.pink, C.white],
  colourPrompt: (plural) => (plural ? 'What colour were the people’s shirts?' : 'What colour was the person’s shirt?'),
  draw: (colour) => (
    <G>
      <Rect x={20} y={80} width={10} height={45} rx={4} fill="#343a40" stroke="none" />
      <Rect x={34} y={80} width={10} height={45} rx={4} fill="#343a40" stroke="none" />
      <Rect x={4} y={36} width={11} height={40} rx={5} fill={colour} />
      <Rect x={49} y={36} width={11} height={40} rx={5} fill={colour} />
      <Circle cx={9.5} cy={78} r={5} fill="#e0ac69" stroke="none" />
      <Circle cx={54.5} cy={78} r={5} fill="#e0ac69" stroke="none" />
      <Rect x={13} y={32} width={38} height={52} rx={10} fill={colour} />
      <Circle cx={32} cy={16} r={15} fill="#e0ac69" stroke="none" />
      <Path d="M17,14 C19,0 45,0 47,14 C39,8 25,8 17,14 Z" fill="#4a2c17" stroke="none" />
    </G>
  ),
};

export const dog: CommonItem = {
  kind: 'dog',
  singular: 'dog',
  plural: 'dogs',
  article: 'a',
  w: 100,
  h: 75,
  tier: 'medium',
  size: 0.14,
  colours: [C.brown, C.black, C.white],
  draw: (colour) => (
    <G>
      <Rect x={18} y={48} width={10} height={27} rx={4} fill={colour} />
      <Rect x={62} y={48} width={10} height={27} rx={4} fill={colour} />
      <Ellipse cx={45} cy={45} rx={36} ry={20} fill={colour} />
      <Path d="M10,40 C0,30 2,18 8,14" fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round" />
      <Circle cx={80} cy={26} r={18} fill={colour} />
      <Ellipse cx={92} cy={18} rx={7} ry={13} fill={colour} transform="rotate(25 92 18)" />
      <Circle cx={84} cy={22} r={3} fill="#111" stroke="none" />
      <Circle cx={97} cy={30} r={4} fill="#111" stroke="none" />
    </G>
  ),
};

export const tree: CommonItem = {
  kind: 'tree',
  singular: 'tree',
  plural: 'trees',
  article: 'a',
  w: 120,
  h: 200,
  tier: 'large',
  size: 0.2,
  tall: true,
  spread: true,
  tone: '#2f8f3a',
  draw: () => (
    <G>
      <Rect x={50} y={110} width={22} height={90} fill="#7a4a2a" />
      <Circle cx={60} cy={70} r={55} fill="#2f8f3a" />
      <Circle cx={30} cy={100} r={32} fill="#2f8f3a" />
      <Circle cx={92} cy={100} r={32} fill="#2f8f3a" />
    </G>
  ),
};

export const plantPot: CommonItem = {
  kind: 'plant',
  singular: 'potted plant',
  plural: 'potted plants',
  article: 'a',
  w: 80,
  h: 110,
  tier: 'medium',
  size: 0.13,
  colours: [C.orange, C.blue, C.white, C.yellow, C.pink, C.purple],
  colourPrompt: (plural) => (plural ? 'What colour were the plant pots?' : 'What colour was the plant pot?'),
  draw: (colour) => (
    <G>
      <Path d="M40,62 C20,40 5,30 8,8 C25,15 35,35 40,62 Z" fill="#2b9348" stroke="none" />
      <Path d="M40,62 C60,40 75,30 72,8 C55,15 45,35 40,62 Z" fill="#40a85a" stroke="none" />
      <Path d="M40,62 C38,35 40,15 40,0 C46,20 46,40 40,62 Z" fill="#2b9348" stroke="none" />
      <Path d="M14,60 H66 L58,110 H22 Z" fill={colour} />
    </G>
  ),
};

export const ball: CommonItem = {
  kind: 'ball',
  singular: 'ball',
  plural: 'balls',
  article: 'a',
  w: 55,
  h: 55,
  tier: 'small',
  size: 0.1,
  colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple, C.pink],
  draw: (colour) => (
    <G>
      <Circle cx={27.5} cy={27.5} r={26} fill={colour} />
      <Path d="M4,22 C18,32 38,32 51,22" fill="none" stroke="#ffffff" strokeWidth={6} />
    </G>
  ),
};
