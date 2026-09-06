# Local Buzz — Mobile

Native (Expo / React Native) client for Local Buzz, built with Expo Router and a
typed Supabase client.

## Stack

- **Expo** (SDK 57) + **TypeScript**
- **Expo Router** (typed routes)
- **Supabase JS** client, typed from the verified `local-buzz-dev` schema

## Backend

This app talks **only** to the isolated development project:

- Project: `local-buzz-dev`
- URL: `https://siddpzhdihmbexvnuawh.supabase.co`

The production project (`vghnfdukyosvvoqrxmok`) must never be used in
development. `src/config/env.ts` throws at startup if it detects the production
ref while `__DEV__` is true.

Data is read through the public boundary RPC `get_public_listings` — the app
never queries the base `listings` table directly. Community submits go to
`listings` as `pending` (RLS + `set_listing_submitter` trigger). Confirm and
report write `listing_confirmations` / `listing_reports` as the signed-in user
(anonymous until they save an email).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the local-buzz-dev values
npm start                    # Expo Go
# or, after an EAS development build is installed:
npx expo start --dev-client
```

Required env vars (see `.env.example`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env.local` is git-ignored and must never be committed.

## Project structure

```
src/
  app/                     # Expo Router routes
    _layout.tsx            # Root Stack + header links
    index.tsx              # Listings
    map.tsx                # Map
    submit.tsx             # Community submit
    account.tsx            # Save email / sign out
    listing/[id].tsx       # Detail + confirm / report / directions
  config/
    env.ts                 # Env loading + production-ref safety guard
  features/
    listings/              # List, filters, map, submit, detail actions
    account/               # Anonymous → email OTP
  lib/
    supabase.ts            # Typed client (persisted session)
    auth.ts                # Anonymous sign-in + stale-session self-heal
    database.types.ts      # Generated types (from local-buzz-dev)
```

## Checks

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
```

## Dev data (seeding)

The `local-buzz-dev` project starts empty, so the app shows the empty state
until listings exist. To populate a few approved listings for testing:

- Run `scripts/seed-dev.sql` against **local-buzz-dev** (Supabase SQL editor, or
  `psql "$LOCAL_BUZZ_DEV_DB_URL" -f scripts/seed-dev.sql`). It upserts by id, so
  it's safe to re-run.
- Remove them again with `scripts/unseed-dev.sql`.

These scripts are **dev-only** and must never be run against production
(`vghnfdukyosvvoqrxmok`). They write `status = 'approved'` + staff-sourced rows,
so they require a privileged (service-role) connection.

## Map pins (on device)

The map geocodes each listing’s address with `expo-location` (Apple’s geocoder
on iOS). Foreground location permission is required — the prompt is only for
placing pins, not tracking.

In Expo Go, open **Map** (blue button beside search) and allow location. If
pins are missing, deny/allow again via Settings → Expo Go → Location.

## Account OTP

Account → enter email → 6-digit code. That upgrades the anonymous user in
place (`updateUser({ email })` then `verifyOtp` type `email_change`).

Until custom SMTP is on, codes come from Supabase’s built-in mail (rate-limited
and easy to land in spam). After Resend SMTP is enabled on **local-buzz-dev
only**, codes should arrive from your verified domain.

## Custom SMTP (Resend) — local-buzz-dev only

Do **not** change production (`vghnfdukyosvvoqrxmok`). Never commit API keys.

1. Verify a sending domain in [Resend](https://resend.com).
2. Create an API key.
3. In the **local-buzz-dev** dashboard:
   [Authentication → Email → SMTP Settings](https://supabase.com/dashboard/project/siddpzhdihmbexvnuawh/auth/smtp)
4. Enable custom SMTP:

   | Field | Value |
   |---|---|
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | Resend API key |
   | Sender email | an address on the verified domain |
   | Sender name | `Local Buzz` |

5. Send a code from the Account screen and confirm it arrives (and that
   Resend’s logs show the message).

## Development build (app icon)

Expo Go keeps its own home-screen icon. The Local Buzz pin/bee icon appears
on a **development build**.

```bash
npx eas-cli login
npx eas-cli build --profile development --platform ios
```

Install the build on the phone, then `npx expo start --dev-client`. iOS needs
an Apple Developer account the first time.

## Roadmap

- **Milestone 1** — read-only listings ✅
- **Milestone 2** — listing detail + native actions (confirm, report, directions) ✅
- **Milestone 3** — filter / search ✅
- **Milestone 4** — map ✅
- **Milestone 5** — submit a listing ✅
- **Milestone 6** — account (email OTP) ✅
- **Milestone 7** — polish (freshness, pull-to-refresh, icon/splash) ✅

Admin / moderation is still web-only. Production SMTP and store builds are
separate from this repo’s development loop.
