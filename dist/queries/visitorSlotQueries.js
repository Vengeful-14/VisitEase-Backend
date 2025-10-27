"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSlotBookedCount = exports.cancelVisitorSlot = exports.getVisitorSlotStatistics = exports.checkSlotAvailability = exports.getVisitorSlotsBySlotId = exports.getVisitorSlotsByVisitorId = exports.deleteVisitorSlot = exports.updateVisitorSlot = exports.getVisitorSlots = exports.getVisitorSlotById = exports.createVisitorSlot = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Create a new visitor slot booking
const createVisitorSlot = async (bookingData) => {
    try {
        // First, check if the slot exists and is available
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
        // Check capacity by counting existing bookings for this slot
        const currentBookings = await prisma.booking.count({
            where: {
                slotId: bookingData.slotId,
                status: { in: ['tentative', 'confirmed'] }
            },
        });
        const totalBookedCapacity = await prisma.booking.aggregate({
            where: {
                slotId: bookingData.slotId,
                status: { in: ['tentative', 'confirmed'] }
            },
            _sum: { groupSize: true },
        });
        const availableCapacity = slot.capacity - (totalBookedCapacity._sum.groupSize || 0);
        if (availableCapacity < bookingData.groupSize) {
            throw new Error('Not enough capacity for this booking');
        }
        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                slotId: bookingData.slotId,
                visitorId: bookingData.visitorId,
                status: 'tentative',
                groupSize: bookingData.groupSize,
                totalAmount: bookingData.totalAmount || 0,
                paymentStatus: 'pending',
                paymentMethod: bookingData.paymentMethod || null,
                specialRequests: bookingData.specialRequests || null,
                createdBy: bookingData.createdBy || null
            },
            include: {
                slot: true,
                visitor: true
            }
        });
        return {
            id: booking.id,
            visitorId: booking.visitorId,
            slotId: booking.slotId,
            bookingDate: booking.createdAt,
            groupSize: booking.groupSize,
            status: booking.status,
            specialRequests: booking.specialRequests,
            totalAmount: Number(booking.totalAmount),
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        };
    }
    catch (error) {
        throw new Error(`Failed to create visitor slot booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.createVisitorSlot = createVisitorSlot;
// Get a visitor slot booking by ID
const getVisitorSlotById = async (id) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                slot: true,
                visitor: true
            }
        });
        if (!booking) {
            return null;
        }
        return {
            id: booking.id,
            visitorId: booking.visitorId,
            slotId: booking.slotId,
            bookingDate: booking.createdAt,
            groupSize: booking.groupSize,
            status: booking.status,
            specialRequests: booking.specialRequests,
            totalAmount: Number(booking.totalAmount),
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        };
    }
    catch (error) {
        throw new Error(`Failed to get visitor slot booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getVisitorSlotById = getVisitorSlotById;
// Get all visitor slot bookings with filters
const getVisitorSlots = async (filters) => {
    try {
        const where = {};
        if (filters.visitorId) {
            where.visitorId = filters.visitorId;
        }
        if (filters.slotId) {
            where.slotId = filters.slotId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        const bookings = await prisma.booking.findMany({
            where,
            include: {
                slot: true,
                visitor: true
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
            skip: filters.skip || 0,
            take: filters.limit || 50
        });
        return bookings.map(booking => ({
            id: booking.id,
            visitorId: booking.visitorId,
            slotId: booking.slotId,
            bookingDate: booking.createdAt,
            groupSize: booking.groupSize,
            status: booking.status,
            specialRequests: booking.specialRequests,
            totalAmount: Number(booking.totalAmount),
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));
    }
    catch (error) {
        throw new Error(`Failed to get visitor slot bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getVisitorSlots = getVisitorSlots;
// Update a visitor slot booking
const updateVisitorSlot = async (id, updateData) => {
    try {
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: { slot: true }
        });
        if (!existingBooking) {
            throw new Error('Booking not found');
        }
        // If updating group size, check capacity
        if (updateData.groupSize && updateData.groupSize !== existingBooking.groupSize) {
            const currentBookings = await prisma.booking.aggregate({
                where: {
                    slotId: existingBooking.slotId,
                    status: { in: ['tentative', 'confirmed'] },
                    id: { not: id }
                },
                _sum: { groupSize: true },
            });
            const availableCapacity = existingBooking.slot.capacity - (currentBookings._sum.groupSize || 0);
            if (availableCapacity < updateData.groupSize) {
                throw new Error('Not enough capacity for this booking');
            }
        }
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                ...(updateData.groupSize && { groupSize: updateData.groupSize }),
                ...(updateData.status && { status: updateData.status }),
                ...(updateData.specialRequests !== undefined && { specialRequests: updateData.specialRequests }),
                ...(updateData.totalAmount !== undefined && { totalAmount: updateData.totalAmount }),
                ...(updateData.paymentStatus && { paymentStatus: updateData.paymentStatus }),
                ...(updateData.paymentMethod !== undefined && { paymentMethod: updateData.paymentMethod }),
                ...(updateData.status === 'confirmed' && { confirmedAt: new Date() }),
                ...(updateData.status === 'cancelled' && {
                    cancelledAt: new Date(),
                    cancellationReason: updateData.cancellationReason || null
                })
            },
            include: {
                slot: true,
                visitor: true
            }
        });
        return {
            id: updatedBooking.id,
            visitorId: updatedBooking.visitorId,
            slotId: updatedBooking.slotId,
            bookingDate: updatedBooking.createdAt,
            groupSize: updatedBooking.groupSize,
            status: updatedBooking.status,
            specialRequests: updatedBooking.specialRequests,
            totalAmount: Number(updatedBooking.totalAmount),
            paymentStatus: updatedBooking.paymentStatus,
            paymentMethod: updatedBooking.paymentMethod,
            createdAt: updatedBooking.createdAt,
            updatedAt: updatedBooking.updatedAt
        };
    }
    catch (error) {
        throw new Error(`Failed to update visitor slot booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.updateVisitorSlot = updateVisitorSlot;
// Delete a visitor slot booking
const deleteVisitorSlot = async (id) => {
    try {
        await prisma.booking.delete({
            where: { id }
        });
    }
    catch (error) {
        throw new Error(`Failed to delete visitor slot booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.deleteVisitorSlot = deleteVisitorSlot;
// Get visitor slot bookings by visitor ID
const getVisitorSlotsByVisitorId = async (visitorId) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { visitorId },
            include: {
                slot: true,
                visitor: true
            },
            orderBy: [
                { createdAt: 'desc' }
            ]
        });
        return bookings.map(booking => ({
            id: booking.id,
            visitorId: booking.visitorId,
            slotId: booking.slotId,
            bookingDate: booking.createdAt,
            groupSize: booking.groupSize,
            status: booking.status,
            specialRequests: booking.specialRequests,
            totalAmount: Number(booking.totalAmount),
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));
    }
    catch (error) {
        throw new Error(`Failed to get visitor slot bookings by visitor ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getVisitorSlotsByVisitorId = getVisitorSlotsByVisitorId;
// Get visitor slot bookings by slot ID
const getVisitorSlotsBySlotId = async (slotId) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { slotId },
            include: {
                slot: true,
                visitor: true
            },
            orderBy: [
                { createdAt: 'asc' }
            ]
        });
        return bookings.map(booking => ({
            id: booking.id,
            visitorId: booking.visitorId,
            slotId: booking.slotId,
            bookingDate: booking.createdAt,
            groupSize: booking.groupSize,
            status: booking.status,
            specialRequests: booking.specialRequests,
            totalAmount: Number(booking.totalAmount),
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));
    }
    catch (error) {
        throw new Error(`Failed to get visitor slot bookings by slot ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getVisitorSlotsBySlotId = getVisitorSlotsBySlotId;
// Check slot availability
const checkSlotAvailability = async (slotId, groupSize) => {
    try {
        const slot = await prisma.visitSlot.findUnique({
            where: { id: slotId }
        });
        if (!slot) {
            throw new Error('Slot not found');
        }
        const bookings = await prisma.booking.aggregate({
            where: {
                slotId,
                status: { in: ['tentative', 'confirmed'] }
            },
            _sum: { groupSize: true },
            _count: { id: true }
        });
        const totalBookedCapacity = bookings._sum.groupSize || 0;
        const availableCapacity = slot.capacity - totalBookedCapacity;
        const isAvailable = availableCapacity >= groupSize;
        return {
            slotId,
            totalCapacity: slot.capacity,
            bookedCapacity: totalBookedCapacity,
            availableCapacity,
            isAvailable,
            conflictingBookings: bookings._count.id,
            groupSize
        };
    }
    catch (error) {
        throw new Error(`Failed to check slot availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.checkSlotAvailability = checkSlotAvailability;
// Get visitor slot statistics
const getVisitorSlotStatistics = async () => {
    try {
        const totalBookings = await prisma.booking.count();
        const bookingsByStatus = await prisma.booking.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
            orderBy: {
                status: 'desc',
            }
        });
        const bookingsByDate = await prisma.booking.groupBy({
            by: ['createdAt'],
            _count: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        const averageGroupSize = await prisma.booking.aggregate({
            _avg: {
                groupSize: true,
            }
        });
        const totalVisitors = await prisma.booking.aggregate({
            _sum: {
                groupSize: true,
            }
        });
        return {
            totalBookings,
            bookingsByStatus: bookingsByStatus.map((item) => ({
                status: item.status,
                count: item._count.status,
            })),
            bookingsByDate: bookingsByDate.map((item) => ({
                date: item.createdAt.toISOString().split('T')[0],
                count: item._count.createdAt,
            })),
            averageGroupSize: averageGroupSize._avg.groupSize || 0,
            totalVisitors: totalVisitors._sum.groupSize || 0,
        };
    }
    catch (error) {
        throw new Error(`Failed to get visitor slot statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.getVisitorSlotStatistics = getVisitorSlotStatistics;
// Cancel a visitor slot booking
const cancelVisitorSlot = async (id, reason) => {
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: reason || null
            },
            include: {
                slot: true,
                visitor: true
            }
        });
        return {
            id: updatedBooking.id,
            visitorId: updatedBooking.visitorId,
            slotId: updatedBooking.slotId,
            bookingDate: updatedBooking.createdAt,
            groupSize: updatedBooking.groupSize,
            status: updatedBooking.status,
            specialRequests: updatedBooking.specialRequests,
            totalAmount: Number(updatedBooking.totalAmount),
            paymentStatus: updatedBooking.paymentStatus,
            paymentMethod: updatedBooking.paymentMethod,
            createdAt: updatedBooking.createdAt,
            updatedAt: updatedBooking.updatedAt
        };
    }
    catch (error) {
        throw new Error(`Failed to cancel visitor slot booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.cancelVisitorSlot = cancelVisitorSlot;
// Update slot booked count
const updateSlotBookedCount = async (slotId) => {
    try {
        const totalBookedCapacity = await prisma.booking.aggregate({
            where: {
                slotId,
                status: { in: ['tentative', 'confirmed'] }
            },
            _sum: { groupSize: true }
        });
        await prisma.visitSlot.update({
            where: { id: slotId },
            data: {
                bookedCount: totalBookedCapacity._sum.groupSize || 0
            }
        });
    }
    catch (error) {
        throw new Error(`Failed to update slot booked count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.updateSlotBookedCount = updateSlotBookedCount;
//# sourceMappingURL=visitorSlotQueries.js.map