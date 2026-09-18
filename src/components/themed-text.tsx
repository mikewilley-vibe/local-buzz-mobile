import { StyleSheet, Text, type TextProps } from 'react-native';

import { BrandColors, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'display'
    | 'eyebrow'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'display' && styles.display,
        type === 'eyebrow' && styles.eyebrow,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Body copy — Outfit, matching the website's sans.
  small: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.body.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontFamily: Fonts.body.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  // Headings — Fraunces serif, matching the website's display type.
  title: {
    fontFamily: Fonts.display.bold,
    fontSize: 48,
    lineHeight: 52,
  },
  display: {
    fontFamily: Fonts.display.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.display.semibold,
    fontSize: 32,
    lineHeight: 40,
  },
  // Small-caps brand/section label, like the website's amber eyebrow.
  eyebrow: {
    fontFamily: Fonts.body.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: BrandColors.amberDeep,
  },
  link: {
    fontFamily: Fonts.body.medium,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: Fonts.body.bold,
    lineHeight: 30,
    fontSize: 14,
    color: BrandColors.amberDeep,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
