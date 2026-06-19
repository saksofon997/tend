import {
  RHYTHM_MAX_DAYS,
  RHYTHM_MIN_DAYS,
  RHYTHM_OPTIONS,
  type RhythmOption,
  isPresetRhythm,
} from "@/constants";
import { colors, fonts, radius, spacing } from "@/theme";
import { RHYTHM_CUSTOM_SELECT_VALUE } from "@/utils/rhythm";
import { t } from "@i18n";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RhythmPickerProps {
  value: number;
  onChange: (days: number) => void;
  options?: readonly RhythmOption[];
  invalid?: boolean;
}

export function RhythmPicker({
  value,
  onChange,
  options = RHYTHM_OPTIONS,
  invalid = false,
}: RhythmPickerProps) {
  const [isCustomMode, setIsCustomMode] = useState(() => !isPresetRhythm(value, options));
  const [customDaysInput, setCustomDaysInput] = useState(() => String(value));
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }

    previousValueRef.current = value;
    const custom = !isPresetRhythm(value, options);
    setIsCustomMode(custom);
    setCustomDaysInput(String(value));
  }, [value, options]);

  function selectPreset(days: number) {
    setIsCustomMode(false);
    onChange(days);
  }

  function selectCustom() {
    setIsCustomMode(true);
    setCustomDaysInput(String(value));
  }

  function handleCustomDaysChange(rawValue: string) {
    setCustomDaysInput(rawValue);

    const parsed = Number(rawValue);
    if (Number.isInteger(parsed) && parsed >= RHYTHM_MIN_DAYS && parsed <= RHYTHM_MAX_DAYS) {
      onChange(parsed);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.days}
            accessibilityRole="button"
            accessibilityState={{ selected: !isCustomMode && value === option.days }}
            style={[
              styles.chip,
              !isCustomMode && value === option.days ? styles.chipSelected : null,
            ]}
            onPress={() => selectPreset(option.days)}
          >
            <Text
              style={[
                styles.chipText,
                !isCustomMode && value === option.days ? styles.chipTextSelected : null,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: isCustomMode }}
          style={[styles.chip, isCustomMode ? styles.chipSelected : null]}
          onPress={selectCustom}
        >
          <Text style={[styles.chipText, isCustomMode ? styles.chipTextSelected : null]}>
            {t("items.add.rhythm.custom")}
          </Text>
        </TouchableOpacity>
      </View>

      {isCustomMode ? (
        <View style={styles.customField}>
          <TextInput
            value={customDaysInput}
            onChangeText={handleCustomDaysChange}
            keyboardType="number-pad"
            style={[styles.input, invalid ? styles.inputInvalid : null]}
            placeholder={t("items.add.rhythm.daysPlaceholder")}
            placeholderTextColor={colors.textSubtle}
            accessibilityLabel={t("items.add.rhythm.customLabel")}
          />
          <Text style={styles.helper}>{t("items.add.rhythm.customHelper")}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Exported for tests that assert the custom sentinel matches web.
export { RHYTHM_CUSTOM_SELECT_VALUE };

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
  },
  customField: {
    gap: spacing.xs,
  },
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
    width: 120,
  },
  inputInvalid: {
    borderColor: colors.error,
  },
  helper: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
