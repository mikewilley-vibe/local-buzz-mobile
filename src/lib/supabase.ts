// URL/fetch polyfills required by supabase-js in the React Native runtime.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { supabasePublishableKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/lib/database.types';

/**
 * Typed Supabase client for the Local Buzz mobile app.
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
    // No OAuth redirects in a native app; nothing to detect in a URL.
    detectSessionInUrl: false,
  },
});
