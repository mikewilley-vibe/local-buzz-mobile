import { supabaseProjectRef } from '@/config/env';
import { supabase } from '@/lib/supabase';

/**
 * Development-only connectivity check.
 *
 * Calls the public `get_public_listings` RPC once at startup and logs the
 * result. This verifies that the app can reach the (dev) Supabase project and
 * that the public data boundary is reachable, without exposing the base tables.
 * It is a no-op in production builds.
 */
export async function runDevConnectionCheck(): Promise<void> {
  if (!__DEV__) return;

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('get_public_listings', {});
  const elapsedMs = Date.now() - startedAt;

  if (error) {
    console.warn(
      `[dev] Supabase connection check FAILED (project: ${supabaseProjectRef ?? 'unknown'}): ${error.message}`,
    );
    return;
  }

  console.log(
    `[dev] Supabase connection OK (project: ${supabaseProjectRef ?? 'unknown'}) — ` +
      `get_public_listings returned ${data?.length ?? 0} row(s) in ${elapsedMs}ms`,
  );
}
