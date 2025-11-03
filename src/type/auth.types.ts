import { Request } from 'express';
import { UserRole } from '../generated/prisma';

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Login response interface
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
  sessionExpiresAt: string; // ISO string for client handling
}

// Token response interface
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

// Auth middleware request interface
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
