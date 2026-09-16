import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccount } from '@/features/account/useAccount';

const PRIMARY = Palette.amber;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_DOMAINS = ['gmail.com', 'icloud.com', 'outlook.com'] as const;

export function AccountScreen() {
  const theme = useTheme();
  const border = theme.backgroundSelected;
  const { account, flow, sendCode, verifyCode, signOut, resetFlow } = useAccount();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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
            Your HapsHere confirmations and submissions follow you across devices.
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
  const busy = flow.status === 'sending' || flow.status === 'verifying';
  const flowError = flow.status === 'error' ? flow.message : null;
  const emailLocalPart = email.trim().split('@')[0];

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

  function applyEmailDomain(domain: (typeof EMAIL_DOMAINS)[number]) {
    if (!emailLocalPart) return;
    setEmail(`${emailLocalPart}@${domain}`);
    setLocalError(null);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.content}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="subtitle">Save your account</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Add your email so your HapsHere confirmations and submissions are kept
              and follow you to a new phone. We’ll send a 6-digit code — no password
              needed. If the email includes a link, you can tap it to finish in the
              app.
            </ThemedText>

            {!codeSent ? (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Palette.muted}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  editable={!busy}
                  style={[styles.input, { borderColor: border, color: theme.text }]}
                />
                <View accessibilityRole="none" style={styles.domainRow}>
                  {EMAIL_DOMAINS.map((domain) => {
                    const disabled = !emailLocalPart || busy;
                    return (
                      <Pressable
                        key={domain}
                        accessibilityRole="button"
                        accessibilityLabel={`Use @${domain}`}
                        disabled={disabled}
                        onPress={() => applyEmailDomain(domain)}
                        style={[
                          styles.domainButton,
                          { borderColor: border },
                          disabled && styles.buttonDisabled,
                        ]}
                      >
                        <ThemedText type="smallBold">@{domain}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <PrimaryButton label="Send code" busy={busy} onPress={handleSend} />
              </>
            ) : (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Enter the code sent to{' '}
                  {flow.status === 'sent' || flow.status === 'verifying' ? flow.email : email}.
                </ThemedText>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  placeholderTextColor={Palette.muted}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  keyboardType="number-pad"
                  editable={!busy}
                  style={[
                    styles.input,
                    styles.codeInput,
                    { borderColor: border, color: theme.text },
                  ]}
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
          </ScrollView>
        </KeyboardAvoidingView>
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
        <ActivityIndicator color={Palette.ink} />
      ) : (
        <ThemedText type="smallBold" style={styles.primaryLabel}>
          {label}
        </ThemedText>
      )}
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
    flexGrow: 1,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
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
  domainRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  domainButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    paddingHorizontal: Spacing.four,
  },
  primaryLabel: { color: Palette.ink },
  buttonDisabled: { opacity: 0.5 },
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
