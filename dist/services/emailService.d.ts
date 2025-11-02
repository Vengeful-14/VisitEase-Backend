export interface BookingEmailData {
    visitorName: string;
    visitorEmail: string;
    slotDate: string;
    slotTime: string;
    slotEndTime: string;
    groupSize: number;
    trackingToken: string;
    specialRequests?: string;
}
export declare class EmailService {
    private resend;
    private fromEmail;
    constructor();
    /**
     * Check if email appears to be from a verified domain (not a common free email provider)
     */
    private isLikelyVerifiedDomain;
    /**
     * Send booking confirmation email when a booking is confirmed
     */
    sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean>;
    /**
     * Send reminder email a day before the booking
     */
    sendBookingReminderEmail(data: BookingEmailData): Promise<boolean>;
    /**
     * Get HTML template for confirmation email
     */
    private getConfirmationEmailTemplate;
    /**
     * Get HTML template for reminder email
     */
    private getReminderEmailTemplate;
}
//# sourceMappingURL=emailService.d.ts.map