/**
 * Pure helpers for Auth deep-link URLs.
 *
 * Kept free of the Supabase client so `+native-intent` can rewrite incoming
 * paths without pulling in env/runtime dependencies.
 */

export const AUTH_CALLBACK_PATH = '/auth/callback';

export type AuthUrlParams = {
  access_token?: string;
  refresh_token?: string;
  code?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
};

const AUTH_QUERY_KEYS = [
  'access_token',
  'refresh_token',
  'code',
  'token_hash',
  'type',
  'error',
  'error_code',
  'error_description',
] as const;

type AuthQueryKey = (typeof AUTH_QUERY_KEYS)[number];

function isAuthQueryKey(key: string): key is AuthQueryKey {
  return (AUTH_QUERY_KEYS as readonly string[]).includes(key);
}

function pickAuthParams(from: URLSearchParams): AuthUrlParams {
  const params: AuthUrlParams = {};
  for (const key of AUTH_QUERY_KEYS) {
    const value = from.get(key);
    if (value) params[key] = value;
  }
  return params;
}

function paramsFromQueryString(raw: string): AuthUrlParams {
  const trimmed = raw.startsWith('?') || raw.startsWith('#') ? raw.slice(1) : raw;
  if (!trimmed || !trimmed.includes('=')) return {};
  return pickAuthParams(new URLSearchParams(trimmed));
}

function paramsFromHash(hash: string): AuthUrlParams {
  if (!hash) return {};
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  const queryIndex = trimmed.indexOf('?');
  const payload = queryIndex >= 0 ? trimmed.slice(queryIndex + 1) : trimmed;
  return paramsFromQueryString(payload);
}

/** Make a string `URL`-parseable (custom schemes, bare paths, query/hash). */
function toParsableUrl(raw: string): string {
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return raw;
  if (raw.startsWith('?') || raw.startsWith('#')) return `http://local.invalid/${raw}`;
  if (raw.startsWith('/')) return `http://local.invalid${raw}`;
  return `http://local.invalid/${raw}`;
}

/**
 * Read Auth tokens from a deep link. Supabase may put them on the query
 * (PKCE `code`, `token_hash`) or in the hash (implicit `access_token`).
 */
export function parseAuthUrl(url: string): AuthUrlParams {
  try {
    const parsed = new URL(toParsableUrl(url));
    return {
      ...pickAuthParams(parsed.searchParams),
      ...paramsFromHash(parsed.hash),
    };
  } catch {
    const hashIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');
    const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
    const search =
      queryIndex >= 0
        ? url.slice(queryIndex, hashIndex > queryIndex ? hashIndex : undefined)
        : '';
    return {
      ...paramsFromQueryString(search),
      ...paramsFromHash(hash),
    };
  }
}

/** PKCE auth codes are long; ignore short values that could be a 6-digit OTP. */
function isPkceCode(code: string | undefined): boolean {
  return Boolean(code && code.length >= 8);
}

export function hasAuthSessionParams(params: AuthUrlParams): boolean {
  if (params.access_token || params.refresh_token || params.token_hash) return true;
  if (isPkceCode(params.code)) return true;
  if (params.error && (params.error_code || params.error_description)) return true;
  return false;
}

export function includesAuthCallbackPath(url: string): boolean {
  return /(?:^|[/?#])auth\/callback(?:[/?#]|$)/i.test(url);
}

/** True when this URL is an Auth callback (by path or by tokens). */
export function isAuthCallbackUrl(url: string): boolean {
  return includesAuthCallbackPath(url) || hasAuthSessionParams(parseAuthUrl(url));
}

function serializeAuthParams(params: AuthUrlParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (isAuthQueryKey(key) && value) search.set(key, value);
  }
  return search.toString();
}

/**
 * Point Expo Router at `/auth/callback` and copy hash tokens onto the query
 * so they survive native intent delivery (hashes are often dropped).
 */
export function rewriteAuthSystemPath(path: string): string {
  if (!isAuthCallbackUrl(path)) return path;

  const params = parseAuthUrl(path);
  const qs = serializeAuthParams(params);
  return qs ? `${AUTH_CALLBACK_PATH}?${qs}` : AUTH_CALLBACK_PATH;
}
