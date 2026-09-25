import type { Provider } from '@supabase/supabase-js';

export type OAuthProviderOption = {
  provider: Provider;
  label: string;
};

/**
 * Social sign-in options shown on the Account screen.
 *
 * Each entry maps to a real Supabase OAuth provider (`signInWithProvider`),
 * so there are no dead buttons. A provider only works once it is enabled with
 * credentials in the Supabase dashboard (Authentication → Providers); until
 * then the button surfaces a friendly "not available" message.
 *
 * Notes:
 *  - "Microsoft" is Supabase's `azure` provider.
 *  - Yahoo is intentionally omitted — Supabase Auth does not support it.
 *  - To hide a provider, remove its entry here.
 */
export const OAUTH_PROVIDERS: OAuthProviderOption[] = [
  { provider: 'apple', label: 'Continue with Apple' },
  { provider: 'google', label: 'Continue with Google' },
  { provider: 'azure', label: 'Continue with Microsoft' },
];
