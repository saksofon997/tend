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

export function hasActivitySearchFilters(filters: ActivitySearchFilters): boolean {
  return Boolean(filters.q.trim() || filters.type || filters.from || filters.to);
}

export function activitySearchQueryString(filters: ActivitySearchFilters, limit = 50): string {
  const params = new URLSearchParams();
  if (limit !== 50) {
    params.set("limit", String(limit));
  }
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
