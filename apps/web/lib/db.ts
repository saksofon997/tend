import { type Database, createDb } from "@tend/db";

let database: Database | null = null;

export function getDb(): Database {
  if (!database) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required");
    }

    database = createDb(databaseUrl);
  }

  return database;
}

export function resetDbForTests(): void {
  database = null;
}
