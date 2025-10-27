"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingSummary = exports.getBookingStatistics = exports.checkBookingAvailability = exports.updateBookingPayment = exports.cancelBooking = exports.confirmBooking = exports.getBookingsBySlotId = exports.getBookingsByVisitorId = exports.deleteBooking = exports.updateBooking = exports.getBookings = exports.getBookingById = exports.createBooking = void 0;
const prisma_1 = require("../generated/prisma");
const library_1 = require("../generated/prisma/runtime/library");
const prisma = new prisma_1.PrismaClient();
// Helper function to convert Decimal to number in booking response
const convertBookingResponse = (booking) => {
    return {
        ...booking,
        totalAmount: Number(booking.totalAmount),
    };
};
// Create a new booking
const createBooking = async (bookingData) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.createBooking = createBooking;
// Get booking by ID
const getBookingById = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getBookingById = getBookingById;
// Get all bookings with optional filters
const getBookings = async (filters) => {
    try {
        const whereClause = {};
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
    }
    catch (error) {
        throw error;
    }
};
exports.getBookings = getBookings;
// Update booking
const updateBooking = async (id, updateData) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.updateBooking = updateBooking;
// Delete booking
const deleteBooking = async (id) => {
    try {
        await prisma.booking.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        throw error;
    }
};
exports.deleteBooking = deleteBooking;
// Get bookings by visitor ID
const getBookingsByVisitorId = async (visitorId) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getBookingsByVisitorId = getBookingsByVisitorId;
// Get bookings by slot ID
const getBookingsBySlotId = async (slotId) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.getBookingsBySlotId = getBookingsBySlotId;
// Confirm booking
const confirmBooking = async (id, confirmedAt) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.confirmBooking = confirmBooking;
// Cancel booking
const cancelBooking = async (id, cancellationReason, cancelledAt) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.cancelBooking = cancelBooking;
// Update payment status
const updateBookingPayment = async (id, paymentStatus, paymentMethod, totalAmount) => {
    try {
        const updateData = { paymentStatus };
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
    }
    catch (error) {
        throw error;
    }
};
exports.updateBookingPayment = updateBookingPayment;
// Check booking availability
const checkBookingAvailability = async (slotId, date) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.checkBookingAvailability = checkBookingAvailability;
// Get booking statistics
const getBookingStatistics = async () => {
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
            totalRevenue: new library_1.Decimal(revenueData._sum.totalAmount || 0),
            averageGroupSize: Number(revenueData._avg.groupSize || 0),
            bookingsByDate: bookingsByDate.map(item => ({
                date: item.createdAt.toISOString().split('T')[0],
                count: item._count.createdAt,
                revenue: Number(item._sum.totalAmount || 0),
            })),
            topPaymentMethods: topPaymentMethods.map(item => ({
                paymentMethod: item.paymentMethod,
                count: item._count.paymentMethod,
                totalAmount: new library_1.Decimal(item._sum.totalAmount || 0),
            })),
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getBookingStatistics = getBookingStatistics;
// Get booking summary for dashboard
const getBookingSummary = async () => {
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
            totalRevenue: new library_1.Decimal(totalRevenue._sum.totalAmount || 0),
            upcomingBookings,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getBookingSummary = getBookingSummary;
//# sourceMappingURL=bookingQueries.js.map