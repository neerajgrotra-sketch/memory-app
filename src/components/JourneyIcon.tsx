import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * A folded paper map with a dotted route and a pin, drawn in the app's colours (an emoji map looked like a missing
 * image on iPhone).
 */
export function JourneyIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Path d="M3 7 L10 4 L18 7 L25 4 V21 L18 24 L10 21 L3 24 Z" fill={colors.surface} stroke={colors.text} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M10 4 V21 M18 7 V24" stroke={colors.text} strokeWidth={1.5} opacity={0.5} />
      <Path d="M6 19 C 9 18, 11 15, 14 15 S 18 12, 19 10.5" stroke={colors.accent} strokeWidth={2.2} strokeDasharray="0.1 3.2" strokeLinecap="round" fill="none" />
      <Circle cx={20} cy={9.5} r={3.4} fill={colors.accent} />
      <Circle cx={20} cy={9.5} r={1.2} fill={colors.accentText} />
    </Svg>
  );
}
