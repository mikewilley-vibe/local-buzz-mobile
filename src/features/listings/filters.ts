import type { PublicListing } from '@/features/listings/useListings';

export type ListingFilterState = {
  /** Free-text query matched against name, description, city, address. */
  query: string;
  /** Exact `listing_type` to match, or null for all. */
  type: string | null;
  /** Exact `city` to match, or null for all. */
  city: string | null;
};

export const EMPTY_FILTERS: ListingFilterState = { query: '', type: null, city: null };

export function hasActiveFilters(f: ListingFilterState): boolean {
  return f.query.trim().length > 0 || f.type !== null || f.city !== null;
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

  return listings.filter((listing) => {
    if (filters.type && listing.listing_type !== filters.type) return false;
    if (filters.city && listing.city !== filters.city) return false;

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
