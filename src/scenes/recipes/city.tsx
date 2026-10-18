import { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { C } from '../colours';
import { balloon, bird, cloudShape, dog, person, plane, tree } from '../items/common';
import { markIfClear, scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { ColourDef, DetailKnobs, ItemDef, Mark, Recipe, Rect as Box, SceneDetails } from '../types';
import { speckles } from '../texture';

/** Band edges, as fractions of the picture height. */
const ROOF = 0.25;
const GROUND_LINE = 0.53;
const KERB = 0.75;

const SKY = ['sky'];
const ROOFS = ['roofs'];
const PAVEMENT = ['pavement'];
const ROAD = ['road'];

/** A tyre with a hubcap, a shine on the hub and the wheel arch's shadow above it. */
const wheel = (cx: number, cy: number, r: number) => (
  <G stroke="none">
    <Circle cx={cx} cy={cy} r={r} fill="#222" />
    <Circle cx={cx} cy={cy} r={r * 0.62} fill="#343a40" />
    <Circle cx={cx} cy={cy} r={r * 0.45} fill="#adb5bd" />
    <Circle cx={cx} cy={cy} r={r * 0.15} fill="#6c757d" />
    <Path d={`M${cx - r * 0.3},${cy - r * 0.25} A${r * 0.38},${r * 0.38} 0 0 1 ${cx + r * 0.1},${cy - r * 0.38}`} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={r * 0.1} />
  </G>
);

const items: ItemDef[] = [
  { ...bird, zones: SKY, maxCount: 6 },
  // One plane at a time: two planes in the same patch of sky look like they're flying in formation.
  { ...plane, zones: SKY, maxCount: 1, countable: false },
  { ...balloon, zones: SKY, maxCount: 3 },
  {
    kind: 'helicopter',
    singular: 'helicopter',
    plural: 'helicopters',
    article: 'a',
    w: 150,
    h: 80,
    tier: 'medium',
    size: 0.18,
    zones: SKY,
    // One at a time, like the plane.
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.orange, C.green],
    draw: (colour) => (
      <G>
        {/* The spinning rotor, a blur either side of the blade. */}
        <Path d="M20,4 Q80,0 140,4 L140,12 Q80,8 20,12 Z" fill="#343a40" fillOpacity={0.15} stroke="none" />
        <Line x1={30} y1={8} x2={130} y2={8} stroke="#343a40" strokeWidth={5} strokeLinecap="round" />
        <Rect x={78} y={8} width={6} height={16} fill="#343a40" stroke="none" />
        <Path d="M12,36 L60,40 L60,48 L12,44 Z" fill={colour} />
        <Path d="M4,28 L14,28 L18,46 L8,46 Z" fill={colour} />
        <Circle cx={10} cy={30} r={7} fill="#343a40" fillOpacity={0.25} stroke="none" />
        <Path d="M56,30 C56,22 70,20 90,20 C116,20 138,30 140,46 C140,56 128,60 110,60 H70 C60,60 56,52 56,44 Z" fill={colour} />
        <G stroke="none">
          <Path d="M104,26 C118,27 130,34 132,44 H104 Z" fill="#cfe9ff" />
          <Path d="M108,30 L118,30 L110,40 Z" fill="#ffffff" fillOpacity={0.6} />
          <Path d="M86,24 V58" stroke="#000000" strokeOpacity={0.18} strokeWidth={2} />
          <Path d="M62,30 Q80,24 100,24" fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} />
          <Path d="M56,48 H140 C138,56 128,60 110,60 H70 C60,60 56,54 56,48 Z" fill="#000000" fillOpacity={0.12} />
        </G>
        <Line x1={74} y1={60} x2={70} y2={72} stroke="#343a40" strokeWidth={4} />
        <Line x1={118} y1={60} x2={122} y2={72} stroke="#343a40" strokeWidth={4} />
        <Line x1={60} y1={73} x2={134} y2={73} stroke="#343a40" strokeWidth={5} strokeLinecap="round" />
      </G>
    ),
  },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 80,
    h: 130,
    tier: 'small',
    size: 0.1,
    zones: ROOFS,
    maxCount: 3,
    // One flag per roof, standing on the roofline.
    spread: true,
    colours: [C.red, C.blue, C.yellow, C.green, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Rect x={2} y={120} width={20} height={10} rx={2} fill="#343a40" stroke="none" />
        <Line x1={12} y1={4} x2={12} y2={122} stroke="#495057" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={12} cy={4} r={5} fill="#ffd60a" stroke="none" />
        <Path d="M15,8 C34,2 54,16 78,8 V52 C54,60 34,46 15,52 Z" fill={colour} />
        {/* The cloth rippling in the wind: shade in the folds, light on the crests. */}
        <Path d="M30,6 C36,6 40,10 44,12 V54 C40,52 36,50 30,50 Z" fill="#000000" fillOpacity={0.14} stroke="none" />
        <Path d="M60,12 C64,12 68,10 70,10 V52 C68,52 64,54 60,54 Z" fill="#000000" fillOpacity={0.12} stroke="none" />
        <Path d="M17,12 C24,9 28,9 30,10 V18 C26,17 22,17 17,19 Z" fill="#ffffff" fillOpacity={0.3} stroke="none" />
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
    tier: 'medium',
    size: 0.13,
    zones: ROOFS,
    maxCount: 3,
    // One dish per roof, standing on the roofline.
    spread: true,
    tone: '#6c757d',
    draw: () => (
      <G>
        <Line x1={40} y1={50} x2={40} y2={74} stroke="#495057" strokeWidth={6} />
        <Rect x={26} y={70} width={28} height={10} rx={2} fill="#343a40" stroke="none" />
        <Path d="M8,10 C0,45 40,65 70,50 Z" fill="#6c757d" />
        <Path d="M14,16 C10,40 36,54 58,50" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        <Line x1={39} y1={30} x2={62} y2={12} stroke="#495057" strokeWidth={4} />
        <Circle cx={63} cy={11} r={5} fill="#495057" stroke="none" />
        <Circle cx={63} cy={11} r={2} fill="#e63946" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'clock',
    singular: 'street clock',
    plural: 'street clocks',
    article: 'a',
    w: 90,
    h: 230,
    tier: 'medium',
    size: 0.13,
    zones: PAVEMENT,
    maxCount: 1,
    // A clock on its own post, standing on the pavement like a street lamp (and, like it, never in front of the buildings).
    tone: '#343a40',
    countable: false,
    noFlip: true,
    // The time is chosen per picture (see `details`).
    draw: (_colour, details) => (
      <G>
        <Rect x={39} y={78} width={12} height={140} fill="#343a40" />
        {/* Rings round the post and a stepped base, like an old street clock. */}
        <G stroke="none" fill="#495057">
          <Rect x={35} y={100} width={20} height={6} rx={2} />
          <Rect x={35} y={190} width={20} height={6} rx={2} />
        </G>
        <Rect x={42} y={110} width={3} height={78} fill="#ffffff" fillOpacity={0.2} stroke="none" />
        <Rect x={27} y={214} width={36} height={16} rx={3} fill="#343a40" />
        <Rect x={31} y={206} width={28} height={10} rx={2} fill="#343a40" />
        <G transform="translate(4 1) scale(0.82)">
          <ClockFace time={details?.values?.clock ?? '10:10'} />
        </G>
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
    tier: 'large',
    size: 0.28,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange, C.purple, C.yellow],
    colourPrompt: (plural) => (plural ? 'What colour were the awnings on the market stalls?' : 'What colour was the awning on the market stall?'),
    draw: (colour) => (
      <G>
        <Rect x={12} y={50} width={7} height={110} fill="#5c3d1e" stroke="none" />
        <Rect x={161} y={50} width={7} height={110} fill="#5c3d1e" stroke="none" />
        <Rect x={8} y={105} width={164} height={55} fill="#a0612b" stroke="#5c3d1e" />
        <G stroke="none">
          {/* Planks on the counter, then the fruit, each with a shine. */}
          <Path d="M8,124 H172 M8,142 H172 M60,105 V160 M120,105 V160" stroke="#5c3d1e" strokeOpacity={0.5} strokeWidth={2} />
          <Circle cx={40} cy={100} r={12} fill="#e63946" />
          <Circle cx={64} cy={100} r={12} fill="#f77f00" />
          <Circle cx={88} cy={100} r={12} fill="#ffd60a" />
          <Circle cx={112} cy={100} r={12} fill="#2b9348" />
          <Circle cx={136} cy={100} r={12} fill="#e63946" />
          {[40, 64, 88, 112, 136].map((x) => (
            <Circle key={x} cx={x - 4} cy={96} r={3} fill="#ffffff" fillOpacity={0.6} />
          ))}
          <Path d="M40,88 L42,84 M136,88 L138,84" stroke="#5c3d1e" strokeWidth={2} />
          <Rect x={8} y={105} width={164} height={5} fill="#ffffff" fillOpacity={0.2} />
        </G>
        <Path d="M10,0 H170 L180,45 Q165,62 150,45 Q135,62 120,45 Q105,62 90,45 Q75,62 60,45 Q45,62 30,45 Q15,62 0,45 Z" fill={colour} />
        <G fill="#ffffff" fillOpacity={0.75} stroke="none">
          <Polygon points="42,0 62,0 64,45 40,45" />
          <Polygon points="106,0 126,0 132,45 108,45" />
        </G>
        <Path d="M10,0 H170 L172,8 H8 Z" fill="#000000" fillOpacity={0.15} stroke="none" />
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
    tier: 'medium',
    size: 0.18,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.brown, C.yellow],
    draw: (colour) => (
      <G>
        <Rect x={14} y={45} width={8} height={30} fill="#343a40" stroke="none" />
        <Rect x={118} y={45} width={8} height={30} fill="#343a40" stroke="none" />
        <Path d="M2,36 Q0,24 12,22 M138,36 Q140,24 128,22" fill="none" stroke="#343a40" strokeWidth={4} strokeLinecap="round" />
        <Rect x={4} y={8} width={132} height={14} rx={3} fill={colour} />
        <Rect x={0} y={36} width={140} height={14} rx={3} fill={colour} />
        <G stroke="none">
          <Path d="M6,9 H134 V12 H6 Z M2,37 H138 V40 H2 Z" fill="#ffffff" fillOpacity={0.35} />
          <Path d="M20,16 H64 M80,15 H122 M14,44 H60 M78,44 H128" stroke="#000000" strokeOpacity={0.14} strokeWidth={1.5} />
        </G>
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
    tier: 'small',
    size: 0.1,
    zones: PAVEMENT,
    maxCount: 3,
    colours: [C.green, C.black, C.blue, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M6,14 H49 L44,85 H11 Z" fill={colour} />
        <Rect x={2} y={4} width={51} height={12} rx={4} fill={colour} />
        <G stroke="none">
          {/* A handle on the lid, a slot, ribs and a light edge. */}
          <Rect x={20} y={0} width={15} height={5} rx={2} fill="#343a40" />
          <Rect x={14} y={20} width={27} height={5} rx={2} fill="#000000" fillOpacity={0.35} />
          <Path d="M10,16 L15,82 H19 L14,16 Z" fill="#ffffff" fillOpacity={0.25} />
        </G>
        <Line x1={20} y1={30} x2={22} y2={74} stroke="#00000033" strokeWidth={3} />
        <Line x1={35} y1={30} x2={33} y2={74} stroke="#00000033" strokeWidth={3} />
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
    tier: 'medium',
    size: 0.18,
    // Parked: leaning against the building front (a bicycle can't stand on its own), side by side, clear of doors.
    backRow: true,
    zones: PAVEMENT,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.black, C.pink],
    colourPrompt: (plural) => (plural ? 'What colour were the bicycles?' : 'What colour was the bicycle?'),
    draw: (colour) => (
      <G>
        <Circle cx={24} cy={51} r={21} fill="none" stroke="#222" strokeWidth={5} />
        <Circle cx={91} cy={51} r={21} fill="none" stroke="#222" strokeWidth={5} />
        <G stroke="#adb5bd" strokeWidth={1.5}>
          <Path d="M24,32 V70 M5,51 H43 M11,38 L37,64 M37,38 L11,64" />
          <Path d="M91,32 V70 M72,51 H110 M78,38 L104,64 M104,38 L78,64" />
        </G>
        <Circle cx={56} cy={51} r={6} fill="none" stroke="#495057" strokeWidth={3} />
        <Path d="M24,51 L46,18 L82,18 L91,51 M46,18 L56,51 L82,18 M24,51 H56" fill="none" stroke={colour} strokeWidth={7} strokeLinejoin="round" />
        <Line x1={42} y1={10} x2={54} y2={10} stroke="#222" strokeWidth={6} strokeLinecap="round" />
        <Path d="M82,18 L78,6 H92" fill="none" stroke="#222" strokeWidth={5} strokeLinecap="round" />
        <Path d="M10,40 Q24,24 38,40" fill="none" stroke={colour} strokeWidth={4} />
      </G>
    ),
  },
  {
    kind: 'hydrant',
    singular: 'fire hydrant',
    plural: 'fire hydrants',
    article: 'a',
    // Squat, so at its smallest size (44 pt wide) it stays well under knee height of a person.
    w: 66,
    h: 62,
    tier: 'small',
    size: 0.1,
    // At the kerb (the front edge of the pavement, by the road), at most one per building so they are
    // always well apart. On Hard each one may be a different colour.
    frontRow: true,
    spread: true,
    mixedColours: true,
    zones: PAVEMENT,
    maxCount: 2,
    colours: [C.red, C.yellow, C.orange],
    draw: (colour) => (
      <G>
        <Rect x={19} y={16} width={28} height={40} rx={5} fill={colour} />
        <Rect x={6} y={26} width={54} height={13} rx={5} fill={colour} />
        <Path d="M19,18 C19,2 47,2 47,18 Z" fill={colour} />
        <Rect x={13} y={54} width={40} height={8} rx={2} fill={colour} />
        <G stroke="none">
          {/* A nut on top, bolts on the side caps, a shine down the body. */}
          <Rect x={29} y={0} width={8} height={6} rx={1} fill="#495057" />
          <Circle cx={10} cy={32.5} r={3} fill="#495057" />
          <Circle cx={56} cy={32.5} r={3} fill="#495057" />
          <Rect x={23} y={20} width={5} height={32} rx={2} fill="#ffffff" fillOpacity={0.35} />
          <Path d="M19,16 H47 V20 H19 Z" fill="#000000" fillOpacity={0.15} />
        </G>
      </G>
    ),
  },
  {
    kind: 'lamp-post',
    singular: 'street lamp',
    plural: 'street lamps',
    article: 'a',
    w: 70,
    h: 200,
    tier: 'small',
    size: 0.1,
    // Stands on the pavement, no taller than the pavement is deep, so it never covers a window or door.
    spread: true,
    zones: PAVEMENT,
    maxCount: 2,
    tone: '#343a40',
    draw: () => (
      <G>
        {/* A warm glow round the lamp. */}
        <Circle cx={35} cy={22} r={34} fill="#fff3b0" fillOpacity={0.3} stroke="none" />
        <Rect x={31} y={40} width={8} height={152} fill="#343a40" />
        <Rect x={33} y={48} width={2} height={136} fill="#ffffff" fillOpacity={0.25} stroke="none" />
        <Rect x={27} y={150} width={16} height={6} rx={2} fill="#495057" stroke="none" />
        <Rect x={21} y={188} width={28} height={12} rx={3} fill="#343a40" />
        <Path d="M10,6 L35,-2 L60,6 Z" fill="#343a40" stroke="none" />
        <Rect x={13} y={0} width={44} height={44} rx={6} fill="#343a40" />
        <Rect x={20} y={7} width={30} height={30} fill="#fff3b0" stroke="none" />
        <Path d="M35,7 V37 M20,22 H50" stroke="#343a40" strokeWidth={2} />
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
    tier: 'xl',
    size: 0.36,
    wide: true,
    zones: ROAD,
    maxCount: 3,
    colours: [C.red, C.blue, C.yellow, C.green, C.white, C.black, C.orange],
    // Faces right, like every vehicle drawing (the road's one-way rule mirrors them all together).
    draw: (colour) => (
      <G>
        <G transform="translate(177 0) scale(-1 1)">
          <Path d="M5,62 V42 C5,34 12,30 20,30 H40 L62,6 H122 L145,30 H158 C166,30 172,36 172,44 V62 Z" fill={colour} />
          <Path d="M70,12 H95 V30 H50 Z M101,12 H118 L136,30 H101 Z" fill="#cfe9ff" stroke="none" />
        </G>
        <G stroke="none">
          {/* Door seams, handles, glare on the glass, a bumper, and light along the body. */}
          <Path d="M76,30 V60 M122,30 V60" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Rect x={86} y={38} width={10} height={3} rx={1.5} fill="#000000" fillOpacity={0.3} />
          <Rect x={130} y={38} width={10} height={3} rx={1.5} fill="#000000" fillOpacity={0.3} />
          <Path d="M100,12 L110,12 L96,28 L90,28 Z M66,14 L72,14 L62,28 L56,28 Z" fill="#ffffff" fillOpacity={0.55} />
          <Path d="M10,36 H168" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} />
          <Rect x={3} y={54} width={171} height={6} rx={3} fill="#000000" fillOpacity={0.2} />
        </G>
        <Rect x={163} y={36} width={9} height={8} rx={2} fill="#fff3b0" stroke="none" />
        <Rect x={5} y={36} width={6} height={9} rx={2} fill="#d00000" stroke="none" />
        {wheel(43, 64, 18)}
        {wheel(135, 64, 18)}
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
    tier: 'xl',
    size: 0.58,
    wide: true,
    zones: ROAD,
    maxCount: 1,
    colours: [C.red, C.blue, C.yellow, C.green, C.white],
    draw: (colour) => (
      <G>
        <Rect x={2} y={2} width={226} height={88} rx={12} fill={colour} />
        <G fill="#cfe9ff" stroke="none">
          <Rect x={14} y={14} width={36} height={30} rx={4} />
          <Rect x={58} y={14} width={36} height={30} rx={4} />
          <Rect x={102} y={14} width={36} height={30} rx={4} />
          <Rect x={146} y={14} width={36} height={30} rx={4} />
          <Rect x={190} y={14} width={30} height={50} rx={4} />
        </G>
        <G stroke="none">
          {/* Passengers in the windows, glare, a stripe along the side, the door's split, and the roof's shine. */}
          <G fill="#495057" fillOpacity={0.45}>
            <Circle cx={32} cy={34} r={6} />
            <Circle cx={120} cy={32} r={6} />
            <Circle cx={164} cy={34} r={6} />
          </G>
          <Path d="M18,16 H28 L18,30 Z M62,16 H72 L62,30 Z M106,16 H116 L106,30 Z M150,16 H160 L150,30 Z" fill="#ffffff" fillOpacity={0.6} />
          <Rect x={2} y={52} width={226} height={8} fill="#ffffff" fillOpacity={0.45} />
          <Path d="M205,16 V62" stroke="#000000" strokeOpacity={0.25} strokeWidth={2} />
          <Rect x={10} y={4} width={210} height={5} rx={2} fill="#ffffff" fillOpacity={0.3} />
          <Rect x={2} y={80} width={226} height={8} rx={3} fill="#000000" fillOpacity={0.2} />
        </G>
        <Rect x={221} y={68} width={6} height={12} rx={2} fill="#fff3b0" stroke="none" />
        <Rect x={3} y={66} width={5} height={14} rx={2} fill="#d00000" stroke="none" />
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
    w: 100,
    h: 110,
    tier: 'large',
    size: 0.22,
    zones: ROAD,
    maxCount: 2,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.white],
    colourPrompt: (plural) => (plural ? 'What colour were the scooters?' : 'What colour was the scooter?'),
    // A motor scooter on the move, so it has a rider (helmet and dark jacket, so the scooter's colour is the
    // only colour to remember): rear body and seat, low footboard, front shield, handlebars and headlight.
    draw: (colour) => (
      <G>
        <G stroke="none">
          <Path d="M30,64 L58,90 L64,86 L40,58 Z" fill="#343a40" />
          <Path d="M24,30 C24,22 30,18 38,18 L48,20 L52,60 L28,62 Z" fill="#495057" />
          <Path d="M44,28 L86,32" stroke="#495057" strokeWidth={8} strokeLinecap="round" />
          <Circle cx={36} cy={12} r={12} fill="#343a40" />
          <Path d="M38,6 H48 V16 H40 Z" fill="#a5d8ff" />
        </G>
        <G transform="translate(0 28)">
          <Path d="M6,64 C4,46 16,36 36,38 L46,58 H70 L72,66 H8 Z" fill={colour} />
          <Path d="M66,66 L76,22 C77,16 86,14 88,20 L90,66 Z" fill={colour} />
          <Path d="M10,56 C10,46 18,42 32,42 M78,26 L72,58" fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
          <Line x1={82} y1={18} x2={80} y2={6} stroke="#343a40" strokeWidth={5} strokeLinecap="round" />
          <Line x1={70} y1={6} x2={94} y2={6} stroke="#343a40" strokeWidth={5} strokeLinecap="round" />
          <Circle cx={88} cy={28} r={5} fill="#fff3b0" stroke="#343a40" strokeWidth={2} />
          {wheel(22, 68, 13)}
          {wheel(80, 68, 13)}
        </G>
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
    tier: 'xl',
    size: 0.42,
    wide: true,
    zones: ROAD,
    maxCount: 2,
    colours: [C.white, C.blue, C.red, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M4,78 V14 C4,8 8,4 14,4 H130 L170,38 C180,40 186,46 186,54 V78 Z" fill={colour} />
        <G stroke="none">
          <Path d="M134,12 L162,38 H134 Z" fill="#cfe9ff" />
          <Path d="M138,16 L146,16 L140,30 L136,30 Z" fill="#ffffff" fillOpacity={0.6} />
          {/* The sliding side door, handles, a light line along the roof, and a bumper. */}
          <Path d="M92,12 V76 M128,8 V76" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Rect x={98} y={40} width={10} height={3} rx={1.5} fill="#000000" fillOpacity={0.3} />
          <Rect x={8} y={8} width={120} height={4} rx={2} fill="#ffffff" fillOpacity={0.35} />
          <Rect x={4} y={70} width={182} height={6} rx={3} fill="#000000" fillOpacity={0.2} />
        </G>
        <Rect x={178} y={54} width={8} height={9} rx={2} fill="#fff3b0" stroke="none" />
        <Rect x={4} y={56} width={6} height={12} rx={2} fill="#d00000" stroke="none" />
        {wheel(42, 80, 18)}
        {wheel(150, 80, 18)}
      </G>
    ),
  },
];

type Palette = Record<string, string>;

/** One building front per third of the picture. */
const FACADES = [0, 1, 2];

/**
 * Every building front, in fractions of the picture, worked out from the roof and pavement lines so
 * the parts never overlap: two upper-floor windows, and on the ground floor a door to one side
 * (alternating) and a shop window on the other. Street lamps, trees and the clock never stand in front
 * of a door. Exported for the scene checker.
 */
export function facade(i: number) {
  const t0 = i / 3;
  const t1 = (i + 1) / 3;
  const c = (t0 + t1) / 2;
  const wall = GROUND_LINE - ROOF;
  const upper = { y0: ROOF + wall * 0.07, y1: ROOF + wall * 0.29 };
  // Doors on the left, right, right: no two doors (or house numbers) end up side by side. Side buildings alternate.
  const doorLeft = i === 0 ? true : i === 1 || i === 2 ? false : ((i % 2) + 2) % 2 === 0;
  const doorX = doorLeft ? t0 + 0.03 : t1 - 0.12;
  const shopX = doorLeft ? t1 - 0.15 : t0 + 0.05;
  return {
    windows: [
      { x0: c - 0.11, x1: c - 0.035, ...upper },
      { x0: c + 0.035, x1: c + 0.11, ...upper },
      { x0: shopX, x1: shopX + 0.1, y0: ROOF + wall * 0.45, y1: ROOF + wall * 0.8 },
    ],
    // A little taller than a person, with the house-number plaque above it.
    door: { x0: doorX, y0: ROOF + wall * 0.46, x1: doorX + 0.09, y1: GROUND_LINE },
    plaque: { x0: doorX - 0.005, y0: ROOF + wall * 0.32, x1: doorX + 0.095, y1: ROOF + wall * 0.43 },
  };
}

function cityPalette(sky: string, facades: string[], window: string): Palette {
  return {
    sky,
    window,
    pavement: '#ced4da',
    road: '#3a4046',
    ...Object.fromEntries(FACADES.map((i) => [`facade${i}`, facades[i]])),
  };
}

const PALETTES: Record<string, Palette> = {
  day: cityPalette('#8cc8f5', ['#e9c46a', '#f4a261', '#b5838d'], '#dff1ff'),
  sunset: cityPalette('#ffa98a', ['#c9ada7', '#9a8c98', '#e5989b'], '#fff3bf'),
};

function surfaceAt(x: number, y: number): string {
  if (y < ROOF) return 'sky';
  if (y < GROUND_LINE) return `facade${Math.min(2, Math.max(0, Math.floor(x * 3)))}`;
  if (y < KERB) return 'pavement';
  return 'road';
}

/** Background: sky, three building fronts with their windows and doors, pavement, kerb and road. */
/** Named house colours, so "the yellow house" means something. Each street uses three different ones. */
export const HOUSE_COLOURS: ColourDef[] = [
  { name: 'Yellow', hex: '#f2c94c' },
  { name: 'Blue', hex: '#86b3e0' },
  { name: 'Green', hex: '#93c47d' },
  { name: 'Pink', hex: '#eaa1bd' },
  { name: 'Orange', hex: '#f4a261' },
  { name: 'Purple', hex: '#b39ddb' },
];

/** Plain fronts for the extra buildings wide screens show beyond the picture: no numbers, no named colours. */
const SIDE_BUILDINGS = ['#cfc6b8', '#bdb4a6', '#d8d1c5'];

/**
 * This street's three houses, left to right: different named colours, and house numbers that rise
 * along the street with uneven gaps (like 1204, 1210, 1236), so each one has to be remembered.
 */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const colours = random.shuffle(HOUSE_COLOURS).slice(0, 3);
  let number = 2 * random.int(50, 4800);
  const houses = colours.map((colour, i) => {
    if (i > 0) number += random.pick([2, 4, 6, 8, 10, 12, 16, 20, 24, 30]);
    return { colour, number };
  });
  // The street clock's time: asked on every level whenever the clock is in the picture.
  const time = randomTime(random, clockStep);
  const { close, other } = timeLookalikes(time, clockStep);
  return {
    houses,
    palette: Object.fromEntries(houses.map((h, i) => [`facade${i}`, h.colour.hex])),
    values: { clock: time },
    facts: [{ id: 'clock-time', type: 'number', prompt: 'What time was on the street clock?', answer: time, wrong: close, fallback: other, needs: 'clock', everyLevel: true, spotlight: true }],
  };
}

function backdrop(height: number, palette: Palette, details?: SceneDetails) {
  const colourOf = (i: number) =>
    i >= 0 && i <= 2 ? (details?.houses?.[i].colour.hex ?? palette[`facade${i}`]) : SIDE_BUILDINGS[((i % 3) + 3) % 3];
  const roof = height * ROOF;
  const ground = height * GROUND_LINE;
  const kerb = height * KERB;
  // The three buildings in the picture, plus more on each side for screens wider than the picture.
  const buildings = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
  const r = (f: { x0: number; y0: number; x1: number; y1: number }) => ({ x: f.x0 * 900, y: f.y0 * height, width: (f.x1 - f.x0) * 900, height: (f.y1 - f.y0) * height });
  return (
    <G>
      <Rect x={-900} y={-600} width={2700} height={roof + 600} fill={palette.sky} />
      {buildings.map((i) => (
        <Rect key={i} x={i * 300} y={roof} width={300} height={ground - roof} fill={colourOf(i)} />
      ))}
      {/* Faint brick courses, then a cornice along every roof. */}
      <G stroke="#000000" strokeOpacity={0.05} strokeWidth={2}>
        {Array.from({ length: Math.ceil((ground - roof) / 22) }, (_, k) => (
          <Path key={k} d={`M-900,${roof + 22 * (k + 1)} H1800`} />
        ))}
      </G>
      <Rect x={-900} y={roof} width={2700} height={10} fill="#000000" fillOpacity={0.18} />
      <Rect x={-900} y={roof + 10} width={2700} height={5} fill="#ffffff" fillOpacity={0.25} />
      {buildings.map((i) => (
        <Rect key={i} x={i * 300 - 2} y={roof} width={4} height={ground - roof} fill="#000000" fillOpacity={0.18} />
      ))}
      {buildings.map((i) => {
        const f = facade(i);
        return (
          <G key={i}>
            {f.windows.map((w) => {
              const b = r(w);
              return (
                <G key={w.x0}>
                  <Rect {...b} fill={palette.window} stroke="#ffffff" strokeWidth={6} />
                  {/* A glint across the glass, a frame bar and a sill. */}
                  <Path d={`M${b.x + b.width * 0.1},${b.y + b.height * 0.55} L${b.x + b.width * 0.55},${b.y + b.height * 0.1} L${b.x + b.width * 0.72},${b.y + b.height * 0.1} L${b.x + b.width * 0.1},${b.y + b.height * 0.78} Z`} fill="#ffffff" fillOpacity={0.45} />
                  <Rect x={b.x + b.width / 2 - 2} y={b.y} width={4} height={b.height} fill="#ffffff" />
                  <Rect x={b.x - 8} y={b.y + b.height + 3} width={b.width + 16} height={7} fill="#ffffff" fillOpacity={0.85} />
                </G>
              );
            })}
            <Rect {...r(f.door)} fill="#6b4226" stroke="#3d2412" strokeWidth={4} />
            {/* Panels on the door and a step in front of it. */}
            <Rect x={f.door.x0 * 900 + 10} y={f.door.y0 * height + 12} width={(f.door.x1 - f.door.x0) * 900 - 20} height={(f.door.y1 - f.door.y0) * height * 0.32} rx={3} fill="#000000" fillOpacity={0.15} />
            <Rect x={f.door.x0 * 900 + 10} y={f.door.y0 * height + (f.door.y1 - f.door.y0) * height * 0.5} width={(f.door.x1 - f.door.x0) * 900 - 20} height={(f.door.y1 - f.door.y0) * height * 0.38} rx={3} fill="#000000" fillOpacity={0.15} />
            <Circle cx={(f.door.x1 - 0.012) * 900} cy={((f.door.y0 + f.door.y1) / 2) * height} r={4} fill="#ffd60a" />
            {/* House number above the door, on the three houses in the picture only. */}
            {details?.houses?.[i] && (
              <G>
                <Rect {...r(f.plaque)} rx={6} fill="#ffffff" stroke="#343a40" strokeWidth={3} />
                <SvgText
                  x={((f.plaque.x0 + f.plaque.x1) / 2) * 900}
                  y={((f.plaque.y0 + f.plaque.y1) / 2) * height}
                  fontSize={Math.min(30, (f.plaque.y1 - f.plaque.y0) * height * 0.7)}
                  fontWeight="bold" fontFamily="Arial"
                  fill="#212529"
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {details.houses[i].number}
                </SvgText>
              </G>
            )}
          </G>
        );
      })}
      <Rect x={-900} y={ground} width={2700} height={kerb - ground} fill={palette.pavement} />
      {/* Paving slabs. */}
      <G stroke="#000000" strokeOpacity={0.07} strokeWidth={2}>
        <Path d={`M-900,${(ground + kerb) / 2} H1800`} />
        {Array.from({ length: 36 }, (_, k) => (
          <Path key={k} d={`M${-900 + k * 75},${ground} V${kerb}`} />
        ))}
      </G>
      <Rect x={-900} y={kerb} width={2700} height={height - kerb + 600} fill={palette.road} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: kerb, x1: 940, y1: height }, 260, '#000000', 0.16, 3)}
      {speckles({ x0: -40, y0: kerb, x1: 940, y1: height }, 120, '#ffffff', 0.1, 3, 19)}
      <Rect x={-900} y={kerb} width={2700} height={12} fill="#868e96" />
      <Rect x={-900} y={kerb} width={2700} height={3} fill="#ffffff" fillOpacity={0.4} />
      {/* A dashed white line along the road, low down, under the traffic. */}
      <G fill="#ffffff" fillOpacity={0.7}>
        {Array.from({ length: 14 }, (_, k) => (
          <Rect key={k} x={-880 + k * 200} y={height - (height - kerb) * 0.12} width={100} height={6} />
        ))}
      </G>
    </G>
  );
}

/** Road markings (left out where a vehicle is) and white clouds kept clear of everything in the sky. */
function marks(height: number, boxes: Box[], random: () => number): Mark[] {
  const roof = height * ROOF;
  const dashY = height * ((KERB + 1) / 2);
  const out: Mark[] = [];
  for (const x of [40, 280, 520, 760]) {
    out.push(...markIfClear({ x0: x, y0: dashY - 4, x1: x + 100, y1: dashY + 4 }, boxes, 0.35, <Rect key={`r${x}`} x={x} y={dashY - 4} width={100} height={8} fill="#f8f9fa" fillOpacity={0.35} />));
  }
  out.push(...scatterMarks({ x0: -100, y0: height * 0.02, x1: 1000, y1: roof * 0.6 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true));
  return out;
}

export const city: Recipe = {
  id: 'city',
  title: 'City street',
  zones: [
    // The roofs band overlaps the bottom of the sky: flags and dishes stand on the roofline against the sky.
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: ROOF, rows: 2 },
    { id: 'roofs', label: 'On the roofs', surface: 'ground', top: ROOF - 0.14, bottom: ROOF, rows: 1, flush: true, panels: true, maxGroups: 2 },
    { id: 'buildings', label: 'On the buildings', surface: 'wall', top: ROOF, bottom: GROUND_LINE, rows: 0 },
    { id: 'pavement', label: 'On the pavement', surface: 'ground', top: GROUND_LINE, bottom: KERB, rows: 2 },
    // One lane of traffic: every vehicle faces the same way. Vehicle drawings all face right.
    { id: 'road', label: 'On the road', surface: 'ground', top: KERB, bottom: 1, rows: 1, oneWay: true, maxGroups: 2 },
  ],
  items,
  // Nothing covers a door or the number above it.
  keepClear: FACADES.map((i) => {
    const f = facade(i);
    return { x0: f.plaque.x0, y0: f.plaque.y0, x1: f.plaque.x1, y1: f.door.y1 };
  }),
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the rooftops.
    { top: 0, bottom: ROOF, from: ['#ffffff', 0], to: ['#ffffff', 0.18] },
    // Sun on the upper floors, shade at street level.
    { top: ROOF, bottom: GROUND_LINE, from: ['#ffffff', 0.1], to: ['#000000', 0.08] },
    // The buildings' shadow on the pavement.
    { top: GROUND_LINE, bottom: KERB, from: ['#000000', 0.1], to: ['#000000', 0] },
    // The road, darker in front.
    { top: KERB, bottom: 1, from: ['#000000', 0], to: ['#000000', 0.12] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
