import { colors, fonts, radius, spacing } from "@/theme";
import { LOCALE_OPTIONS, type Locale, t } from "@i18n";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LanguageSwitchProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  /** Header placement (splash / auth): shrink-wrap instead of stretching full width. */
  compact?: boolean;
}

export function LanguageSwitch({ compact = false, locale, onLocaleChange }: LanguageSwitchProps) {
  return (
    <View
      accessibilityLabel={t("language.label")}
      style={[styles.switch, compact ? styles.switchCompact : styles.switchBlock]}
    >
      {LOCALE_OPTIONS.map((option) => {
        const selected = locale === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t(option.labelKey)}
            style={[
              styles.option,
              compact ? styles.optionCompact : styles.optionBlock,
              selected ? styles.optionSelected : null,
            ]}
            onPress={() => onLocaleChange(option.value)}
          >
            <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>
              {t(option.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  switch: {
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
  },
  switchBlock: {
    marginTop: spacing.md,
  },
  switchCompact: {
    flexGrow: 0,
    flexShrink: 0,
  },
  option: {
    alignItems: "center",
    borderRadius: radius.sm,
    justifyContent: "center",
    minHeight: 44,
  },
  optionBlock: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  optionCompact: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
  },
  optionText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colors.text,
    fontFamily: fonts.bodySemibold,
  },
});
