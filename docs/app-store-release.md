# HapsHere iOS release checklist

Last audited: 2026-09-16

## Current status

- The HapsHere rebrand pull request is open as a draft and mergeable.
- CI passes dependency install, lint, TypeScript, and Expo Doctor.
- The approved HapsHere H-mark and navy/amber/cream palette are installed.
- App Store Connect already contains the HapsHere app record.
- The current TestFlight build finished processing and is available to internal
  testers.
- That TestFlight build was compiled against the isolated development backend.
  It is suitable for safe beta testing, not for the public release.
- A final build must be created after the branch is merged and the EAS release
  environment is deliberately switched to the production backend.

Established repository, bundle, URL-scheme, EAS, and backend identifiers remain
internal infrastructure. The customer-facing product name is HapsHere.

## App Store metadata draft

### Promotional text

Find the good stuff happening nearby—from happy hours and food specials to
trivia, live music, and local events.

### Description

HapsHere helps you find what’s happening nearby.

Browse local events, happy hours, food specials, trivia nights, live music, and
more—all in one simple, community-powered guide.

With HapsHere you can:

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

HapsHere starts local and gets better with every helpful confirmation,
correction, and submission.

### Keywords

`local events,happy hour,trivia,live music,food specials,things to do,nearby`

### Categories

- Primary: Lifestyle
- Secondary: Food & Drink

### Copyright

`2026 Michael Willey`

Confirm the legal owner name before saving this field.

## Screenshots needed

Capture on a physical iPhone or simulator using realistic, approved development
listings. Do not include private data or pending submissions.

1. Listings feed — “What’s happening here?”
2. Search and filters
3. Week-ahead view
4. Native venue map
5. Listing detail with directions and confirmation
6. Community submission form

Apple currently requests the iPhone 6.5-inch display set. The first three
screenshots are the most important because Apple uses them prominently.

## TestFlight “What to Test” draft

Please test the complete HapsHere discovery flow:

1. Browse, search, and filter listings.
2. Open the week view and map.
3. Open a listing and launch directions.
4. Confirm an accurate listing.
5. Report an inaccurate listing.
6. Submit a new listing and verify the success state.
7. Save an email account with the one-time code, then reopen the app.

Please report confusing copy, incorrect colors or icons, layout issues, crashes,
missing map pins, and any action that does not show a clear success or error
state.

## Device smoke test

Run this against the current TestFlight build and development backend before
merging the rebrand pull request.

- Fresh install shows the HapsHere icon, splash, header, tagline, and palette.
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
- No screen displays “Local Buzz” to customers.

## App Review notes draft

HapsHere does not require a username or password to browse or test the primary
experience. The app creates an anonymous session only when a person confirms,
reports, or submits a listing. Adding an email is optional.

The map asks for foreground location permission because the native geocoder
requires it to place venue-address pins. HapsHere does not request the device’s
current coordinates and does not track the user’s location.

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
- Rename the TestFlight groups still carrying the former product name.
- Replace the blank TestFlight “What to Test” text.
- Verify associated-domain files and email deep links before relying on
  universal links.

## Controlled release order

1. Complete the current TestFlight device smoke test against development.
2. Resolve every failed smoke-test item on the pull request.
3. Review and merge the pull request.
4. Publish privacy and support pages at stable HTTPS URLs.
5. Complete the non-build App Store metadata and privacy questionnaire.
6. Explicitly approve switching EAS production variables to the production
   backend.
7. Verify only the production publishable key—not a service-role key—is stored.
8. Create a fresh iOS production build.
9. Smoke-test the new build against production using only safe reads and a
   controlled synthetic submission.
10. Select the new build in App Store Connect.
11. Keep the first release set to manual release.
12. Add for review.
13. After approval, perform one final production check and manually release.

Do not merge, switch EAS to production, build against production, add the
version for review, or release it without an explicit go-ahead at that stage.
