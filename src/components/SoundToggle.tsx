import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useProfile } from '@/profile';
import { colors } from '@/theme';

/**
 * One-tap mute: a speaker when sound is on, a crossed-out speaker when it's off. The same setting as
 * Profile → Sounds, so it's remembered.
 */
export function SoundToggle() {
  const { profile, update } = useProfile();
  const on = profile?.sound ?? true;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Sound"
      accessibilityState={{ checked: on }}
      onPress={() => update({ sound: !on })}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={on ? colors.text : colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={on ? colors.text : colors.textMuted} />
        {on ? (
          <>
            <Path d="M15.5 9a4 4 0 0 1 0 6" />
            <Path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
          </>
        ) : (
          <Path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
