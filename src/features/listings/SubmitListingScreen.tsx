import { Stack, useRouter } from 'expo-router';
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
import { BrandColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  CITIES,
  type City,
  DAYS,
  type Day,
  DESCRIPTION_MAX,
  HTTP_URL_RE,
  LISTING_TYPES,
  type ListingType,
  PLACE_NAME_MAX,
  SOURCE_URL_MAX,
  STREET_ADDRESS_MAX,
  TIME_RE,
  ZIP_RE,
} from '@/features/listings/constants';
import { type NewListingInput, useSubmitListing } from '@/features/listings/useSubmitListing';

const PRIMARY = BrandColors.amber;

type Errors = Partial<Record<string, string>>;

export function SubmitListingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const border = theme.backgroundSelected;

  const { status, error: submitError, submit, reset } = useSubmitListing();

  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [zip, setZip] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function toggleDay(day: Day) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function validate(): NewListingInput | null {
    const next: Errors = {};
    const name = placeName.trim();
    const desc = description.trim();
    const street = streetAddress.trim();
    const zipTrim = zip.trim();
    const url = sourceUrl.trim();
    const start = startTime.trim();
    const end = endTime.trim();

    if (name.length < 1 || name.length > PLACE_NAME_MAX) next.placeName = 'Enter a name (up to 200 characters).';
    if (desc.length < 1 || desc.length > DESCRIPTION_MAX) next.description = 'Enter a description.';
    if (!listingType) next.listingType = 'Pick a type.';
    if (!city) next.city = 'Pick a city.';
    if (days.length === 0) next.days = 'Pick at least one day.';
    if (start && !TIME_RE.test(start)) next.startTime = 'Use 24-hour HH:MM (e.g. 17:00).';
    if (end && !TIME_RE.test(end)) next.endTime = 'Use 24-hour HH:MM (e.g. 19:30).';
    if (street.length > STREET_ADDRESS_MAX) next.streetAddress = 'Address is too long.';
    if (zipTrim && !ZIP_RE.test(zipTrim)) next.zip = 'Use a 5-digit ZIP (optionally +4).';
    if (url && (!HTTP_URL_RE.test(url) || url.length > SOURCE_URL_MAX))
      next.sourceUrl = 'Enter a valid http(s) link.';

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

    return {
      place_name: name,
      description: desc,
      listing_type: listingType as ListingType,
      city: city as City,
      days,
      start_time: start || null,
      end_time: end || null,
      street_address: street || null,
      zip_code: zipTrim || null,
      source_url: url || null,
    };
  }

  async function handleSubmit() {
    const input = validate();
    if (!input) return;
    await submit(input);
  }

  function resetForm() {
    setPlaceName('');
    setDescription('');
    setListingType(null);
    setCity(null);
    setDays([]);
    setStartTime('');
    setEndTime('');
    setStreetAddress('');
    setZip('');
    setSourceUrl('');
    setErrors({});
    reset();
  }

  if (status === 'success') {
    return (
      <ThemedView style={styles.flex}>
        <Stack.Screen options={{ title: 'Submit a listing' }} />
        <SafeAreaView style={[styles.flex, styles.centered]}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Thanks — submitted for review!
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            A moderator will review your listing before it appears publicly.
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.primaryButton}>
            <ThemedText type="smallBold" style={styles.primaryLabel}>
              Done
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={resetForm} style={styles.textButton}>
            <ThemedText type="smallBold">Submit another</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const submitting = status === 'submitting';

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: 'Submit a listing' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Field label="Place name" error={errors.placeName}>
              <TextInput
                value={placeName}
                onChangeText={setPlaceName}
                placeholder="e.g. Rusty Anchor Tavern"
                placeholderTextColor={BrandColors.muted}
                maxLength={PLACE_NAME_MAX}
                style={[styles.input, { borderColor: border, color: theme.text }]}
              />
            </Field>

            <Field label="Type" error={errors.listingType}>
              <View style={styles.chipWrap}>
                {LISTING_TYPES.map((t) => (
                  <Chip
                    key={t.value}
                    label={t.label}
                    selected={listingType === t.value}
                    onPress={() => setListingType(t.value)}
                    border={border}
                  />
                ))}
              </View>
            </Field>

            <Field label="City" error={errors.city}>
              <View style={styles.chipWrap}>
                {CITIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={city === c}
                    onPress={() => setCity(c)}
                    border={border}
                  />
                ))}
              </View>
            </Field>

            <Field label="Days" error={errors.days}>
              <View style={styles.chipWrap}>
                {DAYS.map((d) => (
                  <Chip
                    key={d.value}
                    label={d.label}
                    selected={days.includes(d.value)}
                    onPress={() => toggleDay(d.value)}
                    border={border}
                  />
                ))}
              </View>
            </Field>

            <View style={styles.timeRow}>
              <Field label="Start (optional)" error={errors.startTime} style={styles.timeField}>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="17:00"
                  placeholderTextColor={BrandColors.muted}
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: border, color: theme.text }]}
                />
              </Field>
              <Field label="End (optional)" error={errors.endTime} style={styles.timeField}>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="19:30"
                  placeholderTextColor={BrandColors.muted}
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: border, color: theme.text }]}
                />
              </Field>
            </View>

            <Field label="Description" error={errors.description}>
              <TextInput
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, DESCRIPTION_MAX))}
                placeholder="What’s the deal? Days, times, price…"
                placeholderTextColor={BrandColors.muted}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea, { borderColor: border, color: theme.text }]}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.count}>
                {description.length}/{DESCRIPTION_MAX}
              </ThemedText>
            </Field>

            <Field label="Street address (optional)" error={errors.streetAddress}>
              <TextInput
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="e.g. 12 Harbor St"
                placeholderTextColor={BrandColors.muted}
                maxLength={STREET_ADDRESS_MAX}
                style={[styles.input, { borderColor: border, color: theme.text }]}
              />
            </Field>

            <Field label="ZIP (optional)" error={errors.zip}>
              <TextInput
                value={zip}
                onChangeText={setZip}
                placeholder="23510"
                placeholderTextColor={BrandColors.muted}
                keyboardType="numbers-and-punctuation"
                style={[styles.input, { borderColor: border, color: theme.text }]}
              />
            </Field>

            <Field label="Source link (optional)" error={errors.sourceUrl}>
              <TextInput
                value={sourceUrl}
                onChangeText={setSourceUrl}
                placeholder="https://…"
                placeholderTextColor={BrandColors.muted}
                autoCapitalize="none"
                keyboardType="url"
                style={[styles.input, { borderColor: border, color: theme.text }]}
              />
            </Field>

            {submitError ? (
              <ThemedText type="small" style={styles.errorText} accessibilityRole="alert">
                {submitError}
              </ThemedText>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => {
                void handleSubmit();
              }}
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color={BrandColors.ink} />
              ) : (
                <ThemedText type="smallBold" style={styles.primaryLabel}>
                  Submit for review
                </ThemedText>
              )}
            </Pressable>

            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Submissions are reviewed before appearing publicly.
            </ThemedText>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({
  label,
  error,
  style,
  children,
}: {
  label: string;
  error?: string;
  style?: object;
  children: ReactNode;
}) {
  return (
    <View style={[styles.field, style]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
      {error ? (
        <ThemedText type="small" style={styles.errorText}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  border,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  border: string;
}) {
  return (
    <ThemedText
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      type="smallBold"
      style={[
        styles.chip,
        { borderColor: selected ? PRIMARY : border },
        selected && styles.chipSelected,
        selected && styles.chipLabelSelected,
      ]}
    >
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
  },
  count: {
    textAlign: 'right',
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timeField: {
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: BrandColors.wash,
  },
  chipLabelSelected: {
    color: BrandColors.amberDeep,
  },
  primaryButton: {
    marginTop: Spacing.one,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    paddingHorizontal: Spacing.four,
  },
  primaryLabel: {
    color: BrandColors.ink,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E5484D',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
});
