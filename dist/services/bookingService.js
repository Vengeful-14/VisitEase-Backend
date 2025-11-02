"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const prisma_1 = require("../generated/prisma");
const systemLogService_1 = require("./systemLogService");
class BookingService {
    constructor() {
        this.prisma = new prisma_1.PrismaClient();
        this.systemLogService = new systemLogService_1.SystemLogService();
    }
    async createBooking(bookingData, userId) {
        // Validate slot availability
        await this.validateSlotAvailability(bookingData.slotId, bookingData.groupSize);
        // Create booking
        const booking = await this.prisma.booking.create({
            data: {
                slotId: bookingData.slotId,
                visitorId: bookingData.visitorId,
                status: 'tentative',
                groupSize: bookingData.groupSize,
                specialRequests: bookingData.specialRequests || null,
                createdBy: userId
            }
        });
        // Update slot booked count and status
        await this.updateSlotBookedCount(bookingData.slotId);
        await this.updateSlotStatus(bookingData.slotId);
        // Get visitor and slot information for logging
        const [visitor, slot] = await Promise.all([
            this.prisma.visitor.findUnique({ where: { id: bookingData.visitorId } }),
            this.prisma.visitSlot.findUnique({ where: { id: bookingData.slotId } })
        ]);
        // Log the booking creation
        try {
            await this.systemLogService.logBookingCreated({
                bookingId: booking.id,
                visitorName: visitor?.name || 'Unknown Visitor',
                slotDate: slot?.date.toISOString().split('T')[0] || 'Unknown Date',
                slotTime: slot?.startTime || 'Unknown Time',
                groupSize: bookingData.groupSize,
                userId: userId
            });
        }
        catch (logError) {
            // Don't fail the main operation if logging fails
            console.error('Failed to log booking creation:', logError);
        }
        return this.transformBooking(booking);
    }
    async confirmBooking(bookingId, userId) {
        const booking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'confirmed',
                confirmedAt: new Date()
            }
        });
        // Update slot booked count and status
        await this.updateSlotBookedCount(booking.slotId);
        await this.updateSlotStatus(booking.slotId);
        return this.transformBooking(booking);
    }
    async cancelBooking(bookingId, reason, userId) {
        const booking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: reason
            }
        });
        // Update slot booked count and status
        await this.updateSlotBookedCount(booking.slotId);
        await this.updateSlotStatus(booking.slotId);
        // Get visitor and slot information for logging
        const [visitor, slot] = await Promise.all([
            this.prisma.visitor.findUnique({ where: { id: booking.visitorId } }),
            this.prisma.visitSlot.findUnique({ where: { id: booking.slotId } })
        ]);
        // Log the booking cancellation
        try {
            await this.systemLogService.logBookingCancelled({
                bookingId: booking.id,
                visitorName: visitor?.name || 'Unknown Visitor',
                slotDate: slot?.date.toISOString().split('T')[0] || 'Unknown Date',
                slotTime: slot?.startTime || 'Unknown Time',
                reason: reason,
                userId: userId
            });
        }
        catch (logError) {
            // Don't fail the main operation if logging fails
            console.error('Failed to log booking cancellation:', logError);
        }
        return this.transformBooking(booking);
    }
    async getBookings(filters) {
        const where = {};
        if (filters.slotId)
            where.slotId = filters.slotId;
        if (filters.visitorId)
            where.visitorId = filters.visitorId;
        if (filters.status)
            where.status = filters.status;
        const limit = filters.limit || 20;
        const skip = ((filters.page || 1) - 1) * limit;
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: {
                    slot: true,
                    visitor: true,
                    creator: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.booking.count({ where })
        ]);
        return {
            bookings: bookings.map(booking => this.transformBooking(booking)),
            total
        };
    }
    async getBookingById(id) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                slot: true,
                visitor: true,
                creator: true
            }
        });
        return booking ? this.transformBooking(booking) : null;
    }
    async updateBooking(id, updates, userId) {
        // Prepare update data
        const updateData = {};
        if (updates.status)
            updateData.status = updates.status;
        if (updates.groupSize)
            updateData.groupSize = updates.groupSize;
        if (updates.notes !== undefined)
            updateData.notes = updates.notes;
        if (updates.specialRequests !== undefined)
            updateData.specialRequests = updates.specialRequests;
        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }
        const booking = await this.prisma.booking.update({
            where: { id },
            data: updateData
        });
        // Update slot booked count and status if group size changed
        if (updates.groupSize) {
            await this.updateSlotBookedCount(booking.slotId);
            await this.updateSlotStatus(booking.slotId);
        }
        return this.transformBooking(booking);
    }
    async validateSlotAvailability(slotId, groupSize) {
        const slot = await this.prisma.visitSlot.findUnique({
            where: { id: slotId }
        });
        if (!slot) {
            throw new Error('Slot not found');
        }
        if (slot.status !== 'available') {
            throw new Error('Slot is not available for booking');
        }
        if (slot.bookedCount + groupSize > slot.capacity) {
            throw new Error('Not enough capacity for the requested group size');
        }
    }
    async updateSlotBookedCount(slotId) {
        const bookedCount = await this.prisma.booking.aggregate({
            where: {
                slotId,
                status: {
                    in: ['confirmed', 'tentative']
                }
            },
            _sum: { groupSize: true }
        });
        await this.prisma.visitSlot.update({
            where: { id: slotId },
            data: { bookedCount: bookedCount._sum.groupSize || 0 }
        });
    }
    async updateSlotStatus(slotId) {
        // Get current slot info
        const slot = await this.prisma.visitSlot.findUnique({
            where: { id: slotId },
            select: { capacity: true, bookedCount: true }
        });
        if (!slot)
            return;
        // Determine new status based on capacity
        let newStatus;
        if (slot.bookedCount >= slot.capacity) {
            newStatus = 'booked'; // Fully booked
        }
        else if (slot.bookedCount > 0) {
            newStatus = 'partially_booked'; // Partially booked
        }
        else {
            newStatus = 'available'; // Available
        }
        console.log(`Updating slot ${slotId} status: ${slot.bookedCount}/${slot.capacity} -> ${newStatus}`);
        // Update slot status
        await this.prisma.visitSlot.update({
            where: { id: slotId },
            data: { status: newStatus }
        });
    }
    transformBooking(data) {
        return {
            id: data.id,
            slotId: data.slotId,
            visitorId: data.visitorId,
            status: data.status,
            groupSize: data.groupSize,
            notes: data.notes,
            specialRequests: data.specialRequests,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            confirmedAt: data.confirmedAt,
            cancelledAt: data.cancelledAt,
            cancellationReason: data.cancellationReason,
            // Include visitor summary if available
            visitor: data.visitor ? {
                id: data.visitor.id,
                name: data.visitor.name,
                email: data.visitor.email,
                phone: data.visitor.phone,
                organization: data.visitor.organization,
                visitorType: data.visitor.visitorType,
                specialRequirements: data.visitor.specialRequirements
            } : undefined,
            // Include slot summary if available
            slot: data.slot ? {
                id: data.slot.id,
                date: data.slot.date,
                startTime: data.slot.startTime,
                endTime: data.slot.endTime,
                capacity: data.slot.capacity,
                bookedCount: data.slot.bookedCount,
                description: data.slot.description
            } : undefined
        };
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=bookingService.js.map