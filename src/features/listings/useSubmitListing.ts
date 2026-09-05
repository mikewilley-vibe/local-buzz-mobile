import { useCallback, useState } from 'react';

import { ensureAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { City, Day, ListingType } from '@/features/listings/constants';

const SUBMIT_ERROR = 'Couldn’t submit that listing. Please try again.';

/** Only the columns a community submitter is allowed to insert. */
export type NewListingInput = {
  place_name: string;
  description: string;
  listing_type: ListingType;
  city: City;
  days: Day[];
  start_time: string | null;
  end_time: string | null;
  street_address: string | null;
  zip_code: string | null;
  source_url: string | null;
};

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useSubmitListing() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (input: NewListingInput): Promise<SubmitStatus> => {
    setError(null);
    setStatus('submitting');

    const userId = await ensureAnonymousUser();
    if (!userId) {
      setStatus('error');
      setError(SUBMIT_ERROR);
      return 'error';
    }

    // Insert only the community-insertable columns. status/submitted_by/counters
    // are set by DB defaults and the set_listing_submitter trigger, per the
    // "Authenticated users can submit pending listings" RLS policy.
    const { error: insertError } = await supabase.from('listings').insert(input);

    if (insertError) {
      setStatus('error');
      setError(SUBMIT_ERROR);
      return 'error';
    }

    setStatus('success');
    return 'success';
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, submit, reset } as const;
}
