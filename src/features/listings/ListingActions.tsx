import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openDirections } from '@/lib/directions';
import type { PublicListing } from '@/features/listings/useListings';
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  type ReportReason,
} from '@/features/listings/reportReasons';
import { useListingActions } from '@/features/listings/useListingActions';

const PRIMARY = Palette.amber;
const NOTE_MAX = 500;

function verifiedLabel(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function confirmationCountLabel(count: number): string {
  if (count <= 0) return 'Not yet confirmed by neighbors.';
  if (count === 1) return '1 neighbor confirmed this.';
  return `${count} neighbors confirmed this.`;
}

export function ListingActions({
  listing,
  onConfirmed,
}: {
  listing: PublicListing;
  onConfirmed: () => void;
}) {
  const { confirmStatus, confirmError, confirm, reportStatus, reportError, submitReport } =
    useListingActions(listing.id, { onConfirmed });

  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');

  const theme = useTheme();
  const border = theme.backgroundSelected;
  const surface = theme.backgroundElement;

  const confirmed = confirmStatus === 'confirmed' || confirmStatus === 'already';
  const confirmBusy = confirmStatus === 'checking' || confirmStatus === 'saving';
  const reported = reportStatus === 'submitted' || reportStatus === 'already';
  const submitting = reportStatus === 'submitting';

  const verified = verifiedLabel(listing.last_verified_at);

  function closeReport() {
    if (submitting) return;
    setReportOpen(false);
  }

  async function handleSend() {
    if (!reason) return;
    const outcome = await submitReport(reason, note);
    if (outcome === 'submitted' || outcome === 'already') {
      setReportOpen(false);
      setReason(null);
      setNote('');
    }
  }

  return (
    <View style={styles.container}>
      {/* Accuracy / confirm */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Is this still accurate?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Help neighbors know this listing is current.
        </ThemedText>

        {verified ? (
          <ThemedText type="small" themeColor="textSecondary">
            Last verified {verified}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {confirmationCountLabel(listing.confirmation_count)}
        </ThemedText>

        {confirmStatus === 'confirmed' ? (
          <ThemedText type="smallBold" accessibilityRole="text">
            Thanks for confirming!
          </ThemedText>
        ) : null}
        {confirmStatus === 'already' ? (
          <ThemedText type="smallBold" accessibilityRole="text">
            You confirmed this listing.
          </ThemedText>
        ) : null}
        {confirmError ? (
          <ThemedText type="small" style={styles.errorText} accessibilityRole="alert">
            {confirmError}
          </ThemedText>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={confirmed || confirmBusy}
          onPress={() => {
            void confirm();
          }}
          style={[styles.primaryButton, (confirmed || confirmBusy) && styles.buttonDisabled]}
        >
          {confirmStatus === 'saving' ? (
            <ActivityIndicator color={Palette.ink} />
          ) : (
            <ThemedText type="smallBold" style={styles.primaryLabel}>
              {confirmed ? 'Confirmed' : 'Yes, this is still accurate'}
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>

      {/* Report */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Something changed?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Let us know if this listing needs an update.
        </ThemedText>

        {reportStatus === 'submitted' ? (
          <ThemedText type="smallBold" accessibilityRole="text">
            Thanks — we’ll review this listing.
          </ThemedText>
        ) : null}
        {reportStatus === 'already' ? (
          <ThemedText type="smallBold" accessibilityRole="text">
            You’ve already reported a change for this listing.
          </ThemedText>
        ) : null}

        {!reported ? (
          <Pressable
            accessibilityRole="button"
            disabled={reportStatus === 'checking'}
            onPress={() => setReportOpen(true)}
            style={[styles.secondaryButton, { borderColor: border }]}
          >
            <ThemedText type="smallBold">Report a change</ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>

      {/* Directions */}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void openDirections(listing);
        }}
        style={[styles.secondaryButton, styles.directions, { borderColor: border }]}
      >
        <ThemedText type="smallBold">Get directions</ThemedText>
      </Pressable>

      {/* Report modal */}
      <Modal
        visible={reportOpen}
        transparent
        animationType="slide"
        onRequestClose={closeReport}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalSheet, { backgroundColor: surface }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              What’s changed?
            </ThemedText>

            <ScrollView style={styles.reasonList} contentContainerStyle={styles.reasonListContent}>
              {REPORT_REASONS.map((value) => {
                const selected = reason === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setReason(value)}
                    style={[
                      styles.reasonRow,
                      { borderColor: selected ? PRIMARY : border },
                      selected && styles.reasonRowSelected,
                    ]}
                  >
                    <View style={[styles.radio, { borderColor: selected ? PRIMARY : border }]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <ThemedText type="default">{REPORT_REASON_LABELS[value]}</ThemedText>
                  </Pressable>
                );
              })}

              <ThemedText type="smallBold" style={styles.noteLabel}>
                Note (optional)
              </ThemedText>
              <TextInput
                value={note}
                onChangeText={(text) => setNote(text.slice(0, NOTE_MAX))}
                editable={!submitting}
                multiline
                numberOfLines={4}
                maxLength={NOTE_MAX}
                placeholder="What needs correction?"
                placeholderTextColor="#8A8F98"
                style={[styles.noteInput, { borderColor: border, color: theme.text }]}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.noteCount}>
                {note.length}/{NOTE_MAX}
              </ThemedText>

              {reportError ? (
                <ThemedText type="small" style={styles.errorText} accessibilityRole="alert">
                  {reportError}
                </ThemedText>
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={!reason || submitting}
                onPress={() => {
                  void handleSend();
                }}
                style={[styles.primaryButton, (!reason || submitting) && styles.buttonDisabled]}
              >
                {submitting ? (
                  <ActivityIndicator color={Palette.ink} />
                ) : (
                  <ThemedText type="smallBold" style={styles.primaryLabel}>
                    Send report
                  </ThemedText>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={closeReport}
                style={styles.textButton}
              >
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  primaryButton: {
    marginTop: Spacing.two,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    paddingHorizontal: Spacing.four,
  },
  primaryLabel: {
    color: Palette.ink,
  },
  secondaryButton: {
    marginTop: Spacing.two,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing.four,
  },
  directions: {
    marginTop: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#E5484D',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    maxHeight: '85%',
  },
  reasonList: {
    marginTop: Spacing.one,
  },
  reasonListContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  reasonRowSelected: {
    backgroundColor: Palette.primaryWash,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  noteLabel: {
    marginTop: Spacing.two,
  },
  noteInput: {
    minHeight: 96,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    textAlignVertical: 'top',
  },
  noteCount: {
    textAlign: 'right',
  },
  modalActions: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  textButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
