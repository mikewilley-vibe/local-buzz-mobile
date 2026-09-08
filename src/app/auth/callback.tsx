import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createSessionFromUrl } from '@/lib/auth-linking';

/**
 * Destination for Auth email redirects (`localbuzzmobile://auth/callback`
 * or Expo Go `exp://…/--/auth/callback`). Tokens are applied if present;
 * otherwise the user is sent to Account to finish the 6-digit OTP.
 */
export default function AuthCallbackScreen() {
  const url = Linking.useLinkingURL();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (url) await createSessionFromUrl(url);
      if (!cancelled) router.replace('/account');
    })();
    return () => {
      cancelled = true;
    };
  }, [url, router]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.three,
          padding: Spacing.three,
        }}
      >
        <ActivityIndicator size="large" />
        <ThemedText type="small" themeColor="textSecondary">
          Opening your account…
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}
