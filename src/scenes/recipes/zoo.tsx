import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { digitalLookalikes, randomTime } from '../clock';
import { C } from '../colours';
import { balloon, bird, cloudShape, person, plane, sun } from '../items/common';
import { lineMarks, scatterMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailKnobs, ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { glints, speckles, strokes } from '../texture';

/**
 * A zoo: the sky, three enclosures side by side (one kind of animal each, like a real zoo), and the
 * visitors' path in front. Band edges as fractions of the picture height.
 *
 * Scale: a wide scene sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a giraffe is
 * about 3.5 m tall (a young one), a zebra 2.2 m; the elephant and rhino are young ones (about 2.3 m), the widest an
 * enclosure fits (each is a third of the width, less the walls and the screen edges: 0.26 at most).
 * Animals under about 1 m (penguins, monkeys, parrots) are left out: at the 44 pt minimum they'd be
 * drawn as big as a person.
 */
const SKY = 0.22;
const ENCLOSURE = 0.24;
const FENCE = 0.585;
const PATH = 0.64;

/** The feeding-time sign, on the fence in the middle; nothing may stand in front of it. */
const SIGN = { x0: 0.3, y0: 0.592, x1: 0.7, y1: 0.66 };

const IN_SKY = ['sky'];
const IN_ENCLOSURE = ['enclosure'];
const ON_PATH = ['path'];

/** Every animal lives in an enclosure, one kind to each of the three (one slot row, `panels`). */
const animal = { zones: IN_ENCLOSURE, countable: true } as const;

const items: ItemDef[] = [
  { ...sun, zones: IN_SKY, maxCount: 1, countable: false },
  { ...bird, zones: IN_SKY, maxCount: 4 },
  { ...balloon, zones: IN_SKY, maxCount: 2 },
  { ...plane, zones: IN_SKY, maxCount: 1, countable: false },

  // ---- In the enclosures ----
  {
    kind: 'giraffe',
    singular: 'giraffe',
    plural: 'giraffes',
    article: 'a',
    w: 150,
    h: 300,
    tier: 'large',
    // A young giraffe, about 3.5 m tall: a grown one would reach off the top of a small phone's screen.
    size: 0.2,
    ...animal,
    maxCount: 1,
    tone: '#e9b44c',
    draw: () => (
      <G>
        <G fill="#e9b44c">
          <Rect x={30} y={190} width={12} height={110} rx={5} />
          <Rect x={52} y={196} width={12} height={104} rx={5} />
          <Rect x={92} y={196} width={12} height={104} rx={5} />
          <Rect x={112} y={190} width={12} height={110} rx={5} />
          <Ellipse cx={78} cy={190} rx={58} ry={34} />
          <Path d="M100,180 L118,40 L136,44 L128,186 Z" />
          <Ellipse cx={132} cy={34} rx={18} ry={13} transform="rotate(20 132 34)" />
        </G>
        <G stroke="none" fill="#a0612b">
          <Circle cx={56} cy={182} r={9} />
          <Circle cx={82} cy={176} r={8} />
          <Circle cx={104} cy={192} r={8} />
          <Circle cx={66} cy={202} r={7} />
          <Circle cx={122} cy={80} r={6} />
          <Circle cx={118} cy={120} r={6} />
          <Circle cx={124} cy={156} r={6} />
          <Rect x={124} y={6} width={4} height={14} />
          <Rect x={136} y={8} width={4} height={14} />
          <Circle cx={139} cy={34} r={2.5} fill="#111" />
          {/* Knobs on the horns, an ear, a dark muzzle, a mane down the neck, hooves, a tail tuft and light along the back. */}
          <Circle cx={126} cy={6} r={3.5} fill="#5c3a1b" />
          <Circle cx={138} cy={8} r={3.5} fill="#5c3a1b" />
          <Ellipse cx={120} cy={26} rx={7} ry={3.5} fill="#e9b44c" transform="rotate(-30 120 26)" />
          <Ellipse cx={146} cy={42} rx={6} ry={4} fill="#c98f3a" />
          <Path d="M114,48 L100,176" stroke="#7a4a1e" strokeWidth={5} strokeLinecap="round" />
          <Rect x={30} y={292} width={12} height={8} rx={2} fill="#3d2412" />
          <Rect x={52} y={292} width={12} height={8} rx={2} fill="#3d2412" />
          <Rect x={92} y={292} width={12} height={8} rx={2} fill="#3d2412" />
          <Rect x={112} y={292} width={12} height={8} rx={2} fill="#3d2412" />
          <Path d="M22,186 Q14,200 16,222" fill="none" stroke="#e9b44c" strokeWidth={4} strokeLinecap="round" />
          <Ellipse cx={16} cy={226} rx={4} ry={7} fill="#3d2412" />
          <Path d="M40,166 Q78,152 118,168" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={44} cy={204} r={6} />
          <Circle cx={92} cy={210} r={6} />
        </G>
      </G>
    ),
  },
  {
    kind: 'elephant',
    singular: 'elephant',
    plural: 'elephants',
    article: 'an',
    w: 220,
    h: 190,
    tier: 'large',
    // A young elephant, about 2.3 m long: the widest that fits an enclosure (0.26 of the width).
    size: 0.26,
    ...animal,
    maxCount: 1,
    tone: '#9aa5ae',
    draw: () => (
      <G>
        <G fill="#9aa5ae">
          <Rect x={30} y={120} width={28} height={70} rx={8} />
          <Rect x={66} y={124} width={28} height={66} rx={8} />
          <Rect x={124} y={124} width={28} height={66} rx={8} />
          <Rect x={156} y={120} width={28} height={70} rx={8} />
          <Ellipse cx={104} cy={100} rx={92} ry={60} />
          <Path d="M184,80 Q218,90 210,140 Q206,170 196,180" fill="none" stroke="#9aa5ae" strokeWidth={20} strokeLinecap="round" />
          <Circle cx={180} cy={70} r={36} />
          <Path d="M150,40 Q120,56 128,100 Q150,116 168,92 Z" fill="#8a949c" />
        </G>
        <Path d="M190,96 Q206,104 214,96" fill="none" stroke="#f8f9fa" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={190} cy={62} r={3} fill="#111" stroke="none" />
        <Path d="M12,96 Q2,110 8,124" fill="none" stroke="#9aa5ae" strokeWidth={5} strokeLinecap="round" />
        <G stroke="none">
          {/* Toenails, wrinkles on the trunk and legs, a pink inner ear, a tail tuft and light along the back. */}
          {[36, 46, 72, 82, 130, 140, 162, 172].map((x) => (
            <Ellipse key={x} cx={x} cy={186} rx={4} ry={3} fill="#e9ecef" />
          ))}
          <Path d="M196,110 h12 M198,124 h11 M197,138 h10 M194,152 h9" stroke="#6c757d" strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M34,150 h20 M70,154 h20 M128,154 h20 M160,150 h20" stroke="#6c757d" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
          <Path d="M148,52 Q130,64 134,94 Q148,102 160,88 Z" fill="#c9a0a6" fillOpacity={0.5} />
          <Ellipse cx={8} cy={128} rx={4} ry={6} fill="#495057" />
          <Path d="M40,52 Q100,36 160,50" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'zebra',
    singular: 'zebra',
    plural: 'zebras',
    article: 'a',
    w: 160,
    h: 120,
    tier: 'large',
    size: 0.25,
    ...animal,
    maxCount: 1,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <G fill="#f8f9fa">
          <Rect x={30} y={70} width={11} height={50} rx={4} />
          <Rect x={48} y={74} width={11} height={46} rx={4} />
          <Rect x={104} y={74} width={11} height={46} rx={4} />
          <Rect x={120} y={70} width={11} height={50} rx={4} />
          <Ellipse cx={80} cy={66} rx={58} ry={26} />
          <Path d="M118,60 L136,16 L156,26 L140,70 Z" />
          <Ellipse cx={148} cy={28} rx={14} ry={10} transform="rotate(30 148 28)" />
        </G>
        <G fill="none" stroke="#212529" strokeWidth={5} strokeLinecap="round">
          <Path d="M50,44 Q46,66 54,86 M68,40 Q64,66 72,90 M86,40 Q82,66 90,90 M104,44 Q100,66 106,84" />
          <Path d="M124,40 L140,44 M128,30 L144,36" />
        </G>
        <Path d="M136,16 L130,8 L150,18" fill="#212529" stroke="none" />
        <Path d="M22,62 Q8,70 10,86" fill="none" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
        <G stroke="none">
          {/* A striped mane, stripes on the legs and rump, a dark muzzle, hooves and a tail tuft. */}
          <Path d="M117,56 l-6,-1 M121,46 l-6,-1 M125,36 l-6,-1 M129,26 l-6,-1 M133,18 l-5,-3" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
          <Path d="M30,84 h11 M30,96 h11 M48,88 h11 M48,100 h11 M104,88 h11 M104,100 h11 M120,84 h11 M120,96 h11" stroke="#212529" strokeWidth={4} />
          <Path d="M28,52 Q34,66 30,80 M38,46 Q42,60 38,74" fill="none" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
          <Ellipse cx={158} cy={34} rx={7} ry={6} fill="#343a40" transform="rotate(30 158 34)" />
          <Circle cx={146} cy={24} r={2.2} fill="#111" />
          <Rect x={30} y={114} width={11} height={6} rx={2} fill="#212529" />
          <Rect x={48} y={114} width={11} height={6} rx={2} fill="#212529" />
          <Rect x={104} y={114} width={11} height={6} rx={2} fill="#212529" />
          <Rect x={120} y={114} width={11} height={6} rx={2} fill="#212529" />
          <Ellipse cx={10} cy={88} rx={4} ry={6} fill="#212529" />
        </G>
      </G>
    ),
  },
  {
    kind: 'lion',
    singular: 'lion',
    plural: 'lions',
    article: 'a',
    w: 160,
    h: 110,
    tier: 'large',
    size: 0.23,
    ...animal,
    maxCount: 1,
    tone: '#d4a24c',
    draw: () => (
      <G>
        <Path d="M20,60 Q4,62 6,84" fill="none" stroke="#d4a24c" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={6} cy={86} r={6} fill="#8a5a2b" stroke="none" />
        <G fill="#d4a24c">
          <Rect x={28} y={70} width={13} height={40} rx={5} />
          <Rect x={46} y={74} width={13} height={36} rx={5} />
          <Rect x={98} y={74} width={13} height={36} rx={5} />
          <Rect x={116} y={70} width={13} height={40} rx={5} />
          <Ellipse cx={76} cy={66} rx={56} ry={24} />
        </G>
        <Circle cx={128} cy={46} r={32} fill="#a0612b" />
        <G stroke="none">
          {/* Shaggy tufts round the mane, ears, a pale muzzle with whiskers, paws and light along the back. */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => (
            <Circle key={a} cx={128 + 30 * Math.cos((a * Math.PI) / 180)} cy={46 + 30 * Math.sin((a * Math.PI) / 180)} r={7} fill="#8a5022" />
          ))}
          <Circle cx={132} cy={48} r={20} fill="#e2b866" />
          <Circle cx={118} cy={32} r={5} fill="#d4a24c" />
          <Circle cx={146} cy={32} r={5} fill="#d4a24c" />
          <Ellipse cx={136} cy={58} rx={9} ry={6} fill="#f1d9a7" />
          <Path d="M128,58 h-10 M128,61 h-9 M144,58 h10 M144,61 h9" stroke="#5c3a1b" strokeOpacity={0.6} strokeWidth={1.2} />
          <G fill="#111">
            <Circle cx={128} cy={44} r={2.5} />
            <Circle cx={140} cy={44} r={2.5} />
            <Ellipse cx={136} cy={54} rx={4} ry={3} />
          </G>
          <Path d="M30,108 h11 M48,108 h11 M100,108 h11 M118,108 h11" stroke="#b07d3a" strokeWidth={3} />
          <Path d="M36,50 Q76,40 108,48" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'rhino',
    singular: 'rhino',
    plural: 'rhinos',
    article: 'a',
    w: 210,
    h: 120,
    tier: 'large',
    // A young rhino, so it fits its enclosure.
    size: 0.26,
    ...animal,
    maxCount: 1,
    tone: '#8d8d8d',
    draw: () => (
      <G>
        <G fill="#8d8d8d">
          <Rect x={34} y={78} width={22} height={42} rx={6} />
          <Rect x={62} y={82} width={22} height={38} rx={6} />
          <Rect x={124} y={82} width={22} height={38} rx={6} />
          <Rect x={150} y={78} width={22} height={42} rx={6} />
          <Ellipse cx={100} cy={70} rx={84} ry={40} />
          <Path d="M160,50 Q206,52 206,84 L170,92 Z" />
          <Path d="M160,40 L166,22 L172,42 Z" />
        </G>
        <Path d="M196,62 L206,30 L208,64 Z M184,56 L188,42 L192,58 Z" fill="#e9ecef" />
        <Circle cx={178} cy={60} r={3} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Folds of thick skin at the shoulder and hip, toes, a mouth line and light along the back. */}
          <Path d="M140,36 Q132,70 140,104 M58,40 Q50,70 56,100" fill="none" stroke="#5c5c5c" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
          <Path d="M34,70 Q90,60 150,74" fill="none" stroke="#5c5c5c" strokeOpacity={0.3} strokeWidth={2.5} strokeLinecap="round" />
          {[38, 46, 66, 74, 128, 136, 154, 162].map((x) => (
            <Ellipse key={x} cx={x + 4} cy={117} rx={3.5} ry={2.5} fill="#5c5c5c" />
          ))}
          <Path d="M188,80 Q196,84 204,80" fill="none" stroke="#3d3d3d" strokeWidth={2} strokeLinecap="round" />
          <Path d="M50,38 Q100,26 150,38" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'ostrich',
    singular: 'ostrich',
    plural: 'ostriches',
    article: 'an',
    w: 80,
    h: 170,
    tier: 'small',
    // About 2.5 m tall and 1 m across.
    size: 0.12,
    ...animal,
    maxCount: 3,
    tone: '#343a40',
    draw: () => (
      <G>
        <G fill="none" stroke="#d6a5a0" strokeWidth={6} strokeLinecap="round">
          <Path d="M34,108 L30,166 M48,108 L54,166" />
          <Path d="M54,70 Q60,30 58,10" strokeWidth={7} />
        </G>
        <Ellipse cx={40} cy={88} rx={34} ry={26} fill="#343a40" />
        <Path d="M8,82 Q-2,70 10,64 Q20,72 18,86 Z" fill="#f8f9fa" />
        <G stroke="none">
          {/* Fluffy feathers, white tips on the wings, knees and two big toes. */}
          <Path d="M20,90 q6,-6 12,0 M36,98 q6,-6 12,0 M44,82 q6,-6 12,0 M26,104 q6,-6 12,0" fill="none" stroke="#6c757d" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M58,98 Q72,100 72,88 Q66,96 58,92 Z" fill="#f8f9fa" />
          <Circle cx={32} cy={138} r={4} fill="#c08d88" />
          <Circle cx={51} cy={138} r={4} fill="#c08d88" />
          <Path d="M30,166 h-8 M30,166 h6 M54,166 h-6 M54,166 h8" stroke="#c08d88" strokeWidth={4} strokeLinecap="round" />
        </G>
        <Ellipse cx={60} cy={10} rx={10} ry={8} fill="#d6a5a0" />
        <Path d="M68,10 L78,13 L68,15 Z" fill="#e9c46a" stroke="none" />
        <Circle cx={61} cy={8} r={2} fill="#111" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'kangaroo',
    singular: 'kangaroo',
    plural: 'kangaroos',
    article: 'a',
    w: 90,
    h: 130,
    tier: 'small',
    size: 0.13,
    ...animal,
    maxCount: 3,
    tone: '#c68642',
    draw: () => (
      <G>
        <Path d="M30,110 Q0,118 2,128" fill="none" stroke="#c68642" strokeWidth={10} strokeLinecap="round" />
        <G fill="#c68642">
          <Ellipse cx={46} cy={86} rx={24} ry={34} />
          <Path d="M36,114 L70,126 L70,130 L30,130 Z" />
          <Ellipse cx={58} cy={36} rx={14} ry={20} transform="rotate(20 58 36)" />
          <Ellipse cx={66} cy={22} rx={16} ry={11} />
          <Path d="M58,14 L54,0 L64,12 Z M66,12 L66,0 L72,14 Z" />
        </G>
        <Path d="M60,62 L72,72" stroke="#a96d33" strokeWidth={5} strokeLinecap="round" />
        <Ellipse cx={50} cy={92} rx={12} ry={14} fill="#e2b07a" stroke="none" />
        <Circle cx={72} cy={20} r={2.5} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Pink inside the ears, a nose, a pouch line, little paws and light along the back. */}
          <Path d="M58,12 L56,4 L62,11 Z M67,11 L67,4 L70,12 Z" fill="#e8a0a0" />
          <Ellipse cx={81} cy={22} rx={3} ry={2.2} fill="#3d2412" />
          <Path d="M40,90 Q50,98 60,90" fill="none" stroke="#a96d33" strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={73} cy={73} r={3} fill="#a96d33" />
          <Path d="M28,70 Q30,96 40,114" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'bear',
    singular: 'bear',
    plural: 'bears',
    article: 'a',
    w: 160,
    h: 110,
    tier: 'large',
    size: 0.23,
    ...animal,
    maxCount: 1,
    tone: '#6b4423',
    draw: () => (
      <G>
        <G fill="#6b4423">
          <Rect x={30} y={70} width={20} height={40} rx={7} />
          <Rect x={54} y={74} width={20} height={36} rx={7} />
          <Rect x={100} y={74} width={20} height={36} rx={7} />
          <Rect x={122} y={70} width={20} height={40} rx={7} />
          <Ellipse cx={84} cy={62} rx={64} ry={34} />
          <Circle cx={138} cy={44} r={22} />
          <Circle cx={128} cy={24} r={8} />
          <Circle cx={150} cy={26} r={8} />
        </G>
        <Ellipse cx={150} cy={52} rx={10} ry={8} fill="#a07850" stroke="none" />
        <Circle cx={152} cy={48} r={3} fill="#111" stroke="none" />
        <Circle cx={140} cy={40} r={2.5} fill="#111" stroke="none" />
        <G stroke="none">
          {/* Inner ears, a shoulder hump, fur, claws and light along the back. */}
          <Circle cx={128} cy={24} r={4} fill="#a07850" />
          <Circle cx={150} cy={26} r={4} fill="#a07850" />
          <Path d="M40,62 q6,-6 12,0 M70,52 q6,-6 12,0 M96,64 q6,-6 12,0 M56,80 q6,-6 12,0" fill="none" stroke="#4a2e17" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M32,108 l2,4 M38,108 l2,4 M44,108 l2,4 M124,108 l2,4 M130,108 l2,4 M136,108 l2,4" stroke="#e9ecef" strokeWidth={2} strokeLinecap="round" />
          <Path d="M40,40 Q90,22 128,36" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />
        </G>
      </G>
    ),
  },

  {
    kind: 'penguin',
    singular: 'penguin',
    plural: 'penguins',
    article: 'a',
    w: 60,
    h: 90,
    tier: 'small',
    // About 1.2 m tall, like an emperor penguin; they live in the snow-and-ice enclosure.
    size: 0.1,
    ...animal,
    maxCount: 4,
    tone: '#212529',
    draw: () => (
      <G>
        <Ellipse cx={30} cy={52} rx={24} ry={34} fill="#212529" />
        <Circle cx={30} cy={18} r={15} fill="#212529" />
        <G stroke="none">
          <Ellipse cx={30} cy={58} rx={16} ry={26} fill="#f8f9fa" />
          <Path d="M20,22 Q30,30 40,22 Q36,34 30,36 Q24,34 20,22 Z" fill="#ffd166" fillOpacity={0.85} />
          <Circle cx={25} cy={15} r={2.5} fill="#ffffff" />
          <Circle cx={35} cy={15} r={2.5} fill="#ffffff" />
          <Circle cx={25} cy={15} r={1.3} fill="#111" />
          <Circle cx={35} cy={15} r={1.3} fill="#111" />
          <Path d="M27,20 L30,26 L33,20 Z" fill="#f77f00" />
          <Path d="M6,46 Q0,62 8,74 L12,58 Z M54,46 Q60,62 52,74 L48,58 Z" fill="#343a40" />
          <Ellipse cx={22} cy={87} rx={7} ry={3} fill="#f77f00" />
          <Ellipse cx={38} cy={87} rx={7} ry={3} fill="#f77f00" />
        </G>
      </G>
    ),
  },

  // ---- On the path ----
  { ...person, singular: 'visitor', plural: 'visitors', zones: ON_PATH, maxCount: 4, colourPrompt: (plural) => (plural ? 'What colour were the visitors’ shirts?' : 'What colour was the visitor’s shirt?') },
  {
    ...person,
    kind: 'zookeeper',
    singular: 'zookeeper',
    plural: 'zookeepers',
    zones: ON_PATH,
    maxCount: 2,
    colours: undefined,
    colourPrompt: undefined,
    tone: '#5f7a2a',
    // In the zoo's green uniform and a wide-brimmed hat.
    draw: (_colour, details, copy) => (
      <G>
        {person.draw('#5f7a2a', details, copy)}
        <Ellipse cx={32} cy={6} rx={22} ry={5} fill="#c8a165" />
        <Path d="M20,6 Q20,-6 32,-6 Q44,-6 44,6 Z" fill="#c8a165" />
      </G>
    ),
  },
  {
    kind: 'bench',
    singular: 'bench',
    plural: 'benches',
    article: 'a',
    w: 140,
    h: 70,
    tier: 'large',
    size: 0.21,
    zones: ON_PATH,
    maxCount: 2,
    spread: true,
    colours: [C.green, C.brown, C.red, C.blue],
    draw: (colour) => (
      <G>
        <Path d="M16,6 V70 M124,6 V70" fill="none" stroke="#343a40" strokeWidth={6} />
        <Rect x={8} y={6} width={124} height={11} rx={3} fill={colour} />
        <Rect x={8} y={22} width={124} height={11} rx={3} fill={colour} />
        <Rect x={2} y={42} width={136} height={12} rx={3} fill={colour} />
        <G stroke="none">
          {/* Light along the top of each slat, bolts, and armrests. */}
          <Path d="M12,8 H128 M12,24 H128 M6,44 H134" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2.5} strokeLinecap="round" />
          {[11, 27, 48].map((y) => (
            <G key={y}>
              <Circle cx={16} cy={y} r={2} fill="#343a40" />
              <Circle cx={124} cy={y} r={2} fill="#343a40" />
            </G>
          ))}
          <Path d="M10,40 Q10,30 22,32 M130,40 Q130,30 118,32" fill="none" stroke="#343a40" strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'pushchair',
    singular: 'pushchair',
    plural: 'pushchairs',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'small',
    size: 0.12,
    zones: ON_PATH,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.purple, C.pink],
    draw: (colour) => (
      <G>
        <Path d="M78,10 L66,62 M20,62 L30,88 M66,62 L70,88" fill="none" stroke="#495057" strokeWidth={5} strokeLinecap="round" />
        <Path d="M18,36 Q20,8 50,10 L50,40 Z" fill={colour} />
        <Rect x={12} y={38} width={60} height={26} rx={10} fill={colour} />
        <Path d="M78,10 H90" stroke="#212529" strokeWidth={6} strokeLinecap="round" />
        <Circle cx={30} cy={90} r={9} fill="#212529" stroke="none" />
        <Circle cx={70} cy={90} r={9} fill="#212529" stroke="none" />
        <G stroke="none">
          {/* Ribs on the hood, a little blanket, hubs on the wheels and a shine. */}
          <Path d="M24,34 Q28,18 44,14 M32,38 Q36,24 48,20" fill="none" stroke="#000000" strokeOpacity={0.2} strokeWidth={2.5} strokeLinecap="round" />
          <Rect x={50} y={34} width={18} height={10} rx={4} fill="#ffffff" fillOpacity={0.7} />
          <Path d="M18,44 H66" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={30} cy={90} r={3.5} fill="#adb5bd" />
          <Circle cx={70} cy={90} r={3.5} fill="#adb5bd" />
        </G>
      </G>
    ),
  },
  {
    kind: 'balloon-seller',
    singular: 'balloon seller',
    plural: 'balloon sellers',
    article: 'a',
    w: 90,
    h: 210,
    tier: 'medium',
    size: 0.16,
    zones: ON_PATH,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.green, C.pink, C.purple],
    colourPrompt: () => 'What colour were the balloon seller’s balloons?',
    // A person holding a bunch of party balloons; the balloons are the colour asked about.
    draw: (colour, details, copy) => (
      <G>
        <Path d="M66,96 L40,46 M66,96 L64,40 M66,96 L86,48" fill="none" stroke="#495057" strokeWidth={2} />
        <G fill={colour}>
          <Ellipse cx={38} cy={30} rx={16} ry={20} />
          <Ellipse cx={64} cy={22} rx={16} ry={20} />
          <Ellipse cx={84} cy={36} rx={14} ry={18} />
        </G>
        <G stroke="none">
          {/* A shine and a knot on each balloon. */}
          <Ellipse cx={32} cy={22} rx={4} ry={6} fill="#ffffff" fillOpacity={0.5} transform="rotate(-20 32 22)" />
          <Ellipse cx={58} cy={14} rx={4} ry={6} fill="#ffffff" fillOpacity={0.5} transform="rotate(-20 58 14)" />
          <Ellipse cx={79} cy={29} rx={3.5} ry={5} fill="#ffffff" fillOpacity={0.5} transform="rotate(-20 79 29)" />
          <Path d="M38,50 l-3,4 h6 Z M64,42 l-3,4 h6 Z M84,54 l-3,4 h6 Z" fill={colour} />
        </G>
        <G transform="translate(6 85)">{person.draw('#f8f9fa', details, copy)}</G>
      </G>
    ),
  },
  {
    kind: 'signpost',
    singular: 'signpost',
    plural: 'signposts',
    article: 'a',
    w: 100,
    h: 170,
    tier: 'medium',
    size: 0.15,
    zones: ON_PATH,
    maxCount: 1,
    countable: false,
    tone: '#8a5a2b',
    draw: () => (
      <G>
        <Rect x={44} y={10} width={12} height={160} fill="#8a5a2b" />
        <Path d="M10,22 H78 L96,36 L78,50 H10 Z" fill={C.green.hex} />
        <Path d="M90,62 H22 L4,76 L22,90 H90 Z" fill={C.orange.hex} />
        <Path d="M14,102 H74 L90,114 L74,126 H14 Z" fill={C.blue.hex} />
        <G stroke="none">
          {/* Animal pictures on the arrows, bolts, a cap on the post and grain in the wood. */}
          <Ellipse cx={30} cy={36} rx={9} ry={6} fill="#ffffff" fillOpacity={0.85} />
          <Path d="M36,32 L42,24 L44,30 Z" fill="#ffffff" fillOpacity={0.85} />
          <Circle cx={70} cy={76} r={7} fill="#ffffff" fillOpacity={0.85} />
          <Circle cx={65} cy={70} r={2.5} fill="#ffffff" fillOpacity={0.85} />
          <Circle cx={75} cy={70} r={2.5} fill="#ffffff" fillOpacity={0.85} />
          <Path d="M24,114 q4,-8 8,0 q4,-8 8,0" fill="none" stroke="#ffffff" strokeOpacity={0.85} strokeWidth={2.5} />
          <Path d="M46,36 h8 M46,76 h8 M46,114 h8" stroke="#3d2412" strokeWidth={3} strokeLinecap="round" />
          <Rect x={42} y={6} width={16} height={6} rx={2} fill="#5c3a1b" />
          <Path d="M49,130 V166" stroke="#5c3a1b" strokeOpacity={0.5} strokeWidth={2} />
        </G>
      </G>
    ),
  },
];

/** The animals that live in the enclosures: the feeding-time sign always names one of them that's in the picture. */
const ANIMALS = ['giraffe', 'elephant', 'zebra', 'lion', 'rhino', 'ostrich', 'kangaroo', 'bear', 'penguin'];
const pluralOf = (kind: string) => items.find((i) => i.kind === kind)!.plural;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Each enclosure has its own habitat, chosen per picture, and every animal lives only in its own (a hard
 * rule, `fits`, not left to contrast): grassland for giraffes, elephants, zebras and lions; a dry, sandy
 * paddock for rhinos, ostriches and kangaroos; rocks for bears; snow and ice with a pool for penguins.
 */
type Habitat = 'grass' | 'sand' | 'rocks' | 'ice';
const HABITATS: Record<Habitat, string> = { grass: '#3f6f4a', sand: '#ead9a8', rocks: '#b9b2a6', ice: '#e8f1f7' };
const HOME: Record<string, Habitat> = {
  giraffe: 'grass',
  elephant: 'grass',
  zebra: 'grass',
  lion: 'grass',
  rhino: 'sand',
  ostrich: 'sand',
  kangaroo: 'sand',
  bear: 'rocks',
  penguin: 'ice',
};

/** Animals only in an enclosure with their own habitat; everything else anywhere its band allows. */
function fits(item: ItemDef, zoneId: string, col: number, d?: SceneDetails): boolean {
  const home = HOME[item.kind];
  return zoneId !== 'enclosure' || !home || d?.values?.[`habitat${col}`] === home;
}

/** The feeding-time sign (a time and which animals) and the enclosures' habitats, chosen per picture. */
function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  // Grassland and a sandy paddock every time (most animals live there), and a third that's often rocks or ice.
  const habitats = random.shuffle<Habitat>(['grass', 'sand', random.pick<Habitat>(['rocks', 'ice', 'rocks', 'ice', 'grass', 'sand'])]);
  // A printed time on a sign: on the clock-face steps (whole hours, half past, quarters).
  const time = randomTime(random, clockStep);
  const { close, other } = digitalLookalikes(time);
  return {
    palette: Object.fromEntries(habitats.map((h, i) => [`enc${i}`, HABITATS[h]])),
    values: { feeding: time, ...Object.fromEntries(habitats.map((h, i) => [`habitat${i}`, h])) },
    // Which animals are fed is chosen once they're placed (see `fitDetails`).
    facts: [{ id: 'feeding-time', type: 'number', prompt: 'What time was feeding time?', answer: time, wrong: close, fallback: other, everyLevel: true }],
  };
}

/**
 * The sign names an animal that's really in one of the enclosures, and points at it (up-left, up or
 * up-right). Wrong answers are other animals that live in this zoo. With no animal in the picture there's
 * nothing to feed, so the sign shows only the time.
 */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  const here = groups.filter((g) => ANIMALS.includes(g.kind));
  if (!here.length) return d;
  const group = random.pick(here);
  const fed = cap(pluralOf(group.kind));
  return {
    ...d,
    values: { ...d.values, fed, fedSide: group.region },
    facts: [
      ...(d.facts ?? []),
      { id: 'fed', type: 'object', prompt: 'Which animals were being fed at feeding time?', answer: fed, wrong: ANIMALS.filter((a) => a !== group.kind).map((a) => cap(pluralOf(a))) },
    ],
  };
}

type Palette = Record<'sky' | 'trees' | 'treesDark' | 'enc0' | 'enc1' | 'enc2' | 'wall' | 'fence' | 'path' | 'edge' | 'tuft', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const fence = height * FENCE;
  const path = height * PATH;
  const s = { x: SIGN.x0 * 900, y: SIGN.y0 * height, w: (SIGN.x1 - SIGN.x0) * 900, h: (SIGN.y1 - SIGN.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={sky + 600} fill={p.sky} />
      {/* Trees behind the enclosures. */}
      <G fill={p.treesDark}>
        {Array.from({ length: 22 }, (_, i) => (
          <Circle key={i} cx={-600 + i * 100} cy={sky + 4 + (i % 3) * 5} r={44 + (i % 2) * 10} />
        ))}
      </G>
      <G fill={p.trees}>
        {Array.from({ length: 22 }, (_, i) => (
          <Circle key={i} cx={-560 + i * 100} cy={sky + 22} r={36} />
        ))}
      </G>
      {/* Sun on the leaves. */}
      <G fill="#ffffff" fillOpacity={0.15}>
        {Array.from({ length: 22 }, (_, i) => (
          <Circle key={i} cx={-572 + i * 100} cy={sky + 8} r={14} />
        ))}
      </G>
      {/* Each enclosure's own ground (beyond the picture's edges, the outer ones carry on). */}
      {[0, 1, 2].map((i) => (
        <Rect key={i} x={i === 0 ? -600 : i * 300} y={sky + 20} width={i === 1 ? 300 : 900} height={fence - sky - 20} fill={d?.palette?.[`enc${i}`] ?? p[`enc${i}` as 'enc0']} />
      ))}
      {/* The texture of each enclosure's ground: grass blades, sand grains, gravel, sparkles on the snow. */}
      {[0, 1, 2].map((i) => {
        const area = { x0: i * 300 + 10, y0: sky + 40, x1: i * 300 + 290, y1: fence - 12 };
        const h = d?.values?.[`habitat${i}`] ?? (i === 1 ? 'sand' : 'grass');
        return (
          <G key={`t${i}`}>
            {h === 'grass' && strokes(area, 90, '#000000', 0.12, 9, 3, 2.5, 41 + i)}
            {h === 'grass' && strokes(area, 50, '#ffffff', 0.1, 8, 3, 2, 51 + i)}
            {h === 'sand' && speckles(area, 120, '#8a6d3b', 0.18, 3.5, 61 + i)}
            {h === 'rocks' && speckles(area, 110, '#4a453e', 0.2, 5, 71 + i)}
            {h === 'ice' && glints(area, 30, '#7cc3e8', 0.35, 12, 2.5, 81 + i)}
          </G>
        );
      })}
      {/* Boulders at the back of a rocky enclosure; a pool and drifts in a snowy one. */}
      {[0, 1, 2].map((i) => {
        const x = i * 300;
        const top = sky + 20;
        const h = fence - sky - 20;
        if (d?.values?.[`habitat${i}`] === 'rocks')
          return (
            <G key={`r${i}`} fill="#9a9184">
              <Path d={`M${x + 20},${top + h * 0.42} Q${x + 40},${top + h * 0.1} ${x + 95},${top + h * 0.16} Q${x + 130},${top + h * 0.3} ${x + 120},${top + h * 0.42} Z`} />
              <Path d={`M${x + 170},${top + h * 0.38} Q${x + 190},${top + h * 0.14} ${x + 240},${top + h * 0.2} Q${x + 275},${top + h * 0.3} ${x + 270},${top + h * 0.38} Z`} fill="#8a8275" />
              {/* Light on the tops of the boulders and a crack. */}
              <Path d={`M${x + 44},${top + h * 0.2} Q${x + 70},${top + h * 0.13} ${x + 95},${top + h * 0.18}`} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
              <Path d={`M${x + 195},${top + h * 0.2} Q${x + 220},${top + h * 0.17} ${x + 240},${top + h * 0.22}`} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
              <Path d={`M${x + 80},${top + h * 0.22} l-8,${h * 0.08} l6,${h * 0.06}`} fill="none" stroke="#5c564c" strokeWidth={3} strokeLinecap="round" />
            </G>
          );
        if (d?.values?.[`habitat${i}`] === 'ice')
          return (
            <G key={`i${i}`}>
              <Ellipse cx={x + 150} cy={top + h * 0.26} rx={110} ry={h * 0.12} fill="#7cc3e8" />
              <Ellipse cx={x + 150} cy={top + h * 0.24} rx={86} ry={h * 0.07} fill="#a9dcf3" />
              {/* Ripples on the pool. */}
              <Path d={`M${x + 100},${top + h * 0.24} h30 M${x + 160},${top + h * 0.27} h36 M${x + 120},${top + h * 0.3} h24`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
              <Path d={`M${x + 10},${top + h * 0.45} Q${x + 80},${top + h * 0.38} ${x + 150},${top + h * 0.45} T${x + 290},${top + h * 0.45}`} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
            </G>
          );
        return null;
      })}
      {/* The walls between the three enclosures, and the front fence. */}
      {[300, 600].map((x) => (
        <G key={x}>
          <Rect x={x - 6} y={sky + 20} width={12} height={fence - sky - 20} fill={p.wall} />
          {/* Stone courses down the wall, light on one side. */}
          <Path d={`M${x - 6},${sky + 20}V${fence}`} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} />
          <Path d={`M${x},${sky + 20}V${fence}`} stroke="#000000" strokeOpacity={0.15} strokeWidth={12} strokeDasharray="2 24" />
        </G>
      ))}
      <Rect x={-600} y={fence} width={2100} height={path - fence} fill={p.edge} />
      <G fill={p.fence}>
        <Rect x={-600} y={fence - 10} width={2100} height={8} />
        <Rect x={-600} y={fence + 8} width={2100} height={8} />
        {Array.from({ length: 30 }, (_, i) => (
          <Rect key={i} x={-600 + i * 75} y={fence - 16} width={9} height={36} rx={2} />
        ))}
      </G>
      {/* Light along the top of the rails and the posts. */}
      <Rect x={-600} y={fence - 10} width={2100} height={2} fill="#ffffff" fillOpacity={0.25} />
      <Rect x={-600} y={fence + 8} width={2100} height={2} fill="#ffffff" fillOpacity={0.25} />
      <Rect x={-600} y={fence + 20} width={2100} height={4} fill="#000000" fillOpacity={0.1} />
      <Rect x={-600} y={path} width={2100} height={height - path + 600} fill={p.path} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: path, x1: 940, y1: height }, 240, '#000000', 0.12, 4)}
      {speckles({ x0: -40, y0: path, x1: 940, y1: height }, 90, '#ffffff', 0.2, 3, 13)}
      {/* The feeding-time sign. */}
      <G>
        <Rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill="#2b9348" stroke="#f8f9fa" strokeWidth={4} />
        <SvgText x={s.x + s.w * (d?.values?.fed ? 0.45 : 0.5)} y={s.y + s.h * 0.3} fontSize={Math.min(22, s.h * 0.28)} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" textAnchor="middle" alignmentBaseline="central">
          FEEDING TIME
        </SvgText>
        <SvgText x={s.x + s.w * (d?.values?.fed ? 0.45 : 0.5)} y={s.y + s.h * 0.7} fontSize={Math.min(30, s.h * 0.38)} fontWeight="bold" fontFamily="Arial" fill="#f8f9fa" textAnchor="middle" alignmentBaseline="central">
          {d?.values?.fed ? `${d.values.fed} ${d.values.feeding}` : (d?.values?.feeding ?? '2:30')}
        </SvgText>
        {/* An arrow towards the enclosure of the animals being fed. */}
        {d?.values?.fed && (
          <G transform={`translate(${s.x + s.w * 0.9} ${s.y + s.h / 2}) rotate(${d.values.fedSide === 'left' ? -45 : d.values.fedSide === 'right' ? 45 : 0})`}>
            <Circle cx={0} cy={0} r={s.h * 0.34} fill="#ffd60a" />
            <Path d={`M0,${-s.h * 0.22} L${s.h * 0.17},${-s.h * 0.02} H${s.h * 0.07} V${s.h * 0.2} H${-s.h * 0.07} V${-s.h * 0.02} H${-s.h * 0.17} Z`} fill="#2b9348" />
          </G>
        )}
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], random: () => number, variant: VariantDef): Mark[] {
  const tuft = (x: number, y: number) => (
    <Path d={`M${x},${y + 14} l6,-14 l4,14 l6,-10 l4,10`} fill="none" stroke={variant.palette.tuft} strokeWidth={3} strokeLinecap="round" />
  );
  return [
    ...scatterMarks({ x0: -100, y0: height * 0.02, x1: 1000, y1: height * SKY - 50 }, 150, 66, 3, boxes, random, 0.95, (x, y) => cloudShape(x, y, 150 / 170), true),
    // Grass tufts only in grassland enclosures.
    ...[0, 1, 2]
      .filter((i) => variant.palette[`enc${i}`] === HABITATS.grass)
      .flatMap((i) => scatterMarks({ x0: i * 300 + 20, y0: height * ENCLOSURE + 40, x1: i * 300 + 280, y1: height * FENCE - 30 }, 24, 16, 3, boxes, random, 0.3, tuft)),
    ...[0.76, 0.88].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.edge, 3, 0.3)),
  ];
}

const PALETTES: Record<string, Palette> = {
  sunny: {
    sky: '#8fd3f4',
    trees: '#5a9e3e',
    treesDark: '#3f7f2e',
    enc0: HABITATS.grass,
    enc1: HABITATS.sand,
    enc2: HABITATS.grass,
    wall: '#b8a07a',
    fence: '#6b4f36',
    path: '#e9dcc0',
    edge: '#c9b48c',
    tuft: '#6f9a3a',
  },
  evening: {
    sky: '#f6c28b',
    trees: '#6a8f3e',
    treesDark: '#4f7230',
    enc0: HABITATS.grass,
    enc1: HABITATS.sand,
    enc2: HABITATS.grass,
    wall: '#a8906a',
    fence: '#5c4430',
    path: '#e3d3b0',
    edge: '#c2ad84',
    tuft: '#7a8f3a',
  },
};

function surfaceAt(x: number, y: number): string {
  if (y < SKY) return 'sky';
  if (y < SKY + 0.02) return 'trees';
  if (y < FENCE) return `enc${x < 1 / 3 ? 0 : x < 2 / 3 ? 1 : 2}`;
  if (y < PATH) return 'edge';
  return 'path';
}

export const zoo: Recipe = {
  id: 'zoo',
  title: 'At the zoo',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: SKY, rows: 1 },
    // Three enclosures, one kind of animal each: one slot row, and nothing crosses an enclosure wall.
    { id: 'enclosure', label: 'In the enclosure', surface: 'ground', top: ENCLOSURE, bottom: FENCE - 0.02, rows: 1, panels: true },
    { id: 'path', label: 'On the path', surface: 'ground', top: PATH + 0.03, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SIGN],
  fits,
  fitDetails,
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze near the trees.
    { top: 0, bottom: SKY, from: ['#ffffff', 0], to: ['#ffffff', 0.12] },
    // Sun on the enclosures, shade by the fence.
    { top: SKY + 0.02, bottom: FENCE, from: ['#ffffff', 0.08], to: ['#000000', 0.06] },
    // The path, a little darker in front.
    { top: PATH, bottom: 1, from: ['#000000', 0], to: ['#000000', 0.1] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
