import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatListingType } from '@/features/listings/format';
import {
  type ListingFilterState,
  isZipCode,
  uniqueSorted,
} from '@/features/listings/filters';
import type { PublicListing } from '@/features/listings/useListings';

const PRIMARY = BrandColors.amber;

function Chip({
  label,
  selected,
  onPress,
  border,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  border: string;
}) {
  return (
    <ThemedText
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      type="smallBold"
      style={[
        styles.chip,
        { borderColor: selected ? PRIMARY : border },
        selected && styles.chipSelected,
        selected && styles.chipLabelSelected,
      ]}
    >
      {label}
    </ThemedText>
  );
}

export function ListingFilters({
  listings,
  filters,
  onChange,
  showNavigation = true,
}: {
  listings: PublicListing[];
  filters: ListingFilterState;
  onChange: (next: ListingFilterState) => void;
  showNavigation?: boolean;
}) {
  const theme = useTheme();
  const border = theme.backgroundSelected;

  const types = uniqueSorted(listings.map((l) => l.listing_type));
  const cities = uniqueSorted(listings.map((l) => l.city));

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={filters.query}
          onChangeText={(query) => onChange({ ...filters, query })}
          placeholder="Search happy hours, trivia, venues…"
          placeholderTextColor={BrandColors.muted}
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.search, { borderColor: border, color: theme.text }]}
        />
        {showNavigation ? (
          <Link href="/week" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View this week's calendar"
              style={StyleSheet.flatten([styles.sideButton, { borderColor: border }])}
            >
              <ThemedText type="smallBold">Calendar</ThemedText>
            </Pressable>
          </Link>
        ) : null}
        {showNavigation ? (
          <Link href="/map" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View listings on a map"
              style={styles.mapButton}
            >
              <ThemedText type="smallBold" style={styles.mapLabel}>
                Map
              </ThemedText>
            </Pressable>
          </Link>
        ) : null}
      </View>

      <View style={styles.zipRow}>
        <TextInput
          value={filters.zip}
          onChangeText={(zip) => onChange({ ...filters, zip })}
          placeholder="ZIP code"
          accessibilityLabel="Filter by ZIP code"
          placeholderTextColor={BrandColors.muted}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          style={[styles.zipInput, { borderColor: border, color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {filters.zip.trim() && !isZipCode(filters.zip.trim()) ? 'Enter 5 digits or ZIP+4' : 'Optional'}
        </ThemedText>
      </View>

      {types.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <Chip
            label="All types"
            selected={filters.type === null}
            onPress={() => onChange({ ...filters, type: null })}
            border={border}
          />
          {types.map((type) => (
            <Chip
              key={type}
              label={formatListingType(type)}
              selected={filters.type === type}
              onPress={() => onChange({ ...filters, type: filters.type === type ? null : type })}
              border={border}
            />
          ))}
        </ScrollView>
      ) : null}

      {cities.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <Chip
            label="All cities"
            selected={filters.cities.length === 0}
            onPress={() => onChange({ ...filters, cities: [] })}
            border={border}
          />
          {cities.map((city) => (
            <Chip
              key={city}
              label={city}
              selected={filters.cities.includes(city)}
              onPress={() => onChange({
                ...filters,
                cities: filters.cities.includes(city)
                  ? filters.cities.filter((selected) => selected !== city)
                  : [...filters.cities, city],
              })}
              border={border}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  search: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.wash,
  },
  zipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  zipInput: { minHeight: 44, width: 130, borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: Spacing.two, paddingHorizontal: Spacing.three },
  mapButton: {
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: PRIMARY,
  },
  sideButton: {
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  mapLabel: {
    color: BrandColors.ink,
  },
  row: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: BrandColors.wash,
  },
  chipLabelSelected: {
    color: BrandColors.amberDeep,
  },
});
