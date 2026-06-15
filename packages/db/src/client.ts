import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 1,
    // Neon pooler (and similar PgBouncer endpoints) reject prepared statements.
    prepare: !connectionString.includes("-pooler"),
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
/** Database connection or an active transaction — both support queries. */
export type DbClient = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];
