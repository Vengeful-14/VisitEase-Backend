-- AlterTable
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "gcash_number" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "reference_number" VARCHAR(50);
