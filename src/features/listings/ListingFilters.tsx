import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatListingType } from '@/features/listings/format';
import {
  type ListingFilterState,
  uniqueSorted,
} from '@/features/listings/filters';
import type { PublicListing } from '@/features/listings/useListings';

const PRIMARY = '#208AEF';

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
}: {
  listings: PublicListing[];
  filters: ListingFilterState;
  onChange: (next: ListingFilterState) => void;
}) {
  const theme = useTheme();
  const border = theme.backgroundSelected;

  const types = uniqueSorted(listings.map((l) => l.listing_type));
  const cities = uniqueSorted(listings.map((l) => l.city));

  return (
    <View style={styles.container}>
      <TextInput
        value={filters.query}
        onChangeText={(query) => onChange({ ...filters, query })}
        placeholder="Search happy hours, trivia, venues…"
        placeholderTextColor="#8A8F98"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.search, { borderColor: border, color: theme.text }]}
      />

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
            selected={filters.city === null}
            onPress={() => onChange({ ...filters, city: null })}
            border={border}
          />
          {cities.map((city) => (
            <Chip
              key={city}
              label={city}
              selected={filters.city === city}
              onPress={() => onChange({ ...filters, city: filters.city === city ? null : city })}
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
  search: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
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
    backgroundColor: 'rgba(32,138,239,0.15)',
  },
  chipLabelSelected: {
    color: PRIMARY,
  },
});
