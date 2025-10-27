import { PrismaClient } from '../generated/prisma';
import { SystemLogService } from './systemLogService';

export interface VisitSlot {
  id: string;
  date: string;
  startTime: string; // Format: "HH:MM:SS" or "HH:MM"
  endTime: string;   // Format: "HH:MM:SS" or "HH:MM"
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  status: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  averageCapacity: number;
  averageBookings: number;
  utilizationRate: number;
}

export interface ScheduleIssue {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  date: string;
  time: string;
}

export class ScheduleService {
  private prisma: PrismaClient;
  private systemLogService: SystemLogService;

  constructor() {
    this.prisma = new PrismaClient();
    this.systemLogService = new SystemLogService();
  }

  async getSlots(filters: {
    dateRange?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{slots: VisitSlot[], total: number}> {
    
    const where: any = {};

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
      where.status = filters.status as any;
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

  async createSlot(slotData: any, userId: string): Promise<VisitSlot> {
    console.log('ScheduleService - createSlot called with data:', {
      date: slotData.date,
      dateType: typeof slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      capacity: slotData.capacity
    });

    // Validate slot data
    await this.validateSlotData(slotData);

    // Check for conflicts
    await this.checkSlotConflicts(slotData);

    // Validate and format time strings
    const startTime = this.validateAndFormatTime(slotData.startTime);
    const endTime = this.validateAndFormatTime(slotData.endTime);
    
    // Validate that end time is after start time
    if (this.compareTimeStrings(startTime, endTime) >= 0) {
      throw new Error('End time must be after start time');
    }
    
    // Parse date properly - handle both Date objects and date strings
    let parsedDate: Date;
    console.log('ScheduleService - Parsing date:', {
      originalDate: slotData.date,
      dateType: typeof slotData.date,
      isDate: slotData.date instanceof Date
    });

    if (slotData.date instanceof Date) {
      parsedDate = slotData.date;
      console.log('ScheduleService - Date is already a Date object');
    } else if (typeof slotData.date === 'string') {
      // Handle date string - try to parse it
      const dateStr = slotData.date.trim();
      console.log('ScheduleService - Processing date string:', dateStr);
      
      // Check if date string is empty
      if (!dateStr) {
        throw new Error('Date is required');
      }
      
      if (dateStr.includes('T')) {
        // ISO string format
        parsedDate = new Date(dateStr);
        console.log('ScheduleService - Parsed as ISO string');
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format (YYYY-MM-DD) - create date in UTC to avoid timezone issues
        const isoString = dateStr + 'T00:00:00.000Z';
        parsedDate = new Date(isoString);
        console.log('ScheduleService - Parsed as YYYY-MM-DD format:', isoString);
      } else {
        // Try to parse as regular date string
        parsedDate = new Date(dateStr);
        console.log('ScheduleService - Parsed as regular date string');
      }
    } else {
      throw new Error('Invalid date format');
    }

    console.log('ScheduleService - Final parsed date:', {
      parsedDate,
      isValid: !isNaN(parsedDate.getTime()),
      isoString: parsedDate.toISOString()
    });

    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date provided: ${slotData.date}`);
    }

    const slot = await this.prisma.visitSlot.create({
      data: {
        date: parsedDate,
        startTime: startTime,
        endTime: endTime,
        durationMinutes: slotData.durationMinutes || slotData.duration,
        capacity: slotData.capacity,
        status: (slotData.status || 'available') as any,
        description: slotData.description || '',
        createdBy: userId
      }
    });

    // Log the slot creation
    try {
      await this.systemLogService.logSlotCreated({
        slotId: slot.id,
        date: slotData.date,
        startTime: startTime,
        endTime: endTime,
        capacity: slotData.capacity,
        description: slotData.description,
        userId: userId
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log slot creation:', logError);
    }

    return this.transformVisitSlot(slot);
  }

  async updateSlot(id: string, updates: Partial<VisitSlot> & { date?: Date | string }, userId: string): Promise<VisitSlot> {
    console.log('ScheduleService - updateSlot called with:', {
      id,
      updates,
      userId
    });

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

    // Prepare update data with proper parsing
    const updateData: any = {};
    
    if (updates.date) {
      // Parse date properly - handle both Date objects and date strings
      let parsedDate: Date;
      if (updates.date && typeof updates.date === 'object' && (updates.date as any) instanceof Date) {
        parsedDate = updates.date;
      } else if (typeof updates.date === 'string') {
        const dateStr = updates.date.trim();
        if (!dateStr) {
          throw new Error('Date is required');
        }
        if (dateStr.includes('T')) {
          parsedDate = new Date(dateStr);
        } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          parsedDate = new Date(dateStr + 'T00:00:00.000Z');
        } else {
          parsedDate = new Date(dateStr);
        }
      } else {
        throw new Error('Invalid date format');
      }
      
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date provided: ${updates.date}`);
      }
      updateData.date = parsedDate;
    }
    
    if (updates.startTime) {
      // Parse start time properly
      const startTime = this.validateAndFormatTime(updates.startTime);
      updateData.startTime = startTime;
    }
    
    if (updates.endTime) {
      // Parse end time properly
      const endTime = this.validateAndFormatTime(updates.endTime);
      updateData.endTime = endTime;
    }
    
    if (updates.durationMinutes) {
      updateData.durationMinutes = updates.durationMinutes;
    }
    
    if (updates.capacity) updateData.capacity = updates.capacity;
    if (updates.status) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    console.log('ScheduleService - Final update data:', updateData);

    const slot = await this.prisma.visitSlot.update({
      where: { id },
      data: updateData
    });

    // Log the slot update
    try {
      await this.systemLogService.logSlotUpdated({
        slotId: slot.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        description: slot.description || undefined,
        userId: userId,
        changes: updates
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log slot update:', logError);
    }

    return this.transformVisitSlot(slot);
  }

  async deleteSlot(id: string, userId: string): Promise<void> {
    // Get slot data before deletion for logging
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id }
    });

    if (!slot) {
      throw new Error('Slot not found');
    }

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

    // Log the slot deletion
    try {
      await this.systemLogService.logSlotDeleted({
        slotId: slot.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        userId: userId
      });
    } catch (logError) {
      // Don't fail the main operation if logging fails
      console.error('Failed to log slot deletion:', logError);
    }
  }

  async getScheduleStats(): Promise<ScheduleStats> {
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

  async getScheduleIssues(): Promise<ScheduleIssue[]> {
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

  async getSlotById(id: string): Promise<VisitSlot | null> {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id }
    });

    return slot ? this.transformVisitSlot(slot) : null;
  }

  private async validateSlotData(slotData: any): Promise<void> {
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

  private async validateSlotUpdates(updates: any, currentSlot: VisitSlot): Promise<void> {
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

  private async checkSlotConflicts(slotData: any): Promise<void> {
    // Validate and format time strings
    const startTime = this.validateAndFormatTime(slotData.startTime);
    const endTime = this.validateAndFormatTime(slotData.endTime);

    // Parse date properly for conflict checking
    let parsedDate: Date;
    if (slotData.date instanceof Date) {
      parsedDate = slotData.date;
    } else if (typeof slotData.date === 'string') {
      const dateStr = slotData.date.trim();
      
      // Check if date string is empty
      if (!dateStr) {
        throw new Error('Date is required');
      }
      
      if (dateStr.includes('T')) {
        parsedDate = new Date(dateStr);
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format (YYYY-MM-DD) - create date in UTC to avoid timezone issues
        parsedDate = new Date(dateStr + 'T00:00:00.000Z');
      } else {
        // Try to parse as regular date string
        parsedDate = new Date(dateStr);
      }
    } else {
      throw new Error('Invalid date format');
    }

    // Validate the parsed date
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date provided: ${slotData.date}`);
    }

    // Get all slots for the same date
    const existingSlots = await this.prisma.visitSlot.findMany({
      where: {
        date: parsedDate,
        status: {
          not: 'cancelled'
        }
      }
    });

    // Check for time conflicts using string comparison
    for (const existingSlot of existingSlots) {
      const existingStart = existingSlot.startTime;
      const existingEnd = existingSlot.endTime;
      
      // Check if new slot overlaps with existing slot
      if (
        (this.compareTimeStrings(startTime, existingStart) < 0 && this.compareTimeStrings(endTime, existingStart) > 0) ||
        (this.compareTimeStrings(startTime, existingEnd) < 0 && this.compareTimeStrings(endTime, existingEnd) > 0) ||
        (this.compareTimeStrings(startTime, existingStart) >= 0 && this.compareTimeStrings(endTime, existingEnd) <= 0)
      ) {
        throw new Error('Time slot conflicts with existing slots');
      }
    }
  }

  private transformVisitSlot(data: any): VisitSlot {
    return {
      id: data.id,
      date: data.date.toISOString().split('T')[0],
      startTime: data.startTime, // Now a string
      endTime: data.endTime,     // Now a string
      durationMinutes: data.durationMinutes,
      capacity: data.capacity,
      bookedCount: data.bookedCount,
      status: data.status,
      description: data.description || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private validateAndFormatTime(timeInput: any): string {
    if (!timeInput) {
      throw new Error('Time is required');
    }

    let timeString: string;
    
    if (typeof timeInput === 'string') {
      timeString = timeInput.trim();
    } else if (timeInput instanceof Date) {
      // Convert Date to time string
      const hours = timeInput.getHours().toString().padStart(2, '0');
      const minutes = timeInput.getMinutes().toString().padStart(2, '0');
      const seconds = timeInput.getSeconds().toString().padStart(2, '0');
      timeString = `${hours}:${minutes}:${seconds}`;
    } else {
      throw new Error('Invalid time format');
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(timeString)) {
      throw new Error('Time must be in format HH:MM or HH:MM:SS');
    }

    // Normalize to HH:MM:SS format
    if (timeString.length === 5) { // HH:MM format
      timeString += ':00';
    }

    return timeString;
  }

  private compareTimeStrings(time1: string, time2: string): number {
    const [h1, m1, s1] = time1.split(':').map(Number);
    const [h2, m2, s2] = time2.split(':').map(Number);
    
    const totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
    const totalSeconds2 = h2 * 3600 + m2 * 60 + s2;
    
    return totalSeconds1 - totalSeconds2;
  }
}
