import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { PublicListing } from '@/features/listings/useListings';

const LISTING_TYPE_LABELS: Record<string, string> = {
  'happy-hour': 'Happy Hour',
  'food-special': 'Food Special',
  trivia: 'Trivia',
  'music-bingo': 'Music Bingo',
  'live-music': 'Live Music',
  other: 'Other',
};

function formatListingType(type: string): string {
  return LISTING_TYPE_LABELS[type] ?? type;
}

function formatDays(days: string[]): string {
  if (!days || days.length === 0) return '';
  return days.map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(' · ');
}

function formatTime(value: string | null): string | null {
  if (!value) return null;
  // Postgres `time` comes back as "HH:MM:SS"; show "HH:MM".
  const [hours, minutes] = value.split(':');
  if (hours === undefined || minutes === undefined) return value;
  const hourNum = Number(hours);
  const suffix = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

function formatSchedule(listing: PublicListing): string {
  const start = formatTime(listing.start_time);
  const end = formatTime(listing.end_time);
  const time = start && end ? `${start} – ${end}` : (start ?? '');
  const days = formatDays(listing.days);
  return [days, time].filter(Boolean).join('  •  ');
}

export function ListingCard({ listing }: { listing: PublicListing }) {
  const schedule = formatSchedule(listing);
  const location = [listing.street_address, listing.city].filter(Boolean).join(', ');

  return (
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
        <ThemedText type="default" style={styles.description}>
          {listing.description}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
});
