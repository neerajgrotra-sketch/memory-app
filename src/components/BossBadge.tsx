import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { colors } from '@/theme';

export type BossBadgeState = 'beaten' | 'open' | 'locked';

const SHIELD = 'M50 4 L92 18 V52 C92 80 72 98 50 106 C28 98 8 80 8 52 V18 Z';
const CROWN = 'M30 44 L34 26 L43 37 L50 20 L57 37 L66 26 L70 44 Z';

/** A boss's badge: a shield with a crown and the boss's level. Gold once beaten, red while open, grey until reached. */
export function BossBadge({ level, state, size = 64 }: { level: number; state: BossBadgeState; size?: number }) {
  const fill = state === 'beaten' ? colors.accent : state === 'open' ? colors.boss : colors.surfaceRaised;
  const ink = state === 'beaten' ? colors.accentText : state === 'open' ? '#ffffff' : colors.textMuted;
  const rim = state === 'beaten' ? '#fff3c4' : state === 'open' ? '#ff8a9b' : colors.border;
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 100 110">
      <Path d={SHIELD} fill={fill} stroke={rim} strokeWidth={5} strokeLinejoin="round" />
      <Path d={CROWN} fill={ink} opacity={state === 'locked' ? 0.6 : 1} />
      <SvgText x={50} y={86} fontSize={34} fontWeight="900" fill={ink} textAnchor="middle">
        {String(level)}
      </SvgText>
    </Svg>
  );
}
