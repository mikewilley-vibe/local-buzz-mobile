import type { PublicListing } from '@/features/listings/useListings';

const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type DayBucket = {
  weekday: (typeof WEEKDAY_KEYS)[number];
  /** 0 = Monday of the current Eastern week */
  offset: number;
  heading: string;
  dayNumber: number;
  isToday: boolean;
  listings: PublicListing[];
};

function easternDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const number = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: number('year'), month: number('month'), day: number('day') };
}

function headingFor(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function timeValue(listing: PublicListing): string {
  return listing.start_time ?? '99:99';
}

function listingRunsOn(listing: PublicListing, weekday: string): boolean {
  return (listing.days ?? []).some((day) => day.toLowerCase() === weekday);
}

/** Current Monday–Sunday week in Eastern time, matching the public calendar. */
export function weekAhead(listings: PublicListing[], from: Date = new Date()): DayBucket[] {
  const today = easternDateParts(from);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const mondayOffset = (new Date(todayUtc).getUTCDay() + 6) % 7;

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(todayUtc + (offset - mondayOffset) * 86_400_000);
    const weekday = WEEKDAY_KEYS[date.getUTCDay()];
    const dayListings = listings
      .filter((listing) => listingRunsOn(listing, weekday))
      .slice()
      .sort((a, b) => {
        const byTime = timeValue(a).localeCompare(timeValue(b));
        if (byTime !== 0) return byTime;
        return a.place_name.localeCompare(b.place_name);
      });

    return {
      weekday,
      offset,
      heading: headingFor(date),
      dayNumber: date.getUTCDate(),
      isToday: date.getTime() === todayUtc,
      listings: dayListings,
    };
  });
}
