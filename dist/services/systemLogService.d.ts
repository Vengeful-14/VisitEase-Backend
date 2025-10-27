import { LogLevel } from '../generated/prisma';
export interface SystemLogData {
    level: LogLevel;
    message: string;
    context?: any;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class SystemLogService {
    private prisma;
    constructor();
    /**
     * Create a system log entry
     */
    createLog(logData: SystemLogData): Promise<void>;
    /**
     * Log visit slot creation
     */
    logSlotCreated(slotData: {
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        capacity: number;
        description?: string;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log visit slot update
     */
    logSlotUpdated(slotData: {
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        capacity: number;
        description?: string;
        userId: string;
        userName?: string;
        changes: any;
    }): Promise<void>;
    /**
     * Log visit slot deletion
     */
    logSlotDeleted(slotData: {
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log booking creation
     */
    logBookingCreated(bookingData: {
        bookingId: string;
        visitorName: string;
        slotDate: string;
        slotTime: string;
        groupSize: number;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log booking cancellation
     */
    logBookingCancelled(bookingData: {
        bookingId: string;
        visitorName: string;
        slotDate: string;
        slotTime: string;
        reason?: string;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log maintenance scheduled
     */
    logMaintenanceScheduled(maintenanceData: {
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        description: string;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log slot status change
     */
    logSlotStatusChanged(statusData: {
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        oldStatus: string;
        newStatus: string;
        userId: string;
        userName?: string;
    }): Promise<void>;
    /**
     * Log error events
     */
    logError(errorData: {
        message: string;
        context?: any;
        userId?: string;
        userName?: string;
    }): Promise<void>;
}
//# sourceMappingURL=systemLogService.d.ts.map