import type { Provider } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { ensureAnonymousUser } from '@/lib/auth';
import { getAuthRedirectTo } from '@/lib/auth-linking';
import { signInWithProvider as runProviderSignIn } from '@/lib/oauth';
import { supabase } from '@/lib/supabase';

export type Account =
  | { status: 'loading' }
  | { status: 'anonymous' } // no email attached yet (or signed out)
  | { status: 'permanent'; email: string };

export type Flow =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; email: string }
  | { status: 'verifying'; email: string }
  | { status: 'oauth'; provider: Provider }
  | { status: 'error'; email?: string; message: string };

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/** Turn common OAuth failures into copy a user can act on. */
function friendlyProviderError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('not enabled') || normalized.includes('unsupported provider')) {
    return 'That sign-in option isn’t available yet. Try email or another provider.';
  }
  return message || GENERIC_ERROR;
}

async function readAccount(): Promise<Account> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'anonymous' };
  if (user.email && !user.is_anonymous) return { status: 'permanent', email: user.email };
  return { status: 'anonymous' };
}

export function useAccount() {
  const [account, setAccount] = useState<Account>({ status: 'loading' });
  const [flow, setFlow] = useState<Flow>({ status: 'idle' });

  const refresh = useCallback(async () => {
    setAccount(await readAccount());
  }, []);

  useEffect(() => {
    // supabase-js emits an INITIAL_SESSION event on subscribe, which handles
    // the initial read; subsequent events keep the account state in sync.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  /**
   * Attaches an email to the current (anonymous) user and sends a 6-digit code.
   * Keeps the same user id so existing confirmations/submissions carry over.
   */
  const sendCode = useCallback(async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    setFlow({ status: 'sending' });

    const userId = await ensureAnonymousUser();
    if (!userId) {
      setFlow({ status: 'error', email, message: GENERIC_ERROR });
      return;
    }

    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: getAuthRedirectTo() },
    );
    if (error) {
      setFlow({ status: 'error', email, message: error.message });
      return;
    }

    setFlow({ status: 'sent', email });
  }, []);

  const verifyCode = useCallback(
    async (email: string, token: string) => {
      setFlow({ status: 'verifying', email });

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: token.trim(),
        type: 'email_change',
      });

      if (error) {
        setFlow({ status: 'error', email, message: error.message });
        return;
      }

      setFlow({ status: 'idle' });
      await refresh();
    },
    [refresh],
  );

  /**
   * Social sign-in (Google / Apple / Microsoft). Opens an in-app browser and
   * returns to the app automatically; the session is then established and the
   * auth-state subscription refreshes the account to `permanent`.
   */
  const signInWithProvider = useCallback(
    async (provider: Provider) => {
      setFlow({ status: 'oauth', provider });

      const result = await runProviderSignIn(provider);

      if (result.status === 'cancel') {
        setFlow({ status: 'idle' });
        return;
      }
      if (result.status === 'error') {
        setFlow({ status: 'error', message: friendlyProviderError(result.message) });
        return;
      }

      setFlow({ status: 'idle' });
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setFlow({ status: 'idle' });
    await refresh();
  }, [refresh]);

  const resetFlow = useCallback(() => setFlow({ status: 'idle' }), []);

  return {
    account,
    flow,
    sendCode,
    verifyCode,
    signInWithProvider,
    signOut,
    resetFlow,
  } as const;
}
