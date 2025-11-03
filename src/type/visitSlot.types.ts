import { SlotStatus } from '../generated/prisma';

// Visit slot creation data interface
export interface CreateVisitSlotData {
  date: Date;
  startTime: string; // Format: "HH:MM:SS" or "HH:MM"
  endTime: string;   // Format: "HH:MM:SS" or "HH:MM"
  durationMinutes: number;
  capacity: number;
  status?: SlotStatus;
  description?: string;
  createdBy?: string;
}

// Visit slot response interface
export interface VisitSlotResponse {
  id: string;
  date: Date;
  startTime: string; // Format: "HH:MM:SS" or "HH:MM"
  endTime: string;   // Format: "HH:MM:SS" or "HH:MM"
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  status: SlotStatus;
  description: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Visit slot update data interface
export interface UpdateVisitSlotData {
  date?: Date;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  capacity?: number;
  bookedCount?: number;
  status?: SlotStatus;
  description?: string;
}

// Slot generation options
export interface SlotGenerationOptions {
  startDate: Date;
  endDate: Date;
  startHour: number;    // 8 for 8am
  endHour: number;      // 16 for 4pm
  slotDurationMinutes: number;
  capacity: number;
  includeWeekends?: boolean;
  createdBy?: string;
}

// Available time slots for generation
export interface TimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}
