import { colors, fonts, radius, spacing } from "@/theme";
import {
  TIME_OPTIONS,
  normalizeTimeValue,
  timeOptionsAfter,
  timeOptionsIncluding,
} from "@utils/timeOptions";
import { Check, ChevronDown } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const MENU_MAX_HEIGHT = 220;

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  afterTime?: string;
  accessibilityLabel: string;
}

type TriggerLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function TimeSelect({ value, onChange, afterTime, accessibilityLabel }: TimeSelectProps) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const baseOptions = useMemo(
    () => (afterTime ? timeOptionsAfter(afterTime) : TIME_OPTIONS),
    [afterTime],
  );
  const options = useMemo(() => timeOptionsIncluding(value, baseOptions), [value, baseOptions]);
  const displayValue = normalizeTimeValue(value);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  const toggleMenu = useCallback(() => {
    if (open) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, open, openMenu]);

  const menuPosition = useMemo(() => {
    if (!triggerLayout) {
      return null;
    }

    const belowTop = triggerLayout.y + triggerLayout.height + spacing.xs;
    const spaceBelow = windowHeight - belowTop;
    const spaceAbove = triggerLayout.y - spacing.sm;

    if (spaceBelow >= MENU_MAX_HEIGHT || spaceBelow >= spaceAbove) {
      return {
        top: belowTop,
        left: triggerLayout.x,
        width: triggerLayout.width,
        maxHeight: Math.min(MENU_MAX_HEIGHT, spaceBelow - spacing.sm),
      };
    }

    const maxHeight = Math.min(MENU_MAX_HEIGHT, spaceAbove - spacing.sm);
    return {
      top: Math.max(spacing.sm, triggerLayout.y - maxHeight - spacing.xs),
      left: triggerLayout.x,
      width: triggerLayout.width,
      maxHeight,
    };
  }, [triggerLayout, windowHeight]);

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={styles.wrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded: open }}
          style={styles.button}
          onPress={toggleMenu}
        >
          <Text style={styles.buttonText}>{displayValue}</Text>
          <View style={[styles.chevron, open ? styles.chevronOpen : null]}>
            <ChevronDown size={16} color={colors.textMuted} />
          </View>
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={closeMenu}>
        <View style={styles.overlay}>
          <Pressable accessibilityRole="button" style={styles.backdrop} onPress={closeMenu} />

          {menuPosition ? (
            <View
              style={[
                styles.menu,
                {
                  top: menuPosition.top,
                  left: menuPosition.left,
                  width: menuPosition.width,
                  maxHeight: menuPosition.maxHeight,
                },
              ]}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: menuPosition.maxHeight }}
              >
                {options.map((option) => {
                  const selected = option === displayValue;

                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[styles.option, selected ? styles.optionSelected : null]}
                      onPress={() => {
                        onChange(option);
                        closeMenu();
                      }}
                    >
                      <Text
                        style={[styles.optionText, selected ? styles.optionTextSelected : null]}
                      >
                        {option}
                      </Text>
                      {selected ? <Check size={16} color={colors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menu: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    elevation: 8,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#2c2925",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    zIndex: 1,
  },
  option: {
    alignItems: "center",
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primaryMuted,
  },
  optionText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bodySemibold,
  },
});
