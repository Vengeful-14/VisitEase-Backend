import { PrismaClient, BookingStatus, PaymentStatus, PaymentMethod } from '../generated/prisma';
import { Decimal } from '../generated/prisma/runtime/library';
import { 
  CreateBookingData, 
  UpdateBookingData, 
  BookingResponse, 
  BookingSearchFilters,
  BookingStatistics,
  BookingAvailabilityCheck,
  BookingSummary
} from '../type';

const prisma = new PrismaClient();

// Helper function to convert Decimal to number in booking response
const convertBookingResponse = (booking: any): BookingResponse => {
  return {
    ...booking,
    totalAmount: Number(booking.totalAmount),
  };
};

// Create a new booking
export const createBooking = async (bookingData: CreateBookingData): Promise<BookingResponse> => {
  try {
    // Check if the slot exists and is available
    const slot = await prisma.visitSlot.findUnique({
      where: { id: bookingData.slotId },
    });

    if (!slot) {
      throw new Error('Visit slot not found');
    }

    if (slot.status !== 'available') {
      throw new Error('Visit slot is not available for booking');
    }

    // Check if visitor exists
    const visitor = await prisma.visitor.findUnique({
      where: { id: bookingData.visitorId },
    });

    if (!visitor) {
      throw new Error('Visitor not found');
    }

    // Check capacity
    const currentBookings = await prisma.booking.aggregate({
      where: { 
        slotId: bookingData.slotId,
        status: { in: ['tentative', 'confirmed'] }
      },
      _sum: { groupSize: true },
    });

    const totalBookedCapacity = currentBookings._sum.groupSize || 0;
    const availableCapacity = slot.capacity - totalBookedCapacity;
    
    if (bookingData.groupSize && bookingData.groupSize > availableCapacity) {
      throw new Error(`Not enough capacity. Available: ${availableCapacity}, Requested: ${bookingData.groupSize}`);
    }

    const booking = await prisma.booking.create({
      data: {
        slotId: bookingData.slotId,
        visitorId: bookingData.visitorId,
        status: bookingData.status || 'tentative',
        groupSize: bookingData.groupSize || 1,
        totalAmount: bookingData.totalAmount || 0,
        paymentStatus: bookingData.paymentStatus || 'pending',
        paymentMethod: bookingData.paymentMethod,
        notes: bookingData.notes,
        specialRequests: bookingData.specialRequests,
        createdBy: bookingData.createdBy,
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return convertBookingResponse(booking);
  } catch (error) {
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (id: string): Promise<BookingResponse | null> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return booking ? convertBookingResponse(booking) : null;
  } catch (error) {
    throw error;
  }
};

// Get all bookings with optional filters
export const getBookings = async (filters?: BookingSearchFilters): Promise<BookingResponse[]> => {
  try {
    const whereClause: any = {};

    if (filters) {
      if (filters.slotId) {
        whereClause.slotId = filters.slotId;
      }
      if (filters.visitorId) {
        whereClause.visitorId = filters.visitorId;
      }
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.paymentStatus) {
        whereClause.paymentStatus = filters.paymentStatus;
      }
      if (filters.paymentMethod) {
        whereClause.paymentMethod = filters.paymentMethod;
      }
      if (filters.createdBy) {
        whereClause.createdBy = filters.createdBy;
      }
      if (filters.dateFrom || filters.dateTo) {
        whereClause.slot = {
          date: {}
        };
        if (filters.dateFrom) {
          whereClause.slot.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.slot.date.lte = filters.dateTo;
        }
      }
      if (filters.groupSizeMin || filters.groupSizeMax) {
        whereClause.groupSize = {};
        if (filters.groupSizeMin) {
          whereClause.groupSize.gte = filters.groupSizeMin;
        }
        if (filters.groupSizeMax) {
          whereClause.groupSize.lte = filters.groupSizeMax;
        }
      }
      if (filters.totalAmountMin || filters.totalAmountMax) {
        whereClause.totalAmount = {};
        if (filters.totalAmountMin) {
          whereClause.totalAmount.gte = filters.totalAmountMin;
        }
        if (filters.totalAmountMax) {
          whereClause.totalAmount.lte = filters.totalAmountMax;
        }
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return bookings.map(convertBookingResponse);
  } catch (error) {
    throw error;
  }
};

// Update booking
export const updateBooking = async (
  id: string,
  updateData: UpdateBookingData
): Promise<BookingResponse | null> => {
  try {
    // Check if the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { slot: true },
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // If updating groupSize, check capacity
    if (updateData.groupSize && updateData.groupSize !== existingBooking.groupSize) {
      const currentBookings = await prisma.booking.aggregate({
        where: { 
          slotId: existingBooking.slotId,
          status: { in: ['tentative', 'confirmed'] },
          id: { not: id }, // Exclude current booking
        },
        _sum: { groupSize: true },
      });

      const availableCapacity = existingBooking.slot.capacity - (currentBookings._sum.groupSize || 0);
      
      if (updateData.groupSize > availableCapacity) {
        throw new Error(`Not enough capacity. Available: ${availableCapacity}, Requested: ${updateData.groupSize}`);
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return convertBookingResponse(updatedBooking);
  } catch (error) {
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (id: string): Promise<boolean> => {
  try {
    await prisma.booking.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// Get bookings by visitor ID
export const getBookingsByVisitorId = async (visitorId: string): Promise<BookingResponse[]> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { visitorId },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return bookings.map(convertBookingResponse);
  } catch (error) {
    throw error;
  }
};

// Get bookings by slot ID
export const getBookingsBySlotId = async (slotId: string): Promise<BookingResponse[]> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { slotId },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    return bookings.map(convertBookingResponse);
  } catch (error) {
    throw error;
  }
};

// Confirm booking
export const confirmBooking = async (id: string, confirmedAt?: Date): Promise<BookingResponse | null> => {
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'confirmed',
        confirmedAt: confirmedAt || new Date(),
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return convertBookingResponse(updatedBooking);
  } catch (error) {
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (id: string, cancellationReason: string, cancelledAt?: Date): Promise<BookingResponse | null> => {
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'cancelled',
        cancellationReason,
        cancelledAt: cancelledAt || new Date(),
      },
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return convertBookingResponse(updatedBooking);
  } catch (error) {
    throw error;
  }
};

// Update payment status
export const updateBookingPayment = async (
  id: string, 
  paymentStatus: PaymentStatus, 
  paymentMethod?: PaymentMethod,
  totalAmount?: Decimal
): Promise<BookingResponse | null> => {
  try {
    const updateData: any = { paymentStatus };
    
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    if (totalAmount !== undefined) {
      updateData.totalAmount = totalAmount;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            capacity: true,
            description: true,
          },
        },
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            visitorType: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return convertBookingResponse(updatedBooking);
  } catch (error) {
    throw error;
  }
};

// Check booking availability
export const checkBookingAvailability = async (slotId: string, date: Date): Promise<BookingAvailabilityCheck> => {
  try {
    const slot = await prisma.visitSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error('Visit slot not found');
    }

    const bookings = await prisma.booking.aggregate({
      where: { 
        slotId,
        status: { in: ['tentative', 'confirmed'] }
      },
      _sum: { groupSize: true },
      _count: { id: true },
    });

    const totalBookedCapacity = bookings._sum.groupSize || 0;
    const availableCapacity = slot.capacity - totalBookedCapacity;
    const isAvailable = availableCapacity > 0;

    return {
      slotId,
      date,
      availableCapacity,
      currentBookings: bookings._count.id,
      isAvailable,
      conflictingBookings: bookings._count.id,
    };
  } catch (error) {
    throw error;
  }
};

// Get booking statistics
export const getBookingStatistics = async (): Promise<BookingStatistics> => {
  try {
    const totalBookings = await prisma.booking.count();

    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: {},
      _count: {
        status: true,
      },
    });

    const bookingsByPaymentStatus = await prisma.booking.groupBy({
      by: ['paymentStatus'],
      where: {},
      _count: {
        paymentStatus: true,
      },
    });

    const revenueData = await prisma.booking.aggregate({
      where: {
        paymentStatus: 'paid',
      },
      _sum: {
        totalAmount: true,
      },
      _avg: {
        groupSize: true,
      },
    });

    const bookingsByDate = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        createdAt: true,
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });

    const topPaymentMethods = await prisma.booking.groupBy({
      by: ['paymentMethod'],
      where: {
        paymentMethod: { not: null },
      },
      _count: {
        paymentMethod: true,
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _count: {
          paymentMethod: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalBookings,
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      bookingsByPaymentStatus: bookingsByPaymentStatus.map(item => ({
        paymentStatus: item.paymentStatus,
        count: item._count.paymentStatus,
      })),
      totalRevenue: new Decimal(revenueData._sum.totalAmount || 0),
      averageGroupSize: Number(revenueData._avg.groupSize || 0),
      bookingsByDate: bookingsByDate.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.createdAt,
        revenue: Number(item._sum.totalAmount || 0),
      })),
      topPaymentMethods: topPaymentMethods.map(item => ({
        paymentMethod: item.paymentMethod!,
        count: item._count.paymentMethod,
        totalAmount: new Decimal(item._sum.totalAmount || 0),
      })),
    };
  } catch (error) {
    throw error;
  }
};

// Get booking summary for dashboard
export const getBookingSummary = async (): Promise<BookingSummary> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const pendingPayments = await prisma.booking.count({
      where: {
        paymentStatus: 'pending',
      },
    });

    const confirmedBookings = await prisma.booking.count({
      where: {
        status: 'confirmed',
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        status: 'cancelled',
      },
    });

    const totalRevenue = await prisma.booking.aggregate({
      where: {
        paymentStatus: 'paid',
      },
      _sum: {
        totalAmount: true,
      },
    });

    const upcomingBookings = await prisma.booking.count({
      where: {
        status: { in: ['tentative', 'confirmed'] },
        slot: {
          date: {
            gte: today,
          },
        },
      },
    });

    return {
      todayBookings,
      pendingPayments,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: new Decimal(totalRevenue._sum.totalAmount || 0),
      upcomingBookings,
    };
  } catch (error) {
    throw error;
  }
};
