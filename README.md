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
never queries the base `listings` table directly.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the local-buzz-dev values
npm start
```

Required env vars (see `.env.example`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env.local` is git-ignored and must never be committed.

## Project structure

```
src/
  app/                     # Expo Router routes
    _layout.tsx            # Root Stack + dev connection check
    index.tsx              # Listings route
  config/
    env.ts                 # Env loading + production-ref safety guard
  features/
    listings/
      useListings.ts       # get_public_listings data hook (loading/error/success)
      ListingCard.tsx      # Single listing card
      ListingsScreen.tsx   # Listings screen (loading/empty/error/success)
  lib/
    supabase.ts            # Typed Supabase client
    connection-check.ts    # Dev-only get_public_listings connectivity check
    database.types.ts      # Generated types (from local-buzz-dev)
  components/              # Themed primitives
  constants/ hooks/        # Theme + color scheme
```

## Checks

```bash
npx tsc --noEmit     # type check
npm run lint         # expo lint
npx expo-doctor      # environment health
```

## Roadmap

This is milestone 1 (read-only listings). Authentication, submissions, maps, and
admin features are intentionally not included yet.
