import type { PublicListing } from '@/features/listings/useListings';

export type ListingFilterState = {
  /** Free-text query matched against name, description, city, address. */
  query: string;
  /** Exact `listing_type` to match, or null for all. */
  type: string | null;
  /** Selected cities, or an empty list for all. */
  cities: string[];
  /** 5-digit ZIP or ZIP+4. A partial entry is not applied until valid. */
  zip: string;
};

export const EMPTY_FILTERS: ListingFilterState = { query: '', type: null, cities: [], zip: '' };

export function hasActiveFilters(f: ListingFilterState): boolean {
  return f.query.trim().length > 0 || f.type !== null || f.cities.length > 0 || f.zip.trim().length > 0;
}

export function isZipCode(value: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(value);
}

export function listingMatchesZipFilter(listingZip: string | null, filterZip: string): boolean {
  const stored = listingZip?.trim() ?? '';
  if (!isZipCode(stored) || !isZipCode(filterZip)) return false;
  return filterZip.length === 5
    ? stored === filterZip || stored.startsWith(filterZip + '-')
    : stored === filterZip;
}

/** Distinct, sorted non-empty values. */
export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v?.trim()).filter((v): v is string => !!v))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function filterListings(
  listings: PublicListing[],
  filters: ListingFilterState,
): PublicListing[] {
  const query = filters.query.trim().toLowerCase();
  const zip = filters.zip.trim();
  const activeZip = isZipCode(zip) ? zip : null;

  return listings.filter((listing) => {
    if (filters.type && listing.listing_type !== filters.type) return false;
    if (filters.cities.length > 0 && !filters.cities.includes(listing.city)) return false;
    if (activeZip && !listingMatchesZipFilter(listing.zip_code, activeZip)) return false;

    if (query.length > 0) {
      const haystack = [
        listing.place_name,
        listing.description,
        listing.city,
        listing.street_address,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}
