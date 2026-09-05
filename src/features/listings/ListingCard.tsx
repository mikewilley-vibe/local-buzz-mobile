import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatFreshness,
  formatListingType,
  formatLocation,
  formatSchedule,
} from '@/features/listings/format';
import type { PublicListing } from '@/features/listings/useListings';

export function ListingCard({ listing }: { listing: PublicListing }) {
  const router = useRouter();
  const schedule = formatSchedule(listing);
  const location = formatLocation(listing);
  const freshness = formatFreshness(listing);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.place_name}, view details`}
      onPress={() => router.push({ pathname: '/listing/[id]', params: { id: listing.id } })}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.headerRow}>
          <ThemedText type="smallBold" style={styles.badge}>
            {formatListingType(listing.listing_type)}
          </ThemedText>
          {listing.confirmation_count > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {listing.confirmation_count} confirmed
            </ThemedText>
          )}
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {listing.place_name}
        </ThemedText>

        {location.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {location}
          </ThemedText>
        )}

        {schedule.length > 0 && (
          <ThemedText type="small" style={styles.schedule}>
            {schedule}
          </ThemedText>
        )}

        {listing.description.length > 0 && (
          <ThemedText type="default" style={styles.description} numberOfLines={2}>
            {listing.description}
          </ThemedText>
        )}

        {freshness ? (
          <ThemedText type="small" style={styles.freshness}>
            {freshness}
          </ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  schedule: {
    marginTop: Spacing.one,
  },
  description: {
    marginTop: Spacing.two,
  },
  freshness: {
    marginTop: Spacing.two,
    color: '#3FB27F',
  },
});
