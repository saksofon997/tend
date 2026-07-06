import { colors, radius, spacing } from "@/theme";
import { skeletonColors } from "@/utils/skeletonColors";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Animated, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

function useSkeletonPulse() {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

export function SkeletonBone({
  height,
  width,
  style,
  rounded = radius.sm,
}: {
  height: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  rounded?: number;
}) {
  const opacity = useSkeletonPulse();

  return (
    <Animated.View
      style={[
        styles.bone,
        { borderRadius: rounded, height, opacity, width: width ?? "100%" },
        style,
      ]}
    />
  );
}

function ItemCardSkeleton() {
  return (
    <View style={styles.itemCard}>
      <SkeletonBone height={18} width="68%" rounded={radius.sm} />
      <View style={styles.itemMetaRow}>
        <SkeletonBone height={22} width={52} rounded={radius.sm} />
        <SkeletonBone height={14} width={88} rounded={radius.sm} />
      </View>
      <View style={styles.itemFooter}>
        <SkeletonBone height={24} width={96} rounded={radius.sm} />
        <SkeletonBone height={40} width={124} rounded={radius.md} />
      </View>
    </View>
  );
}

function SectionSkeleton({ cardKeys }: { cardKeys: readonly string[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SkeletonBone height={22} width="46%" rounded={radius.sm} />
        <SkeletonBone height={20} width={28} rounded={radius.round} />
      </View>
      <View style={styles.listStack}>
        {cardKeys.map((key) => (
          <ItemCardSkeleton key={key} />
        ))}
      </View>
    </View>
  );
}

export function HomeItemsSkeleton({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      importantForAccessibility="yes"
      style={styles.screenSkeleton}
    >
      <SkeletonBone height={36} width={168} rounded={radius.md} style={styles.filterToggle} />
      <SectionSkeleton cardKeys={["home-card-1", "home-card-2"]} />
      <SectionSkeleton cardKeys={["home-card-3"]} />
    </View>
  );
}

function ActivityRowSkeleton() {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityText}>
        <SkeletonBone height={16} width="72%" rounded={radius.sm} />
        <SkeletonBone height={14} width="40%" rounded={radius.sm} style={styles.activityMeta} />
      </View>
      <SkeletonBone height={42} width={42} rounded={radius.md} />
    </View>
  );
}

const ACTIVITY_SKELETON_GROUPS = [
  { key: "activity-week-1", rowKeys: ["activity-row-1", "activity-row-2", "activity-row-3"] },
  { key: "activity-week-2", rowKeys: ["activity-row-4", "activity-row-5"] },
] as const;

export function ActivitySkeleton({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      importantForAccessibility="yes"
      style={styles.screenSkeleton}
    >
      {ACTIVITY_SKELETON_GROUPS.map((group) => (
        <View key={group.key} style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonBone height={22} width="34%" rounded={radius.sm} />
            <SkeletonBone height={20} width={28} rounded={radius.round} />
          </View>
          <View style={styles.listStack}>
            {group.rowKeys.map((rowKey) => (
              <ActivityRowSkeleton key={rowKey} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function CheckInStatSkeleton() {
  return (
    <View style={styles.checkInStatCard}>
      <View style={styles.checkInStatHeader}>
        <SkeletonBone height={17} width={17} rounded={radius.round} />
        <SkeletonBone height={16} width="48%" rounded={radius.sm} />
      </View>
      <SkeletonBone height={36} width={54} rounded={radius.sm} style={styles.checkInValue} />
      <SkeletonBone height={14} width="74%" rounded={radius.sm} style={styles.checkInHelper} />
    </View>
  );
}

function CheckInPatternRowSkeleton() {
  return (
    <View style={styles.checkInPatternRow}>
      <SkeletonBone height={17} width={17} rounded={radius.round} style={styles.checkInIcon} />
      <View style={styles.checkInPatternText}>
        <SkeletonBone height={12} width="48%" rounded={radius.sm} />
        <SkeletonBone height={20} width="76%" rounded={radius.sm} />
        <SkeletonBone height={14} width="64%" rounded={radius.sm} />
      </View>
    </View>
  );
}

function CheckInCardSkeleton({
  children,
  titleWidth,
}: {
  children: ReactNode;
  titleWidth: number | `${number}%`;
}) {
  return (
    <View style={styles.checkInCard}>
      <SkeletonBone height={20} width={titleWidth} rounded={radius.sm} />
      {children}
    </View>
  );
}

const CHECK_IN_PATTERN_ROW_KEYS = [
  "check-in-pattern-1",
  "check-in-pattern-2",
  "check-in-pattern-3",
  "check-in-pattern-4",
] as const;

const CHECK_IN_WEEKDAY_KEYS = [
  "check-in-weekday-1",
  "check-in-weekday-2",
  "check-in-weekday-3",
  "check-in-weekday-4",
  "check-in-weekday-5",
  "check-in-weekday-6",
  "check-in-weekday-7",
] as const;

const CHECK_IN_ATTENTION_KEYS = [
  "check-in-attention-1",
  "check-in-attention-2",
  "check-in-attention-3",
] as const;

export function CheckInSkeleton({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      importantForAccessibility="yes"
      style={styles.screenSkeleton}
    >
      <View style={styles.checkInStatsGrid}>
        <CheckInStatSkeleton />
        <CheckInStatSkeleton />
      </View>

      <CheckInCardSkeleton titleWidth="54%">
        <View style={styles.checkInPatternList}>
          {CHECK_IN_PATTERN_ROW_KEYS.map((key) => (
            <CheckInPatternRowSkeleton key={key} />
          ))}
        </View>
      </CheckInCardSkeleton>

      <CheckInCardSkeleton titleWidth="38%">
        <View style={styles.checkInWeekdayGrid}>
          {CHECK_IN_WEEKDAY_KEYS.map((key) => (
            <View key={key} style={styles.checkInWeekdayCell}>
              <SkeletonBone height={42} rounded={radius.md} />
              <SkeletonBone height={11} width="56%" rounded={radius.sm} />
            </View>
          ))}
        </View>
      </CheckInCardSkeleton>

      <CheckInCardSkeleton titleWidth="28%">
        <View style={styles.checkInAttentionList}>
          {CHECK_IN_ATTENTION_KEYS.map((key) => (
            <View key={key} style={styles.checkInAttentionRow}>
              <SkeletonBone height={30} width={28} rounded={radius.sm} />
              <SkeletonBone height={14} width="62%" rounded={radius.sm} />
            </View>
          ))}
        </View>
      </CheckInCardSkeleton>
    </View>
  );
}

function DayCardSkeleton() {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <SkeletonBone height={18} width={96} rounded={radius.sm} />
        <SkeletonBone height={36} width={112} rounded={radius.md} />
      </View>
      <View style={styles.windowRow}>
        <SkeletonBone height={48} style={styles.timeSelect} rounded={radius.md} />
        <SkeletonBone height={14} width={18} rounded={radius.sm} />
        <SkeletonBone height={48} style={styles.timeSelect} rounded={radius.md} />
        <SkeletonBone height={42} width={42} rounded={radius.md} />
      </View>
    </View>
  );
}

const AVAILABILITY_DAY_KEYS = [
  "availability-day-1",
  "availability-day-2",
  "availability-day-3",
  "availability-day-4",
] as const;

export function AvailabilitySkeleton({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      importantForAccessibility="yes"
      style={styles.screenSkeleton}
    >
      {AVAILABILITY_DAY_KEYS.map((key) => (
        <DayCardSkeleton key={key} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: skeletonColors.base,
  },
  screenSkeleton: {
    gap: spacing.md,
  },
  filterToggle: {
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  listStack: {
    gap: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  itemMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  itemFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  activityRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  activityText: {
    flex: 1,
    gap: spacing.xs,
  },
  activityMeta: {
    marginTop: spacing.xs,
  },
  checkInStatsGrid: {
    gap: spacing.md,
  },
  checkInStatCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  checkInStatHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  checkInValue: {
    marginTop: spacing.sm,
  },
  checkInHelper: {
    marginTop: spacing.xs,
  },
  checkInCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  checkInPatternList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  checkInPatternRow: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  checkInIcon: {
    marginTop: spacing.xs,
  },
  checkInPatternText: {
    flex: 1,
    gap: spacing.xs,
  },
  checkInWeekdayGrid: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  checkInWeekdayCell: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  checkInAttentionList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  checkInAttentionRow: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  dayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  windowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  timeSelect: {
    flex: 1,
  },
});
