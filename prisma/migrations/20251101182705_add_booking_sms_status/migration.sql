-- CreateEnum
CREATE TYPE "SmsSendingStatus" AS ENUM ('pending', 'sent', 'failed', 'max_attempts_reached');

-- CreateTable
CREATE TABLE "booking_sms_status" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "status" "SmsSendingStatus" NOT NULL DEFAULT 'pending',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_attempt_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "last_error_message" TEXT,
    "notification_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_sms_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_sms_status_booking_id_key" ON "booking_sms_status"("booking_id");

-- CreateIndex
CREATE INDEX "booking_sms_status_booking_id_idx" ON "booking_sms_status"("booking_id");

-- CreateIndex
CREATE INDEX "booking_sms_status_status_idx" ON "booking_sms_status"("status");

-- CreateIndex
CREATE INDEX "booking_sms_status_created_at_idx" ON "booking_sms_status"("created_at");

-- AddForeignKey
ALTER TABLE "booking_sms_status" ADD CONSTRAINT "booking_sms_status_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
