import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class ScheduleController {
    private scheduleService;
    constructor();
    getSlots(req: Request, res: Response<ApiResponse>): Promise<void>;
    getSlot(req: Request, res: Response<ApiResponse>): Promise<void>;
    createSlot(req: Request, res: Response<ApiResponse>): Promise<void>;
    updateSlot(req: Request, res: Response<ApiResponse>): Promise<void>;
    deleteSlot(req: Request, res: Response<ApiResponse>): Promise<void>;
    getStats(req: Request, res: Response<ApiResponse>): Promise<void>;
    getIssues(req: Request, res: Response<ApiResponse>): Promise<void>;
    expireOldSlots(req: Request, res: Response<ApiResponse>): Promise<void>;
    getPublicAvailableSlots(req: Request, res: Response<ApiResponse>): Promise<void>;
    getPublicSlot(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=scheduleController.d.ts.map