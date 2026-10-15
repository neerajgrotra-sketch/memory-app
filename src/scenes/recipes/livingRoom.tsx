import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { C } from '../colours';
import { ball, dog, plantPot } from '../items/common';
import type { ItemDef, Recipe } from '../types';

const WALL = ['wall'];
const BACK = ['back'];
const FRONT = ['front'];

const items: ItemDef[] = [
  {
    kind: 'frame',
    singular: 'picture frame',
    plural: 'picture frames',
    article: 'a',
    w: 110,
    h: 90,
    zones: WALL,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.black, C.white, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the picture frames?' : 'What colour was the picture frame?'),
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={110} height={90} fill={colour} stroke="#00000044" strokeWidth={2} />
        <Rect x={12} y={12} width={86} height={66} fill="#cfe9ff" />
        <Path d="M12,78 L40,45 L60,65 L75,52 L98,78 Z" fill="#74c69d" />
        <Circle cx={80} cy={28} r={8} fill="#ffd93b" />
      </G>
    ),
  },
  {
    kind: 'wall-clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 100,
    h: 100,
    zones: WALL,
    maxCount: 1,
    countable: false,
    draw: () => (
      <G>
        <Circle cx={50} cy={50} r={46} fill="#ffffff" stroke="#343a40" strokeWidth={8} />
        <Line x1={50} y1={50} x2={50} y2={18} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
        <Line x1={50} y1={50} x2={28} y2={62} stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'mirror',
    singular: 'mirror',
    plural: 'mirrors',
    article: 'a',
    w: 90,
    h: 130,
    zones: WALL,
    maxCount: 2,
    draw: () => (
      <G>
        <Ellipse cx={45} cy={65} rx={44} ry={64} fill="#b08d57" />
        <Ellipse cx={45} cy={65} rx={34} ry={54} fill="#dbe9f4" />
        <Line x1={30} y1={40} x2={50} y2={20} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'window',
    singular: 'window',
    plural: 'windows',
    article: 'a',
    w: 150,
    h: 175,
    zones: WALL,
    maxCount: 2,
    draw: () => (
      <G>
        <Rect x={0} y={0} width={150} height={175} fill="#a5d8ff" stroke="#ffffff" strokeWidth={12} />
        <Line x1={75} y1={0} x2={75} y2={175} stroke="#ffffff" strokeWidth={10} />
        <Line x1={0} y1={88} x2={150} y2={88} stroke="#ffffff" strokeWidth={10} />
      </G>
    ),
  },
  {
    kind: 'sofa',
    singular: 'sofa',
    plural: 'sofas',
    article: 'a',
    w: 230,
    h: 120,
    zones: BACK,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.grey, C.yellow, C.purple, C.brown],
    draw: (colour) => (
      <G stroke="#00000033" strokeWidth={2}>
        <Rect x={20} y={0} width={190} height={70} rx={16} fill={colour} />
        <Rect x={0} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={190} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={30} y={62} width={170} height={40} rx={8} fill={colour} />
        <Rect x={10} y={108} width={12} height={12} fill="#5c3d1e" />
        <Rect x={208} y={108} width={12} height={12} fill="#5c3d1e" />
      </G>
    ),
  },
  {
    kind: 'armchair',
    singular: 'armchair',
    plural: 'armchairs',
    article: 'an',
    w: 120,
    h: 120,
    zones: BACK,
    maxCount: 3,
    colours: [C.red, C.blue, C.green, C.yellow, C.orange, C.pink],
    draw: (colour) => (
      <G stroke="#00000033" strokeWidth={2}>
        <Rect x={18} y={0} width={84} height={70} rx={14} fill={colour} />
        <Rect x={0} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={90} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={26} y={64} width={68} height={38} rx={8} fill={colour} />
        <Rect x={8} y={108} width={10} height={12} fill="#5c3d1e" />
        <Rect x={102} y={108} width={10} height={12} fill="#5c3d1e" />
      </G>
    ),
  },
  {
    kind: 'floor-lamp',
    singular: 'floor lamp',
    plural: 'floor lamps',
    article: 'a',
    w: 80,
    h: 230,
    zones: BACK,
    maxCount: 2,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the lampshades?' : 'What colour was the lampshade?'),
    draw: (colour) => (
      <G>
        <Rect x={36} y={60} width={8} height={160} fill="#495057" />
        <Ellipse cx={40} cy={224} rx={30} ry={6} fill="#495057" />
        <Path d="M14,0 H66 L80,64 H0 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
      </G>
    ),
  },
  {
    kind: 'tv',
    singular: 'television',
    plural: 'televisions',
    article: 'a',
    w: 170,
    h: 140,
    zones: BACK,
    maxCount: 1,
    countable: false,
    draw: () => (
      <G>
        <Rect x={0} y={0} width={170} height={100} rx={6} fill="#212529" />
        <Rect x={8} y={8} width={154} height={84} fill="#4dabf7" />
        <Rect x={20} y={100} width={130} height={40} fill="#8b5a2b" />
      </G>
    ),
  },
  { ...plantPot, zones: BACK, maxCount: 3 },
  {
    kind: 'bookshelf',
    singular: 'bookshelf',
    plural: 'bookshelves',
    article: 'a',
    w: 120,
    h: 200,
    zones: BACK,
    maxCount: 2,
    draw: () => (
      <G>
        <Rect x={0} y={0} width={120} height={200} fill="#8b5a2b" />
        {[0, 1, 2].map((shelf) => (
          <G key={shelf}>
            <Rect x={8} y={8 + shelf * 64} width={104} height={56} fill="#5c3d1e" />
            <Rect x={14} y={20 + shelf * 64} width={14} height={44} fill={['#e63946', '#1d70d6', '#2b9348'][shelf]} />
            <Rect x={30} y={26 + shelf * 64} width={12} height={38} fill="#ffd60a" />
            <Rect x={44} y={18 + shelf * 64} width={16} height={46} fill={['#7b2cbf', '#f77f00', '#e63946'][shelf]} />
          </G>
        ))}
      </G>
    ),
  },
  {
    kind: 'cat',
    singular: 'cat',
    plural: 'cats',
    article: 'a',
    w: 90,
    h: 75,
    zones: FRONT,
    maxCount: 3,
    colours: [C.orange, C.black, C.grey, C.white],
    draw: (colour) => (
      <G stroke="#00000044" strokeWidth={2}>
        <Path d="M72,60 C95,55 92,25 80,20" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Ellipse cx={45} cy={56} rx={32} ry={19} fill={colour} />
        <Circle cx={22} cy={32} r={19} fill={colour} />
        <Path d="M8,22 L8,0 L22,14 Z M36,22 L36,0 L22,14 Z" fill={colour} />
        <Circle cx={15} cy={30} r={3} fill="#111" stroke="none" />
        <Circle cx={29} cy={30} r={3} fill="#111" stroke="none" />
      </G>
    ),
  },
  { ...dog, zones: FRONT, maxCount: 2 },
  { ...ball, zones: FRONT, maxCount: 4 },
  {
    kind: 'cushion',
    singular: 'cushion',
    plural: 'cushions',
    article: 'a',
    w: 75,
    h: 60,
    zones: FRONT,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple, C.orange],
    draw: (colour) => (
      <Path d="M6,6 Q37,14 69,6 Q62,30 69,54 Q37,46 6,54 Q13,30 6,6 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
    ),
  },
  {
    kind: 'teddy',
    singular: 'teddy bear',
    plural: 'teddy bears',
    article: 'a',
    w: 75,
    h: 90,
    zones: FRONT,
    maxCount: 3,
    draw: () => (
      <G fill="#a0612b" stroke="#00000033" strokeWidth={2}>
        <Circle cx={18} cy={12} r={11} />
        <Circle cx={57} cy={12} r={11} />
        <Ellipse cx={37.5} cy={66} rx={26} ry={24} />
        <Circle cx={37.5} cy={30} r={23} />
        <Ellipse cx={37.5} cy={38} rx={10} ry={7} fill="#e9c46a" />
        <Circle cx={29} cy={26} r={3} fill="#111" stroke="none" />
        <Circle cx={46} cy={26} r={3} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'toy-car',
    singular: 'toy car',
    plural: 'toy cars',
    article: 'a',
    w: 85,
    h: 45,
    zones: FRONT,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M2,32 V20 C2,16 6,14 10,14 H22 L32,2 H58 L70,14 H76 C80,14 83,17 83,21 V32 Z" fill={colour} stroke="#00000044" strokeWidth={2} />
        <Circle cx={21} cy={34} r={9} fill="#222" />
        <Circle cx={65} cy={34} r={9} fill="#222" />
      </G>
    ),
  },
  {
    kind: 'books',
    singular: 'pile of books',
    plural: 'piles of books',
    article: 'a',
    w: 90,
    h: 60,
    zones: FRONT,
    maxCount: 3,
    draw: () => (
      <G stroke="#00000033" strokeWidth={2}>
        <Rect x={0} y={40} width={90} height={20} fill="#e63946" />
        <Rect x={8} y={20} width={76} height={20} fill="#1d70d6" />
        <Rect x={4} y={0} width={80} height={20} fill="#2b9348" />
      </G>
    ),
  },
];

function backdrop(wall: string, floor: string, plank: string) {
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={1450} fill={wall} />
      <Rect x={-600} y={830} width={2100} height={20} fill="#ffffff" fillOpacity={0.7} />
      <Rect x={-600} y={850} width={2100} height={1100} fill={floor} />
      <G stroke={plank} strokeWidth={3}>
        {[930, 1030, 1140, 1260, 1390, 1530].map((y) => (
          <Line key={y} x1={-600} y1={y} x2={1500} y2={y} />
        ))}
      </G>
    </G>
  );
}

export const livingRoom: Recipe = {
  id: 'living-room',
  title: 'Living room',
  place: 'in the room',
  zones: [
    { id: 'wall', label: 'On the wall', top: 70, bottom: 560 },
    { id: 'back', label: 'At the back', top: 600, bottom: 1000, ground: true, singleRow: true },
    { id: 'front', label: 'At the front', top: 1060, bottom: 1320, ground: true },
  ],
  items,
  variants: [
    { id: 'cream', background: () => backdrop('#f3e9d2', '#b98b5e', '#a47751') },
    { id: 'blue', background: () => backdrop('#cfe0ec', '#c9a27e', '#b08b68') },
    { id: 'sage', background: () => backdrop('#dce5d1', '#a87f5a', '#8f6a48') },
  ],
};
