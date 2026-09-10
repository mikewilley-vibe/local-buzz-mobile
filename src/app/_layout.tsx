import { DarkTheme, DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuthLinking } from '@/hooks/use-auth-linking';
import { PRODUCT_NAME } from '@/lib/brand';
import { runDevConnectionCheck } from '@/lib/connection-check';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useAuthLinking();

  useEffect(() => {
    void SplashScreen.hideAsync();
    void runDevConnectionCheck();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: PRODUCT_NAME,
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
        <Stack.Screen name="week" options={{ title: 'This week' }} />
        <Stack.Screen name="submit" options={{ title: 'Submit a listing' }} />
        <Stack.Screen name="account" options={{ title: 'Account' }} />
        <Stack.Screen name="auth/callback" options={{ title: 'Account', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
