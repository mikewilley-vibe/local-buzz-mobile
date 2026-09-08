import { rewriteAuthSystemPath } from '@/lib/auth-url';

/**
 * Expo Router evaluates incoming native URLs as routes. Auth emails may land
 * on the scheme root with tokens in the hash — rewrite those to /auth/callback
 * and copy hash params onto the query so they are not dropped.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    return rewriteAuthSystemPath(path);
  } catch {
    return path;
  }
}
