import { LIFE_AREA_ORDER } from "@/constants";
import { colors, fonts, radius, spacing } from "@/theme";
import { lifeAreaLabel, t } from "@i18n";
import { PRESETS_BY_AREA } from "@tend/domain";
import type { LifeArea, TendPreset } from "@tend/domain";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PresetSuggestionsProps {
  onSelect: (preset: TendPreset) => void;
  selectedPresetName?: string;
}

export function PresetSuggestions({ onSelect, selectedPresetName }: PresetSuggestionsProps) {
  const [selectedArea, setSelectedArea] = useState<Exclude<LifeArea, "personal">>("self_care");
  const presets = PRESETS_BY_AREA[selectedArea];

  return (
    <View accessibilityLabel={t("items.add.suggestions.label")} style={styles.container}>
      <Text style={styles.hint}>{t("items.add.suggestions.hint")}</Text>

      <View style={styles.chipRow}>
        {LIFE_AREA_ORDER.map((area) => (
          <TouchableOpacity
            key={area}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedArea === area }}
            style={[styles.chip, selectedArea === area ? styles.chipSelected : null]}
            onPress={() => setSelectedArea(area)}
          >
            <Text style={[styles.chipText, selectedArea === area ? styles.chipTextSelected : null]}>
              {lifeAreaLabel(area)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chipRow}>
        {presets.map((preset) => {
          const isSelected = selectedPresetName === preset.name;

          return (
            <TouchableOpacity
              key={preset.name}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[styles.presetChip, isSelected ? styles.presetChipSelected : null]}
              onPress={() => onSelect(preset)}
            >
              <Text
                style={[styles.presetChipText, isSelected ? styles.presetChipTextSelected : null]}
              >
                {preset.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
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
  presetChip: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  presetChipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  presetChipText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  presetChipTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bodyMedium,
  },
});
