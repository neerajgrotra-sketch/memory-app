import { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { ClockFace, randomTime, timeLookalikes } from '../clock';
import { HAIR, SKINS, person, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { DetailFact, DetailKnobs, ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * A classroom seen from the back: the wall with the whiteboard, the front of the class (the teacher and
 * their desk), then the pupils at their desks nearest to us. Band edges as fractions of the picture height.
 *
 * Scale: a closer view than the outdoor places, about 4.5 m across at the front of the class (1 m ≈ 0.22
 * of the width), so a school clock, a globe and the teacher are big enough to see without being blown up:
 * the teacher 1.6 m tall behind a 1.05 m desk, the whiteboard 1.8 m, a globe 0.55 m. The back of the class
 * is the row nearest us, so it's drawn about 1.25 times bigger (1 m ≈ 0.28), as nearer things look: a
 * pupil's desk (0.68 m) is 0.2 of the width. The pupils face the board, so we see the backs of their heads.
 * Nothing smaller than about half a metre (school bags, pencil pots) is in the picture.
 */
const CEILING = 0.05;
const FLOOR = 0.42;
const FRONT_TOP = 0.45;
const FRONT_BOTTOM = 0.63;
const BACK_TOP = 0.67;

/**
 * Everything on the wall hangs on one line above head height (centres this far above the floor, as a
 * fraction of the width, about 1.8 m), because the teacher and the bookcase stand against the wall
 * below it, just as posters in a real classroom go above the furniture.
 */
const HEAD_HEIGHT = 0.4;

/** The whiteboard, in the middle of the wall; nothing may hang over it. */
const BOARD = { x0: 0.3, y0: 0.12, x1: 0.7, y1: 0.28 };

const ON_WALL = ['wall'];
const AT_FRONT = ['front'];
const AT_BACK = ['back'];

/** School jumpers. */
const JUMPERS = [C.red, C.blue, C.green, C.purple, C.grey, C.yellow];

const items: ItemDef[] = [
  // ---- On the wall ----
  {
    kind: 'wall-clock',
    singular: 'clock',
    plural: 'clocks',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'medium',
    // A big school clock, about 60 cm across: readable on a phone.
    size: 0.14,
    zones: ON_WALL,
    maxCount: 1,
    hangAt: HEAD_HEIGHT,
    tone: '#343a40',
    countable: false,
    noFlip: true,
    // The time is chosen per picture (see `details`); 10:10 when drawn on its own.
    draw: (_colour, details) => <ClockFace time={details?.values?.clock ?? '10:10'} />,
  },
  {
    kind: 'poster',
    singular: 'poster',
    plural: 'posters',
    article: 'a',
    w: 90,
    h: 120,
    tier: 'medium',
    size: 0.13,
    zones: ON_WALL,
    // One per stretch of wall beside the board.
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    colours: [C.red, C.blue, C.yellow, C.green, C.orange, C.purple],
    // A space poster: a planet with a ring and stars on a coloured background.
    draw: (colour) => (
      <G>
        <Rect x={0} y={0} width={90} height={120} rx={3} fill={colour} />
        <G stroke="none">
          <Circle cx={45} cy={62} r={22} fill="#ffffff" opacity={0.9} />
          <Ellipse cx={45} cy={62} rx={36} ry={8} fill="none" stroke="#ffffff" strokeWidth={4} />
          <Circle cx={18} cy={20} r={4} fill="#ffffff" />
          <Circle cx={72} cy={28} r={3} fill="#ffffff" />
          <Circle cx={66} cy={100} r={4} fill="#ffffff" />
          <Circle cx={20} cy={98} r={3} fill="#ffffff" />
          {/* Bands on the planet, a little rocket, a title strip, corner pins and a curl at the bottom corner. */}
          <Path d="M27,56 Q45,52 63,56 M25,66 Q45,70 65,66" fill="none" stroke={colour} strokeOpacity={0.5} strokeWidth={3} />
          <Path d="M70,48 l8,-10 l2,6 Z" fill="#ffffff" />
          <Rect x={14} y={6} width={62} height={8} rx={4} fill="#ffffff" fillOpacity={0.7} />
          <Circle cx={6} cy={6} r={3} fill="#e63946" />
          <Circle cx={84} cy={6} r={3} fill="#e63946" />
          <Path d="M90,108 L78,120 H90 Z" fill="#000000" fillOpacity={0.2} />
        </G>
      </G>
    ),
  },
  {
    kind: 'map',
    singular: 'world map',
    plural: 'world maps',
    article: 'a',
    w: 160,
    h: 100,
    tier: 'large',
    // About 1 m wide: fits beside the whiteboard.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    // Mirrored, the continents would be the wrong way round.
    noFlip: true,
    tone: '#4dabf7',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={160} height={100} rx={3} fill="#4dabf7" />
        <G fill="#69b34c" stroke="none">
          {/* The Americas, Europe and Africa, Asia, Australia: simplified. */}
          <Path d="M22,18 Q40,10 52,20 Q50,34 40,40 Q46,52 44,62 Q50,74 42,88 Q34,80 34,66 Q26,54 30,44 Q18,32 22,18 Z" />
          <Path d="M72,18 Q84,12 94,18 Q90,28 84,30 Q92,40 90,56 Q86,72 80,76 Q72,62 74,50 Q66,40 72,30 Z" />
          <Path d="M96,16 Q120,8 142,20 Q140,34 126,40 Q116,48 104,40 Q96,30 96,16 Z" />
          <Path d="M122,64 Q136,60 142,68 Q138,80 126,78 Q118,72 122,64 Z" />
        </G>
        <G stroke="none">
          {/* Lines of latitude and longitude, ice at the poles, a wooden rail top and bottom. */}
          <Path d="M0,34 H160 M0,66 H160 M40,0 V100 M80,0 V100 M120,0 V100" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.5} />
          <Rect x={0} y={0} width={160} height={6} fill="#f8f9fa" fillOpacity={0.8} />
          <Rect x={0} y={92} width={160} height={8} fill="#f8f9fa" fillOpacity={0.8} />
          <Rect x={-4} y={-4} width={168} height={5} rx={2} fill="#8a5a2b" />
          <Rect x={-4} y={99} width={168} height={5} rx={2} fill="#8a5a2b" />
        </G>
      </G>
    ),
  },
  {
    kind: 'noticeboard',
    singular: 'noticeboard',
    plural: 'noticeboards',
    article: 'a',
    w: 140,
    h: 100,
    tier: 'large',
    // About 1 m wide, cork in a wooden frame, with children's work pinned up.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    tone: '#c69c6d',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={140} height={100} rx={3} fill="#c69c6d" />
        <G stroke="none">
          <Rect x={14} y={14} width={34} height={42} fill="#ffffff" />
          <Rect x={58} y={22} width={30} height={30} fill="#ffd60a" />
          <Rect x={96} y={12} width={30} height={40} fill="#a5d8ff" />
          <Rect x={30} y={62} width={40} height={28} fill="#ffc9de" />
          <Rect x={84} y={60} width={36} height={30} fill="#b2f2bb" />
          {[
            [31, 16],
            [73, 24],
            [111, 14],
            [50, 64],
            [102, 62],
          ].map(([x, y]) => (
            <Circle key={`${x}`} cx={x} cy={y} r={3} fill="#e63946" />
          ))}
          {/* Children's work: writing, a sun, a house, a rainbow; the cork's texture and a frame. */}
          <Path d="M18,26 h26 M18,32 h22 M18,38 h26 M18,44 h18" stroke="#adb5bd" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={73} cy={37} r={7} fill="#f77f00" />
          <Path d="M100,40 L111,30 L122,40 V50 H100 Z" fill="#e63946" />
          <Path d="M36,86 Q50,68 64,86" fill="none" stroke="#e63946" strokeWidth={3} />
          <Path d="M40,86 Q50,74 60,86" fill="none" stroke="#1d70d6" strokeWidth={3} />
          <Path d="M90,84 l8,-14 l8,14 Z M102,84 l6,-10 l6,10 Z" fill="#2b9348" />
          <Rect x={0} y={0} width={140} height={100} rx={3} fill="none" stroke="#8a5a2b" strokeWidth={6} />
          <Circle cx={8} cy={60} r={1.5} fill="#8a5a2b" />
          <Circle cx={128} cy={92} r={1.5} fill="#8a5a2b" />
          <Circle cx={76} cy={8} r={1.5} fill="#8a5a2b" />
        </G>
      </G>
    ),
  },
  {
    kind: 'window',
    singular: 'window',
    plural: 'windows',
    article: 'a',
    w: 140,
    h: 120,
    tier: 'large',
    // About 1 m wide, with curtains either side.
    size: 0.22,
    zones: ON_WALL,
    maxCount: 1,
    countable: false,
    hangAt: HEAD_HEIGHT,
    colours: [C.red, C.blue, C.green, C.yellow, C.purple, C.orange],
    colourPrompt: () => 'What colour were the curtains?',
    draw: (colour) => (
      <G>
        <Rect x={14} y={6} width={112} height={108} fill="#a5d8ff" stroke="#ffffff" strokeWidth={8} />
        <Path d="M70,6 V114 M14,60 H126" stroke="#ffffff" strokeWidth={6} />
        <Rect x={0} y={0} width={140} height={8} rx={3} fill="#868e96" />
        <Path d="M0,6 H34 Q30,60 38,114 H0 Z" fill={colour} />
        <Path d="M140,6 H106 Q110,60 102,114 H140 Z" fill={colour} />
        <G stroke="none">
          {/* A tree and clouds outside, glare on the glass, folds in the curtains and a sill. */}
          <Circle cx={56} cy={84} r={14} fill="#69b34c" />
          <Rect x={54} y={94} width={4} height={18} fill="#8a5a2b" />
          <Ellipse cx={92} cy={28} rx={14} ry={6} fill="#ffffff" fillOpacity={0.9} />
          <Path d="M40,12 L52,12 L40,30 Z" fill="#ffffff" fillOpacity={0.5} />
          <Path d="M12,10 Q10,60 16,112 M24,10 Q22,60 28,112 M128,10 Q130,60 124,112 M116,10 Q118,60 112,112" fill="none" stroke="#000000" strokeOpacity={0.15} strokeWidth={3} />
          <Rect x={10} y={112} width={120} height={7} rx={2} fill="#f8f9fa" />
        </G>
      </G>
    ),
  },

  // ---- At the front of the class ----
  {
    kind: 'teacher',
    singular: 'teacher',
    plural: 'teachers',
    article: 'the',
    w: 180,
    h: 230,
    // The teacher (1.6 m) standing behind their desk (about 1.05 m wide, 0.75 m high): one thing, so the
    // desk is never empty and the teacher always has somewhere to stand.
    size: 0.23,
    tier: 'large',
    tall: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    // Picked first for the front: a classroom nearly always has its teacher.
    usual: true,
    colours: [C.red, C.blue, C.green, C.purple, C.orange, C.pink],
    colourPrompt: () => 'What colour was the teacher’s jumper?',
    draw: (colour, details, copy) => (
      <G>
        {/* The shared person, scaled to 1.6 m, standing behind the desk. */}
        <G transform="translate(31 0) scale(1.84)">{person.draw(colour, details, copy)}</G>
        <Rect x={0} y={122} width={180} height={14} rx={3} fill="#7a4e2a" />
        <Rect x={8} y={136} width={56} height={94} fill="#7a4e2a" />
        <Rect x={150} y={136} width={12} height={94} fill="#7a4e2a" />
        <G stroke="none">
          <Rect x={16} y={150} width={40} height={30} rx={2} fill="#5c3a1e" />
          <Rect x={16} y={188} width={40} height={30} rx={2} fill="#5c3a1e" />
          <Circle cx={36} cy={165} r={3} fill="#e9c46a" />
          <Circle cx={36} cy={203} r={3} fill="#e9c46a" />
          {/* A pile of books, a mug of tea and an apple on the desk, and grain along the top. */}
          <Rect x={116} y={102} width={44} height={8} fill="#e63946" />
          <Rect x={120} y={110} width={38} height={7} fill="#1d70d6" />
          <Rect x={114} y={117} width={46} height={5} fill="#ffd60a" />
          <Rect x={12} y={104} width={16} height={18} rx={3} fill="#f8f9fa" />
          <Path d="M28,108 Q35,108 34,114 Q33,118 28,118" fill="none" stroke="#f8f9fa" strokeWidth={3} />
          <Path d="M17,102 q-3,-4 0,-8 M23,102 q-3,-4 0,-8" fill="none" stroke="#adb5bd" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={96} cy={114} r={8} fill="#e63946" />
          <Path d="M96,106 V102" stroke="#5c3a1e" strokeWidth={2} strokeLinecap="round" />
          <Path d="M4,126 H176" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={2.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'globe',
    singular: 'globe',
    plural: 'globes',
    article: 'a',
    w: 80,
    h: 120,
    tier: 'small',
    // About 55 cm wide on its stand.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#1d70d6',
    draw: () => (
      <G>
        <Path d="M40,82 V112 M20,116 H60" stroke="#495057" strokeWidth={6} strokeLinecap="round" />
        <Path d="M8,44 A34,34 0 0 0 64,74" fill="none" stroke="#495057" strokeWidth={5} />
        <Circle cx={40} cy={44} r={32} fill="#1d70d6" />
        <G fill="#69b34c" stroke="none">
          <Path d="M24,24 Q36,18 42,28 Q36,38 28,40 Q20,34 24,24 Z" />
          <Path d="M46,46 Q58,42 62,52 Q56,66 48,64 Q42,56 46,46 Z" />
        </G>
        <G stroke="none">
          {/* The equator, a shine and the pivot where the globe meets its arm. */}
          <Path d="M9,46 Q40,56 71,46" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
          <Ellipse cx={28} cy={28} rx={8} ry={5} fill="#ffffff" fillOpacity={0.35} transform="rotate(-30 28 28)" />
          <Circle cx={63} cy={73} r={3.5} fill="#495057" />
          <Circle cx={12} cy={21} r={3.5} fill="#495057" />
        </G>
      </G>
    ),
  },
  {
    kind: 'bookcase',
    singular: 'bookcase',
    plural: 'bookcases',
    article: 'a',
    w: 100,
    h: 170,
    tier: 'large',
    // About 0.9 m wide and 1.5 m tall, against the wall.
    size: 0.2,
    tall: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#6b4423',
    draw: () => (
      <G>
        <Rect x={0} y={0} width={100} height={170} rx={3} fill="#6b4423" />
        <G stroke="none">
          {[10, 62, 114].map((y, row) => (
            <G key={y}>
              <Rect x={8} y={y} width={84} height={46} fill="#4a2e16" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Rect
                  key={i}
                  x={12 + i * 13}
                  y={y + (i % 3) * 3 + 6}
                  width={11}
                  height={40 - (i % 3) * 3}
                  fill={[C.red.hex, C.blue.hex, C.yellow.hex, C.green.hex, C.orange.hex, C.purple.hex][(i + row * 2) % 6]}
                />
              ))}
              {/* A band near the top of each spine. */}
              <Path d={`M12,${y + 14} h76`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="11 2" />
            </G>
          ))}
          <Path d="M4,4 V166" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'easel',
    singular: 'easel',
    plural: 'easels',
    article: 'an',
    w: 90,
    h: 150,
    tier: 'medium',
    // About 0.7 m wide, with a painting of a big flower: the art corner at the back.
    size: 0.17,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.yellow, C.purple, C.orange],
    colourPrompt: () => 'What colour was the flower in the painting?',
    draw: (colour) => (
      <G>
        <Path d="M45,4 L12,148 M45,4 L78,148 M45,30 L45,140" stroke="#a0703c" strokeWidth={6} strokeLinecap="round" />
        <Rect x={8} y={20} width={74} height={66} rx={2} fill="#ffffff" stroke="#a0703c" strokeWidth={3} />
        <Rect x={4} y={86} width={82} height={6} fill="#a0703c" />
        <G stroke="none">
          <Path d="M45,58 V82" stroke="#2b9348" strokeWidth={4} />
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={45 + 12 * Math.cos((a * Math.PI) / 180)} cy={48 + 12 * Math.sin((a * Math.PI) / 180)} r={9} fill={colour} />
          ))}
          <Circle cx={45} cy={48} r={6} fill="#ffd60a" />
          {/* Leaves on the stem, grass along the bottom of the painting and paint pots on the ledge. */}
          <Ellipse cx={52} cy={70} rx={7} ry={3.5} fill="#2b9348" transform="rotate(-30 52 70)" />
          <Path d="M10,82 h70" stroke="#69b34c" strokeWidth={4} />
          <Rect x={14} y={80} width={8} height={6} rx={1} fill="#e63946" />
          <Rect x={26} y={80} width={8} height={6} rx={1} fill="#1d70d6" />
          <Rect x={66} y={80} width={8} height={6} rx={1} fill="#ffd60a" />
        </G>
      </G>
    ),
  },
  // Nearer us, so drawn bigger than a plant at the front would be.
  { ...plantPot, size: 0.15, zones: AT_BACK, maxCount: 2 },
  {
    kind: 'piano',
    singular: 'piano',
    plural: 'pianos',
    article: 'a',
    w: 170,
    h: 130,
    tier: 'large',
    // An upright piano, about 1.3 m wide.
    size: 0.28,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    colours: [C.black, C.brown],
    // Sometimes a pupil sits playing it, seen from behind (see `fitDetails`): "Was anyone playing the piano?".
    draw: (colour, details) => (
      <G>
        <Rect x={0} y={0} width={170} height={70} rx={4} fill={colour} />
        <Rect x={0} y={66} width={170} height={20} fill="#f8f9fa" />
        <G stroke="none" fill="#212529">
          {[14, 28, 52, 66, 80, 104, 118, 142, 156].map((x) => (
            <Rect key={x} x={x} y={66} width={8} height={12} />
          ))}
        </G>
        <Rect x={0} y={86} width={170} height={16} fill={colour} />
        <Rect x={8} y={102} width={12} height={28} fill={colour} />
        <Rect x={150} y={102} width={12} height={28} fill={colour} />
        <G stroke="none">
          {/* Lines between the white keys, a music stand with a sheet of music, panels and a shine on the wood. */}
          <Path d="M10,72 V86 M24,72 V86 M38,72 V86 M48,72 V86 M62,72 V86 M76,72 V86 M90,72 V86 M100,72 V86 M114,72 V86 M128,72 V86 M138,72 V86 M152,72 V86" stroke="#adb5bd" strokeWidth={1.2} />
          <Rect x={60} y={22} width={50} height={34} rx={2} fill="#f8f9fa" />
          <Path d="M66,30 h38 M66,36 h38 M66,42 h38 M66,48 h38" stroke="#868e96" strokeWidth={1} />
          <Circle cx={76} cy={36} r={2.5} fill="#212529" />
          <Circle cx={90} cy={42} r={2.5} fill="#212529" />
          <Rect x={10} y={10} width={40} height={50} rx={3} fill="#ffffff" fillOpacity={0.08} />
          <Rect x={120} y={10} width={40} height={50} rx={3} fill="#ffffff" fillOpacity={0.08} />
          <Path d="M6,6 H164" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={3} strokeLinecap="round" />
        </G>
        {details?.values?.pianist && (
          // A pupil on a stool at the keys, from behind: dark hair, the jumper, arms out to the keys.
          <G>
            <Rect x={70} y={116} width={30} height={14} rx={3} fill="#6b4423" />
            <Path d="M66,80 L54,74 M104,80 L116,74" stroke={details.values.pianist} strokeWidth={9} strokeLinecap="round" />
            <Rect x={63} y={70} width={44} height={48} rx={14} fill={details.values.pianist} />
            <Circle cx={85} cy={58} r={15} fill="#e0ac69" />
            <Path d="M70,58 Q70,40 85,40 Q100,40 100,58 Q100,66 85,66 Q70,66 70,58 Z" fill="#3d2b1f" />
          </G>
        )}
      </G>
    ),
  },

  // ---- At the back of the class ----
  {
    kind: 'pupil',
    singular: 'pupil',
    plural: 'pupils',
    article: 'a',
    w: 100,
    h: 104,
    tier: 'large',
    // A child at a single junior-school desk (0.68 m wide), in the row nearest us: drawn about 1.25 times the
    // scale of the front of the class, as nearer things look bigger.
    size: 0.2,
    zones: AT_BACK,
    // A row of desks across the room, one to each third.
    spread: true,
    maxCount: 3,
    // Picked first for the back of the class: a classroom nearly always has pupils.
    usual: true,
    colours: JUMPERS,
    colourPrompt: (plural) => (plural ? 'What colour were the pupils’ jumpers?' : 'What colour was the pupil’s jumper?'),
    // Seen from behind, facing the board like a real class: the back of the head, the jumper and the
    // chair. Skin and hair vary per pupil (fixed for each copy); only the jumper is asked about.
    draw: (colour, _details, copy = 0) => {
      const skin = SKINS[copy % SKINS.length];
      const hair = HAIR[Math.floor(copy / 4) % HAIR.length];
      return (
        <G>
          {/* The desk beyond the child: its far legs stand a little higher up the floor. */}
          <Path d="M8,64 V90 M92,64 V90" stroke="#6c757d" strokeWidth={6} />
          <Rect x={0} y={56} width={100} height={10} rx={3} fill="#c8935a" stroke="#8a5a2b" strokeWidth={2} />
          <G stroke="none">
            <Rect x={4} y={50} width={16} height={6} rx={1} fill="#1d70d6" />
            <Path d="M82,54 L96,50" stroke="#ffd60a" strokeWidth={3} strokeLinecap="round" />
            <Circle cx={30} cy={24} r={5} fill={skin} />
            <Circle cx={70} cy={24} r={5} fill={skin} />
            <Rect x={44} y={30} width={12} height={14} fill={skin} />
          </G>
          {/* The back of the jumper, then the back of the head. */}
          <Rect x={22} y={40} width={56} height={52} rx={18} fill={colour} />
          <Circle cx={50} cy={22} r={20} fill={hair} />
          <G stroke="none">
            {copy % 2 === 1 && <Ellipse cx={50} cy={44} rx={6} ry={9} fill={hair} />}
            <Path d="M40,8 Q50,4 60,8" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={3} strokeLinecap="round" />
            <Path d="M30,52 Q36,44 46,44" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
            <Path d="M50,46 V72" stroke="#000000" strokeOpacity={0.1} strokeWidth={2} />
          </G>
          {/* The back of the chair, nearest us. */}
          <Path d="M32,88 V104 M68,88 V104" stroke="#6c757d" strokeWidth={5} />
          <Rect x={26} y={72} width={48} height={18} rx={5} fill="#a0703c" />
          <Path d="M30,76 H70" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    },
  },
  {
    kind: 'beanbag',
    singular: 'beanbag',
    plural: 'beanbags',
    article: 'a',
    w: 120,
    h: 80,
    tier: 'large',
    // In the reading corner, about 0.8 m wide.
    size: 0.21,
    zones: AT_BACK,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow, C.purple, C.orange],
    draw: (colour) => (
      <G>
        <Path d="M10,76 Q0,40 30,24 Q60,4 92,22 Q122,40 110,76 Z" fill={colour} />
        <Path d="M30,46 Q60,34 90,46" fill="none" stroke="#00000026" strokeWidth={4} />
        <G stroke="none">
          {/* Seams, a shine where it bulges and a dent where someone sat. */}
          <Path d="M60,10 Q56,40 60,76 M30,26 Q24,50 26,76 M92,24 Q98,50 96,76" fill="none" stroke="#000000" strokeOpacity={0.12} strokeWidth={2.5} />
          <Ellipse cx={42} cy={32} rx={12} ry={6} fill="#ffffff" fillOpacity={0.3} transform="rotate(-20 42 32)" />
          <Ellipse cx={64} cy={52} rx={22} ry={8} fill="#000000" fillOpacity={0.1} />
        </G>
      </G>
    ),
  },
  {
    kind: 'fish-tank',
    singular: 'fish tank',
    plural: 'fish tanks',
    article: 'a',
    w: 130,
    h: 140,
    tier: 'large',
    // About 0.9 m wide, on its cupboard.
    size: 0.24,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#6b4423',
    // 1 to 4 fish, chosen per picture: "How many fish were in the fish tank?".
    draw: (_colour, details) => (
      <G>
        <Rect x={10} y={80} width={110} height={60} rx={3} fill="#6b4423" />
        <Rect x={0} y={4} width={130} height={76} rx={4} fill="#a5d8ff" stroke="#495057" strokeWidth={4} />
        <G stroke="none">
          <Rect x={4} y={66} width={122} height={12} fill="#e9c46a" />
          <Path d="M26,66 Q22,46 30,30 M36,66 Q42,50 36,36" fill="none" stroke="#2b9348" strokeWidth={4} />
          {/* The fish, each well apart so they can be counted, facing this way and that. */}
          {TANK_FISH.slice(0, Math.max(1, Math.min(4, Number(details?.values?.tankFish ?? 2)))).map(([x, y, fill, dir]) => (
            <G key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${dir} 1)`}>
              <Path d="M-12,0 Q0,-10 12,0 Q0,10 -12,0 Z M-12,0 L-20,-7 V7 Z" fill={fill} stroke="#7a3e00" strokeWidth={1.2} />
              <Circle cx={6} cy={-1} r={1.8} fill="#212529" />
            </G>
          ))}
          {/* Bubbles rising, pebbles, a lid with a light, glare and cupboard doors. */}
          <Circle cx={120} cy={40} r={3} fill="#ffffff" fillOpacity={0.8} />
          <Circle cx={123} cy={28} r={2.5} fill="#ffffff" fillOpacity={0.8} />
          <Circle cx={120} cy={18} r={2} fill="#ffffff" fillOpacity={0.8} />
          {[14, 30, 50, 70, 90, 110].map((x) => (
            <Ellipse key={x} cx={x} cy={72} rx={5} ry={3} fill="#c9a227" />
          ))}
          <Rect x={0} y={0} width={130} height={8} rx={3} fill="#343a40" />
          <Path d="M8,12 L20,12 L8,30 Z" fill="#ffffff" fillOpacity={0.5} />
          <Path d="M65,84 V136" stroke="#3d2412" strokeWidth={2} />
          <Circle cx={58} cy={110} r={2.5} fill="#e9c46a" />
          <Circle cx={72} cy={110} r={2.5} fill="#e9c46a" />
        </G>
      </G>
    ),
  },
  {
    kind: 'computer',
    singular: 'computer',
    plural: 'computers',
    article: 'a',
    w: 130,
    h: 120,
    tier: 'large',
    // On a small table about 0.9 m wide; one fits in this view.
    size: 0.23,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#495057',
    draw: () => (
      <G>
        <Rect x={30} y={4} width={70} height={50} rx={4} fill="#495057" />
        <Rect x={36} y={10} width={58} height={38} rx={2} fill="#74c0fc" stroke="none" />
        <Rect x={58} y={54} width={14} height={10} fill="#495057" />
        <Rect x={34} y={64} width={62} height={6} rx={2} fill="#343a40" />
        <Rect x={0} y={70} width={130} height={10} rx={3} fill="#c8935a" stroke="#8a5a2b" strokeWidth={2} />
        <Path d="M10,80 V120 M120,80 V120" stroke="#6c757d" strokeWidth={6} />
        <G stroke="none">
          {/* A drawing program on the screen, glare, keys on the keyboard and a mouse. */}
          <Rect x={36} y={10} width={58} height={7} fill="#1d70d6" />
          <Circle cx={52} cy={32} r={7} fill="#ffd60a" />
          <Path d="M62,46 L72,30 L84,46 Z" fill="#2b9348" />
          <Path d="M40,20 L50,20 L40,34 Z" fill="#ffffff" fillOpacity={0.4} />
          <Path d="M38,66 h54" stroke="#868e96" strokeWidth={2} strokeDasharray="3 2" />
          <Ellipse cx={108} cy={67} rx={6} ry={4} fill="#343a40" />
          <Path d="M4,73 H126" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} />
        </G>
      </G>
    ),
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type Op = '+' | '−' | '×' | '÷';
const OPS: Op[] = ['+', '−', '×', '÷'];

/** A sum the teacher might write: small numbers, never a negative or a remainder. */
function randomSum(random: Rng): { a: number; op: Op; b: number } {
  const op = random.pick(OPS);
  if (op === '+') return { a: random.int(2, 9), op, b: random.int(1, 9) };
  if (op === '−') {
    const a = random.int(4, 12);
    return { a, op, b: random.int(1, a - 1) };
  }
  if (op === '×') return { a: random.int(2, 9), op, b: random.int(2, 9) };
  // Division: written as the answer times the divisor, divided by the divisor (24 ÷ 6).
  const b = random.int(2, 9);
  return { a: b * random.int(2, 9), op, b };
}

/** Sums easy to mix up with a op b: the same numbers with another sign, or one number changed by one. */
function sumLookalikes(a: number, op: Op, b: number): string[] {
  const same = `${a} ${op} ${b}`;
  // Another sign only where it still makes a sum the board could show: no negatives, no remainders, no times or divide by one.
  const otherSigns = OPS.filter((o) => o !== op && !(o === '−' && b >= a) && !(o === '÷' && a % b !== 0) && !((o === '×' || o === '÷') && (a < 2 || b < 2))).map((o) => `${a} ${o} ${b}`);
  // For division, only sums that still divide exactly (the next multiple up or down, or a divisor one along).
  const pairs =
    op === '÷'
      ? [[a + b, b], [a - b, b], [a, b + 1], [a, b - 1]].filter(([x, y]) => y >= 2 && x > y && x % y === 0)
      : [[a + 1, b], [a, b + 1], [a - 1, b], [a, b - 1]].filter(([x, y]) => x >= (op === '×' ? 2 : 1) && y >= (op === '×' ? 2 : 1) && !(op === '−' && y >= x));
  const near = pairs.map(([x, y]) => `${x} ${op} ${y}`);
  return [...new Set([...otherSigns, ...near])].filter((t) => t !== same);
}

/** The time on the clock, and the day and sum the teacher wrote on the board, chosen per picture. */
/** Where the fish in the tank swim, in order for 1 to 4: [x, y, colour, 1 facing right or -1 facing left]. */
const TANK_FISH: [number, number, string, number][] = [
  [72, 30, '#f77f00', 1],
  [100, 54, '#ffd60a', -1],
  [52, 52, '#ff6b9a', 1],
  [104, 24, '#4dabf7', -1],
];

/**
 * Once things are placed: about half the time a pupil sits playing the piano, in a jumper of their own colour, with
 * "Was anyone playing the piano?" or "What colour was the piano player's jumper?" (one, so neither gives the other
 * away). The player is a pupil too, so pupils aren't counted or asked the colour of then (`uncounted`).
 */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  if (!groups.some((g) => g.kind === 'piano')) return d;
  const playing = random.next() < 0.5;
  const jumper = random.pick(JUMPERS);
  const fact: DetailFact =
    playing && random.next() < 0.5
      ? { id: 'pianist', family: 'story', type: 'colour', prompt: 'What colour was the piano player’s jumper?', answer: jumper.name, wrong: JUMPERS.filter((c) => c !== jumper).map((c) => c.name) }
      : { id: 'pianist', family: 'story', type: 'object', prompt: 'Was anyone playing the piano?', answer: playing ? 'Yes' : 'No', wrong: [playing ? 'No' : 'Yes'] };
  return {
    ...d,
    values: { ...d.values, ...(playing ? { pianist: jumper.hex } : {}) },
    facts: [...(d.facts ?? []), fact],
    uncounted: playing ? [...(d.uncounted ?? []), 'pupil'] : d.uncounted,
  };
}

function details(random: Rng, { clockStep }: DetailKnobs): SceneDetails {
  const time = randomTime(random, clockStep);
  const tankFish = random.int(1, 4);
  const { close, other } = timeLookalikes(time, clockStep);
  const day = random.pick(DAYS);
  const { a, op, b } = randomSum(random);
  const sum = `${a} ${op} ${b}`;
  return {
    values: { clock: time, day, sum, tankFish: String(tankFish) },
    facts: [
      { id: 'tank-fish', family: 'story', type: 'count', prompt: 'How many fish were in the fish tank?', answer: String(tankFish), wrong: ['1', '2', '3', '4', '5'].filter((n) => n !== String(tankFish)), needs: 'fish-tank' },
      { id: 'clock-time', type: 'number', prompt: 'What time was on the clock?', answer: time, wrong: close, fallback: other, needs: 'wall-clock', everyLevel: true, spotlight: true },
      { id: 'board-day', type: 'object', prompt: 'What day was written on the board?', answer: day, wrong: DAYS.filter((d) => d !== day) },
      { id: 'board-sum', type: 'number', prompt: 'What sum was on the board?', answer: sum, wrong: sumLookalikes(a, op, b) },
    ],
  };
}

type Palette = Record<'ceiling' | 'wall' | 'skirting' | 'floor' | 'floorLine', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const ceiling = height * CEILING;
  const floor = height * FLOOR;
  const b = { x: BOARD.x0 * 900, y: BOARD.y0 * height, w: (BOARD.x1 - BOARD.x0) * 900, h: (BOARD.y1 - BOARD.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={ceiling + 600} fill={p.ceiling} />
      {/* Strip lights along the ceiling. */}
      <G fill="#ffffff" stroke="#ced4da" strokeWidth={2}>
        {[120, 420, 720].map((x) => (
          <Rect key={x} x={x} y={ceiling * 0.3} width={60} height={ceiling * 0.4} rx={3} />
        ))}
      </G>
      <Rect x={-600} y={ceiling} width={2100} height={floor - ceiling} fill={p.wall} />
      {/* A soft shadow under the ceiling. */}
      <Rect x={-600} y={ceiling} width={2100} height={6} fill="#000000" fillOpacity={0.05} />
      <Rect x={-600} y={floor} width={2100} height={height - floor + 600} fill={p.floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: floor, x1: 940, y1: height }, 160, '#000000', 0.06, 3)}
      <Rect x={-600} y={floor - 10} width={2100} height={12} fill={p.skirting} />
      <Rect x={-600} y={floor - 10} width={2100} height={2} fill="#ffffff" fillOpacity={0.3} />
      {/* A soft shadow along the foot of the wall. */}
      <Rect x={-600} y={floor + 2} width={2100} height={8} fill="#000000" fillOpacity={0.06} />
      {/* The whiteboard: the day at the top, today's sum below, and a pen tray. */}
      <G>
        <Rect x={b.x - 8} y={b.y - 8} width={b.w + 16} height={b.h + 16} rx={6} fill="#adb5bd" />
        <Rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="#ffffff" />
        <Rect x={b.x + b.w * 0.1} y={b.y + b.h + 8} width={b.w * 0.8} height={8} rx={3} fill="#868e96" />
        {/* Pens and a board eraser in the tray. */}
        <Rect x={b.x + b.w * 0.16} y={b.y + b.h + 4} width={26} height={6} rx={3} fill="#e63946" />
        <Rect x={b.x + b.w * 0.16 + 32} y={b.y + b.h + 4} width={26} height={6} rx={3} fill="#1d70d6" />
        <Rect x={b.x + b.w * 0.74} y={b.y + b.h + 1} width={36} height={10} rx={3} fill="#495057" />
        <SvgText x={b.x + b.w / 2} y={b.y + b.h * 0.26} fontSize={Math.min(36, b.h * 0.24)} fontWeight="bold" fontFamily="Arial" fill="#1d70d6" textAnchor="middle" alignmentBaseline="central">
          {d?.values?.day ?? 'Monday'}
        </SvgText>
        <SvgText x={b.x + b.w / 2} y={b.y + b.h * 0.66} fontSize={Math.min(64, b.h * 0.4)} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle" alignmentBaseline="central">
          {`${d?.values?.sum ?? '3 + 4'} = ?`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Floorboard (or carpet tile) lines across the floor.
  return [0.5, 0.58, 0.7, 0.82, 0.94].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.floorLine, 2, 0.3));
}

const PALETTES: Record<string, Palette> = {
  wood: { ceiling: '#fbf7ee', wall: '#f3e9d2', skirting: '#a07a4c', floor: '#d9b787', floorLine: '#c29e6c' },
  carpet: { ceiling: '#f6f9f7', wall: '#d8ecdf', skirting: '#7c8a96', floor: '#9fb0c2', floorLine: '#8c9db0' },
};

function surfaceAt(_x: number, y: number): string {
  if (y < CEILING) return 'ceiling';
  if (y < FLOOR) return 'wall';
  return 'floor';
}

export const classroom: Recipe = {
  id: 'classroom',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'In the classroom',
  zones: [
    { id: 'ceiling', label: 'On the ceiling', surface: 'air', top: 0, bottom: CEILING, rows: 0 },
    // Things hang on one line either side of the board, above head height.
    { id: 'wall', label: 'On the wall', surface: 'wall', top: CEILING, bottom: FLOOR, rows: 1, minGroups: 2 },
    { id: 'front', label: 'At the front of the class', surface: 'ground', top: FRONT_TOP, bottom: FRONT_BOTTOM, rows: 1, minGroups: 2, maxGroups: 3, anchors: 1 },
    { id: 'back', label: 'At the back of the class', surface: 'ground', top: BACK_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [BOARD],
  details,
  fitDetails,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Light from the ceiling on the wall.
    { top: CEILING, bottom: FLOOR, from: ['#ffffff', 0.1], to: ['#000000', 0.04] },
    // Shade where the floor meets the wall.
    { top: FLOOR, bottom: 1, from: ['#000000', 0.1], to: ['#000000', 0] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
