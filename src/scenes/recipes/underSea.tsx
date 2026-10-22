import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { crab, dolphin, starfish } from '../items/common';
import { scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { glints, speckles } from '../texture';

/**
 * Under the sea: a sliver of sky above the wavy surface, the water near the surface (where the whale and
 * dolphins come up to breathe), the open water, and the sandy seabed with a treasure chest in one corner.
 */

/** Band edges, as fractions of the picture height. */
const SURFACE = 0.05;
const TOP = 0.3;
const SEABED = 0.64;

const TOP_Z = ['top'];
const OPEN_Z = ['open'];
const BED_Z = ['bed'];

/** The treasure chest sits in a bottom corner of the seabed, kept clear. Fractions of width and height. */
const CHEST = { w: 0.22, h: 0.12, bottom: 0.985 };
const chestRect = (side: string) => {
  const x0 = side === 'left' ? 0.04 : 1 - 0.04 - CHEST.w;
  return { x0, x1: x0 + CHEST.w, y0: CHEST.bottom - CHEST.h, y1: CHEST.bottom };
};

const items: ItemDef[] = [
  // Near the surface: things that breathe air, or drift.
  {
    kind: 'whale',
    singular: 'whale',
    plural: 'whales',
    article: 'a',
    w: 240,
    h: 110,
    tier: 'xl',
    size: 0.42,
    wide: true,
    zones: TOP_Z,
    maxCount: 1,
    countable: false,
    tone: '#3d5a80',
    draw: () => (
      <G>
        <Path d="M20,52 L0,22 L10,20 L34,44 L14,76 L4,70 Z" fill="#3d5a80" />
        <Path d="M30,50 C40,20 120,10 190,20 C225,26 240,48 238,66 C236,88 210,100 170,100 C110,102 60,90 30,50 Z" fill="#3d5a80" />
        <Path d="M120,98 C150,104 190,104 214,92 C200,84 160,84 120,98 Z" fill="#cfdbe8" stroke="none" />
        <Path d="M150,72 L170,92 L144,86 Z" fill="#2b4466" stroke="none" />
        <Circle cx={204} cy={54} r={4} fill="#111" stroke="none" />
        <Path d="M212,70 C220,72 226,70 230,66" fill="none" stroke="#1f3350" strokeWidth={3} strokeLinecap="round" />
        <G stroke="none">
          {/* Grooves along the throat, a glint in the eye, and light along the back. */}
          <Path d="M140,96 C170,100 196,98 212,90 M146,92 C172,96 194,94 208,86" fill="none" stroke="#8fa6bf" strokeWidth={2} />
          <Circle cx={205} cy={53} r={1.3} fill="#ffffff" />
          <Path d="M50,40 C90,20 150,16 200,26" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />
          <Ellipse cx={180} cy={20} rx={6} ry={2.5} fill="#1f3350" />
        </G>
      </G>
    ),
  },
  { ...dolphin, zones: TOP_Z, maxCount: 2 },
  {
    kind: 'turtle',
    singular: 'sea turtle',
    plural: 'sea turtles',
    article: 'a',
    w: 120,
    h: 75,
    tier: 'medium',
    size: 0.15,
    zones: [...TOP_Z, ...OPEN_Z],
    maxCount: 2,
    tone: '#4f9d69',
    draw: () => (
      <G>
        <Path d="M30,30 C14,14 4,10 2,18 C6,26 18,32 32,38 Z M34,56 C20,66 12,74 18,76 C28,74 36,66 42,58 Z" fill="#7cc48f" />
        <Path d="M84,30 C96,16 110,12 112,20 C108,28 98,32 86,38 Z M80,56 C90,66 98,72 94,74 C86,72 80,66 76,58 Z" fill="#7cc48f" />
        <Ellipse cx={58} cy={42} rx={36} ry={26} fill="#4f9d69" />
        <G stroke="none">
          {/* Shell plates, each a little lighter in the middle, and spots on the flippers. */}
          <Path d="M58,22 L70,32 L66,46 L50,46 L46,32 Z" fill="#6bb582" />
          <Path d="M34,34 L44,30 L48,46 L36,54 Z M82,34 L72,30 L68,46 L80,54 Z M46,52 L58,50 L70,52 L62,62 L54,62 Z" fill="#5fa877" />
          <Circle cx={12} cy={18} r={2} fill="#4f9d69" />
          <Circle cx={102} cy={20} r={2} fill="#4f9d69" />
          <Path d="M34,26 Q50,16 70,18" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        </G>
        <Ellipse cx={104} cy={40} rx={14} ry={10} fill="#7cc48f" />
        <Circle cx={110} cy={37} r={2.5} fill="#111" stroke="none" />
        <Circle cx={110.8} cy={36.3} r={0.8} fill="#ffffff" stroke="none" />
        <Path d="M106,45 Q112,46 116,43" fill="none" stroke="#2f6b44" strokeWidth={1.5} />
      </G>
    ),
  },
  {
    kind: 'jellyfish',
    singular: 'jellyfish',
    plural: 'jellyfish',
    article: 'a',
    w: 64,
    h: 84,
    tier: 'small',
    size: 0.11,
    zones: [...TOP_Z, ...OPEN_Z],
    maxCount: 3,
    colours: [C.pink, C.purple, C.white],
    draw: (colour) => (
      <G>
        <Path d="M14,36 C12,50 20,56 14,70 M26,38 C24,56 32,62 26,82 M38,38 C40,56 32,62 38,82 M50,36 C52,50 44,56 50,70" fill="none" stroke={colour} strokeWidth={4} strokeLinecap="round" />
        {/* Frilly inner arms. */}
        <Path d="M28,38 q-4,6 0,12 q4,6 0,12 M36,38 q4,6 0,12 q-4,6 0,12" fill="none" stroke={colour} strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
        <Path d="M4,38 C4,10 60,10 60,38 C50,34 42,40 32,36 C22,40 14,34 4,38 Z" fill={colour} />
        <G stroke="none">
          <Path d="M18,22 C24,16 34,14 42,18" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={22} cy={30} r={2.5} fill="#ffffff" fillOpacity={0.5} />
          <Circle cx={32} cy={27} r={2.5} fill="#ffffff" fillOpacity={0.5} />
          <Circle cx={42} cy={30} r={2.5} fill="#ffffff" fillOpacity={0.5} />
        </G>
      </G>
    ),
  },
  // The open water.
  {
    kind: 'fish',
    singular: 'fish',
    plural: 'fish',
    article: 'a',
    w: 84,
    h: 50,
    tier: 'small',
    size: 0.11,
    zones: OPEN_Z,
    maxCount: 6,
    colours: [C.orange, C.yellow, C.pink, C.purple, C.red],
    // A school can be different colours on Hard: "What colours were the fish?"
    mixedColours: true,
    draw: (colour) => (
      <G>
        <Polygon points="20,25 0,6 0,44" fill={colour} />
        <Ellipse cx={48} cy={25} rx={34} ry={20} fill={colour} />
        <Path d="M40,6 C46,0 56,2 60,8" fill={colour} />
        <G stroke="none">
          {/* Scales, fin stripes, a gill and a glint in the eye. */}
          <Path d="M26,20 q4,4 0,8 M34,16 q4,4 0,8 M34,28 q4,4 0,8 M42,20 q4,4 0,8 M50,16 q4,4 0,8 M50,28 q4,4 0,8" fill="none" stroke="#000000" strokeOpacity={0.15} strokeWidth={2} />
          <Path d="M2,14 L16,24 M2,34 L16,27" stroke="#000000" strokeOpacity={0.15} strokeWidth={2} />
          <Path d="M60,10 Q56,25 60,40" fill="none" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Path d="M40,8 C34,18 34,32 40,42" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={4} />
          <Circle cx={68} cy={20} r={4} fill="#111" />
          <Circle cx={69.3} cy={18.8} r={1.3} fill="#ffffff" />
          <Path d="M76,30 Q79,31 81,29" fill="none" stroke="#000000" strokeOpacity={0.4} strokeWidth={1.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'clownfish',
    singular: 'clownfish',
    plural: 'clownfish',
    article: 'a',
    w: 84,
    h: 50,
    tier: 'small',
    size: 0.11,
    zones: OPEN_Z,
    maxCount: 3,
    tone: '#f77f00',
    draw: () => (
      <G>
        <Polygon points="20,25 0,8 0,42" fill="#f77f00" />
        <Ellipse cx={48} cy={25} rx={34} ry={20} fill="#f77f00" />
        <Path d="M34,6 C30,18 30,32 34,44 L44,45 C40,32 40,18 44,5 Z" fill="#ffffff" stroke="#222" strokeWidth={2} />
        <Path d="M60,8 C56,18 56,32 60,42 L68,38 C65,30 65,20 68,12 Z" fill="#ffffff" stroke="#222" strokeWidth={2} />
        <Circle cx={72} cy={20} r={3.5} fill="#111" stroke="none" />
        <G stroke="none">
          <Circle cx={73} cy={19} r={1.2} fill="#ffffff" />
          <Path d="M0,8 L20,25 L0,42" fill="none" stroke="#222" strokeWidth={2} />
          <Path d="M20,10 Q40,4 60,8" fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'shark',
    singular: 'shark',
    plural: 'sharks',
    article: 'a',
    w: 200,
    h: 85,
    tier: 'large',
    size: 0.26,
    zones: OPEN_Z,
    maxCount: 1,
    countable: false,
    tone: '#bcc5ce',
    draw: () => (
      <G>
        <Path d="M30,46 L0,14 L8,46 L0,80 Z" fill="#bcc5ce" />
        <Path d="M90,26 L110,0 L124,28 Z" fill="#bcc5ce" />
        <Path d="M24,46 C50,24 130,18 172,32 C188,36 198,44 200,50 C190,58 170,64 140,66 C100,70 50,64 24,46 Z" fill="#bcc5ce" />
        <Path d="M60,58 C100,70 150,68 190,54 C170,64 120,72 60,58 Z" fill="#e9ecef" stroke="none" />
        <Path d="M100,60 L118,80 L120,62 Z" fill="#9aa6b2" />
        <Circle cx={168} cy={40} r={3.5} fill="#111" stroke="none" />
        <Path d="M140,40 V52 M146,40 V52 M152,40 V52" stroke="#6c7a89" strokeWidth={2.5} strokeLinecap="round" />
        <G stroke="none">
          <Path d="M40,40 C80,26 140,24 180,34" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={169} cy={39} r={1.2} fill="#ffffff" />
          <Path d="M186,52 L190,56 L194,52 Z" fill="#ffffff" />
        </G>
      </G>
    ),
  },
  {
    kind: 'diver',
    singular: 'diver',
    plural: 'divers',
    article: 'a',
    w: 140,
    h: 70,
    // A grown-up person: bigger than the fish around them.
    tier: 'large',
    size: 0.24,
    zones: OPEN_Z,
    maxCount: 2,
    colours: [C.red, C.yellow, C.orange, C.pink, C.white],
    colourPrompt: (plural) => (plural ? 'What colour were the divers’ wetsuits?' : 'What colour was the diver’s wetsuit?'),
    // Swims level, head first, with an air tank on the back and flippers behind. A diver on their own may hold a torch,
    // a net or a camera out in front (see `fitDetails`): "What was the diver holding?".
    draw: (colour, details) => (
      <G>
        <Path d="M4,26 L22,34 L4,42 Z M6,44 L24,46 L10,58 Z" fill="#222" stroke="#111" />
        <Rect x={20} y={30} width={80} height={22} rx={11} fill={colour} />
        <Rect x={40} y={14} width={50} height={16} rx={8} fill="#ffd60a" stroke="#b08a00" />
        <G stroke="none">
          {/* A weight belt, a stripe on the suit, the tank's valve and its hose to the mouthpiece. */}
          <Rect x={50} y={30} width={8} height={22} fill="#343a40" />
          <Path d="M24,36 H96" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} />
          <Rect x={86} y={18} width={8} height={8} rx={2} fill="#868e96" />
          <Path d="M92,22 Q110,10 124,48" fill="none" stroke="#343a40" strokeWidth={3} />
          <Path d="M46,18 H84" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        </G>
        <Path d="M96,48 L120,58 M90,34 L118,22" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <Circle cx={112} cy={40} r={14} fill="#f1c27d" />
        <Rect x={108} y={30} width={22} height={14} rx={5} fill="#7fd1f7" stroke="#222" strokeWidth={2.5} />
        <Path d="M112,32 L118,32 L112,40 Z" fill="#ffffff" fillOpacity={0.6} stroke="none" />
        <Circle cx={128} cy={52} r={3} fill="#222" stroke="none" />
        {DIVER_HOLDS[details?.values?.diverHolds ?? '']?.draw() ?? (
          // Bubbles rising.
          <G fill="none" stroke="#ffffff" strokeWidth={2}>
            <Circle cx={134} cy={20} r={4} />
            <Circle cx={128} cy={8} r={3} />
          </G>
        )}
      </G>
    ),
  },
  {
    kind: 'submarine',
    singular: 'submarine',
    plural: 'submarines',
    article: 'a',
    w: 180,
    h: 95,
    tier: 'xl',
    // A small research submarine, drawn about as long as the whale: at the old size (0.24) it was no
    // bigger than a diver and looked like a toy.
    size: 0.42,
    wide: true,
    zones: OPEN_Z,
    maxCount: 1,
    countable: false,
    colours: [C.yellow, C.red, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M14,58 L2,44 L2,72 Z" fill="#555" stroke="#333" />
        {/* A propeller behind. */}
        <Path d="M2,50 Q-4,58 2,66" fill="none" stroke="#868e96" strokeWidth={4} />
        <Rect x={78} y={8} width={8} height={18} fill="#555" stroke="#333" />
        <Rect x={86} y={8} width={16} height={6} fill="#555" stroke="#333" />
        <Rect x={64} y={22} width={46} height={24} rx={6} fill={colour} />
        <Ellipse cx={96} cy={60} rx={82} ry={30} fill={colour} />
        <G stroke="none">
          {/* Rivets along the hull, a stripe, and the shine of the metal. */}
          {[30, 48, 150, 166].map((x) => (
            <Circle key={x} cx={x} cy={60} r={2.5} fill="#000000" fillOpacity={0.25} />
          ))}
          <Path d="M16,74 Q96,94 176,74" fill="none" stroke="#000000" strokeOpacity={0.18} strokeWidth={4} />
          <Path d="M30,44 Q96,26 160,42" fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
          <Rect x={68} y={24} width={38} height={4} rx={2} fill="#ffffff" fillOpacity={0.35} />
        </G>
        <G fill="#7fd1f7" stroke="#333" strokeWidth={3}>
          <Circle cx={70} cy={58} r={8} />
          <Circle cx={98} cy={58} r={8} />
          <Circle cx={126} cy={58} r={8} />
        </G>
        <G fill="#ffffff" fillOpacity={0.7} stroke="none">
          <Circle cx={67} cy={55} r={2.5} />
          <Circle cx={95} cy={55} r={2.5} />
          <Circle cx={123} cy={55} r={2.5} />
        </G>
      </G>
    ),
  },
  // The seabed.
  {
    kind: 'octopus',
    singular: 'octopus',
    plural: 'octopuses',
    article: 'an',
    w: 110,
    h: 95,
    tier: 'medium',
    size: 0.15,
    zones: BED_Z,
    maxCount: 1,
    colours: [C.red, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <G fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round">
          <Path d="M36,50 C20,62 6,70 8,88" />
          <Path d="M44,56 C34,72 30,80 34,92" />
          <Path d="M56,58 C56,74 52,84 58,94" />
          <Path d="M66,56 C76,72 80,80 76,92" />
          <Path d="M74,50 C90,62 104,70 102,88" />
        </G>
        <Path d="M22,48 C18,8 92,8 88,48 C76,56 34,56 22,48 Z" fill={colour} />
        <Circle cx={44} cy={36} r={6} fill="#ffffff" stroke="none" />
        <Circle cx={66} cy={36} r={6} fill="#ffffff" stroke="none" />
        <Circle cx={45} cy={37} r={3} fill="#111" stroke="none" />
        <Circle cx={67} cy={37} r={3} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Suckers on the arms, spots and a shine on the head, and a smile. */}
          {[[12, 80], [10, 70], [33, 84], [36, 74], [56, 86], [56, 76], [77, 84], [74, 74], [99, 80], [100, 70]].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="#ffffff" fillOpacity={0.55} />
          ))}
          <Circle cx={36} cy={22} r={3} fill="#000000" fillOpacity={0.15} />
          <Circle cx={74} cy={20} r={2.5} fill="#000000" fillOpacity={0.15} />
          <Ellipse cx={46} cy={18} rx={10} ry={5} fill="#ffffff" fillOpacity={0.3} />
          <Path d="M48,46 Q56,51 64,46" fill="none" stroke="#111" strokeOpacity={0.6} strokeWidth={2} />
        </G>
      </G>
    ),
  },
  { ...crab, zones: BED_Z, maxCount: 3 },
  { ...starfish, zones: BED_Z, maxCount: 4 },
  {
    kind: 'shell',
    singular: 'seashell',
    plural: 'seashells',
    article: 'a',
    w: 64,
    h: 56,
    tier: 'small',
    size: 0.1,
    zones: BED_Z,
    maxCount: 4,
    colours: [C.pink, C.white, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M32,52 L4,24 C10,4 54,4 60,24 Z" fill={colour} />
        <Path d="M32,52 L14,12 M32,52 L24,8 M32,52 L40,8 M32,52 L50,12" stroke="#00000040" strokeWidth={3} />
        <Rect x={24} y={48} width={16} height={8} rx={2} fill={colour} />
        <Path d="M10,22 C18,12 30,8 42,10" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'seaweed',
    singular: 'seaweed plant',
    plural: 'seaweed plants',
    article: 'a',
    w: 70,
    h: 220,
    tier: 'medium',
    size: 0.13,
    // Grows from the seabed and rises into the open water; a few are spread along the bottom.
    tall: true,
    spread: true,
    countable: false,
    zones: BED_Z,
    maxCount: 3,
    tone: '#2f9e44',
    draw: () => (
      <G fill="#2f9e44">
        <Path d="M30,220 C10,170 46,130 24,80 C14,56 26,30 20,0 C40,28 34,56 42,82 C60,130 26,170 42,220 Z" />
        <Path d="M40,220 C58,180 40,150 58,110 C64,96 62,80 70,62 C70,90 74,110 66,130 C54,170 64,190 52,220 Z" fill="#40c057" />
        <Path d="M22,220 C10,196 16,170 2,140 C16,150 26,176 32,220 Z" fill="#40c057" />
        {/* A midrib up each frond, and a few air bladders. */}
        <Path d="M34,218 C22,170 42,130 30,84 C22,56 30,30 24,6 M46,218 C60,180 48,150 62,110 C66,96 66,82 69,70" fill="none" stroke="#1f6b2a" strokeOpacity={0.5} strokeWidth={2} />
        <G fill="#69db7c" stroke="none">
          <Circle cx={30} cy={120} r={4} />
          <Circle cx={36} cy={60} r={3.5} />
          <Circle cx={58} cy={150} r={3.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'coral',
    singular: 'coral',
    plural: 'corals',
    article: 'a',
    w: 100,
    h: 90,
    tier: 'medium',
    size: 0.15,
    zones: BED_Z,
    maxCount: 3,
    colours: [C.pink, C.orange, C.purple],
    draw: (colour) => (
      <G>
        <G fill="none" stroke={colour} strokeWidth={11} strokeLinecap="round">
          <Path d="M50,88 V40 M50,58 L24,30 M24,30 V10 M24,30 L10,22 M50,50 L76,24 M76,24 V6 M76,24 L92,18 M50,40 L44,14" />
        </G>
        {/* Tiny polyps dotted along the branches, and light down one side. */}
        <G fill="#ffffff" fillOpacity={0.55} stroke="none">
          {[[50, 72], [50, 52], [34, 40], [24, 18], [14, 23], [64, 36], [76, 14], [88, 19], [46, 24]].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={2} />
          ))}
        </G>
        <Path d="M47,86 V44 M22,28 V12 M73,24 V8" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2.5} strokeLinecap="round" />
      </G>
    ),
  },
];

type Palette = Record<'sky' | 'top' | 'open' | 'deep' | 'sand' | 'rock' | 'ray', string>;

/** What's in the treasure chest this time, and so the answer to "What was in the treasure chest?". */
const CHEST_CONTENTS = ['Gold coins', 'Pearls', 'Red jewels', 'Nothing, it was closed'];

/** What a diver can hold out in front, in the hand at about (118, 22), and how answers name it. */
const DIVER_HOLDS: Record<string, { name: string; draw: () => ReactElement }> = {
  torch: {
    name: 'A torch',
    draw: () => (
      <G>
        <Path d="M128,14 L140,2 V30 Z" fill="#fff3bf" fillOpacity={0.85} stroke="none" />
        <Path d="M112,24 L130,14" stroke="#343a40" strokeWidth={7} strokeLinecap="round" />
        <Circle cx={130} cy={14} r={4.5} fill="#ffd60a" stroke="#b08a00" strokeWidth={1.5} />
      </G>
    ),
  },
  net: {
    name: 'A net',
    draw: () => (
      <G>
        <Path d="M112,26 L128,10" stroke="#8a5a2b" strokeWidth={3.5} strokeLinecap="round" />
        <Circle cx={132} cy={8} r={8} fill="#ffffff" fillOpacity={0.35} stroke="#f8f9fa" strokeWidth={2.5} />
        <Path d="M126,4 L138,12 M126,12 L138,4 M132,0 V16" stroke="#f8f9fa" strokeWidth={1} />
      </G>
    ),
  },
  camera: {
    name: 'A camera',
    draw: () => (
      <G>
        <Rect x={116} y={10} width={20} height={14} rx={3} fill="#343a40" stroke="#111" strokeWidth={1.5} />
        <Circle cx={128} cy={17} r={4.5} fill="#74c0fc" stroke="#111" strokeWidth={1.5} />
        <Rect x={119} y={7} width={6} height={4} rx={1} fill="#495057" />
      </G>
    ),
  },
};

/** Once things are placed: with one diver, what they're holding (or nothing). */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  if (groups.find((g) => g.kind === 'diver')?.count !== 1) return d;
  const holds = random.next() < 0.2 ? '' : random.pick(Object.keys(DIVER_HOLDS));
  const answer = holds ? DIVER_HOLDS[holds].name : 'Nothing';
  return {
    ...d,
    values: { ...d.values, diverHolds: holds },
    facts: [
      ...(d.facts ?? []),
      { id: 'diver-holds', family: 'story', type: 'object', prompt: 'What was the diver holding?', answer, wrong: [...Object.values(DIVER_HOLDS).map((h) => h.name), 'Nothing'].filter((n) => n !== answer), needs: 'diver' },
    ],
  };
}

function details(random: Rng): SceneDetails {
  const contents = random.pick(CHEST_CONTENTS);
  return {
    values: { chestSide: random.next() < 0.5 ? 'left' : 'right', chest: contents },
    facts: [
      {
        id: 'chest',
        family: 'story',
        type: 'object',
        prompt: 'What was in the treasure chest?',
        answer: contents,
        wrong: CHEST_CONTENTS.filter((c) => c !== contents),
      },
    ],
  };
}

/** The treasure chest, in its corner box (design units): lid thrown back with its treasure heaped up, or shut. */
function chest(x0: number, y0: number, w: number, h: number, contents: string) {
  const open = contents !== 'Nothing, it was closed';
  const bx = x0 + w * 0.1;
  const bw = w * 0.8;
  const by = y0 + h * 0.5;
  const bh = h * 0.5;
  const treasure = contents === 'Gold coins' ? '#ffd60a' : contents === 'Pearls' ? '#f8f9fa' : '#e63946';
  const r = h * 0.075;
  // A heap: a row along the rim and a few on top, plus two pieces spilled on the sand in front.
  const heap = [
    ...[0.12, 0.3, 0.5, 0.7, 0.88].map((f) => [bx + bw * f, by - r * 0.4]),
    ...[0.22, 0.42, 0.62, 0.8].map((f) => [bx + bw * f, by - r * 1.6]),
    ...[0.34, 0.56].map((f) => [bx + bw * f, by - r * 2.7]),
  ];
  const spilled = [
    [x0 + w * 0.04, y0 + h * 0.96],
    [x0 + w * 0.96, y0 + h * 0.97],
  ];
  return (
    <G stroke="#3d2412" strokeWidth={3}>
      {open && (
        <>
          {/* The lid, thrown back and leaning: its dark inside faces us, with a gold rim along the top. */}
          <Path d={`M${bx},${by} L${bx - bw * 0.1},${y0 + h * 0.04} L${bx + bw * 0.86},${y0} L${bx + bw},${by} Z`} fill="#4a2c17" />
          <Path d={`M${bx - bw * 0.1},${y0 + h * 0.04} L${bx + bw * 0.86},${y0}`} stroke="#c9a227" strokeWidth={6} strokeLinecap="round" />
          {heap.map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r={r} fill={treasure} />
          ))}
        </>
      )}
      <Rect x={bx} y={by} width={bw} height={bh} rx={6} fill="#8b5a2b" />
      {!open && <Path d={`M${bx},${by} C${bx},${by - h * 0.32} ${bx + bw},${by - h * 0.32} ${bx + bw},${by} Z`} fill="#7a4a2a" />}
      <Rect x={bx} y={by + bh * 0.3} width={bw} height={bh * 0.14} fill="#c9a227" />
      <Rect x={bx + bw / 2 - 8} y={by + bh * 0.22} width={16} height={bh * 0.32} rx={3} fill="#c9a227" />
      {open && spilled.map(([cx, cy], i) => <Circle key={`s${i}`} cx={cx} cy={cy} r={r * 0.9} fill={treasure} />)}
    </G>
  );
}

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const surface = height * SURFACE;
  const top = height * TOP;
  const bed = height * SEABED;
  const sand = height * (SEABED + 0.06);
  const side = d?.values?.chestSide ?? 'right';
  const c = chestRect(side);
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={surface + 600} fill={p.sky} />
      <Rect x={-600} y={surface} width={2100} height={top - surface} fill={p.top} />
      <Rect x={-600} y={top} width={2100} height={bed - top} fill={p.open} />
      <Rect x={-600} y={bed} width={2100} height={height - bed + 600} fill={p.deep} />
      {/* Sunlight slanting down through the water. */}
      <G fill={p.ray} opacity={0.12}>
        <Polygon points={`120,${surface} 220,${surface} 120,${bed} -20,${bed}`} />
        <Polygon points={`460,${surface} 540,${surface} 520,${bed} 380,${bed}`} />
        <Polygon points={`760,${surface} 840,${surface} 960,${bed} 820,${bed}`} />
      </G>
      {/* The wavy surface. */}
      <Path
        d={`M-600,${surface} ${Array.from({ length: 36 }, (_, i) => `q30,${i % 2 ? 10 : -10} 60,0`).join(' ')} V${surface + 14} H-600 Z`}
        fill={p.top}
      />
      {/* The sandy seabed, gently rolling, with rocks at the edges. */}
      <Path d={`M-600,${sand} C0,${sand - 30} 300,${sand + 20} 600,${sand - 10} C900,${sand - 30} 1200,${sand + 10} 1500,${sand} V${height + 600} H-600 Z`} fill={p.sand} />
      {/* The grain of the sand. */}
      {speckles({ x0: -40, y0: sand + 20, x1: 940, y1: height }, 200, '#000000', 0.1, 4)}
      {/* Dappled sunlight on the sand, and pebbles. */}
      {glints({ x0: -40, y0: sand + 16, x1: 940, y1: height }, 50, '#ffffff', 0.18, 26, 4, 53)}
      {speckles({ x0: -40, y0: sand + 30, x1: 940, y1: height }, 40, p.rock, 0.5, 8, 61)}
      <Ellipse cx={-30} cy={sand + 20} rx={90} ry={40} fill={p.rock} />
      <Ellipse cx={940} cy={sand + 30} rx={100} ry={45} fill={p.rock} />
      <Path d={`M-110,${sand + 4} Q-40,${sand - 24} 50,${sand + 2}`} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
      <Path d={`M850,${sand + 14} Q930,${sand - 18} 1030,${sand + 12}`} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
      <Path d={`M-90,${sand + 8} q20,-10 40,-4 q20,-8 40,2`} fill="none" stroke="#2f9e44" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
      <Path d={`M880,${sand + 12} q20,-10 40,-4 q20,-8 40,2`} fill="none" stroke="#2f9e44" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
      {chest(c.x0 * 900, c.y0 * height, CHEST.w * 900, CHEST.h * height, d?.values?.chest ?? 'Gold coins')}
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const bubble = (x: number, y: number) => (
    <G fill="none" stroke="#ffffff" strokeWidth={3}>
      <Circle cx={x + 8} cy={y + 30} r={8} />
      <Circle cx={x + 18} cy={y + 14} r={5} />
      <Circle cx={x + 10} cy={y + 4} r={3} />
    </G>
  );
  const ripple = (x: number, y: number) => <Path d={`M${x},${y + 6} q12,-8 24,0 t24,0`} fill="none" stroke={variant.palette.rock} strokeWidth={3} strokeLinecap="round" />;
  return [
    ...scatterMarks({ x0: 20, y0: height * (SURFACE + 0.04), x1: 880, y1: height * SEABED }, 28, 40, 6, boxes, random, 0.35, bubble),
    ...scatterMarks({ x0: 20, y0: height * (SEABED + 0.1), x1: 880, y1: height - 20 }, 50, 12, 5, boxes, random, 0.3, ripple),
  ];
}

const PALETTES: Record<string, Palette> = {
  tropical: { sky: '#bde8ff', top: '#4cc3e8', open: '#2aa3d8', deep: '#1f86c2', sand: '#ecd9a4', rock: '#8d8a7a', ray: '#ffffff' },
  deep: { sky: '#a9d6f5', top: '#3b8fd0', open: '#2a6fb6', deep: '#1d5596', sand: '#d6c08a', rock: '#6f6d63', ray: '#e0f4ff' },
};

export const underSea: Recipe = {
  id: 'under-sea',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'Under the sea',
  zones: [
    { id: 'top', label: 'Near the surface', surface: 'air', top: SURFACE + 0.025, bottom: TOP, rows: 1 },
    { id: 'open', label: 'In the open water', surface: 'air', top: TOP + 0.01, bottom: SEABED - 0.01, rows: 2 },
    { id: 'bed', label: 'On the seabed', surface: 'ground', top: SEABED + 0.04, bottom: 1, rows: 2 },
  ],
  items,
  details,
  fitDetails,
  // The treasure chest's corner (either side) is kept clear, so nothing hides it.
  keepClear: [chestRect('left'), chestRect('right')],
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Sunlit near the surface, darker with depth.
    { top: SURFACE, bottom: SEABED, from: ['#ffffff', 0.12], to: ['#000000', 0.12] },
    // The seabed, darker in front.
    { top: SEABED + 0.06, bottom: 1, from: ['#000000', 0.06], to: ['#000000', 0.12] },
  ],
  surfaceAt: (_x, y) => (y < SURFACE ? 'sky' : y < TOP ? 'top' : y < SEABED ? 'open' : y < SEABED + 0.06 ? 'deep' : 'sand'),
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
