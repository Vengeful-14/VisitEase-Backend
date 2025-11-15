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

  async expirePastUnbookedSlots(referenceDate?: Date): Promise<{ expiredCount: number; cutoffDate: string }> {
    const today = referenceDate ? new Date(referenceDate) : new Date();
    // Normalize to start of day to compare by date only
    const cutoff = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Find candidate slots (no active bookings)
    const candidates = await this.prisma.visitSlot.findMany({
      where: {
        date: { lte: cutoff as any },
        status: { in: ['available', 'booked'] as any },
        bookings: {
          none: {
            status: { in: ['tentative', 'confirmed'] as any }
          }
        }
      },
      select: { id: true, date: true, startTime: true, endTime: true }
    });

    if (candidates.length === 0) {
      return { expiredCount: 0, cutoffDate: cutoff.toISOString() };
    }

    const result = await this.prisma.visitSlot.updateMany({
      where: {
        id: { in: candidates.map(c => c.id) }
      },
      data: { status: 'expired' as any }
    });

    // Best-effort log entry
    try {
      await this.systemLogService.createLog({
        level: 'info',
        message: `Auto-expired ${result.count} slots with no bookings up to ${cutoff.toISOString().slice(0,10)}`,
        context: {
          action: 'slots_auto_expired',
          actionType: 'Schedule Maintenance',
          expiredCount: result.count,
          cutoffDate: cutoff.toISOString(),
        },
      });
    } catch {}

    return { expiredCount: result.count, cutoffDate: cutoff.toISOString() };
  }

  async getSlots(filters: {
    dateRange?: string;
    dateFrom?: Date | string;
    dateTo?: Date | string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{slots: VisitSlot[], total: number}> {
    
    const where: any = {};

    // Date range filter - support both dateRange string and dateFrom/dateTo
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(' to ');
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom instanceof Date ? filters.dateFrom : new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo instanceof Date ? filters.dateTo : new Date(filters.dateTo);
      }
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

    // Auto-mark past slots as expired in response (and persist best-effort)
    const now = new Date();

    const normalizedSlots = await Promise.all(slots.map(async (slot) => {
      // Build slot start datetime using date + startTime
      const slotStart = new Date(slot.date);
      try {
        const [hh, mm, ss] = String(slot.startTime || '00:00:00').split(':').map(v => parseInt(v || '0', 10));
        slotStart.setHours(hh || 0, mm || 0, ss || 0, 0);
      } catch {}
      const shouldExpire = now > slotStart && slot.status !== ('cancelled' as any) && slot.status !== ('expired' as any);
      if (shouldExpire) {
        // Persist in background (ignore errors to not block listing)
        this.prisma.visitSlot.update({
          where: { id: slot.id },
          data: { status: 'expired' as any }
        }).catch(() => {});
        return this.transformVisitSlot({ ...slot, status: 'expired' });
      }
      return this.transformVisitSlot(slot);
    }));

    return {
      slots: normalizedSlots,
      total
    };
  }

  async createSlot(slotData: any, userId: string): Promise<VisitSlot> {
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

    if (slotData.date instanceof Date) {
      parsedDate = slotData.date;
    } else if (typeof slotData.date === 'string') {
      // Handle date string - try to parse it
      const dateStr = slotData.date.trim();
      
      // Check if date string is empty
      if (!dateStr) {
        throw new Error('Date is required');
      }
      
      if (dateStr.includes('T')) {
        // ISO string format
        parsedDate = new Date(dateStr);
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format (YYYY-MM-DD) - create date in UTC to avoid timezone issues
        const isoString = dateStr + 'T00:00:00.000Z';
        parsedDate = new Date(isoString);
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

    // Get current slot data
    const currentSlot = await this.getSlotById(id);
    
    if (!currentSlot) {
      throw new Error('Slot not found');
    }

    // Validate updates
    await this.validateSlotUpdates(updates, currentSlot);

    // Check for conflicts if time/date changed
    if (updates.date || updates.startTime || updates.endTime) {
      await this.checkSlotConflicts({ ...currentSlot, ...updates }, id); // Pass current slot ID to exclude it
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

  async getScheduleStats(month?: number, year?: number): Promise<ScheduleStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate date range based on month/year or default to last 30 days
    let dateFrom: Date;
    let dateTo: Date;
    
    if (month && year) {
      // First day of selected month (month is 1-indexed, Date uses 0-indexed)
      dateFrom = new Date(year, month - 1, 1);
      dateFrom.setHours(0, 0, 0, 0);
      
      // Always use the last day of the selected month (not today, even if current month)
      dateTo = new Date(year, month, 0); // Last day of month
      dateTo.setHours(23, 59, 59, 999);
    } else {
      // Default: last 30 days
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      dateTo = new Date(today);
    }

    const [totalSlots, availableSlots, bookedSlots, avgCapacity, avgBookings, capacityStats] = await Promise.all([
      this.prisma.visitSlot.count({
        where: { date: { gte: dateFrom, lte: dateTo } }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: dateFrom, lte: dateTo },
          status: 'available'
        }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: dateFrom, lte: dateTo },
          status: 'booked'
        }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: dateFrom, lte: dateTo } },
        _avg: { capacity: true }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: dateFrom, lte: dateTo } },
        _avg: { bookedCount: true }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: dateFrom, lte: dateTo } },
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

  // Public method to get only available slots for booking (no authentication required)
  async getPublicAvailableSlots(filters?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{slots: VisitSlot[], total: number}> {
    const now = new Date();
    const where: any = {
      status: 'available',
      // Only get slots that haven't passed yet (date + startTime)
    };

    // Date range filter (optional)
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    } else {
      // Default: only future dates
      where.date = {
        gte: new Date(now.toISOString().split('T')[0])
      };
    }

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
          }
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ]
      }),
      this.prisma.visitSlot.count({ where })
    ]);

    // Filter out past slots based on date + startTime and calculate booked count
    const normalizedSlots = slots
      .map(slot => {
        // Calculate actual booked count from bookings relation
        const bookedCount = slot.bookings?.length || 0;
        const transformedSlot = this.transformVisitSlot({
          ...slot,
          bookedCount
        });
        return transformedSlot;
      })
      .filter(slot => {
        // Build slot start datetime using date + startTime
        const slotStart = new Date(slot.date);
        try {
          const [hh, mm, ss] = String(slot.startTime || '00:00:00').split(':').map(v => parseInt(v || '0', 10));
          slotStart.setHours(hh || 0, mm || 0, ss || 0, 0);
        } catch {}
        // Only return slots that haven't passed yet and have available capacity
        const availableSpots = slot.capacity - slot.bookedCount;
        return now < slotStart && slot.status === 'available' && availableSpots > 0;
      });

    return {
      slots: normalizedSlots,
      total: normalizedSlots.length
    };
  }

  private async validateSlotData(slotData: any): Promise<void> {
    // Validate date is not in the past
    // Normalize dates to midnight for accurate comparison
    const slotDate = new Date(slotData.date);
    slotDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (slotDate < today) {
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

  private async checkSlotConflicts(slotData: any, excludeSlotId?: string): Promise<void> {
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

    // Build where clause - exclude cancelled slots and optionally the current slot being updated
    const where: any = {
      date: parsedDate,
      status: {
        not: 'cancelled'
      }
    };
    
    // Exclude the current slot if we're updating (not creating)
    if (excludeSlotId) {
      where.id = {
        not: excludeSlotId
      };
    }

    // Get all slots for the same date (excluding the current slot if updating)
    const existingSlots = await this.prisma.visitSlot.findMany({
      where
    });

    // Check for time conflicts using string comparison
    // Two slots conflict if they overlap (not just touch at boundaries)
    for (const existingSlot of existingSlots) {
      const existingStart = existingSlot.startTime;
      const existingEnd = existingSlot.endTime;
      
      // Check if the new/updated slot overlaps with an existing slot
      // Overlap occurs when:
      // 1. New slot starts before existing slot ends AND new slot ends after existing slot starts
      // This means they have time in common (not just touching endpoints)
      const newStartBeforeExistingEnd = this.compareTimeStrings(startTime, existingEnd) < 0;
      const newEndAfterExistingStart = this.compareTimeStrings(endTime, existingStart) > 0;
      
      if (newStartBeforeExistingEnd && newEndAfterExistingStart) {
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

  async generateSchedules(
    options: {
      month: number;
      year: number;
      dayStartTime: string;
      dayEndTime: string;
      slotDuration: number;
      capacity: number;
      excludedDays?: number[];
      vacantRanges?: Array<{ startTime: string; endTime: string }>;
    },
    userId: string
  ): Promise<{ created: VisitSlot[]; skipped: number; skippedDates: string[] }> {
    const { month, year, dayStartTime, dayEndTime, slotDuration, capacity, excludedDays = [], vacantRanges = [] } = options;

    // Validate inputs
    if (month < 1 || month > 12) {
      throw new Error('Invalid month');
    }
    if (year < 2020 || year > 2100) {
      throw new Error('Invalid year');
    }
    if (slotDuration < 15 || slotDuration > 480) {
      throw new Error('Slot duration must be between 15 and 480 minutes');
    }
    if (capacity < 1 || capacity > 1000) {
      throw new Error('Capacity must be between 1 and 1000');
    }

    // Validate and format times
    const startTime = this.validateAndFormatTime(dayStartTime);
    const endTime = this.validateAndFormatTime(dayEndTime);
    
    if (this.compareTimeStrings(startTime, endTime) >= 0) {
      throw new Error('Day end time must be after day start time');
    }

    // Validate vacant ranges
    for (const range of vacantRanges) {
      const rangeStart = this.validateAndFormatTime(range.startTime);
      const rangeEnd = this.validateAndFormatTime(range.endTime);
      
      if (this.compareTimeStrings(rangeStart, rangeEnd) >= 0) {
        throw new Error(`Invalid vacant range: ${range.startTime} - ${range.endTime}`);
      }
      
      // Check if range is within day time slot
      if (this.compareTimeStrings(rangeStart, startTime) < 0 || this.compareTimeStrings(rangeEnd, endTime) > 0) {
        throw new Error(`Vacant range ${range.startTime} - ${range.endTime} is outside day time slot ${dayStartTime} - ${dayEndTime}`);
      }
    }

    // Check for overlapping vacant ranges
    for (let i = 0; i < vacantRanges.length; i++) {
      for (let j = i + 1; j < vacantRanges.length; j++) {
        const range1Start = this.validateAndFormatTime(vacantRanges[i].startTime);
        const range1End = this.validateAndFormatTime(vacantRanges[i].endTime);
        const range2Start = this.validateAndFormatTime(vacantRanges[j].startTime);
        const range2End = this.validateAndFormatTime(vacantRanges[j].endTime);
        
        if (this.compareTimeStrings(range1Start, range2End) < 0 && this.compareTimeStrings(range2Start, range1End) < 0) {
          throw new Error(`Vacant ranges overlap: ${vacantRanges[i].startTime}-${vacantRanges[i].endTime} and ${vacantRanges[j].startTime}-${vacantRanges[j].endTime}`);
        }
      }
    }

    // Get existing slots for the month to exclude dates
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0); // Last day of month (day 0 of next month)
    endDate.setHours(23, 59, 59, 999);
    
    const existingSlots = await this.prisma.visitSlot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
      },
    });

    const existingDates = new Set<string>();
    existingSlots.forEach(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      const slotYear = slotDate.getFullYear();
      const slotMonth = slotDate.getMonth() + 1; // getMonth() returns 0-11
      
      // Only include dates that are in the selected month and year
      if (slotYear === year && slotMonth === month) {
        const dateStr = `${slotYear}-${String(slotMonth).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;
        existingDates.add(dateStr);
      }
    });
    
    // Validation: Check if there are any existing slots for dates that would be generated
    // Calculate which dates would be generated (excluding excluded days and past dates)
    const daysInMonth = new Date(year, month, 0).getDate();
    const nowForValidation = new Date();
    const todayUTC = new Date(Date.UTC(nowForValidation.getUTCFullYear(), nowForValidation.getUTCMonth(), nowForValidation.getUTCDate(), 0, 0, 0, 0));
    const datesToGenerate: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const dayOfWeek = date.getUTCDay();
      
      // Skip excluded days
      if (excludedDays.includes(dayOfWeek)) {
        continue;
      }
      
      // Skip past dates
      if (date < todayUTC) {
        continue;
      }
      
      // Only include dates in the selected month
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      datesToGenerate.push(dateStr);
    }
    
    // Check if any dates to generate already have slots (only dates in selected month)
    const conflictingDates = datesToGenerate.filter(dateStr => {
      // Double-check that the date is in the selected month
      const [dateYear, dateMonth] = dateStr.split('-').map(Number);
      if (dateYear !== year || dateMonth !== month) {
        return false; // Skip dates not in selected month
      }
      return existingDates.has(dateStr);
    });
    
    if (conflictingDates.length > 0) {
      const datesList = conflictingDates.slice(0, 10).join(', ') + (conflictingDates.length > 10 ? ` and ${conflictingDates.length - 10} more` : '');
      throw new Error(
        `Cannot generate schedules: ${conflictingDates.length} date(s) in ${month}/${year} already have existing visit slots: ${datesList}. ` +
        `Please delete existing slots for these dates or select a different month/year.`
      );
    }

    // Generate time slots for a day
    const generateTimeSlots = (start: string, end: string, duration: number): string[] => {
      const slots: string[] = [];
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let currentMinutes = startMinutes;
      
      while (currentMinutes + duration <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMin = currentMinutes % 60;
        const slotStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
        
        // Check if slot falls in any vacant range
        let isInVacantRange = false;
        for (const range of vacantRanges) {
          const rangeStart = this.validateAndFormatTime(range.startTime);
          const rangeEnd = this.validateAndFormatTime(range.endTime);
          const slotTime = `${slotStartTime}:00`;
          
          if (this.compareTimeStrings(slotTime, rangeStart) >= 0 && this.compareTimeStrings(slotTime, rangeEnd) < 0) {
            isInVacantRange = true;
            break;
          }
        }
        
        if (!isInVacantRange) {
          slots.push(slotStartTime);
        }
        
        currentMinutes += duration;
      }
      
      return slots;
    };

    const allTimeSlots = generateTimeSlots(startTime.substring(0, 5), endTime.substring(0, 5), slotDuration);
    
    if (allTimeSlots.length === 0) {
      throw new Error('No time slots can be generated with the current configuration');
    }

    // Generate schedules
    const createdSlots: VisitSlot[] = [];
    const skippedDates: string[] = [];
    const slotsToCreate: Array<{
      date: Date;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      capacity: number;
      bookedCount: number;
      status: 'available';
      description: string | null;
      createdBy: string;
    }> = [];
    
    // Get today's date at midnight UTC for comparison
    const nowForGeneration = new Date();
    const today = new Date(Date.UTC(nowForGeneration.getUTCFullYear(), nowForGeneration.getUTCMonth(), nowForGeneration.getUTCDate(), 0, 0, 0, 0));

    const firstDayOfMonth = new Date(year, month - 1, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const lastDayOfMonth = new Date(year, month, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);
    
    let daysProcessed = 0;
    let daysSkippedExcluded = 0;
    let daysSkippedPast = 0;
    let daysSkippedExisting = 0;
    let daysGenerated = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date object for this day - use UTC to avoid timezone issues
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const dayOfWeek = date.getUTCDay(); // Use UTC day of week
      
      // Format date as YYYY-MM-DD for comparison
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      daysProcessed++;
      
      // Skip excluded days
      if (excludedDays.includes(dayOfWeek)) {
        daysSkippedExcluded++;
        continue;
      }
      
      // Skip dates that are in the past (compare dates only, not time)
      // Compare UTC dates
      if (date < today) {
        skippedDates.push(dateStr);
        daysSkippedPast++;
        continue;
      }
      
      // Skip dates that already have slots
      if (existingDates.has(dateStr)) {
        skippedDates.push(dateStr);
        daysSkippedExisting++;
        continue;
      }
      
      daysGenerated++;
      
      // Generate slots for this day
      // Create date in UTC to avoid timezone issues - use UTC midnight
      const slotDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      // Prepare all slots for this day
      const slotsForDay = allTimeSlots.map(slotStartTime => {
        const [startHour, startMin] = slotStartTime.split(':').map(Number);
        const slotEndMinutes = startHour * 60 + startMin + slotDuration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;
        const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
        
        return {
          date: new Date(slotDate), // Create a copy for each slot (UTC date)
          startTime: `${slotStartTime}:00`,
          endTime: `${slotEndTime}:00`,
          durationMinutes: slotDuration,
          capacity: capacity,
          bookedCount: 0,
          status: 'available' as const,
          description: null,
          createdBy: userId,
        };
      });
      
      // Add to batch
      slotsToCreate.push(...slotsForDay);
    }
    
    if (slotsToCreate.length === 0) {
      return {
        created: [],
        skipped: skippedDates.length,
        skippedDates: skippedDates,
      };
    }
    
    // Batch create all slots at once (much faster)
    const batchSize = 100; // Create 100 slots at a time
    let totalCreated = 0;
    
    for (let i = 0; i < slotsToCreate.length; i += batchSize) {
      const batch = slotsToCreate.slice(i, i + batchSize);
      
      try {
        // Filter and validate batch before creating
        // Note: Past dates are already filtered out in the main loop, so we only validate time ranges here
        const validBatch = batch.filter(slotData => {
          // Double-check date is not in the past (defensive check)
          const slotDate = new Date(slotData.date);
          slotDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (slotDate < today) {
            return false; // Skip past dates
          }
          
          // Validate time range
          try {
            const startTime = this.validateAndFormatTime(slotData.startTime);
            const endTime = this.validateAndFormatTime(slotData.endTime);
            
            if (this.compareTimeStrings(startTime, endTime) >= 0) {
              return false;
            }
          } catch (error) {
            return false;
          }
          
          return true;
        });
        
        if (validBatch.length === 0) {
          continue;
        }
        
        // Create batch
        const result = await this.prisma.visitSlot.createMany({
          data: validBatch.map(slot => ({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            durationMinutes: slot.durationMinutes,
            capacity: slot.capacity,
            bookedCount: slot.bookedCount,
            status: slot.status,
            description: slot.description,
            createdBy: slot.createdBy,
          })),
          skipDuplicates: true, // Skip if slot already exists
        });
        
        totalCreated += result.count;
      } catch (error) {
        console.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continue with next batch even if one fails
      }
    }
    
    // Fetch created slots to return them (optional - for detailed response)
    if (totalCreated > 0) {
      try {
        const startDate = new Date(year, month - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const fetchedSlots = await this.prisma.visitSlot.findMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            createdBy: userId,
            createdAt: {
              gte: new Date(Date.now() - 120000), // Created in the last 2 minutes
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: Math.min(totalCreated, 1000), // Limit to 1000 slots for response
        });
        
        createdSlots.push(...fetchedSlots.map(slot => this.transformVisitSlot(slot)));
      } catch (error) {
        // Continue even if fetch fails
      }
    }

    return {
      created: createdSlots, // Return fetched slots (may be limited)
      skipped: skippedDates.length,
      skippedDates: skippedDates,
    };
  }
}
