import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * A supermarket aisle: signs hang from the ceiling, three shelves of products, and the floor in front.
 * Band edges as fractions of the picture height. Each shelf band ends on the shelf board, where
 * products stand in neat rows (`lineUp`), one kind per third of each shelf, like a real aisle.
 */
const CEILING = 0.135;
const SHELVES: [number, number][] = [
  [0.15, 0.32],
  [0.345, 0.505],
  [0.53, 0.685],
];
/** Thickness of a shelf board, below each shelf band. */
const BOARD = 0.018;
const FLOOR_LINE = 0.71;
const FLOOR_TOP = 0.72;

const TOP = ['top'];
const MIDDLE = ['middle'];
const BOTTOM = ['bottom'];
const FLOOR = ['floor'];

/** Product colours; purple, black and brown are left out because they'd vanish on the dark shelves. */
const PRODUCT = [C.red, C.blue, C.yellow, C.green, C.orange, C.pink];

/**
 * Things on a shelf: one neat row, small enough that two or three fit in a third of the shelf.
 *
 * Scale: the shelves are a close-up (products must be at least 44 pt wide to read on a phone), so a
 * 30 cm cereal box is about 0.16 of the picture width tall: 1 m ≈ 0.53. Everything on the floor is
 * drawn at that same scale, which is why there are no shoppers or trolleys here: a person would be
 * taller than the floor and cover the shelves, and a smaller one looks like a toy next to the boxes.
 */
const shelved = { tier: 'small' as const, lineUp: true, maxCount: 3 };

const items: ItemDef[] = [
  {
    kind: 'cereal',
    singular: 'cereal box',
    plural: 'cereal boxes',
    article: 'a',
    w: 70,
    h: 100,
    size: 0.11,
    zones: [...TOP, ...MIDDLE],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    colours: PRODUCT,
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={70} height={100} rx={3} fill={colour} />
        <G stroke="none">
          <Rect x={56} y={0} width={14} height={100} fill="#000000" fillOpacity={0.15} />
          {/* "CEREAL" on a white band: a plain logo didn't say what was in the box. */}
          <Rect x={4} y={16} width={52} height={22} rx={4} fill="#ffffff" />
          <SvgText x={30} y={31.5} fontSize={11} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle">
            CEREAL
          </SvgText>
          <Path d="M10,62 H50 A20,16 0 0 1 10,62 Z" fill="#ffffff" />
          <Circle cx={20} cy={59} r={5} fill="#f4c430" />
          <Circle cx={31} cy={57} r={5} fill="#f4c430" />
          <Circle cx={41} cy={59} r={5} fill="#f4c430" />
          {/* A spoon in the bowl, a brand stripe, the small print and light down the front edge. */}
          <Path d="M44,56 L58,40" stroke="#ced4da" strokeWidth={4} strokeLinecap="round" />
          <Ellipse cx={60} cy={38} rx={5} ry={3.5} fill="#ced4da" transform="rotate(-50 60 38)" />
          <Rect x={8} y={6} width={44} height={6} rx={3} fill="#ffffff" fillOpacity={0.55} />
          <Path d="M10,84 H46 M10,91 H36" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
          <Path d="M4,6 V94" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'toilet-rolls',
    singular: 'toilet roll',
    plural: 'toilet rolls',
    article: 'a',
    w: 62,
    h: 76,
    size: 0.1,
    zones: TOP,
    ...shelved,
    noFlip: true, // the words on it would read backwards
    maxCount: 2,
    tone: '#f8f9fa',
    // One roll per item, labelled: a pack showed three rolls, so people counted rolls instead of packs.
    draw: () => (
      <G>
        <Path d="M0,12 V66 A31,10 0 0 0 62,66 V12 Z" fill="#f8f9fa" />
        <Ellipse cx={31} cy={12} rx={31} ry={10} fill="#e9ecef" />
        <Ellipse cx={31} cy={12} rx={9} ry={3.5} fill="#c9a27a" />
        <G stroke="none">
          <Rect x={0} y={30} width={62} height={30} fill={C.blue.hex} />
          <SvgText x={31} y={43} fontSize={11} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle">
            TOILET
          </SvgText>
          <SvgText x={31} y={56} fontSize={11} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle">
            ROLL
          </SvgText>
          {/* A shine down the wrapper. */}
          <Path d="M7,24 V28 M7,62 V68" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'water',
    singular: 'bottle of water',
    plural: 'bottles of water',
    article: 'a',
    w: 50,
    h: 85,
    size: 0.1,
    zones: [...TOP, ...BOTTOM],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    tone: '#5fb3e8',
    draw: () => (
      <G>
        <Path d="M16,14 H34 V20 Q46,26 46,38 V78 Q46,85 39,85 H11 Q4,85 4,78 V38 Q4,26 16,20 Z" fill="#5fb3e8" />
        <Rect x={17} y={2} width={16} height={12} rx={2} fill="#1e4fb8" />
        <G stroke="none">
          <Rect x={4} y={47} width={42} height={18} fill="#ffffff" />
          {/* "WATER" on the label, ridges on the cap, ripples in the plastic and a shine. */}
          <SvgText x={25} y={59.5} fontSize={10.5} fontWeight="bold" fontFamily="Arial" fill="#1e4fb8" textAnchor="middle">
            WATER
          </SvgText>
          <Path d="M21,4 V12 M25,4 V12 M29,4 V12" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />
          <Path d="M6,70 H44 M6,40 H44" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} />
          <Path d="M11,30 Q8,36 9,44 M10,68 V78" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'tin',
    singular: 'tin of beans',
    plural: 'tins of beans',
    article: 'a',
    w: 60,
    h: 75,
    size: 0.1,
    zones: [...MIDDLE, ...BOTTOM],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    colours: PRODUCT,
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={60} height={75} rx={5} fill={colour} />
        <G stroke="none">
          <Rect x={0} y={0} width={60} height={9} rx={4} fill="#c0c7cf" />
          <Rect x={0} y={66} width={60} height={9} rx={4} fill="#c0c7cf" />
          {/* "BEANS" and a few beans on a white label: a plain tin didn't say what was inside. */}
          <Rect x={4} y={22} width={44} height={32} rx={3} fill="#ffffff" />
          <SvgText x={26} y={35} fontSize={10.5} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle">
            BEANS
          </SvgText>
          {[16, 23, 30, 37].map((cx, i) => (
            <Ellipse key={cx} cx={cx} cy={45 - (i % 2) * 2} rx={3.6} ry={2.6} fill="#e07a1f" />
          ))}
          {/* Ridges round the rims, the seam and a shine down the side. */}
          <Path d="M3,4.5 H57 M3,70.5 H57" stroke="#000000" strokeOpacity={0.2} strokeWidth={1.5} />
          <Path d="M52,12 V63" stroke="#000000" strokeOpacity={0.15} strokeWidth={4} />
          <Path d="M8,13 V18 M8,58 V62" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'jar',
    singular: 'jar of honey',
    plural: 'jars of honey',
    article: 'a',
    w: 60,
    h: 75,
    size: 0.1,
    zones: MIDDLE,
    ...shelved,
    noFlip: true, // the words on it would read backwards
    colours: [C.red, C.blue, C.yellow, C.green],
    colourPrompt: (plural) => (plural ? 'What colour were the lids on the honey jars?' : 'What colour was the lid on the honey jar?'),
    draw: (colour) => (
      <G>
        <Rect x={4} y={14} width={52} height={61} rx={12} fill="#f2a93b" />
        <Rect x={2} y={0} width={56} height={16} rx={4} fill={colour} />
        <G stroke="none">
          <Rect x={8} y={36} width={44} height={22} rx={4} fill="#ffffff" />
          {/* "HONEY" on the label (a bee alone wasn't read as honey), ridges round the lid, a shine and darker honey. */}
          <SvgText x={30} y={52} fontSize={11} fontWeight="bold" fontFamily="Arial" fill="#a8590f" textAnchor="middle">
            HONEY
          </SvgText>
          <Path d="M10,2 V14 M18,2 V14 M26,2 V14 M34,2 V14 M42,2 V14 M50,2 V14" stroke="#000000" strokeOpacity={0.15} strokeWidth={2} />
          <Path d="M10,22 V32 M10,62 V68" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M6,64 H54 V68 Q54,75 44,75 H16 Q6,75 6,68 Z" fill="#a8590f" fillOpacity={0.35} />
        </G>
      </G>
    ),
  },
  {
    kind: 'juice',
    singular: 'bottle of juice',
    plural: 'bottles of juice',
    article: 'a',
    w: 50,
    h: 85,
    size: 0.1,
    zones: [...TOP, ...MIDDLE],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    // On Hard, a row can mix flavours.
    mixedColours: true,
    colours: [C.orange, C.red, C.green, C.yellow, C.pink],
    draw: (colour) => (
      <G>
        <Path d="M16,14 H34 V20 Q46,26 46,38 V78 Q46,85 39,85 H11 Q4,85 4,78 V38 Q4,26 16,20 Z" fill={colour} />
        <Rect x={17} y={2} width={16} height={12} rx={2} fill="#f8f9fa" />
        <G stroke="none">
          <Rect x={4} y={46} width={42} height={20} fill="#ffffff" />
          {/* "JUICE" on the label, ridges on the cap and a shine. */}
          <SvgText x={25} y={60} fontSize={12} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle">
            JUICE
          </SvgText>
          <Path d="M21,4 V12 M25,4 V12 M29,4 V12" stroke="#000000" strokeOpacity={0.15} strokeWidth={1.5} />
          <Path d="M11,30 Q8,36 9,42 M10,70 V78" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'milk',
    singular: 'carton of milk',
    plural: 'cartons of milk',
    article: 'a',
    w: 55,
    h: 85,
    size: 0.1,
    zones: [...BOTTOM, ...MIDDLE],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={0} y={22} width={55} height={63} fill="#f8f9fa" />
        <Path d="M0,22 L9,4 H46 L55,22 Z" fill={C.blue.hex} />
        <G stroke="none">
          {/* "MILK" across the front and cow-print patches: a blue drop read as water. */}
          <SvgText x={23} y={45} fontSize={14} fontWeight="bold" fontFamily="Arial" fill={C.blue.hex} textAnchor="middle">
            MILK
          </SvgText>
          <Path d="M6,52 C10,49 16,51 15,56 C14,61 7,61 5,57 Z M26,55 C31,52 38,55 36,61 C34,66 26,65 25,60 Z" fill="#212529" />
          <Path d="M38,50 C41,48 43,51 42,53 C41,55 38,54 38,50 Z" fill="#212529" />
          {/* A cap, the fold of the top, a blue stripe along the bottom and shade down one side. */}
          <Rect x={30} y={8} width={10} height={6} rx={2} fill="#f8f9fa" />
          <Path d="M27.5,4 V22" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Rect x={0} y={74} width={55} height={6} fill={C.blue.hex} />
          <Rect x={44} y={22} width={11} height={63} fill="#000000" fillOpacity={0.08} />
        </G>
      </G>
    ),
  },
  {
    kind: 'eggs',
    singular: 'box of eggs',
    plural: 'boxes of eggs',
    article: 'a',
    w: 100,
    h: 55,
    size: 0.15,
    zones: [...BOTTOM, ...MIDDLE],
    ...shelved,
    noFlip: true, // the words on it would read backwards
    tier: 'medium',
    maxCount: 2,
    tone: '#d8b98a',
    // An open tray of white eggs with "EGGS" on the front: the closed brown box wasn't read as eggs.
    draw: () => (
      <G>
        {[14, 38, 62, 86].map((cx) => (
          <Ellipse key={cx} cx={cx} cy={18} rx={10.5} ry={14} fill="#f8f9fa" stroke="#adb5bd" />
        ))}
        <G stroke="none">
          {[14, 38, 62, 86].map((cx) => (
            <Ellipse key={cx} cx={cx - 3.5} cy={12} rx={3} ry={4.5} fill="#ffffff" />
          ))}
        </G>
        <Rect x={0} y={24} width={100} height={31} rx={5} fill="#d8b98a" />
        <G stroke="none">
          {/* The cups the eggs sit in, the label and the moulded card. */}
          <Path d="M2,26 Q14,34 26,26 Q38,34 50,26 Q62,34 74,26 Q86,34 98,26" fill="none" stroke="#000000" strokeOpacity={0.15} strokeWidth={2} />
          <Rect x={26} y={34} width={48} height={18} rx={3} fill="#ffffff" />
          <SvgText x={50} y={48} fontSize={14} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle">
            EGGS
          </SvgText>
          <Path d="M8,36 V50 M92,36 V50" stroke="#000000" strokeOpacity={0.08} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'bread',
    singular: 'loaf of bread',
    plural: 'loaves of bread',
    article: 'a',
    w: 100,
    h: 60,
    size: 0.15,
    zones: [...BOTTOM, ...TOP],
    ...shelved,
    tier: 'medium',
    maxCount: 2,
    tone: '#c98b4a',
    draw: () => (
      <G>
        <Path d="M4,58 V30 Q4,4 30,6 Q50,0 70,6 Q96,4 96,30 V58 Z" fill="#c98b4a" />
        <Path d="M28,16 l8,10 M48,12 l8,10 M68,16 l8,10" fill="none" stroke="#8a5a2b" strokeWidth={4} strokeLinecap="round" />
        <G stroke="none">
          {/* A shine on the crust, a darker base and a few seeds. */}
          <Path d="M14,26 Q16,12 30,12" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
          <Path d="M5,48 H95 V57 H5 Z" fill="#000000" fillOpacity={0.12} />
          {[[24, 34], [42, 28], [60, 34], [78, 30], [34, 42], [68, 42]].map(([x, y]) => (
            <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={2.2} ry={1.3} fill="#f2dcb3" />
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'basket',
    singular: 'shopping basket',
    plural: 'shopping baskets',
    article: 'a',
    w: 90,
    h: 65,
    tier: 'large',
    size: 0.22,
    zones: FLOOR,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow],
    draw: (colour) => (
      <G>
        <Path d="M22,24 Q22,2 45,2 Q68,2 68,24" fill="none" stroke={colour} strokeWidth={7} />
        <Path d="M4,22 H86 L77,63 H13 Z" fill={colour} />
        <G fill="#ffffff" fillOpacity={0.5} stroke="none">
          {[20, 36, 52, 68].map((x) => (
            <Rect key={x} x={x - 4} y={32} width={8} height={20} rx={3} />
          ))}
        </G>
        <G stroke="none">
          {/* A grip on the handle, a rim along the top and shade along the base. */}
          <Rect x={36} y={-1} width={18} height={7} rx={3.5} fill="#343a40" />
          <Path d="M6,26 H84" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} />
          <Path d="M14,58 H76" stroke="#000000" strokeOpacity={0.2} strokeWidth={4} />
        </G>
      </G>
    ),
  },
  {
    kind: 'apples',
    singular: 'crate of apples',
    plural: 'crates of apples',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'large',
    size: 0.26,
    zones: FLOOR,
    maxCount: 1,
    tone: '#8a5a2b',
    draw: () => fruitCrate(C.red.hex, '#8f1d26'),
  },
  {
    kind: 'oranges',
    singular: 'crate of oranges',
    plural: 'crates of oranges',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'large',
    size: 0.26,
    zones: FLOOR,
    maxCount: 1,
    tone: '#8a5a2b',
    draw: () => fruitCrate(C.orange.hex, '#8a4500'),
  },
  {
    kind: 'watermelon',
    singular: 'watermelon',
    plural: 'watermelons',
    article: 'a',
    w: 90,
    h: 62,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 3,
    tone: '#3a8f3a',
    draw: () => (
      <G>
        <Ellipse cx={45} cy={31} rx={44} ry={30} fill="#3a8f3a" />
        <Path d="M20,8 Q10,31 20,54 M45,2 Q36,31 45,60 M70,8 Q80,31 70,54" fill="none" stroke="#1f5f24" strokeWidth={5} />
        <G stroke="none">
          {/* A shine on the rind, a pale patch where it lay in the field and a stalk. */}
          <Ellipse cx={28} cy={16} rx={12} ry={5} fill="#ffffff" fillOpacity={0.3} transform="rotate(-20 28 16)" />
          <Ellipse cx={56} cy={54} rx={14} ry={4} fill="#e9d98a" fillOpacity={0.55} />
          <Path d="M87,28 Q92,24 90,18" fill="none" stroke="#6b4f1d" strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'wet-floor',
    singular: 'wet floor sign',
    plural: 'wet floor signs',
    article: 'a',
    w: 60,
    h: 90,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 1,
    countable: false,
    tone: '#ffd60a',
    draw: () => (
      <G>
        <Path d="M8,88 L22,4 H38 L52,88 Z" fill="#ffd60a" />
        <Path d="M30,32 L44,58 H16 Z" fill="none" stroke="#212529" strokeWidth={4} strokeLinejoin="round" />
        <Path d="M30,40 V49" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
        <G stroke="none">
          <Circle cx={30} cy={54} r={2.2} fill="#212529" />
          {/* A hinge at the top, drips under the warning, light down one edge and shade down the other. */}
          <Rect x={20} y={2} width={20} height={6} rx={3} fill="#343a40" />
          <Path d="M24,68 q-3,5 0,7 q3,-2 0,-7 Z M36,70 q-3,5 0,7 q3,-2 0,-7 Z" fill="#1d70d6" />
          <Path d="M20,16 L12,82" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
          <Path d="M44,30 L50,82" stroke="#000000" strokeOpacity={0.12} strokeWidth={6} />
        </G>
      </G>
    ),
  },
  {
    // Something knocked over on the floor: honey, water or juice, chosen per picture (`SPILLS`), for "What had
    // spilled on the floor?". One kind of thing, so a picture never has two spills and two right answers.
    kind: 'spill',
    singular: 'spill',
    plural: 'spills',
    article: 'a',
    w: 120,
    h: 50,
    // Big enough to make out what tipped over on a phone.
    tier: 'large',
    size: 0.23,
    zones: FLOOR,
    maxCount: 1,
    countable: false,
    noFlip: true,
    tone: '#e8962a',
    draw: (_colour, d) => (SPILLS.find((x) => x.name === d?.values?.spill) ?? SPILLS[0]).draw(),
  },
  {
    kind: 'box',
    singular: 'cardboard box',
    plural: 'cardboard boxes',
    article: 'a',
    w: 90,
    h: 75,
    tier: 'large',
    size: 0.21,
    zones: FLOOR,
    maxCount: 2,
    tone: '#b07d45',
    draw: () => (
      <G>
        <Rect x={0} y={10} width={90} height={65} fill="#b07d45" />
        <Path d="M0,10 L10,0 H80 L90,10 Z" fill="#c8955a" />
        <G stroke="none">
          <Rect x={39} y={10} width={12} height={28} fill="#e8d3a8" />
          {/* Tape over the top flap, "this way up" arrows, a hand hole and shade down one side. */}
          <Path d="M40,0 H50 L51,10 H39 Z" fill="#e8d3a8" />
          <Path d="M14,58 V46 M10,50 L14,46 L18,50 M26,58 V46 M22,50 L26,46 L30,50" stroke="#5c3a1a" strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <Rect x={58} y={24} width={20} height={7} rx={3.5} fill="#5c3a1a" fillOpacity={0.55} />
          <Rect x={76} y={10} width={14} height={65} fill="#000000" fillOpacity={0.1} />
        </G>
      </G>
    ),
  },
  {
    kind: 'shopping-bag',
    singular: 'shopping bag',
    plural: 'shopping bags',
    article: 'a',
    w: 80,
    h: 95,
    tier: 'medium',
    size: 0.16,
    zones: FLOOR,
    maxCount: 2,
    tone: '#c8955a',
    draw: () => (
      <G>
        <Path d="M22,22 L30,4 M44,4 L36,22" fill="none" stroke="#2b9348" strokeWidth={6} strokeLinecap="round" />
        <Path d="M48,24 L58,2 L66,6 L58,26" fill="#e9c46a" stroke="#a07800" strokeWidth={3} strokeLinejoin="round" />
        <Path d="M4,24 H76 L72,95 H8 Z" fill="#c8955a" />
        <Path d="M4,24 L12,34 H68 L76,24" fill="none" stroke="#8a5a2b" strokeWidth={3} />
        <G stroke="none">
          {/* A leaf printed on the side, paper creases, the folded bottom and a shine on the bread. */}
          <Path d="M40,52 Q54,52 54,66 Q40,66 40,52 Z" fill="#2b9348" />
          <Path d="M28,68 Q32,58 40,54" fill="none" stroke="#2b9348" strokeWidth={3} strokeLinecap="round" />
          <Path d="M20,36 L16,92 M60,36 L64,92" stroke="#8a5a2b" strokeOpacity={0.35} strokeWidth={2} />
          <Path d="M8,84 H72 L72,95 H8 Z" fill="#000000" fillOpacity={0.1} />
          <Ellipse cx={56} cy={10} rx={3} ry={1.6} fill="#ffffff" fillOpacity={0.6} transform="rotate(-65 56 10)" />
        </G>
      </G>
    ),
  },
  {
    kind: 'potatoes',
    singular: 'sack of potatoes',
    plural: 'sacks of potatoes',
    article: 'a',
    w: 90,
    h: 100,
    tier: 'large',
    size: 0.2,
    zones: FLOOR,
    maxCount: 2,
    tone: '#a68a64',
    draw: () => (
      <G>
        <Path d="M14,20 Q4,60 8,92 Q45,102 82,92 Q86,60 76,20 Z" fill="#a68a64" />
        <Path d="M14,20 Q30,8 45,16 Q60,8 76,20 Q60,28 45,22 Q30,28 14,20 Z" fill="#c4a77d" />
        <G fill="#c9a26b" stroke="#7a5a32" strokeWidth={3}>
          <Ellipse cx={34} cy={14} rx={10} ry={7} />
          <Ellipse cx={54} cy={12} rx={10} ry={7} />
        </G>
        <G stroke="none">
          <Path d="M16,36 Q45,42 74,36 M13,80 Q45,88 78,80 M30,30 Q24,60 26,90 M62,30 Q68,60 66,90" fill="none" stroke="#000000" strokeOpacity={0.1} strokeWidth={2} />
          <Rect x={26} y={48} width={38} height={24} rx={4} fill="#f1e7d0" />
          {/* A potato on the label, the woven sacking, a string tie and shade at the bottom. */}
          <Ellipse cx={45} cy={60} rx={10} ry={7} fill="#c9a26b" />
          <Circle cx={42} cy={58} r={1.3} fill="#7a5a32" />
          <Circle cx={49} cy={62} r={1.3} fill="#7a5a32" />
          <Path d="M22,24 Q45,32 68,24" fill="none" stroke="#7a5a32" strokeWidth={3} strokeLinecap="round" />
          <Path d="M10,84 Q45,96 80,84 L82,92 Q45,102 8,92 Z" fill="#000000" fillOpacity={0.12} />
        </G>
      </G>
    ),
  },
];

/** A wooden crate heaped with round fruit. */
function fruitCrate(fruit: string, edge: string) {
  return (
    <G>
      <G fill={fruit} stroke={edge} strokeWidth={3}>
        {[18, 41, 64, 87].map((cx) => (
          <Circle key={cx} cx={cx + 2} cy={30} r={12} />
        ))}
        {[30, 53, 76].map((cx) => (
          <Circle key={cx} cx={cx + 2} cy={16} r={12} />
        ))}
      </G>
      <G stroke="none">
        {/* A shine on each fruit, a couple of stalks and a leaf. */}
        {[18, 41, 64, 87].map((cx) => (
          <Circle key={cx} cx={cx - 2} cy={26} r={3} fill="#ffffff" fillOpacity={0.5} />
        ))}
        {[30, 53, 76].map((cx) => (
          <Circle key={cx} cx={cx - 2} cy={12} r={3} fill="#ffffff" fillOpacity={0.5} />
        ))}
        <Path d="M32,5 V1 M78,5 L80,1" stroke="#5c3d1e" strokeWidth={2.5} strokeLinecap="round" />
        <Ellipse cx={58} cy={4} rx={5} ry={2.5} fill="#2b9348" />
      </G>
      <Rect x={0} y={34} width={110} height={36} rx={3} fill="#8a5a2b" />
      <Path d="M4,46 H106 M4,58 H106" fill="none" stroke="#5c3a1a" strokeWidth={3} />
      <G stroke="none">
        {/* Wood grain, nails at the ends and a hand hole. */}
        <Path d="M14,40 H40 M60,52 H92 M20,64 H50" stroke="#ffffff" strokeOpacity={0.15} strokeWidth={2} strokeLinecap="round" />
        {[8, 102].map((x) => [40, 52, 64].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="#3d2412" />))}
        <Rect x={44} y={37} width={22} height={6} rx={3} fill="#3d2412" />
      </G>
    </G>
  );
}

/** A puddle spreading right from where the thing tipped over, in the spilled thing's colours. */
function puddle(fill: string, edge: string) {
  return (
    <G>
      <Path
        d="M34,38 C36,31 50,29 60,31 C70,26 88,27 96,30 C108,28 120,34 116,40 C120,46 104,49 94,47 C80,50 60,50 50,47 C40,48 32,44 34,38 Z"
        fill={fill}
        stroke={edge}
      />
      <G fill={fill} stroke={edge}>
        <Circle cx={108} cy={22} r={3.5} />
        <Circle cx={86} cy={21} r={2.5} />
      </G>
      <Path d="M60,36 Q76,32 96,35" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

/** What can be spilled on the floor (see the `spill` item). */
const SPILLS: { name: string; draw: () => ReactElement }[] = [
  {
    // A honey jar on its side, cracked, with honey oozing out of it.
    name: 'Honey',
    draw: () => (
      <G>
        {puddle('#f2a93b', '#a8590f')}
        <Path d="M50,30 C56,32 58,36 64,36 L54,44 C50,41 50,40 50,40 Z" fill="#f2a93b" stroke="none" />
        <Rect x={8} y={6} width={44} height={40} rx={8} fill="#f2a93b" stroke="#a8590f" />
        <Rect x={0} y={9} width={11} height={34} rx={3} fill={C.red.hex} stroke="#8f1d26" />
        <G stroke="none">
          <Rect x={15} y={17} width={32} height={18} rx={3} fill="#ffffff" />
          <SvgText x={31} y={29.5} fontSize={9} fontWeight="bold" fontFamily="Arial" fill="#a8590f" textAnchor="middle">
            HONEY
          </SvgText>
          {/* A crack across the glass and bits of it broken off. */}
          <Path d="M36,6 L40,11 L35,14 L41,17" fill="none" stroke="#5c3a1a" strokeWidth={2} strokeLinejoin="round" />
          <Path d="M62,20 L67,16 L68,22 Z M74,18 L78,15 L78,20 Z" fill="#e7f5ff" stroke="#adb5bd" strokeWidth={1} />
        </G>
      </G>
    ),
  },
  {
    // A mop bucket tipped over, with water running out across the floor.
    name: 'Water',
    draw: () => (
      <G>
        {puddle('#74c0fc', '#1c7ed6')}
        <Path d="M2,18 L42,10 V46 L2,40 Z" fill={C.yellow.hex} stroke="#a07800" />
        <Ellipse cx={42} cy={28} rx={7} ry={18} fill="#ffd60a" stroke="#a07800" />
        <Ellipse cx={42} cy={28} rx={4.5} ry={15} fill="#3d5a73" stroke="none" />
        <Path d="M10,16 C2,2 30,-2 30,12" fill="none" stroke="#6c757d" strokeWidth={3} strokeLinecap="round" />
        <Path d="M44,32 C50,32 52,36 58,36 L48,44 C45,41 44,40 44,38 Z" fill="#74c0fc" stroke="none" />
      </G>
    ),
  },
  {
    // A juice bottle knocked over, orange juice pouring out.
    name: 'Juice',
    draw: () => (
      <G>
        {puddle('#ff922b', '#c25e00')}
        <Path d="M56,30 C62,32 62,36 66,36 L56,44 C54,40 54,38 54,36 Z" fill="#ff922b" stroke="none" />
        <Path d="M5,10 H34 Q42,10 46,20 H54 V32 H46 Q42,42 34,42 H5 Q0,42 0,37 V15 Q0,10 5,10 Z" fill={C.orange.hex} stroke="#8a4500" />
        <Rect x={52} y={19} width={7} height={14} rx={1.5} fill="#ffffff" stroke="#adb5bd" />
        <G stroke="none">
          <Rect x={4} y={17} width={34} height={18} fill="#ffffff" />
          <SvgText x={21} y={29.5} fontSize={9.5} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle">
            JUICE
          </SvgText>
        </G>
      </G>
    ),
  },
];

/** What the offer sign can say, drawn on two lines (`line2` may be empty). */
const DEALS = [
  { name: '10% off', line1: '10%', line2: 'OFF' },
  { name: '20% off', line1: '20%', line2: 'OFF' },
  { name: 'Half price', line1: 'HALF', line2: 'PRICE' },
  { name: 'Buy one, get one free', line1: 'BUY 1', line2: 'GET 1 FREE' },
  { name: '3 for 2', line1: '3 FOR 2', line2: '' },
];

/** What the offer sign can show, with its little picture (drawn around 0,0, about 50 across). */
const OFFERS: { name: string; icon: () => ReactElement }[] = [
  {
    name: 'Apples',
    icon: () => (
      <G>
        <Circle cx={0} cy={4} r={20} fill={C.red.hex} />
        <Path d="M0,-14 Q2,-22 8,-24" fill="none" stroke="#5c3d1e" strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={11} cy={-17} rx={8} ry={4} fill={C.green.hex} />
      </G>
    ),
  },
  {
    name: 'Bananas',
    icon: () => <Path d="M-22,-10 Q-18,22 22,14 Q4,14 -12,-12 Z" fill="#ffd60a" stroke="#a07800" strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    name: 'Bread',
    icon: () => <Path d="M-24,16 V0 Q-24,-18 -8,-16 Q0,-20 8,-16 Q24,-18 24,0 V16 Z" fill="#c98b4a" stroke="#8a5a2b" strokeWidth={3} />,
  },
  {
    name: 'Milk',
    icon: () => (
      <G>
        <Rect x={-13} y={-8} width={26} height={30} fill="#f8f9fa" stroke="#1d70d6" strokeWidth={3} />
        <Path d="M-13,-8 L-9,-20 H9 L13,-8 Z" fill="#1d70d6" />
      </G>
    ),
  },
  {
    name: 'Cheese',
    icon: () => (
      <G>
        <Path d="M-22,14 L22,14 L22,-6 L-22,-14 Z" fill="#ffc43d" stroke="#b07800" strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={-8} cy={4} r={4} fill="#e0a21a" />
        <Circle cx={10} cy={2} r={3} fill="#e0a21a" />
      </G>
    ),
  },
];

/** Aisle numbers easy to mix up with `n`: one or two along, or the digits swapped. */
function aisleLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 25);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The aisle number and the offer (what's on offer and the deal), on signs hanging from the ceiling, and what spilled. */
function details(random: Rng): SceneDetails {
  const aisle = random.int(1, 15);
  const offer = random.pick(OFFERS);
  const deal = random.pick(DEALS);
  const spill = random.pick(SPILLS);
  return {
    values: { aisle: String(aisle), offer: offer.name, deal: deal.name, spill: spill.name, aisleSide: random.next() < 0.5 ? 'left' : 'right' },
    facts: [
      { id: 'aisle-number', type: 'number', prompt: 'What was the aisle number?', answer: String(aisle), wrong: aisleLookalikes(aisle) },
      {
        id: 'offer',
        type: 'object',
        prompt: 'What was on special offer?',
        answer: offer.name,
        wrong: OFFERS.filter((o) => o !== offer).map((o) => o.name),
      },
      { id: 'deal', type: 'object', prompt: 'What did the offer sign say?', answer: deal.name, wrong: DEALS.filter((x) => x !== deal).map((x) => x.name) },
      {
        id: 'spill',
        type: 'object',
        prompt: 'What had spilled on the floor?',
        answer: spill.name,
        wrong: [...SPILLS.filter((x) => x !== spill).map((x) => x.name), 'Milk'],
        needs: 'spill',
      },
    ],
  };
}

type Palette = Record<'ceiling' | 'light' | 'backing' | 'board' | 'tag' | 'upright' | 'floor' | 'tile', string>;

/** A sign hanging on two wires from the ceiling, centred on `cx`, its bottom at `bottom`. */
function hanging(cx: number, bottom: number, w: number, h: number, body: ReactElement) {
  const top = bottom - h;
  return (
    <G>
      <Path d={`M${cx - w / 2 + 24},-600 V${top} M${cx + w / 2 - 24},-600 V${top}`} stroke="#6c757d" strokeWidth={3} />
      <G transform={`translate(${cx - w / 2} ${top})`}>{body}</G>
    </G>
  );
}

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const ceiling = height * CEILING;
  const floorLine = height * FLOOR_LINE;
  const aisle = d?.values?.aisle ?? '7';
  const offer = OFFERS.find((o) => o.name === d?.values?.offer) ?? OFFERS[0];
  const deal = DEALS.find((x) => x.name === d?.values?.deal) ?? DEALS[0];
  const aisleX = d?.values?.aisleSide === 'right' ? 640 : 260;
  const offerX = d?.values?.aisleSide === 'right' ? 250 : 650;
  // The signs hang just above the top shelf, as big as the ceiling band allows.
  const signH = Math.min(96, ceiling - 22);
  const signBottom = ceiling - 10;
  const s = signH / 96;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceiling + 600} fill={p.ceiling} />
      {/* Strip lights. */}
      {/* Ceiling tiles, and a soft glow round each strip light. */}
      {[-150, 0, 150, 300, 450, 600, 750, 900, 1050].map((x) => (
        <Rect key={x} x={x} y={-600} width={2} height={ceiling + 600} fill="#000000" fillOpacity={0.06} />
      ))}
      {[-300, 150, 600, 1050].map((x) => (
        <G key={x}>
          <Rect x={x - 12} y={Math.max(4, ceiling * 0.08) - 5} width={324} height={20} rx={10} fill={p.light} fillOpacity={0.45} />
          <Rect x={x} y={Math.max(4, ceiling * 0.08)} width={300} height={10} rx={5} fill={p.light} />
        </G>
      ))}
      {/* The shelving unit: dark backing, uprights at each end, a board under each shelf, a plinth. */}
      <Rect x={-600} y={ceiling} width={2100} height={floorLine - ceiling} fill={p.backing} />
      {/* Rows of holes in the back panel, where the shelf brackets clip in. */}
      <Path
        d={Array.from({ length: 18 }, (_, i) => `M${40 + i * 48},${ceiling + 8}V${floorLine - 8}`).join('')}
        stroke="#000000"
        strokeOpacity={0.12}
        strokeWidth={3}
        strokeDasharray="3 13"
        strokeLinecap="round"
      />
      {SHELVES.map(([, bottom]) => (
        <G key={bottom}>
          <Rect x={-600} y={bottom * height} width={2100} height={BOARD * height} fill={p.board} />
          {/* Light along the front lip, shade underneath. */}
          <Rect x={-600} y={bottom * height} width={2100} height={2} fill="#ffffff" fillOpacity={0.4} />
          <Rect x={-600} y={(bottom + BOARD) * height} width={2100} height={4} fill="#000000" fillOpacity={0.25} />
          {/* Price labels along the shelf edge, each with a price and a barcode. */}
          {Array.from({ length: 6 }, (_, i) => (
            <G key={i}>
              <Rect x={70 + i * 150} y={bottom * height + BOARD * height * 0.2} width={34} height={BOARD * height * 0.6} fill={p.tag} />
              <Rect x={74 + i * 150} y={bottom * height + BOARD * height * 0.38} width={14} height={BOARD * height * 0.24} fill="#212529" fillOpacity={0.6} />
              {[92, 95, 97, 100].map((x) => (
                <Rect key={x} x={x + i * 150} y={bottom * height + BOARD * height * 0.32} width={1.4} height={BOARD * height * 0.36} fill="#212529" fillOpacity={0.5} />
              ))}
            </G>
          ))}
        </G>
      ))}
      <Rect x={-600} y={ceiling} width={612} height={floorLine - ceiling} fill={p.upright} />
      <Rect x={888} y={ceiling} width={612} height={floorLine - ceiling} fill={p.upright} />
      <Rect x={-600} y={floorLine} width={2100} height={height - floorLine + 600} fill={p.floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: floorLine, x1: 940, y1: height }, 140, '#000000', 0.05, 3)}
      <Rect x={-600} y={floorLine} width={2100} height={6} fill="#000000" fillOpacity={0.12} />
      {/* The aisle sign: what number? */}
      {hanging(
        aisleX,
        signBottom,
        200 * s,
        signH,
        <G transform={`scale(${s})`}>
          <Rect x={0} y={0} width={200} height={96} rx={12} fill={C.blue.hex} stroke="#ffffff" strokeWidth={5} />
          <SvgText x={62} y={50} fontSize={26} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle" alignmentBaseline="central">
            AISLE
          </SvgText>
          <SvgText x={148} y={52} fontSize={58} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle" alignmentBaseline="central">
            {aisle}
          </SvgText>
        </G>,
      )}
      {/* The offer sign: what was on offer? */}
      {hanging(
        offerX,
        signBottom,
        240 * s,
        signH,
        <G transform={`scale(${s})`}>
          <Rect x={0} y={0} width={240} height={96} rx={12} fill={C.red.hex} stroke="#ffffff" strokeWidth={5} />
          {/* "OFFER" small on top, the deal big underneath. */}
          <SvgText x={76} y={22} fontSize={16} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle">
            OFFER
          </SvgText>
          <SvgText x={76} y={deal.line2 ? 55 : 68} fontSize={deal.line1.length > 5 ? 30 : 36} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" textAnchor="middle">
            {deal.line1}
          </SvgText>
          {deal.line2 ? (
            <SvgText x={76} y={83} fontSize={deal.line2.length > 5 ? 19 : 26} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" textAnchor="middle">
              {deal.line2}
            </SvgText>
          ) : null}
          <Circle cx={188} cy={48} r={42} fill="#ffffff" />
          <G transform="translate(188 50) scale(1.35)">{offer.icon()}</G>
        </G>,
      )}
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Lines between the floor tiles, broken around anything standing on them.
  return [0.79, 0.87, 0.95].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.tile, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  // A bright modern shop: white ceiling, dark slate shelves so every product colour pops, pale tiles.
  modern: {
    ceiling: '#f1f4f7',
    light: '#ffffff',
    backing: '#3b4a5c',
    board: '#e9eef2',
    tag: '#ffd60a',
    upright: '#2b3644',
    floor: '#dfe5ea',
    tile: '#8c99a6',
  },
  // A cosy corner shop: cream ceiling, dark wooden shelves, light oak floor.
  corner: {
    ceiling: '#f6efe2',
    light: '#fffaf0',
    backing: '#4b3a2c',
    board: '#a0703c',
    tag: '#f8f9fa',
    upright: '#3a2c20',
    floor: '#e6d2b5',
    tile: '#9c7a50',
  },
};

function surfaceAt(_x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR_LINE) return 'backing';
  return 'floor';
}

export const supermarket: Recipe = {
  id: 'supermarket',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'In the supermarket',
  zones: [
    // Signs only (backdrop): nothing else hangs here.
    { id: 'ceiling', label: 'Hanging from the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    { id: 'top', label: 'On the top shelf', surface: 'ground', top: SHELVES[0][0], bottom: SHELVES[0][1], rows: 1, flush: true },
    { id: 'middle', label: 'On the middle shelf', surface: 'ground', top: SHELVES[1][0], bottom: SHELVES[1][1], rows: 1, flush: true },
    { id: 'bottom', label: 'On the bottom shelf', surface: 'ground', top: SHELVES[2][0], bottom: SHELVES[2][1], rows: 1, flush: true },
    { id: 'floor', label: 'On the floor', surface: 'ground', top: FLOOR_TOP, bottom: 1, rows: 2, inFront: true },
  ],
  items,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // The ceiling, darker towards the shelves.
    { top: 0, bottom: CEILING, from: ['#ffffff', 0], to: ['#000000', 0.06] },
    // Shade at the back of each shelf, under the one above.
    { top: CEILING, bottom: SHELVES[0][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    { top: SHELVES[0][1] + BOARD, bottom: SHELVES[1][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    { top: SHELVES[1][1] + BOARD, bottom: SHELVES[2][1], from: ['#000000', 0.2], to: ['#000000', 0] },
    // Shade on the floor by the shelves.
    { top: FLOOR_LINE, bottom: 1, from: ['#000000', 0.12], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
