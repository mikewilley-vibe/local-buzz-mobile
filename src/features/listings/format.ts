import type { PublicListing } from '@/features/listings/useListings';

const LISTING_TYPE_LABELS: Record<string, string> = {
  'happy-hour': 'Happy Hour',
  'food-special': 'Food Special',
  trivia: 'Trivia',
  'music-bingo': 'Music Bingo',
  'live-music': 'Live Music',
  other: 'Other',
};

export function formatListingType(type: string): string {
  return LISTING_TYPE_LABELS[type] ?? type;
}

export function formatDays(days: string[]): string {
  if (!days || days.length === 0) return '';
  return days.map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(' · ');
}

export function formatTime(value: string | null): string | null {
  if (!value) return null;
  // Postgres `time` comes back as "HH:MM:SS"; show "HH:MM".
  const [hours, minutes] = value.split(':');
  if (hours === undefined || minutes === undefined) return value;
  const hourNum = Number(hours);
  const suffix = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function formatTimeRange(listing: PublicListing): string {
  const start = formatTime(listing.start_time);
  const end = formatTime(listing.end_time);
  if (start && end) return `${start} – ${end}`;
  return start ?? '';
}

export function formatSchedule(listing: PublicListing): string {
  const time = formatTimeRange(listing);
  const days = formatDays(listing.days);
  return [days, time].filter(Boolean).join('  •  ');
}

export function formatLocation(listing: PublicListing): string {
  return [listing.street_address, listing.city].filter(Boolean).join(', ');
}

/** Human-friendly "time ago" for an ISO timestamp, or null if unparseable. */
export function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(diffMs / 3600000);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(diffMs / 86400000);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/** Short freshness label from `last_verified_at`, e.g. "Verified 3 days ago". */
export function formatFreshness(listing: PublicListing): string | null {
  const rel = relativeTime(listing.last_verified_at);
  return rel ? `Verified ${rel}` : null;
}
