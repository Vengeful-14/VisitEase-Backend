import { BookingStatus, PaymentStatus, PaymentMethod } from '../generated/prisma';

// Visitor slot creation data interface (for Booking model)
export interface CreateVisitorSlotData {
  visitorId: string;
  slotId: string;
  groupSize: number;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  specialRequests?: string;
  createdBy?: string;
}

// Visitor slot response interface (for Booking model)
export interface VisitorSlotResponse {
  id: string;
  visitorId: string;
  slotId: string;
  bookingDate: Date;
  groupSize: number;
  status: BookingStatus;
  specialRequests: string | null;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  visitor?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    visitorType: string;
  };
  slot?: {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    capacity: number;
    description: string | null;
  };
}

// Visitor slot update data interface (for Booking model)
export interface UpdateVisitorSlotData {
  groupSize?: number;
  status?: BookingStatus;
  specialRequests?: string;
  totalAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  cancellationReason?: string;
}

// Visitor slot booking request interface
export interface VisitorSlotBookingRequest {
  visitorId: string;
  slotId: string;
  groupSize: number;
  specialRequests?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
}

// Visitor slot search filters
export interface VisitorSlotSearchFilters {
  visitorId?: string;
  slotId?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

// Visitor slot statistics
export interface VisitorSlotStatistics {
  totalBookings: number;
  bookingsByStatus: {
    status: BookingStatus;
    count: number;
  }[];
  bookingsByDate: {
    date: string;
    count: number;
  }[];
  averageGroupSize: number;
  totalVisitors: number;
}

// Visitor slot availability check
export interface SlotAvailabilityCheck {
  slotId: string;
  totalCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  isAvailable: boolean;
  conflictingBookings: number;
  groupSize: number;
}