import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuitButton } from '@/components/QuitButton';
import { SceneView } from '@/scenes/SceneView';
import type { SceneSpec } from '@/scenes/types';
import { colors } from '@/theme';

interface PictureViewerProps {
  scene: SceneSpec;
  title: string;
  visible: boolean;
  onClose: () => void;
}

/**
 * The memorised picture, as large as the screen allows, for checking answers on the result screen.
 * Exactly the picture that was shown (not laid out again). Tap anywhere or ✕ to close.
 */
export function PictureViewer({ scene, title, visible, onClose }: PictureViewerProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent supportedOrientations={['portrait', 'landscape']}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={styles.bar}>
          <QuitButton onPress={onClose} label="Close picture" />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Pressable style={styles.picture} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close picture">
          <SceneView spec={scene} />
        </Pressable>
        <Text style={styles.hint}>Tap to close</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  title: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '700' },
  picture: { flex: 1 },
  hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
});
