import { LIFE_AREA_ORDER } from "@/constants";
import { colors, dewSoft, fonts, radius, spacing } from "@/theme";
import { lifeAreaLabel, t } from "@i18n";
import type { LifeArea } from "@tend/domain";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function Chip({
  label,
  selected,
  onPress,
}: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : null]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function LifeAreaPicker({
  selected,
  onChange,
  includeNone = false,
}: {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  includeNone?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {includeNone ? (
        <Chip
          label={t("common.none")}
          selected={selected === null}
          onPress={() => onChange(null)}
        />
      ) : null}
      {LIFE_AREA_ORDER.map((area) => (
        <Chip
          key={area}
          label={lifeAreaLabel(area)}
          selected={selected === area}
          onPress={() => onChange(area)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    ...dewSoft,
    borderRadius: radius.chip,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.sage,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.primaryPressed,
    fontFamily: fonts.bodySemibold,
  },
});
