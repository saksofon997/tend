import { todayDateInputValue } from "@/constants";
import { colors, fonts, radius, spacing } from "@/theme";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxDate?: string;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDateInput(value));
}

export function DatePickerField({ value, onChange, maxDate }: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const maximumDate = useMemo(
    () => (maxDate ? parseDateInput(maxDate) : parseDateInput(todayDateInputValue())),
    [maxDate],
  );
  const selectedDate = useMemo(() => parseDateInput(value), [value]);

  function handleChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "dismissed" || !nextDate) {
      return;
    }

    onChange(formatDateInput(nextDate));
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select last tended date"
        style={styles.trigger}
        onPress={() => setShowPicker((open) => !open)}
      >
        <Calendar size={18} color={colors.textMuted} />
        <Text style={styles.triggerText}>{formatDisplayDate(value)}</Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
});
