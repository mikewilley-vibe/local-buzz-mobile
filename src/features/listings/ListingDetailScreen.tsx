import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ListingActions } from '@/features/listings/ListingActions';
import { formatListingType, formatLocation, formatSchedule } from '@/features/listings/format';
import { useListing } from '@/features/listings/useListings';

export function ListingDetailScreen({ id }: { id: string }) {
  const { state, reload } = useListing(id);

  if (state.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Loading listing…
        </ThemedText>
      </Centered>
    );
  }

  if (state.status === 'notfound') {
    return (
      <Centered>
        <ThemedText type="subtitle" style={styles.centerText}>
          Listing not found
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          This listing may no longer be available.
        </ThemedText>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <ThemedText type="subtitle" style={styles.centerText}>
          Something went wrong
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {state.message}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void reload();
          }}
          style={styles.retryButton}
        >
          <ThemedText type="smallBold" style={styles.retryLabel}>
            Try again
          </ThemedText>
        </Pressable>
      </Centered>
    );
  }

  const listing = state.listing;
  const schedule = formatSchedule(listing);
  const location = formatLocation(listing);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: listing.place_name }} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.badge}>
              {formatListingType(listing.listing_type)}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {listing.place_name}
            </ThemedText>
            {location.length > 0 ? (
              <ThemedText type="default" themeColor="textSecondary">
                {location}
              </ThemedText>
            ) : null}
            {schedule.length > 0 ? (
              <ThemedText type="default" style={styles.schedule}>
                {schedule}
              </ThemedText>
            ) : null}
          </View>

          {listing.description.length > 0 ? (
            <ThemedText type="default">{listing.description}</ThemedText>
          ) : null}

          <ListingActions listing={listing} onConfirmed={() => void reload()} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={[styles.flex, styles.centered]}>{children}</SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  badge: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
  },
  schedule: {
    marginTop: Spacing.one,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#208AEF',
  },
  retryLabel: {
    color: '#ffffff',
  },
});
