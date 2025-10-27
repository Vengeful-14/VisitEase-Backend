import { Request, Response } from 'express';
import { UserRegistrationRequest, ApiResponse, AuthRequest } from '../type';
export declare const registerUser: (req: Request<{}, ApiResponse, UserRegistrationRequest>, res: Response<ApiResponse>) => Promise<void>;
export declare const getUserProfile: (req: AuthRequest, res: Response<ApiResponse>) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map