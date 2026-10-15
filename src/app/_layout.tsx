import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfileProvider } from '@/profile';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="play" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="stats" />
        <Stack.Screen name="profile" />
      </Stack>
    </ProfileProvider>
  );
}
