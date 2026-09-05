import { DarkTheme, DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, useColorScheme } from 'react-native';

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
            headerLeft: () => (
              <Link href="/account" asChild>
                <Pressable accessibilityRole="button" hitSlop={8}>
                  <ThemedText type="linkPrimary">Account</ThemedText>
                </Pressable>
              </Link>
            ),
            headerRight: () => (
              <Link href="/submit" asChild>
                <Pressable accessibilityRole="button" hitSlop={8}>
                  <ThemedText type="linkPrimary">Add</ThemedText>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Stack.Screen name="listing/[id]" options={{ title: 'Listing' }} />
        <Stack.Screen name="map" options={{ title: 'Map' }} />
        <Stack.Screen name="submit" options={{ title: 'Submit a listing' }} />
        <Stack.Screen name="account" options={{ title: 'Account' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
