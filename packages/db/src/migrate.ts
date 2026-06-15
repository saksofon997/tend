import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { waitForDatabase } from "./wait-for-database";

config({ path: path.resolve(import.meta.dir, "../../../.env") });

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL or DATABASE_URL_UNPOOLED is required");
  process.exit(1);
}

await waitForDatabase(databaseUrl);

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

await migrate(db, { migrationsFolder: "./drizzle" });
await client.end();

console.log("Migrations applied successfully");
