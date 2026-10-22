import { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { C } from '../colours';
import { bird, person, plane, plantPot } from '../items/common';
import { lineMarks } from '../marks';
import type { Rng } from '../random';
import type { ItemDef, Mark, Recipe, Rect as Box, SceneDetails, VariantDef } from '../types';
import { speckles } from '../texture';

/**
 * An airport departure lounge with a big window onto the airfield: the sky and the airfield through the
 * glass, the flight screen, then the lounge where people wait. Band edges as fractions of the picture height.
 *
 * Scale: inside, the lounge is sized against the shared person (1.7 m, 1 m ≈ 0.115 of the width): a
 * luggage trolley 1.4 m, a row of seats 2.2 m, a coffee kiosk and the information desk 2 m. Out of the
 * window everything is a long way off, so it's drawn much smaller, as it really looks (about 1 m ≈ 0.02):
 * a parked jet about 25 m long, a fuel truck 8 m, the control tower. That's how a 40 m plane and a
 * person can share one picture without either being the wrong size.
 */
const SKY = 0.24;
const AIRFIELD_TOP = 0.26;
const WINDOW = 0.43;
const LOUNGE_TOP = 0.62;

/** The flight screen on its stand, at the back of the lounge; nothing may stand in front of it. */
const SCREEN = { x0: 0.28, y0: 0.465, x1: 0.72, y1: 0.595 };

const IN_SKY = ['sky'];
const ON_AIRFIELD = ['airfield'];
const IN_LOUNGE = ['lounge'];

const UNIFORMS = [C.red, C.blue, C.purple, C.green];

const items: ItemDef[] = [
  // ---- In the sky (through the window) ----
  { ...plane, zones: IN_SKY, maxCount: 2 },
  {
    kind: 'helicopter',
    singular: 'helicopter',
    plural: 'helicopters',
    article: 'a',
    w: 150,
    h: 80,
    tier: 'medium',
    size: 0.16,
    zones: IN_SKY,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.yellow, C.orange, C.white],
    draw: (colour) => (
      <G>
        <Path d="M20,8 H130" stroke="#495057" strokeWidth={4} strokeLinecap="round" />
        <Rect x={72} y={8} width={6} height={12} fill="#495057" stroke="none" />
        <Path d="M40,44 Q40,20 70,20 H90 Q112,20 112,44 Q112,62 90,62 H66 Q40,62 40,44 Z" fill={colour} />
        <Path d="M40,40 H6 L2,28 H12 L18,36 H40" fill={colour} />
        <Path d="M88,26 Q106,28 108,44 H88 Z" fill="#a5d8ff" stroke="none" />
        <Path d="M56,62 L52,74 M92,62 L96,74 M44,74 H108" stroke="#495057" strokeWidth={4} strokeLinecap="round" />
        <G stroke="none">
          {/* A blur where the rotor spins, a tail rotor, a door, glare on the windscreen and a light on the belly. */}
          <Ellipse cx={75} cy={8} rx={60} ry={4} fill="#495057" fillOpacity={0.15} />
          <Circle cx={6} cy={30} r={7} fill="#495057" fillOpacity={0.25} />
          <Path d="M66,26 V58" stroke="#000000" strokeOpacity={0.2} strokeWidth={2} />
          <Path d="M92,30 L100,30 L94,40 Z" fill="#ffffff" fillOpacity={0.6} />
          <Circle cx={76} cy={62} r={3} fill="#e63946" />
          <Path d="M46,32 Q60,24 86,24" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  { ...bird, zones: IN_SKY, maxCount: 3 },

  // ---- Out on the airfield (far away) ----
  {
    kind: 'jet',
    singular: 'parked plane',
    plural: 'parked planes',
    article: 'a',
    w: 300,
    h: 90,
    tier: 'xl',
    // A jet about 25 m long, a long way off.
    size: 0.5,
    wide: true,
    zones: ON_AIRFIELD,
    maxCount: 1,
    countable: false,
    // The stripe along the side is the airline's colour.
    colours: [C.red, C.blue, C.green, C.orange, C.purple],
    colourPrompt: () => 'What colour was the stripe on the parked plane?',
    draw: (colour) => (
      <G>
        <Path d="M240,46 L272,6 H290 L280,46 Z" fill={colour} />
        <Path d="M10,52 Q10,34 40,34 H262 Q296,34 296,52 Q296,64 262,66 H40 Q10,66 10,52 Z" fill="#f8f9fa" />
        <Rect x={30} y={52} width={250} height={6} fill={colour} stroke="none" />
        <Polygon points="120,58 180,58 150,86 128,86" fill="#ced4da" />
        <G stroke="none" fill="#495057">
          <Path d="M18,46 Q22,40 32,40 V48 H18 Z" />
          {[50, 66, 82, 98, 114, 190, 206, 222, 238].map((x) => (
            <Circle key={x} cx={x} cy={46} r={3} />
          ))}
        </G>
        <G stroke="none">
          {/* Cockpit glare, a door outline, an engine under the wing and light along the top of the fuselage. */}
          <Path d="M20,44 L26,41 L24,46 Z" fill="#ffffff" fillOpacity={0.7} />
          <Rect x={36} y={40} width={8} height={14} rx={2} fill="none" stroke="#adb5bd" strokeWidth={1.5} />
          <Rect x={136} y={66} width={30} height={12} rx={6} fill="#adb5bd" />
          <Ellipse cx={164} cy={72} rx={3} ry={5} fill="#495057" />
          <Path d="M40,37 H262" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
        </G>
        <Path d="M60,66 V82 M220,66 V82" stroke="#495057" strokeWidth={4} />
        <G fill="#212529" stroke="none">
          <Circle cx={60} cy={84} r={5} />
          <Circle cx={220} cy={84} r={5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'fuel-truck',
    singular: 'fuel truck',
    plural: 'fuel trucks',
    article: 'a',
    w: 160,
    h: 70,
    tier: 'medium',
    // About 8 m long, a long way off.
    size: 0.16,
    zones: ON_AIRFIELD,
    maxCount: 1,
    countable: false,
    tone: '#f8f9fa',
    draw: () => (
      <G>
        <Rect x={4} y={14} width={110} height={38} rx={18} fill="#f8f9fa" />
        <Rect x={10} y={30} width={98} height={6} fill="#e63946" stroke="none" />
        <Path d="M118,52 V22 Q118,14 126,14 H140 L156,34 V52 Z" fill="#ffd60a" />
        <Path d="M128,20 H138 L148,32 H128 Z" fill="#a5d8ff" stroke="none" />
        <G stroke="none">
          {/* A hose reel on the tank, a flame sign, a beacon on the cab and hubs. */}
          <Circle cx={60} cy={20} r={5} fill="#adb5bd" />
          <Path d="M90,44 q-3,-5 0,-9 q3,4 0,9 Z" fill="#f77f00" />
          <Rect x={130} y={9} width={8} height={5} rx={2} fill="#f77f00" />
          <Path d="M10,20 H108" stroke="#ffffff" strokeWidth={2} />
        </G>
        <G fill="#343a40">
          <Circle cx={30} cy={56} r={10} />
          <Circle cx={90} cy={56} r={10} />
          <Circle cx={138} cy={56} r={10} />
        </G>
        <G fill="#adb5bd" stroke="none">
          <Circle cx={30} cy={56} r={3.5} />
          <Circle cx={90} cy={56} r={3.5} />
          <Circle cx={138} cy={56} r={3.5} />
        </G>
      </G>
    ),
  },
  {
    kind: 'baggage-train',
    singular: 'baggage train',
    plural: 'baggage trains',
    article: 'a',
    w: 170,
    h: 60,
    tier: 'medium',
    // A little tug pulling two baggage carts, about 8 m long, a long way off.
    size: 0.17,
    zones: ON_AIRFIELD,
    maxCount: 1,
    countable: false,
    tone: '#ffd60a',
    draw: () => (
      <G>
        <Path d="M130,40 V20 H150 L166,32 V40 Z" fill="#ffd60a" />
        {[4, 66].map((x) => (
          <G key={x}>
            <Rect x={x} y={26} width={56} height={14} fill="#adb5bd" />
            <G stroke="none">
              <Rect x={x + 4} y={8} width={20} height={18} rx={2} fill="#e63946" />
              <Rect x={x + 26} y={12} width={24} height={14} rx={2} fill="#1d70d6" />
            </G>
          </G>
        ))}
        <Path d="M60,34 H66 M122,34 H130" stroke="#495057" strokeWidth={3} />
        <G stroke="none">
          {/* Handles on the cases, a driver in the tug and a beacon on its roof. */}
          <Path d="M12,8 V5 H20 V8 M38,12 V9 H46 V12 M74,8 V5 H82 V8 M100,12 V9 H108 V12" fill="none" stroke="#212529" strokeWidth={2} />
          <Circle cx={146} cy={24} r={4} fill="#e0ac69" />
          <Rect x={140} y={16} width={8} height={4} rx={2} fill="#f77f00" />
        </G>
        <G fill="#343a40">
          {[16, 48, 78, 110, 144].map((x) => (
            <Circle key={x} cx={x} cy={46} r={7} />
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'control-tower',
    singular: 'control tower',
    plural: 'control towers',
    article: 'a',
    w: 70,
    h: 125,
    tier: 'small',
    // The control tower, a long way off across the airfield.
    size: 0.1,
    zones: ON_AIRFIELD,
    maxCount: 1,
    countable: false,
    tone: '#dee2e6',
    draw: () => (
      <G>
        <Rect x={26} y={44} width={18} height={81} fill="#dee2e6" />
        <Path d="M4,22 H66 L58,46 H12 Z" fill="#dee2e6" />
        <Path d="M10,26 H60 L55,40 H15 Z" fill="#4dabf7" stroke="none" />
        <Rect x={14} y={12} width={42} height={10} fill="#adb5bd" />
        <Path d="M35,12 V0" stroke="#495057" strokeWidth={3} />
        <G stroke="none">
          {/* Window frames round the cab, a red light on the mast, little windows down the shaft. */}
          <Path d="M22,26 V40 M35,26 V40 M48,26 V40" stroke="#dee2e6" strokeWidth={2} />
          <Circle cx={35} cy={1} r={3} fill="#e63946" />
          {[60, 80, 100].map((y) => (
            <Rect key={y} x={32} y={y} width={6} height={6} fill="#4dabf7" />
          ))}
          <Rect x={38} y={44} width={6} height={81} fill="#000000" fillOpacity={0.1} />
        </G>
      </G>
    ),
  },

  // ---- In the departure lounge ----
  {
    ...person,
    kind: 'traveller',
    singular: 'traveller',
    plural: 'travellers',
    zones: IN_LOUNGE,
    maxCount: 3,
    colourPrompt: (plural) => (plural ? 'What colour were the travellers’ shirts?' : 'What colour was the traveller’s shirt?'),
  },
  {
    kind: 'pilot',
    singular: 'pilot',
    plural: 'pilots',
    article: 'a',
    w: 64,
    h: 125,
    tier: 'small',
    size: 0.1,
    zones: IN_LOUNGE,
    maxCount: 2,
    tone: '#1f2a44',
    // A pilot in a navy uniform with gold cuffs and a peaked cap; skin varies per copy.
    draw: (_colour, details, copy = 0) => (
      <G>
        {person.draw('#1f2a44', details, copy)}
        <G stroke="none">
          <Rect x={4} y={66} width={11} height={4} fill="#ffd60a" />
          <Rect x={49} y={66} width={11} height={4} fill="#ffd60a" />
          <Path d="M28,32 L32,46 L36,32 Z" fill="#f8f9fa" />
          {/* Gold wings on the chest and buttons down the jacket. */}
          <Path d="M38,50 h10 l-2,3 h-6 Z" fill="#ffd60a" />
          <Circle cx={32} cy={56} r={1.5} fill="#ffd60a" />
          <Circle cx={32} cy={64} r={1.5} fill="#ffd60a" />
        </G>
        <Path d="M15,10 Q32,-4 49,10 V13 H15 Z" fill="#1f2a44" />
        <Rect x={12} y={12} width={40} height={4} rx={2} fill="#212529" stroke="none" />
        <Circle cx={32} cy={6} r={3} fill="#ffd60a" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'flight-attendant',
    singular: 'flight attendant',
    plural: 'flight attendants',
    article: 'a',
    w: 92,
    h: 125,
    tier: 'small',
    size: 0.13,
    zones: IN_LOUNGE,
    maxCount: 2,
    colours: UNIFORMS,
    colourPrompt: (plural) => (plural ? 'What colour were the flight attendants’ uniforms?' : 'What colour was the flight attendant’s uniform?'),
    // Pulling a little wheeled case; skin and hair vary per copy.
    draw: (colour, details, copy = 0) => (
      <G>
        <Path d="M58,76 L80,84" stroke="#495057" strokeWidth={3} />
        <Rect x={68} y={84} width={22} height={34} rx={4} fill="#495057" />
        <Path d="M74,88 V114 M84,88 V114" stroke="#343a40" strokeWidth={2} />
        <Circle cx={73} cy={121} r={3} fill="#212529" stroke="none" />
        <Circle cx={85} cy={121} r={3} fill="#212529" stroke="none" />
        {person.draw(colour, details, copy)}
        <Path d="M22,34 Q32,44 42,34 L40,40 Q32,48 24,40 Z" fill="#ffd60a" stroke="none" />
      </G>
    ),
  },
  {
    kind: 'trolley',
    singular: 'luggage trolley',
    plural: 'luggage trolleys',
    article: 'a',
    w: 140,
    h: 110,
    tier: 'medium',
    // About 1.4 m long, piled with suitcases.
    size: 0.16,
    zones: IN_LOUNGE,
    maxCount: 2,
    colours: [C.red, C.blue, C.green, C.yellow, C.purple, C.orange],
    colourPrompt: (plural) => (plural ? 'What colour were the big suitcases on the trolleys?' : 'What colour was the big suitcase on the trolley?'),
    draw: (colour) => (
      <G>
        <Path d="M10,30 L24,90 H130" fill="none" stroke="#868e96" strokeWidth={5} strokeLinejoin="round" />
        <Path d="M4,24 H16" stroke="#868e96" strokeWidth={6} strokeLinecap="round" />
        <Rect x={32} y={34} width={90} height={52} rx={6} fill={colour} />
        <Rect x={60} y={8} width={52} height={26} rx={5} fill="#495057" />
        <Path d="M70,34 V86 M94,34 V86" stroke="#00000033" strokeWidth={3} />
        <G stroke="none">
          {/* A handle on each case, a luggage tag, a zip and a shine. */}
          <Path d="M76,8 V3 H96 V8" fill="none" stroke="#212529" strokeWidth={3} />
          <Path d="M110,34 L116,46" stroke="#868e96" strokeWidth={2} />
          <Rect x={112} y={44} width={10} height={14} rx={2} fill="#f8f9fa" transform="rotate(-20 117 51)" />
          <Path d="M64,14 H108" stroke="#212529" strokeWidth={1.5} strokeDasharray="3 2" />
          <Path d="M38,40 V80" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </G>
        <G fill="#212529" stroke="none">
          <Circle cx={36} cy={100} r={9} />
          <Circle cx={120} cy={100} r={9} />
        </G>
        <G fill="#868e96" stroke="none">
          <Circle cx={36} cy={100} r={3} />
          <Circle cx={120} cy={100} r={3} />
        </G>
      </G>
    ),
  },
  {
    kind: 'seats',
    singular: 'row of seats',
    plural: 'rows of seats',
    article: 'a',
    w: 200,
    h: 80,
    tier: 'large',
    // Four joined seats, about 2.2 m long.
    size: 0.25,
    zones: IN_LOUNGE,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.blue, C.green, C.orange, C.grey, C.purple],
    draw: (colour) => (
      <G>
        <Rect x={0} y={58} width={200} height={6} fill="#868e96" />
        <Path d="M20,64 V80 M180,64 V80" stroke="#868e96" strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <G key={i}>
            <Rect x={4 + i * 49} y={4} width={44} height={44} rx={8} fill={colour} />
            <Rect x={4 + i * 49} y={44} width={44} height={14} rx={5} fill={colour} />
          </G>
        ))}
        <G stroke="none">
          {/* Stitching on each back, a shine on the cushions and armrests between the seats. */}
          {[0, 1, 2, 3].map((i) => (
            <G key={i}>
              <Path d={`M${12 + i * 49},14 H${40 + i * 49}`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
              <Path d={`M${26 + i * 49},10 V40`} stroke="#000000" strokeOpacity={0.12} strokeWidth={2} />
            </G>
          ))}
          {[49, 98, 147].map((x) => (
            <Rect key={x} x={x - 3} y={36} width={6} height={22} rx={2} fill="#868e96" />
          ))}
        </G>
      </G>
    ),
  },
  {
    kind: 'coffee-kiosk',
    singular: 'coffee kiosk',
    plural: 'coffee kiosks',
    article: 'a',
    w: 170,
    h: 150,
    tier: 'large',
    // About 2 m wide, with a striped awning.
    size: 0.23,
    zones: IN_LOUNGE,
    maxCount: 1,
    countable: false,
    colours: [C.red, C.green, C.blue, C.orange, C.purple],
    colourPrompt: () => 'What colour was the awning on the coffee kiosk?',
    // Open, or shut with its shutter down, chosen per picture: "Was the coffee kiosk open or closed?".
    draw: (colour, details) => (
      <G>
        <Rect x={10} y={60} width={150} height={90} rx={4} fill="#8b5a2b" />
        <Rect x={20} y={70} width={130} height={14} fill="#f8f9fa" stroke="none" />
        <Path d="M0,30 H170 L160,58 H10 Z" fill={colour} />
        <G fill="#ffffff" stroke="none">
          {[20, 60, 100, 140].map((x) => (
            <Path key={x} d={`M${x},30 H${x + 18} L${x + 16},58 H${x + 2} Z`} />
          ))}
        </G>
        <Path d="M30,0 V30 M140,0 V30" stroke="#868e96" strokeWidth={4} />
        <G stroke="none">
          <Path d="M70,100 H96 V120 Q96,128 88,128 H78 Q70,128 70,120 Z" fill="#f8f9fa" />
          <Path d="M96,106 Q106,106 106,114 Q106,120 96,120" fill="none" stroke="#f8f9fa" strokeWidth={3} />
          {/* Steam, a menu on the white board, a coffee machine, cups on the counter and planks below. */}
          <Path d="M78,96 q-3,-5 0,-10 M88,96 q-3,-5 0,-10" fill="none" stroke="#f8f9fa" strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M28,77 h40 M80,77 h20 M110,77 h30" stroke="#868e96" strokeWidth={3} strokeLinecap="round" />
          <Rect x={124} y={88} width={24} height={28} rx={3} fill="#adb5bd" />
          <Rect x={130} y={94} width={12} height={6} rx={1} fill="#212529" />
          <Path d="M26,96 l2,-8 h8 l2,8 Z M42,96 l2,-8 h8 l2,8 Z" fill="#f8f9fa" />
          <Path d="M14,134 H156" stroke="#000000" strokeOpacity={0.2} strokeWidth={2.5} />
        </G>
        {details?.values?.kiosk === 'closed' && (
          // The metal shutter pulled down over the whole front, with its slats and a handle.
          <G>
            <Rect x={12} y={60} width={146} height={88} rx={2} fill="#adb5bd" stroke="#495057" strokeWidth={3} />
            <Path d={Array.from({ length: 8 }, (_, k) => `M14,${70 + k * 10} H156`).join(' ')} stroke="#868e96" strokeWidth={2} />
            <Rect x={74} y={136} width={22} height={6} rx={3} fill="#495057" />
          </G>
        )}
      </G>
    ),
  },
  {
    kind: 'info-desk',
    singular: 'information desk',
    plural: 'information desks',
    article: 'an',
    w: 170,
    h: 110,
    tier: 'large',
    // About 2 m wide, with a big "i" sign, in the airport's blue.
    size: 0.23,
    zones: IN_LOUNGE,
    maxCount: 1,
    countable: false,
    tone: '#2f6fb3',
    draw: () => (
      <G>
        <Path d="M85,0 V30" stroke="#868e96" strokeWidth={4} />
        <Circle cx={85} cy={24} r={16} fill="#1d70d6" />
        <Rect x={83} y={22} width={4} height={10} fill="#ffffff" stroke="none" />
        <Circle cx={85} cy={17} r={2.5} fill="#ffffff" stroke="none" />
        <Path d="M4,50 Q4,44 10,44 H160 Q166,44 166,50 V110 H4 Z" fill="#2f6fb3" />
        <Rect x={4} y={58} width={162} height={8} fill="#f8f9fa" stroke="none" />
        <G stroke="none">
          {/* A computer screen and a bell on the counter, a leaflet stand and panels in the front. */}
          <Rect x={30} y={30} width={30} height={14} rx={2} fill="#343a40" />
          <Rect x={33} y={33} width={24} height={8} rx={1} fill="#74c0fc" />
          <Path d="M120,44 Q120,36 128,36 Q136,36 136,44 Z" fill="#ffd60a" />
          <Rect x={142} y={30} width={14} height={14} rx={1} fill="#f8f9fa" />
          <Rect x={145} y={33} width={8} height={4} fill="#e63946" />
          <Path d="M60,72 V106 M110,72 V106" stroke="#000000" strokeOpacity={0.15} strokeWidth={3} />
          <Path d="M10,48 H160" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      </G>
    ),
  },
  { ...plantPot, zones: IN_LOUNGE, maxCount: 2 },
];

const CITIES = ['Paris', 'Rome', 'Madrid', 'Berlin', 'Athens', 'Lisbon', 'Dublin', 'Oslo'];

/** Gates easy to mix up with `gate` (B12): one along, or the same number at the next letter. */
function gateLookalikes(gate: string): string[] {
  const letter = gate[0];
  const n = Number(gate.slice(1));
  const next = String.fromCharCode(letter.charCodeAt(0) === 68 ? 67 : letter.charCodeAt(0) + 1);
  return [`${letter}${n + 1}`, `${letter}${n - 1}`, `${next}${n}`, `${letter}${n + 10}`].filter((g) => g !== gate && Number(g.slice(1)) >= 1);
}

/** Flight numbers easy to mix up with `code` (GL 427): one digit changed, or two digits swapped. */
function flightLookalikes(code: string): string[] {
  const [prefix, digits] = code.split(' ');
  const n = Number(digits);
  const swapped = digits[1] + digits[0] + digits[2];
  return [...new Set([`${prefix} ${n + 1}`, `${prefix} ${n - 1}`, `${prefix} ${swapped}`, `${prefix} ${n + 10}`])].filter((c) => c !== code);
}

/** The flight on the screen: its number, where it's going and its gate, chosen per picture. */
function details(random: Rng): SceneDetails {
  const city = random.pick(CITIES);
  const gate = `${random.pick(['A', 'B', 'C', 'D'])}${random.int(2, 28)}`;
  const flight = `GL ${random.int(121, 879)}`;
  const kiosk = random.next() < 0.5 ? 'open' : 'closed';
  return {
    values: { city, gate, flight, kiosk },
    facts: [
      { id: 'kiosk-open', family: 'story', type: 'object', prompt: 'Was the coffee kiosk open or closed?', answer: kiosk === 'open' ? 'Open' : 'Closed', wrong: [kiosk === 'open' ? 'Closed' : 'Open'], needs: 'coffee-kiosk' },
      { id: 'flight-city', type: 'object', prompt: 'Where was the flight on the screen going?', answer: city, wrong: CITIES.filter((c) => c !== city) },
      { id: 'flight-gate', type: 'number', prompt: 'Which gate was the flight leaving from?', answer: gate, wrong: gateLookalikes(gate) },
      { id: 'flight-number', type: 'number', prompt: 'What was the flight number?', answer: flight, wrong: flightLookalikes(flight) },
    ],
  };
}

type Palette = Record<'sky' | 'airfield' | 'runway' | 'frame' | 'wall' | 'floor' | 'floorLine', string>;

function backdrop(height: number, p: Palette, d?: SceneDetails) {
  const sky = height * SKY;
  const window = height * WINDOW;
  const lounge = height * LOUNGE_TOP;
  const s = { x: SCREEN.x0 * 900, y: SCREEN.y0 * height, w: (SCREEN.x1 - SCREEN.x0) * 900, h: (SCREEN.y1 - SCREEN.y0) * height };
  return (
    <G>
      {/* Through the window: the sky, the airfield and a runway with its white markings. */}
      <Rect x={-600} y={-600} width={2100} height={sky + 600} fill={p.sky} />
      <Rect x={-600} y={sky} width={2100} height={window - sky} fill={p.airfield} />
      <Rect x={-600} y={sky + (window - sky) * 0.15} width={2100} height={(window - sky) * 0.18} fill={p.runway} />
      <G fill="#ffffff" opacity={0.8}>
        {Array.from({ length: 14 }, (_, i) => (
          <Rect key={i} x={-560 + i * 150} y={sky + (window - sky) * 0.235} width={60} height={4} />
        ))}
      </G>
      {/* The texture of the grass, lights along the runway edge and glare on the glass. */}
      {speckles({ x0: -40, y0: sky + (window - sky) * 0.4, x1: 940, y1: window }, 80, '#000000', 0.12, 3, 43)}
      <G fill="#ffd60a">
        {Array.from({ length: 30 }, (_, i) => (
          <Circle key={i} cx={-580 + i * 75} cy={sky + (window - sky) * 0.35} r={2.5} />
        ))}
      </G>
      <G fill="#ffffff" fillOpacity={0.12}>
        {[-300, 0, 300, 600, 900].map((x) => (
          <Path key={x} d={`M${x + 40},${window} L${x + 150},${-600} H${x + 200} L${x + 90},${window} Z`} />
        ))}
      </G>
      {/* The window frame: thin uprights, then the wall below the glass. */}
      <G fill={p.frame}>
        {[-300, 0, 300, 600, 900, 1200].map((x) => (
          <Rect key={x} x={x - 4} y={-600} width={8} height={window + 600} />
        ))}
        <Rect x={-600} y={window} width={2100} height={10} />
      </G>
      <Rect x={-600} y={window + 10} width={2100} height={lounge - window - 10} fill={p.wall} />
      {/* Panels on the wall, and a skirting where it meets the floor. */}
      {[-300, 0, 300, 600, 900, 1200].map((x) => (
        <Rect key={x} x={x - 1} y={window + 10} width={2} height={lounge - window - 10} fill="#000000" fillOpacity={0.06} />
      ))}
      <Rect x={-600} y={lounge - 8} width={2100} height={8} fill="#000000" fillOpacity={0.08} />
      <Rect x={-600} y={lounge} width={2100} height={height - lounge + 600} fill={p.floor} />
      {/* The texture of the ground. */}
      {speckles({ x0: -40, y0: lounge, x1: 940, y1: height }, 160, '#000000', 0.05, 3)}
      {/* The flight screen on its stand: flight number and city, then the gate. */}
      <G>
        <Rect x={s.x + s.w / 2 - 6} y={s.y + s.h * 0.9} width={12} height={lounge - s.y - s.h * 0.9 + 12} fill="#495057" />
        <Rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill="#1b2a4a" stroke="#495057" strokeWidth={5} />
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.3} fontSize={Math.min(40, s.h * 0.3)} fontWeight="bold" fontFamily="Arial" fill="#ffd60a" textAnchor="middle" alignmentBaseline="central">
          {`${d?.values?.flight ?? 'GL 427'}  ${d?.values?.city ?? 'Rome'}`}
        </SvgText>
        <SvgText x={s.x + s.w / 2} y={s.y + s.h * 0.72} fontSize={Math.min(40, s.h * 0.3)} fontWeight="bold" fontFamily="Arial" fill="#ffffff" textAnchor="middle" alignmentBaseline="central">
          {`Gate ${d?.values?.gate ?? 'B12'}`}
        </SvgText>
      </G>
    </G>
  );
}

function marks(height: number, boxes: Box[], _random: () => number, variant: VariantDef): Mark[] {
  // Floor tile lines across the lounge.
  return [0.72, 0.84, 0.95].flatMap((f) => lineMarks(f * height, -600, 1500, boxes, variant.palette.floorLine, 2, 0.3));
}

const PALETTES: Record<string, Palette> = {
  day: { sky: '#8fd0f5', airfield: '#7fae6a', runway: '#6c757d', frame: '#495057', wall: '#dee2e6', floor: '#e9e4da', floorLine: '#c9c2b4' },
  evening: { sky: '#f4a96a', airfield: '#6f8f5c', runway: '#5c636a', frame: '#343a40', wall: '#d6d0c8', floor: '#ddd5c8', floorLine: '#bfb6a6' },
};

function surfaceAt(_x: number, y: number): string {
  if (y < SKY) return 'sky';
  if (y < WINDOW) return 'airfield';
  if (y < LOUNGE_TOP) return 'wall';
  return 'floor';
}

export const airport: Recipe = {
  id: 'airport',
  // Where questions by landmarks, places and bands, never left / middle / right (hard to judge on a phone).
  sides: false,
  title: 'At the airport',
  zones: [
    // Both seen far off through the window, so never "above" or "below" anything in the lounge.
    { id: 'sky', label: 'In the sky', surface: 'air', top: 0, bottom: SKY, rows: 1, faraway: true },
    { id: 'airfield', label: 'Out on the airfield', surface: 'ground', top: AIRFIELD_TOP, bottom: WINDOW - 0.01, rows: 1, maxGroups: 3, faraway: true },
    { id: 'lounge', label: 'In the departure lounge', surface: 'ground', top: LOUNGE_TOP, bottom: 1, rows: 2 },
  ],
  items,
  keepClear: [SCREEN],
  details,
  // Light across the backdrop: see `LightBand`. The contrast rules take it into account.
  light: [
    // Haze over the far airfield.
    { top: SKY, bottom: WINDOW, from: ['#ffffff', 0.12], to: ['#ffffff', 0] },
    // Light from the window on the lounge floor, fading towards us.
    { top: LOUNGE_TOP, bottom: 1, from: ['#ffffff', 0.12], to: ['#000000', 0.03] },
  ],
  surfaceAt,
  marks,
  variants: Object.entries(PALETTES).map(([id, p]) => ({ id, palette: p, background: (h: number, d?: SceneDetails) => backdrop(h, p, d) })),
};
