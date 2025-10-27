export interface Booking {
    id: string;
    slotId: string;
    visitorId: string;
    status: string;
    groupSize: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    notes?: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
}
export declare class BookingService {
    private prisma;
    private systemLogService;
    constructor();
    createBooking(bookingData: {
        slotId: string;
        visitorId: string;
        groupSize: number;
        specialRequests?: string;
        paymentMethod?: string;
    }, userId: string): Promise<Booking>;
    confirmBooking(bookingId: string, userId: string): Promise<Booking>;
    cancelBooking(bookingId: string, reason: string, userId: string): Promise<Booking>;
    getBookings(filters: {
        slotId?: string;
        visitorId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        bookings: Booking[];
        total: number;
    }>;
    getBookingById(id: string): Promise<Booking | null>;
    updateBooking(id: string, updates: Partial<Booking>, userId: string): Promise<Booking>;
    private validateSlotAvailability;
    private calculateBookingTotal;
    private updateSlotBookedCount;
    private transformBooking;
}
//# sourceMappingURL=bookingService.d.ts.map