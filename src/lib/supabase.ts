// URL/fetch polyfills required by supabase-js in the React Native runtime.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { supabasePublishableKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/lib/database.types';

/**
 * Typed Supabase client for the Local Buzz mobile app.
 *
 * Auth is intentionally disabled for this milestone — the app only reads the
 * public listings boundary via the `get_public_listings` RPC. Session
 * persistence will be added when authentication UI lands.
 */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
