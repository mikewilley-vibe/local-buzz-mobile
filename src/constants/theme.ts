/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1917',
    background: '#F6EFE4',
    backgroundElement: '#FFFAF3',
    backgroundSelected: '#F3E6D4',
    textSecondary: '#6F6358',
  },
  dark: {
    text: '#FFFAF3',
    background: '#211B17',
    backgroundElement: '#2F261F',
    backgroundSelected: '#47382B',
    textSecondary: '#D2BDA6',
  },
} as const;

/** Shared with the public site's color tokens in src/app/globals.css. */
export const BrandColors = {
  amber: '#E8A54B',
  amberDeep: '#9A5B12',
  ink: '#1C1917',
  muted: '#6F6358',
  line: '#E4D5C3',
  wash: '#F3E6D4',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Bundled brand fonts, matching the public website:
 *   - display  → Fraunces (the serif used for every heading)
 *   - body     → Outfit (the sans used for body copy and UI)
 * The family strings are the keys registered in `useFonts` (see app/_layout).
 * Weight is baked into the family name, so set `fontFamily` — not `fontWeight`.
 */
export const Fonts = {
  display: {
    semibold: 'Fraunces_600SemiBold',
    bold: 'Fraunces_700Bold',
  },
  body: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
  mono: Platform.select({ ios: 'ui-monospace', web: 'var(--font-mono)', default: 'monospace' }) as string,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
