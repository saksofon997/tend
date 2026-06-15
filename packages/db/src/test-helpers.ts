import { eq } from "drizzle-orm";
import type { Database } from "./client";
import { pingDatabase } from "./ping";
import { users } from "./schema";

export async function isDatabaseAvailable(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return false;
  }

  try {
    await pingDatabase(databaseUrl);
    return true;
  } catch {
    return false;
  }
}

export async function deleteUserByEmail(database: Database, email: string): Promise<void> {
  await database.delete(users).where(eq(users.email, email.toLowerCase()));
}
