import { Response } from 'express';
import { ApiResponse, AuthRequest } from '../type';
export declare const bookVisitorSlot: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getVisitorSlot: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getAllVisitorSlots: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const updateVisitorSlotBooking: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const deleteVisitorSlotBooking: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const cancelVisitorSlotBooking: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getVisitorSlotsByVisitor: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getVisitorSlotsBySlot: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const checkAvailability: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const getVisitorSlotStats: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=visitorSlotController.d.ts.map