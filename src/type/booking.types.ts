import { BookingStatus, PaymentStatus, PaymentMethod } from '../generated/prisma';
import { Decimal } from '../generated/prisma/runtime/library';

// Booking creation data interface
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

// Booking response interface
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
  // Relations
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

// Booking update data interface
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

// Booking creation request interface
export interface BookingCreationRequest {
  slotId: string;
  visitorId: string;
  groupSize?: number;
  totalAmount?: Decimal;
  paymentMethod?: PaymentMethod;
  notes?: string;
  specialRequests?: string;
}

// Booking search filters
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

// Booking confirmation request
export interface BookingConfirmationRequest {
  confirmedAt?: Date;
  notes?: string;
}

// Booking cancellation request
export interface BookingCancellationRequest {
  cancellationReason: string;
  cancelledAt?: Date;
}

// Booking payment update request
export interface BookingPaymentRequest {
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount?: Decimal;
}

// Booking statistics
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

// Booking availability check
export interface BookingAvailabilityCheck {
  slotId: string;
  date: Date;
  availableCapacity: number;
  currentBookings: number;
  isAvailable: boolean;
  conflictingBookings?: number;
}

// Booking summary for dashboard
export interface BookingSummary {
  todayBookings: number;
  pendingPayments: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: Decimal;
  upcomingBookings: number;
}
