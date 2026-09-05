// Allowed values mirrored from the DB check constraints on public.listings.
// Keep these in sync with the backend contract.

export const CITIES = [
  'Norfolk',
  'Virginia Beach',
  'Chesapeake',
  'Portsmouth',
  'Hampton',
  'Newport News',
  'Suffolk',
  'Williamsburg',
] as const;
export type City = (typeof CITIES)[number];

export const LISTING_TYPES = [
  { value: 'happy-hour', label: 'Happy Hour' },
  { value: 'food-special', label: 'Food Special' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'music-bingo', label: 'Music Bingo' },
  { value: 'live-music', label: 'Live Music' },
  { value: 'other', label: 'Other' },
] as const;
export type ListingType = (typeof LISTING_TYPES)[number]['value'];

export const DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
] as const;
export type Day = (typeof DAYS)[number]['value'];

// Field limits from the DB constraints / community-insert RLS policy.
export const PLACE_NAME_MAX = 200;
export const DESCRIPTION_MAX = 2000;
export const STREET_ADDRESS_MAX = 200;
export const SOURCE_URL_MAX = 2000;

export const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/; // 24h HH:MM
export const ZIP_RE = /^\d{5}(-\d{4})?$/;
export const HTTP_URL_RE = /^https?:\/\//i;
