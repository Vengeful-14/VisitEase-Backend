import { SlotStatus } from '../generated/prisma';
export interface CreateVisitSlotData {
    date: Date;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    capacity: number;
    status?: SlotStatus;
    description?: string;
    createdBy?: string;
}
export interface VisitSlotResponse {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    capacity: number;
    bookedCount: number;
    status: SlotStatus;
    description: string | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
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
export interface SlotGenerationOptions {
    startDate: Date;
    endDate: Date;
    startHour: number;
    endHour: number;
    slotDurationMinutes: number;
    capacity: number;
    includeWeekends?: boolean;
    createdBy?: string;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    durationMinutes: number;
}
//# sourceMappingURL=visitSlot.types.d.ts.map