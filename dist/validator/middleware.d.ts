import { Request, Response, NextFunction } from 'express';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const checkRequiredFields: (fields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRequestSize: (maxSize?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateContentType: (allowedTypes?: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimit: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateApiVersion: (supportedVersions?: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateMethod: (allowedMethods: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateHeaders: (requiredHeaders: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=middleware.d.ts.map