import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class VisitorController {
    private visitorService;
    constructor();
    getVisitors(req: Request, res: Response<ApiResponse>): Promise<void>;
    getVisitor(req: Request, res: Response<ApiResponse>): Promise<void>;
    createVisitor(req: Request, res: Response<ApiResponse>): Promise<void>;
    updateVisitor(req: Request, res: Response<ApiResponse>): Promise<void>;
    deleteVisitor(req: Request, res: Response<ApiResponse>): Promise<void>;
    getStats(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=visitorController.d.ts.map