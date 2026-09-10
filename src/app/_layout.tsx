import { DarkTheme, DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, Pressable, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useAuthLinking } from '@/hooks/use-auth-linking';
import { PRODUCT_NAME } from '@/lib/brand';
import { runDevConnectionCheck } from '@/lib/connection-check';

void SplashScreen.preventAutoHideAsync();

const HapsHereLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.amberDeep,
    background: Palette.background,
    card: Palette.paper,
    text: Palette.ink,
    border: Palette.line,
    notification: Palette.amber,
  },
};

const HapsHereDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.amber,
    background: Palette.navy,
    card: '#122445',
    text: Palette.paper,
    border: '#1A3358',
    notification: Palette.amber,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useAuthLinking();

  useEffect(() => {
    void SplashScreen.hideAsync();
    void runDevConnectionCheck();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? HapsHereDark : HapsHereLight}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Image
                  source={require('../../assets/images/icon.png')}
                  style={{ width: 28, height: 28 }}
                  accessible={false}
                  accessibilityElementsHidden
                />
                <ThemedText type="smallBold">{PRODUCT_NAME}</ThemedText>
              </View>
            ),
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
