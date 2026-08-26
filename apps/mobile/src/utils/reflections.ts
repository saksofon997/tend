import type { ReflectionResponse } from "@/types";

export function replaceReflectionEntry(
  entries: ReflectionResponse[],
  next: ReflectionResponse | null,
  entryDate: string,
): ReflectionResponse[] {
  const without = entries.filter((entry) => entry.entryDate !== entryDate);
  return next ? [next, ...without] : without;
}

export function buildReflectionsQuery(from?: string, to?: string): string {
  const parts: string[] = [];
  if (from) {
    parts.push(`from=${encodeURIComponent(from)}`);
  }
  if (to) {
    parts.push(`to=${encodeURIComponent(to)}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
