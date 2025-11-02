/**
 * Send reminder emails for bookings scheduled tomorrow
 */
export declare function sendBookingReminders(): Promise<{
    sent: number;
    failed: number;
}>;
/**
 * Start the booking reminder scheduler
 * Runs daily at 9 AM to send reminders for bookings scheduled tomorrow
 */
export declare function startBookingReminderScheduler(): void;
//# sourceMappingURL=bookingReminderScheduler.d.ts.map