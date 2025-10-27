import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class DashboardController {
    private dashboardService;
    constructor();
    getStats(req: Request, res: Response<ApiResponse>): Promise<void>;
    getUpcomingVisits(req: Request, res: Response<ApiResponse>): Promise<void>;
    getRecentActivity(req: Request, res: Response<ApiResponse>): Promise<void>;
    getRevenueTrend(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=dashboardController.d.ts.map