import { toIso } from "@/lib/items/serialize";
import type { ReflectionRow } from "@tend/db";
import { normalizeReflectionBody } from "@tend/domain";

export interface ReflectionResponse {
  id: string;
  entryDate: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeReflection(row: ReflectionRow): ReflectionResponse {
  return {
    id: row.id,
    entryDate: row.entryDate,
    body: normalizeReflectionBody(row.body),
    createdAt: toIso(row.createdAt) ?? row.createdAt.toISOString(),
    updatedAt: toIso(row.updatedAt) ?? row.updatedAt.toISOString(),
  };
}
