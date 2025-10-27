"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const prisma_1 = require("../generated/prisma");
class ScheduleService {
    constructor() {
        this.prisma = new prisma_1.PrismaClient();
    }
    async getSlots(filters) {
        const where = {};
        // Date range filter
        if (filters.dateRange) {
            const [startDate, endDate] = filters.dateRange.split(' to ');
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        // Status filter
        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }
        // Search filter
        if (filters.search) {
            where.OR = [
                { description: { contains: filters.search, mode: 'insensitive' } },
                { id: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        const limit = filters.limit || 20;
        const skip = ((filters.page || 1) - 1) * limit;
        const [slots, total] = await Promise.all([
            this.prisma.visitSlot.findMany({
                where,
                include: {
                    bookings: {
                        where: {
                            status: {
                                in: ['confirmed', 'tentative']
                            }
                        }
                    },
                    creator: true
                },
                orderBy: [
                    { date: 'asc' },
                    { startTime: 'asc' }
                ],
                skip,
                take: limit
            }),
            this.prisma.visitSlot.count({ where })
        ]);
        return {
            slots: slots.map(slot => this.transformVisitSlot(slot)),
            total
        };
    }
    async createSlot(slotData, userId) {
        // Validate slot data
        await this.validateSlotData(slotData);
        // Check for conflicts
        await this.checkSlotConflicts(slotData);
        const slot = await this.prisma.visitSlot.create({
            data: {
                date: new Date(slotData.date),
                startTime: slotData.startTime,
                endTime: slotData.endTime,
                durationMinutes: slotData.duration,
                capacity: slotData.capacity,
                status: (slotData.status || 'available'),
                description: slotData.description || '',
                createdBy: userId
            }
        });
        return this.transformVisitSlot(slot);
    }
    async updateSlot(id, updates, userId) {
        // Get current slot data
        const currentSlot = await this.getSlotById(id);
        if (!currentSlot) {
            throw new Error('Slot not found');
        }
        // Validate updates
        await this.validateSlotUpdates(updates, currentSlot);
        // Check for conflicts if time/date changed
        if (updates.date || updates.startTime || updates.endTime) {
            await this.checkSlotConflicts({ ...currentSlot, ...updates });
        }
        // Prepare update data
        const updateData = {};
        if (updates.date)
            updateData.date = new Date(updates.date);
        if (updates.startTime)
            updateData.startTime = updates.startTime;
        if (updates.endTime)
            updateData.endTime = updates.endTime;
        if (updates.duration)
            updateData.durationMinutes = updates.duration;
        if (updates.capacity)
            updateData.capacity = updates.capacity;
        if (updates.status)
            updateData.status = updates.status;
        if (updates.description !== undefined)
            updateData.description = updates.description;
        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }
        const slot = await this.prisma.visitSlot.update({
            where: { id },
            data: updateData
        });
        return this.transformVisitSlot(slot);
    }
    async deleteSlot(id, userId) {
        // Check if slot has active bookings
        const activeBookings = await this.prisma.booking.count({
            where: {
                slotId: id,
                status: {
                    in: ['confirmed', 'tentative']
                }
            }
        });
        if (activeBookings > 0) {
            throw new Error('Cannot delete slot with active bookings');
        }
        await this.prisma.visitSlot.delete({
            where: { id }
        });
    }
    async getScheduleStats() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalSlots, availableSlots, bookedSlots, avgCapacity, avgBookings, capacityStats] = await Promise.all([
            this.prisma.visitSlot.count({
                where: { date: { gte: thirtyDaysAgo } }
            }),
            this.prisma.visitSlot.count({
                where: {
                    date: { gte: thirtyDaysAgo },
                    status: 'available'
                }
            }),
            this.prisma.visitSlot.count({
                where: {
                    date: { gte: thirtyDaysAgo },
                    status: 'booked'
                }
            }),
            this.prisma.visitSlot.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _avg: { capacity: true }
            }),
            this.prisma.visitSlot.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _avg: { bookedCount: true }
            }),
            this.prisma.visitSlot.aggregate({
                where: { date: { gte: thirtyDaysAgo } },
                _sum: { capacity: true, bookedCount: true }
            })
        ]);
        const totalCapacity = capacityStats._sum.capacity || 0;
        const totalBooked = capacityStats._sum.bookedCount || 0;
        const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
        return {
            totalSlots,
            availableSlots,
            bookedSlots,
            averageCapacity: Math.round((avgCapacity._avg.capacity || 0) * 10) / 10,
            averageBookings: Math.round((avgBookings._avg.bookedCount || 0) * 10) / 10,
            utilizationRate: Math.round(utilizationRate * 10) / 10
        };
    }
    async getScheduleIssues() {
        const conflicts = await this.prisma.scheduleConflict.findMany({
            where: {
                status: 'pending'
            },
            include: {
                affectedSlot: true,
                resolver: true
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        return conflicts.map(conflict => ({
            id: conflict.id,
            type: conflict.conflictType,
            title: conflict.title,
            description: conflict.description || '',
            severity: conflict.severity,
            status: conflict.status,
            date: conflict.affectedSlot?.date?.toISOString().split('T')[0] || '',
            time: conflict.affectedSlot?.startTime?.toString() || ''
        }));
    }
    async getSlotById(id) {
        const slot = await this.prisma.visitSlot.findUnique({
            where: { id }
        });
        return slot ? this.transformVisitSlot(slot) : null;
    }
    async validateSlotData(slotData) {
        // Validate date is not in the past
        if (new Date(slotData.date) < new Date()) {
            throw new Error('Cannot create slots in the past');
        }
        // Validate time range
        if (slotData.startTime >= slotData.endTime) {
            throw new Error('Start time must be before end time');
        }
        // Validate capacity
        if (slotData.capacity <= 0) {
            throw new Error('Capacity must be greater than 0');
        }
        // Validate duration
        if (slotData.duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }
    }
    async validateSlotUpdates(updates, currentSlot) {
        // Validate date is not in the past
        if (updates.date && new Date(updates.date) < new Date()) {
            throw new Error('Cannot update slot to past date');
        }
        // Validate time range
        if (updates.startTime && updates.endTime && updates.startTime >= updates.endTime) {
            throw new Error('Start time must be before end time');
        }
        // Validate capacity
        if (updates.capacity && updates.capacity <= 0) {
            throw new Error('Capacity must be greater than 0');
        }
        // Validate duration
        if (updates.duration && updates.duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }
    }
    async checkSlotConflicts(slotData) {
        const conflictingSlots = await this.prisma.visitSlot.findMany({
            where: {
                date: new Date(slotData.date),
                status: {
                    not: 'cancelled'
                },
                OR: [
                    {
                        AND: [
                            { startTime: { lt: slotData.endTime } },
                            { endTime: { gt: slotData.startTime } }
                        ]
                    }
                ]
            }
        });
        if (conflictingSlots.length > 0) {
            throw new Error('Time slot conflicts with existing slots');
        }
    }
    transformVisitSlot(data) {
        return {
            id: data.id,
            date: data.date.toISOString().split('T')[0],
            startTime: data.startTime,
            endTime: data.endTime,
            duration: data.durationMinutes,
            capacity: data.capacity,
            bookedCount: data.bookedCount,
            status: data.status,
            description: data.description || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=scheduleService.js.map