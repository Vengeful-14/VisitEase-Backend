import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { AuthRequest } from '../type';
import { ApiErrorResponse } from '../type';

// Authentication middleware
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Access token is required',
      };
      res.status(401).json(errorResponse);
      return;
    }
    
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    
    next();
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Invalid or expired token',
    };
    res.status(401).json(errorResponse);
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Authentication required',
      };
      res.status(401).json(errorResponse);
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Insufficient permissions',
      };
      res.status(403).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Admin only middleware
export const requireAdmin = authorizeRoles('admin');

// Staff and Admin middleware
export const requireStaffOrAdmin = authorizeRoles('admin', 'staff');

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
