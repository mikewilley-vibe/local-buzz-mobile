import type { Provider } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

import { createSessionFromUrl, getAuthRedirectTo } from '@/lib/auth-linking';
import { supabase } from '@/lib/supabase';

export type OAuthResult =
  | { status: 'session' }
  | { status: 'cancel' }
  | { status: 'error'; message: string };

const GENERIC_ERROR = 'Sign-in did not complete. Please try again.';

/**
 * Native OAuth sign-in for Supabase providers.
 *
 * Flow: ask Supabase for the provider authorization URL (PKCE, no auto
 * redirect), open it in an in-app browser session bound to our app scheme,
 * and — when the provider redirects back to `localbuzzmobile://auth/callback`
 * — let `openAuthSessionAsync` hand the URL back to us and close the browser
 * automatically. We then exchange the `code` for a session.
 *
 * The session is persisted by the Supabase client (AsyncStorage), and the
 * `onAuthStateChange` subscription in `useAccount` flips the UI to signed-in.
 */
export async function signInWithProvider(provider: Provider): Promise<OAuthResult> {
  const redirectTo = getAuthRedirectTo();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      // We open the browser ourselves so we control the return trip.
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    return { status: 'error', message: error?.message ?? 'Could not start sign-in.' };
  }

  // Warm the browser on Android for a faster, more reliable session.
  try {
    await WebBrowser.warmUpAsync();
  } catch {
    // Non-fatal; the auth session still works without warmup.
  }

  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      showInRecents: false,
    });

    // User dismissed the sheet / pressed cancel before finishing.
    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { status: 'cancel' };
    }

    if (result.type !== 'success' || !result.url) {
      return { status: 'error', message: GENERIC_ERROR };
    }

    const session = await createSessionFromUrl(result.url);
    if (session.status === 'session') return { status: 'session' };
    if (session.status === 'error') return { status: 'error', message: session.message };
    return { status: 'error', message: GENERIC_ERROR };
  } finally {
    try {
      await WebBrowser.coolDownAsync();
    } catch {
      // Ignore cleanup failures.
    }
  }
}
