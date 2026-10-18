import { Circle, G, Line, Path } from 'react-native-svg';

import type { Rng } from './random';

/**
 * Clock times for pictures with a clock on the wall. Shared, so later places (the city's clock tower,
 * a classroom) draw and ask about clocks the same way.
 *
 * How exact the time is grows with the level: whole hours on Easy, half past on Medium, quarters on
 * Hard. A clock face never shows odd minutes: nobody reads 4:17 off a small clock at a glance.
 */
export type ClockStep = 60 | 30 | 15;

/** "3:00", "12:45". Hours run 1–12. */
export const formatTime = (minutes: number) => {
  const m = ((minutes % 720) + 720) % 720;
  return `${Math.floor(m / 60) || 12}:${String(m % 60).padStart(2, '0')}`;
};

const parseTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h % 12) * 60 + m;
};

/** A random time on the given step. */
export function randomTime(rng: Rng, step: ClockStep): string {
  return formatTime(rng.int(1, 12) * 60 + rng.int(0, 60 / step - 1) * step);
}

/**
 * Wrong answers that tempt someone who only half looked: the hands mirrored (3:00 → 9:00), the hands
 * swapped (3:00 → 12:15), an hour off, or the minute hand a step off. Best first.
 */
export function timeLookalikes(time: string, step: ClockStep): { close: string[]; other: string[] } {
  const t = parseTime(time);
  const h = Math.floor(t / 60);
  const m = t % 60;
  const close = [formatTime(720 - t), formatTime(t + 60), formatTime(t - 60)];
  // Swapped hands only read as a real time when the minute hand points at 12.
  if (m === 0) close.push(formatTime(h * 5));
  const minuteStep = step === 60 ? 30 : step;
  const other = [formatTime(t + minuteStep), formatTime(t - minuteStep), formatTime(t + 120), formatTime(t - 120)];
  const clean = (list: string[]) => [...new Set(list)].filter((x) => x !== time);
  return { close: clean(close), other: clean(other) };
}

/**
 * A round wall clock in a 100 × 100 box showing `time`: tick marks (bold at 12, 3, 6 and 9), a short
 * thick hour hand and a long thin minute hand, so the two can't be confused at a glance.
 */
export function ClockFace({ time, rim = '#343a40' }: { time: string; rim?: string }) {
  const t = parseTime(time);
  const minuteAngle = ((t % 60) / 60) * 2 * Math.PI;
  const hourAngle = (t / 720) * 2 * Math.PI;
  const hand = (angle: number, length: number) => ({ x2: 50 + Math.sin(angle) * length, y2: 50 - Math.cos(angle) * length });
  return (
    <G>
      <Circle cx={50} cy={50} r={46} fill="#ffffff" stroke={rim} strokeWidth={7} />
      {/* A faint shadow inside the rim and a soft glint on the glass: kept light, so the time always reads clearly. */}
      <Circle cx={50} cy={50} r={41} fill="none" stroke="#000000" strokeOpacity={0.07} strokeWidth={4} />
      <Path d="M18,38 A34,34 0 0 1 44,14" fill="none" stroke="#dbe9f4" strokeWidth={5} strokeLinecap="round" />
      <G stroke={rim} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI;
          const major = i % 3 === 0;
          const inner = major ? 30 : 34;
          return (
            <Line
              key={i}
              x1={50 + Math.sin(a) * inner}
              y1={50 - Math.cos(a) * inner}
              x2={50 + Math.sin(a) * 38}
              y2={50 - Math.cos(a) * 38}
              strokeWidth={major ? 5 : 2.5}
            />
          );
        })}
        <Line x1={50} y1={50} {...hand(hourAngle, 21)} strokeWidth={8} />
        <Line x1={50} y1={50} {...hand(minuteAngle, 33)} strokeWidth={4.5} />
      </G>
      <Circle cx={50} cy={50} r={5} fill="#e63946" stroke="none" />
    </G>
  );
}

/**
 * Digital clocks (a microwave, an oven, a station board) are read as digits, so on Hard they can show
 * any minute (4:17); below Hard they follow the same steps as clock faces.
 */
export function randomDigitalTime(rng: Rng, step: ClockStep): string {
  if (step !== 15) return randomTime(rng, step);
  return formatTime(rng.int(1, 12) * 60 + rng.int(0, 59));
}

/**
 * Wrong answers for a digital time, best first: the minute digits swapped (7:45 → 7:54), an hour off,
 * ten minutes off, and a 1 and a 7 mixed up; then twenty minutes or two hours off.
 */
export function digitalLookalikes(time: string): { close: string[]; other: string[] } {
  const t = parseTime(time);
  const m = t % 60;
  const [h, mm] = time.split(':');
  const swapped = Number(mm[1] + mm[0]) < 60 ? `${h}:${mm[1]}${mm[0]}` : null;
  const sevenOne = h.includes('1') ? `${h.replace('1', '7')}:${mm}` : h.includes('7') ? `${h.replace('7', '1')}:${mm}` : null;
  const close = [swapped, formatTime(t + 60), formatTime(t - 60), formatTime(t - m + ((m + 10) % 60)), sevenOne].filter((x): x is string => !!x && Number(x.split(':')[0]) <= 12 && Number(x.split(':')[0]) >= 1);
  const other = [formatTime(t + 20), formatTime(t - 20), formatTime(t + 120), formatTime(t - 120)];
  const clean = (list: string[]) => [...new Set(list)].filter((x) => x !== time);
  return { close: clean(close), other: clean(other) };
}
