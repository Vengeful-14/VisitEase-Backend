import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class NotificationController {
    private notificationService;
    constructor();
    getNotifications(req: Request, res: Response<ApiResponse>): Promise<void>;
    getNotification(req: Request, res: Response<ApiResponse>): Promise<void>;
    createNotification(req: Request, res: Response<ApiResponse>): Promise<void>;
    sendNotification(req: Request, res: Response<ApiResponse>): Promise<void>;
    updateNotificationStatus(req: Request, res: Response<ApiResponse>): Promise<void>;
    deleteNotification(req: Request, res: Response<ApiResponse>): Promise<void>;
    getTemplates(req: Request, res: Response<ApiResponse>): Promise<void>;
    createTemplate(req: Request, res: Response<ApiResponse>): Promise<void>;
    sendSMSForBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
    sendEmailForBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=notificationController.d.ts.map