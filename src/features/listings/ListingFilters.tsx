import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatListingType } from '@/features/listings/format';
import { type ListingFilterState, uniqueSorted } from '@/features/listings/filters';
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

/**
 * Primary browsing controls: filter by City and by Type. Search and ZIP inputs
 * were removed in favor of city/day browsing; the underlying filter state still
 * carries `query`/`zip` (kept empty) so results logic is unchanged.
 */
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
      {showNavigation ? (
        <View style={styles.navRow}>
          <Link href="/week" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View this week's calendar"
              style={StyleSheet.flatten([styles.sideButton, { borderColor: border }])}
            >
              <ThemedText type="smallBold">Calendar</ThemedText>
            </Pressable>
          </Link>
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
        </View>
      ) : null}

      {cities.length > 0 ? (
        <View style={styles.group}>
          <ThemedText type="smallBold">City</ThemedText>
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
        </View>
      ) : null}

      {types.length > 0 ? (
        <View style={styles.group}>
          <ThemedText type="smallBold">Type</ThemedText>
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
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  group: {
    gap: Spacing.two,
  },
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
