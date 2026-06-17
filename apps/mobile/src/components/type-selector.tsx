import { colors, fonts, radius, spacing } from "@/theme";
import { t } from "@i18n";
import type { TendItemType } from "@tend/domain";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TypeSelectorProps {
  value: TendItemType;
  onChange: (type: TendItemType) => void;
}

const OPTIONS: Array<{
  value: TendItemType;
  titleKey: "type.want" | "type.must";
  descriptionKey: "items.add.type.want.description" | "items.add.type.must.description";
}> = [
  {
    value: "want",
    titleKey: "type.want",
    descriptionKey: "items.add.type.want.description",
  },
  {
    value: "must",
    titleKey: "type.must",
    descriptionKey: "items.add.type.must.description",
  },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const accent = option.value === "must" ? styles.mustOption : styles.wantOption;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.option, selected ? [styles.optionSelected, accent] : null]}
              onPress={() => onChange(option.value)}
            >
              <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
              <Text style={styles.optionDescription}>{t(option.descriptionKey)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>{t("items.add.type.must.hint")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  optionSelected: {
    borderWidth: 2,
  },
  wantOption: {
    backgroundColor: colors.wantBg,
    borderColor: "#c5ced8",
  },
  mustOption: {
    backgroundColor: colors.mustBg,
    borderColor: "#d4b8ad",
  },
  optionTitle: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  hintBox: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  hintText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
