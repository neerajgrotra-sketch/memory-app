import { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { bird, cloudShape, dog, person, plane, sun } from '../items/common';
import { lineMarks, scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { glints, speckles } from '../texture';

/**
 * A ski resort: the sky with cable cars, the snowy peaks, the ski slope, and the area by the lodge at
 * the bottom. Band edges as fractions of the picture height.
 *
 * Scale: a wide scene sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a skier about
 * 1.7 m long on their skis, a snowman 1.6 m, a pine tree about 4 m (a young one, so it fits on small
 * phones), a cable car cabin about 2.5 m. Snow is a contrast challenge: white and yellow things can't
 * be seen on it, so the colour rules leave those colours out; the white snowman is checked by its dark
 * outline, which is what really makes it visible.
 */
const SKY = 0.22;
const PEAKS = 0.34;
const SLOPE = 0.36;
const FENCE = 0.645;
const BASE = 0.68;

/** The ski run sign, on the fence in the middle; nothing may stand in front of it. */
const SIGN = { x0: 0.33, y0: 0.6, x1: 0.67, y1: 0.672 };

const IN_SKY = ['sky'];
const ON_SLOPE = ['slope'];
const AT_LODGE = ['lodge'];

/** Winter coats: no white or yellow, which vanish on snow. */
const COATS = [C.red, C.blue, C.green, C.orange, C.purple, C.pink];

const skis = (colour: string) => <Path d="M2,104 H98 Q106,104 108,96" fill="none" stroke={colour} strokeWidth={5} strokeLinecap="round" />;

/** Wild animals a mountain danger sign warns about. */
const DANGER_ANIMALS = ['Deer', 'Bear', 'Wolf', 'Moose', 'Fox'];

/**
 * Where the danger sign's animal can hide on harder levels, peeking out from behind something (one of
 * each in the picture, so "behind the pine tree" means one place): where its head is, in the thing's own
 * drawing units, for a clear peek (head and ears) and a small one (ears and eyes), and how it's named.
 */
const HIDING_SPOTS: Record<string, { name: string; clear: [number, number]; small: [number, number] }> = {
  // Out from behind the lowest branches, on the right.
  pine: { name: 'Behind the pine tree', clear: [98, 126], small: [92, 132] },
  // Over the seat at the back.
  snowmobile: { name: 'Behind the snowmobile', clear: [24, 38], small: [24, 52] },
  // Over the roof, on the right.
  'cocoa-stand': { name: 'Behind the hot chocolate stand', clear: [130, 8], small: [134, 18] },
};

/** The hiding animal, drawn behind the thing at `kind` when the picture's details put it there. */
function peeking(kind: string, details?: SceneDetails) {
  if (details?.values?.hiding !== kind) return null;
  const spot = HIDING_SPOTS[kind];
  const small = details.values.peek === '2';
  const [x, y] = small ? spot.small : spot.clear;
  return (
    <G transform={`translate(${x} ${y}) scale(${small ? 1.15 : 1.35})`} stroke="#212529" strokeOpacity={0.55} strokeWidth={1.5}>
      {animalHead(details.values.animal ?? 'Bear')}
    </G>
  );
}

/** A wild animal's head, about 40 across, centred on 0,0 (ears and antlers above). */
function animalHead(animal: string) {
  const eyes = (fill = '#111111') => (
    <G stroke="none">
      <Circle cx={-5} cy={-2} r={2.2} fill={fill} />
      <Circle cx={5} cy={-2} r={2.2} fill={fill} />
    </G>
  );
  switch (animal) {
    case 'Wolf':
      return (
        <G>
          <Path d="M-13,-2 L-9,-21 L-2,-9 Z M13,-2 L9,-21 L2,-9 Z" fill="#6c757d" />
          <Circle cx={0} cy={0} r={12} fill="#6c757d" />
          <Ellipse cx={0} cy={7} rx={6} ry={5} fill="#ced4da" />
          <Circle cx={0} cy={5} r={2.4} fill="#111111" stroke="none" />
          {eyes('#ffb703')}
        </G>
      );
    case 'Fox':
      return (
        <G>
          <Path d="M-12,-2 L-9,-20 L-2,-9 Z M12,-2 L9,-20 L2,-9 Z" fill="#e8590c" />
          <Path d="M-10,-14 L-9,-20 L-6,-15 Z M10,-14 L9,-20 L6,-15 Z" fill="#212529" stroke="none" />
          <Circle cx={0} cy={0} r={11} fill="#e8590c" />
          <Path d="M-11,3 Q0,14 11,3 Q6,10 0,11 Q-6,10 -11,3 Z" fill="#ffffff" stroke="none" />
          <Circle cx={0} cy={7} r={2.2} fill="#111111" stroke="none" />
          {eyes()}
        </G>
      );
    case 'Deer':
      return (
        <G>
          <Path d="M-6,-12 L-10,-24 M-10,-20 L-15,-23 M6,-12 L10,-24 M10,-20 L15,-23" fill="none" stroke="#6b4423" strokeWidth={2.5} strokeLinecap="round" strokeOpacity={1} />
          <Ellipse cx={-13} cy={-8} rx={7} ry={4} fill="#a0703c" transform="rotate(-25 -13 -8)" />
          <Ellipse cx={13} cy={-8} rx={7} ry={4} fill="#a0703c" transform="rotate(25 13 -8)" />
          <Ellipse cx={0} cy={0} rx={10} ry={13} fill="#a0703c" />
          <Ellipse cx={0} cy={9} rx={5} ry={4} fill="#6b4423" stroke="none" />
          {eyes()}
        </G>
      );
    case 'Moose':
      return (
        <G>
          <Path d="M-6,-12 Q-16,-12 -22,-24 Q-14,-20 -12,-26 Q-8,-18 -6,-22 Z M6,-12 Q16,-12 22,-24 Q14,-20 12,-26 Q8,-18 6,-22 Z" fill="#c9a26b" />
          <Ellipse cx={0} cy={2} rx={10} ry={15} fill="#5c3a1e" />
          <Ellipse cx={0} cy={12} rx={7} ry={5} fill="#3d2412" stroke="none" />
          {eyes('#f8f9fa')}
        </G>
      );
    default:
      // A bear.
      return (
        <G>
          <Circle cx={-10} cy={-11} r={5.5} fill="#6b4423" />
          <Circle cx={10} cy={-11} r={5.5} fill="#6b4423" />
          <Circle cx={0} cy={0} r={14} fill="#6b4423" />
          <G stroke="none">
            <Circle cx={-10} cy={-11} r={2.5} fill="#a07850" />
            <Circle cx={10} cy={-11} r={2.5} fill="#a07850" />
            <Ellipse cx={0} cy={6} rx={7} ry={5} fill="#a07850" />
            <Circle cx={0} cy={4} r={2.5} fill="#111111" />
          </G>
          {eyes()}
        </G>
      );
  }
}

const items: ItemDef[] = [
  { ...sun, zones: IN_SKY, maxCount: 1, countable: false },
  { ...bird, zones: IN_SKY, maxCount: 4 },
  { ...plane, zones: IN_SKY, maxCount: 1, countable: false },
  {
    kind: 'cable-car',
    singular: 'cable car',
    plural: 'cable cars',
    article: 'a',
    w: 140,
    h: 130,
    tier: 'large',
    // A cabin about 2.5 m wide, hanging from its cable.
    size: 0.22,
    zones: IN_SKY,
    maxCount: 2,
    spread: true,
    // Its cable runs right across the sky, so cabins are never mirrored (every cable stays parallel), and
    // it's drawn behind everything else, so the cable never crosses in front of a bird or a plane.
    noFlip: true,
    behind: true,
    // The light starts below the pulley, so the cable reads as one line.
    hanger: 16,
    colours: [C.red, C.blue, C.green, C.orange],
    draw: (colour) => (
      <G>
        {/* The cable, running on off both sides of the picture (same slope as the stub it replaces). */}
        <Path d="M-1500,95.7 L1640,-83.7" stroke="#495057" strokeWidth={4} />
        <Rect x={64} y={6} width={12} height={10} rx={3} fill="#495057" />
        <Rect x={68} y={14} width={4} height={30} fill="#495057" stroke="none" />
        <Rect x={20} y={42} width={100} height={84} rx={14} fill={colour} />
        <G stroke="none" fill="#cfe9f7">
          <Rect x={30} y={54} width={36} height={34} rx={5} />
          <Rect x={74} y={54} width={36} height={34} rx={5} />
        </G>
        <G stroke="none">
          {/* Skiers looking out, glare on the glass, a roof, a door seam, a stripe and a pulley on the cable. */}
          <Circle cx={44} cy={78} r={6} fill="#495057" />
          <Rect x={37} y={83} width={14} height={6} rx={3} fill="#495057" />
          <Circle cx={94} cy={78} r={6} fill="#495057" />
          <Rect x={87} y={83} width={14} height={6} rx={3} fill="#495057" />
          <Path d="M34,58 L46,58 L34,72 Z M78,58 L90,58 L78,72 Z" fill="#ffffff" fillOpacity={0.6} />
          <Rect x={26} y={40} width={88} height={6} rx={3} fill="#495057" />
          <Path d="M70,90 V122" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Rect x={20} y={100} width={100} height={6} fill="#ffffff" fillOpacity={0.5} />
          <Circle cx={70} cy={8} r={4} fill="#868e96" />
          <Path d="M26,52 V118" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },

  // ---- On the ski slope ----
  {
    kind: 'skier',
    singular: 'skier',
    plural: 'skiers',
    article: 'a',
    w: 110,
    h: 110,
    tier: 'medium',
    size: 0.15,
    zones: ON_SLOPE,
    maxCount: 3,
    colours: COATS,
    colourPrompt: (plural) => (plural ? 'What colour were the skiers’ jackets?' : 'What colour was the skier’s jacket?'),
    draw: (colour) => (
      <G>
        {skis('#343a40')}
        {/* Crouched, poles out, going downhill. */}
        <Path d="M40,98 L50,72 L66,98" fill="none" stroke="#2f3e46" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M50,74 Q46,52 58,36" fill="none" stroke={colour} strokeWidth={20} strokeLinecap="round" />
        <Path d="M56,46 L84,60 M52,48 L30,62" fill="none" stroke={colour} strokeWidth={7} strokeLinecap="round" />
        <Path d="M84,60 L96,100 M30,62 L18,100" fill="none" stroke="#868e96" strokeWidth={3} />
        <Circle cx={64} cy={22} r={13} fill="#e0ac69" stroke="none" />
        <Path d="M51,20 Q52,6 64,6 Q76,6 77,20 Z" fill={colour} />
        <Rect x={58} y={18} width={20} height={7} rx={3} fill="#212529" stroke="none" />
        <G stroke="none">
          {/* A glint on the goggles, a bobble on the hat, gloves, snow spraying from the skis and light on the jacket. */}
          <Rect x={68} y={19} width={6} height={3} rx={1.5} fill="#74c0fc" />
          <Circle cx={64} cy={4} r={4} fill="#f8f9fa" />
          <Circle cx={84} cy={60} r={4} fill="#212529" />
          <Circle cx={30} cy={62} r={4} fill="#212529" />
          <Circle cx={10} cy={96} r={4} fill="#ffffff" fillOpacity={0.9} />
          <Circle cx={4} cy={88} r={3} fill="#ffffff" fillOpacity={0.8} />
          <Circle cx={12} cy={84} r={2.5} fill="#ffffff" fillOpacity={0.7} />
          <Path d="M48,64 Q46,52 54,42" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'snowboarder',
    singular: 'snowboarder',
    plural: 'snowboarders',
    article: 'a',
    w: 100,
    h: 110,
    tier: 'medium',
    size: 0.14,
    zones: ON_SLOPE,
    maxCount: 3,
    colours: COATS,
    colourPrompt: (plural) => (plural ? 'What colour were the snowboarders’ jackets?' : 'What colour was the snowboarder’s jacket?'),
    draw: (colour) => (
      <G>
        <Rect x={6} y={98} width={88} height={10} rx={5} fill="#f77f00" />
        <Path d="M30,98 L44,70 L64,98" fill="none" stroke="#2f3e46" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M46,72 Q44,50 50,32" fill="none" stroke={colour} strokeWidth={20} strokeLinecap="round" />
        <Path d="M48,42 L20,48 M50,42 L80,46" fill="none" stroke={colour} strokeWidth={7} strokeLinecap="round" />
        <Circle cx={52} cy={18} r={13} fill="#e0ac69" stroke="none" />
        <Path d="M39,16 Q40,2 52,2 Q64,2 65,16 Z" fill="#343a40" />
        <G stroke="none">
          {/* Goggles, gloves, stripes on the board, bindings, snow spraying up and light on the jacket. */}
          <Rect x={44} y={14} width={20} height={7} rx={3} fill="#212529" />
          <Rect x={54} y={15} width={6} height={3} rx={1.5} fill="#ffd166" />
          <Circle cx={20} cy={48} r={4} fill="#212529" />
          <Circle cx={80} cy={46} r={4} fill="#212529" />
          <Path d="M14,103 H86" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" />
          <Rect x={26} y={94} width={10} height={6} rx={2} fill="#212529" />
          <Rect x={60} y={94} width={10} height={6} rx={2} fill="#212529" />
          <Circle cx={2} cy={98} r={4} fill="#ffffff" fillOpacity={0.9} />
          <Circle cx={-2} cy={90} r={3} fill="#ffffff" fillOpacity={0.8} />
          <Path d="M44,62 Q42,50 46,40" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'racer',
    singular: 'ski racer',
    plural: 'ski racers',
    article: 'a',
    w: 110,
    h: 120,
    tier: 'medium',
    size: 0.16,
    zones: ON_SLOPE,
    maxCount: 1,
    countable: false,
    // Never mirrored, so the number on the bib always reads the right way round.
    noFlip: true,
    colours: COATS,
    colourPrompt: () => 'What colour was the ski racer’s suit?',
    // A racer with a big number on their bib: "What number was the ski racer?".
    draw: (colour, details) => (
      <G>
        {skis('#212529')}
        <Path d="M40,98 L50,74 L66,98" fill="none" stroke={colour} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M50,76 Q44,50 58,30" fill="none" stroke={colour} strokeWidth={26} strokeLinecap="round" />
        <Path d="M54,44 L86,56 M50,46 L26,58" fill="none" stroke={colour} strokeWidth={7} strokeLinecap="round" />
        <Rect x={38} y={36} width={34} height={30} rx={4} fill="#f8f9fa" />
        <SvgText x={55} y={52} fontSize={22} fontWeight="bold" fontFamily="Arial" fill="#212529" stroke="none" textAnchor="middle" alignmentBaseline="central">
          {details?.values?.bib ?? '7'}
        </SvgText>
        <Circle cx={64} cy={14} r={12} fill="#f8f9fa" />
        <Rect x={56} y={12} width={18} height={6} rx={3} fill="#212529" stroke="none" />
        <G stroke="none">
          {/* A shine on the helmet, a glint on the goggles, gloves and a stripe down the suit. */}
          <Path d="M56,8 Q60,3 66,3" fill="none" stroke="#adb5bd" strokeWidth={2.5} strokeLinecap="round" />
          <Rect x={66} y={13} width={5} height={3} rx={1.5} fill="#74c0fc" />
          <Circle cx={86} cy={56} r={4} fill="#212529" />
          <Circle cx={26} cy={58} r={4} fill="#212529" />
          <Path d="M42,96 L50,78" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'flag',
    singular: 'slalom flag',
    plural: 'slalom flags',
    article: 'a',
    w: 60,
    h: 140,
    tier: 'small',
    size: 0.1,
    zones: ON_SLOPE,
    maxCount: 3,
    spread: true,
    colours: [C.red, C.blue],
    colourPrompt: (plural) => (plural ? 'What colour were the slalom flags?' : 'What colour was the slalom flag?'),
    draw: (colour) => (
      <G>
        <Rect x={12} y={0} width={6} height={140} fill="#495057" stroke="none" />
        <Path d="M18,8 H58 V48 H18 Z" fill={colour} />
        <G stroke="none">
          {/* A fold in the flag, a cap on the pole and snow heaped at its foot. */}
          <Path d="M38,8 L44,8 L42,48 L36,48 Z" fill="#000000" fillOpacity={0.15} />
          <Path d="M20,10 H56" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2.5} />
          <Circle cx={15} cy={2} r={4} fill="#343a40" />
          <Ellipse cx={15} cy={138} rx={14} ry={4} fill="#ffffff" />
        </G>
      </G>
    ),
  },
  {
    kind: 'pine',
    singular: 'pine tree',
    plural: 'pine trees',
    article: 'a',
    w: 110,
    h: 180,
    tier: 'large',
    // About 4 m tall: stands at the back of the slope, rising in front of the peaks.
    size: 0.24,
    tall: true,
    spread: true,
    zones: ON_SLOPE,
    maxCount: 2,
    tone: '#2f6b3a',
    draw: (_colour, details) => (
      <G>
        {peeking('pine', details)}
        <Rect x={48} y={150} width={14} height={30} fill="#6b4423" />
        <G fill="#2f6b3a">
          <Polygon points="55,0 92,62 18,62" />
          <Polygon points="55,36 102,106 8,106" />
          <Polygon points="55,76 110,154 0,154" />
        </G>
        <G fill="#ffffff" stroke="none">
          <Path d="M55,0 L70,26 Q55,20 40,26 Z" />
          <Path d="M30,104 Q55,96 80,104 L90,106 H20 Z" opacity={0.85} />
          {/* More snow along each tier of branches. */}
          <Path d="M28,60 Q40,54 52,60 L46,62 H24 Z M62,60 Q74,54 86,60 L88,62 H66 Z" opacity={0.85} />
          <Path d="M10,152 Q30,144 50,152 L48,154 H6 Z M64,152 Q86,144 104,152 L106,154 H62 Z" opacity={0.85} />
        </G>
        <G stroke="none">
          {/* Shade on one side of the tree and down the trunk. */}
          <Path d="M55,0 L92,62 H70 L55,36 L102,106 H78 L55,76 L110,154 H80 L55,110 Z" fill="#000000" fillOpacity={0.12} />
          <Rect x={55} y={150} width={7} height={30} fill="#000000" fillOpacity={0.2} />
        </G>
      </G>
    ),
  },

  // ---- At the lodge ----
  { ...person, zones: AT_LODGE, maxCount: 3, colours: COATS, colourPrompt: (plural) => (plural ? 'What colour were the people’s coats?' : 'What colour was the person’s coat?') },
  { ...dog, zones: AT_LODGE, maxCount: 2 },
  {
    kind: 'snowman',
    singular: 'snowman',
    plural: 'snowmen',
    article: 'a',
    w: 90,
    h: 152,
    tier: 'small',
    size: 0.12,
    zones: AT_LODGE,
    maxCount: 2,
    // White on snow: what really shows it is its dark outline, so that is what's checked for contrast.
    framedColour: true,
    tone: '#7d8b99',
    colours: COATS,
    colourPrompt: (plural) => (plural ? 'What colour were the snowmen’s scarves?' : 'What colour was the snowman’s scarf?'),
    draw: (colour) => (
      <G transform="translate(0 12)">
        <Circle cx={45} cy={104} r={36} fill="#ffffff" />
        <Circle cx={45} cy={50} r={26} fill="#ffffff" />
        <Path d="M22,64 Q45,74 68,64 L66,74 Q45,82 24,74 Z M56,72 L64,96 L54,96 L50,74" fill={colour} />
        <Rect x={28} y={10} width={34} height={6} rx={2} fill="#212529" />
        <Rect x={33} y={-10} width={24} height={22} rx={2} fill="#212529" />
        <G stroke="none">
          <Circle cx={37} cy={44} r={3} fill="#212529" />
          <Circle cx={53} cy={44} r={3} fill="#212529" />
          <Path d="M45,50 L64,55 L45,56 Z" fill="#f77f00" />
          <Circle cx={45} cy={94} r={3.5} fill="#212529" />
          <Circle cx={45} cy={110} r={3.5} fill="#212529" />
          {/* A band on the hat, stick arms, rosy cheeks, a stitched smile and shade on the snowballs. */}
          <Rect x={33} y={4} width={24} height={5} fill={colour} />
          <Path d="M20,52 L2,40 M8,44 L4,36 M70,52 L88,40 M82,44 L86,36" stroke="#6b4423" strokeWidth={3.5} strokeLinecap="round" />
          <Circle cx={33} cy={52} r={3} fill="#ff8fab" fillOpacity={0.5} />
          <Circle cx={57} cy={52} r={3} fill="#ff8fab" fillOpacity={0.5} />
          <Path d="M38,60 h1 M42,62 h1 M46,62 h1 M50,60 h1" stroke="#212529" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M64,92 Q78,104 70,124" fill="none" stroke="#adb5bd" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
          <Path d="M60,40 Q68,48 64,62" fill="none" stroke="#adb5bd" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'sledge',
    singular: 'sledge',
    plural: 'sledges',
    article: 'a',
    w: 120,
    h: 60,
    tier: 'medium',
    size: 0.15,
    zones: AT_LODGE,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M4,50 H104 Q118,50 116,38" fill="none" stroke="#495057" strokeWidth={5} strokeLinecap="round" />
        <Path d="M24,50 V36 M84,50 V36" stroke="#495057" strokeWidth={5} />
        <Rect x={10} y={20} width={100} height={18} rx={4} fill={colour} />
        <Path d="M10,22 Q6,8 18,6" fill="none" stroke="#495057" strokeWidth={4} strokeLinecap="round" />
        <G stroke="none">
          {/* Slats in the seat, a tow rope and light along the runner. */}
          <Path d="M36,22 V36 M60,22 V36 M84,22 V36" stroke="#000000" strokeOpacity={0.2} strokeWidth={2.5} />
          <Path d="M14,24 H106" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M18,6 Q10,0 2,8" fill="none" stroke="#e9c46a" strokeWidth={3} strokeLinecap="round" />
          <Path d="M8,49 H100" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'ski-rack',
    singular: 'ski rack',
    plural: 'ski racks',
    article: 'a',
    w: 120,
    h: 130,
    tier: 'medium',
    size: 0.17,
    zones: AT_LODGE,
    maxCount: 1,
    countable: false,
    tone: '#6b4423',
    draw: () => (
      <G>
        <Rect x={0} y={60} width={120} height={10} rx={3} fill="#6b4423" />
        <Path d="M10,60 V130 M110,60 V130" stroke="#6b4423" strokeWidth={8} />
        {[22, 42, 62, 82, 98].map((x, i) => (
          <Rect key={x} x={x} y={i % 2 ? 8 : 0} width={8} height={122} rx={4} fill={[C.red.hex, C.blue.hex, C.green.hex, C.orange.hex, C.purple.hex][i]} />
        ))}
        <G stroke="none">
          {/* Bindings on each ski, a shine down them, snow along the top bar and grain in the wood. */}
          {[22, 42, 62, 82, 98].map((x, i) => (
            <G key={x}>
              <Rect x={x - 1} y={(i % 2 ? 8 : 0) + 76} width={10} height={8} rx={2} fill="#343a40" />
              <Path d={`M${x + 2.5},${(i % 2 ? 8 : 0) + 6} V${(i % 2 ? 8 : 0) + 56}`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" />
            </G>
          ))}
          <Path d="M2,60 Q30,54 60,58 Q90,54 118,60 V62 H2 Z" fill="#ffffff" />
          <Path d="M14,90 V120 M106,90 V120" stroke="#3d2412" strokeOpacity={0.5} strokeWidth={2} />
        </G>
      </G>
    ),
  },
  {
    kind: 'cocoa-stand',
    singular: 'hot chocolate stand',
    plural: 'hot chocolate stands',
    article: 'a',
    w: 150,
    h: 150,
    tier: 'large',
    size: 0.23,
    zones: AT_LODGE,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.green, C.blue, C.brown],
    colourPrompt: () => 'What colour was the roof of the hot chocolate stand?',
    draw: (colour, details) => (
      <G>
        {peeking('cocoa-stand', details)}
        <Path d="M0,40 L75,0 L150,40 Z" fill={colour} />
        <Path d="M10,40 H140 V60 H10 Z" fill="#ffffff" stroke="none" opacity={0.8} />
        <Rect x={14} y={40} width={122} height={110} fill="#a0703c" />
        <Rect x={30} y={56} width={90} height={40} rx={4} fill="#3d2412" />
        <Rect x={10} y={96} width={130} height={12} fill="#8a5a2b" />
        <G stroke="none">
          <Path d="M62,70 H84 V86 Q84,92 78,92 H68 Q62,92 62,86 Z" fill="#f8f9fa" />
          <Path d="M66,66 Q70,60 66,56 M74,66 Q78,60 74,56" fill="none" stroke="#f8f9fa" strokeWidth={3} />
          {/* A cap of snow on the roof (small, so the roof's colour shows), icicles, planks in the walls, a menu board, a marshmallow and mugs on the counter. */}
          <Path d="M50,14 L75,1 L100,14 Q90,11 84,16 Q76,10 68,16 Q60,11 50,14 Z" fill="#ffffff" />
          <Path d="M24,40 l3,8 l3,-8 Z M60,40 l3,10 l3,-10 Z M104,40 l3,7 l3,-7 Z M126,40 l3,9 l3,-9 Z" fill="#e7f5ff" />
          <Path d="M14,112 H136 M14,128 H136" stroke="#000000" strokeOpacity={0.15} strokeWidth={2.5} />
          <Rect x={36} y={62} width={20} height={26} rx={2} fill="#212529" />
          <Path d="M40,68 h12 M40,74 h10 M40,80 h12" stroke="#f8f9fa" strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
          <Rect x={66} y={70} width={8} height={5} rx={2} fill="#ffe8cc" />
          <Path d="M98,86 h12 v8 h-12 Z M114,86 h12 v8 h-12 Z" fill="#f8f9fa" />
        </G>
      </G>
    ),
  },
  {
    kind: 'snowmobile',
    singular: 'snowmobile',
    plural: 'snowmobiles',
    article: 'a',
    w: 180,
    h: 90,
    tier: 'large',
    // About 2.5 m long.
    size: 0.27,
    zones: AT_LODGE,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.orange, C.black],
    draw: (colour, details) => (
      <G>
        {peeking('snowmobile', details)}
        <Path d="M10,84 H150 Q176,84 176,70" fill="none" stroke="#343a40" strokeWidth={6} strokeLinecap="round" />
        <Path d="M20,72 V60 H160 L176,72 Z" fill="#343a40" />
        <Path d="M30,62 Q40,30 80,30 L120,30 Q150,30 168,62 Z" fill={colour} />
        <Path d="M120,30 L130,12 L142,30" fill="#cfe9f7" />
        <Rect x={46} y={22} width={50} height={12} rx={5} fill="#212529" />
        <G stroke="none">
          {/* A glint on the windscreen, a headlight, a racing stripe, seat stitching and treads on the track. */}
          <Path d="M126,28 L130,18 L132,28 Z" fill="#ffffff" fillOpacity={0.7} />
          <Ellipse cx={162} cy={52} rx={6} ry={4} fill="#fff3b0" />
          <Path d="M40,52 Q80,42 150,50" fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
          <Path d="M50,28 H92" stroke="#868e96" strokeWidth={1.5} strokeDasharray="3 3" />
          <Path d="M26,66 H158" stroke="#212529" strokeWidth={4} strokeDasharray="6 5" />
          <Path d="M20,82 H150" stroke="#adb5bd" strokeWidth={1.5} />
        </G>
      </G>
    ),
  },
];

/** Bib numbers easy to mix up with `n`: one or two along, the digits swapped, or ten more. */
function bibLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 60);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/**
 * The animal on the danger sign and the racer's bib number, chosen per picture. On harder levels the
 * sign's animal is also hiding somewhere in the picture (`fitDetails` picks where, once things are placed).
 */
function details(random: Rng, { hidden = 0 }: DetailKnobs): SceneDetails {
  const animal = random.pick(DANGER_ANIMALS);
  const bib = random.int(1, 49);
  return {
    values: { animal, bib: String(bib), ...(hidden ? { peek: String(hidden) } : {}) },
    facts: [
      { id: 'danger', type: 'object', prompt: 'Which animal was the danger sign about?', answer: animal, wrong: DANGER_ANIMALS.filter((n) => n !== animal) },
      { id: 'bib', type: 'number', prompt: 'What number was on the ski racer’s bib?', answer: String(bib), wrong: bibLookalikes(bib), needs: 'racer' },
    ],
  };
}

/**
 * Where the danger sign's animal hides: behind one of the hiding spots that's in the picture (one of it),
 * peeking out. "Where was the bear hiding?" asks about it, first in the round. Nothing hides on easier levels,
 * or when there's nowhere to hide.
 */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  if (!d.values?.peek) return d;
  const spots = groups.filter((g) => HIDING_SPOTS[g.kind] && g.count === 1).map((g) => g.kind);
  if (!spots.length) return d;
  const hiding = random.pick(spots);
  const animal = d.values.animal ?? 'Bear';
  const name = HIDING_SPOTS[hiding].name;
  return {
    ...d,
    values: { ...d.values, hiding },
    facts: [
      ...(d.facts ?? []),
      {
        id: 'hiding',
        type: 'position',
        prompt: `Where was the ${animal.toLowerCase()} hiding?`,
        answer: name,
        // Other hiding spots that are in the picture first (one that isn't would be too easy to rule out).
        wrong: [...spots.filter((k) => k !== hiding), ...Object.keys(HIDING_SPOTS).filter((k) => !spots.includes(k))].map((k) => HIDING_SPOTS[k].name),
        fallback: ['Behind the ski rack', 'Behind the snowman', 'Behind the fence'],
        spotlight: true,
      },
    ],
  };
}

type Palette = Record<'sky' | 'peaksFar' | 'peaks' | 'snow' | 'snowShade' | 'fence' | 'base' | 'track', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const peaks = height * PEAKS;
  const fence = height * FENCE;
  const s = { x: SIGN.x0 * 900, y: SIGN.y0 * height, w: (SIGN.x1 - SIGN.x0) * 900, h: (SIGN.y1 - SIGN.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={peaks + 600} fill={p.sky} />
      {/* Far peaks, then near ones, with snowy tops. */}
      <Path d={`M-600,${peaks} L-300,${sky - 30} L-60,${peaks - 30} L200,${sky - 60} L470,${peaks - 20} L760,${sky - 40} L1040,${peaks - 30} L1500,${sky} V${peaks + 10} H-600 Z`} fill={p.peaksFar} />
      <Path d={`M-600,${peaks + 10} L-200,${sky + 20} L80,${peaks} L360,${sky + 10} L640,${peaks + 4} L900,${sky + 24} L1200,${peaks} L1500,${sky + 30} V${peaks + 20} H-600 Z`} fill={p.peaks} />
      {/* Shade on the right-hand face of each near peak. */}
      <G fill="#000000" fillOpacity={0.1}>
        <Path d={`M-200,${sky + 20} L80,${peaks} H-60 Z`} />
        <Path d={`M360,${sky + 10} L640,${peaks + 4} H500 Z`} />
        <Path d={`M900,${sky + 24} L1200,${peaks} H1040 Z`} />
      </G>
      <G fill={p.snow}>
        <Path d={`M-260,${sky + 30} L-200,${sky + 20} L-140,${sky + 34} L-200,${sky + 44} Z`} />
        <Path d={`M300,${sky + 22} L360,${sky + 10} L420,${sky + 24} L360,${sky + 36} Z`} />
        <Path d={`M840,${sky + 36} L900,${sky + 24} L960,${sky + 38} L900,${sky + 48} Z`} />
      </G>
      {/* The slope, the fence at its foot, and the snow by the lodge. */}
      <Rect x={-600} y={peaks + 4} width={2100} height={fence - peaks - 4} fill={p.snow} />
      <Rect x={-600} y={fence} width={2100} height={height - fence + 600} fill={p.base} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: peaks + 10, x1: 940, y1: height }, 220, '#ffffff', 0.7, 4)}
      {speckles({ x0: -40, y0: peaks + 10, x1: 940, y1: height }, 140, '#8aa4bd', 0.18, 3, 17)}
      {/* Little drifts and hollows in the snow. */}
      {glints({ x0: -40, y0: peaks + 20, x1: 940, y1: height }, 40, '#8aa4bd', 0.16, 26, 3, 37)}
      <G fill={p.fence}>
        <Rect x={-600} y={fence - 4} width={2100} height={6} />
        <Rect x={-600} y={fence + 10} width={2100} height={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <Rect key={i} x={-600 + i * 75} y={fence - 12} width={8} height={32} rx={2} />
        ))}
      </G>
      {/* Snow along the top rail and on each post. */}
      <Rect x={-600} y={fence - 7} width={2100} height={3} rx={1.5} fill="#ffffff" />
      {Array.from({ length: 30 }, (_, i) => (
        <Ellipse key={i} cx={-596 + i * 75} cy={fence - 13} rx={6} ry={3} fill="#ffffff" />
      ))}
      {/* The danger sign: a warning triangle, "DANGER" and the animal it warns about. */}
      <G>
        <Rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill="#ffd60a" stroke="#212529" strokeWidth={4} />
        <Path
          d={`M${s.x + s.h * 0.5},${s.y + s.h * 0.2} L${s.x + s.h * 0.84},${s.y + s.h * 0.8} H${s.x + s.h * 0.16} Z`}
          fill="#ffffff"
          stroke="#d62828"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <SvgText x={s.x + s.h * 0.5} y={s.y + s.h * 0.6} fontSize={s.h * 0.34} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle" alignmentBaseline="central">
          !
        </SvgText>
        <SvgText x={s.x + s.h * 1.0} y={s.y + s.h * 0.3} fontSize={s.h * 0.3} fontWeight="bold" fontFamily="Arial" fill="#d62828" alignmentBaseline="central">
          DANGER
        </SvgText>
        <SvgText x={s.x + s.h * 1.0} y={s.y + s.h * 0.68} fontSize={s.h * 0.42} fontWeight="bold" fontFamily="Arial" fill="#212529" alignmentBaseline="central">
          {d?.values?.animal ?? 'Deer'}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  return [
    ...scatterMarks({ x0: -100, y0: height * 0.02, x1: 1000, y1: height * SKY - 50 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true),
    // Ski tracks across the slope and paths in the snow by the lodge.
    ...[0.44, 0.53].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.track, 3, 0.3)),
    ...[0.8, 0.9].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.track, 3, 0.25)),
  ];
}

const PALETTES: Record<string, Palette> = {
  sunny: {
    sky: '#7cc4f0',
    peaksFar: '#9bb3c9',
    peaks: '#7d97b0',
    snow: '#e8eff5',
    snowShade: '#cfdbe6',
    fence: '#8a5a2b',
    base: '#e1e9f0',
    track: '#9fb3c6',
  },
  dusk: {
    sky: '#b49ad6',
    peaksFar: '#a68fb8',
    peaks: '#8a76a3',
    snow: '#ece4f0',
    snowShade: '#d6cbe0',
    fence: '#6b4423',
    base: '#e4dceb',
    track: '#ad9fc0',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < SKY) return 'sky';
  if (y < PEAKS) return 'peaks';
  if (y < FENCE) return 'snow';
  return 'base';
}

export const snowyMountain: Recipe = {
  id: 'snowy-mountain',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'On the snowy mountain',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: SKY, rows: 1 },
    { id: 'peaks', label: 'On the peaks', surface: 'ground', top: SKY, bottom: PEAKS, rows: 0 },
    { id: 'slope', label: 'On the ski slope', surface: 'ground', top: SLOPE, bottom: FENCE - 0.01, rows: 2 },
    { id: 'lodge', label: 'By the lodge', surface: 'ground', top: BASE, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SIGN],
  details,
  fitDetails,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the peaks.
    { top: 0, bottom: SKY, from: ['#ffffff', 0], to: ['#ffffff', 0.12] },
    // Sun on the upper slope, a little shade towards the fence.
    { top: PEAKS, bottom: FENCE, from: ['#ffffff', 0.1], to: ['#000000', 0.04] },
    // The snow by the lodge, a little deeper in front.
    { top: BASE, bottom: 1, from: ['#000000', 0], to: ['#000000', 0.06] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
