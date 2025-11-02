-- CreateEnum
CREATE TYPE "EmailSendingStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "booking_email_status" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "status" "EmailSendingStatus" NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMPTZ(6),
    "last_error_message" TEXT,
    "notification_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_email_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_email_status_booking_id_key" ON "booking_email_status"("booking_id");

-- CreateIndex
CREATE INDEX "booking_email_status_booking_id_idx" ON "booking_email_status"("booking_id");

-- CreateIndex
CREATE INDEX "booking_email_status_status_idx" ON "booking_email_status"("status");

-- CreateIndex
CREATE INDEX "booking_email_status_created_at_idx" ON "booking_email_status"("created_at");

-- AddForeignKey
ALTER TABLE "booking_email_status" ADD CONSTRAINT "booking_email_status_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
