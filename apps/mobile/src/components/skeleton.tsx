import { colors, radius, spacing } from "@/theme";
import { skeletonColors } from "@/utils/skeletonColors";
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
