import { todayDateInputValue } from "@/constants";
import { colors, fonts, radius, spacing, thoughtRadius } from "@/theme";
import type { ReflectionResponse } from "@/types";
import type { TendApi } from "@api/tendApi";
import { DatePickerField } from "@components/date-picker-field";
import { t } from "@i18n";
import { REFLECTION_BODY_MAX_LENGTH, notebookDates, shiftCalendarDate } from "@tend/domain";
import { getErrorMessage } from "@utils/networkError";
import { replaceReflectionEntry } from "@utils/reflections";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

function dayKind(entryDate: string, today: string): "today" | "yesterday" | "other" {
  if (entryDate === today) {
    return "today";
  }
  if (entryDate === shiftCalendarDate(today, -1)) {
    return "yesterday";
  }
  return "other";
}

function formatOtherDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function ReflectionsScreen({ api }: { api: TendApi }) {
  const today = todayDateInputValue();
  const { height } = useWindowDimensions();
  const pageHeight = Math.max(420, height - 220);
  const listRef = useRef<FlatList<string>>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [entries, setEntries] = useState<ReflectionResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const bodies = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) {
      map.set(entry.entryDate, drafts[entry.entryDate] ?? entry.body);
    }
    for (const [date, body] of Object.entries(drafts)) {
      map.set(date, body);
    }
    return map;
  }, [drafts, entries]);

  const pages = useMemo(
    () =>
      notebookDates({
        today,
        entryDates: [...bodies.entries()]
          .filter(([, body]) => body.trim().length > 0)
          .map(([date]) => date),
        selectedDate,
      }),
    [bodies, selectedDate, today],
  );

  const loadReflections = useCallback(async () => {
    setError(null);
    try {
      const body = await api.listReflections();
      setEntries(body.entries);
    } catch (loadError) {
      setError(getErrorMessage(loadError, t("errors.reflections.load")));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadReflections();
  }, [loadReflections]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(saveTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  const persistLeaf = useCallback(
    async (entryDate: string, body: string) => {
      setSaveState("saving");
      try {
        const payload = await api.saveReflection(entryDate, body);
        setEntries((current) => replaceReflectionEntry(current, payload.entry, entryDate));
        setSaveState("saved");
      } catch (saveError) {
        setError(getErrorMessage(saveError, t("errors.reflections.save")));
        setSaveState("idle");
      }
    },
    [api],
  );

  function handleBodyChange(entryDate: string, body: string) {
    if (body.length > REFLECTION_BODY_MAX_LENGTH) {
      return;
    }
    setDrafts((current) => ({ ...current, [entryDate]: body }));
    setSaveState("idle");
    clearTimeout(saveTimers.current[entryDate]);
    saveTimers.current[entryDate] = setTimeout(() => {
      void persistLeaf(entryDate, body);
    }, 600);
  }

  function jumpToDate(nextDate: string) {
    setSelectedDate(nextDate);
    const index = pages.indexOf(nextDate);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true });
    }
  }

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
    const nextDate = pages[index];
    if (nextDate) {
      setSelectedDate(nextDate);
    }
  }

  function labelFor(date: string) {
    const kind = dayKind(date, today);
    if (kind === "today") {
      return t("reflections.today");
    }
    if (kind === "yesterday") {
      return t("reflections.yesterday");
    }
    return formatOtherDate(date);
  }

  const selectedIndex = Math.max(0, pages.indexOf(selectedDate));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("reflections.title")}</Text>
        <Text style={styles.subtitle}>{t("reflections.subtitle")}</Text>
        <View style={styles.controls}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>{t("reflections.chooseDate")}</Text>
            <DatePickerField
              value={selectedDate}
              onChange={jumpToDate}
              maxDate={today}
              accessibilityLabel={t("reflections.chooseDate")}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => jumpToDate(today)}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>{t("reflections.goToToday")}</Text>
          </Pressable>
        </View>
        <Text style={styles.saveStatus} accessibilityLiveRegion="polite">
          {saveState === "saving"
            ? t("reflections.saving")
            : saveState === "saved"
              ? t("reflections.saved")
              : " "}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.subtitle}>{t("common.loadingReflections")}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={pages}
          keyExtractor={(item) => item}
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialScrollIndex={selectedIndex}
          getItemLayout={(_, index) => ({
            length: pageHeight,
            offset: pageHeight * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={({ index }) => {
            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({ index, animated: false });
            });
          }}
          renderItem={({ item }) => {
            const body = bodies.get(item) ?? "";
            return (
              <View style={[styles.page, { height: pageHeight }]}>
                <PaperLeaf
                  dateLabel={labelFor(item)}
                  body={body}
                  onChange={(next) => handleBodyChange(item, next)}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function PaperLeaf({
  dateLabel,
  body,
  onChange,
}: {
  dateLabel: string;
  body: string;
  onChange: (body: string) => void;
}) {
  const lineHeight = 28;
  const lines = Array.from({ length: 14 }, (_, index) => index);

  return (
    <View style={styles.leaf}>
      <View pointerEvents="none" style={styles.leafTexture} />
      <View pointerEvents="none" style={styles.marginRule} />
      {lines.map((line) => (
        <View
          key={line}
          pointerEvents="none"
          style={[styles.ruledLine, { top: 52 + line * lineHeight }]}
        />
      ))}
      <View style={styles.leafHeader}>
        <Text style={styles.leafDate}>{dateLabel}</Text>
        <Text style={styles.leafCount}>
          {t("reflections.characterCount", {
            count: body.length,
            max: REFLECTION_BODY_MAX_LENGTH,
          })}
        </Text>
      </View>
      <TextInput
        value={body}
        onChangeText={onChange}
        placeholder={t("reflections.placeholder")}
        placeholderTextColor={colors.textSubtle}
        multiline
        textAlignVertical="top"
        maxLength={REFLECTION_BODY_MAX_LENGTH}
        style={styles.leafInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  todayButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  todayButtonText: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  saveStatus: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: spacing.sm,
    minHeight: 16,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  loading: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  page: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  leaf: {
    flex: 1,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: "hidden",
    ...thoughtRadius,
  },
  leafTexture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44, 41, 37, 0.018)",
  },
  marginRule: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 22,
    width: 1,
    backgroundColor: colors.paperMargin,
  },
  ruledLine: {
    position: "absolute",
    left: 28,
    right: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.paperLine,
  },
  leafHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  leafDate: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  leafCount: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  leafInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.displayRegular,
    fontSize: 16,
    lineHeight: 28,
    paddingHorizontal: 32,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
