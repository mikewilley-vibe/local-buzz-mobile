import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { OAUTH_PROVIDERS } from '@/features/account/oauthProviders';
import { useAccount } from '@/features/account/useAccount';

const PRIMARY = BrandColors.amber;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AccountScreen() {
  const theme = useTheme();
  const border = theme.backgroundSelected;
  const { account, flow, sendCode, verifyCode, signInWithProvider, signOut, resetFlow } =
    useAccount();

  // Errors handed back from an email/OAuth deep link (expired or invalid links,
  // failed sign-in) arrive as a route param; seed the error so the user can retry.
  const { authError } = useLocalSearchParams<{ authError?: string }>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(
    authError ? String(authError) : null,
  );

  if (account.status === 'loading') {
    return (
      <Centered>
        <ActivityIndicator size="large" />
      </Centered>
    );
  }

  if (account.status === 'permanent') {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, styles.content]}>
          <ThemedText type="subtitle">You’re signed in</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {account.email}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your confirmations and submissions follow you across devices.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void signOut();
            }}
            style={[styles.outlineButton, { borderColor: border }]}
          >
            <ThemedText type="smallBold">Sign out</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // account.status === 'anonymous'
  const codeSent = flow.status === 'sent' || flow.status === 'verifying';
  const pendingProvider = flow.status === 'oauth' ? flow.provider : null;
  const busy = flow.status === 'sending' || flow.status === 'verifying' || flow.status === 'oauth';
  const flowError = flow.status === 'error' ? flow.message : null;

  function handleSend() {
    setLocalError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      return;
    }
    void sendCode(email);
  }

  function handleVerify() {
    setLocalError(null);
    const activeEmail = flow.status === 'sent' || flow.status === 'verifying' ? flow.email : email;
    if (code.trim().length < 6) {
      setLocalError('Enter the 6-digit code from your email.');
      return;
    }
    void verifyCode(activeEmail, code);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, styles.content]}>
        <ThemedText type="subtitle">Save your account</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Keep your confirmations and submissions so they follow you to a new phone.
        </ThemedText>

        {!codeSent && OAUTH_PROVIDERS.length > 0 ? (
          <>
            {OAUTH_PROVIDERS.map(({ provider, label }) => (
              <ProviderButton
                key={provider}
                label={label}
                busy={pendingProvider === provider}
                disabled={busy && pendingProvider !== provider}
                border={border}
                onPress={() => {
                  setLocalError(null);
                  void signInWithProvider(provider);
                }}
              />
            ))}
            <ThemedText type="small" themeColor="textSecondary" style={styles.dividerText}>
              or continue with email
            </ThemedText>
          </>
        ) : null}

        {!codeSent ? (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={BrandColors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!busy}
              style={[styles.input, { borderColor: border, color: theme.text }]}
            />
            <PrimaryButton label="Send code" busy={busy} onPress={handleSend} />
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              Enter the code sent to {flow.status === 'sent' || flow.status === 'verifying' ? flow.email : email}.
            </ThemedText>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              placeholderTextColor={BrandColors.muted}
              keyboardType="number-pad"
              editable={!busy}
              style={[styles.input, styles.codeInput, { borderColor: border, color: theme.text }]}
            />
            <PrimaryButton label="Verify & save" busy={busy} onPress={handleVerify} />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setCode('');
                resetFlow();
              }}
              style={styles.textButton}
            >
              <ThemedText type="smallBold">Use a different email</ThemedText>
            </Pressable>
          </>
        )}

        {(localError || flowError) && (
          <ThemedText type="small" style={styles.errorText} accessibilityRole="alert">
            {localError ?? flowError}
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function PrimaryButton({
  label,
  busy,
  onPress,
}: {
  label: string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={[styles.primaryButton, busy && styles.buttonDisabled]}
    >
      {busy ? (
        <ActivityIndicator color={BrandColors.ink} />
      ) : (
        <ThemedText type="smallBold" style={styles.primaryLabel}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

function ProviderButton({
  label,
  busy,
  disabled,
  border,
  onPress,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  border: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={busy || disabled}
      onPress={onPress}
      style={[styles.outlineButton, { borderColor: border }, (busy || disabled) && styles.buttonDisabled]}
    >
      {busy ? <ActivityIndicator /> : <ThemedText type="smallBold">{label}</ThemedText>}
    </Pressable>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={[styles.flex, styles.centered]}>{children}</SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  codeInput: {
    letterSpacing: 6,
    fontSize: 20,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    paddingHorizontal: Spacing.four,
  },
  primaryLabel: { color: BrandColors.ink },
  buttonDisabled: { opacity: 0.5 },
  dividerText: {
    textAlign: 'center',
    marginVertical: Spacing.one,
  },
  outlineButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing.four,
  },
  textButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E5484D',
  },
});
