export interface VisitSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
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
export declare class ScheduleService {
    private prisma;
    private systemLogService;
    constructor();
    expirePastUnbookedSlots(referenceDate?: Date): Promise<{
        expiredCount: number;
        cutoffDate: string;
    }>;
    getSlots(filters: {
        dateRange?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        slots: VisitSlot[];
        total: number;
    }>;
    createSlot(slotData: any, userId: string): Promise<VisitSlot>;
    updateSlot(id: string, updates: Partial<VisitSlot> & {
        date?: Date | string;
    }, userId: string): Promise<VisitSlot>;
    deleteSlot(id: string, userId: string): Promise<void>;
    getScheduleStats(): Promise<ScheduleStats>;
    getScheduleIssues(): Promise<ScheduleIssue[]>;
    getSlotById(id: string): Promise<VisitSlot | null>;
    getPublicAvailableSlots(filters?: {
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        slots: VisitSlot[];
        total: number;
    }>;
    private validateSlotData;
    private validateSlotUpdates;
    private checkSlotConflicts;
    private transformVisitSlot;
    private validateAndFormatTime;
    private compareTimeStrings;
}
//# sourceMappingURL=scheduleService.d.ts.map