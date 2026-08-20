import {
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const tendItemTypeEnum = pgEnum("tend_item_type", ["must", "want"]);

export const tendStatusEnum = pgEnum("tend_status", ["fresh", "getting_stale", "needs_attention"]);

export const lifeAreaEnum = pgEnum("life_area", [
  "household",
  "health",
  "relationships",
  "pets",
  "vehicle",
  "life_admin",
  "self_care",
  "finance",
  "food_kitchen",
  "home_maintenance",
  "outdoor",
  "kids_family",
  "personal",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
    mode: "date",
  }),
  timezone: text("timezone").notNull().default("UTC"),
});

export const tendItems = pgTable("tend_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sharedWithUserId: uuid("shared_with_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  type: tendItemTypeEnum("type").notNull(),
  rhythmDays: integer("rhythm_days").notNull(),
  lifeArea: lifeAreaEnum("life_area"),
  lastTendedAt: timestamp("last_tended_at", { withTimezone: true, mode: "date" }),
  status: tendStatusEnum("status").notNull().default("fresh"),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const tendEvents = pgTable("tend_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => tendItems.id, { onDelete: "cascade" }),
  tendedAt: timestamp("tended_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const availabilityWindows = pgTable("availability_windows", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: smallint("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull(),
  lastNotifiedItemId: uuid("last_notified_item_id").references(() => tendItems.id, {
    onDelete: "set null",
  }),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true, mode: "date" }),
  lastWeeklySupportAt: timestamp("last_weekly_support_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});
