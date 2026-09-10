import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, Spacing } from '@/constants/theme';
import { ListingCard } from '@/features/listings/ListingCard';
import { ListingFilters } from '@/features/listings/ListingFilters';
import { EMPTY_FILTERS, filterListings } from '@/features/listings/filters';
import { useListings } from '@/features/listings/useListings';
import { SUPPORTING_DESCRIPTION, TAGLINE } from '@/lib/brand';

export function ListingsScreen() {
  const { state, reload } = useListings();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Loading
  if (state.status === 'loading') {
    return (
      <CenteredMessage>
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Loading listings…
        </ThemedText>
      </CenteredMessage>
    );
  }

  // Error
  if (state.status === 'error') {
    return (
      <CenteredMessage>
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
      </CenteredMessage>
    );
  }

  // Success — empty
  if (state.listings.length === 0) {
    return (
      <CenteredMessage>
        <ThemedText type="subtitle" style={styles.centerText}>
          No listings yet
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {SUPPORTING_DESCRIPTION} Be the first to add a happy hour, trivia night,
          or food special near you.
        </ThemedText>
        <Link href="/submit" asChild>
          <Pressable accessibilityRole="button" style={styles.retryButton}>
            <ThemedText type="smallBold" style={styles.retryLabel}>
              Submit a listing
            </ThemedText>
          </Pressable>
        </Link>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void reload();
          }}
          style={styles.textButton}
        >
          <ThemedText type="smallBold">Refresh</ThemedText>
        </Pressable>
      </CenteredMessage>
    );
  }

  // Success — with data (filters applied)
  const filtered = filterListings(state.listings, filters);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="subtitle">{TAGLINE}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {SUPPORTING_DESCRIPTION}
              </ThemedText>
              <ListingFilters
                listings={state.listings}
                filters={filters}
                onChange={setFilters}
              />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.noResults}>
              <ThemedText type="subtitle" style={styles.centerText}>
                No matches
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Try a different search, type, or city.
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFilters(EMPTY_FILTERS)}
                style={styles.retryButton}
              >
                <ThemedText type="smallBold" style={styles.retryLabel}>
                  Clear filters
                </ThemedText>
              </Pressable>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                void reload();
              }}
            />
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  noResults: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  retryButton: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: Palette.amber,
  },
  retryLabel: {
    color: Palette.ink,
  },
  textButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
