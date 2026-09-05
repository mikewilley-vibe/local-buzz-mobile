import { DarkTheme, DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
        <Stack.Screen
          name="index"
          options={{
            title: 'Local Buzz',
            headerRight: () => (
              <Link href="/map" asChild>
                <ThemedText type="linkPrimary" accessibilityRole="button">
                  Map
                </ThemedText>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="listing/[id]" options={{ title: 'Listing' }} />
        <Stack.Screen name="map" options={{ title: 'Map' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
