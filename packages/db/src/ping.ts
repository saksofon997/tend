import { sql } from "drizzle-orm";
import { type Database, createDb } from "./client";

export async function pingDatabase(connectionString: string): Promise<void> {
  const db = createDb(connectionString);
  await db.execute(sql`select 1`);
}

export type { Database };
