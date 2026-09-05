-- Local Buzz — remove DEV seed data (local-buzz-dev only)
-- =============================================================================
-- Deletes the rows created by scripts/seed-dev.sql. Related confirmations and
-- reports are removed automatically via ON DELETE CASCADE.
--
-- SAFETY: only for the isolated dev project `local-buzz-dev`
-- (ref: siddpzhdihmbexvnuawh). Never run against production.
-- =============================================================================

delete from public.listings
where id like 'dddddddd-0000-4000-8000-%';
