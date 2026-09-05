import { Linking, Platform } from 'react-native';

import type { PublicListing } from '@/features/listings/useListings';

/** Human-readable location string for a maps search. */
export function directionsQuery(listing: PublicListing): string {
  return [listing.place_name, listing.street_address, listing.city, listing.zip_code]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(', ');
}

/**
 * Opens the platform maps app (Apple Maps on iOS, the geo: handler on Android)
 * searching for this listing's venue, falling back to Google Maps on the web.
 */
export async function openDirections(listing: PublicListing): Promise<void> {
  const query = encodeURIComponent(directionsQuery(listing));
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const nativeUrl =
    Platform.select({
      ios: `http://maps.apple.com/?q=${query}`,
      android: `geo:0,0?q=${query}`,
    }) ?? webUrl;

  const canOpenNative = await Linking.canOpenURL(nativeUrl).catch(() => false);
  await Linking.openURL(canOpenNative ? nativeUrl : webUrl);
}
