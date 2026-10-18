import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import type { ItemDef } from '../types';

/**
 * Things that turn up in several settings. Each recipe sets which bands they may go in and may
 * adjust counts. Shapes without their own stroke get the thing's outline; details use `stroke="none"`.
 */
type CommonItem = Omit<ItemDef, 'zones' | 'maxCount'>;

export const sun: CommonItem = {
  kind: 'sun',
  singular: 'sun',
  plural: 'suns',
  article: 'the',
  w: 140,
  h: 140,
  tier: 'medium',
  size: 0.16,
  tone: '#ffd93b',
  countable: false,
  still: true,
  draw: () => (
    <G>
      <Circle cx={70} cy={70} r={69} fill="#ffe066" fillOpacity={0.35} stroke="none" />
      <Circle cx={70} cy={70} r={60} fill="#ffd93b" />
      <Circle cx={52} cy={50} r={20} fill="#ffffff" fillOpacity={0.3} stroke="none" />
    </G>
  ),
};

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
  // A gull in flight: wings that taper to the tips.
  draw: () => <Path d="M2,13 Q17,-1 30,15 Q43,-1 58,13 Q44,6 30,22 Q16,6 2,13 Z" fill="#222222" stroke="none" />,
};

/** A faint cloud for a recipe's backdrop marks: never asked about. Drawn in a 170 × 75 box. */
export const cloudShape = (x: number, y: number, scale: number) => (
  <G transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff">
    <Ellipse cx={85} cy={50} rx={80} ry={25} />
    <Ellipse cx={110} cy={32} rx={45} ry={28} />
    <Ellipse cx={60} cy={36} rx={38} ry={24} />
    {/* Soft blue-grey shading along the bottom. */}
    <Path d="M14,58 Q85,80 160,58 Q140,74 85,75 Q30,74 14,58 Z" fill="#c9dcef" fillOpacity={0.7} />
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
      <G stroke="none">
        {/* Light and dark gores, a band round the middle, and a highlight. */}
        <Path d="M45,1 C33,25 32,62 38,95 H45 Z" fill="#ffffff" fillOpacity={0.45} />
        <Path d="M45,1 C70,15 76,55 58,95 H52 C62,60 60,22 45,1 Z" fill="#000000" fillOpacity={0.12} />
        <Path d="M6,58 Q45,70 84,58 L80,66 Q45,78 10,66 Z" fill="#ffffff" fillOpacity={0.55} />
        <Ellipse cx={30} cy={24} rx={8} ry={12} fill="#ffffff" fillOpacity={0.35} />
      </G>
      <Path d="M33,96 L36,112 M57,96 L54,112 M45,96 V112" stroke="#555" strokeWidth={2} />
      <Rect x={32} y={110} width={26} height={22} rx={3} fill="#8b5a2b" />
      <Path d="M34,117 H56 M34,124 H56 M40,112 V130 M50,112 V130" stroke="#5c3a1b" strokeWidth={1.5} strokeOpacity={0.7} />
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
      <G stroke="none">
        <Polygon points="40,0 78,45 40,45" fill="#000000" fillOpacity={0.14} />
        <Polygon points="40,45 2,45 40,105" fill="#000000" fillOpacity={0.14} />
        <Polygon points="40,4 10,44 22,44" fill="#ffffff" fillOpacity={0.3} />
      </G>
      <Line x1={40} y1={0} x2={40} y2={105} stroke="#00000066" strokeWidth={2.5} />
      <Line x1={2} y1={45} x2={78} y2={45} stroke="#00000066" strokeWidth={2.5} />
      <Path d="M40,105 C55,125 25,140 45,160" fill="none" stroke="#333" strokeWidth={2.5} />
      <G fill={colour} stroke="none">
        <Path d="M44,118 l-9,-5 v10 Z M44,118 l9,-5 v10 Z" />
        <Path d="M36,140 l-9,-5 v10 Z M36,140 l9,-5 v10 Z" />
      </G>
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

/** Skin tones and hair colours for people, so a crowd isn't all one person. */
export const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
export const HAIR = ['#4a2c17', '#1c1c1c', '#a0522d', '#d9b26f'];

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
  // Skin, hair colour and hairstyle vary per person (fixed for each copy); only the shirt is asked about.
  draw: (colour, _details, copy = 0) => {
    const skin = SKINS[copy % SKINS.length];
    const hair = HAIR[Math.floor(copy / 4) % HAIR.length];
    const style = Math.floor(copy / 16) % 3;
    return (
      <G>
        {/* Long hair falls behind the head and shoulders. */}
        {style === 1 && <Path d="M15,16 C15,-2 49,-2 49,16 L51,40 Q32,46 13,40 Z" fill={hair} stroke="none" />}
        <Rect x={20} y={80} width={10} height={45} rx={4} fill="#343a40" stroke="none" />
        <Rect x={34} y={80} width={10} height={45} rx={4} fill="#343a40" stroke="none" />
        <Rect x={4} y={36} width={11} height={40} rx={5} fill={colour} />
        <Rect x={49} y={36} width={11} height={40} rx={5} fill={colour} />
        <Circle cx={9.5} cy={78} r={5} fill={skin} stroke="none" />
        <Circle cx={54.5} cy={78} r={5} fill={skin} stroke="none" />
        <Rect x={13} y={32} width={38} height={52} rx={10} fill={colour} />
        {/* Shoes, a collar, and a face: eyes and a smile. */}
        <Rect x={17} y={119} width={15} height={6} rx={3} fill="#212529" stroke="none" />
        <Rect x={32} y={119} width={15} height={6} rx={3} fill="#212529" stroke="none" />
        <Path d="M24,32 L32,40 L40,32" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2.5} strokeLinejoin="round" />
        <Circle cx={32} cy={16} r={15} fill={skin} stroke="none" />
        <Path d="M17,14 C19,0 45,0 47,14 C39,8 25,8 17,14 Z" fill={hair} stroke="none" />
        {style === 2 && <Circle cx={32} cy={2} r={6} fill={hair} stroke="none" />}
        <G stroke="none" fill="#2b2b2b">
          <Circle cx={26.5} cy={17} r={1.8} />
          <Circle cx={37.5} cy={17} r={1.8} />
        </G>
        <Path d="M27,23 Q32,27 37,23" fill="none" stroke="#7a3e2a" strokeWidth={1.6} strokeLinecap="round" />
      </G>
    );
  },
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
      <G stroke="none">
        {/* A darker ear, a red collar with a tag, an eye with a glint and a nose. */}
        <Ellipse cx={92} cy={18} rx={5} ry={10} fill="#000000" fillOpacity={0.18} transform="rotate(25 92 18)" />
        <Path d="M66,30 Q74,44 88,42 L86,47 Q71,49 62,35 Z" fill="#e63946" />
        <Circle cx={78} cy={48} r={3} fill="#ffd60a" />
        <Circle cx={84} cy={22} r={3} fill="#111" />
        <Circle cx={85} cy={21} r={1} fill="#ffffff" />
        <Circle cx={97} cy={30} r={4} fill="#111" />
        <Path d="M30,30 Q45,26 60,32" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />
      </G>
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
  // Stands on the pavement without rising in front of the buildings; two are spread apart.
  spread: true,
  tone: '#2f8f3a',
  draw: () => (
    <G>
      <Path d="M50,200 V112 L62,104 L72,112 V200 Z" fill="#7a4a2a" />
      <Path d="M61,140 L80,118" stroke="#7a4a2a" strokeWidth={6} strokeLinecap="round" />
      <Circle cx={60} cy={70} r={55} fill="#2f8f3a" />
      <Circle cx={30} cy={100} r={32} fill="#2f8f3a" />
      <Circle cx={92} cy={100} r={32} fill="#2f8f3a" />
      <G stroke="none">
        {/* Darker leaves underneath, lighter clumps where the sun catches. */}
        <Path d="M2,104 Q30,138 60,118 Q90,138 118,104 Q100,128 60,126 Q20,128 2,104 Z" fill="#1f6b2a" fillOpacity={0.55} />
        <Circle cx={44} cy={46} r={18} fill="#56b45f" fillOpacity={0.7} />
        <Circle cx={76} cy={36} r={12} fill="#56b45f" fillOpacity={0.6} />
        <Circle cx={22} cy={90} r={10} fill="#56b45f" fillOpacity={0.5} />
      </G>
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
      <G stroke="none">
        <Path d="M40,62 C20,40 5,30 8,8 C25,15 35,35 40,62 Z" fill="#2b9348" />
        <Path d="M40,62 C60,40 75,30 72,8 C55,15 45,35 40,62 Z" fill="#40a85a" />
        <Path d="M40,62 C38,35 40,15 40,0 C46,20 46,40 40,62 Z" fill="#2b9348" />
        <Path d="M40,62 C28,48 16,46 2,38 C16,34 30,40 40,62 Z" fill="#40a85a" />
        <Path d="M40,62 C52,48 64,46 78,38 C64,34 50,40 40,62 Z" fill="#2b9348" />
        <Path d="M12,14 Q24,30 38,58 M68,14 Q56,30 42,58" fill="none" stroke="#1f6b2a" strokeWidth={1.5} strokeOpacity={0.6} />
      </G>
      <Path d="M14,66 H66 L58,110 H22 Z" fill={colour} />
      <Rect x={10} y={58} width={60} height={12} rx={3} fill={colour} />
      <G stroke="none">
        <Rect x={13} y={59} width={54} height={4} rx={2} fill="#5c3a1b" />
        <Path d="M20,72 L26,106 H32 L27,72 Z" fill="#ffffff" fillOpacity={0.3} />
      </G>
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
      <G stroke="none">
        <Path d="M3,24 C16,34 39,34 52,24 L52,31 C39,41 16,41 3,31 Z" fill="#ffffff" />
        <Path d="M27.5,1.5 A26,26 0 0 1 53.5,27.5 A26,26 0 0 1 27.5,53.5 A20,26 0 0 0 27.5,1.5 Z" fill="#000000" fillOpacity={0.12} />
        <Ellipse cx={17} cy={14} rx={7} ry={4.5} fill="#ffffff" fillOpacity={0.6} transform="rotate(-30 17 14)" />
      </G>
    </G>
  ),
};

export const dolphin: CommonItem = {
  kind: 'dolphin',
  singular: 'dolphin',
  plural: 'dolphins',
  article: 'a',
  w: 130,
  h: 75,
  tier: 'medium',
  size: 0.16,
  tone: '#ced4da',
  draw: () => (
    <G>
      <Polygon points="62,14 75,0 80,18" fill="#adb5bd" />
      <Polygon points="8,62 0,50 16,56" fill="#adb5bd" />
      <Path d="M8,62 C20,15 85,2 118,30 C108,30 100,36 98,40 C80,22 40,25 22,62 Z" fill="#ced4da" />
      <G stroke="none">
        {/* A pale belly, a flipper, an eye and a smile. */}
        <Path d="M22,62 C40,25 80,22 98,40 C80,32 46,36 26,60 Z" fill="#f1f3f5" />
        <Path d="M58,38 L52,54 L66,42 Z" fill="#adb5bd" />
        <Path d="M30,30 C50,14 80,12 100,24" fill="none" stroke="#ffffff" strokeWidth={3} strokeOpacity={0.6} />
        <Circle cx={104} cy={29} r={3.2} fill="#222" />
        <Circle cx={105} cy={28} r={1} fill="#ffffff" />
        <Path d="M110,35 Q104,38 99,37" fill="none" stroke="#495057" strokeWidth={1.5} />
      </G>
    </G>
  ),
};

export const crab: CommonItem = {
  kind: 'crab',
  singular: 'crab',
  plural: 'crabs',
  article: 'a',
  w: 80,
  h: 50,
  tier: 'small',
  size: 0.12,
  tone: '#e63946',
  draw: () => (
    <G>
      <G stroke="#9d0208" strokeWidth={4} strokeLinecap="round" fill="none">
        <Line x1={22} y1={34} x2={8} y2={46} />
        <Line x1={28} y1={38} x2={20} y2={50} />
        <Line x1={58} y1={34} x2={72} y2={46} />
        <Line x1={52} y1={38} x2={60} y2={50} />
        <Path d="M20,24 C10,20 6,10 10,6" />
        <Path d="M60,24 C70,20 74,10 70,6" />
        <Path d="M34,18 V10 M46,18 V10" strokeWidth={2.5} />
      </G>
      <Ellipse cx={40} cy={30} rx={24} ry={15} fill="#e63946" />
      {/* Pincers: each claw open like a V. */}
      <Path d="M4,8 Q4,0 12,0 Q18,2 16,8 L10,6 Z" fill="#e63946" />
      <Path d="M76,8 Q76,0 68,0 Q62,2 64,8 L70,6 Z" fill="#e63946" />
      <G stroke="none">
        <Path d="M20,26 Q40,14 60,26 Q40,20 20,26 Z" fill="#ffffff" fillOpacity={0.35} />
        <Circle cx={32} cy={34} r={2} fill="#9d0208" fillOpacity={0.5} />
        <Circle cx={48} cy={34} r={2} fill="#9d0208" fillOpacity={0.5} />
        <Circle cx={40} cy={38} r={2} fill="#9d0208" fillOpacity={0.5} />
        <Circle cx={34} cy={9} r={3.5} fill="#111" />
        <Circle cx={46} cy={9} r={3.5} fill="#111" />
        <Circle cx={35} cy={8} r={1} fill="#ffffff" />
        <Circle cx={47} cy={8} r={1} fill="#ffffff" />
      </G>
    </G>
  ),
};

export const starfish: CommonItem = {
  kind: 'starfish',
  singular: 'starfish',
  plural: 'starfish',
  article: 'a',
  w: 55,
  h: 55,
  tier: 'small',
  size: 0.1,
  colours: [C.orange, C.pink, C.red, C.purple],
  draw: (colour) => (
    <G>
      <Path
        d="M27.5,2 Q30,2 33,17 Q34,19 37,19 Q53,18 53,21 Q53,23 40,31 Q38,33 39,36 Q44,51 41,52 Q39,53 29,42 Q27.5,40 26,42 Q16,53 14,52 Q11,51 16,36 Q17,33 15,31 Q2,23 2,21 Q2,18 18,19 Q21,19 22,17 Q25,2 27.5,2 Z"
        fill={colour}
      />
      <G fill="#ffffff" fillOpacity={0.5} stroke="none">
        <Circle cx={27.5} cy={12} r={1.6} />
        <Circle cx={27.5} cy={20} r={1.6} />
        <Circle cx={42} cy={23} r={1.6} />
        <Circle cx={13} cy={23} r={1.6} />
        <Circle cx={36} cy={39} r={1.6} />
        <Circle cx={19} cy={39} r={1.6} />
        <Circle cx={27.5} cy={28} r={2.4} />
      </G>
    </G>
  ),
};
