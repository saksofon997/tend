export function getAttentionSectionDefaults(
  needsAttentionCount: number,
  gettingStaleCount: number,
) {
  const needsAttentionExpanded = needsAttentionCount > 0;

  return {
    needsAttention: needsAttentionExpanded,
    gettingStale: !needsAttentionExpanded && gettingStaleCount > 0,
    lookingGood: false,
  } as const;
}
