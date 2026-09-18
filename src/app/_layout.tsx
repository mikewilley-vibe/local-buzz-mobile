import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { DefaultTheme, Link, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Colors, Fonts } from '@/constants/theme';
import { ListingFiltersProvider } from '@/features/listings/ListingFiltersContext';
import { useAuthLinking } from '@/hooks/use-auth-linking';
import { PRODUCT_NAME } from '@/lib/brand';
import { runDevConnectionCheck } from '@/lib/connection-check';

void SplashScreen.preventAutoHideAsync();

const localBuzzTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.amberDeep,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: BrandColors.line,
    notification: BrandColors.amber,
  },
};

export default function RootLayout() {
  useAuthLinking();

  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    void runDevConnectionCheck();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={localBuzzTheme}>
      <ListingFiltersProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.light.backgroundElement },
            headerTintColor: BrandColors.amberDeep,
            headerTitleStyle: { fontFamily: Fonts.display.semibold, color: Colors.light.text },
          }}
        >
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
          <Stack.Screen name="listings" options={{ title: 'Browse listings' }} />
          <Stack.Screen name="map" options={{ title: 'Map' }} />
          <Stack.Screen name="week" options={{ title: 'This week' }} />
          <Stack.Screen name="submit" options={{ title: 'Submit a listing' }} />
          <Stack.Screen name="account" options={{ title: 'Account' }} />
          <Stack.Screen name="auth/callback" options={{ title: 'Account', headerShown: false }} />
        </Stack>
      </ListingFiltersProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
