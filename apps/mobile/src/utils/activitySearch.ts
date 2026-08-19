import { isCalendarDate } from "@tend/domain";

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

function calendarDateOrEmpty(value: string | undefined): string {
  return value && isCalendarDate(value) ? value : "";
}

export function buildActivityListQuery(limitOrOptions?: number | ActivityListParams): string {
  const options =
    typeof limitOrOptions === "number" ? { limit: limitOrOptions } : (limitOrOptions ?? {});
  const parts: string[] = [];
  const from = calendarDateOrEmpty(options.from);
  const to = calendarDateOrEmpty(options.to);

  if (options.limit) {
    appendQuery(parts, "limit", String(options.limit));
  }
  if (options.q?.trim()) {
    appendQuery(parts, "q", options.q.trim());
  }
  if (options.type) {
    appendQuery(parts, "type", options.type);
  }
  if (from && to && from > to) {
    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }
  if (from) {
    appendQuery(parts, "from", from);
  }
  if (to) {
    appendQuery(parts, "to", to);
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
