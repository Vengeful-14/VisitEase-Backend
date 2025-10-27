import { PaymentStatus, PaymentMethod } from '../generated/prisma';
import { Decimal } from '../generated/prisma/runtime/library';
import { CreateBookingData, UpdateBookingData, BookingResponse, BookingSearchFilters, BookingStatistics, BookingAvailabilityCheck, BookingSummary } from '../type';
export declare const createBooking: (bookingData: CreateBookingData) => Promise<BookingResponse>;
export declare const getBookingById: (id: string) => Promise<BookingResponse | null>;
export declare const getBookings: (filters?: BookingSearchFilters) => Promise<BookingResponse[]>;
export declare const updateBooking: (id: string, updateData: UpdateBookingData) => Promise<BookingResponse | null>;
export declare const deleteBooking: (id: string) => Promise<boolean>;
export declare const getBookingsByVisitorId: (visitorId: string) => Promise<BookingResponse[]>;
export declare const getBookingsBySlotId: (slotId: string) => Promise<BookingResponse[]>;
export declare const confirmBooking: (id: string, confirmedAt?: Date) => Promise<BookingResponse | null>;
export declare const cancelBooking: (id: string, cancellationReason: string, cancelledAt?: Date) => Promise<BookingResponse | null>;
export declare const updateBookingPayment: (id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod, totalAmount?: Decimal) => Promise<BookingResponse | null>;
export declare const checkBookingAvailability: (slotId: string, date: Date) => Promise<BookingAvailabilityCheck>;
export declare const getBookingStatistics: () => Promise<BookingStatistics>;
export declare const getBookingSummary: () => Promise<BookingSummary>;
//# sourceMappingURL=bookingQueries.d.ts.map