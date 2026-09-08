import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { createSessionFromUrl } from '@/lib/auth-linking';
import { isAuthCallbackUrl } from '@/lib/auth-url';

/**
 * Completes an Auth email (or magic-style) redirect: establish the session
 * when tokens are present, then land on Account (OTP form if code-only).
 */
export function useAuthLinking() {
  const url = Linking.useLinkingURL();
  const router = useRouter();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handled.current === url || !isAuthCallbackUrl(url)) return;
    handled.current = url;

    void (async () => {
      await createSessionFromUrl(url);
      router.replace('/account');
    })();
  }, [url, router]);
}
