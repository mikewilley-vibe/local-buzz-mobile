import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, Spacing } from '@/constants/theme';
import { WeekListingRow } from '@/features/listings/WeekListingRow';
import { useListings } from '@/features/listings/useListings';
import { weekAhead } from '@/features/listings/weekAhead';

export function WeekAheadScreen() {
  const { state, reload } = useListings();

  if (state.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Loading this week…
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

  const days = weekAhead(state.listings);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: 'This week' }} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                void reload();
              }}
            />
          }
        >
          <ThemedText type="small" themeColor="textSecondary">
            Specials for the next seven days, grouped by when they run.
          </ThemedText>

          {days.map((day) => (
            <View key={`${day.weekday}-${day.offset}`} style={styles.section}>
              <ThemedText type="smallBold" style={styles.heading}>
                {day.heading}
              </ThemedText>
              {day.listings.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  No specials listed
                </ThemedText>
              ) : (
                <View style={styles.stack}>
                  {day.listings.map((listing) => (
                    <WeekListingRow key={listing.id} listing={listing} />
                  ))}
                </View>
              )}
            </View>
          ))}
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
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  stack: {
    gap: Spacing.two,
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
    backgroundColor: Palette.amber,
  },
  retryLabel: {
    color: Palette.ink,
  },
});
