import { Response, NextFunction } from 'express';
import { AuthRequest } from '../type';
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireStaffOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=middleware.d.ts.map