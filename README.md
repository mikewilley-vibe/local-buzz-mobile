# Local Buzz 757 — Mobile

Native (Expo / React Native) client for **Local Buzz 757**, built with Expo
Router and a typed Supabase client. The GitHub repository remains
`local-buzz-mobile`.

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
    auth/callback.tsx      # Auth email deep-link landing
    listing/[id].tsx       # Detail + confirm / report / directions
  config/
    env.ts                 # Env loading + production-ref safety guard
  features/
    listings/              # List, filters, map, submit, detail actions
    account/               # Anonymous → email OTP
  hooks/
    use-auth-linking.ts    # Incoming Auth URLs → session + Account
  lib/
    supabase.ts            # Typed client (persisted session)
    auth.ts                # Anonymous sign-in + stale-session self-heal
    auth-url.ts            # Parse / rewrite Auth callback URLs
    auth-linking.ts        # emailRedirectTo + setSession / exchangeCode
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

`updateUser` also sets `emailRedirectTo` to `Linking.createURL('auth/callback')`
so a confirmation / magic-style link in the email opens this app. Incoming URLs
are handled in `useAuthLinking`: PKCE `code`, implicit tokens, or `token_hash`
establish the session; a code-only email still lands on Account for the OTP.

Until custom SMTP is on, codes come from Supabase’s built-in mail (rate-limited
and easy to land in spam). After Resend SMTP is enabled on **local-buzz-dev
only**, codes should arrive from your verified domain.

## Auth email deep links

Custom scheme: `localbuzzmobile` (already in `app.json`). Callback path:
`/auth/callback`.

| Client | `emailRedirectTo` from `Linking.createURL` |
|---|---|
| Expo Go | `exp://<lan-ip>:8081/--/auth/callback` (changes with the packager) |
| Dev / production build | `localbuzzmobile://auth/callback` |
| Web | `https://<host>/auth/callback` |

Expo Go does **not** open `localbuzzmobile://…`. Use the `exp://` URL the
packager prints, or a development build for a stable custom-scheme test.
Incoming-link support in Expo Go is limited — prefer a [development
build](#development-build-app-icon) when verifying email taps on a device.

### Test

**Expo Go** (packager must be running):

```bash
npx uri-scheme open "exp://127.0.0.1:8081/--/auth/callback" --ios
# tokens present (session should apply, then Account):
npx uri-scheme open "exp://127.0.0.1:8081/--/auth/callback?code=TEST_CODE" --ios
```

**Development build:**

```bash
npx expo start --dev-client
npx uri-scheme open "localbuzzmobile://auth/callback" --ios
```

Then: Account → send a code from **local-buzz-dev** → tap the email link (or
enter the 6-digit code). After a successful link, Account should show the saved
email.

### Supabase redirect URLs (local-buzz-dev only)

[Authentication → URL Configuration](https://supabase.com/dashboard/project/siddpzhdihmbexvnuawh/auth/url-configuration)
on **local-buzz-dev** (`siddpzhdihmbexvnuawh`). Do **not** change production
(`vghnfdukyosvvoqrxmok`).

Add if missing:

- `localbuzzmobile://**`
- `exp://**` (Expo Go)
- `http://localhost:8081/**` (Expo web)
- Existing site / localhost HTTPS patterns (`https://localbuzzmobile.app/**`, www)

Site URL can stay `https://localbuzzmobile.app`.

### Universal Links / App Links (manual)

`app.json` already lists `ios.associatedDomains` and Android `intentFilters`
for `https://localbuzzmobile.app/auth`. Those only open the native app after:

1. A **development or production build** (Expo Go cannot claim the domain).
2. Hosted association files on the apex, HTTPS, no redirect, correct
   `Content-Type`:
   - `https://localbuzzmobile.app/.well-known/apple-app-site-association`
   - `https://localbuzzmobile.app/.well-known/assetlinks.json`
3. Apple Team ID + bundle `com.mikewilley.localbuzz` in the AASA; Android
   package + signing-cert SHA-256 in `assetlinks.json` (`eas credentials -p android`).
4. A working web deploy. The Vercel project on `localbuzzmobile.app` currently
   has little Expo web output (apex often 500), so AASA/assetlinks cannot be
   served from this app until that host is fixed or the files are hosted
   elsewhere.

Until those files are live, emailed **https** links stay in the browser;
custom-scheme / `exp://` redirects still open the app.

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
   | Sender name | `Local Buzz 757` |

5. Send a code from the Account screen and confirm it arrives (and that
   Resend’s logs show the message).

## Development build (app icon)

Expo Go keeps its own home-screen icon. The Local Buzz 757 gold pin-and-bee
icon appears on a **development or production build**.

```bash
npx eas-cli login
npx eas-cli build --profile development --platform ios
```

Install the build on the phone, then `npx expo start --dev-client`. iOS needs
an Apple Developer account the first time.

## TestFlight (iOS production)

Home-screen and in-app display name is **Local Buzz 757**. Bundle id, Expo slug,
URL scheme, and Supabase wiring are unchanged.

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

`eas submit --platform ios --profile production` is equivalent. The production
profile auto-increments the iOS build number (`cli.appVersionSource: remote`)
and submits to App Store Connect app `6810269202`.

See `docs/app-store-release.md` for the smoke test and App Store checklist.

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
