import { Request } from 'express';
import { UserRole } from '../generated/prisma';
export interface LoginRequest {
    email: string;
    password: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl?: string;
        role: UserRole;
        emailVerified: boolean;
        phone?: string;
        isActive: boolean;
    };
    token: string;
    refreshToken?: string;
    sessionToken: string;
    sessionExpiresAt: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string;
}
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
    };
}
//# sourceMappingURL=auth.types.d.ts.map