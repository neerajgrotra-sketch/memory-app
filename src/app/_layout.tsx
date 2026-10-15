import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfileProvider } from '@/profile';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen name="play" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
    </ProfileProvider>
  );
}
