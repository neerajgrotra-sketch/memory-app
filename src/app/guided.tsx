import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidedRound } from '@/components/GuidedRound';
import { useProfile } from '@/profile';
import { colors, layout } from '@/theme';

/**
 * The guided first round (`/guided`): a new player's first Play comes here, then goes on to Level 1. `replay=1` (How
 * to play) plays it again and comes back.
 */
export default function GuidedScreen() {
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const { update } = useProfile();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = { width: Math.max(1, width - insets.left - insets.right), height: Math.max(1, height - insets.top - insets.bottom - layout.memoriseBarHeight) };
  const finish = async () => {
    if (replay === '1') {
      if (router.canGoBack()) router.back();
      else router.replace('/');
      return;
    }
    await update({ guided: true });
    router.replace({ pathname: '/play', params: { game: 'look-remember', mode: 'levels' } });
  };
  return (
    <View style={styles.screen}>
      <GuidedRound
        size={size}
        onDone={finish}
        onSkip={finish}
        onLeave={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        doneLabel={replay === '1' ? 'Back to the game' : 'Start Level 1'}
      />
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background } });
