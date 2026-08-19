import { isCalendarDate } from "@tend/domain";

export interface ActivitySearchFilters {
  q: string;
  type: "" | "must" | "want";
  from: string;
  to: string;
}

export const EMPTY_ACTIVITY_SEARCH_FILTERS: ActivitySearchFilters = {
  q: "",
  type: "",
  from: "",
  to: "",
};

export function calendarDateOrEmpty(value: string): string {
  return isCalendarDate(value) ? value : "";
}

export function hasActivitySearchFilters(filters: ActivitySearchFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      filters.type ||
      calendarDateOrEmpty(filters.from) ||
      calendarDateOrEmpty(filters.to),
  );
}

export function canRequestActivitySearch(filters: ActivitySearchFilters): boolean {
  if (filters.from && !isCalendarDate(filters.from)) {
    return false;
  }
  if (filters.to && !isCalendarDate(filters.to)) {
    return false;
  }

  const from = calendarDateOrEmpty(filters.from);
  const to = calendarDateOrEmpty(filters.to);
  return !(from && to && from > to);
}

export function activitySearchQueryString(filters: ActivitySearchFilters, limit = 50): string {
  const params = new URLSearchParams();
  const from = calendarDateOrEmpty(filters.from);
  const to = calendarDateOrEmpty(filters.to);

  if (limit !== 50) {
    params.set("limit", String(limit));
  }
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.type) {
    params.set("type", filters.type);
  }
  if (from && to && from > to) {
    const query = params.toString();
    return query ? `?${query}` : "";
  }
  if (from) {
    params.set("from", from);
  }
  if (to) {
    params.set("to", to);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
