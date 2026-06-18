import { colors, fonts, radius, spacing } from "@/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface FormFieldProps {
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  counter?: { length: number; max: number };
  children: ReactNode;
}

export function FormField({ label, helper, error, required, counter, children }: FormFieldProps) {
  const counterAtMax = counter ? counter.length >= counter.max : false;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.fieldRequired}> *</Text> : null}
      </Text>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      {children}
      {counter || error ? (
        <View style={[styles.fieldMetaRow, error ? styles.fieldMetaRowWithError : null]}>
          {error ? (
            <Text accessibilityRole="alert" style={styles.fieldError}>
              {error}
            </Text>
          ) : null}
          {counter ? (
            <Text
              style={[styles.fieldCounter, counterAtMax ? styles.fieldCounterAtMax : null]}
              accessibilityLabel={`${counter.length} of ${counter.max} characters`}
            >
              {counter.length}/{counter.max}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const formInputStyles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputInvalid: {
    borderColor: colors.error,
  },
});

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
  fieldHelper: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  fieldRequired: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
  },
  fieldMetaRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-end",
    minHeight: 18,
  },
  fieldMetaRowWithError: {
    justifyContent: "space-between",
  },
  fieldError: {
    color: colors.error,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginRight: spacing.sm,
  },
  fieldCounter: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  fieldCounterAtMax: {
    color: colors.error,
  },
});
