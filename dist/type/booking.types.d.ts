import { BookingStatus, PaymentStatus, PaymentMethod } from '../generated/prisma';
import { Decimal } from '../generated/prisma/runtime/library';
export interface CreateBookingData {
    slotId: string;
    visitorId: string;
    status?: BookingStatus;
    groupSize?: number;
    totalAmount?: Decimal;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    specialRequests?: string;
    createdBy?: string;
}
export interface BookingResponse {
    id: string;
    slotId: string;
    visitorId: string;
    status: BookingStatus;
    groupSize: number;
    totalAmount: Decimal;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;
    notes: string | null;
    specialRequests: string | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    slot?: {
        id: string;
        date: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        description: string | null;
    };
    visitor?: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        visitorType: string;
    };
    creator?: {
        id: string;
        name: string;
        email: string;
    };
}
export interface UpdateBookingData {
    status?: BookingStatus;
    groupSize?: number;
    totalAmount?: Decimal;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    specialRequests?: string;
    cancellationReason?: string;
}
export interface BookingCreationRequest {
    slotId: string;
    visitorId: string;
    groupSize?: number;
    totalAmount?: Decimal;
    paymentMethod?: PaymentMethod;
    notes?: string;
    specialRequests?: string;
}
export interface BookingSearchFilters {
    slotId?: string;
    visitorId?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    createdBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
    groupSizeMin?: number;
    groupSizeMax?: number;
    totalAmountMin?: Decimal;
    totalAmountMax?: Decimal;
}
export interface BookingConfirmationRequest {
    confirmedAt?: Date;
    notes?: string;
}
export interface BookingCancellationRequest {
    cancellationReason: string;
    cancelledAt?: Date;
}
export interface BookingPaymentRequest {
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    totalAmount?: Decimal;
}
export interface BookingStatistics {
    totalBookings: number;
    bookingsByStatus: {
        status: BookingStatus;
        count: number;
    }[];
    bookingsByPaymentStatus: {
        paymentStatus: PaymentStatus;
        count: number;
    }[];
    totalRevenue: Decimal;
    averageGroupSize: number;
    bookingsByDate: {
        date: string;
        count: number;
        revenue: number;
    }[];
    topPaymentMethods: {
        paymentMethod: PaymentMethod;
        count: number;
        totalAmount: Decimal;
    }[];
}
export interface BookingAvailabilityCheck {
    slotId: string;
    date: Date;
    availableCapacity: number;
    currentBookings: number;
    isAvailable: boolean;
    conflictingBookings?: number;
}
export interface BookingSummary {
    todayBookings: number;
    pendingPayments: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalRevenue: Decimal;
    upcomingBookings: number;
}
//# sourceMappingURL=booking.types.d.ts.map