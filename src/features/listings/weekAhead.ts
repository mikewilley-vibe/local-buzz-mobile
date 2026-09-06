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
  /** 0 = today */
  offset: number;
  heading: string;
  listings: PublicListing[];
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + n);
  return next;
}

function weekdayKey(d: Date): (typeof WEEKDAY_KEYS)[number] {
  return WEEKDAY_KEYS[d.getDay()];
}

function headingFor(date: Date, offset: number): string {
  const calendar = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  if (offset === 0) return `Today · ${calendar}`;
  if (offset === 1) return `Tomorrow · ${calendar}`;
  return calendar;
}

function timeValue(listing: PublicListing): string {
  return listing.start_time ?? '99:99';
}

function listingRunsOn(listing: PublicListing, weekday: string): boolean {
  return (listing.days ?? []).some((day) => day.toLowerCase() === weekday);
}

/** Next 7 local calendar days, each with listings whose `days` include that weekday. */
export function weekAhead(listings: PublicListing[], from: Date = new Date()): DayBucket[] {
  const start = startOfLocalDay(from);

  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(start, offset);
    const weekday = weekdayKey(date);
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
      heading: headingFor(date, offset),
      listings: dayListings,
    };
  });
}
