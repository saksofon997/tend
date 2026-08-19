import { describe, expect, it } from "bun:test";
import { HandsGivingIcon } from "@/components/tend/hands-giving-icon";
import { HANDS_GIVING_ICON_PATHS } from "@tend/domain";

describe("HandsGivingIcon", () => {
  it("renders the converted filled palms-up-together glyph", () => {
    const icon = HandsGivingIcon({ size: 16 });
    expect(icon.props["data-icon"]).toBe("hands-giving");
    expect(icon.props.fill).toBe("currentColor");
    expect(icon.props.viewBox).toBe("0 0 512 512");
    expect(icon.props.stroke).toBeUndefined();

    const children = icon.props.children as unknown as [
      { type: string },
      Array<{ props: { d: string; transform: string } }>,
    ];
    const paths = children[1];
    expect(paths).toHaveLength(HANDS_GIVING_ICON_PATHS.length);
    expect(paths[0]?.props.d).toBe(HANDS_GIVING_ICON_PATHS[0].d);
    expect(paths[0]?.props.transform).toBe(HANDS_GIVING_ICON_PATHS[0].transform);
  });
});
