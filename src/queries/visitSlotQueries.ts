import { PrismaClient, VisitSlot, SlotStatus } from '../generated/prisma';
import { CreateVisitSlotData, UpdateVisitSlotData, VisitSlotResponse } from '../type';

const prisma = new PrismaClient();

// Create a new visit slot
export const createVisitSlot = async (slotData: CreateVisitSlotData): Promise<VisitSlotResponse> => {
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
  } catch (error) {
    throw error;
  }
};

// Create multiple visit slots
export const createMultipleVisitSlots = async (slotsData: CreateVisitSlotData[]): Promise<VisitSlotResponse[]> => {
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
  } catch (error) {
    throw error;
  }
};

// Get visit slot by ID
export const getVisitSlotById = async (id: string): Promise<VisitSlotResponse | null> => {
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
  } catch (error) {
    throw error;
  }
};

// Get visit slots by date range
export const getVisitSlotsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<VisitSlotResponse[]> => {
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
  } catch (error) {
    throw error;
  }
};

// Get available visit slots
export const getAvailableVisitSlots = async (
  startDate?: Date,
  endDate?: Date
): Promise<VisitSlotResponse[]> => {
  try {
    const whereClause: any = {
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
  } catch (error) {
    throw error;
  }
};

// Update visit slot
export const updateVisitSlot = async (
  id: string,
  updateData: UpdateVisitSlotData
): Promise<VisitSlotResponse | null> => {
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
  } catch (error) {
    throw error;
  }
};

// Delete visit slot
export const deleteVisitSlot = async (id: string): Promise<boolean> => {
  try {
    await prisma.visitSlot.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// Get visit slots by status
export const getVisitSlotsByStatus = async (status: SlotStatus): Promise<VisitSlotResponse[]> => {
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
  } catch (error) {
    throw error;
  }
};
