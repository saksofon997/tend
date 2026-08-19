export interface ActivityListParams {
  limit?: number;
  q?: string;
  type?: "must" | "want";
  from?: string;
  to?: string;
}

function appendQuery(parts: string[], key: string, value: string) {
  parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
}

export function buildActivityListQuery(limitOrOptions?: number | ActivityListParams): string {
  const options =
    typeof limitOrOptions === "number" ? { limit: limitOrOptions } : (limitOrOptions ?? {});
  const parts: string[] = [];

  if (options.limit) {
    appendQuery(parts, "limit", String(options.limit));
  }
  if (options.q?.trim()) {
    appendQuery(parts, "q", options.q.trim());
  }
  if (options.type) {
    appendQuery(parts, "type", options.type);
  }
  if (options.from) {
    appendQuery(parts, "from", options.from);
  }
  if (options.to) {
    appendQuery(parts, "to", options.to);
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
