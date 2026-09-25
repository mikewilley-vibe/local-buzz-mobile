// URL/fetch polyfills required by supabase-js in the React Native runtime.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { supabasePublishableKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/lib/database.types';

/**
 * Typed Supabase client for the Local Buzz 757 mobile app.
 *
 * Sessions are persisted with AsyncStorage so the anonymous identity used for
 * listing actions (confirm / report) survives app restarts. There is no
 * sign-in UI yet — the app upgrades to an anonymous session on demand via
 * `ensureAnonymousUser()` in `@/lib/auth`.
 */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Custom-scheme / Expo Go URLs are handled by `@/lib/auth-linking`.
    detectSessionInUrl: false,
    // PKCE lets the OAuth redirect return a `code` we exchange in-app, and
    // stores the code verifier in AsyncStorage across the browser round-trip.
    flowType: 'pkce',
  },
});
