import { describe, expect, it } from "bun:test";
import { colors } from "../../src/theme";
import { skeletonColors } from "../../src/utils/skeletonColors";
import "../helpers/nativeModuleMocks";

describe("skeletonColors", () => {
  it("uses muted surface tokens from the app theme", () => {
    expect(skeletonColors.base).toBe(colors.muted);
    expect(skeletonColors.pulse).toBe(colors.borderSubtle);
  });
});

describe("CheckInSkeleton", () => {
  it("uses an accessible progress wrapper around the loading layout", async () => {
    const { CheckInSkeleton } = await import("../../src/components/skeleton");

    const element = CheckInSkeleton({ label: "Loading Check In" });

    expect(element.props.accessibilityLabel).toBe("Loading Check In");
    expect(element.props.accessibilityRole).toBe("progressbar");
    expect(element.props.children).toHaveLength(4);
  });
});
