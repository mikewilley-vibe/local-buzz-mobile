import { Link } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Spacing } from '@/constants/theme';
import { ListingFilters } from '@/features/listings/ListingFilters';
import { useListingFilters } from '@/features/listings/ListingFiltersContext';
import { WeekListingRow } from '@/features/listings/WeekListingRow';
import { filterListings } from '@/features/listings/filters';
import { useListings } from '@/features/listings/useListings';
import { type DayBucket, weekAhead } from '@/features/listings/weekAhead';

type CalendarView = 'agenda' | 'week';

export function WeekAheadScreen() {
  const { state, reload } = useListings();
  const { filters, setFilters } = useListingFilters();
  const [selectedDay, setSelectedDay] = useState<DayBucket['weekday'] | 'today' | null>(null);
  const [view, setView] = useState<CalendarView>('agenda');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refreshDate = () => setNow(new Date());
    const interval = setInterval(refreshDate, 60_000);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshDate();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  if (state.status === 'loading') {
    return <Centered><ActivityIndicator size="large" color={BrandColors.amberDeep} /></Centered>;
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <ThemedText type="subtitle" style={styles.centerText}>Something went wrong</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>{state.message}</ThemedText>
        <Pressable accessibilityRole="button" onPress={() => void reload()} style={styles.primaryButton}>
          <ThemedText type="smallBold">Try again</ThemedText>
        </Pressable>
      </Centered>
    );
  }

  const filteredListings = filterListings(state.listings, filters);
  const days = weekAhead(filteredListings, now);
  const today = days.find((day) => day.isToday) ?? days[0];
  const effectiveDay = selectedDay === 'today' ? today.weekday : selectedDay;
  const visibleDays = effectiveDay ? days.filter((day) => day.weekday === effectiveDay) : days;
  const uniqueListings = new Set(visibleDays.flatMap((day) => day.listings.map((listing) => listing.id)));
  const count = uniqueListings.size;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => void reload()} />}
        >
          <View style={styles.intro}>
            <ThemedText type="subtitle" style={styles.title}>What’s going on this week?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Happy hours, trivia, and local happenings around Hampton Roads.
            </ThemedText>
            <View style={styles.actionRow}>
              <Link href="/listings" asChild>
                <Pressable accessibilityRole="button" style={styles.primaryButton}>
                  <ThemedText type="smallBold">Browse listings</ThemedText>
                </Pressable>
              </Link>
              <Link href="/map" asChild>
                <Pressable accessibilityRole="button" style={styles.secondaryButton}>
                  <ThemedText type="smallBold">Map</ThemedText>
                </Pressable>
              </Link>
            </View>
          </View>

          <ListingFilters
            listings={state.listings}
            filters={filters}
            onChange={setFilters}
            showNavigation={false}
          />

          <View style={styles.toolbarSection}>
            <ThemedText type="smallBold">Day</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <CalendarChip label="All week" selected={selectedDay === null} onPress={() => setSelectedDay(null)} />
              <CalendarChip label="Today" selected={effectiveDay === today.weekday} onPress={() => setSelectedDay('today')} />
              {days.map((day) => (
                <CalendarChip
                  key={day.weekday}
                  label={day.weekday.slice(0, 3) + ' ' + day.dayNumber}
                  accessibilityLabel={day.heading}
                  selected={effectiveDay === day.weekday}
                  onPress={() => setSelectedDay(day.weekday)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.toolbarSection}>
            <ThemedText type="smallBold">View</ThemedText>
            <View style={styles.chips}>
              <CalendarChip label="Agenda" selected={view === 'agenda'} onPress={() => setView('agenda')} />
              <CalendarChip label="Week" selected={view === 'week'} onPress={() => setView('week')} />
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            {count} {count === 1 ? 'listing' : 'listings'} {effectiveDay ? 'for ' + visibleDays[0]?.heading : 'this week'}
          </ThemedText>
          {filteredListings.length === 0 && state.listings.length > 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyFilterState}>
              <ThemedText type="smallBold">No listings match these filters.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Try another city, type, or ZIP code.
              </ThemedText>
            </ThemedView>
          ) : null}

          {view === 'agenda' ? (
            <View style={styles.agenda}>
              {visibleDays.map((day) => <CalendarDay key={day.weekday} day={day} compact={false} />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekGrid}>
              {visibleDays.map((day) => <CalendarDay key={day.weekday} day={day} compact />)}
            </ScrollView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function CalendarDay({ day, compact }: { day: DayBucket; compact: boolean }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.dayCard, compact && styles.weekColumn]}>
      <View style={[styles.dayHeader, compact && styles.weekHeader, day.isToday && styles.todayHeader]}>
        <ThemedText type="smallBold" style={compact ? styles.centerText : styles.dayHeading}>
          {compact ? day.weekday.slice(0, 3) + ' ' + day.dayNumber : day.heading}
        </ThemedText>
        {day.isToday ? <ThemedText type="smallBold">Today</ThemedText> : null}
      </View>
      <View style={styles.dayListings}>
        {day.listings.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">{compact ? '—' : 'No listings this day.'}</ThemedText>
        ) : day.listings.map((listing) => <WeekListingRow key={listing.id} listing={listing} />)}
      </View>
    </ThemedView>
  );
}

function CalendarChip({ label, accessibilityLabel, selected, onPress }: {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
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
  flex: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  intro: { gap: Spacing.two },
  title: { fontSize: 30, lineHeight: 36 },
  actionRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  primaryButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 999, paddingHorizontal: Spacing.three, backgroundColor: BrandColors.amber },
  secondaryButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 999, paddingHorizontal: Spacing.three, borderWidth: 1, borderColor: BrandColors.line },
  toolbarSection: { gap: Spacing.two },
  chips: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  chip: { minHeight: 44, paddingHorizontal: Spacing.three, justifyContent: 'center', borderRadius: 999 },
  chipSelected: { backgroundColor: BrandColors.amber },
  agenda: { gap: Spacing.three },
  emptyFilterState: { padding: Spacing.three, gap: Spacing.one, borderRadius: Spacing.three, borderWidth: 1, borderColor: BrandColors.line },
  dayCard: { borderWidth: 1, borderColor: BrandColors.line, borderRadius: Spacing.three, overflow: 'hidden' },
  dayHeader: { minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, borderBottomWidth: 1, borderBottomColor: BrandColors.line },
  todayHeader: { backgroundColor: BrandColors.amber },
  dayHeading: { fontSize: 19, lineHeight: 25 },
  dayListings: { padding: Spacing.two, gap: Spacing.two },
  weekGrid: { gap: Spacing.two },
  weekColumn: { width: 168, minHeight: 260 },
  weekHeader: { minHeight: 58, flexDirection: 'column', justifyContent: 'center', gap: Spacing.half },
  centered: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  centerText: { textAlign: 'center' },
});
