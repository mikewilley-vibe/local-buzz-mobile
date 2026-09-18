# Local Buzz 757 iOS release checklist

Last audited: 2026-09-18

## Current status

- Customer-facing product name is **Local Buzz 757**.
- Draft PR #2 (`cursor/rebrand-hapshere`) rebranded to HapsHere and is
  superseded. Do not merge it.
- Existing Local Buzz pin/bee icons and the current blue splash remain.
- App Store Connect app id `6810269202` is wired in `eas.json` for iOS submit.
- Production EAS builds auto-increment the iOS build number
  (`cli.appVersionSource: remote`).
- A TestFlight build from this branch should be treated as a naming/config
  check. Confirm which Supabase backend the EAS `production` environment
  points at before a public release.

Internal infrastructure is unchanged: GitHub repo `local-buzz-mobile`, Expo
slug `local-buzz-mobile`, bundle/package id `com.mikewilley.localbuzz`, URL
scheme `localbuzzmobile`, associated domains, and Supabase project wiring.

## TestFlight build and submit

From a machine signed into EAS and Apple Developer:

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Equivalent submit command:

```bash
eas submit --platform ios --profile production
```

The production profile sets `autoIncrement: true` and submit uses
`ascAppId` `6810269202`. Do not run these from CI unless credentials are
already available non-interactively.

## App Store metadata draft

### Promotional text

Find the good stuff happening nearby—from happy hours and food specials to
trivia, live music, and local events around Hampton Roads (757).

### Description

Local Buzz 757 helps you find what’s happening nearby in Hampton Roads.

Browse local events, happy hours, food specials, trivia nights, live music, and
more—all in one simple, community-powered guide.

With Local Buzz 757 you can:

- Discover local happenings and specials
- Search and filter by city and event type
- See what’s coming up this week
- Explore venues on a native map
- Open directions to a venue
- Confirm that a listing is still accurate
- Report outdated information
- Submit a local event or special for review

You can browse without creating an account. If you choose, you can save an
email address so your contributions follow you across devices.

Local Buzz 757 starts local and gets better with every helpful confirmation,
correction, and submission.

### Keywords

`local events,happy hour,trivia,live music,food specials,hampton roads,757`

### Categories

- Primary: Lifestyle
- Secondary: Food & Drink

### Copyright

`2026 Michael Willey`

Confirm the legal owner name before saving this field.

## Screenshots needed

Capture on a physical iPhone or simulator using realistic, approved development
listings. Do not include private data or pending submissions.

1. Listings feed — Local Buzz 757
2. Search and filters
3. Week-ahead view
4. Native venue map
5. Listing detail with directions and confirmation
6. Community submission form

Apple currently requests the iPhone 6.5-inch display set. The first three
screenshots are the most important because Apple uses them prominently.

## TestFlight “What to Test” draft

Please test the complete Local Buzz 757 discovery flow:

1. Confirm the home-screen name, splash, and in-app header say Local Buzz 757.
2. Browse, search, and filter listings.
3. Open the week view and map.
4. Open a listing and launch directions.
5. Confirm an accurate listing.
6. Report an inaccurate listing.
7. Submit a new listing and verify the success state.
8. Save an email account with the one-time code, then reopen the app.

Please report confusing copy, layout issues, crashes, missing map pins, and
any action that does not show a clear success or error state.

## Device smoke test

Run this against the TestFlight build before App Review:

- Fresh install shows the Local Buzz 757 name, existing pin/bee icon, splash,
  and header.
- No screen displays “HapsHere” or a bare “Local Buzz” (without 757) to
  customers.
- Listings load successfully.
- Loading, empty, error, and populated states are readable in light and dark
  appearance.
- Search, city filters, type filters, and reset work.
- Week view uses the correct dates and listings.
- Map permission has understandable copy; venue pins open the correct details.
- Directions open the correct address.
- Confirmation succeeds and a duplicate is handled.
- Report reason and optional note submit correctly.
- Community submission validates required fields and lands in pending review.
- Optional email OTP arrives, verifies, and persists after relaunch.
- Sign-out returns to an anonymous state.
- Pull-to-refresh and offline/error recovery work.
- VoiceOver labels and Dynamic Type are usable on the main flows.

## App Review notes draft

Local Buzz 757 does not require a username or password to browse or test the
primary experience. The app creates an anonymous session only when a person
confirms, reports, or submits a listing. Adding an email is optional.

The map asks for foreground location permission because the native geocoder
requires it to place venue-address pins. Local Buzz 757 does not request the
device’s current coordinates and does not track the user’s location.

Community submissions are placed in a pending review state. Admin moderation is
performed outside the mobile app.

Before submission, clear the currently selected **Sign-in required** checkbox
unless App Review is given a real review account and credentials.

## App Privacy draft

This is an implementation-based draft, not legal advice. Confirm it against the
final production build and all backend/service behavior before publishing.

Data collected for **App Functionality**, not tracking:

| Apple data category | Data | Linked to identity? | Notes |
|---|---|---:|---|
| Contact Info | Email Address | Yes | Optional account upgrade and OTP |
| Identifiers | User ID | Yes | Anonymous or permanent account ID |
| User Content | Other User Content | Yes | Submissions, confirmations, reports, and notes |

Current code does not read or upload the device’s current coordinates. It sends
venue addresses to the platform geocoder to place venue pins. On that basis,
device precise location should not be declared as collected. Reassess if
near-me sorting, current-location centering, analytics, crash reporting,
advertising, or another SDK is added.

Tracking: **No**.

A public privacy policy URL is required before the disclosure can be published.

## App Store Connect items still required

- Host a public privacy policy page.
- Host a public support page and choose the Support URL.
- Add a marketing URL if desired.
- Upload iPhone screenshots.
- Add promotional text, description, keywords, copyright, and the final build.
- Set primary and secondary categories.
- Complete Content Rights.
- Complete the age-rating questionnaire. The app has user-generated content;
  answer every prompt based on the final moderation behavior.
- Complete and publish App Privacy.
- Complete EU Digital Services Act trader-status setup, or intentionally choose
  distribution that excludes affected regions.
- Confirm Pricing and Availability.
- Add review contact information and review notes.
- Clear **Sign-in required** unless a valid review account is supplied.
- Change release control from automatic to **manual release** for the first
  launch.
- Rename TestFlight groups that still say HapsHere or a bare Local Buzz.
- Replace the blank TestFlight “What to Test” text.
- Verify associated-domain files and email deep links before relying on
  universal links.

## Controlled release order

1. Complete the TestFlight device smoke test against the intended backend.
2. Resolve every failed smoke-test item on the pull request.
3. Review and merge the pull request.
4. Publish privacy and support pages at stable HTTPS URLs.
5. Complete the non-build App Store metadata and privacy questionnaire.
6. Explicitly approve switching EAS production variables to the production
   backend if they still point at `local-buzz-dev`.
7. Verify only the production publishable key—not a service-role key—is stored.
8. Create a fresh iOS production build (`eas build --platform ios --profile production`).
9. Smoke-test the new build using only safe reads and a controlled synthetic
   submission.
10. Submit with `eas submit --platform ios --latest` (or `--profile production`).
11. Keep the first App Store release set to manual release.
12. Add for review.
13. After approval, perform one final production check and manually release.

Do not merge, switch EAS to production, build against production, add the
version for review, or release it without an explicit go-ahead at that stage.
