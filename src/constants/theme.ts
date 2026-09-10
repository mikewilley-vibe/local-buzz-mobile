/**
 * HapsHere color tokens — aligned with the web app and the official icon
 * (navy field, amber/orange mark, cream paper, dark ink).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  navy: '#0A1B39',
  ink: '#1C1917',
  paper: '#FFFAF3',
  wash: '#F3E6D4',
  background: '#F6EFE4',
  muted: '#6F6358',
  line: '#E4D5C3',
  amber: '#E8A54B',
  amberHover: '#F0B56A',
  amberDeep: '#9A5B12',
  primaryWash: 'rgba(232, 165, 75, 0.18)',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.background,
    backgroundElement: Palette.paper,
    backgroundSelected: Palette.line,
    textSecondary: Palette.muted,
    primary: Palette.amber,
    primaryDeep: Palette.amberDeep,
    onPrimary: Palette.ink,
    primaryWash: Palette.primaryWash,
  },
  dark: {
    text: Palette.paper,
    background: Palette.navy,
    backgroundElement: '#122445',
    backgroundSelected: '#1A3358',
    textSecondary: '#C4B5A5',
    primary: Palette.amber,
    primaryDeep: Palette.amberHover,
    onPrimary: Palette.ink,
    primaryWash: 'rgba(232, 165, 75, 0.22)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
