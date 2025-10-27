import { Request, Response } from 'express';
import { ApiResponse } from '../type';
export declare class BookingController {
    private bookingService;
    constructor();
    getBookings(req: Request, res: Response<ApiResponse>): Promise<void>;
    getBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
    createBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
    updateBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
    confirmBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
    cancelBooking(req: Request, res: Response<ApiResponse>): Promise<void>;
}
//# sourceMappingURL=bookingController.d.ts.map