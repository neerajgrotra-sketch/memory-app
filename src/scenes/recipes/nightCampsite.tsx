import { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { dog, person, plane } from '../items/common';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles, strokes } from '../texture';

/**
 * A campsite at night: the starry sky with the moon, a dark line of trees, the pitches with tents and a
 * campervan, then the campfire in front. Band edges as fractions of the picture height.
 *
 * Scale: a wide scene sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a two-person
 * tent about 2.2 m wide, a campervan 5 m, a canoe 4 m, a picnic table 1.8 m, a sleeping bag 2 m, a
 * campfire about 1 m across. Nothing under about 0.9 m (camping chairs, cool boxes) is in the picture.
 *
 * Night is a contrast challenge: dark things vanish on the dark sky and grass, so the sky has pale things
 * only (the moon, a barn owl, a shooting star, a plane: no bats), and the colour rules drop any colour that
 * wouldn't show. The campfire lights the ground around it.
 */
const SKY = 0.25;
const TREES = 0.36;
const PITCH_TOP = 0.38;
const PITCH_BOTTOM = 0.6;
const FIRE_TOP = 0.68;

/** The pitch number post, between the tents and the campfire; nothing may stand in front of it. */
const SIGN = { x0: 0.4, y0: 0.6, x1: 0.6, y1: 0.665 };

const IN_SKY = ['sky'];
const AT_PITCHES = ['pitches'];
const BY_FIRE = ['fire'];

/** Bright camping colours: anything dark disappears at night. */
const BRIGHT = [C.red, C.orange, C.yellow, C.green, C.blue, C.pink];

type Moon = 'Full moon' | 'Half moon' | 'Crescent moon';
const MOONS: Moon[] = ['Full moon', 'Half moon', 'Crescent moon'];

const items: ItemDef[] = [
  // ---- In the sky ----
  {
    kind: 'moon',
    singular: 'moon',
    plural: 'moons',
    article: 'the',
    w: 140,
    h: 140,
    tier: 'medium',
    size: 0.16,
    zones: IN_SKY,
    still: true,
    maxCount: 1,
    countable: false,
    tone: '#f1f3c8',
    // The moon's shape is chosen per picture (see `details`). Mirrored, a crescent is still a crescent.
    draw: (_colour, details) => {
      const shape = (details?.values?.moon as Moon | undefined) ?? 'Full moon';
      // Soft grey craters, kept inside the lit part.
      const crater = (x: number, y: number, r: number) => <Circle key={`${x}`} cx={x} cy={y} r={r} fill="#c9c79a" fillOpacity={0.6} stroke="none" />;
      if (shape === 'Full moon')
        return (
          <G>
            <Circle cx={70} cy={70} r={60} fill="#f1f3c8" />
            {[crater(48, 50, 10), crater(88, 82, 13), crater(56, 98, 6), crater(92, 42, 5)]}
          </G>
        );
      if (shape === 'Half moon')
        return (
          <G>
            <Path d="M70,10 A60,60 0 0 1 70,130 Z" fill="#f1f3c8" />
            {[crater(96, 50, 9), crater(104, 90, 8), crater(84, 104, 5)]}
          </G>
        );
      return <Path d="M70,10 A60,60 0 1 1 70,130 A42,60 0 1 0 70,10 Z" fill="#f1f3c8" />;
    },
  },
  {
    kind: 'owl',
    singular: 'owl',
    plural: 'owls',
    article: 'an',
    w: 150,
    h: 80,
    tier: 'medium',
    // A barn owl, wings spread (about 1 m across): pale enough to see at night.
    size: 0.13,
    zones: IN_SKY,
    maxCount: 2,
    tone: '#e9d8b4',
    draw: () => (
      <G>
        <Path d="M75,40 Q40,4 2,22 Q30,30 46,52 Z M75,40 Q110,4 148,22 Q120,30 104,52 Z" fill="#d9bf8c" />
        <Ellipse cx={75} cy={48} rx={22} ry={28} fill="#e9d8b4" />
        <Path d="M57,34 Q75,16 93,34 Q93,54 75,56 Q57,54 57,34 Z" fill="#fbf6ea" stroke="none" />
        <G stroke="none" fill="#212529">
          <Circle cx={68} cy={38} r={3.5} />
          <Circle cx={82} cy={38} r={3.5} />
        </G>
        <G stroke="none">
          {/* Feathers along the wings, a beak and speckles down the chest. */}
          <Path d="M20,22 L36,36 M34,18 L48,34 M48,16 L58,32 M130,22 L114,36 M116,18 L102,34 M102,16 L92,32" stroke="#a88b58" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M73,44 L75,50 L77,44 Z" fill="#c9a227" />
          <Circle cx={70} cy={62} r={1.5} fill="#a88b58" />
          <Circle cx={80} cy={64} r={1.5} fill="#a88b58" />
          <Circle cx={75} cy={70} r={1.5} fill="#a88b58" />
        </G>
      </G>
    ),
  },
  {
    kind: 'shooting-star',
    singular: 'shooting star',
    plural: 'shooting stars',
    article: 'a',
    w: 170,
    h: 70,
    tier: 'medium',
    size: 0.16,
    zones: IN_SKY,
    maxCount: 1,
    countable: false,
    tone: '#fff3bf',
    draw: () => (
      <G>
        <Path d="M4,64 L140,18 L144,26 Z" fill="#fff3bf" stroke="none" opacity={0.7} />
        <Polygon points="150,4 156,18 170,20 159,29 162,44 150,36 138,44 141,29 130,20 144,18" fill="#fff3bf" />
        <G stroke="none" fill="#ffffff">
          {/* A bright heart to the star and sparkles left along its trail. */}
          <Circle cx={150} cy={25} r={5} />
          <Circle cx={110} cy={36} r={2} />
          <Circle cx={80} cy={42} r={1.5} />
          <Circle cx={50} cy={52} r={1.5} />
          <Circle cx={96} cy={30} r={1.2} />
        </G>
      </G>
    ),
  },
  { ...plane, zones: IN_SKY, maxCount: 1, countable: false },

  // ---- At the pitches ----
  {
    kind: 'tent',
    singular: 'tent',
    plural: 'tents',
    article: 'a',
    w: 160,
    h: 100,
    tier: 'large',
    // A two-person tent, about 2.2 m wide.
    size: 0.25,
    zones: AT_PITCHES,
    maxCount: 3,
    spread: true,
    // A campsite nearly always has tents.
    usual: true,
    colours: BRIGHT,
    draw: (colour) => (
      <G>
        <Path d="M4,100 L80,6 L156,100 Z" fill={colour} />
        <Path d="M80,6 L80,100" stroke="#00000040" strokeWidth={3} />
        {/* The door, open, with the warm light of a torch inside. */}
        <Path d="M60,100 L80,52 L100,100 Z" fill="#ffd66b" stroke="none" />
        <Path d="M80,6 L80,0" stroke="#495057" strokeWidth={4} />
        <G stroke="none">
          {/* Shade on the far side, guy ropes and pegs, the door flaps tied back and torchlight spilling out. */}
          <Path d="M80,6 L156,100 H100 L80,52 Z" fill="#000000" fillOpacity={0.15} />
          <Path d="M30,68 L0,100 M130,68 L160,100" stroke="#ced4da" strokeOpacity={0.7} strokeWidth={1.5} />
          <Rect x={-2} y={96} width={4} height={6} fill="#adb5bd" />
          <Rect x={158} y={96} width={4} height={6} fill="#adb5bd" />
          <Path d="M60,100 L80,52 L66,100 Z M100,100 L80,52 L94,100 Z" fill={colour} />
          <Ellipse cx={80} cy={101} rx={26} ry={4} fill="#ffd66b" fillOpacity={0.45} />
          <Path d="M14,92 L80,10" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={3} />
        </G>
      </G>
    ),
  },
  {
    kind: 'campervan',
    singular: 'campervan',
    plural: 'campervans',
    article: 'a',
    w: 260,
    h: 120,
    tier: 'xl',
    // About 5 m long.
    size: 0.56,
    wide: true,
    zones: AT_PITCHES,
    maxCount: 1,
    countable: false,
    colours: [C.white, C.yellow, C.orange, C.red, C.green],
    draw: (colour) => (
      <G>
        <Path d="M10,96 V30 Q10,10 30,10 H200 Q216,10 226,26 L250,60 Q256,68 256,80 V96 Z" fill={colour} />
        <G stroke="none">
          <Rect x={10} y={66} width={246} height={14} fill="#ffffff" opacity={0.55} />
          <Rect x={30} y={24} width={44} height={28} rx={4} fill="#ffd66b" />
          <Rect x={86} y={24} width={44} height={28} rx={4} fill="#ffd66b" />
          <Path d="M208,24 H222 L240,52 H208 Z" fill="#a5d8ff" />
          <Rect x={150} y={24} width={36} height={60} rx={3} fill="#00000026" />
          {/* Curtains drawn back in the lit windows, a door handle, a roof rack, a headlight and a shine. */}
          <Path d="M30,24 h10 v28 h-10 Z M64,24 h10 v28 h-10 Z M86,24 h10 v28 h-10 Z M120,24 h10 v28 h-10 Z" fill="#e63946" fillOpacity={0.6} />
          <Rect x={176} y={52} width={6} height={3} rx={1} fill="#495057" />
          <Path d="M40,10 V4 H170 V10 M80,4 V10 M130,4 V10" fill="none" stroke="#495057" strokeWidth={3} />
          <Ellipse cx={250} cy={74} rx={5} ry={4} fill="#fff3b0" />
          <Path d="M210,28 L218,28 L212,46 Z" fill="#ffffff" fillOpacity={0.6} />
        </G>
        <Circle cx={56} cy={98} r={18} fill="#343a40" />
        <Circle cx={210} cy={98} r={18} fill="#343a40" />
        <G stroke="none" fill="#adb5bd">
          <Circle cx={56} cy={98} r={7} />
          <Circle cx={210} cy={98} r={7} />
        </G>
      </G>
    ),
  },
  {
    kind: 'canoe',
    singular: 'canoe',
    plural: 'canoes',
    article: 'a',
    w: 260,
    h: 60,
    tier: 'xl',
    // About 4 m long, pulled up on the grass.
    size: 0.46,
    wide: true,
    zones: AT_PITCHES,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.yellow, C.orange, C.green, C.blue],
    draw: (colour) => (
      <G>
        <Path d="M4,20 Q130,30 256,20 Q240,56 130,56 Q20,56 4,20 Z" fill={colour} />
        <Path d="M10,22 Q130,34 250,22" fill="none" stroke="#00000040" strokeWidth={4} />
        <G stroke="none" fill="#a0703c">
          <Rect x={86} y={22} width={10} height={14} />
          <Rect x={164} y={22} width={10} height={14} />
        </G>
        <G stroke="none">
          {/* A paddle lying across it, a light rim and a shine along the hull. */}
          <Path d="M60,14 L200,30" stroke="#a0703c" strokeWidth={4} strokeLinecap="round" />
          <Ellipse cx={206} cy={31} rx={12} ry={5} fill="#a0703c" transform="rotate(7 206 31)" />
          <Path d="M30,44 Q130,52 230,44" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'lantern',
    singular: 'lantern post',
    plural: 'lantern posts',
    article: 'a',
    w: 60,
    h: 120,
    tier: 'small',
    // A post about 1.8 m tall with a lantern lighting the path.
    size: 0.1,
    tall: true,
    spread: true,
    zones: AT_PITCHES,
    maxCount: 2,
    tone: '#ffd66b',
    draw: () => (
      <G>
        <Rect x={20} y={20} width={8} height={100} fill="#6b4423" />
        <Path d="M24,20 H46 V26" fill="none" stroke="#6b4423" strokeWidth={5} />
        <Circle cx={46} cy={42} r={14} fill="#ffd66b" stroke="none" opacity={0.35} />
        <Rect x={38} y={28} width={16} height={26} rx={3} fill="#ffd66b" stroke="#495057" strokeWidth={3} />
        <G stroke="none">
          {/* A flame inside, bars on the glass, a cap on top and a bright patch of light on the post. */}
          <Path d="M46,34 Q50,42 46,48 Q42,42 46,34 Z" fill="#f77f00" />
          <Path d="M42,30 V52 M50,30 V52" stroke="#495057" strokeOpacity={0.5} strokeWidth={1.5} />
          <Path d="M36,28 L46,22 L56,28 Z" fill="#495057" />
          <Rect x={20} y={40} width={8} height={24} fill="#ffd66b" fillOpacity={0.35} />
        </G>
      </G>
    ),
  },
  {
    kind: 'picnic-table',
    singular: 'picnic table',
    plural: 'picnic tables',
    article: 'a',
    w: 180,
    h: 90,
    tier: 'large',
    // About 1.8 m long, benches either side.
    size: 0.21,
    zones: AT_PITCHES,
    maxCount: 1,
    countable: false,
    tone: '#b07d48',
    draw: () => (
      <G>
        <Rect x={10} y={20} width={160} height={14} rx={3} fill="#b07d48" />
        <Rect x={0} y={54} width={180} height={10} rx={3} fill="#b07d48" />
        <Path d="M40,34 L24,90 M140,34 L156,90 M40,34 L56,90 M140,34 L124,90" stroke="#8a5a2b" strokeWidth={8} />
        <G stroke="none">
          {/* Gaps between the planks, firelight along the edges, and a mug and a torch on the table. */}
          <Path d="M50,22 V32 M90,22 V32 M130,22 V32 M45,55 V63 M90,55 V63 M135,55 V63" stroke="#6b4423" strokeWidth={2} />
          <Path d="M12,21 H168 M2,55 H178" stroke="#ffd66b" strokeOpacity={0.5} strokeWidth={2} />
          <Rect x={60} y={8} width={12} height={12} rx={2} fill="#e63946" />
          <Path d="M72,11 Q78,11 77,15 Q76,18 72,18" fill="none" stroke="#e63946" strokeWidth={2.5} />
          <Rect x={110} y={12} width={22} height={8} rx={3} fill="#343a40" />
          <Path d="M132,12 L150,6 V26 L132,20 Z" fill="#ffd66b" fillOpacity={0.4} />
        </G>
      </G>
    ),
  },

  // ---- Around the campfire ----
  {
    kind: 'campfire',
    singular: 'campfire',
    plural: 'campfires',
    article: 'a',
    w: 120,
    h: 120,
    tier: 'small',
    // About 1 m across, in a ring of stones.
    size: 0.13,
    zones: BY_FIRE,
    maxCount: 1,
    countable: false,
    // The heart of a campsite at night: nearly always there.
    usual: true,
    tone: '#f77f00',
    draw: () => (
      <G>
        <Ellipse cx={60} cy={104} rx={56} ry={14} fill="#868e96" />
        <Path d="M20,108 L100,92 M20,92 L100,108" stroke="#6b4423" strokeWidth={10} strokeLinecap="round" />
        <Path d="M60,4 Q92,44 84,74 Q80,98 60,100 Q40,98 36,74 Q28,44 60,4 Z" fill="#f77f00" />
        <Path d="M60,40 Q76,62 72,80 Q68,96 60,96 Q52,96 48,80 Q44,62 60,40 Z" fill="#ffd60a" stroke="none" />
        <G stroke="none">
          {/* Stones round the ring, side flames, a white-hot heart, sparks rising and glowing embers. */}
          {[10, 26, 44, 62, 80, 98, 110].map((x, i) => (
            <Ellipse key={x} cx={x} cy={104 + (i % 2 ? 6 : 4)} rx={8} ry={5} fill="#adb5bd" />
          ))}
          <Path d="M36,74 Q24,56 32,40 Q40,58 44,70 Z M84,74 Q96,56 88,40 Q80,58 76,70 Z" fill="#e85d04" />
          <Ellipse cx={60} cy={84} rx={6} ry={9} fill="#fff8e1" />
          <Circle cx={40} cy={22} r={2.5} fill="#ffd60a" />
          <Circle cx={82} cy={14} r={2} fill="#ffd60a" />
          <Circle cx={72} cy={0} r={1.8} fill="#ffd60a" />
          <Circle cx={46} cy={100} r={3} fill="#ff6b00" />
          <Circle cx={74} cy={100} r={3} fill="#ff6b00" />
        </G>
      </G>
    ),
  },
  { ...person, zones: BY_FIRE, maxCount: 3, colours: BRIGHT, colourPrompt: (plural) => (plural ? 'What colour were the people’s jumpers?' : 'What colour was the person’s jumper?') },
  { ...dog, zones: BY_FIRE, maxCount: 1, colours: [C.brown, C.white] },
  {
    kind: 'fox',
    singular: 'fox',
    plural: 'foxes',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'small',
    // About 1 m nose to tail, sneaking up for leftovers.
    size: 0.12,
    zones: BY_FIRE,
    maxCount: 1,
    countable: false,
    tone: '#f77f00',
    draw: () => (
      <G>
        <Path d="M4,30 Q0,10 20,8 Q30,20 28,40 Z" fill="#f77f00" />
        <Path d="M4,30 Q4,14 14,12" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
        <Ellipse cx={52} cy={40} rx={30} ry={16} fill="#f77f00" />
        <Path d="M34,50 V68 M44,52 V68 M62,52 V68 M72,50 V68" stroke="#212529" strokeWidth={5} />
        <Path d="M76,32 L92,14 L96,26 L106,30 L94,44 Z" fill="#f77f00" />
        <G stroke="none">
          <Path d="M90,16 L86,4 L96,12 Z" fill="#f77f00" />
          <Circle cx={94} cy={28} r={2.5} fill="#212529" />
          <Circle cx={105} cy={31} r={2.5} fill="#212529" />
          {/* A white chest and cheek, dark ear tips and a shine along the back. */}
          <Path d="M80,38 Q86,48 94,44 Q90,40 92,34 Z" fill="#ffffff" />
          <Path d="M88,8 L86,4 L92,8 Z" fill="#212529" />
          <Path d="M30,30 Q52,22 74,30" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'log-seat',
    singular: 'log seat',
    plural: 'log seats',
    article: 'a',
    w: 180,
    h: 50,
    tier: 'large',
    // A fallen log about 1.8 m long to sit on.
    size: 0.21,
    zones: BY_FIRE,
    maxCount: 2,
    // Lit by the fire: lighter than wood looks by day, so it shows on the dark grass.
    tone: '#d4a46c',
    draw: () => (
      <G>
        <Rect x={10} y={6} width={160} height={40} rx={20} fill="#d4a46c" />
        <Ellipse cx={170} cy={26} rx={10} ry={20} fill="#f0cf9c" />
        <Path d="M40,18 H90 M70,32 H140" stroke="#9c6a3a" strokeWidth={3} strokeLinecap="round" />
        <G stroke="none">
          {/* Growth rings on the cut end, a knot, moss and firelight along the top. */}
          <Ellipse cx={170} cy={26} rx={6} ry={13} fill="none" stroke="#c4955e" strokeWidth={2} />
          <Ellipse cx={170} cy={26} rx={2.5} ry={5} fill="#c4955e" />
          <Ellipse cx={110} cy={20} rx={5} ry={3} fill="#9c6a3a" />
          <Ellipse cx={30} cy={40} rx={10} ry={4} fill="#5a8f3e" />
          <Path d="M24,10 H160" stroke="#ffd66b" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'sleeping-bag',
    singular: 'sleeping bag',
    plural: 'sleeping bags',
    article: 'a',
    w: 200,
    h: 50,
    tier: 'large',
    // Laid out, about 2 m long.
    size: 0.23,
    zones: BY_FIRE,
    maxCount: 2,
    colours: BRIGHT,
    draw: (colour) => (
      <G>
        <Path d="M4,26 Q4,8 30,8 H186 Q196,8 196,26 Q196,44 186,44 H30 Q4,44 4,26 Z" fill={colour} />
        <Path d="M50,10 V42 M90,10 V42 M130,10 V42 M170,10 V42" stroke="#00000030" strokeWidth={3} />
        <Ellipse cx={26} cy={26} rx={14} ry={12} fill="#ffffff" opacity={0.6} stroke="none" />
        <G stroke="none">
          {/* A zip along the side with its pull, a drawstring round the hood and a puffy shine. */}
          <Path d="M40,40 H190" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="3 2" />
          <Rect x={186} y={37} width={6} height={8} rx={2} fill="#adb5bd" />
          <Ellipse cx={26} cy={26} rx={18} ry={16} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
          <Path d="M54,16 H184" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'firewood',
    singular: 'pile of firewood',
    plural: 'piles of firewood',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'small',
    // About 1 m wide.
    size: 0.12,
    zones: BY_FIRE,
    maxCount: 1,
    countable: false,
    // Lit by the fire, like the log seat.
    tone: '#d4a46c',
    draw: () => (
      <G>
        {[
          [10, 46],
          [42, 46],
          [74, 46],
          [26, 24],
          [58, 24],
          [42, 2],
        ].map(([x, y]) => (
          <G key={`${x}-${y}`}>
            <Rect x={x} y={y} width={30} height={22} rx={11} fill="#d4a46c" />
            <Circle cx={x + 15} cy={y + 11} r={6} fill="#f0cf9c" stroke="none" />
            <Circle cx={x + 15} cy={y + 11} r={2} fill="#c4955e" stroke="none" />
          </G>
        ))}
      </G>
    ),
  },
];

/** Pitch numbers easy to mix up with `n`: one or two along, the digits swapped, or ten more. */
function pitchLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 60);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The moon's shape and the pitch number, chosen per picture. */
function details(random: Rng): SceneDetails {
  const moon = random.pick(MOONS);
  const pitch = random.int(1, 49);
  return {
    values: { moon, pitch: String(pitch) },
    facts: [
      { id: 'moon-shape', type: 'object', prompt: 'What shape was the moon?', answer: moon, wrong: MOONS.filter((m) => m !== moon), needs: 'moon' },
      { id: 'pitch', type: 'number', prompt: 'What number was on the pitch sign?', answer: String(pitch), wrong: pitchLookalikes(pitch) },
    ],
  };
}

type Palette = Record<'sky' | 'stars' | 'trees' | 'grass' | 'track', string>;

/** Stars at fixed places (fractions of the width and of the sky's height), so every picture has a few. */
const STARS: [number, number, number][] = [
  [0.06, 0.2, 2.5], [0.17, 0.62, 2], [0.28, 0.12, 3], [0.37, 0.48, 2], [0.46, 0.82, 2.5], [0.55, 0.18, 2],
  [0.63, 0.58, 3], [0.72, 0.3, 2], [0.81, 0.72, 2.5], [0.9, 0.14, 2], [0.96, 0.52, 3], [0.12, 0.9, 2], [0.5, 0.4, 2],
];

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const trees = height * TREES;
  const s = { x: SIGN.x0 * 900, y: SIGN.y0 * height, w: (SIGN.x1 - SIGN.x0) * 900, h: (SIGN.y1 - SIGN.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={trees + 600} fill={p.sky} />
      {/* A faint band of the Milky Way and many tiny stars. */}
      <Path d={`M-100,${sky * 0.9} Q450,${sky * 0.1} 1000,${sky * 0.5}`} fill="none" stroke={p.stars} strokeOpacity={0.035} strokeWidth={sky * 0.3} strokeLinecap="round" />
      {speckles({ x0: -40, y0: 4, x1: 940, y1: trees - 60 }, 90, p.stars, 0.45, 1.6, 91)}
      <G fill={p.stars}>
        {STARS.map(([x, y, r]) => (
          <Circle key={`${x}-${y}`} cx={x * 900} cy={y * sky * 0.92} r={r} />
        ))}
      </G>
      {/* A twinkle on the brightest stars. */}
      <G stroke={p.stars} strokeWidth={1.5} strokeOpacity={0.7}>
        {STARS.filter(([, , r]) => r >= 3).map(([x, y]) => (
          <Path key={`${x}-${y}`} d={`M${x * 900 - 8},${y * sky * 0.92}h16M${x * 900},${y * sky * 0.92 - 8}v16`} />
        ))}
      </G>
      {/* A dark line of pine trees behind the campsite. */}
      <G fill={p.trees}>
        <Rect x={-600} y={trees - 22} width={2100} height={30} />
        {Array.from({ length: 22 }, (_, i) => {
          const x = -80 + i * 50;
          const h = 70 + ((i * 37) % 50);
          return <Polygon key={i} points={`${x},${trees - 20 - h} ${x + 30},${trees - 10} ${x - 30},${trees - 10}`} />;
        })}
      </G>
      <Rect x={-600} y={trees} width={2100} height={height - trees + 600} fill={p.grass} />
      {/* The texture of the ground. */}
      {strokes({ x0: -40, y0: trees + 20, x1: 940, y1: height }, 220, '#000000', 0.18, 10, 3)}
      {/* Moonlight catching the tops of the grass. */}
      {strokes({ x0: -40, y0: trees + 20, x1: 940, y1: height }, 80, '#ffffff', 0.06, 8, 3, 2, 97)}
      {/* The pitch number post. */}
      <G>
        <Rect x={s.x + s.w / 2 - 6} y={s.y + s.h * 0.6} width={12} height={s.h * 0.7} fill="#6b4423" />
        <Rect x={s.x} y={s.y} width={s.w} height={s.h * 0.8} rx={6} fill="#f1e3c6" stroke="#6b4423" strokeWidth={4} />
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.4} fontSize={Math.min(30, s.h * 0.5)} fontWeight="bold" fontFamily="Arial" fill="#2f3e46" textAnchor="middle" alignmentBaseline="central">
          {`Pitch ${d?.values?.pitch ?? '12'}`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Paths worn in the grass between the pitches and round the fire.
  return [0.5, 0.78, 0.9].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.track, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  clear: { sky: '#141d3b', stars: '#fff8d6', trees: '#0e1a16', grass: '#2e4a3c', track: '#4a6655' },
  moonlit: { sky: '#211a42', stars: '#f3ecff', trees: '#130f26', grass: '#33465a', track: '#536a80' },
};

function surfaceAt(_x: number, y: number): string {
  return y < TREES ? 'sky' : 'grass';
}

export const nightCampsite: Recipe = {
  id: 'night-campsite',
  title: 'At the campsite at night',
  zones: [
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: SKY, rows: 1 },
    { id: 'trees', label: 'By the trees', surface: 'ground', top: SKY, bottom: TREES, rows: 0 },
    // Labels never name a thing that stands in the band ("Where was the campfire? Around the campfire").
    { id: 'pitches', label: 'On the pitches', surface: 'ground', top: PITCH_TOP, bottom: PITCH_BOTTOM, rows: 1 },
    { id: 'fire', label: 'At the front', surface: 'ground', top: FIRE_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SIGN],
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // The sky is a little lighter towards the horizon.
    { top: 0, bottom: TREES, from: ['#ffffff', 0], to: ['#8fa8ff', 0.12] },
    // The campfire's warm glow, strongest round the fire in front and fading out across the pitches.
    { top: PITCH_TOP, bottom: 1, from: ['#ffb347', 0], to: ['#ffb347', 0.16] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
