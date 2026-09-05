import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { runDevConnectionCheck } from '@/lib/connection-check';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Development-only Supabase connectivity check (safe no-op in production).
    void runDevConnectionCheck();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Local Buzz' }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Listing' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
