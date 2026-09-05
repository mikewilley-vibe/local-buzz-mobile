import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/**
 * Anonymous identity for listing actions.
 *
 * Confirm and Report both write rows scoped to `auth.uid()` (RLS requires the
 * caller to be an authenticated user whose id matches `user_id`). Anonymous
 * Supabase users satisfy the `authenticated` role, so we lazily upgrade the
 * client to an anonymous session the first time an action needs one.
 *
 * Sign-in is single-flighted: concurrent callers share one in-flight request
 * instead of creating multiple anonymous users.
 */

let anonymousSignIn: Promise<string | null> | null = null;

function hasUsableSession(session: Session | null | undefined): session is Session {
  return Boolean(session?.access_token && session.user);
}

async function readUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return hasUsableSession(session) ? session.user.id : null;
}

/**
 * Returns the current user id only if the stored session is still valid on the
 * server. A persisted session can outlive its user (e.g. the account was
 * deleted), and PostgREST will still trust the signed JWT — leading to
 * foreign-key failures on writes scoped to `auth.uid()`. Validating with
 * `getUser()` (a server round-trip) lets the app self-heal by discarding a
 * stale session so a fresh anonymous user can be created.
 */
async function readValidUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!hasUsableSession(session)) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (__DEV__) {
      console.warn('[auth] stored session is invalid, signing out:', error?.message ?? 'no user');
    }
    await supabase.auth.signOut();
    return null;
  }

  return user.id;
}

async function signInAnonymouslyOnce(): Promise<string | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !hasUsableSession(data.session)) {
    if (__DEV__) {
      console.warn('[auth] anonymous sign-in failed:', error?.message ?? 'no session returned');
    }
    return null;
  }
  return data.session.user.id;
}

/**
 * Returns the current user id, creating a persisted anonymous session if none
 * exists yet. Resolves to `null` if a session could not be established (e.g.
 * anonymous sign-ins are disabled on the project).
 */
export async function ensureAnonymousUser(): Promise<string | null> {
  const existing = await readValidUserId();
  if (existing) return existing;

  if (!anonymousSignIn) {
    anonymousSignIn = signInAnonymouslyOnce().finally(() => {
      anonymousSignIn = null;
    });
  }

  return anonymousSignIn;
}

/** Current user id without triggering a sign-in. `null` when signed out. */
export async function getCurrentUserId(): Promise<string | null> {
  return readUserId();
}
