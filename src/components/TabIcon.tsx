import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'home' | 'progress' | 'profile';

/** Simple drawn icons for the tab bar, so they look the same everywhere without an icon font. */
export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: ColorValue; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {name === 'home' && (
        <>
          <Path d="M3 11 12 3.5 21 11" />
          <Path d="M5.5 9.5V20h13V9.5" />
          <Path d="M10 20v-5.5h4V20" />
        </>
      )}
      {name === 'progress' && (
        <>
          <Rect x={4} y={13} width={4} height={7} rx={1} />
          <Rect x={10} y={8} width={4} height={12} rx={1} />
          <Rect x={16} y={4} width={4} height={16} rx={1} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />
        </>
      )}
    </Svg>
  );
}
