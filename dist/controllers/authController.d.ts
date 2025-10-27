import { Request, Response } from 'express';
import { LoginRequest, ApiResponse } from '../type';
export declare const loginUser: (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => Promise<void>;
export declare const refreshToken: (req: Request<{}, ApiResponse, {
    refreshToken: string;
}>, res: Response<ApiResponse>) => Promise<void>;
export declare const logoutUser: (req: Request, res: Response<ApiResponse>) => Promise<void>;
export declare const requestPasswordReset: (req: Request<{}, ApiResponse, {
    email: string;
}>, res: Response<ApiResponse>) => Promise<void>;
export declare const resetPassword: (req: Request<{}, ApiResponse, {
    token: string;
    newPassword: string;
}>, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map