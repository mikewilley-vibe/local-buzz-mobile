import * as Location from 'expo-location';

import { directionsQuery } from '@/lib/directions';
import type { PublicListing } from '@/features/listings/useListings';

export type Coord = { latitude: number; longitude: number };

// Forward-geocoding is network-backed and rate-limited, so cache per address
// for the app session to avoid re-geocoding the same venue repeatedly.
const cache = new Map<string, Coord | null>();

async function geocodeAddress(address: string): Promise<Coord | null> {
  if (cache.has(address)) return cache.get(address) ?? null;

  try {
    const results = await Location.geocodeAsync(address);
    const first = results[0];
    const coord = first ? { latitude: first.latitude, longitude: first.longitude } : null;
    cache.set(address, coord);
    return coord;
  } catch {
    cache.set(address, null);
    return null;
  }
}

export type GeocodedListing = { listing: PublicListing; coord: Coord };

/**
 * Geocodes a set of listings from their addresses (on-device, no API key).
 * Listings whose address can't be resolved are dropped from the result.
 */
export async function geocodeListings(listings: PublicListing[]): Promise<GeocodedListing[]> {
  const settled = await Promise.all(
    listings.map(async (listing) => {
      const address = directionsQuery(listing);
      if (!address) return null;
      const coord = await geocodeAddress(address);
      return coord ? { listing, coord } : null;
    }),
  );

  return settled.filter((item): item is GeocodedListing => item !== null);
}
