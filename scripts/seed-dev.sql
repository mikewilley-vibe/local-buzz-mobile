-- Local Buzz 757 — DEV seed data (local-buzz-dev only)
-- =============================================================================
-- Inserts a handful of APPROVED listings so the mobile app has content to test
-- against (list, detail, confirm, report). Safe to run repeatedly: it upserts
-- by fixed id, so re-running refreshes the same rows instead of duplicating.
--
-- SAFETY:
--   * Intended ONLY for the isolated dev project `local-buzz-dev`
--     (ref: siddpzhdihmbexvnuawh). Never run against production
--     (ref: vghnfdukyosvvoqrxmok).
--   * Writes `status = 'approved'` + `is_staff_sourced = true`, which bypasses
--     the community-insert RLS policy, so this must be executed with a
--     privileged role (service role / db owner) — e.g. via the Supabase SQL
--     editor for local-buzz-dev, or:
--       psql "$LOCAL_BUZZ_DEV_DB_URL" -f scripts/seed-dev.sql
--   * All rows use the id prefix 'dddddddd-…' so they are easy to identify and
--     remove (see scripts/unseed-dev.sql).
-- =============================================================================

insert into public.listings
  (id, place_name, city, listing_type, days, start_time, end_time,
   description, source_url, status, confirmation_count, last_verified_at,
   is_staff_sourced, submitted_by, source_checked_at, street_address, zip_code)
values
  ('dddddddd-0000-4000-8000-000000000001', 'Rusty Anchor Tavern', 'Norfolk',
   'happy-hour', array['monday','tuesday','wednesday','thursday','friday'],
   '15:00', '18:00',
   'Half-price oysters and $5 drafts on weekdays. Waterfront patio seating.',
   'https://example.com/rusty-anchor', 'approved', 3, now() - interval '2 days',
   true, null, now(), '12 Harbor St', '23510'),

  ('dddddddd-0000-4000-8000-000000000002', 'The Birch Room', 'Virginia Beach',
   'trivia', array['thursday'], '19:00', '21:00',
   'Team trivia every Thursday with bar-tab prizes for the top three teams.',
   'https://example.com/birch-room', 'approved', 1, now() - interval '5 days',
   true, null, now(), '880 Atlantic Ave', '23451'),

  ('dddddddd-0000-4000-8000-000000000003', 'Harbor Public House', 'Chesapeake',
   'live-music', array['friday','saturday'], '20:00', '23:00',
   'Local bands every weekend, no cover before 8pm.',
   'https://example.com/harbor', 'approved', 0, null,
   true, null, now(), '5 Dock Rd', '23320'),

  ('dddddddd-0000-4000-8000-000000000004', 'Maple & Vine', 'Norfolk',
   'food-special', array['tuesday'], '17:00', '21:00',
   'Taco Tuesday — $2 street tacos and $6 margarita specials all night.',
   'https://example.com/maple-vine', 'approved', 5, now() - interval '1 day',
   true, null, now(), '210 Granby St', '23510'),

  ('dddddddd-0000-4000-8000-000000000005', 'The Lantern', 'Suffolk',
   'music-bingo', array['wednesday'], '19:30', '21:30',
   'Music bingo with the house DJ. Free to play, prizes each round.',
   'https://example.com/lantern', 'approved', 0, null,
   true, null, now(), '44 Main St', '23434')

on conflict (id) do update set
  place_name         = excluded.place_name,
  city               = excluded.city,
  listing_type       = excluded.listing_type,
  days               = excluded.days,
  start_time         = excluded.start_time,
  end_time           = excluded.end_time,
  description        = excluded.description,
  source_url         = excluded.source_url,
  status             = excluded.status,
  confirmation_count = excluded.confirmation_count,
  last_verified_at   = excluded.last_verified_at,
  is_staff_sourced   = excluded.is_staff_sourced,
  source_checked_at  = excluded.source_checked_at,
  street_address     = excluded.street_address,
  zip_code           = excluded.zip_code;
