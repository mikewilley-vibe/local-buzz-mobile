import type { ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ListingCard } from '@/features/listings/ListingCard';
import { useListings } from '@/features/listings/useListings';

export function ListingsScreen() {
  const { state, reload } = useListings();

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
          Approved happy hours and specials will appear here.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void reload();
          }}
          style={styles.retryButton}
        >
          <ThemedText type="smallBold" style={styles.retryLabel}>
            Refresh
          </ThemedText>
        </Pressable>
      </CenteredMessage>
    );
  }

  // Success — with data
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <FlatList
          data={state.listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={styles.listContent}
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
