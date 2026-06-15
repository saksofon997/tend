ALTER TABLE "tend_items" ALTER COLUMN "life_area" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."life_area";--> statement-breakpoint
CREATE TYPE "public"."life_area" AS ENUM('household', 'health', 'relationships', 'pets', 'vehicle', 'life_admin', 'self_care', 'finance', 'food_kitchen', 'home_maintenance', 'outdoor', 'kids_family', 'personal');--> statement-breakpoint
ALTER TABLE "tend_items" ALTER COLUMN "life_area" SET DATA TYPE "public"."life_area" USING "life_area"::"public"."life_area";