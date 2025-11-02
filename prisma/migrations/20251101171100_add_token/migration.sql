/*
  Warnings:

  - A unique constraint covering the columns `[tracking_token]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "tracking_token" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tracking_token_key" ON "bookings"("tracking_token");

-- CreateIndex
CREATE INDEX "bookings_tracking_token_idx" ON "bookings"("tracking_token");
