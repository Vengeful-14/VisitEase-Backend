import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class ReportsController {
    private reportsService;
    constructor();
    getSummary(req: Request, res: Response<ApiResponse>): Promise<void>;
    getDaily(req: Request, res: Response<ApiResponse>): Promise<void>;
    getBookingTrend(req: Request, res: Response<ApiResponse>): Promise<void>;
}
export default ReportsController;
//# sourceMappingURL=reportsController.d.ts.map