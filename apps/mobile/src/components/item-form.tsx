import { ITEM_NAME_MAX_LENGTH, todayDateInputValue } from "@/constants";
import { colors, fonts, radius, spacing } from "@/theme";
import { DatePickerField } from "@components/date-picker-field";
import { FormField, formInputStyles } from "@components/form-field";
import { LifeAreaPicker } from "@components/life-area-picker";
import { PrimaryButton } from "@components/primary-button";
import { RhythmPicker } from "@components/rhythm-picker";
import { TypeSelector } from "@components/type-selector";
import { t } from "@i18n";
import type { ItemFormValues } from "@utils/itemFormValidation";
import { validateItemForm } from "@utils/itemFormValidation";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ItemFormProps {
  values: ItemFormValues;
  onChange: (patch: Partial<ItemFormValues>) => void;
  onSubmit: (values: ItemFormValues) => void | Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  submitting?: boolean;
  formError?: string | null;
}

export function ItemForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  submitting = false,
  formError = null,
}: ItemFormProps) {
  const todayDate = useMemo(() => todayDateInputValue(), []);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof ItemFormValues>(key: K, nextValue: ItemFormValues[K]) {
    onChange({ [key]: nextValue });

    if (fieldErrors[key]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit() {
    const validationErrors = validateItemForm(values, todayDate);

    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    await onSubmit(values);
  }

  return (
    <View>
      <FormField
        label={t("items.add.name.label")}
        required
        error={fieldErrors.name}
        counter={{ length: values.name.length, max: ITEM_NAME_MAX_LENGTH }}
      >
        <TextInput
          maxLength={ITEM_NAME_MAX_LENGTH}
          value={values.name}
          onChangeText={(name) => updateField("name", name.slice(0, ITEM_NAME_MAX_LENGTH))}
          style={[formInputStyles.input, fieldErrors.name ? formInputStyles.inputInvalid : null]}
          placeholder={t("items.add.name.placeholder")}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={t("items.add.name.label")}
        />
      </FormField>

      <FormField label={t("items.add.type.label")}>
        <TypeSelector value={values.type} onChange={(type) => updateField("type", type)} />
      </FormField>

      <FormField label={t("items.add.rhythm.label")} error={fieldErrors.rhythmDays}>
        <RhythmPicker
          value={values.rhythmDays}
          onChange={(rhythmDays) => updateField("rhythmDays", rhythmDays)}
          invalid={Boolean(fieldErrors.rhythmDays)}
        />
      </FormField>

      <FormField label={t("items.add.lifeArea.label")} helper={t("items.add.lifeArea.helper")}>
        <LifeAreaPicker
          selected={values.lifeArea}
          onChange={(lifeArea) => updateField("lifeArea", lifeArea)}
          includeNone
        />
      </FormField>

      <FormField
        label={t("items.add.sharedWith.label")}
        helper={t("items.add.sharedWith.helper")}
        error={fieldErrors.sharedWithEmail}
      >
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          inputMode="email"
          value={values.sharedWithEmail}
          onChangeText={(sharedWithEmail) => updateField("sharedWithEmail", sharedWithEmail)}
          style={[
            formInputStyles.input,
            fieldErrors.sharedWithEmail ? formInputStyles.inputInvalid : null,
          ]}
          placeholder={t("items.add.sharedWith.placeholder")}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={t("items.add.sharedWith.label")}
        />
      </FormField>

      <FormField label={t("items.add.lastTended.label")} error={fieldErrors.lastTendedDate}>
        <DatePickerField
          value={values.lastTendedDate}
          onChange={(lastTendedDate) => updateField("lastTendedDate", lastTendedDate)}
          maxDate={todayDate}
          invalid={Boolean(fieldErrors.lastTendedDate)}
        />
      </FormField>

      {formError ? (
        <View style={styles.formErrorBox} accessibilityRole="alert">
          <Text style={styles.formErrorText}>{formError}</Text>
        </View>
      ) : null}

      <PrimaryButton
        label={submitting ? submittingLabel : submitLabel}
        disabled={submitting}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formErrorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  formErrorText: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
