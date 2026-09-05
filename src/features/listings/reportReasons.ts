/**
 * Report reasons — mirrors the web app's contract (`src/lib/types.ts`) and the
 * values accepted by the `listing_reports` table.
 */
export const REPORT_REASONS = [
  'deal_ended',
  'wrong_schedule',
  'wrong_details',
  'venue_closed',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  deal_ended: 'This deal ended',
  wrong_schedule: 'The days or times are wrong',
  wrong_details: 'Some details are wrong',
  venue_closed: 'This venue closed',
  other: 'Other',
};

export function isReportReason(value: string): value is ReportReason {
  return (REPORT_REASONS as readonly string[]).includes(value);
}
