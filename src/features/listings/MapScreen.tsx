import { useRouter } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatListingType } from '@/features/listings/format';
import { geocodeListings, type GeocodedListing } from '@/features/listings/geocode';
import { useListings } from '@/features/listings/useListings';

function regionFor(items: GeocodedListing[]): Region {
  const lats = items.map((i) => i.coord.latitude);
  const lngs = items.map((i) => i.coord.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.05),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.05),
  };
}

export function MapScreen() {
  const router = useRouter();
  const { state } = useListings();
  const [geo, setGeo] = useState<{ status: 'loading' | 'done'; items: GeocodedListing[] }>({
    status: 'loading',
    items: [],
  });

  useEffect(() => {
    if (state.status !== 'success') return;
    let cancelled = false;
    void geocodeListings(state.listings).then((items) => {
      if (!cancelled) setGeo({ status: 'done', items });
    });
    return () => {
      cancelled = true;
    };
  }, [state]);

  if (state.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Loading listings…
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
      </Centered>
    );
  }

  if (state.listings.length === 0) {
    return (
      <Centered>
        <ThemedText type="subtitle" style={styles.centerText}>
          Nothing to map yet
        </ThemedText>
      </Centered>
    );
  }

  if (geo.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Placing pins…
        </ThemedText>
      </Centered>
    );
  }

  if (geo.items.length === 0) {
    return (
      <Centered>
        <ThemedText type="subtitle" style={styles.centerText}>
          Couldn’t locate these venues
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Their addresses couldn’t be placed on the map.
        </ThemedText>
      </Centered>
    );
  }

  return (
    <MapView style={styles.map} initialRegion={regionFor(geo.items)}>
      {geo.items.map(({ listing, coord }) => (
        <Marker
          key={listing.id}
          coordinate={coord}
          title={listing.place_name}
          description={formatListingType(listing.listing_type)}
          onCalloutPress={() =>
            router.push({ pathname: '/listing/[id]', params: { id: listing.id } })
          }
        >
          <Callout>
            <ThemedText type="smallBold">{listing.place_name}</ThemedText>
            <ThemedText type="small">{formatListingType(listing.listing_type)} · Details ›</ThemedText>
          </Callout>
        </Marker>
      ))}
    </MapView>
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
  map: {
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
});
