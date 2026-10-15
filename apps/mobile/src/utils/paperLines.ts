/** Newsreader typographic ascender ÷ unitsPerEm (1470 / 2000). */
export const NEWSREADER_ASCENDER_RATIO = 1470 / 2000;

export const PAPER_FONT_SIZE = 18;
export const PAPER_LINE_HEIGHT = 28;

/** Distance from the top of the writing area to the rule for a line. */
export function paperRuleOffset(lineIndex: number) {
  const halfLeading = (PAPER_LINE_HEIGHT - PAPER_FONT_SIZE) / 2;
  const baseline = halfLeading + NEWSREADER_ASCENDER_RATIO * PAPER_FONT_SIZE;
  return baseline + lineIndex * PAPER_LINE_HEIGHT;
}

/** Enough rules to cover the visible page and any writing that has scrolled. */
export function paperLineCount(contentHeight: number, viewportHeight: number) {
  const span = Math.max(contentHeight, viewportHeight, PAPER_LINE_HEIGHT);
  return Math.ceil(span / PAPER_LINE_HEIGHT);
}
