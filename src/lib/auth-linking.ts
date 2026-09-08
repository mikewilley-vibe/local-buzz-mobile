import type { EmailOtpType, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import {
  AUTH_CALLBACK_PATH,
  type AuthUrlParams,
  hasAuthSessionParams,
  parseAuthUrl,
} from '@/lib/auth-url';
import { supabase } from '@/lib/supabase';

export type AuthLinkResult =
  | { status: 'session'; session: Session }
  | { status: 'error'; message: string }
  | { status: 'none' };

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

const inFlight = new Map<string, Promise<AuthLinkResult>>();

function isEmailOtpType(value: string): value is EmailOtpType {
  return EMAIL_OTP_TYPES.has(value as EmailOtpType);
}

/**
 * Redirect target for Auth emails. Expo Go gets `exp://…/--/auth/callback`;
 * a development or production build gets `localbuzzmobile://auth/callback`.
 */
export function getAuthRedirectTo(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH.replace(/^\//, ''));
}

export async function establishSessionFromAuthParams(
  params: AuthUrlParams,
): Promise<AuthLinkResult> {
  if (params.error) {
    const message = params.error_description?.replace(/\+/g, ' ') ?? params.error;
    if (__DEV__) {
      console.warn('[auth-linking] redirect error:', message);
    }
    return { status: 'error', message };
  }

  if (params.code && params.code.length >= 8) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error || !data.session) {
      if (__DEV__) {
        console.warn('[auth-linking] exchangeCodeForSession failed:', error?.message);
      }
      return { status: 'error', message: error?.message ?? 'Could not complete sign-in from link.' };
    }
    return { status: 'session', session: data.session };
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error || !data.session) {
      if (__DEV__) {
        console.warn('[auth-linking] setSession failed:', error?.message);
      }
      return { status: 'error', message: error?.message ?? 'Could not restore session from link.' };
    }
    return { status: 'session', session: data.session };
  }

  if (params.token_hash) {
    const type = params.type && isEmailOtpType(params.type) ? params.type : 'email_change';
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: params.token_hash,
      type,
    });
    if (error || !data.session) {
      if (__DEV__) {
        console.warn('[auth-linking] verifyOtp(token_hash) failed:', error?.message);
      }
      return { status: 'error', message: error?.message ?? 'Could not verify email from link.' };
    }
    return { status: 'session', session: data.session };
  }

  return { status: 'none' };
}

/**
 * Establish a Supabase session from an incoming Auth URL, if it carries tokens.
 * Deduped so the root hook and the callback route can both call it safely.
 */
export async function createSessionFromUrl(url: string): Promise<AuthLinkResult> {
  const existing = inFlight.get(url);
  if (existing) return existing;

  const params = parseAuthUrl(url);
  if (!hasAuthSessionParams(params) && !params.error) {
    return { status: 'none' };
  }

  const pending = establishSessionFromAuthParams(params).finally(() => {
    inFlight.delete(url);
  });
  inFlight.set(url, pending);
  return pending;
}
