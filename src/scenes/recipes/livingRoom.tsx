import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '../colours';
import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { shade } from '../contrast';
import { ball, dog, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { DetailKnobs, ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, Rug, SceneDetails } from '../types';
import type { Rng } from '../random';
import { speckles } from '../texture';

/** Band edges, as fractions of the picture height: a thin ceiling, the wall, then the floor. */
const CEILING = 0.1;
const FLOOR = 0.55;

const WALL = ['wall'];
const FLOOR_ZONE = ['floor'];

/** The rug, shared by the drawing, the contrast rules and placement: things are fully on it or off it. */
const RUG: Rug = { cx: 0.5, cy: 0.8, rx: 0.36, ry: 0.09, label: 'On the carpet' };

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
    // A pet can hide behind it on harder levels, peeking over the back (see `fitDetails`).
    draw: (colour, details) => (
      <G>
        {hidingPet('sofa', details)}
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
        {seatedCat('sofa', details)}
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
    // A cat can be curled up on the seat (see `fitDetails`).
    draw: (colour, details) => (
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
        {seatedCat('armchair', details)}
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
    // Says which lamp: a table lamp's shade could be asked about too.
    colourPrompt: (plural) => (plural ? 'What colour were the floor lamps’ shades?' : 'What colour was the floor lamp’s shade?'),
    // On or off per picture (see `fitDetails`); on when drawn on its own.
    draw: (colour, details, _copy, index = 0) => (
      <G>
        {/* Light shining down from the shade when it's on. */}
        {lampIsOn(details, index) && <Path d="M4,64 H76 L80,222 H0 Z" fill="#ffe066" fillOpacity={0.4} stroke="none" />}
        <Rect x={36} y={60} width={8} height={160} fill="#495057" stroke="none" />
        <Rect x={34} y={120} width={12} height={6} rx={2} fill="#343a40" stroke="none" />
        <Ellipse cx={40} cy={224} rx={30} ry={6} fill="#495057" stroke="none" />
        <Path d="M14,0 H66 L80,64 H0 Z" fill={colour} />
        <G stroke="none">
          <Path d="M12,8 H68 L69,12 H11 Z M3,52 H77 L78,57 H2 Z" fill="#000000" fillOpacity={0.15} />
          <Path d="M18,4 L10,60 H20 L26,4 Z" fill="#ffffff" fillOpacity={0.3} />
        </G>
        {lampBulb(lampIsOn(details, index), 40, 72, 10, 0, 80)}
      </G>
    ),
  },
  {
    kind: 'tv',
    singular: 'television',
    plural: 'televisions',
    article: 'a',
    w: 170,
    h: 175,
    tier: 'large',
    size: 0.28,
    zones: FLOOR_ZONE,
    maxCount: 1,
    backRow: true,
    avoidRug: true,
    tone: '#212529',
    countable: false,
    // What's on the screen is chosen per picture (see `details`): off, a cartoon, football or fish. An aerial on
    // top, so it's never taken for a fish tank.
    draw: (_colour, details) => (
      <G>
        <G stroke="#212529" strokeWidth={4} strokeLinecap="round">
          <Path d="M85,30 L52,4 M85,30 L120,2" />
        </G>
        <Circle cx={52} cy={4} r={4} fill="#495057" />
        <Circle cx={120} cy={2} r={4} fill="#495057" />
        <Path d="M68,36 Q68,24 85,24 Q102,24 102,36 Z" fill="#343a40" />
        <G transform="translate(0 35)">{tvSet(details)}</G>
      </G>
    ),
  },
  {
    // A table lamp on a little side table, against the wall like the furniture. On or off per picture.
    kind: 'table-lamp',
    singular: 'table lamp',
    plural: 'table lamps',
    article: 'a',
    w: 70,
    h: 112,
    tier: 'medium',
    size: 0.13,
    backRow: true,
    spread: true,
    zones: FLOOR_ZONE,
    maxCount: 2,
    avoidRug: true,
    colours: [C.blue, C.yellow, C.green, C.white, C.pink, C.purple],
    colourPrompt: (plural) => (plural ? 'What colour were the table lamps’ shades?' : 'What colour was the table lamp’s shade?'),
    draw: (colour, details, _copy, index = 0) => (
      <G>
        {/* Light shining down from the shade onto the table when it's on. (A halo round the shade wasn't read as "on".) */}
        {lampIsOn(details, index, 'tableLamps') && <Path d="M8,34 H62 L72,62 H-2 Z" fill="#ffe066" fillOpacity={0.5} stroke="none" />}
        {/* The side table: a top, a drawer with a knob, and two legs. */}
        <Rect x={8} y={74} width={6} height={38} fill="#8b5a2b" stroke="#4a2f16" />
        <Rect x={56} y={74} width={6} height={38} fill="#8b5a2b" stroke="#4a2f16" />
        <Rect x={4} y={60} width={62} height={18} rx={2} fill="#8b5a2b" stroke="#4a2f16" />
        <Circle cx={35} cy={69} r={2.5} fill="#e9c46a" stroke="none" />
        {/* The lamp on it: a round base, a stem and the shade. */}
        <Ellipse cx={35} cy={58} rx={12} ry={4} fill="#495057" stroke="none" />
        <Rect x={33} y={30} width={4} height={28} fill="#495057" stroke="none" />
        <Path d="M16,4 H54 L62,34 H8 Z" fill={colour} />
        <Path d="M18,8 L12,32 H18 L23,8 Z" fill="#ffffff" fillOpacity={0.3} stroke="none" />
        {lampBulb(lampIsOn(details, index, 'tableLamps'), 35, 40, 8, 8, 62)}
      </G>
    ),
  },
  // Plants stand along the wall, never out in the room or on the rug.
  // A pet can hide behind one on harder levels (see `fitDetails`).
  {
    ...plantPot,
    zones: FLOOR_ZONE,
    maxCount: 3,
    avoidRug: true,
    backRow: true,
    spread: true,
    noFlip: true,
    draw: (colour, details) => (
      <G>
        {hidingPet('plant', details)}
        {plantPot.draw(colour)}
      </G>
    ),
  },
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
    // How many books stand on each shelf is chosen per picture on harder levels (see `fitDetails`); 5 otherwise.
    draw: (_colour, details) => (
      <G>
        <Rect x={0} y={0} width={120} height={200} fill="#8b5a2b" />
        <G stroke="none">
          {[0, 1, 2].map((shelf) => (
            <G key={shelf}>
              <Rect x={8} y={8 + shelf * 64} width={104} height={56} fill="#5c3d1e" />
              {shelfBooks(shelf, booksOn(details, shelf))}
              {/* The shelf edge catching the light. */}
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
    // Playing with a toy, chosen per picture (see `fitDetails`).
    draw: (colour, details) => (
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
        {petToy('cat', details)}
      </G>
    ),
  },
  { ...dog, zones: FLOOR_ZONE, maxCount: 2, draw: (colour, details) => <G>{dog.draw(colour)}{petToy('dog', details)}</G> },
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
  {
    // Spills: something knocked over on the floor, for "Which of these was in the picture?" and the like.
    kind: 'crayons',
    singular: 'box of crayons',
    plural: 'boxes of crayons',
    article: 'a',
    w: 110,
    h: 50,
    // Big enough to make out the crayons on a phone.
    tier: 'medium',
    size: 0.17,
    zones: FLOOR_ZONE,
    maxCount: 1,
    countable: false,
    tone: '#ffd60a',
    draw: () => (
      <G>
        {/* The box on its side with crayons spilled out of it across the floor. */}
        <Path d="M0,22 L34,14 L42,46 L8,50 Z" fill="#ffd60a" />
        <Path d="M34,14 L42,46 L50,38 L44,10 Z" fill="#e0b800" />
        {/* Thick crayons with pointed tips, each outlined in its own darker colour so it isn't muddied. */}
        {[
          ['#d00000', 'M48,36 L76,30 L78,40 L50,46 Z M76,30 L84,34 L78,40 Z'],
          ['#1d70d6', 'M54,18 L82,22 L81,32 L53,28 Z M82,22 L90,28 L81,32 Z'],
          ['#2b9348', 'M58,44 L88,44 L88,54 L58,54 Z M88,44 L96,49 L88,54 Z'],
          ['#7b2cbf', 'M78,10 L102,2 L105,11 L81,19 Z M102,2 L110,4 L105,11 Z'],
        ].map(([fill, d]) => (
          <Path key={d} d={d} fill={fill} stroke={shade(fill)} />
        ))}
        <Path d="M6,30 L36,23 M9,40 L38,34" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
      </G>
    ),
  },
  {
    kind: 'spilled-cup',
    singular: 'spilled cup',
    plural: 'spilled cups',
    article: 'a',
    w: 110,
    h: 46,
    tier: 'medium',
    size: 0.17,
    zones: FLOOR_ZONE,
    maxCount: 1,
    // Off the rug: a puddle there would barely show.
    avoidRug: true,
    colours: [C.red, C.blue, C.green, C.purple, C.pink],
    colourPrompt: () => 'What colour was the spilled cup?',
    draw: (colour) => (
      <G>
        {/* An uneven puddle with splash drops, wider than the mug, so it reads as spilled water. */}
        <Path
          d="M30,38 C32,32 44,30 54,32 C62,27 80,28 88,31 C100,29 112,34 108,40 C112,45 98,48 88,46 C74,49 56,49 46,46 C36,47 28,43 30,38 Z"
          fill="#74c0fc"
          stroke="#1c7ed6"
        />
        <G stroke="none">
          <Path d="M56,36 Q70,32 88,35" fill="none" stroke="#ffffff" strokeOpacity={0.8} strokeWidth={3} strokeLinecap="round" />
          <Path d="M66,42 Q76,40 84,41" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round" />
        </G>
        <G fill="#74c0fc" stroke="#1c7ed6">
          <Circle cx={100} cy={22} r={3.5} />
          <Circle cx={110} cy={28} r={2.5} />
          <Circle cx={78} cy={22} r={2.5} />
        </G>
        {/* The mug knocked over, tipped mouth-down into the puddle, its handle sticking up by its closed end. */}
        <G transform="rotate(14 42 30)">
          <Path d="M8,18 C2,4 20,0 22,16" fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round" />
          <Rect x={4} y={16} width={38} height={28} rx={5} fill={colour} />
          <Ellipse cx={42} cy={30} rx={6} ry={14} fill={colour} />
          <Ellipse cx={42} cy={30} rx={4} ry={11} fill="#1c3d5a" fillOpacity={0.7} stroke="none" />
          <Path d="M8,22 H36" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
        </G>
        {/* Water running out of the mug's mouth. */}
        <Path d="M42,32 C48,32 50,36 56,36 L48,44 C44,40 43,38 42,38 Z" fill="#74c0fc" stroke="none" />
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

/** What can be on the television, and how the answer says it. All four happen, so none can be ruled out. */
const TV_SHOWS: Record<string, string> = {
  off: 'Nothing, it was off',
  cartoon: 'A cartoon',
  football: 'A football match',
  fish: 'Fish swimming',
};

/** The picture on the television screen (154 × 84, at 8,8). */
function tvScreen(show: string) {
  switch (show) {
    case 'off':
      return <Rect x={8} y={8} width={154} height={84} fill="#343a40" />;
    case 'football':
      return (
        <G>
          <Rect x={8} y={8} width={154} height={84} fill="#2f9e44" />
          <Path d="M8,30 H162 M8,60 H162" stroke="#37b24d" strokeWidth={14} />
          <Path d="M85,8 V92 M8,8 H162 V92 H8 Z" fill="none" stroke="#ffffff" strokeWidth={2.5} />
          <Circle cx={85} cy={50} r={14} fill="none" stroke="#ffffff" strokeWidth={2.5} />
          <Circle cx={118} cy={62} r={6} fill="#ffffff" />
          <Path d="M115,60 L121,64 M121,60 L115,64" stroke="#212529" strokeWidth={1.5} />
        </G>
      );
    case 'fish':
      return (
        <G>
          <Rect x={8} y={8} width={154} height={84} fill="#1c7ed6" />
          <Path d="M8,92 V80 Q30,72 50,82 Q80,70 110,80 Q140,72 162,80 V92 Z" fill="#e9c46a" />
          <Path d="M30,88 Q26,70 32,56 M36,88 Q42,74 38,62" fill="none" stroke="#2b9348" strokeWidth={3} />
          {[
            [70, 36, '#ff922b'],
            [118, 54, '#ffd43b'],
            [96, 26, '#ff6b6b'],
          ].map(([x, y, fill]) => (
            <G key={String(x)}>
              <Ellipse cx={Number(x)} cy={Number(y)} rx={11} ry={7} fill={String(fill)} />
              <Path d={`M${Number(x) + 9},${y} l9,-6 v12 Z`} fill={String(fill)} />
              <Circle cx={Number(x) - 5} cy={Number(y) - 1} r={1.6} fill="#111" />
            </G>
          ))}
        </G>
      );
    default:
      // A cartoon: hills and the sun.
      return (
        <G>
          <Rect x={8} y={8} width={154} height={84} fill="#4dabf7" />
          <Path d="M8,92 V66 Q46,44 86,64 Q120,48 162,62 V92 Z" fill="#74c69d" />
          <Circle cx={128} cy={30} r={11} fill="#ffd93b" />
        </G>
      );
  }
}

/** The television and its stand, below the aerial (170 × 140). */
function tvSet(details?: SceneDetails) {
  return (
    <G>
      <Rect x={20} y={100} width={130} height={40} fill="#8b5a2b" stroke="#4a2f16" />
      <G stroke="none">
        {/* Two cupboard doors with knobs. */}
        <Path d="M85,104 V136" stroke="#4a2f16" strokeWidth={2} />
        <Circle cx={78} cy={120} r={3} fill="#e9c46a" />
        <Circle cx={92} cy={120} r={3} fill="#e9c46a" />
      </G>
      <Rect x={0} y={0} width={170} height={100} rx={6} fill="#212529" />
      <G stroke="none">
        {tvScreen(details?.values?.tv ?? 'cartoon')}
        {/* A glare across the glass, and the power light: red when off, green when on. */}
        <Path d="M14,12 L60,12 L24,60 L14,60 Z" fill="#ffffff" fillOpacity={0.18} />
        <Circle cx={160} cy={95} r={2} fill={details?.values?.tv === 'off' ? '#ff6b6b' : '#51cf66'} />
      </G>
    </G>
  );
}

/**
 * A lamp's bulb just under its shade: bright yellow when the lamp is on, grey when it's off, so the two can be told
 * apart at a glance. When it's on, short rays of light come out past the shade's lower corners (`x0`, `x1`).
 */
function lampBulb(on: boolean, cx: number, y: number, r: number, x0: number, x1: number) {
  return (
    <G>
      <Circle cx={cx} cy={y} r={r} fill={on ? '#ffe066' : '#ced4da'} stroke={on ? '#e67700' : '#868e96'} strokeWidth={1.5} />
      {on && <Circle cx={cx - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#ffffff" stroke="none" />}
      {on && (
        <Path
          d={`M${x0 - 3},${y - 6} l-15,2 M${x0 + 1},${y + 3} l-12,11 M${x1 + 3},${y - 6} l15,2 M${x1 - 1},${y + 3} l12,11`}
          stroke="#f59f00"
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      )}
    </G>
  );
}

/**
 * Whether the lamp at `index` (0 the left one) is on: `values[key]` is on/off for one lamp, or which of two
 * (`lamps` for floor lamps, `tableLamps` for table lamps).
 */
function lampIsOn(details: SceneDetails | undefined, index: number, key = 'lamps'): boolean {
  const lamps = details?.values?.[key];
  if (!lamps || lamps === 'on' || lamps === 'both') return true;
  if (lamps === 'off' || lamps === 'none') return false;
  return lamps === (index === 0 ? 'left' : 'right');
}

/** Book spines on a shelf, left to right (the last one leans), with their colours per shelf. */
const BOOK_SLOTS: { d: (y: number) => string; band?: (y: number) => string; fills: string[] }[] = [
  { d: (y) => `M14,${y + 20} H28 V${y + 64} H14 Z`, band: (y) => `M14,${y + 28} H28`, fills: ['#d00000', '#1d70d6', '#2b9348'] },
  { d: (y) => `M30,${y + 26} H42 V${y + 64} H30 Z`, band: (y) => `M30,${y + 34} H42`, fills: ['#ffd60a', '#ffd60a', '#ffd60a'] },
  { d: (y) => `M44,${y + 18} H60 V${y + 64} H44 Z`, band: (y) => `M44,${y + 26} H60`, fills: ['#7b2cbf', '#f77f00', '#d00000'] },
  { d: (y) => `M62,${y + 24} H72 V${y + 64} H62 Z`, band: (y) => `M62,${y + 32} H72`, fills: ['#2b9348', '#d00000', '#1d70d6'] },
  { d: (y) => `M76,${y + 64} L92,${y + 30} L102,${y + 34} L86,${y + 64} Z`, fills: ['#f77f00', '#7b2cbf', '#ffd60a'] },
];

/** How many books stand on `shelf` (0 the top one): chosen per picture on harder levels, else all five. */
function booksOn(details: SceneDetails | undefined, shelf: number): number {
  const counts = details?.values?.shelves?.split(',').map(Number);
  return counts?.[shelf] ?? BOOK_SLOTS.length;
}

/** The first `count` books on a shelf, each clear of the next so they can be counted. */
function shelfBooks(shelf: number, count: number) {
  const y = shelf * 64;
  return BOOK_SLOTS.slice(0, count).map((slot, i) => (
    <G key={i}>
      <Path d={slot.d(y)} fill={slot.fills[shelf]} />
      {slot.band && <Path d={slot.band(y)} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />}
    </G>
  ));
}

/** What a pet can be playing with, and how the answer says it. */
const PET_TOYS: Record<'cat' | 'dog', Record<string, string>> = {
  cat: { yarn: 'A ball of yarn', mouse: 'A toy mouse', feather: 'A feather' },
  dog: { bone: 'A bone', rope: 'A rope toy', sock: 'A sock' },
};

/**
 * The pet's toy: the cat's by its front paws, in front of its face; the dog's in its mouth (lying by its paws,
 * testers couldn't tell what it was playing with).
 */
function petToy(animal: 'cat' | 'dog', details?: SceneDetails) {
  const toy = details?.values?.[`${animal}Toy`];
  if (!toy) return null;
  // Drawn bigger around where it is, so it can be made out on a phone.
  const [ax, ay, k] = animal === 'cat' ? [8, 66, 1.4] : [96, 38, 1.25];
  return <G transform={`translate(${ax} ${ay}) scale(${k}) translate(${-ax} ${-ay})`}>{toyDrawing(toy)}</G>;
}

function toyDrawing(toy: string) {
  switch (toy) {
    case 'yarn':
      return (
        <G>
          <Path d="M14,68 Q30,76 44,70" fill="none" stroke="#e64980" strokeWidth={2} />
          <Circle cx={8} cy={64} r={10} fill="#ff5fa2" stroke="#a61e4d" />
          <Path d="M1,60 Q8,54 15,62 M2,68 Q9,62 16,70" fill="none" stroke="#a61e4d" strokeWidth={1.5} />
        </G>
      );
    case 'mouse':
      return (
        <G stroke="#495057">
          <Path d="M16,70 Q26,76 34,70" fill="none" strokeWidth={2} />
          <Ellipse cx={8} cy={68} rx={10} ry={6} fill="#ced4da" />
          <Circle cx={2} cy={62} r={3.5} fill="#ffadc6" />
          <Circle cx={0} cy={68} r={1.2} fill="#111" stroke="none" />
        </G>
      );
    case 'feather':
      return (
        <G>
          <Path d="M-6,70 C2,54 18,50 30,52 C20,60 8,68 -6,70 Z" fill="#4dabf7" stroke="#1864ab" />
          <Path d="M-6,70 Q14,60 30,52" fill="none" stroke="#1864ab" strokeWidth={1.5} />
        </G>
      );
    // The dog's toys, held across its mouth (below its nose, at about 96,38).
    case 'bone':
      return (
        <G fill="#f8f9fa" stroke="#868e96">
          <Rect x={84} y={35} width={26} height={7} rx={3} />
          <Circle cx={84} cy={35} r={4.5} />
          <Circle cx={84} cy={42} r={4.5} />
          <Circle cx={110} cy={35} r={4.5} />
          <Circle cx={110} cy={42} r={4.5} />
        </G>
      );
    case 'rope':
      return (
        <G>
          <Path d="M84,40 L110,35" stroke="#e03131" strokeWidth={7} strokeLinecap="round" />
          <Path d="M88,35 L91,43 M96,34 L99,42 M104,33 L107,41" stroke="#ffffff" strokeWidth={2} />
          <Circle cx={82} cy={41} r={5} fill="#e03131" stroke="#a61e1e" />
          <Circle cx={112} cy={34} r={5} fill="#e03131" stroke="#a61e1e" />
        </G>
      );
    default:
      // A striped sock hanging from its mouth by the top: its L shape reads even when small. (A slipper looked
      // like a paddle.)
      return (
        <G transform="translate(89 34) scale(0.72)">
          <Path d="M0,0 H12 V22 Q12,26 16,26 H24 Q30,26 30,32 Q30,38 24,38 H8 Q0,38 0,30 Z" fill="#f8f9fa" stroke="#1864ab" />
          <Path d="M0,7 H12 M0,14 H12 M24,26 V38" stroke="#1c7ed6" strokeWidth={4} />
          <Path d="M0,0 H12 V3 H0 Z" fill="#1c7ed6" stroke="none" />
        </G>
      );
  }
}

/**
 * Where a cat can hide on harder levels (one of each in the picture): over the back of the sofa, or beside the
 * potted plant. Not a dog: its head is barely higher than its back, so a dog peeking over the sofa looked to be
 * lying on top of it, and it's bigger than the pot. Where the cat's top-left corner goes and how big it's drawn, in
 * the spot's own units, so it's the same size as the cats in the room; drawn before the spot, so the spot covers
 * the rest. A clear peek shows its head; a small one its ears and eyes.
 */
const PET_SPOTS: Record<string, { name: string; animals: ('cat' | 'dog')[]; w: number; scale: Record<string, number>; clear: Record<string, [number, number]>; small: Record<string, [number, number]> }> = {
  sofa: { name: 'Behind the sofa', animals: ['cat'], w: 230, scale: { cat: 0.7 }, clear: { cat: [140, -34] }, small: { cat: [140, -26] } },
  plant: { name: 'Behind the potted plant', animals: ['cat'], w: 80, scale: { cat: 0.82 }, clear: { cat: [-28, 49] }, small: { cat: [-16, 49] } },
};

/** The hiding pet, behind the thing at `spot` when the picture's details put it there. */
function hidingPet(spot: string, details?: SceneDetails) {
  const v = details?.values;
  if (!v || v.petSpot !== spot || !v.pet) return null;
  const animal = v.pet as 'cat' | 'dog';
  const def = PET_SPOTS[spot];
  const s = def.scale[animal];
  const [x0, y] = v.peek === '2' ? def.small[animal] : def.clear[animal];
  const item = animal === 'cat' ? items.find((i) => i.kind === 'cat')! : dog;
  // Beside the plant, it peeks out of the side facing the middle of the picture: the cat's head is on its left,
  // so to peek out of the right it's mirrored.
  const mirrored = spot === 'plant' && v.petSide === 'right';
  const transform = mirrored ? `translate(${def.w - x0} ${y}) scale(${-s} ${s})` : `translate(${x0} ${y}) scale(${s})`;
  return (
    <G transform={transform} stroke={shade(v.petColour)} strokeWidth={2.5}>
      {item.draw(v.petColour)}
    </G>
  );
}

/**
 * Where a cat can be curled up on a seat: its top-left corner and size in the seat's own units, so it's the same
 * size as the cats on the floor, sitting on the seat cushion in front of the back. And how the answer says it.
 */
const CAT_SEATS: Record<string, { name: string; at: [number, number]; scale: number }> = {
  sofa: { name: 'On the sofa', at: [44, 16], scale: 0.7 },
  armchair: { name: 'On the armchair', at: [24, 12], scale: 0.8 },
};

/** The cat on the sofa or armchair, when the picture's details put it there. */
function seatedCat(seat: string, details?: SceneDetails) {
  const v = details?.values;
  if (!v || v.catSeat !== seat || !v.catColour) return null;
  const { at, scale } = CAT_SEATS[seat];
  return (
    <G transform={`translate(${at[0]} ${at[1]}) scale(${scale})`} stroke={shade(v.catColour)} strokeWidth={2.5}>
      {items.find((i) => i.kind === 'cat')!.draw(v.catColour)}
    </G>
  );
}

/** The time on the clock (every level) and what's on the television; the rest is chosen once things are placed. */
function details(random: Rng, { clockStep, hidden = 0, closeCounts = false }: DetailKnobs): SceneDetails {
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  const tv = random.pick(Object.keys(TV_SHOWS));
  return {
    values: { clock: time, tv, ...(hidden ? { peek: String(hidden) } : {}), ...(closeCounts ? { countShelves: '1' } : {}) },
    facts: [
      { id: 'clock-time', type: 'number', prompt: 'What time was on the clock?', answer: time, wrong: close, fallback: other, needs: 'wall-clock', everyLevel: true, spotlight: true },
      { id: 'tv-show', type: 'object', prompt: 'What was on the television?', answer: TV_SHOWS[tv], wrong: Object.values(TV_SHOWS).filter((s) => s !== TV_SHOWS[tv]), needs: 'tv' },
    ],
  };
}

/** The nearest counts first, never fewer than one. */
const nearCounts = (n: number) => [n - 1, n + 1, n - 2, n + 2, n + 3].filter((c) => c >= 1).map(String);

/** Which of two things (left, right, both, neither): the answers, as for the beach's coconuts. */
const WHICH_OF_TWO: Record<string, string> = { left: 'The one on the left', right: 'The one on the right', both: 'Both of them', none: 'Neither of them' };

/** Once things are placed: the lamps, the books on the shelves, the pets' toys, then a hiding pet. */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  const values = { ...d.values };
  const facts = [...(d.facts ?? [])];
  const alsoSeen = [...(d.alsoSeen ?? [])];
  const one = (kind: string) => groups.find((g) => g.kind === kind && g.count === 1);
  const count = (kind: string) => groups.find((g) => g.kind === kind)?.count ?? 0;

  // Lamps on or off: "Was the floor lamp on or off?" with one, "Which floor lamp was on?" with two; the same for
  // table lamps.
  for (const { kind, key, name } of [
    { kind: 'floor-lamp', key: 'lamps', name: 'floor lamp' },
    { kind: 'table-lamp', key: 'tableLamps', name: 'table lamp' },
  ]) {
    const lamps = count(kind);
    if (lamps === 1) {
      values[key] = random.next() < 0.5 ? 'on' : 'off';
      const answer = values[key] === 'on' ? 'On' : 'Off';
      facts.push({ id: `${kind}-on`, type: 'object', prompt: `Was the ${name} on or off?`, answer, wrong: [answer === 'On' ? 'Off' : 'On'], needs: kind });
    } else if (lamps === 2) {
      const r = random.next();
      values[key] = r < 0.35 ? 'left' : r < 0.7 ? 'right' : r < 0.85 ? 'both' : 'none';
      const answer = WHICH_OF_TWO[values[key]];
      facts.push({ id: `${kind}-on`, type: 'position', prompt: `Which ${name} was on?`, answer, wrong: Object.values(WHICH_OF_TWO).filter((a) => a !== answer), needs: kind });
    }
  }

  // From Level 14, with one bookshelf: 1 to 5 books on each shelf, and how many on one of them.
  if (values.countShelves && one('bookshelf')) {
    const counts = [0, 1, 2].map(() => random.int(1, BOOK_SLOTS.length));
    values.shelves = counts.join(',');
    const shelf = random.int(0, 2);
    const n = counts[shelf];
    facts.push({
      id: 'shelf-books',
      type: 'count',
      prompt: `How many books were on the ${['top', 'middle', 'bottom'][shelf]} shelf?`,
      answer: String(n),
      wrong: nearCounts(n).slice(0, 3),
      fallback: nearCounts(n).slice(3),
      needs: 'bookshelf',
    });
  }

  // One cat or one dog: what it was playing with. (With several, "the cat" wouldn't say which.)
  for (const animal of ['cat', 'dog'] as const) {
    if (!one(animal)) continue;
    const toys = PET_TOYS[animal];
    const toy = random.pick(Object.keys(toys));
    values[`${animal}Toy`] = toy;
    const other = PET_TOYS[animal === 'cat' ? 'dog' : 'cat'];
    facts.push({
      id: `${animal}-toy`,
      type: 'object',
      prompt: `What was the ${animal} playing with?`,
      answer: toys[toy],
      // Its other toys first, then one of the other pet's.
      wrong: [...Object.values(toys).filter((t) => t !== toys[toy]), random.pick(Object.values(other))],
      needs: animal,
    });
  }

  // From Level 20: a cat hiding behind the sofa or the potted plant, when no cat is in the room already.
  if (values.peek) {
    const choices = Object.entries(PET_SPOTS).flatMap(([spot, def]) =>
      one(spot) ? def.animals.filter((a) => !count(a)).map((animal) => ({ spot, animal })) : [],
    );
    if (choices.length) {
      const { spot, animal } = random.pick(choices);
      const answer = PET_SPOTS[spot].name;
      const colours = (animal === 'cat' ? items.find((i) => i.kind === 'cat')! : dog).colours!;
      values.pet = animal;
      values.petSpot = spot;
      values.petColour = random.pick(colours).hex;
      values.petSide = groups.find((g) => g.kind === spot)!.region === 'right' ? 'left' : 'right';
      alsoSeen.push(animal);
      facts.push({
        id: 'pet-hiding',
        type: 'position',
        prompt: `Where was the ${animal} hiding?`,
        answer,
        wrong: Object.values(PET_SPOTS).map((s) => s.name).filter((n) => n !== answer),
        fallback: ['Under the armchair', 'Behind the television', 'Behind the bookshelf'],
        spotlight: true,
      });
    }
  }
  // A cat curled up on the sofa or the armchair (one of it), when no cat is in the room or hiding: "Where was the
  // cat?" with places for answers, not just a side of the picture. About half the time there's a seat for it.
  if (!count('cat') && !values.pet) {
    const seats = Object.keys(CAT_SEATS).filter((seat) => one(seat));
    if (seats.length && random.next() < 0.5) {
      const seat = random.pick(seats);
      const answer = CAT_SEATS[seat].name;
      values.catSeat = seat;
      values.catColour = random.pick(items.find((i) => i.kind === 'cat')!.colours!).hex;
      alsoSeen.push('cat');
      facts.push({
        id: 'cat-seat',
        type: 'position',
        prompt: 'Where was the cat?',
        answer,
        wrong: [...Object.values(CAT_SEATS).map((s) => s.name).filter((n) => n !== answer), 'On the carpet', 'On the floor'],
        fallback: ['On the windowsill'],
      });
    }
  }
  return { ...d, values, facts, alsoSeen };
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
  fitDetails,
  zones: [
    { id: 'ceiling', label: 'On the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    // Things on the wall hang on two lines: a clock high up (top row of slots), the rest at eye level.
    { id: 'wall', label: 'On the wall', surface: 'wall', top: CEILING, bottom: FLOOR, rows: 2, minGroups: 2 },
    // A deeper back row for furniture against the wall, then two rows for things out on the floor.
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR, bottom: 1, rows: 3, rowSizes: [0.4, 0.3, 0.3], anchors: 2 },
  ],
  items,
  rug: RUG,
  places: ['On the sofa', 'On the armchair', 'On top of the bookshelf', 'On the windowsill'],
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
