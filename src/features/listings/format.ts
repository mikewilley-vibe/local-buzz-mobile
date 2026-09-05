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

export function formatSchedule(listing: PublicListing): string {
  const start = formatTime(listing.start_time);
  const end = formatTime(listing.end_time);
  const time = start && end ? `${start} – ${end}` : (start ?? '');
  const days = formatDays(listing.days);
  return [days, time].filter(Boolean).join('  •  ');
}

export function formatLocation(listing: PublicListing): string {
  return [listing.street_address, listing.city].filter(Boolean).join(', ');
}
