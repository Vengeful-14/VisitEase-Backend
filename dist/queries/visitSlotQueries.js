"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitSlotsByStatus = exports.deleteVisitSlot = exports.updateVisitSlot = exports.getAvailableVisitSlots = exports.getVisitSlotsByDateRange = exports.getVisitSlotById = exports.createMultipleVisitSlots = exports.createVisitSlot = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Create a new visit slot
const createVisitSlot = async (slotData) => {
    try {
        const slot = await prisma.visitSlot.create({
            data: {
                date: slotData.date,
                startTime: slotData.startTime,
                endTime: slotData.endTime,
                durationMinutes: slotData.durationMinutes,
                capacity: slotData.capacity,
                status: slotData.status || 'available',
                description: slotData.description,
                createdBy: slotData.createdBy,
            },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return slot;
    }
    catch (error) {
        throw error;
    }
};
exports.createVisitSlot = createVisitSlot;
// Create multiple visit slots
const createMultipleVisitSlots = async (slotsData) => {
    try {
        const slots = await prisma.visitSlot.createMany({
            data: slotsData.map(slot => ({
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                durationMinutes: slot.durationMinutes,
                capacity: slot.capacity,
                status: slot.status || 'available',
                description: slot.description,
                createdBy: slot.createdBy,
            })),
        });
        // Return the created slots (Note: createMany doesn't return the created records)
        // We'll need to fetch them separately if needed
        return [];
    }
    catch (error) {
        throw error;
    }
};
exports.createMultipleVisitSlots = createMultipleVisitSlots;
// Get visit slot by ID
const getVisitSlotById = async (id) => {
    try {
        const slot = await prisma.visitSlot.findUnique({
            where: { id },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return slot;
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitSlotById = getVisitSlotById;
// Get visit slots by date range
const getVisitSlotsByDateRange = async (startDate, endDate) => {
    try {
        const slots = await prisma.visitSlot.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return slots;
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitSlotsByDateRange = getVisitSlotsByDateRange;
// Get available visit slots
const getAvailableVisitSlots = async (startDate, endDate) => {
    try {
        const whereClause = {
            status: 'available',
            bookedCount: {
                lt: prisma.visitSlot.fields.capacity,
            },
        };
        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate,
                lte: endDate,
            };
        }
        const slots = await prisma.visitSlot.findMany({
            where: whereClause,
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return slots;
    }
    catch (error) {
        throw error;
    }
};
exports.getAvailableVisitSlots = getAvailableVisitSlots;
// Update visit slot
const updateVisitSlot = async (id, updateData) => {
    try {
        const slot = await prisma.visitSlot.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return slot;
    }
    catch (error) {
        throw error;
    }
};
exports.updateVisitSlot = updateVisitSlot;
// Delete visit slot
const deleteVisitSlot = async (id) => {
    try {
        await prisma.visitSlot.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        throw error;
    }
};
exports.deleteVisitSlot = deleteVisitSlot;
// Get visit slots by status
const getVisitSlotsByStatus = async (status) => {
    try {
        const slots = await prisma.visitSlot.findMany({
            where: { status },
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                durationMinutes: true,
                capacity: true,
                bookedCount: true,
                status: true,
                description: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return slots;
    }
    catch (error) {
        throw error;
    }
};
exports.getVisitSlotsByStatus = getVisitSlotsByStatus;
//# sourceMappingURL=visitSlotQueries.js.map