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
        // Calculate total amount
        const totalAmount = await this.calculateBookingTotal(bookingData.visitorId, bookingData.groupSize, bookingData.slotId);
        // Create booking
        const booking = await this.prisma.booking.create({
            data: {
                slotId: bookingData.slotId,
                visitorId: bookingData.visitorId,
                status: 'tentative',
                groupSize: bookingData.groupSize,
                totalAmount,
                paymentStatus: 'pending',
                paymentMethod: (bookingData.paymentMethod || null),
                specialRequests: bookingData.specialRequests || null,
                createdBy: userId
            }
        });
        // Update slot booked count
        await this.updateSlotBookedCount(bookingData.slotId);
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
        // Update slot booked count
        await this.updateSlotBookedCount(booking.slotId);
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
        // Update slot booked count
        await this.updateSlotBookedCount(booking.slotId);
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
        if (updates.paymentStatus)
            updateData.paymentStatus = updates.paymentStatus;
        if (updates.paymentMethod !== undefined)
            updateData.paymentMethod = updates.paymentMethod;
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
        // Update slot booked count if group size changed
        if (updates.groupSize) {
            await this.updateSlotBookedCount(booking.slotId);
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
    async calculateBookingTotal(visitorId, groupSize, slotId) {
        // Get visitor type
        const visitor = await this.prisma.visitor.findUnique({
            where: { id: visitorId },
            select: { visitorType: true }
        });
        const visitorType = visitor?.visitorType || 'individual';
        // Get slot date for pricing
        const slot = await this.prisma.visitSlot.findUnique({
            where: { id: slotId },
            select: { date: true }
        });
        const slotDate = slot?.date;
        // Get pricing rule
        const pricingRule = await this.prisma.pricingRule.findFirst({
            where: {
                visitorType,
                effectiveDate: { lte: slotDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: slotDate } }
                ],
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });
        let basePrice = 15.00; // Default price
        let discountPercentage = 0;
        let minGroupSize = null;
        if (pricingRule) {
            basePrice = pricingRule.basePrice.toNumber();
            discountPercentage = pricingRule.groupDiscountPercentage.toNumber();
            minGroupSize = pricingRule.minGroupSize;
        }
        let total = basePrice * groupSize;
        // Apply group discount
        if (minGroupSize && groupSize >= minGroupSize) {
            total = total * (1 - discountPercentage / 100);
        }
        return Math.round(total * 100) / 100; // Round to 2 decimal places
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
    transformBooking(data) {
        return {
            id: data.id,
            slotId: data.slotId,
            visitorId: data.visitorId,
            status: data.status,
            groupSize: data.groupSize,
            totalAmount: data.totalAmount.toNumber(),
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            specialRequests: data.specialRequests,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            confirmedAt: data.confirmedAt,
            cancelledAt: data.cancelledAt,
            cancellationReason: data.cancellationReason
        };
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=bookingService.js.map