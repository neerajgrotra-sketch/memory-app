import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '../colours';
import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { ball, dog, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, Rug, SceneDetails } from '../types';
import type { Rng } from '../random';
import { speckles } from '../texture';

/** Band edges, as fractions of the picture height: a thin ceiling, the wall, then the floor. */
const CEILING = 0.1;
const FLOOR = 0.55;

const WALL = ['wall'];
const FLOOR_ZONE = ['floor'];

/** The rug, shared by the drawing, the contrast rules and placement: things are fully on it or off it. */
const RUG: Rug = { cx: 0.5, cy: 0.8, rx: 0.36, ry: 0.09 };

const items: ItemDef[] = [
  {
    kind: 'frame',
    singular: 'picture frame',
    plural: 'picture frames',
    article: 'a',
    w: 110,
    h: 90,
    tier: 'medium',
    size: 0.14,
    zones: WALL,
    maxCount: 2,
    // At eye level, one per stretch of wall.
    hangAt: 0.34,
    spread: true,
    colours: [C.red, C.blue, C.yellow, C.green, C.black, C.white, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the picture frames?' : 'What colour was the picture frame?'),
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={110} height={90} fill={colour} />
        <G stroke="none">
          {/* A pale mount, then the picture: hills, a lake and the sun, behind glass. */}
          <Rect x={9} y={9} width={92} height={72} fill="#f8f4ea" />
          <Rect x={16} y={16} width={78} height={58} fill="#cfe9ff" />
          <Path d="M16,74 V58 Q34,40 52,56 Q68,44 94,58 V74 Z" fill="#74c69d" />
          <Path d="M16,74 V66 Q50,60 94,68 V74 Z" fill="#5aa9e6" />
          <Circle cx={76} cy={30} r={7} fill="#ffd93b" />
          <Path d="M20,20 L44,20 L24,44 L20,44 Z" fill="#ffffff" fillOpacity={0.4} />
          <Path d="M0,0 H110 L104,6 H6 Z" fill="#ffffff" fillOpacity={0.3} />
          <Path d="M0,90 H110 L104,84 H6 Z" fill="#000000" fillOpacity={0.15} />
        </G>
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
    tier: 'medium',
    // Big enough to read the hands on a phone.
    size: 0.16,
    zones: WALL,
    maxCount: 1,
    // Above everything else on the wall.
    hangAt: 0.52,
    tone: '#343a40',
    countable: false,
    noFlip: true,
    // The time is chosen per picture (see `details`); 10:10 when drawn on its own.
    draw: (_colour, details) => <ClockFace time={details?.values?.clock ?? '10:10'} />,
  },
  {
    kind: 'mirror',
    singular: 'mirror',
    plural: 'mirrors',
    article: 'a',
    w: 90,
    h: 130,
    tier: 'medium',
    size: 0.15,
    zones: WALL,
    maxCount: 1,
    hangAt: 0.36,
    tone: '#b08d57',
    draw: () => (
      <G>
        <Ellipse cx={45} cy={65} rx={43} ry={63} fill="#b08d57" />
        <G stroke="none">
          <Ellipse cx={45} cy={65} rx={38} ry={58} fill="#8a6a3a" fillOpacity={0.5} />
          <Ellipse cx={45} cy={65} rx={33} ry={53} fill="#dbe9f4" />
          {/* The room reflected: a pale wall, then two bright streaks of light. */}
          <Path d="M12,80 Q45,74 78,80 V100 Q45,125 12,100 Z" fill="#c9b79c" fillOpacity={0.5} />
          <Path d="M28,44 L52,18" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
          <Path d="M34,58 L58,32" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.8} />
          <Circle cx={45} cy={4} r={4} fill="#d9b779" />
        </G>
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
    tier: 'large',
    size: 0.22,
    zones: WALL,
    hangAt: 0.36,
    // One window: two would end up one above the other on a single wall.
    maxCount: 1,
    tone: '#5aa9e6',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={150} height={175} fill="#ffffff" />
        <G fill="#5aa9e6" stroke="none">
          <Rect x={11} y={11} width={58} height={71} />
          <Rect x={81} y={11} width={58} height={71} />
          <Rect x={11} y={94} width={58} height={70} />
          <Rect x={81} y={94} width={58} height={70} />
        </G>
        <G stroke="none">
          {/* Sky getting lighter towards the bottom, a cloud, a far hill, glints on the glass, and a sill. */}
          <Rect x={11} y={94} width={128} height={70} fill="#ffffff" fillOpacity={0.18} />
          <Path d="M90,46 Q96,36 106,40 Q114,32 124,40 Q134,40 132,50 H92 Q86,50 90,46 Z" fill="#ffffff" fillOpacity={0.9} />
          <Path d="M11,150 Q40,132 69,144 V164 H11 Z M81,146 Q110,130 139,142 V164 H81 Z" fill="#74c69d" />
          <Path d="M16,30 L34,14 M86,30 L104,14" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
          <Rect x={-6} y={168} width={162} height={7} rx={2} fill="#e9ecef" />
        </G>
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
    tier: 'xl',
    size: 0.44,
    wide: true,
    backRow: true,
    zones: FLOOR_ZONE,
    maxCount: 1,
    avoidRug: true,
    colours: [C.red, C.blue, C.green, C.grey, C.yellow, C.purple, C.brown],
    draw: (colour) => (
      <G>
        <Rect x={20} y={0} width={190} height={70} rx={16} fill={colour} />
        <Rect x={0} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={190} y={40} width={40} height={70} rx={12} fill={colour} />
        <Rect x={30} y={62} width={170} height={40} rx={8} fill={colour} />
        <G stroke="none">
          {/* Two back cushions and two seat cushions, a little shade under the seat, light along the top. */}
          <Path d="M115,8 V58 M115,66 V98" stroke="#000000" strokeOpacity={0.18} strokeWidth={3} />
          <Rect x={30} y={96} width={170} height={8} fill="#000000" fillOpacity={0.15} />
          <Path d="M36,6 H194 Q206,6 206,16 H24 Q24,6 36,6 Z" fill="#ffffff" fillOpacity={0.25} />
          <Path d="M34,66 H196 V72 H34 Z" fill="#ffffff" fillOpacity={0.2} />
          <Rect x={4} y={44} width={10} height={60} rx={5} fill="#ffffff" fillOpacity={0.15} />
          <Rect x={10} y={108} width={12} height={12} fill="#5c3d1e" />
          <Rect x={208} y={108} width={12} height={12} fill="#5c3d1e" />
        </G>
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
    tier: 'large',
    size: 0.2,
    zones: FLOOR_ZONE,
    maxCount: 2,
    backRow: true,
    spread: true,
    avoidRug: true,
    colours: [C.red, C.blue, C.green, C.yellow, C.orange, C.pink],
    draw: (colour) => (
      <G>
        <Rect x={18} y={0} width={84} height={70} rx={14} fill={colour} />
        <Rect x={0} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={90} y={42} width={30} height={66} rx={10} fill={colour} />
        <Rect x={26} y={64} width={68} height={38} rx={8} fill={colour} />
        <G stroke="none">
          {/* Buttons on the back, a seat cushion, light along the top, shade under the seat. */}
          <Circle cx={42} cy={30} r={3} fill="#000000" fillOpacity={0.2} />
          <Circle cx={60} cy={22} r={3} fill="#000000" fillOpacity={0.2} />
          <Circle cx={78} cy={30} r={3} fill="#000000" fillOpacity={0.2} />
          <Path d="M30,4 H90 Q100,4 100,14 H20 Q20,4 30,4 Z" fill="#ffffff" fillOpacity={0.25} />
          <Rect x={26} y={96} width={68} height={8} fill="#000000" fillOpacity={0.15} />
          <Rect x={30} y={68} width={60} height={6} rx={3} fill="#ffffff" fillOpacity={0.2} />
          <Rect x={8} y={108} width={10} height={12} fill="#5c3d1e" />
          <Rect x={102} y={108} width={10} height={12} fill="#5c3d1e" />
        </G>
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
    tier: 'medium',
    size: 0.13,
    tall: true,
    spread: true,
    zones: FLOOR_ZONE,
    maxCount: 2,
    avoidRug: true,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the lampshades?' : 'What colour was the lampshade?'),
    draw: (colour) => (
      <G>
        {/* A warm glow under the shade. */}
        <Ellipse cx={40} cy={74} rx={34} ry={12} fill="#fff3bf" fillOpacity={0.7} stroke="none" />
        <Rect x={36} y={60} width={8} height={160} fill="#495057" stroke="none" />
        <Rect x={34} y={120} width={12} height={6} rx={2} fill="#343a40" stroke="none" />
        <Ellipse cx={40} cy={224} rx={30} ry={6} fill="#495057" stroke="none" />
        <Path d="M14,0 H66 L80,64 H0 Z" fill={colour} />
        <G stroke="none">
          <Path d="M12,8 H68 L69,12 H11 Z M3,52 H77 L78,57 H2 Z" fill="#000000" fillOpacity={0.15} />
          <Path d="M18,4 L10,60 H20 L26,4 Z" fill="#ffffff" fillOpacity={0.3} />
        </G>
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
    tier: 'large',
    size: 0.28,
    zones: FLOOR_ZONE,
    maxCount: 1,
    backRow: true,
    avoidRug: true,
    tone: '#212529',
    countable: false,
    draw: () => (
      <G>
        <Rect x={20} y={100} width={130} height={40} fill="#8b5a2b" stroke="#4a2f16" />
        <G stroke="none">
          {/* Two cupboard doors with knobs. */}
          <Path d="M85,104 V136" stroke="#4a2f16" strokeWidth={2} />
          <Circle cx={78} cy={120} r={3} fill="#e9c46a" />
          <Circle cx={92} cy={120} r={3} fill="#e9c46a" />
        </G>
        <Rect x={0} y={0} width={170} height={100} rx={6} fill="#212529" />
        <Rect x={8} y={8} width={154} height={84} fill="#4dabf7" stroke="none" />
        <G stroke="none">
          {/* A cartoon on the screen: hills and the sun, then a glare across the glass. */}
          <Path d="M8,92 V66 Q46,44 86,64 Q120,48 162,62 V92 Z" fill="#74c69d" />
          <Circle cx={128} cy={30} r={11} fill="#ffd93b" />
          <Path d="M14,12 L60,12 L24,60 L14,60 Z" fill="#ffffff" fillOpacity={0.18} />
          <Circle cx={160} cy={95} r={2} fill="#ff6b6b" />
        </G>
      </G>
    ),
  },
  // Plants stand along the wall, never out in the room or on the rug.
  { ...plantPot, zones: FLOOR_ZONE, maxCount: 3, avoidRug: true, backRow: true, spread: true },
  {
    kind: 'bookshelf',
    singular: 'bookshelf',
    plural: 'bookshelves',
    article: 'a',
    w: 120,
    h: 200,
    tier: 'large',
    size: 0.2,
    tall: true,
    spread: true,
    zones: FLOOR_ZONE,
    maxCount: 2,
    avoidRug: true,
    tone: '#8b5a2b',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={120} height={200} fill="#8b5a2b" />
        <G stroke="none">
          {[0, 1, 2].map((shelf) => (
            <G key={shelf}>
              <Rect x={8} y={8 + shelf * 64} width={104} height={56} fill="#5c3d1e" />
              <Rect x={14} y={20 + shelf * 64} width={14} height={44} fill={['#e63946', '#1d70d6', '#2b9348'][shelf]} />
              <Rect x={30} y={26 + shelf * 64} width={12} height={38} fill="#ffd60a" />
              <Rect x={44} y={18 + shelf * 64} width={16} height={46} fill={['#7b2cbf', '#f77f00', '#e63946'][shelf]} />
              <Rect x={62} y={24 + shelf * 64} width={10} height={40} fill={['#2b9348', '#e63946', '#1d70d6'][shelf]} />
              {/* A leaning book, then spine bands and a shelf edge catching the light. */}
              <Path d={`M76,${64 + shelf * 64} L92,${30 + shelf * 64} L102,${34 + shelf * 64} L86,${64 + shelf * 64} Z`} fill={['#f77f00', '#7b2cbf', '#ffd60a'][shelf]} />
              <Path d={`M14,${28 + shelf * 64} H28 M30,${34 + shelf * 64} H42 M44,${26 + shelf * 64} H60 M62,${32 + shelf * 64} H72`} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
              <Rect x={8} y={64 + shelf * 64} width={104} height={4} fill="#ffffff" fillOpacity={0.15} />
            </G>
          ))}
          <Path d="M0,0 H6 V200 H0 Z" fill="#ffffff" fillOpacity={0.15} />
        </G>
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
    tier: 'small',
    size: 0.12,
    zones: FLOOR_ZONE,
    maxCount: 3,
    colours: [C.orange, C.black, C.grey, C.white],
    draw: (colour) => (
      <G>
        <Path d="M72,60 C95,55 92,25 80,20" fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Ellipse cx={45} cy={56} rx={32} ry={19} fill={colour} />
        <Circle cx={22} cy={32} r={19} fill={colour} />
        <Path d="M8,22 L8,0 L22,14 Z M36,22 L36,0 L22,14 Z" fill={colour} />
        <G stroke="none">
          {/* Tabby stripes, pink ears, green eyes, a nose and whiskers. */}
          <Path d="M40,40 Q44,48 40,56 M52,40 Q56,48 52,58 M64,44 Q66,50 64,58" fill="none" stroke="#000000" strokeOpacity={0.18} strokeWidth={4} strokeLinecap="round" />
          <Path d="M11,18 L11,6 L19,14 Z M33,18 L33,6 L25,14 Z" fill="#ffadc6" />
          <Ellipse cx={15} cy={30} rx={3.5} ry={4} fill="#8ac926" />
          <Ellipse cx={29} cy={30} rx={3.5} ry={4} fill="#8ac926" />
          <Ellipse cx={15} cy={30} rx={1.3} ry={3} fill="#111" />
          <Ellipse cx={29} cy={30} rx={1.3} ry={3} fill="#111" />
          <Path d="M20,37 H24 L22,40 Z" fill="#e5737a" />
          <Path d="M18,40 L2,37 M18,42 L3,44 M26,40 L42,37 M26,42 L41,44" stroke="#495057" strokeOpacity={0.6} strokeWidth={1.2} />
        </G>
      </G>
    ),
  },
  { ...dog, zones: FLOOR_ZONE, maxCount: 2 },
  { ...ball, zones: FLOOR_ZONE, maxCount: 3 },
  {
    kind: 'cushion',
    singular: 'cushion',
    plural: 'cushions',
    article: 'a',
    w: 75,
    h: 60,
    tier: 'medium',
    size: 0.13,
    zones: FLOOR_ZONE,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M6,6 Q37,14 69,6 Q62,30 69,54 Q37,46 6,54 Q13,30 6,6 Z" fill={colour} />
        <G stroke="none">
          {/* Seams to a button in the middle, and a soft highlight. */}
          <Path d="M10,10 L37,30 L65,10 M10,50 L37,30 L65,50" fill="none" stroke="#000000" strokeOpacity={0.14} strokeWidth={2} />
          <Circle cx={37.5} cy={30} r={4} fill="#000000" fillOpacity={0.2} />
          <Ellipse cx={24} cy={18} rx={10} ry={5} fill="#ffffff" fillOpacity={0.3} />
        </G>
      </G>
    ),
  },
  {
    kind: 'teddy',
    singular: 'teddy bear',
    plural: 'teddy bears',
    article: 'a',
    w: 75,
    h: 90,
    tier: 'small',
    size: 0.11,
    zones: FLOOR_ZONE,
    maxCount: 3,
    tone: '#a0612b',
    draw: () => (
      <G fill="#a0612b">
        <Circle cx={18} cy={12} r={11} />
        <Circle cx={57} cy={12} r={11} />
        <Ellipse cx={37.5} cy={66} rx={26} ry={24} />
        <Circle cx={37.5} cy={30} r={23} />
        <G stroke="none">
          {/* Inner ears, a muzzle with a nose and smile, a tummy patch, paws and a red bow. */}
          <Circle cx={18} cy={12} r={5} fill="#e9c46a" />
          <Circle cx={57} cy={12} r={5} fill="#e9c46a" />
          <Ellipse cx={37.5} cy={70} rx={14} ry={13} fill="#e9c46a" fillOpacity={0.8} />
          <Ellipse cx={37.5} cy={38} rx={11} ry={8} fill="#e9c46a" />
          <Ellipse cx={37.5} cy={35} rx={4} ry={3} fill="#3d2412" />
          <Path d="M33,41 Q37.5,45 42,41" fill="none" stroke="#3d2412" strokeWidth={1.5} />
          <Circle cx={29} cy={26} r={3} fill="#111" />
          <Circle cx={46} cy={26} r={3} fill="#111" />
          <Circle cx={30} cy={25} r={1} fill="#ffffff" />
          <Circle cx={47} cy={25} r={1} fill="#ffffff" />
          <Ellipse cx={22} cy={86} rx={8} ry={4} fill="#e9c46a" />
          <Ellipse cx={53} cy={86} rx={8} ry={4} fill="#e9c46a" />
          <Path d="M37.5,52 L26,46 V58 Z M37.5,52 L49,46 V58 Z" fill="#e63946" />
          <Circle cx={37.5} cy={52} r={3} fill="#c1121f" />
        </G>
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
    tier: 'small',
    size: 0.11,
    zones: FLOOR_ZONE,
    maxCount: 4,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M2,32 V20 C2,16 6,14 10,14 H22 L32,2 H58 L70,14 H76 C80,14 83,17 83,21 V32 Z" fill={colour} />
        <G stroke="none">
          {/* Windows, a headlight, a stripe of light along the side, and hubcaps. */}
          <Path d="M27,14 L35,5 H43 V14 Z M47,14 V5 H56 L64,14 Z" fill="#cfe9ff" />
          <Rect x={76} y={18} width={6} height={5} rx={2} fill="#fff3bf" />
          <Rect x={2} y={20} width={4} height={5} rx={1} fill="#e63946" />
          <Path d="M8,18 H78" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2.5} />
          <Circle cx={21} cy={34} r={9} fill="#222" />
          <Circle cx={65} cy={34} r={9} fill="#222" />
          <Circle cx={21} cy={34} r={3.5} fill="#adb5bd" />
          <Circle cx={65} cy={34} r={3.5} fill="#adb5bd" />
        </G>
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
    tier: 'small',
    size: 0.12,
    zones: FLOOR_ZONE,
    maxCount: 3,
    tone: '#1d70d6',
    avoidRug: true,
    draw: () => (
      <G>
        <Rect x={0} y={40} width={90} height={20} fill="#e63946" />
        <Rect x={8} y={20} width={76} height={20} fill="#1d70d6" />
        <Rect x={4} y={0} width={80} height={20} fill="#2b9348" />
        <G stroke="none">
          {/* Page edges on one side, a band on each spine. */}
          <Rect x={80} y={43} width={8} height={14} fill="#f8f4ea" />
          <Rect x={10} y={23} width={6} height={14} fill="#f8f4ea" />
          <Rect x={76} y={3} width={6} height={14} fill="#f8f4ea" />
          <Path d="M14,40 V60 M22,20 V40 M18,0 V20" stroke="#ffd60a" strokeWidth={3} />
          <Path d="M0,40 H90 V44 H0 Z M8,20 H84 V24 H8 Z M4,0 H84 V4 H4 Z" fill="#ffffff" fillOpacity={0.25} />
        </G>
      </G>
    ),
  },
];

type Palette = Record<'wall' | 'ceiling' | 'floor' | 'plank' | 'rug' | 'rugEdge', string>;

/** Background bands: ceiling, wall, skirting, floor and the rug. Floorboards are faint marks drawn around the things. */
function backdrop(height: number, { wall, ceiling, floor, rug, rugEdge }: Palette) {
  const ceilingLine = height * CEILING;
  const floorLine = height * FLOOR;
  const rug0 = { cx: RUG.cx * 900, cy: RUG.cy * height, rx: RUG.rx * 900, ry: RUG.ry * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceilingLine + 600} fill={ceiling} />
      <Rect x={-600} y={ceilingLine} width={2100} height={floorLine - ceilingLine} fill={wall} />
      {/* Faint wallpaper stripes and a cornice along the ceiling. */}
      <G fill="#000000" fillOpacity={0.035}>
        {Array.from({ length: 24 }, (_, i) => (
          <Rect key={i} x={-600 + i * 90} y={ceilingLine} width={30} height={floorLine - ceilingLine} />
        ))}
      </G>
      <Rect x={-600} y={ceilingLine} width={2100} height={10} fill="#000000" fillOpacity={0.06} />
      <Rect x={-600} y={ceilingLine - 6} width={2100} height={6} fill="#ffffff" fillOpacity={0.6} />
      <Rect x={-600} y={floorLine} width={2100} height={height - floorLine + 600} fill={floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: floorLine, x1: 940, y1: height }, 140, '#000000', 0.05, 3)}
      <Rect x={-600} y={floorLine - 14} width={2100} height={14} fill="#ffffff" fillOpacity={0.7} />
      <Rect x={-600} y={floorLine} width={2100} height={6} fill="#000000" fillOpacity={0.08} />
      {/* The rug: a border, an inner ring and a tassel fringe at each end. */}
      <Ellipse cx={rug0.cx} cy={rug0.cy} rx={rug0.rx} ry={rug0.ry} fill={rug} stroke={rugEdge} strokeOpacity={0.35} strokeWidth={8} />
      <Ellipse cx={rug0.cx} cy={rug0.cy} rx={rug0.rx * 0.84} ry={rug0.ry * 0.76} fill="none" stroke={rugEdge} strokeOpacity={0.18} strokeWidth={4} />
      <Ellipse cx={rug0.cx} cy={rug0.cy} rx={rug0.rx * 0.4} ry={rug0.ry * 0.34} fill="none" stroke={rugEdge} strokeOpacity={0.12} strokeWidth={3} />
      <G stroke={rugEdge} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round">
        {Array.from({ length: 6 }, (_, i) => (
          <G key={i}>
            <Path d={`M${rug0.cx - rug0.rx - 4},${rug0.cy - 15 + i * 6} h-12`} />
            <Path d={`M${rug0.cx + rug0.rx + 4},${rug0.cy - 15 + i * 6} h12`} />
          </G>
        ))}
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: { palette: Record<string, string> }): Mark[] {
  // Floorboard lines, broken around anything standing on them and kept off the rug.
  const rugTop = (RUG.cy - RUG.ry) * height - 10;
  const rugBottom = (RUG.cy + RUG.ry) * height + 10;
  return [0.62, 0.69, 0.93].flatMap((f) => {
    const y = f * height;
    const rugBlock = y > rugTop && y < rugBottom ? [{ x0: (RUG.cx - RUG.rx) * 900, y0: rugTop, x1: (RUG.cx + RUG.rx) * 900, y1: rugBottom }] : [];
    return lineMarks(y, -600, 1500, [...boxes, ...rugBlock], variant.palette.plank, 3, 0.3);
  });
}

/** Light oak floors so brown pets and teddies stand out; pale solid rugs so every toy colour shows on them. */
const PALETTES: Record<string, Palette> = {
  cream: { wall: '#f3e9d2', ceiling: '#faf6ec', floor: '#d9b98c', plank: '#8a6a43', rug: '#e4ecf4', rugEdge: '#3d5a80' },
  blue: { wall: '#cfe0ec', ceiling: '#eef4f8', floor: '#d4b48c', plank: '#86663f', rug: '#f6efe0', rugEdge: '#9c6644' },
  sage: { wall: '#dce5d1', ceiling: '#f1f5ec', floor: '#c9a47a', plank: '#7d5d38', rug: '#f4e6ea', rugEdge: '#9d4e6a' },
};

/** The time on the clock: something to remember whenever the clock is in the picture, on every level. */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  return {
    values: { clock: time },
    facts: [{ id: 'clock-time', type: 'number', prompt: 'What time was on the clock?', answer: time, wrong: close, fallback: other, needs: 'wall-clock', everyLevel: true, spotlight: true }],
  };
}

function surfaceAt(x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR) return 'wall';
  return ((x - RUG.cx) / RUG.rx) ** 2 + ((y - RUG.cy) / RUG.ry) ** 2 <= 1 ? 'rug' : 'floor';
}

export const livingRoom: Recipe = {
  id: 'living-room',
  title: 'Living room',
  details,
  zones: [
    { id: 'ceiling', label: 'On the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    // Things on the wall hang on two lines: a clock high up (top row of slots), the rest at eye level.
    { id: 'wall', label: 'On the wall', surface: 'wall', top: CEILING, bottom: FLOOR, rows: 2, minGroups: 2 },
    // A deeper back row for furniture against the wall, then two rows for things out on the floor.
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR, bottom: 1, rows: 3, rowSizes: [0.4, 0.3, 0.3], anchors: 2 },
  ],
  items,
  rug: RUG,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Light from above on the wall.
    { top: CEILING, bottom: FLOOR, from: ['#ffffff', 0.12], to: ['#000000', 0.06] },
    // Shade where the floor meets the wall.
    { top: FLOOR, bottom: 1, from: ['#000000', 0.12], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number) => backdrop(h, p) })),
};
