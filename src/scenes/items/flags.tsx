import type { ReactElement } from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * Countries' flags, for the airport's parked plane and the flag on the Moon: simple ones that stay clearly different at a small size (never the French, Italian
 * and Irish tricolours together). Drawn in a w × h box.
 */
export const FLAGS: Record<string, { country: string; draw: (w: number, h: number) => ReactElement }> = {
  japan: {
    country: 'Japan',
    draw: (w, h) => (
      <G>
        <Rect width={w} height={h} fill="#ffffff" stroke="#212529" strokeWidth={1.5} />
        <Circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#bc002d" stroke="none" />
      </G>
    ),
  },
  sweden: {
    country: 'Sweden',
    draw: (w, h) => (
      <G>
        <Rect width={w} height={h} fill="#006aa7" stroke="#212529" strokeWidth={1.5} />
        <Rect x={w * 0.3} width={h * 0.22} height={h} fill="#fecc00" stroke="none" />
        <Rect y={h * 0.39} width={w} height={h * 0.22} fill="#fecc00" stroke="none" />
      </G>
    ),
  },
  switzerland: {
    country: 'Switzerland',
    draw: (w, h) => (
      <G>
        <Rect width={w} height={h} fill="#da291c" stroke="#212529" strokeWidth={1.5} />
        <Rect x={w / 2 - h * 0.1} y={h * 0.18} width={h * 0.2} height={h * 0.64} fill="#ffffff" stroke="none" />
        <Rect x={w / 2 - h * 0.32} y={h * 0.4} width={h * 0.64} height={h * 0.2} fill="#ffffff" stroke="none" />
      </G>
    ),
  },
  germany: {
    country: 'Germany',
    draw: (w, h) => (
      <G>
        <Rect width={w} height={h / 3} fill="#000000" stroke="none" />
        <Rect y={h / 3} width={w} height={h / 3} fill="#dd0000" stroke="none" />
        <Rect y={(2 * h) / 3} width={w} height={h / 3} fill="#ffce00" stroke="none" />
        <Rect width={w} height={h} fill="none" stroke="#212529" strokeWidth={1.5} />
      </G>
    ),
  },
  france: {
    country: 'France',
    draw: (w, h) => (
      <G>
        <Rect width={w / 3} height={h} fill="#0055a4" stroke="none" />
        <Rect x={w / 3} width={w / 3} height={h} fill="#ffffff" stroke="none" />
        <Rect x={(2 * w) / 3} width={w / 3} height={h} fill="#ef4135" stroke="none" />
        <Rect width={w} height={h} fill="none" stroke="#212529" strokeWidth={1.5} />
      </G>
    ),
  },
  canada: {
    country: 'Canada',
    draw: (w, h) => (
      <G>
        <Rect width={w} height={h} fill="#ffffff" stroke="none" />
        <Rect width={w / 4} height={h} fill="#d80621" stroke="none" />
        <Rect x={(3 * w) / 4} width={w / 4} height={h} fill="#d80621" stroke="none" />
        {/* A simple maple leaf. */}
        <Path d={`M${w / 2},${h * 0.16} L${w * 0.56},${h * 0.36} L${w * 0.66},${h * 0.32} L${w * 0.6},${h * 0.56} L${w * 0.53},${h * 0.56} L${w * 0.53},${h * 0.8} L${w * 0.47},${h * 0.8} L${w * 0.47},${h * 0.56} L${w * 0.4},${h * 0.56} L${w * 0.34},${h * 0.32} L${w * 0.44},${h * 0.36} Z`} fill="#d80621" stroke="none" />
        <Rect width={w} height={h} fill="none" stroke="#212529" strokeWidth={1.5} />
      </G>
    ),
  },
};
