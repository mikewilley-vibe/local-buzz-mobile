/**
 * Environment configuration for the HapsHere mobile app.
 *
 * Values are provided via Expo public env vars (inlined at build time):
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * Copy `.env.example` to `.env.local` and fill in the local-buzz-dev values.
 * `.env.local` is git-ignored and must never be committed.
 */

/**
 * The production Supabase project. The mobile app must NEVER talk to this
 * project during development. See the safety guard below.
 */
export const PRODUCTION_PROJECT_REF = 'vghnfdukyosvvoqrxmok';

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Copy .env.example to .env.local and set the local-buzz-dev values.',
    );
  }
  return value;
}

/** Extract the Supabase project ref (subdomain) from a project URL. */
export function getProjectRef(url: string): string | null {
  const match = url.match(/^https?:\/\/([a-z0-9]+)\.supabase\.(co|in|net)/i);
  return match ? match[1].toLowerCase() : null;
}

export const supabaseUrl = requireEnv(
  'EXPO_PUBLIC_SUPABASE_URL',
  process.env.EXPO_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = requireEnv(
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const supabaseProjectRef = getProjectRef(supabaseUrl);

/**
 * Runtime safety guard: refuse to run against the production project during
 * development. This prevents the dev mobile app from ever reading or mutating
 * production data.
 */
if (__DEV__ && supabaseProjectRef === PRODUCTION_PROJECT_REF) {
  throw new Error(
    `Refusing to run against the production Supabase project (${PRODUCTION_PROJECT_REF}) ` +
      'in development. Point EXPO_PUBLIC_SUPABASE_URL at the local-buzz-dev project.',
  );
}
