import { Request, Response } from 'express';
import { LogLevel } from '../generated/prisma';
import { ApiResponse } from '../type';
export interface SystemLogFilters {
    level?: LogLevel;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    action?: string;
    skip?: number;
    limit?: number;
}
export interface SystemLogResponse {
    id: string;
    level: LogLevel;
    message: string;
    originalMessage: string;
    context: any;
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    } | null;
}
export declare class SystemLogController {
    private prisma;
    constructor();
    /**
     * Get system logs with filtering and pagination
     */
    getSystemLogs(req: Request, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get a specific system log by ID
     */
    getSystemLogById(req: Request, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get system log statistics
     */
    getSystemLogStats(req: Request, res: Response<ApiResponse>): Promise<void>;
    /**
     * Delete old system logs (cleanup)
     */
    deleteOldLogs(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=systemLogController.d.ts.map