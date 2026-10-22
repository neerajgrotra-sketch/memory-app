import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, PlacedGroup, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * Space, seen from the surface of the Moon: the black sky with the Earth, grey hills, then the dusty ground
 * where astronauts work. Band edges as fractions of the picture height.
 *
 * Scale: the ground is sized against the people (1 m ≈ 0.115 of the width, like the outdoor places): an
 * astronaut in a spacesuit 1.85 m tall, a lunar rover 3 m, a lander 3.5 m wide, a habitat pod 4 m, solar
 * panels 2 m, a boulder 1 m. Everything in the sky is a long way off and drawn small, as it really looks.
 *
 * Contrast: black sky, grey ground. White spacesuits would vanish on the dust, so they're checked by
 * their dark outline (`framedColour`), as the snowman is on snow.
 */
const SKY = 0.34;
const HILLS = 0.42;
const BACK_TOP = 0.43;
const BACK_BOTTOM = 0.635;
const FRONT_TOP = 0.72;

/** The base sign, between the back and the front; nothing may stand in front of it. */
const SIGN = { x0: 0.28, y0: 0.632, x1: 0.72, y1: 0.712 };

const IN_SPACE = ['space'];
const AT_BACK = ['back'];
const AT_FRONT = ['front'];

const BRIGHT = [C.red, C.blue, C.yellow, C.green, C.orange, C.purple];

const items: ItemDef[] = [
  // ---- In space (far away) ----
  {
    kind: 'earth',
    singular: 'Earth',
    plural: 'Earths',
    article: 'the',
    w: 140,
    h: 140,
    tier: 'medium',
    size: 0.16,
    zones: IN_SPACE,
    still: true,
    maxCount: 1,
    countable: false,
    tone: '#2f80d1',
    draw: () => (
      <G>
        <Circle cx={70} cy={70} r={62} fill="#2f80d1" />
        <G fill="#4caf50" stroke="none">
          <Path d="M34,34 Q54,22 66,36 Q58,52 46,54 Q30,50 34,34 Z" />
          <Path d="M78,62 Q98,56 106,72 Q100,96 84,98 Q72,86 78,62 Z" />
        </G>
        <G fill="#ffffff" stroke="none" opacity={0.8}>
          <Path d="M20,80 Q40,74 60,82 Q40,88 20,80 Z" />
          <Path d="M70,24 Q90,18 108,28 Q90,32 70,24 Z" />
        </G>
        <G stroke="none">
          {/* An ice cap, a thin glow of air round the edge and night falling on one side. */}
          <Path d="M50,12 Q70,6 90,12 Q70,18 50,12 Z" fill="#ffffff" />
          <Circle cx={70} cy={70} r={62} fill="none" stroke="#a5d8ff" strokeOpacity={0.6} strokeWidth={3} />
          <Path d="M70,8 A62,62 0 0 1 70,132 A40,62 0 0 0 70,8 Z" fill="#000000" fillOpacity={0.3} />
        </G>
      </G>
    ),
  },
  {
    kind: 'satellite',
    singular: 'satellite',
    plural: 'satellites',
    article: 'a',
    w: 150,
    h: 70,
    tier: 'medium',
    size: 0.15,
    zones: IN_SPACE,
    maxCount: 2,
    tone: '#ffd60a',
    draw: () => (
      <G>
        <Rect x={4} y={22} width={46} height={26} fill="#1d70d6" />
        <Rect x={100} y={22} width={46} height={26} fill="#1d70d6" />
        <Path d="M27,22 V48 M123,22 V48" stroke="#a5d8ff" strokeWidth={2} />
        <Path d="M50,35 H100" stroke="#adb5bd" strokeWidth={4} />
        <Rect x={60} y={16} width={30} height={38} rx={4} fill="#ffd60a" />
        <Path d="M75,16 V4 M68,4 H82" stroke="#adb5bd" strokeWidth={3} />
        <G stroke="none">
          {/* Cells in the solar panels, crinkled gold foil, and a little dish. */}
          <Path d="M4,35 H50 M100,35 H146 M15,22 V48 M38,22 V48 M112,22 V48 M134,22 V48" stroke="#a5d8ff" strokeOpacity={0.6} strokeWidth={1.2} />
          <Path d="M62,26 l8,4 l-6,6 l10,4 M78,44 l8,-4 l-4,8" fill="none" stroke="#b8861b" strokeWidth={1.5} />
          <Ellipse cx={75} cy={54} rx={8} ry={3} fill="#dee2e6" />
          <Path d="M64,18 V52" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} />
        </G>
      </G>
    ),
  },
  {
    kind: 'rocket',
    singular: 'rocket',
    plural: 'rockets',
    article: 'a',
    w: 70,
    h: 150,
    tier: 'small',
    size: 0.1,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    noFlip: true,
    colours: [C.red, C.blue, C.orange, C.green],
    colourPrompt: () => 'What colour were the rocket’s fins?',
    // Engines firing or coasting, chosen per picture: "Was there fire coming out of the rocket?".
    draw: (colour, details) => (
      <G>
        <Path d="M35,4 Q58,30 56,96 H14 Q12,30 35,4 Z" fill="#f8f9fa" />
        <Circle cx={35} cy={50} r={10} fill="#4dabf7" />
        <Path d="M14,74 L2,110 H18 Z M56,74 L68,110 H52 Z" fill={colour} />
        <Path d="M35,4 Q46,16 50,28 H20 Q24,16 35,4 Z" fill={colour} />
        {details?.values?.engine !== 'off' && (
          <G>
            <Path d="M22,98 Q35,150 48,98 Z" fill="#ffd60a" stroke="none" />
            <Path d="M28,98 Q35,130 42,98 Z" fill="#f77f00" stroke="none" />
          </G>
        )}
        <G stroke="none">
          {/* A rim and a shine on the porthole, panel lines and a shine down the body. */}
          <Circle cx={35} cy={50} r={10} fill="none" stroke="#adb5bd" strokeWidth={2.5} />
          <Circle cx={32} cy={47} r={3} fill="#ffffff" fillOpacity={0.7} />
          <Path d="M17,72 H53 M15,88 H55" stroke="#adb5bd" strokeWidth={1.5} />
          <Path d="M22,34 Q20,60 20,90" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
          <Rect x={22} y={94} width={26} height={6} rx={2} fill="#868e96" />
        </G>
      </G>
    ),
  },
  {
    kind: 'space-station',
    singular: 'space station',
    plural: 'space stations',
    article: 'a',
    w: 170,
    h: 80,
    tier: 'medium',
    size: 0.18,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    tone: '#dee2e6',
    draw: () => (
      <G>
        {[4, 126].map((x) => (
          <G key={x}>
            <Rect x={x} y={4} width={40} height={30} fill="#1d70d6" />
            <Rect x={x} y={46} width={40} height={30} fill="#1d70d6" />
          </G>
        ))}
        <Path d="M24,34 V46 M146,34 V46 M24,40 H146" stroke="#adb5bd" strokeWidth={4} />
        <Rect x={60} y={28} width={50} height={24} rx={10} fill="#dee2e6" />
        <Rect x={76} y={20} width={18} height={40} rx={6} fill="#dee2e6" />
        <G stroke="none">
          {/* Cells in the panels, portholes, joints between the modules and a blinking light. */}
          {[4, 126].map((x) => (
            <Path key={x} d={`M${x + 13},4 V34 M${x + 27},4 V34 M${x + 13},46 V76 M${x + 27},46 V76`} stroke="#a5d8ff" strokeOpacity={0.6} strokeWidth={1.2} />
          ))}
          <Circle cx={70} cy={40} r={3} fill="#4dabf7" />
          <Circle cx={100} cy={40} r={3} fill="#4dabf7" />
          <Circle cx={85} cy={28} r={3} fill="#4dabf7" />
          <Path d="M76,30 H94 M76,50 H94" stroke="#adb5bd" strokeWidth={2} />
          <Circle cx={85} cy={20} r={2.5} fill="#e63946" />
        </G>
      </G>
    ),
  },
  {
    kind: 'comet',
    singular: 'comet',
    plural: 'comets',
    article: 'a',
    w: 170,
    h: 70,
    tier: 'medium',
    size: 0.16,
    zones: IN_SPACE,
    maxCount: 1,
    countable: false,
    tone: '#e7f5ff',
    draw: () => (
      <G>
        <Path d="M4,60 Q80,30 140,22 L146,40 Q90,44 4,60 Z" fill="#a5d8ff" stroke="none" opacity={0.6} />
        <Path d="M30,58 Q90,38 142,30" fill="none" stroke="#e7f5ff" strokeWidth={3} opacity={0.8} />
        <Circle cx={150} cy={30} r={14} fill="#e7f5ff" />
        <G stroke="none">
          {/* A glow round the head, a bright heart and bits of dust left in the tail. */}
          <Circle cx={150} cy={30} r={20} fill="#e7f5ff" fillOpacity={0.25} />
          <Circle cx={153} cy={28} r={6} fill="#ffffff" />
          <Circle cx={110} cy={40} r={2} fill="#ffffff" fillOpacity={0.8} />
          <Circle cx={80} cy={46} r={1.5} fill="#ffffff" fillOpacity={0.7} />
          <Circle cx={50} cy={52} r={1.5} fill="#ffffff" fillOpacity={0.6} />
        </G>
      </G>
    ),
  },

  // ---- Near the hills (the back) ----
  {
    kind: 'lander',
    singular: 'lunar lander',
    plural: 'lunar landers',
    article: 'a',
    w: 200,
    h: 136,
    tier: 'xl',
    // About 3.5 m wide on its legs, gold foil round the bottom.
    size: 0.4,
    wide: true,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#e0a526',
    draw: () => (
      <G>
        <Path d="M40,96 L10,132 M160,96 L190,132" stroke="#adb5bd" strokeWidth={7} />
        <Path d="M0,132 H22 M178,132 H200" stroke="#adb5bd" strokeWidth={7} strokeLinecap="round" />
        <Polygon points="30,58 170,58 160,104 40,104" fill="#e0a526" />
        <Path d="M60,58 V104 M100,58 V104 M140,58 V104" stroke="#b8861b" strokeWidth={3} />
        <Path d="M56,58 L64,18 H136 L144,58 Z" fill="#dee2e6" />
        <Path d="M76,26 H96 V46 H72 Z" fill="#1b2a4a" stroke="none" />
        <Path d="M100,18 V4 M92,4 H108" stroke="#adb5bd" strokeWidth={4} />
        <Path d="M86,104 L80,120 H120 L114,104 Z" fill="#868e96" />
        <G stroke="none">
          {/* Crinkles in the gold foil, a glint on the window, a hatch, a ladder down a leg and a shine on the cabin. */}
          <Path d="M36,70 l10,6 l-6,8 l12,4 M110,66 l10,8 l-8,6 l12,6 M70,90 l8,-6 l6,8" fill="none" stroke="#fff3bf" strokeOpacity={0.6} strokeWidth={2} />
          <Path d="M78,28 L86,28 L78,38 Z" fill="#ffffff" fillOpacity={0.5} />
          <Rect x={108} y={30} width={22} height={24} rx={3} fill="none" stroke="#adb5bd" strokeWidth={2} />
          <Path d="M44,100 L22,126 M50,104 L28,130 M40,108 L46,110 M33,116 L39,118 M27,124 L33,126" stroke="#868e96" strokeWidth={2} />
          <Path d="M66,22 L60,54" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={11} cy={132} rx={12} ry={3} fill="#868e96" />
          <Ellipse cx={189} cy={132} rx={12} ry={3} fill="#868e96" />
        </G>
      </G>
    ),
  },
  {
    kind: 'habitat',
    singular: 'habitat pod',
    plural: 'habitat pods',
    article: 'a',
    w: 220,
    h: 110,
    tier: 'xl',
    // A pod about 4 m long where the astronauts live, with a round door.
    size: 0.44,
    wide: true,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.orange, C.green],
    colourPrompt: () => 'What colour was the stripe on the habitat pod?',
    draw: (colour) => (
      <G>
        <Path d="M20,104 V54 Q20,14 70,14 H150 Q200,14 200,54 V104 Z" fill="#f1f3f5" />
        <Rect x={20} y={72} width={180} height={12} fill={colour} stroke="none" />
        <Circle cx={160} cy={58} r={22} fill="#adb5bd" />
        <Circle cx={160} cy={58} r={14} fill="#1b2a4a" stroke="none" />
        <G stroke="none" fill="#4dabf7">
          <Circle cx={64} cy={44} r={9} />
          <Circle cx={98} cy={44} r={9} />
        </G>
        <Path d="M30,104 V110 M190,104 V110" stroke="#868e96" strokeWidth={6} />
        <G stroke="none">
          {/* Panel seams, rivets round the door, warm light in the windows, a vent and a shine along the top. */}
          <Path d="M60,16 V104 M120,16 V104" stroke="#adb5bd" strokeWidth={1.5} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <Circle key={a} cx={160 + 18 * Math.cos((a * Math.PI) / 180)} cy={58 + 18 * Math.sin((a * Math.PI) / 180)} r={1.6} fill="#495057" />
          ))}
          <Circle cx={61} cy={41} r={3} fill="#ffffff" fillOpacity={0.6} />
          <Circle cx={95} cy={41} r={3} fill="#ffffff" fillOpacity={0.6} />
          <Path d="M30,92 h20 M30,96 h20" stroke="#868e96" strokeWidth={2} />
          <Path d="M50,22 Q100,14 170,22" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'solar-panel',
    singular: 'solar panel',
    plural: 'solar panels',
    article: 'a',
    w: 170,
    h: 110,
    tier: 'large',
    // A tilted panel about 2 m wide on a stand.
    size: 0.23,
    zones: AT_BACK,
    maxCount: 2,
    spread: true,
    tone: '#1d70d6',
    draw: () => (
      <G>
        <Path d="M85,70 V110 M60,110 H110" stroke="#adb5bd" strokeWidth={6} />
        <Polygon points="10,60 160,60 140,6 30,6" fill="#1d70d6" />
        <Path d="M48,6 L38,60 M85,6 V60 M122,6 L132,60 M20,33 H150" stroke="#a5d8ff" strokeWidth={2} />
        <G stroke="none">
          {/* The sun glinting off the cells, a frame along the bottom and a cable to the base. */}
          <Path d="M40,10 L60,10 L46,30 L28,30 Z" fill="#ffffff" fillOpacity={0.3} />
          <Path d="M100,36 L116,36 L120,56 L104,56 Z" fill="#ffffff" fillOpacity={0.15} />
          <Rect x={10} y={58} width={150} height={4} fill="#adb5bd" />
          <Path d="M88,92 Q110,104 140,108" fill="none" stroke="#343a40" strokeWidth={2.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'dish',
    singular: 'radio dish',
    plural: 'radio dishes',
    article: 'a',
    w: 110,
    h: 130,
    tier: 'medium',
    // About 1.5 m across, pointing at the Earth.
    size: 0.17,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    tone: '#dee2e6',
    draw: () => (
      <G>
        <Path d="M55,74 V130 M30,130 H80" stroke="#868e96" strokeWidth={7} />
        <Path d="M6,30 Q30,90 104,62 Q70,40 6,30 Z" fill="#dee2e6" />
        <Path d="M50,56 L78,22" stroke="#868e96" strokeWidth={3} />
        <Circle cx={80} cy={20} r={5} fill="#e63946" stroke="none" />
        <G stroke="none">
          {/* Rings in the dish, struts to the receiver and a box at the foot. */}
          <Path d="M20,38 Q40,70 88,60 M34,42 Q48,62 76,58" fill="none" stroke="#adb5bd" strokeWidth={1.5} />
          <Path d="M30,50 L78,22 M80,60 L80,24" stroke="#868e96" strokeWidth={2} />
          <Rect x={62} y={108} width={20} height={16} rx={2} fill="#adb5bd" />
          <Circle cx={72} cy={114} r={2} fill="#69db7c" />
        </G>
      </G>
    ),
  },
  {
    kind: 'flag',
    singular: 'flag',
    plural: 'flags',
    article: 'a',
    w: 90,
    h: 150,
    tier: 'medium',
    // A flag about 1.2 m wide on a pole, held out by a bar at the top (there's no wind on the Moon).
    size: 0.14,
    zones: AT_BACK,
    maxCount: 1,
    countable: false,
    colours: BRIGHT,
    draw: (colour) => (
      <G>
        <Rect x={8} y={0} width={6} height={150} fill="#adb5bd" stroke="none" />
        <Rect x={14} y={6} width={74} height={50} fill={colour} />
        <Circle cx={51} cy={31} r={12} fill="#ffffff" stroke="none" opacity={0.9} />
        <G stroke="none">
          {/* A star in the circle, the bar along the top, ripples where the cloth hangs and a foot in the dust. */}
          <Path d="M51,23 L53.5,29 L60,29.5 L55,33.5 L56.5,40 L51,36.5 L45.5,40 L47,33.5 L42,29.5 L48.5,29 Z" fill={colour} />
          <Rect x={8} y={4} width={82} height={3} fill="#868e96" />
          <Path d="M36,8 V54 M66,8 V54" stroke="#000000" strokeOpacity={0.12} strokeWidth={4} />
          <Ellipse cx={11} cy={148} rx={12} ry={3} fill="#5c5f66" fillOpacity={0.6} />
        </G>
      </G>
    ),
  },

  // ---- On the dusty ground (the front) ----
  {
    kind: 'astronaut',
    singular: 'astronaut',
    plural: 'astronauts',
    article: 'an',
    w: 80,
    h: 130,
    tier: 'medium',
    // In a spacesuit, about 1.85 m tall.
    size: 0.13,
    zones: AT_FRONT,
    maxCount: 3,
    // Space has people in it: picked first for the front.
    usual: true,
    // A white suit on grey dust: what really shows it is its dark outline, so that's what's checked.
    framedColour: true,
    tone: '#495057',
    colours: BRIGHT,
    colourPrompt: (plural) => (plural ? 'What colour were the astronauts’ backpacks?' : 'What colour was the astronaut’s backpack?'),
    // An astronaut on their own may hold a camera or a torch in the glove on the right (see `fitDetails`).
    draw: (colour, details) => (
      <G>
        <Rect x={6} y={36} width={24} height={52} rx={6} fill={colour} />
        <Rect x={26} y={80} width={14} height={48} rx={6} fill="#f8f9fa" />
        <Rect x={44} y={80} width={14} height={48} rx={6} fill="#f8f9fa" />
        <Rect x={22} y={36} width={44} height={56} rx={14} fill="#f8f9fa" />
        <Rect x={60} y={42} width={14} height={40} rx={7} fill="#f8f9fa" />
        <Circle cx={44} cy={20} r={20} fill="#f8f9fa" />
        <Path d="M30,16 Q44,6 58,16 Q58,32 44,32 Q30,32 30,16 Z" fill="#e0a526" stroke="none" />
        <Rect x={34} y={52} width={20} height={10} rx={2} fill={colour} stroke="none" />
        <G stroke="none">
          {/* A reflection in the visor, buttons on the chest panel, a hose, gloves, boots and suit seams. */}
          <Path d="M36,14 Q42,10 48,12" fill="none" stroke="#ffffff" strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={40} cy={57} r={1.8} fill="#ffffff" />
          <Circle cx={47} cy={57} r={1.8} fill="#ffffff" />
          <Path d="M28,50 Q20,62 30,74" fill="none" stroke="#adb5bd" strokeWidth={3} />
          <Circle cx={67} cy={82} r={6} fill="#adb5bd" />
          <Rect x={24} y={120} width={18} height={9} rx={3} fill="#868e96" />
          <Rect x={42} y={120} width={18} height={9} rx={3} fill="#868e96" />
          <Path d="M26,98 H40 M44,98 H58 M24,70 H64" stroke="#ced4da" strokeWidth={2} />
          <Circle cx={44} cy={38} r={5} fill="none" stroke="#ced4da" strokeWidth={2} />
        </G>
        {ASTRONAUT_HOLDS[details?.values?.astronautHolds ?? '']?.draw()}
      </G>
    ),
  },
  {
    kind: 'rover',
    singular: 'moon buggy',
    plural: 'moon buggies',
    article: 'a',
    w: 220,
    h: 100,
    tier: 'xl',
    // A lunar rover about 3 m long, with big wire wheels.
    size: 0.35,
    wide: true,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.orange, C.yellow],
    colourPrompt: () => 'What colour was the moon buggy’s seat?',
    draw: (colour) => (
      <G>
        <Path d="M20,60 H200 L190,48 H30 Z" fill="#adb5bd" />
        <Rect x={78} y={26} width={50} height={22} rx={4} fill={colour} />
        <Path d="M130,48 L140,14 M150,14 Q160,4 170,14" stroke="#868e96" strokeWidth={4} fill="none" />
        <Path d="M164,14 Q166,0 180,4" fill="none" stroke="#868e96" strokeWidth={3} />
        <G fill="#495057">
          <Circle cx={50} cy={74} r={24} />
          <Circle cx={170} cy={74} r={24} />
        </G>
        <G fill="#adb5bd" stroke="none">
          <Circle cx={50} cy={74} r={10} />
          <Circle cx={170} cy={74} r={10} />
        </G>
        <G stroke="none">
          {/* Wire-mesh tyres, mudguards, a backrest on the seat, a camera and an antenna dish. */}
          <Circle cx={50} cy={74} r={19} fill="none" stroke="#868e96" strokeWidth={2} strokeDasharray="3 3" />
          <Circle cx={170} cy={74} r={19} fill="none" stroke="#868e96" strokeWidth={2} strokeDasharray="3 3" />
          <Path d="M22,62 Q50,40 78,62 M142,62 Q170,40 198,62" fill="none" stroke="#868e96" strokeWidth={4} />
          <Rect x={80} y={18} width={10} height={14} rx={2} fill={colour} />
          <Rect x={60} y={38} width={14} height={10} rx={2} fill="#343a40" />
          <Path d="M84,28 H124" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'moon-rock',
    singular: 'boulder',
    plural: 'boulders',
    article: 'a',
    w: 110,
    h: 70,
    tier: 'small',
    // About 1 m across.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 4,
    tone: '#5c5f66',
    draw: () => (
      <G>
        <Path d="M6,66 Q0,36 24,22 Q44,4 72,12 Q104,20 106,50 Q108,66 96,66 Z" fill="#5c5f66" />
        <G fill="#43464c" stroke="none">
          <Circle cx={40} cy={34} r={5} />
          <Circle cx={72} cy={44} r={4} />
        </G>
        <G stroke="none">
          {/* Light on the sunny top, more pits, and a crack. */}
          <Path d="M24,26 Q46,10 72,16" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={56} cy={54} r={3} fill="#43464c" />
          <Circle cx={88} cy={30} r={2.5} fill="#43464c" />
          <Path d="M80,62 L86,48 L82,40" fill="none" stroke="#43464c" strokeWidth={2} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  {
    kind: 'robot',
    singular: 'robot',
    plural: 'robots',
    article: 'a',
    w: 100,
    h: 100,
    tier: 'small',
    // A little six-wheeled explorer robot, about 0.9 m long.
    size: 0.12,
    zones: AT_FRONT,
    maxCount: 1,
    countable: false,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={14} y={50} width={72} height={26} rx={4} fill="#f8f9fa" />
        <Path d="M50,50 V22" stroke="#868e96" strokeWidth={4} />
        <Rect x={36} y={8} width={28} height={16} rx={4} fill="#495057" />
        <G fill="#4dabf7" stroke="none">
          <Circle cx={44} cy={16} r={4} />
          <Circle cx={56} cy={16} r={4} />
        </G>
        <G fill="#343a40">
          <Circle cx={22} cy={84} r={10} />
          <Circle cx={50} cy={84} r={10} />
          <Circle cx={78} cy={84} r={10} />
        </G>
        <G stroke="none">
          {/* Hubs, glints in the camera eyes, an arm with a scoop, a small solar panel and a status light. */}
          {[22, 50, 78].map((x) => (
            <Circle key={x} cx={x} cy={84} r={3.5} fill="#868e96" />
          ))}
          <Circle cx={43} cy={15} r={1.5} fill="#ffffff" />
          <Circle cx={55} cy={15} r={1.5} fill="#ffffff" />
          <Path d="M86,60 L96,48 L98,58" fill="none" stroke="#868e96" strokeWidth={3} strokeLinejoin="round" />
          <Rect x={18} y={44} width={28} height={6} fill="#1d70d6" />
          <Circle cx={74} cy={63} r={2.5} fill="#69db7c" />
          <Path d="M18,56 H82" stroke="#ced4da" strokeWidth={2} />
        </G>
      </G>
    ),
  },
  {
    kind: 'crater',
    singular: 'crater',
    plural: 'craters',
    article: 'a',
    w: 200,
    h: 50,
    tier: 'large',
    // A small crater about 2.2 m across, seen from the side as a dark oval with a rim.
    size: 0.25,
    zones: AT_FRONT,
    maxCount: 2,
    // Its shadowed hollow is what shows it on the dust.
    tone: '#4b4e55',
    draw: () => (
      <G>
        {/* A bright rim, then the hollow: shadowed at the back, lit at the front. */}
        <Ellipse cx={100} cy={26} rx={98} ry={22} fill="#b1b4ba" stroke="none" />
        <Ellipse cx={100} cy={28} rx={80} ry={16} fill="#5f6269" />
        <Path d="M24,30 Q100,8 176,30 Q100,18 24,30 Z" fill="#43464c" stroke="none" />
        <Path d="M40,36 Q100,46 160,36 Q100,42 40,36 Z" fill="#7d8087" stroke="none" />
      </G>
    ),
  },
];

const MISSIONS = ['Orion', 'Apollo', 'Artemis', 'Eagle', 'Phoenix', 'Falcon'];

/** Base numbers easy to mix up with `n`: one or two along, or the digits swapped. */
function baseLookalikes(n: number): string[] {
  const near = [n + 1, n - 1, n + 2, n - 2, n + 10].filter((x) => x >= 1 && x <= 60);
  const digits = String(n);
  const swapped = digits.length === 2 && digits[1] !== '0' ? [Number(digits[1] + digits[0])] : [];
  return [...new Set([...swapped, ...near].filter((x) => x !== n).map(String))];
}

/** The mission name and base number on the sign, chosen per picture. */
/** What an astronaut can hold in the glove at about (67, 82). (Not a flag or a rock: those are things of their own here.) */
const ASTRONAUT_HOLDS: Record<string, { name: string; draw: () => ReactElement }> = {
  camera: {
    name: 'A camera',
    draw: () => (
      <G>
        <Rect x={60} y={66} width={20} height={15} rx={3} fill="#343a40" stroke="#111" strokeWidth={1.5} />
        <Circle cx={70} cy={73.5} r={4.5} fill="#74c0fc" stroke="#111" strokeWidth={1.5} />
      </G>
    ),
  },
  torch: {
    name: 'A torch',
    draw: () => (
      <G>
        <Path d="M74,60 L80,44 V76 Z" fill="#fff3bf" fillOpacity={0.9} stroke="none" />
        <Path d="M64,82 L74,62" stroke="#343a40" strokeWidth={7} strokeLinecap="round" />
        <Circle cx={74} cy={61} r={4.5} fill="#ffd60a" stroke="#b08a00" strokeWidth={1.5} />
      </G>
    ),
  },
};

/** Once things are placed: with one astronaut, what they're holding (or nothing). */
function fitDetails(d: SceneDetails, groups: PlacedGroup[], random: Rng): SceneDetails {
  if (groups.find((g) => g.kind === 'astronaut')?.count !== 1) return d;
  const holds = random.next() < 0.25 ? '' : random.pick(Object.keys(ASTRONAUT_HOLDS));
  const answer = holds ? ASTRONAUT_HOLDS[holds].name : 'Nothing';
  return {
    ...d,
    values: { ...d.values, astronautHolds: holds },
    facts: [
      ...(d.facts ?? []),
      { id: 'astronaut-holds', family: 'story', type: 'object', prompt: 'What was the astronaut holding?', answer, wrong: [...Object.values(ASTRONAUT_HOLDS).map((h) => h.name), 'Nothing'].filter((n) => n !== answer), needs: 'astronaut' },
    ],
  };
}

function details(random: Rng): SceneDetails {
  const mission = random.pick(MISSIONS);
  const base = random.int(1, 49);
  const engine = random.next() < 0.5 ? 'on' : 'off';
  return {
    values: { mission, base: String(base), engine },
    facts: [
      { id: 'rocket-fire', family: 'story', type: 'object', prompt: 'Was there fire coming out of the rocket?', answer: engine === 'on' ? 'Yes' : 'No', wrong: [engine === 'on' ? 'No' : 'Yes'], needs: 'rocket' },
      { id: 'mission', type: 'object', prompt: 'What was the mission called on the sign?', answer: mission, wrong: MISSIONS.filter((m) => m !== mission) },
      { id: 'base-number', type: 'number', prompt: 'What number was the moon base on the sign?', answer: String(base), wrong: baseLookalikes(base) },
    ],
  };
}

type Palette = Record<'sky' | 'stars' | 'hills' | 'ground' | 'track', string>;

/** Stars at fixed places (fractions of the width and of the sky's height). */
const STARS: [number, number, number][] = [
  [0.04, 0.12, 2.5], [0.13, 0.5, 2], [0.22, 0.2, 3], [0.31, 0.78, 2], [0.4, 0.35, 2.5], [0.49, 0.1, 2], [0.57, 0.62, 3],
  [0.66, 0.24, 2], [0.75, 0.84, 2.5], [0.84, 0.4, 2], [0.93, 0.15, 3], [0.97, 0.7, 2], [0.08, 0.86, 2], [0.45, 0.9, 2],
];

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const hills = height * HILLS;
  const s = { x: SIGN.x0 * 900, y: SIGN.y0 * height, w: (SIGN.x1 - SIGN.x0) * 900, h: (SIGN.y1 - SIGN.y0) * height };
  return (
    <G>
      <Rect x={-600} y={-600} width={2100} height={hills + 600} fill={p.sky} />
      {/* Many tiny stars, the bright ones, and a twinkle on the brightest. */}
      {speckles({ x0: -40, y0: 4, x1: 940, y1: sky - 10 }, 110, p.stars, 0.5, 1.6, 93)}
      <G fill={p.stars}>
        {STARS.map(([x, y, r]) => (
          <Circle key={`${x}-${y}`} cx={x * 900} cy={y * sky * 0.95} r={r} />
        ))}
      </G>
      <G stroke={p.stars} strokeWidth={1.5} strokeOpacity={0.7}>
        {STARS.filter(([, , r]) => r >= 3).map(([x, y]) => (
          <Path key={`${x}-${y}`} d={`M${x * 900 - 8},${y * sky * 0.95}h16M${x * 900},${y * sky * 0.95 - 8}v16`} />
        ))}
      </G>
      {/* Low grey hills on the horizon, then the dusty ground. */}
      <Path d={`M-600,${hills} L-600,${sky + 30} Q-300,${sky - 10} 0,${sky + 26} Q240,${sky + 50} 450,${sky + 14} Q660,${sky - 16} 900,${sky + 30} Q1200,${sky + 50} 1500,${sky + 10} V${hills} Z`} fill={p.hills} />
      {/* Little craters on the far hills. */}
      <G fill="#000000" fillOpacity={0.12}>
        <Ellipse cx={120} cy={sky + 46} rx={26} ry={6} />
        <Ellipse cx={520} cy={sky + 40} rx={20} ry={5} />
        <Ellipse cx={780} cy={sky + 52} rx={30} ry={6} />
      </G>
      <Rect x={-600} y={hills} width={2100} height={height - hills + 600} fill={p.ground} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: hills + 10, x1: 940, y1: height }, 260, '#000000', 0.14, 4)}
      {speckles({ x0: -40, y0: hills + 10, x1: 940, y1: height }, 120, '#ffffff', 0.12, 3, 29)}
      {/* Pebbles and small pits scattered in the dust. */}
      {speckles({ x0: -40, y0: hills + 20, x1: 940, y1: height }, 40, '#43464c', 0.35, 7, 47)}
      {/* The base sign on two posts: the mission name, then the base number. */}
      <G>
        <Rect x={s.x + s.w * 0.15} y={s.y + s.h * 0.8} width={8} height={s.h * 0.5} fill="#868e96" />
        <Rect x={s.x + s.w * 0.85 - 8} y={s.y + s.h * 0.8} width={8} height={s.h * 0.5} fill="#868e96" />
        <Rect x={s.x} y={s.y} width={s.w} height={s.h * 0.85} rx={6} fill="#f1f3f5" stroke="#495057" strokeWidth={4} />
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.27} fontSize={Math.min(38, s.h * 0.34)} fontWeight="bold" fontFamily="Arial" fill="#1d70d6" textAnchor="middle" alignmentBaseline="central">
          {`Mission ${d?.values?.mission ?? 'Orion'}`}
        </SvgText>
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.6} fontSize={Math.min(38, s.h * 0.34)} fontWeight="bold" fontFamily="Arial" fill="#212529" textAnchor="middle" alignmentBaseline="central">
          {`Moon Base ${d?.values?.base ?? '7'}`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Tyre tracks and footprints across the dust.
  return [0.52, 0.8, 0.92].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.track, 3, 0.3));
}

const PALETTES: Record<string, Palette> = {
  grey: { sky: '#05070f', stars: '#ffffff', hills: '#6c6f76', ground: '#8d9097', track: '#787b82' },
  dusty: { sky: '#0a0818', stars: '#fff3d6', hills: '#77706a', ground: '#9a928a', track: '#857d75' },
};

function surfaceAt(_x: number, y: number): string {
  if (y < SKY) return 'sky';
  if (y < HILLS) return 'hills';
  return 'ground';
}

export const space: Recipe = {
  id: 'space',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'On the Moon',
  zones: [
    // One row holds three kinds; any more and the smallest (a satellite) would never fit.
    { id: 'space', label: 'Out in space', surface: 'air', top: 0, bottom: SKY, rows: 1, maxGroups: 3, faraway: true },
    { id: 'hills', label: 'On the hills', surface: 'ground', top: SKY, bottom: HILLS, rows: 0 },
    { id: 'back', label: 'Near the hills', surface: 'ground', top: BACK_TOP, bottom: BACK_BOTTOM, rows: 1 },
    { id: 'front', label: 'Close by', surface: 'ground', top: FRONT_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SIGN],
  details,
  fitDetails,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Sunlight on the dust, a little brighter towards us.
    { top: HILLS, bottom: 1, from: ['#000000', 0.06], to: ['#ffffff', 0.06] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
