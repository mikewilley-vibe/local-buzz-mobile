import { useCallback, useEffect, useState } from 'react';

import { ensureAnonymousUser, getCurrentUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { ReportReason } from '@/features/listings/reportReasons';

const CONFIRM_ERROR = 'Couldn’t save that confirmation. Please try again.';
const REPORT_ERROR = 'Couldn’t send that report. Please try again.';
const UNIQUE_VIOLATION = '23505';

export type ConfirmStatus =
  | 'checking' // looking up whether this user already confirmed
  | 'ready' // can confirm
  | 'saving' // insert in flight
  | 'confirmed' // just confirmed
  | 'already' // previously confirmed
  | 'error';

export type ReportStatus =
  | 'checking'
  | 'ready'
  | 'submitting'
  | 'submitted' // just reported
  | 'already' // previously reported
  | 'error';

function errorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code?: unknown }).code ?? '');
  }
  return null;
}

/**
 * Drives the Confirm and Report actions for a single listing.
 *
 * On mount it checks (without forcing a sign-in) whether the current user has
 * already confirmed or reported this listing. The actions themselves lazily
 * create a persisted anonymous session via `ensureAnonymousUser()`.
 *
 * `onConfirmed` is invoked after a successful (or duplicate) confirmation so the
 * detail screen can refresh the confirmation count and "last verified" date.
 */
export function useListingActions(
  listingId: string,
  options?: { onConfirmed?: () => void },
) {
  const onConfirmed = options?.onConfirmed;

  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>('checking');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('checking');
  const [reportError, setReportError] = useState<string | null>(null);

  // Check existing confirmation/report for the current user (no sign-in).
  useEffect(() => {
    let cancelled = false;

    async function checkExisting() {
      const userId = await getCurrentUserId();
      if (cancelled) return;

      if (!userId) {
        setConfirmStatus('ready');
        setReportStatus('ready');
        return;
      }

      const [confirmation, report] = await Promise.all([
        supabase
          .from('listing_confirmations')
          .select('listing_id')
          .eq('listing_id', listingId)
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('listing_reports')
          .select('listing_id')
          .eq('listing_id', listingId)
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setConfirmStatus(confirmation.data ? 'already' : 'ready');
      setReportStatus(report.data ? 'already' : 'ready');
    }

    void checkExisting();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const confirm = useCallback(async () => {
    setConfirmError(null);
    setConfirmStatus('saving');

    const userId = await ensureAnonymousUser();
    if (!userId) {
      setConfirmStatus('ready');
      setConfirmError(CONFIRM_ERROR);
      return;
    }

    const { error } = await supabase
      .from('listing_confirmations')
      .insert({ listing_id: listingId, user_id: userId });

    if (error) {
      if (errorCode(error) === UNIQUE_VIOLATION) {
        setConfirmStatus('already');
        onConfirmed?.();
        return;
      }
      setConfirmStatus('ready');
      setConfirmError(CONFIRM_ERROR);
      return;
    }

    setConfirmStatus('confirmed');
    onConfirmed?.();
  }, [listingId, onConfirmed]);

  const submitReport = useCallback(
    async (reason: ReportReason, note: string): Promise<ReportStatus> => {
      setReportError(null);
      setReportStatus('submitting');

      const userId = await ensureAnonymousUser();
      if (!userId) {
        setReportStatus('ready');
        setReportError(REPORT_ERROR);
        return 'error';
      }

      const trimmed = note.trim();
      const { error } = await supabase.from('listing_reports').insert({
        listing_id: listingId,
        user_id: userId,
        reason,
        note: trimmed.length > 0 ? trimmed : null,
        status: 'pending',
      });

      if (error) {
        if (errorCode(error) === UNIQUE_VIOLATION) {
          setReportStatus('already');
          return 'already';
        }
        setReportStatus('ready');
        setReportError(REPORT_ERROR);
        return 'error';
      }

      setReportStatus('submitted');
      return 'submitted';
    },
    [listingId],
  );

  return {
    confirmStatus,
    confirmError,
    confirm,
    reportStatus,
    reportError,
    submitReport,
  } as const;
}
