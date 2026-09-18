import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Spacing } from '@/constants/theme';
import { formatListingType, formatLocation, formatTimeRange } from '@/features/listings/format';
import type { PublicListing } from '@/features/listings/useListings';

/** Compact row for the week view — the day is already in the section heading. */
export function WeekListingRow({ listing }: { listing: PublicListing }) {
  const router = useRouter();
  const time = formatTimeRange(listing);
  const location = formatLocation(listing);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.place_name}, view details`}
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedText type="smallBold" style={styles.badge}>
          {formatListingType(listing.listing_type)}
        </ThemedText>
        <ThemedText type="smallBold" numberOfLines={1}>
          {listing.place_name}
        </ThemedText>
        <View style={styles.meta}>
          {time ? (
            <ThemedText type="small" themeColor="textSecondary">
              {time}
            </ThemedText>
          ) : null}
          {location ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {location}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  row: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: BrandColors.line,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.half,
  },
  badge: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    gap: 2,
  },
});
