import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { Splash } from '@/components/Splash';
import { ProfileProvider } from '@/profile';
import { colors } from '@/theme';

// Keep the native splash (a plain dark screen) up until the launch animation takes over.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen name="play" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="boss" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="journey" options={{ animation: 'fade' }} />
        <Stack.Screen name="guided" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
      <Splash />
    </ProfileProvider>
  );
}
