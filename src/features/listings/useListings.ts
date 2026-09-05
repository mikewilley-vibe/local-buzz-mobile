import { useCallback, useEffect, useState } from 'react';

import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/** A single row from the public listings boundary (`get_public_listings`). */
export type PublicListing =
  Database['public']['Functions']['get_public_listings']['Returns'][number];

export type ListingsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; listings: PublicListing[] };

async function fetchPublicListings(): Promise<ListingsState> {
  const { data, error } = await supabase.rpc('get_public_listings', {});
  if (error) {
    return { status: 'error', message: error.message };
  }
  return { status: 'success', listings: data ?? [] };
}

/**
 * Loads approved listings from the public boundary RPC. Exposes explicit
 * loading / error / success states plus a `reload` action for retries and
 * pull-to-refresh.
 */
export function useListings() {
  const [state, setState] = useState<ListingsState>({ status: 'loading' });

  // Manual reload (event-driven): show the loading state, then refetch.
  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    setState(await fetchPublicListings());
  }, []);

  // Initial load on mount. State starts as `loading`, so we only apply the
  // resolved result once the async fetch completes.
  useEffect(() => {
    let cancelled = false;
    void fetchPublicListings().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { state, reload } as const;
}

// --- Single listing (detail screen) ----------------------------------------

export type ListingState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notfound' }
  | { status: 'success'; listing: PublicListing };

async function fetchPublicListing(id: string): Promise<ListingState> {
  const { data, error } = await supabase.rpc('get_public_listings', { p_listing_id: id });
  if (error) {
    return { status: 'error', message: error.message };
  }
  const listing = data?.[0];
  if (!listing) {
    return { status: 'notfound' };
  }
  return { status: 'success', listing };
}

/**
 * Loads a single approved listing by id from the public boundary RPC. Used by
 * the detail screen; `reload` refreshes stats after a confirmation.
 */
export function useListing(id: string) {
  const [state, setState] = useState<ListingState>({ status: 'loading' });

  const reload = useCallback(async () => {
    setState(await fetchPublicListing(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicListing(id).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { state, reload } as const;
}
