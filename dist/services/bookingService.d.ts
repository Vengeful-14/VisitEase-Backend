export interface Booking {
    id: string;
    slotId: string;
    visitorId: string;
    status: string;
    groupSize: number;
    notes?: string;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    visitor?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        organization?: string;
        visitorType?: string;
        specialRequirements?: string;
    };
    slot?: {
        id: string;
        date: Date;
        startTime: string;
        endTime: string;
        capacity: number;
        bookedCount: number;
        description?: string;
    };
}
export declare class BookingService {
    private prisma;
    private systemLogService;
    private emailService;
    constructor();
    private generateTrackingToken;
    private ensureUniqueTrackingToken;
    createBooking(bookingData: {
        slotId: string;
        visitorId: string;
        groupSize: number;
        specialRequests?: string;
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
    private updateSlotBookedCount;
    private updateSlotStatus;
    getSlotForAvailability(slotId: string): Promise<{
        id: string;
        capacity: number;
        status: string;
    } | null>;
    getBookingsForSlot(slotId: string): Promise<Array<{
        status: string;
        groupSize: number;
    }>>;
    createPublicBooking(bookingData: {
        slotId: string;
        visitor: {
            name: string;
            email: string;
            phone?: string;
            organization?: string;
            visitorType?: string;
            specialRequirements?: string;
            country?: string;
        };
        groupSize: number;
        specialRequests?: string;
    }): Promise<Booking & {
        trackingToken: string;
    }>;
    trackBooking(email: string, trackingToken: string): Promise<Booking | null>;
    cancelPublicBooking(email: string, trackingToken: string, reason: string): Promise<Booking>;
    private transformBooking;
}
//# sourceMappingURL=bookingService.d.ts.map