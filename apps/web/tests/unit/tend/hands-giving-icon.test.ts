import { describe, expect, it } from "bun:test";
import { HandsGivingIcon } from "@/components/tend/hands-giving-icon";

describe("HandsGivingIcon", () => {
  it("marks the glyph as a palms-up-together tending icon", () => {
    const icon = HandsGivingIcon({ size: 16 });
    expect(icon.props["data-icon"]).toBe("hands-giving");
    expect(icon.props.stroke).toBe("currentColor");
    expect(icon.props.fill).toBe("none");
    expect(icon.props.children).toHaveLength(7);
  });
});
