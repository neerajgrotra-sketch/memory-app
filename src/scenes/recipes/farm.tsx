import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { C } from '../colours';
import { balloon, bird, cloudShape, dog, person, sun } from '../items/common';
import { lineMarks, scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { ColourDef, ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { strokes } from '../texture';

/**
 * On the farm: sky, the barn and hills behind, a field with crops, a fence, and the farmyard in front.
 * Animals live in the farmyard (sheep may graze in the field too); the tractor works the field.
 */

/** Band edges, as fractions of the picture height. */
const HILLS = 0.24;
const FIELD = 0.38;
const FENCE = 0.555;
const YARD = 0.585;

const SKY = ['sky'];
const FIELD_Z = ['field'];
const YARD_Z = ['yard'];

/** Black-and-white cows are named as such in answers. */
const BLACK_AND_WHITE: ColourDef = { name: 'Black and white', hex: '#f8f9fa' };

const items: ItemDef[] = [
  { ...sun, zones: SKY, maxCount: 1 },
  { ...bird, kind: 'crow', singular: 'crow', plural: 'crows', zones: SKY, maxCount: 4 },
  { ...balloon, zones: SKY, maxCount: 2 },
  {
    kind: 'tractor',
    singular: 'tractor',
    plural: 'tractors',
    article: 'a',
    w: 200,
    h: 120,
    // Bigger than the animals and the farmer, like a real tractor; it works the field, facing the way it drives.
    tier: 'xl',
    size: 0.32,
    wide: true,
    zones: FIELD_Z,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.green, C.blue, C.yellow],
    draw: (colour) => (
      <G>
        <Rect x={150} y={18} width={8} height={30} rx={3} fill="#555" stroke="#333" />
        <Path d="M150,16 Q148,8 154,4 Q160,2 158,10" fill="none" stroke="#adb5bd" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
        <Path d="M60,40 H112 V8 H150 L158,40 H190 C196,40 198,46 198,52 V80 H60 Z" fill={colour} />
        <G stroke="none">
          <Rect x={118} y={14} width={26} height={24} rx={3} fill="#bde0fe" />
          <Path d="M122,16 L132,16 L122,30 Z" fill="#ffffff" fillOpacity={0.6} />
          {/* A grille, a headlight, a step and a stripe of light along the bonnet. */}
          <Path d="M184,46 V76 M190,46 V76" stroke="#000000" strokeOpacity={0.25} strokeWidth={2} />
          <Rect x={192} y={48} width={6} height={8} rx={2} fill="#fff3b0" />
          <Rect x={104} y={66} width={20} height={5} rx={2} fill="#343a40" />
          <Path d="M64,44 H186" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} />
        </G>
        <Circle cx={60} cy={82} r={36} fill="#2b2b2b" stroke="#111" />
        {/* Chunky treads round the big wheel. */}
        <Circle cx={60} cy={82} r={31} fill="none" stroke="#111" strokeWidth={4} strokeDasharray="6 5" />
        <Circle cx={60} cy={82} r={16} fill={colour} stroke="none" />
        <Circle cx={60} cy={82} r={5} fill="#343a40" stroke="none" />
        <Circle cx={172} cy={96} r={22} fill="#2b2b2b" stroke="#111" />
        <Circle cx={172} cy={96} r={18} fill="none" stroke="#111" strokeWidth={3} strokeDasharray="5 4" />
        <Circle cx={172} cy={96} r={9} fill={colour} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'scarecrow',
    singular: 'scarecrow',
    plural: 'scarecrows',
    article: 'a',
    w: 100,
    h: 140,
    tier: 'medium',
    size: 0.14,
    // Stands among the crops; two are spaced apart.
    spread: true,
    zones: FIELD_Z,
    maxCount: 2,
    colours: [C.red, C.blue, C.purple, C.green, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the scarecrows’ shirts?' : 'What colour was the scarecrow’s shirt?'),
    draw: (colour) => (
      <G>
        <Rect x={46} y={40} width={8} height={100} fill="#8b5a2b" stroke="#5c3a1b" />
        <Rect x={4} y={52} width={92} height={8} fill="#8b5a2b" stroke="#5c3a1b" />
        <Path d="M28,50 H72 L78,100 H22 Z" fill={colour} />
        <G stroke="none">
          {/* Patches on the shirt, buttons, straw at the cuffs and collar, a stitched smile. */}
          <Rect x={30} y={70} width={14} height={12} fill="#e9c46a" transform="rotate(-8 37 76)" />
          <Rect x={56} y={62} width={12} height={10} fill="#ffffff" fillOpacity={0.5} transform="rotate(10 62 67)" />
          <Circle cx={50} cy={64} r={2} fill="#343a40" />
          <Circle cx={50} cy={78} r={2} fill="#343a40" />
          <Path d="M40,50 L44,44 M50,50 V43 M60,50 L56,44" stroke="#e9c46a" strokeWidth={3} strokeLinecap="round" />
          <Path d="M24,100 L20,108 M34,100 L32,108 M66,100 L68,108 M76,100 L80,108" stroke="#e9c46a" strokeWidth={3} strokeLinecap="round" />
        </G>
        <Path d="M4,56 L-2,48 M4,56 L-2,64 M96,56 L102,48 M96,56 L102,64" stroke="#e9c46a" strokeWidth={4} strokeLinecap="round" />
        <Circle cx={50} cy={32} r={16} fill="#f1d9a7" />
        <Path d="M22,20 H78 L66,16 V2 H34 V16 Z" fill="#c9a227" />
        <Rect x={34} y={12} width={32} height={4} fill="#e63946" stroke="none" />
        <Circle cx={44} cy={32} r={2.5} fill="#333" stroke="none" />
        <Circle cx={56} cy={32} r={2.5} fill="#333" stroke="none" />
        <Path d="M42,39 Q50,44 58,39" fill="none" stroke="#5c3a1b" strokeWidth={1.5} strokeDasharray="2 2" />
      </G>
    ),
  },
  {
    kind: 'pumpkin',
    singular: 'pumpkin',
    plural: 'pumpkins',
    article: 'a',
    w: 70,
    h: 60,
    tier: 'small',
    size: 0.11,
    zones: FIELD_Z,
    maxCount: 5,
    tone: '#f77f00',
    draw: () => (
      <G>
        <Rect x={32} y={0} width={7} height={14} rx={2} fill="#4f772d" stroke="#31511c" />
        <Path d="M38,6 Q52,0 56,10 Q46,8 40,12 Z" fill="#6a994e" stroke="none" />
        <Ellipse cx={35} cy={36} rx={33} ry={23} fill="#f77f00" />
        <Path d="M35,14 C22,24 22,50 35,59 M35,14 C48,24 48,50 35,59 M12,22 C6,34 8,48 16,56 M58,22 C64,34 62,48 54,56" fill="none" stroke="#c85f00" strokeWidth={3} />
        <Ellipse cx={22} cy={28} rx={6} ry={4} fill="#ffffff" fillOpacity={0.35} stroke="none" />
      </G>
    ),
  },
  {
    kind: 'haybale',
    singular: 'hay bale',
    plural: 'hay bales',
    article: 'a',
    w: 110,
    h: 75,
    tier: 'medium',
    size: 0.15,
    // Spaced out across the field or yard, never stacked in a line.
    spread: true,
    zones: [...FIELD_Z, ...YARD_Z],
    maxCount: 3,
    tone: '#f2cf63',
    draw: () => (
      <G>
        <Rect x={2} y={4} width={106} height={70} rx={14} fill="#f2cf63" />
        <Line x1={36} y1={6} x2={36} y2={72} stroke="#b08a2e" strokeWidth={4} />
        <Line x1={74} y1={6} x2={74} y2={72} stroke="#b08a2e" strokeWidth={4} />
        <Path d="M14,24 H28 M50,40 H64 M86,28 H98 M18,56 H30 M44,18 H60 M84,58 H100 M10,40 H24" stroke="#c9a227" strokeWidth={3} strokeLinecap="round" />
        <G stroke="none">
          <Path d="M6,10 H104 V18 H6 Z" fill="#ffffff" fillOpacity={0.25} />
          <Path d="M4,64 H106 V72 Q106,74 100,74 H10 Q4,74 4,72 Z" fill="#000000" fillOpacity={0.1} />
          <Path d="M2,20 L-4,16 M2,40 L-5,40 M108,30 L114,26 M108,52 L114,54" stroke="#e9c46a" strokeWidth={2.5} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'cow',
    singular: 'cow',
    plural: 'cows',
    article: 'a',
    w: 160,
    h: 105,
    tier: 'large',
    size: 0.22,
    spread: true,
    zones: YARD_Z,
    maxCount: 3,
    colours: [BLACK_AND_WHITE, C.brown],
    draw: (colour) => {
      const spotted = colour === BLACK_AND_WHITE.hex;
      return (
        <G>
          <Rect x={30} y={62} width={12} height={42} rx={4} fill={colour} />
          <Rect x={52} y={62} width={12} height={42} rx={4} fill={colour} />
          <Rect x={96} y={62} width={12} height={42} rx={4} fill={colour} />
          <Rect x={116} y={62} width={12} height={42} rx={4} fill={colour} />
          <Rect x={20} y={22} width={118} height={52} rx={22} fill={colour} />
          {spotted && (
            <G fill="#262626" stroke="none">
              <Ellipse cx={52} cy={40} rx={16} ry={11} />
              <Ellipse cx={100} cy={52} rx={13} ry={10} />
              <Ellipse cx={78} cy={30} rx={9} ry={6} />
            </G>
          )}
          <Ellipse cx={86} cy={74} rx={10} ry={6} fill="#f4a3b5" stroke="none" />
          <Path d="M22,34 C10,40 8,58 12,70" fill="none" stroke={spotted ? '#262626' : colour} strokeWidth={4} strokeLinecap="round" />
          <Rect x={128} y={10} width={30} height={40} rx={12} fill={colour} />
          <Ellipse cx={146} cy={44} rx={13} ry={9} fill="#f4a3b5" />
          <G stroke="none">
            {/* Nostrils, ears, a bell on a collar and light along the back. */}
            <Circle cx={141} cy={45} r={2} fill="#c76b80" />
            <Circle cx={151} cy={45} r={2} fill="#c76b80" />
            <Ellipse cx={126} cy={20} rx={7} ry={4} fill={spotted ? '#262626' : colour} />
            <Ellipse cx={159} cy={20} rx={7} ry={4} fill={spotted ? '#262626' : colour} />
            <Path d="M126,44 Q132,54 140,54" fill="none" stroke="#e63946" strokeWidth={3} />
            <Circle cx={134} cy={56} r={4} fill="#ffd60a" />
            <Path d="M30,26 H128" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
            <Rect x={28} y={98} width={16} height={6} rx={2} fill="#3d2412" />
            <Rect x={50} y={98} width={16} height={6} rx={2} fill="#3d2412" />
            <Rect x={94} y={98} width={16} height={6} rx={2} fill="#3d2412" />
            <Rect x={114} y={98} width={16} height={6} rx={2} fill="#3d2412" />
          </G>
          <Path d="M132,12 L126,2 M152,12 L158,2" stroke="#d9d9d9" strokeWidth={4} strokeLinecap="round" />
          <Circle cx={138} cy={26} r={3} fill="#111" stroke="none" />
          <Circle cx={152} cy={26} r={3} fill="#111" stroke="none" />
        </G>
      );
    },
  },
  {
    kind: 'horse',
    singular: 'horse',
    plural: 'horses',
    article: 'a',
    w: 150,
    h: 130,
    tier: 'large',
    size: 0.22,
    spread: true,
    zones: YARD_Z,
    maxCount: 2,
    colours: [C.brown, C.black, C.white],
    draw: (colour) => (
      <G>
        <Rect x={28} y={70} width={11} height={58} rx={4} fill={colour} />
        <Rect x={46} y={70} width={11} height={58} rx={4} fill={colour} />
        <Rect x={92} y={70} width={11} height={58} rx={4} fill={colour} />
        <Rect x={108} y={70} width={11} height={58} rx={4} fill={colour} />
        <Path d="M20,52 C6,60 4,84 10,100" fill="none" stroke="#3d2412" strokeWidth={7} strokeLinecap="round" />
        <Rect x={18} y={44} width={108} height={40} rx={18} fill={colour} />
        <Path d="M100,52 C104,34 108,20 116,10 L130,14 C126,28 124,40 124,56 Z" fill={colour} />
        <Path d="M114,8 C120,2 132,2 136,8 L148,26 C150,32 144,36 138,34 L126,24 Z" fill={colour} />
        <Path d="M118,4 L114,0 L122,2 Z" fill={colour} />
        <Path d="M114,10 C108,20 104,32 101,46" fill="none" stroke="#3d2412" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={128} cy={14} r={2.5} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Hooves, a nostril, a blaze down the face and light along the back. */}
          <Rect x={27} y={122} width={13} height={6} rx={2} fill="#3d2412" />
          <Rect x={45} y={122} width={13} height={6} rx={2} fill="#3d2412" />
          <Rect x={91} y={122} width={13} height={6} rx={2} fill="#3d2412" />
          <Rect x={107} y={122} width={13} height={6} rx={2} fill="#3d2412" />
          <Circle cx={143} cy={28} r={1.8} fill="#111" />
          <Path d="M124,10 L142,26" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
          <Path d="M26,50 H116" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
          <Path d="M112,14 C106,24 103,36 100,46" fill="none" stroke="#3d2412" strokeWidth={3} strokeOpacity={0.6} />
        </G>
      </G>
    ),
  },
  {
    kind: 'pig',
    singular: 'pig',
    plural: 'pigs',
    article: 'a',
    w: 110,
    h: 75,
    tier: 'medium',
    size: 0.14,
    zones: YARD_Z,
    maxCount: 4,
    tone: '#f4a3b5',
    draw: () => (
      <G>
        <Rect x={24} y={48} width={10} height={26} rx={4} fill="#f4a3b5" />
        <Rect x={70} y={48} width={10} height={26} rx={4} fill="#f4a3b5" />
        <Ellipse cx={52} cy={40} rx={42} ry={26} fill="#f4a3b5" />
        <Path d="M10,34 C2,30 4,22 10,24" fill="none" stroke="#d6738d" strokeWidth={3} strokeLinecap="round" />
        <Circle cx={92} cy={34} r={16} fill="#f4a3b5" />
        <Polygon points="84,20 88,8 96,20" fill="#f4a3b5" />
        <Ellipse cx={106} cy={38} rx={6} ry={8} fill="#e98aa4" />
        <Circle cx={92} cy={28} r={2.5} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Nostrils, a little mud, and light along the back. */}
          <Ellipse cx={105} cy={35} rx={1.5} ry={2.2} fill="#b85c76" />
          <Ellipse cx={107} cy={41} rx={1.5} ry={2.2} fill="#b85c76" />
          <Ellipse cx={34} cy={54} rx={10} ry={5} fill="#8b5a2b" fillOpacity={0.45} />
          <Path d="M20,24 Q52,10 84,22" fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={4} strokeLinecap="round" />
          <Rect x={24} y={70} width={10} height={4} rx={1} fill="#c76b80" />
          <Rect x={70} y={70} width={10} height={4} rx={1} fill="#c76b80" />
        </G>
      </G>
    ),
  },
  {
    kind: 'sheep',
    singular: 'sheep',
    plural: 'sheep',
    article: 'a',
    w: 110,
    h: 80,
    tier: 'medium',
    size: 0.14,
    // In the farmyard with the other animals, never among the crops and scarecrows.
    zones: YARD_Z,
    maxCount: 5,
    colours: [C.white, C.black],
    // A black sheep in a white flock on Hard: "What colours were the sheep?"
    mixedColours: true,
    draw: (colour) => (
      <G>
        <Rect x={28} y={54} width={9} height={26} rx={3} fill="#6c6c6c" stroke="#3a3a3a" />
        <Rect x={70} y={54} width={9} height={26} rx={3} fill="#6c6c6c" stroke="#3a3a3a" />
        <G fill={colour}>
          <Circle cx={30} cy={38} r={20} />
          <Circle cx={52} cy={30} r={22} />
          <Circle cx={74} cy={38} r={20} />
          <Circle cx={52} cy={48} r={20} />
        </G>
        <G fill="none" stroke={colour === C.white.hex ? '#dee2e6' : '#495057'} strokeWidth={2}>
          {/* Woolly curls. */}
          <Path d="M26,34 q4,-4 8,0 M46,26 q4,-4 8,0 M64,34 q4,-4 8,0 M42,46 q4,-4 8,0 M58,48 q4,-4 8,0 M24,46 q4,-4 8,0" />
        </G>
        <Ellipse cx={96} cy={36} rx={13} ry={16} fill="#6c6c6c" stroke="#3a3a3a" />
        <Ellipse cx={86} cy={28} rx={7} ry={4} fill="#6c6c6c" stroke="#3a3a3a" />
        <Circle cx={100} cy={32} r={2.5} fill="#fff" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'goat',
    singular: 'goat',
    plural: 'goats',
    article: 'a',
    w: 105,
    h: 95,
    tier: 'medium',
    size: 0.14,
    zones: YARD_Z,
    maxCount: 2,
    colours: [C.white, C.brown],
    draw: (colour) => (
      <G>
        <Rect x={18} y={58} width={9} height={36} rx={3} fill={colour} />
        <Rect x={62} y={58} width={9} height={36} rx={3} fill={colour} />
        <Path d="M14,40 L6,30" stroke={colour} strokeWidth={5} strokeLinecap="round" />
        <Rect x={10} y={36} width={70} height={30} rx={14} fill={colour} />
        {/* Neck rising into the head, so the head is part of the goat. */}
        <Path d="M64,44 C68,30 74,20 82,14 L94,22 C88,30 82,40 78,52 Z" fill={colour} />
        <Path d="M80,14 C86,6 98,8 102,16 L104,26 C104,32 96,34 92,30 Z" fill={colour} />
        <Path d="M84,12 C82,4 76,0 70,2 M90,10 C92,2 98,-1 102,2" fill="none" stroke="#7a6a58" strokeWidth={4} strokeLinecap="round" />
        <Path d="M80,16 L70,18 L78,22 Z" fill={colour} />
        <Path d="M98,30 L97,42 L92,32 Z" fill="#7a6a58" stroke="none" />
        <Circle cx={94} cy={18} r={2.5} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'chicken',
    singular: 'chicken',
    plural: 'chickens',
    article: 'a',
    w: 64,
    h: 64,
    tier: 'small',
    size: 0.1,
    zones: YARD_Z,
    maxCount: 6,
    colours: [C.white, C.brown],
    draw: (colour) => (
      <G>
        <Path d="M28,50 V62 M40,50 V62 M24,62 H32 M36,62 H44" stroke="#f4a261" strokeWidth={4} strokeLinecap="round" />
        <Path d="M8,30 L2,10 L14,18 L12,6 L22,20 Z" fill={colour} />
        <Ellipse cx={32} cy={36} rx={24} ry={18} fill={colour} />
        <Circle cx={50} cy={20} r={11} fill={colour} />
        <Path d="M44,10 C45,3 49,3 50,8 C52,2 57,3 56,10 C59,8 61,12 57,14 Z" fill="#e63946" stroke="none" />
        <Polygon points="60,18 68,21 60,24" fill="#f4a261" stroke="none" />
        <Path d="M58,26 C60,30 56,32 55,28 Z" fill="#e63946" stroke="none" />
        <Circle cx={53} cy={18} r={2.2} fill="#111" stroke="none" />
        <Path d="M22,34 C28,42 38,42 44,34" fill="none" stroke="#00000033" strokeWidth={3} />
        <Path d="M24,40 C28,46 36,46 40,40 M14,32 L8,26 M16,38 L9,36" fill="none" stroke="#00000026" strokeWidth={2} />
        <Circle cx={53.6} cy={17.4} r={0.8} fill="#ffffff" stroke="none" />
      </G>
    ),
  },
  { ...dog, zones: YARD_Z, maxCount: 1 },
  {
    ...person,
    kind: 'farmer',
    singular: 'farmer',
    plural: 'farmers',
    zones: YARD_Z,
    maxCount: 1,
    colourPrompt: () => 'What colour was the farmer’s shirt?',
    draw: (colour) => (
      <G>
        {person.draw(colour)}
        {/* A straw hat. */}
        <Ellipse cx={32} cy={8} rx={26} ry={5} fill="#e9c46a" stroke="#b08a2e" />
        <Path d="M20,8 C20,-4 44,-4 44,8 Z" fill="#e9c46a" stroke="#b08a2e" />
      </G>
    ),
  },
  {
    kind: 'wheelbarrow',
    singular: 'wheelbarrow',
    plural: 'wheelbarrows',
    article: 'a',
    w: 140,
    h: 80,
    // About as long as the farmer is tall, like a real one.
    tier: 'medium',
    size: 0.16,
    zones: YARD_Z,
    maxCount: 1,
    colours: [C.red, C.green, C.blue],
    // Parked the way a wheelbarrow stands: wheel at the front, the tray over it, handles sloping back
    // to their grips, and a leg under the back resting on the ground.
    draw: (colour) => (
      <G>
        <Path d="M24,62 L104,44 M24,62 L96,52" stroke="#5c3a1b" strokeWidth={5} strokeLinecap="round" />
        <Path d="M84,48 L86,78 M96,46 L100,78" stroke="#555" strokeWidth={5} strokeLinecap="round" />
        <Path d="M90,32 L134,42" stroke="#5c3a1b" strokeWidth={6} strokeLinecap="round" />
        <Rect x={124} y={36} width={14} height={9} rx={4} fill="#333" stroke="none" transform="rotate(13 131 40)" />
        <Path d="M4,16 L98,24 L84,56 L28,56 Z" fill={colour} />
        <Path d="M4,16 L98,24" stroke="#00000040" strokeWidth={4} strokeLinecap="round" />
        <Path d="M12,18 Q40,4 66,14 Q86,10 94,23 Z" fill="#6b4423" stroke="none" />
        <Path d="M20,24 L32,52" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} />
        <Circle cx={24} cy={62} r={17} fill="#2b2b2b" stroke="#111" />
        <Circle cx={24} cy={62} r={6} fill="#adb5bd" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'churn',
    singular: 'milk churn',
    plural: 'milk churns',
    article: 'a',
    w: 50,
    h: 75,
    tier: 'small',
    size: 0.1,
    // Stands at the front of the yard, ready for collection.
    frontRow: true,
    zones: YARD_Z,
    maxCount: 3,
    tone: '#c9d2dc',
    draw: () => (
      <G>
        <Path d="M10,22 H40 L44,72 H6 Z" fill="#c9d2dc" />
        <Rect x={14} y={8} width={22} height={14} rx={3} fill="#c9d2dc" />
        <Rect x={10} y={2} width={30} height={8} rx={3} fill="#8d99ae" />
        <Line x1={8} y1={44} x2={42} y2={44} stroke="#6c757d" strokeWidth={3} />
        <Path d="M8,28 Q2,30 4,36 M42,28 Q48,30 46,36" fill="none" stroke="#6c757d" strokeWidth={3} />
        <Rect x={14} y={24} width={5} height={44} rx={2.5} fill="#ffffff" fillOpacity={0.5} stroke="none" />
      </G>
    ),
  },
  {
    // A hen's nest in the straw with 1 to 5 eggs, chosen per picture: "How many eggs were in the nest?".
    kind: 'nest',
    singular: 'nest of eggs',
    plural: 'nests of eggs',
    article: 'a',
    w: 100,
    h: 56,
    tier: 'small',
    // Drawn bigger than life (about 40 cm across) so the eggs can be counted on a phone.
    size: 0.13,
    frontRow: true,
    zones: YARD_Z,
    maxCount: 1,
    countable: false,
    // Dark straw, so it stands out from the green yard (pale straw was too close to it to be placed).
    tone: '#6b4423',
    draw: (_colour, details) => {
      const eggs = Math.max(1, Math.min(5, Number(details?.values?.eggs ?? 3)));
      // Side by side, centred in the nest, with a little stagger so each egg stands apart.
      const xs = Array.from({ length: eggs }, (_, i) => 50 + (i - (eggs - 1) / 2) * 19);
      return (
        <G>
          <Ellipse cx={50} cy={44} rx={48} ry={11} fill="#3d2412" />
          {/* Big white eggs with a dark outline, sitting high in the nest so each one can be counted. */}
          {xs.map((x, i) => (
            <Ellipse key={x} cx={x} cy={i % 2 ? 24 : 27} rx={9} ry={13} fill="#ffffff" stroke="#6c5a3e" strokeWidth={2.5} />
          ))}
          <Path d="M4,42 Q50,58 96,42 Q92,54 50,56 Q8,54 4,42 Z" fill="#6b4423" />
          <G stroke="#c8954b" strokeWidth={2} strokeLinecap="round" fill="none">
            <Path d="M10,44 L22,49 M26,47 L38,52 M44,50 L56,50 M62,52 L74,47 M78,49 L90,44 M16,40 L6,35 M84,40 L94,35" />
          </G>
        </G>
      );
    },
  },
];

type Palette = Record<'sky' | 'hills' | 'hillsFar' | 'field' | 'rows' | 'yard' | 'fence' | 'barn', string>;

/** The barn's colour is chosen per picture, and is something to remember (Medium and Hard). */
const BARN_COLOURS: ColourDef[] = [C.red, C.blue, C.green, C.yellow];

function details(random: Rng): SceneDetails {
  const colour = random.pick(BARN_COLOURS);
  const eggs = random.int(1, 5);
  const nearEggs = [eggs - 1, eggs + 1, eggs - 2, eggs + 2, eggs + 3].filter((n) => n >= 1 && n <= 6).map(String);
  return {
    palette: { barn: colour.hex },
    values: { barnSide: random.next() < 0.5 ? 'left' : 'right', eggs: String(eggs) },
    facts: [
      { id: 'nest-eggs', family: 'story', type: 'count', prompt: 'How many eggs were in the nest?', answer: String(eggs), wrong: nearEggs.slice(0, 3), fallback: nearEggs.slice(3), needs: 'nest' },
      {
        id: 'barn-colour',
        type: 'colour',
        prompt: 'What colour was the barn?',
        answer: colour.name,
        wrong: BARN_COLOURS.filter((c) => c !== colour).map((c) => c.name),
      },
    ],
  };
}

/** The barn, standing on the field's back edge: walls, a darker roof, a white-framed door with a cross brace. */
function barn(x: number, base: number, colour: string) {
  const w = 230;
  const h = 120;
  const top = base - h;
  return (
    <G>
      <Path d={`M${x},${top + 40} L${x + w / 2},${top - 30} L${x + w},${top + 40} Z`} fill="#5a3e36" />
      <Rect x={x} y={top + 38} width={w} height={h - 38} fill={colour} />
      {/* Vertical planks, a white trim under the roof, and roof shingles. */}
      <G stroke="#000000" strokeOpacity={0.12} strokeWidth={2}>
        {Array.from({ length: 11 }, (_, i) => (
          <Path key={i} d={`M${x + 20 + i * 19},${top + 40} V${base}`} />
        ))}
      </G>
      <Path d={`M${x - 4},${top + 42} L${x + w / 2},${top - 26} L${x + w + 4},${top + 42}`} fill="none" stroke="#f8f9fa" strokeWidth={6} />
      <G stroke="#000000" strokeOpacity={0.15} strokeWidth={2}>
        {[0.25, 0.5, 0.75].map((f) => (
          <Path key={f} d={`M${x + (w / 2) * f},${top + 40 - 70 * f} H${x + w - (w / 2) * f}`} />
        ))}
      </G>
      <Rect x={x + w / 2 - 38} y={base - 76} width={76} height={76} fill="#f8f9fa" />
      <Rect x={x + w / 2 - 32} y={base - 70} width={64} height={70} fill={colour} />
      <Path d={`M${x + w / 2 - 32},${base - 70} L${x + w / 2 + 32},${base} M${x + w / 2 + 32},${base - 70} L${x + w / 2 - 32},${base}`} stroke="#f8f9fa" strokeWidth={6} />
      <Rect x={x + w / 2 - 16} y={top + 4} width={32} height={26} fill="#f8f9fa" />
      <Rect x={x + w / 2 - 11} y={top + 9} width={22} height={16} fill="#3d2412" />
      <Path d={`M${x + w / 2 - 11},${top + 25} Q${x + w / 2},${top + 16} ${x + w / 2 + 11},${top + 25} Z`} fill="#f2cf63" />
    </G>
  );
}

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const hills = height * HILLS;
  const field = height * FIELD;
  const fence = height * FENCE;
  const yard = height * YARD;
  const barnX = d?.values?.barnSide === 'right' ? 600 : 70;
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={field + 600} fill={p.sky} />
      <Rect x={-600} y={hills + (field - hills) * 0.55} width={2100} height={(field - hills) * 0.45 + 2} fill={p.hillsFar} />
      {/* Rolling hills behind the barn. */}
      <Ellipse cx={150} cy={field + 30} rx={700} ry={field - hills + 40} fill={p.hillsFar} />
      <Ellipse cx={900} cy={field + 40} rx={650} ry={field - hills + 10} fill={p.hills} />
      {/* Little trees dotted along the far hills, and sun on the hilltops. */}
      <G fill={p.rows} fillOpacity={0.7}>
        {[-180, -60, 330, 470, 790, 1040].map((x, i) => (
          <G key={x}>
            <Circle cx={x} cy={hills + (field - hills) * (0.45 + (i % 3) * 0.08)} r={14} />
            <Rect x={x - 2} y={hills + (field - hills) * (0.45 + (i % 3) * 0.08) + 10} width={4} height={10} />
          </G>
        ))}
      </G>
      <Ellipse cx={900} cy={field + 40} rx={560} ry={(field - hills) * 0.8} fill="#ffffff" fillOpacity={0.08} />
      {barn(barnX, field, d?.palette?.barn ?? p.barn)}
      <Rect x={-600} y={field} width={2100} height={yard - field} fill={p.field} />
      {/* Rows of crops across the field. */}
      {[0.2, 0.45, 0.7].map((f) => (
        <G key={f}>
          <Rect x={-600} y={field + (fence - field) * f} width={2100} height={6} fill={p.rows} />
          {/* Young crops sprouting along each row. */}
          {strokes({ x0: -40, y0: field + (fence - field) * f + 2, x1: 940, y1: field + (fence - field) * f + 4 }, 70, p.rows, 0.8, 9, 4, 3, 41 + f * 100)}
        </G>
      ))}
      <Rect x={-600} y={yard} width={2100} height={height - yard + 600} fill={p.yard} />
      {/* The texture of the ground. */}
      {strokes({ x0: -40, y0: yard + 20, x1: 940, y1: height }, 220, '#1f6b2a', 0.22, 10, 3)}
      {/* The fence between the field and the farmyard. */}
      <G fill={p.fence}>
        <Rect x={-600} y={fence + 6} width={2100} height={6} />
        <Rect x={-600} y={fence + 20} width={2100} height={6} />
        {Array.from({ length: 28 }, (_, i) => (
          <Rect key={i} x={-600 + i * 80} y={fence - 4} width={10} height={yard - fence + 6} />
        ))}
      </G>
      <G fill="#ffffff" fillOpacity={0.35}>
        <Rect x={-600} y={fence + 6} width={2100} height={2} />
        <Rect x={-600} y={fence + 20} width={2100} height={2} />
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const hills = height * HILLS;
  const yard = height * YARD;
  const tuft = (x: number, y: number) => (
    <Path d={`M${x},${y + 14} l6,-14 l4,14 l6,-10 l4,10`} fill="none" stroke={variant.palette.rows} strokeWidth={3} strokeLinecap="round" />
  );
  return [
    // White clouds: scenery, so solid, but never touching anything in the sky.
    ...scatterMarks({ x0: -100, y0: height * 0.02, x1: 1000, y1: hills - 40 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true),
    ...scatterMarks({ x0: 20, y0: yard + 30, x1: 880, y1: height - 30 }, 24, 16, 8, boxes, random, 0.3, tuft),
    ...lineMarks(yard + 2, -600, 1500, boxes, variant.palette.rows, 3, 0.25),
  ];
}

const PALETTES: Record<string, Palette> = {
  summer: {
    sky: '#8fd3f4',
    hillsFar: '#9fcf6b',
    hills: '#7fbf55',
    field: '#b5d86a',
    rows: '#7a9a3a',
    // Grass: the animals, hay and churns all stand out on it.
    yard: '#7cb24a',
    fence: '#f1e7d0',
    barn: C.red.hex,
  },
  harvest: {
    sky: '#ffd8a8',
    hillsFar: '#c9b458',
    hills: '#a8a24a',
    field: '#c4cf7a',
    rows: '#8f9a45',
    yard: '#7f9a45',
    fence: '#f1e7d0',
    barn: C.red.hex,
  },
};

export const farm: Recipe = {
  id: 'farm',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'On the farm',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: HILLS, rows: 1 },
    // The barn and hills: backdrop only.
    { id: 'hills', label: 'By the barn', surface: 'ground', top: HILLS, bottom: FIELD, rows: 0 },
    // The tractor works one way across the field; a scarecrow or two stand among the crops.
    { id: 'field', label: 'In the field', surface: 'ground', top: FIELD, bottom: FENCE, rows: 1, maxGroups: 2, oneWay: true },
    { id: 'yard', label: 'In the farmyard', surface: 'ground', top: YARD, bottom: 1, rows: 2 },
  ],
  items,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the hills.
    { top: 0, bottom: HILLS, from: ['#ffffff', 0], to: ['#ffffff', 0.2] },
    // Distant hills, paler with distance.
    { top: HILLS, bottom: FIELD, from: ['#ffffff', 0.12], to: ['#ffffff', 0] },
    // The farmyard, darker in front.
    { top: YARD, bottom: 1, from: ['#000000', 0], to: ['#000000', 0.1] },
  ],
  surfaceAt: (_x, y) => (y < HILLS ? 'sky' : y < FIELD ? 'hills' : y < YARD ? 'field' : 'yard'),
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
