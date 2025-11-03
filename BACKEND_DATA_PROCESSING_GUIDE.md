# Backend Data Processing Guide for Museum Scheduling System

This document provides a comprehensive guide on how to process data in the backend for the Museum Scheduling System using Prisma ORM with PostgreSQL. It covers data processing logic, business rules, and API implementations with type-safe database operations.

## Table of Contents

1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Data Processing Services](#data-processing-services)
   - [Dashboard Analytics Service](#1-dashboard-analytics-service)
   - [Schedule Management Service](#2-schedule-management-service)
   - [Visitor Management Service](#3-visitor-management-service)
4. [Business Logic Implementation](#business-logic-implementation)
   - [Booking Processing Service](#1-booking-processing-service)
   - [Notification Processing Service](#2-notification-processing-service)
5. [API Controllers](#api-controllers)
   - [Dashboard Controller](#1-dashboard-controller)
   - [Schedule Controller](#2-schedule-controller)
6. [Data Validation](#data-validation)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

---

## Overview

The backend processes data from the PostgreSQL database to serve the frontend application. This guide covers the data processing logic, business rules, and API implementations needed to support all pages and components.

### Key Processing Areas:
- **Dashboard Analytics**: Real-time statistics, KPI widgets, and aggregations
- **Schedule Management**: Slot creation, booking validation, conflict detection
- **Visitor Management**: Profile management and activity tracking
- **Reporting**: Data aggregation and analytics widgets
- **Notifications**: Communication processing and delivery

---

## Frontend Component to Backend Processing Mapping

### Dashboard Page Components
| Frontend Widget | Backend Service | API Endpoint | Data Processing |
|----------------|-----------------|--------------|-----------------|
| **KPI Statistics Cards** | DashboardService | `GET /api/dashboard/stats` | Real-time aggregations from visit_slots, bookings, visitors tables |
| **Revenue Analytics Widget** | DashboardService | `GET /api/dashboard/stats` | Daily revenue calculations, capacity utilization metrics |
| **Upcoming Visits Widget** | DashboardService | `GET /api/dashboard/upcoming-visits` | Next 5 visits with visitor and slot details |
| **Recent Activity Widget** | DashboardService | `GET /api/dashboard/recent-activity` | Audit logs with user actions and timestamps |
| **Popular Time Slots Widget** | DashboardService | `GET /api/dashboard/stats` | Time slot popularity analysis and booking counts |
| **Revenue Trend Widget** | DashboardService | `GET /api/dashboard/revenue-trend` | 7-day revenue trend with daily aggregations |
| **Quick Actions Widget** | Multiple Services | Various endpoints | Navigation and action triggers |

### Schedule Page Components
| Frontend Widget | Backend Service | API Endpoint | Data Processing |
|----------------|-----------------|--------------|-----------------|
| **Schedule Statistics Cards** | ScheduleService | `GET /api/schedule/statistics` | Slot counts, utilization rates, capacity metrics |
| **Schedule Issues & Alerts Widget** | ScheduleService | `GET /api/schedule/issues` | Conflict detection, maintenance alerts |
| **View Mode Toggle** | ScheduleService | `GET /api/schedule/slots` | Calendar/list view data formatting |
| **Filter Controls Widget** | ScheduleService | `GET /api/schedule/slots` | Dynamic filtering by status, date, search |
| **Slot Cards** | ScheduleService | `GET /api/schedule/slots` | Individual slot data with booking information |
| **Calendar Component** | ScheduleService | `GET /api/schedule/slots` | Date-based slot organization and visualization |
| **Selected Date Info Widget** | ScheduleService | `GET /api/schedule/slots` | Date-specific slot filtering and display |

### Visitors Page Components
| Frontend Widget | Backend Service | API Endpoint | Data Processing |
|----------------|-----------------|--------------|-----------------|
| **Visitor Statistics Cards** | VisitorService | `GET /api/visitors/statistics` | Visitor counts, retention rates, group size analysis |
| **Filter Controls Widget** | VisitorService | `GET /api/visitors` | Type-based filtering (Individual, Educational, Corporate, Groups) |
| **Search Widget** | VisitorService | `GET /api/visitors` | Name, email, organization search functionality |
| **Visitor Cards** | VisitorService | `GET /api/visitors` | Individual visitor profiles with contact details |
| **Recent Visitor Activity Widget** | VisitorService | `GET /api/visitors/activity` | Latest visitor interactions and updates |
| **Add/Edit Visitor Modal** | VisitorService | `POST/PUT /api/visitors` | Visitor registration and profile management |

### Reports Page Components
| Frontend Widget | Backend Service | API Endpoint | Data Processing |
|----------------|-----------------|--------------|-----------------|
| **Summary Statistics Cards** | ReportsService | `GET /api/reports/summary` | Total bookings, visitors, revenue, confirmation rates |
| **Daily Reports Table** | ReportsService | `GET /api/reports/daily` | Daily breakdown with booking and visitor metrics |
| **Bookings Trend Chart** | ReportsService | `GET /api/reports/booking-trends` | Daily booking volume visualization |
| **Revenue Trend Chart** | ReportsService | `GET /api/reports/revenue-trend` | Daily revenue visualization |
| **Date Range Filter** | ReportsService | `GET /api/reports/*` | Dynamic date range filtering (7/30/90 days) |
| **Export Report Button** | ReportsService | `POST /api/reports/export` | Report generation and download |

### Notifications Page Components
| Frontend Widget | Backend Service | API Endpoint | Data Processing |
|----------------|-----------------|--------------|-----------------|
| **Notification List Widget** | NotificationService | `GET /api/notifications` | All notifications with status and delivery info |
| **Filter Controls Widget** | NotificationService | `GET /api/notifications` | Status filtering (All, Sent, Pending) |
| **Create Notification Modal** | NotificationService | `POST /api/notifications` | New notification creation with scheduling |
| **View Notification Modal** | NotificationService | `GET /api/notifications/:id` | Detailed notification information |
| **Notification Status Badges** | NotificationService | `PUT /api/notifications/:id/status` | Status updates and delivery tracking |

---

## Backend Architecture

### Service Layer Structure

```
backend/
├── controllers/          # API endpoints
├── services/            # Business logic
├── repositories/        # Data access layer
├── models/             # Data models
├── middleware/         # Authentication, validation
├── utils/              # Helper functions
└── config/             # Database and app config
```

### Technology Stack
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Joi or Yup
- **Real-time**: WebSockets or Server-Sent Events
- **Type Safety**: TypeScript with Prisma generated types

---

## Authentication & User Management

### User Registration Service

**Frontend Components Supported:**
- **Registration Form**: User account creation with validation
- **Email Verification**: Account activation process
- **OAuth Integration**: Google, Facebook, etc. authentication
- **Profile Management**: User profile updates and settings

```typescript
// services/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '@prisma/client';

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  async registerUser(userData: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: User; token: string }> {
    
    // Validate input data
    await this.validateRegistrationData(userData);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        phone: userData.phone,
        role: userData.role || 'visitor',
        emailVerified: false
      }
    });

    // Generate JWT token
    const token = this.generateJWTToken(user);

    // Create user session
    await this.createUserSession(user.id, token);

    return { user, token };
  }

  async loginUser(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new Error('Account uses OAuth authentication');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = this.generateJWTToken(user);

    // Create user session
    await this.createUserSession(user.id, token);

    return { user, token };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokens: {
          some: {
            token,
            expiresAt: {
              gt: new Date()
            },
            usedAt: null
          }
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Mark token as used and verify email
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { token },
        data: { usedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      })
    ]);

    return true;
  }

  async initiatePasswordReset(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return true;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Create password reset token
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send password reset email (implement email service)
    await this.sendPasswordResetEmail(user.email, token);

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        },
        usedAt: null
      },
      include: {
        user: true
      }
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    return true;
  }

  async refreshToken(refreshToken: string): Promise<{ user: User; token: string }> {
    const session = await this.prisma.userSession.findUnique({
      where: { sessionToken: refreshToken },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired session');
    }

    // Generate new JWT token
    const token = this.generateJWTToken(session.user);

    // Update session
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastAccessedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { user: session.user, token };
  }

  async logoutUser(token: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { sessionToken: token }
    });

    if (session) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false }
      });
    }

    return true;
  }

  async validateJWTToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  private generateJWTToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  private async createUserSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        sessionToken: token,
        expiresAt
      }
    });
  }

  private async validateRegistrationData(userData: any): Promise<void> {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  async updateUserProfile(userId: string, updates: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return user;
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Implement email sending logic (e.g., using SendGrid, Nodemailer, etc.)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    console.log(`Password reset email for ${email}: ${resetUrl}`);
    // TODO: Implement actual email sending
  }
}
```

### JWT Authentication Middleware

```typescript
// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { User } from '@prisma/client';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const user = await this.authService.validateJWTToken(token);
      
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }

  requireAdmin = this.requireRole(['admin']);
  requireStaff = this.requireRole(['admin', 'staff']);
  requireUser = this.requireRole(['admin', 'staff', 'visitor']);
}
```

### OAuth Integration Service

```typescript
// services/oauthService.ts
import { PrismaClient } from '@prisma/client';
import { AuthService } from './authService';

export class OAuthService {
  private prisma: PrismaClient;
  private authService: AuthService;

  constructor() {
    this.prisma = new PrismaClient();
    this.authService = new AuthService();
  }

  async handleOAuthCallback(provider: string, providerData: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }): Promise<{ user: any; token: string; isNewUser: boolean }> {
    
    // Check if OAuth provider already exists
    const existingOAuth = await this.prisma.oAuthProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: providerData.id
        }
      },
      include: { user: true }
    });

    if (existingOAuth) {
      // Update tokens
      await this.prisma.oAuthProvider.update({
        where: { id: existingOAuth.id },
        data: {
          accessToken: providerData.accessToken,
          refreshToken: providerData.refreshToken,
          expiresAt: providerData.expiresAt
        }
      });

      const token = this.authService.generateJWTToken(existingOAuth.user);
      return { user: existingOAuth.user, token, isNewUser: false };
    }

    // Check if user exists with this email
    let user = await this.prisma.user.findUnique({
      where: { email: providerData.email }
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: providerData.email,
          name: providerData.name,
          avatarUrl: providerData.picture,
          emailVerified: true, // OAuth emails are pre-verified
          role: 'visitor'
        }
      });
    }

    // Create OAuth provider record
    await this.prisma.oAuthProvider.create({
      data: {
        userId: user.id,
        provider,
        providerUserId: providerData.id,
        accessToken: providerData.accessToken,
        refreshToken: providerData.refreshToken,
        expiresAt: providerData.expiresAt
      }
    });

    const token = this.authService.generateJWTToken(user);
    return { user, token, isNewUser };
  }

  async unlinkOAuthProvider(userId: string, provider: string): Promise<boolean> {
    const result = await this.prisma.oAuthProvider.deleteMany({
      where: {
        userId,
        provider
      }
    });

    return result.count > 0;
  }

  async getUserOAuthProviders(userId: string): Promise<any[]> {
    return this.prisma.oAuthProvider.findMany({
      where: { userId },
      select: {
        provider: true,
        createdAt: true
      }
    });
  }
}
```

### Authentication Controllers

```typescript
// controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { OAuthService } from '../services/oauthService';
import { AuthMiddleware } from '../middleware/authMiddleware';

export class AuthController {
  private authService: AuthService;
  private oauthService: OAuthService;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.authService = new AuthService();
    this.oauthService = new OAuthService();
    this.authMiddleware = new AuthMiddleware();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await this.authService.registerUser(req.body);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified
        },
        token
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await this.authService.loginUser(req.body);
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified
        },
        token
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await this.authService.logoutUser(token);
      }
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const { user, token } = await this.authService.refreshToken(refreshToken);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async initiatePasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.authService.initiatePasswordReset(email);
      
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);
      
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const updates = req.body;

      const user = await this.authService.updateUserProfile(userId, updates);
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async oauthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const providerData = req.body; // OAuth provider data

      const result = await this.oauthService.handleOAuthCallback(provider, providerData);
      
      res.json({
        message: result.isNewUser ? 'Account created successfully' : 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
        token: result.token,
        isNewUser: result.isNewUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### Authentication Routes

```typescript
// routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.initiatePasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/oauth/:provider/callback', authController.oauthCallback);

// Protected routes
router.get('/profile', authMiddleware.authenticateToken, authController.getProfile);
router.put('/profile', authMiddleware.authenticateToken, authController.updateProfile);

export default router;
```

### Authentication Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

### Environment Variables

Add these environment variables to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/museum_scheduling?schema=public"

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Authentication API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | User registration | None |
| POST | `/api/auth/login` | User login | None |
| POST | `/api/auth/logout` | User logout | Bearer Token |
| POST | `/api/auth/refresh-token` | Refresh JWT token | None |
| POST | `/api/auth/forgot-password` | Initiate password reset | None |
| POST | `/api/auth/reset-password` | Reset password with token | None |
| POST | `/api/auth/verify-email` | Verify email address | None |
| GET | `/api/auth/profile` | Get user profile | Bearer Token |
| PUT | `/api/auth/profile` | Update user profile | Bearer Token |
| POST | `/api/auth/oauth/:provider/callback` | OAuth callback | None |

### Security Features

- **Password Hashing**: Uses bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Tracks active user sessions
- **Email Verification**: Account activation process
- **Password Reset**: Secure token-based password reset
- **OAuth Integration**: Support for Google, Facebook, etc.
- **Role-Based Access**: Admin, Staff, Visitor roles
- **Account Security**: Account deactivation and session management

---

## Data Processing Services

### 1. Dashboard Analytics Service

**Frontend Components Supported:**
- **KPI Statistics Cards**: Total Slots, Today's Visits, Upcoming Visits, Total Visitors
- **Revenue Analytics Widget**: Today's Revenue, Capacity Utilization, Available/Booked Slots
- **Upcoming Visits Widget**: Next 5 scheduled visits with visitor details
- **Recent Activity Widget**: Latest system activities and booking changes
- **Popular Time Slots Widget**: Most booked time periods with utilization charts
- **Revenue Trend Widget**: Last 7 days revenue visualization
- **Quick Actions Widget**: Common tasks and shortcuts

```typescript
// services/dashboardService.ts
import { PrismaClient } from '@prisma/client';
import { DashboardStats, UpcomingVisit, RecentActivity } from '../types/dashboard';

export class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get slot statistics
    const slotStats = await this.prisma.visitSlot.aggregate({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
      _sum: {
        capacity: true,
        bookedCount: true
      }
    });

    const todaySlots = await this.prisma.visitSlot.count({
      where: {
        date: today
      }
    });

    const upcomingSlots = await this.prisma.visitSlot.count({
      where: {
        date: {
          gt: today
        }
      }
    });

    const availableSlots = await this.prisma.visitSlot.count({
      where: {
        status: 'available',
        date: {
          gte: thirtyDaysAgo
        }
      }
    });

    const bookedSlots = await this.prisma.visitSlot.count({
      where: {
        status: 'booked',
        date: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get revenue statistics for today
    const revenueStats = await this.prisma.booking.aggregate({
      where: {
        status: 'confirmed',
        slot: {
          date: today
        }
      },
      _sum: {
        totalAmount: true,
        groupSize: true
      },
      _count: true
    });

    // Get capacity utilization for last 7 days
    const capacityStats = await this.prisma.visitSlot.aggregate({
      where: {
        date: {
          gte: sevenDaysAgo
        }
      },
      _sum: {
        capacity: true,
        bookedCount: true
      }
    });

    const totalCapacity = capacityStats._sum.capacity || 0;
    const totalBooked = capacityStats._sum.bookedCount || 0;
    const utilizationPercentage = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    return {
      totalSlots: slotStats._count || 0,
      todayVisits: todaySlots,
      upcomingVisits: upcomingSlots,
      availableSlots,
      bookedSlots,
      totalVisitors: revenueStats._sum.groupSize || 0,
      totalBookings: revenueStats._count || 0,
      revenue: revenueStats._sum.totalAmount || 0,
      capacityUtilization: Math.round(utilizationPercentage * 100) / 100
    };
  }

  async getUpcomingVisits(limit: number = 5): Promise<UpcomingVisit[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSlots = await this.prisma.visitSlot.findMany({
      where: {
        date: {
          gte: today
        },
        status: {
          in: ['available', 'booked']
        }
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'tentative']
            }
          },
          include: {
            visitor: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      take: limit
    });

    return upcomingSlots.map(slot => {
      const now = new Date();
      const slotDateTime = new Date(slot.date);
      slotDateTime.setHours(
        slot.startTime.getHours(),
        slot.startTime.getMinutes(),
        slot.startTime.getSeconds()
      );
      
      const hoursUntil = Math.floor((slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      let timeUntil = '';
      if (hoursUntil < 1) {
        timeUntil = 'Less than 1 hour';
      } else if (hoursUntil < 24) {
        timeUntil = `${hoursUntil} hours`;
      } else {
        const days = Math.floor(hoursUntil / 24);
        timeUntil = `${days} day${days > 1 ? 's' : ''}`;
      }

      const booking = slot.bookings[0]; // Get first booking if exists

      return {
        id: slot.id,
        slot: {
          id: slot.id,
          date: slot.date.toISOString().split('T')[0],
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          bookedCount: slot.bookedCount,
          capacity: slot.capacity
        },
        visitor: booking?.visitor ? {
          name: booking.visitor.name,
          email: booking.visitor.email
        } : null,
        booking: booking ? {
          id: booking.id,
          status: booking.status
        } : null,
        timeUntil
      };
    });
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentActivities = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return recentActivities.map(activity => {
      const message = this.generateActivityMessage(activity);
      
      return {
        id: activity.id,
        type: activity.action,
        message,
        timestamp: activity.createdAt.toISOString(),
        user: activity.user?.name || 'System',
        metadata: {
          table: activity.tableName,
          newValues: activity.newValues,
          oldValues: activity.oldValues
        }
      };
    });
  }

  async getRevenueTrend(days: number = 7): Promise<Array<{date: string, revenue: number}>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'confirmed',
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    // Group by date and sum revenue
    const revenueByDate = bookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + booking.totalAmount.toNumber();
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date
    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  private generateActivityMessage(activity: any): string {
    const { action, tableName, newValues, oldValues } = activity;
    
    switch (action) {
      case 'INSERT':
        if (tableName === 'bookings') {
          return `New booking created for ${newValues?.visitor_name || 'visitor'}`;
        } else if (tableName === 'visitors') {
          return `New visitor registered: ${newValues?.name || 'Unknown'}`;
        }
        break;
      case 'UPDATE':
        if (tableName === 'visit_slots') {
          return `Slot updated: ${oldValues?.description || 'Unknown slot'}`;
        } else if (tableName === 'bookings') {
          return `Booking status changed to ${newValues?.status || 'unknown'}`;
        }
        break;
      case 'DELETE':
        if (tableName === 'bookings') {
          return `Booking cancelled by ${oldValues?.visitor_name || 'visitor'}`;
        }
        break;
    }
    
    return `${action} operation on ${tableName}`;
  }
}
```

### 2. Schedule Management Service

**Frontend Components Supported:**
- **Schedule Statistics Cards**: Total Slots, Booked Slots, Average Capacity, Issues Count
- **Schedule Issues & Alerts Widget**: Current conflicts and maintenance alerts
- **View Mode Toggle**: Calendar view and List view switching
- **Filter Controls Widget**: Status filter, search, and sorting options
- **Slot Cards**: Individual slot display with booking information
- **Calendar Component**: Monthly/weekly calendar with slot visualization
- **Selected Date Info Widget**: Detailed slots for selected date

```typescript
// services/scheduleService.ts
import { PrismaClient } from '@prisma/client';
import { VisitSlot, ScheduleStats, ScheduleIssue } from '../types/schedule';

export class ScheduleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getSlots(filters: {
    dateRange?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{slots: VisitSlot[], total: number}> {
    
    const where: any = {};

    // Date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(' to ');
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { id: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const [slots, total] = await Promise.all([
      this.prisma.visitSlot.findMany({
        where,
        include: {
          bookings: {
            where: {
              status: {
                in: ['confirmed', 'tentative']
              }
            }
          },
          creator: true
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.visitSlot.count({ where })
    ]);

    return {
      slots: slots.map(slot => this.transformVisitSlot(slot)),
      total
    };
  }

  async createSlot(slotData: Omit<VisitSlot, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<VisitSlot> {
    // Validate slot data
    await this.validateSlotData(slotData);

    // Check for conflicts
    await this.checkSlotConflicts(slotData);

    const slot = await this.prisma.visitSlot.create({
      data: {
        date: new Date(slotData.date),
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        durationMinutes: slotData.duration,
        capacity: slotData.capacity,
        status: slotData.status || 'available',
        description: slotData.description || '',
        createdBy: userId
      }
    });

    return this.transformVisitSlot(slot);
  }

  async updateSlot(id: string, updates: Partial<VisitSlot>, userId: string): Promise<VisitSlot> {
    // Get current slot data
    const currentSlot = await this.getSlotById(id);
    
    // Validate updates
    await this.validateSlotUpdates(updates, currentSlot);

    // Check for conflicts if time/date changed
    if (updates.date || updates.startTime || updates.endTime) {
      await this.checkSlotConflicts({ ...currentSlot, ...updates });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (updates.date) updateData.date = new Date(updates.date);
    if (updates.startTime) updateData.startTime = updates.startTime;
    if (updates.endTime) updateData.endTime = updates.endTime;
    if (updates.duration) updateData.durationMinutes = updates.duration;
    if (updates.capacity) updateData.capacity = updates.capacity;
    if (updates.status) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const slot = await this.prisma.visitSlot.update({
      where: { id },
      data: updateData
    });

    return this.transformVisitSlot(slot);
  }

  async deleteSlot(id: string, userId: string): Promise<void> {
    // Check if slot has active bookings
    const activeBookings = await this.prisma.booking.count({
      where: {
        slotId: id,
        status: {
          in: ['confirmed', 'tentative']
        }
      }
    });

    if (activeBookings > 0) {
      throw new Error('Cannot delete slot with active bookings');
    }

    await this.prisma.visitSlot.delete({
      where: { id }
    });
  }

  async getScheduleStats(): Promise<ScheduleStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalSlots, availableSlots, bookedSlots, cancelledSlots, maintenanceSlots, avgCapacity, avgBookings, capacityStats] = await Promise.all([
      this.prisma.visitSlot.count({
        where: { date: { gte: thirtyDaysAgo } }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: thirtyDaysAgo },
          status: 'available'
        }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: thirtyDaysAgo },
          status: 'booked'
        }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: thirtyDaysAgo },
          status: 'cancelled'
        }
      }),
      this.prisma.visitSlot.count({
        where: { 
          date: { gte: thirtyDaysAgo },
          status: 'maintenance'
        }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: thirtyDaysAgo } },
        _avg: { capacity: true }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: thirtyDaysAgo } },
        _avg: { bookedCount: true }
      }),
      this.prisma.visitSlot.aggregate({
        where: { date: { gte: thirtyDaysAgo } },
        _sum: { capacity: true, bookedCount: true }
      })
    ]);

    const totalCapacity = capacityStats._sum.capacity || 0;
    const totalBooked = capacityStats._sum.bookedCount || 0;
    const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    return {
      totalSlots,
      availableSlots,
      bookedSlots,
      averageCapacity: Math.round((avgCapacity._avg.capacity || 0) * 10) / 10,
      averageBookings: Math.round((avgBookings._avg.bookedCount || 0) * 10) / 10,
      utilizationRate: Math.round(utilizationRate * 10) / 10
    };
  }

  async getScheduleIssues(): Promise<ScheduleIssue[]> {
    const conflicts = await this.prisma.scheduleConflict.findMany({
      where: {
        status: 'pending'
      },
      include: {
        affectedSlot: true,
        resolver: true
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return conflicts.map(conflict => ({
      id: conflict.id,
      type: conflict.conflictType,
      title: conflict.title,
      description: conflict.description,
      severity: conflict.severity,
      status: conflict.status,
      date: conflict.affectedSlot?.date?.toISOString().split('T')[0] || '',
      time: conflict.affectedSlot?.startTime?.toString() || ''
    }));
  }

  private async validateSlotData(slotData: any): Promise<void> {
    // Validate date is not in the past
    if (new Date(slotData.date) < new Date()) {
      throw new Error('Cannot create slots in the past');
    }

    // Validate time range
    if (slotData.startTime >= slotData.endTime) {
      throw new Error('Start time must be before end time');
    }

    // Validate capacity
    if (slotData.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    // Validate duration
    if (slotData.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
  }

  private async checkSlotConflicts(slotData: any): Promise<void> {
    const conflictingSlots = await this.prisma.visitSlot.findMany({
      where: {
        date: new Date(slotData.date),
        status: {
          not: 'cancelled'
        },
        OR: [
          {
            AND: [
              { startTime: { lt: slotData.endTime } },
              { endTime: { gt: slotData.startTime } }
            ]
          }
        ]
      }
    });

    if (conflictingSlots.length > 0) {
      throw new Error('Time slot conflicts with existing slots');
    }
  }

  async getSlotById(id: string): Promise<VisitSlot | null> {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id }
    });

    return slot ? this.transformVisitSlot(slot) : null;
  }

  private transformVisitSlot(data: any): VisitSlot {
    return {
      id: data.id,
      date: data.date.toISOString().split('T')[0],
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.durationMinutes,
      capacity: data.capacity,
      bookedCount: data.bookedCount,
      status: data.status,
      description: data.description || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}
```

### 3. Visitor Management Service

**Frontend Components Supported:**
- **Visitor Statistics Cards**: Total Visitors, Returning Visitors, Average Group Size, Special Requirements
- **Filter Controls Widget**: Type filter (Individual, Educational, Corporate, Groups)
- **Search Widget**: Visitor search by name, email, or organization
- **Visitor Cards**: Individual visitor profiles with contact information
- **Recent Visitor Activity Widget**: Latest visitor interactions and updates
- **Add/Edit Visitor Modal**: Visitor registration and profile management

```typescript
// services/visitorService.ts
import { PrismaClient } from '@prisma/client';
import { Visitor, VisitorStats } from '../types/visitor';

export class VisitorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getVisitors(filters: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{visitors: Visitor[], total: number}> {
    
    const where: any = {
      isActive: true
    };

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      where.visitorType = this.mapTypeFilter(filters.type);
    }

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const [visitors, total] = await Promise.all([
      this.prisma.visitor.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      this.prisma.visitor.count({ where })
    ]);

    return {
      visitors: visitors.map(visitor => this.transformVisitor(visitor)),
      total
    };
  }

  async createVisitor(visitorData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visitor> {
    // Validate visitor data
    await this.validateVisitorData(visitorData);

    // Check for duplicate email
    await this.checkDuplicateEmail(visitorData.email);

    const visitor = await this.prisma.visitor.create({
      data: {
        name: visitorData.name,
        email: visitorData.email,
        phone: visitorData.phone || null,
        organization: visitorData.organization || null,
        specialRequirements: visitorData.specialRequirements || null,
        visitorType: this.determineVisitorType(visitorData.organization)
      }
    });

    return this.transformVisitor(visitor);
  }

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    // Validate updates
    if (updates.email) {
      await this.checkDuplicateEmail(updates.email, id);
    }

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'name') {
        setClause.push(`name = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      } else if (key === 'email') {
        setClause.push(`email = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      } else if (key === 'phone') {
        setClause.push(`phone = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      } else if (key === 'organization') {
        setClause.push(`organization = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      } else if (key === 'specialRequirements') {
        setClause.push(`special_requirements = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE visitors 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    return this.transformVisitor(result.rows[0]);
  }

  async deleteVisitor(id: string): Promise<void> {
    // Check if visitor has active bookings
    const bookingsQuery = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE visitor_id = $1 AND status IN ('confirmed', 'tentative')
    `;

    const bookingsResult = await db.query(bookingsQuery, [id]);
    const activeBookings = parseInt(bookingsResult.rows[0].count);

    if (activeBookings > 0) {
      throw new Error('Cannot delete visitor with active bookings');
    }

    // Soft delete by setting is_active to false
    const deleteQuery = `
      UPDATE visitors 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(deleteQuery, [id]);
  }

  async getVisitorStats(): Promise<VisitorStats> {
    const query = `
      WITH visitor_counts AS (
        SELECT 
          COUNT(*) as total_visitors,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_visitors_this_month
        FROM visitors
        WHERE is_active = true
      ),
      returning_visitors AS (
        SELECT COUNT(DISTINCT visitor_id) as returning_visitors
        FROM bookings
        WHERE visitor_id IN (
          SELECT visitor_id 
          FROM bookings 
          GROUP BY visitor_id 
          HAVING COUNT(*) > 1
        )
      ),
      group_stats AS (
        SELECT 
          ROUND(AVG(group_size), 1) as average_group_size,
          organization
        FROM bookings b
        JOIN visitors v ON b.visitor_id = v.id
        WHERE b.status = 'confirmed'
        GROUP BY v.organization
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )
      SELECT 
        vc.*,
        rv.returning_visitors,
        gs.average_group_size,
        gs.organization as most_popular_organization
      FROM visitor_counts vc, returning_visitors rv, group_stats gs;
    `;

    const result = await db.query(query);
    return this.transformVisitorStats(result.rows[0]);
  }

  private async validateVisitorData(visitorData: any): Promise<void> {
    if (!visitorData.name || visitorData.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!visitorData.email || !this.isValidEmail(visitorData.email)) {
      throw new Error('Valid email is required');
    }
  }

  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<void> {
    let query = 'SELECT id FROM visitors WHERE email = $1 AND is_active = true';
    let params = [email];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await db.query(query, params);
    
    if (result.rows.length > 0) {
      throw new Error('Email already exists');
    }
  }

  private determineVisitorType(organization?: string): string {
    if (!organization) return 'individual';
    
    const org = organization.toLowerCase();
    if (org.includes('school') || org.includes('university') || org.includes('college')) {
      return 'educational';
    } else if (org.includes('company') || org.includes('inc') || org.includes('corp')) {
      return 'corporate';
    } else if (org.includes('club') || org.includes('society') || org.includes('group')) {
      return 'group';
    }
    
    return 'individual';
  }

  private getTypeFilterCondition(type: string, paramIndex: number): string {
    switch (type) {
      case 'individual':
        return `(v.organization IS NULL OR v.organization = '' OR (
          v.organization NOT ILIKE '%school%' AND 
          v.organization NOT ILIKE '%university%' AND 
          v.organization NOT ILIKE '%company%' AND 
          v.organization NOT ILIKE '%inc%' AND 
          v.organization NOT ILIKE '%corp%'
        ))`;
      case 'educational':
        return `(v.organization ILIKE '%school%' OR v.organization ILIKE '%university%' OR v.organization ILIKE '%college%')`;
      case 'corporate':
        return `(v.organization ILIKE '%company%' OR v.organization ILIKE '%inc%' OR v.organization ILIKE '%corp%' OR v.organization ILIKE '%associates%')`;
      case 'group':
        return `(v.organization ILIKE '%club%' OR v.organization ILIKE '%society%' OR v.organization ILIKE '%group%')`;
      default:
        return '1=1';
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private transformVisitor(data: any): Visitor {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      organization: data.organization || '',
      specialRequirements: data.special_requirements || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private transformVisitorStats(data: any): VisitorStats {
    return {
      totalVisitors: parseInt(data.total_visitors) || 0,
      newVisitorsThisMonth: parseInt(data.new_visitors_this_month) || 0,
      returningVisitors: parseInt(data.returning_visitors) || 0,
      averageGroupSize: parseFloat(data.average_group_size) || 0,
      mostPopularOrganization: data.most_popular_organization || 'N/A'
    };
  }
}
```

---

## Business Logic Implementation

### 1. Booking Processing Service

**Frontend Components Supported:**
- **Booking Creation**: Slot booking with visitor selection and group size
- **Booking Confirmation**: Status updates and payment processing
- **Booking Cancellation**: Cancellation with reason tracking
- **Booking Management**: Edit, update, and delete operations

```typescript
// services/bookingService.ts
import { db } from '../config/database';
import { Booking } from '../types/booking';

export class BookingService {
  
  async createBooking(bookingData: {
    slotId: string;
    visitorId: string;
    groupSize: number;
    specialRequests?: string;
    paymentMethod?: string;
  }, userId: string): Promise<Booking> {
    
    // Validate slot availability
    await this.validateSlotAvailability(bookingData.slotId, bookingData.groupSize);
    
    // Calculate total amount
    const totalAmount = await this.calculateBookingTotal(
      bookingData.visitorId,
      bookingData.groupSize,
      bookingData.slotId
    );

    // Create booking
    const query = `
      INSERT INTO bookings (
        slot_id, visitor_id, status, group_size, total_amount,
        payment_method, special_requests, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      bookingData.slotId,
      bookingData.visitorId,
      'tentative',
      bookingData.groupSize,
      totalAmount,
      bookingData.paymentMethod || 'pending',
      bookingData.specialRequests || null,
      userId
    ];

    const result = await db.query(query, values);
    
    // Update slot booked count
    await this.updateSlotBookedCount(bookingData.slotId);
    
    return this.transformBooking(result.rows[0]);
  }

  async confirmBooking(bookingId: string, userId: string): Promise<Booking> {
    const query = `
      UPDATE bookings 
      SET status = 'confirmed', 
          confirmed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [bookingId]);
    
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    // Update slot booked count
    await this.updateSlotBookedCount(result.rows[0].slot_id);
    
    return this.transformBooking(result.rows[0]);
  }

  async cancelBooking(bookingId: string, reason: string, userId: string): Promise<Booking> {
    const query = `
      UPDATE bookings 
      SET status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [bookingId, reason]);
    
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    // Update slot booked count
    await this.updateSlotBookedCount(result.rows[0].slot_id);
    
    return this.transformBooking(result.rows[0]);
  }

  private async validateSlotAvailability(slotId: string, groupSize: number): Promise<void> {
    const query = `
      SELECT capacity, booked_count, status
      FROM visit_slots
      WHERE id = $1
    `;

    const result = await db.query(query, [slotId]);
    
    if (result.rows.length === 0) {
      throw new Error('Slot not found');
    }

    const slot = result.rows[0];
    
    if (slot.status !== 'available') {
      throw new Error('Slot is not available for booking');
    }

    if (slot.booked_count + groupSize > slot.capacity) {
      throw new Error('Not enough capacity for the requested group size');
    }
  }

  private async calculateBookingTotal(visitorId: string, groupSize: number, slotId: string): Promise<number> {
    // Get visitor type
    const visitorQuery = `
      SELECT visitor_type
      FROM visitors
      WHERE id = $1
    `;
    
    const visitorResult = await db.query(visitorQuery, [visitorId]);
    const visitorType = visitorResult.rows[0]?.visitor_type || 'individual';

    // Get slot date for pricing
    const slotQuery = `
      SELECT date
      FROM visit_slots
      WHERE id = $1
    `;
    
    const slotResult = await db.query(slotQuery, [slotId]);
    const slotDate = slotResult.rows[0]?.date;

    // Get pricing rule
    const pricingQuery = `
      SELECT base_price, group_discount_percentage, min_group_size
      FROM pricing_rules
      WHERE visitor_type = $1
        AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM $2))
        AND effective_date <= $2
        AND (end_date IS NULL OR end_date >= $2)
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const pricingResult = await db.query(pricingQuery, [visitorType, slotDate]);
    
    let basePrice = 15.00; // Default price
    let discountPercentage = 0;
    let minGroupSize = null;

    if (pricingResult.rows.length > 0) {
      const pricing = pricingResult.rows[0];
      basePrice = parseFloat(pricing.base_price);
      discountPercentage = parseFloat(pricing.group_discount_percentage || '0');
      minGroupSize = pricing.min_group_size;
    }

    let total = basePrice * groupSize;

    // Apply group discount
    if (minGroupSize && groupSize >= minGroupSize) {
      total = total * (1 - discountPercentage / 100);
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  private async updateSlotBookedCount(slotId: string): Promise<void> {
    const query = `
      UPDATE visit_slots
      SET booked_count = (
        SELECT COALESCE(SUM(group_size), 0)
        FROM bookings
        WHERE slot_id = $1 AND status IN ('confirmed', 'tentative')
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(query, [slotId]);
  }

  private transformBooking(data: any): Booking {
    return {
      id: data.id,
      slotId: data.slot_id,
      visitorId: data.visitor_id,
      status: data.status,
      groupSize: data.group_size,
      totalAmount: parseFloat(data.total_amount),
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      notes: data.notes || '',
      specialRequests: data.special_requests || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
```

### 2. Notification Processing Service

**Frontend Components Supported:**
- **Notification List Widget**: All notifications with status and delivery information
- **Filter Controls Widget**: Status filter (All, Sent, Pending)
- **Create Notification Modal**: New notification creation with scheduling
- **View Notification Modal**: Detailed notification information
- **Notification Status Badges**: Sent/Pending status indicators

```typescript
// services/notificationService.ts
import { db } from '../config/database';
import { Notification } from '../types/notification';

export class NotificationService {
  
  async createNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    recipient: string;
    scheduledFor: Date;
    deliveryMethod: string;
    templateId?: string;
  }, userId: string): Promise<Notification> {
    
    const query = `
      INSERT INTO notifications (
        type, title, message, recipient, recipient_type,
        scheduled_for, delivery_method, template_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const recipientType = this.determineRecipientType(notificationData.recipient);

    const values = [
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.recipient,
      recipientType,
      notificationData.scheduledFor,
      notificationData.deliveryMethod,
      notificationData.templateId || null,
      userId
    ];

    const result = await db.query(query, values);
    return this.transformNotification(result.rows[0]);
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    const notification = await this.getNotificationById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.status !== 'pending') {
      throw new Error('Notification is not in pending status');
    }

    try {
      let sent = false;
      
      switch (notification.deliveryMethod) {
        case 'email':
          sent = await this.sendEmail(notification);
          break;
        case 'sms':
          sent = await this.sendSMS(notification);
          break;
        case 'in_app':
          sent = await this.sendInAppNotification(notification);
          break;
        default:
          throw new Error('Unsupported delivery method');
      }

      // Update notification status
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');
      
      return sent;
    } catch (error) {
      await this.updateNotificationStatus(notificationId, 'failed');
      throw error;
    }
  }

  async getNotifications(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{notifications: Notification[], total: number}> {
    
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters.type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(filters.type);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT 
        n.*,
        u.name as created_by_name
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, queryParams),
      db.query(dataQuery, [...queryParams, limit, offset])
    ]);

    return {
      notifications: dataResult.rows.map(row => this.transformNotification(row)),
      total: parseInt(countResult.rows[0].total)
    };
  }

  private determineRecipientType(recipient: string): string {
    if (recipient.includes('@')) {
      return 'user';
    } else if (recipient.includes('+') || /^\d+$/.test(recipient)) {
      return 'visitor';
    }
    return 'user';
  }

  private async sendEmail(notification: any): Promise<boolean> {
    // Implement email sending logic (e.g., using SendGrid, Nodemailer, etc.)
    // This is a placeholder implementation
    console.log(`Sending email to ${notification.recipient}: ${notification.title}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true; // Return true if email was sent successfully
  }

  private async sendSMS(notification: any): Promise<boolean> {
    // Implement SMS sending logic (e.g., using Twilio, etc.)
    // This is a placeholder implementation
    console.log(`Sending SMS to ${notification.recipient}: ${notification.message}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true; // Return true if SMS was sent successfully
  }

  private async sendInAppNotification(notification: any): Promise<boolean> {
    // Implement in-app notification logic
    // This could involve WebSocket connections or database updates
    console.log(`Sending in-app notification to ${notification.recipient}: ${notification.title}`);
    
    return true;
  }

  private async updateNotificationStatus(notificationId: string, status: string): Promise<void> {
    const query = `
      UPDATE notifications 
      SET status = $2, 
          sent_at = CASE WHEN $2 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(query, [notificationId, status]);
  }

  private async getNotificationById(id: string): Promise<any> {
    const query = `
      SELECT * FROM notifications WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  private transformNotification(data: any): Notification {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      message: data.message,
      recipient: data.recipient,
      scheduledFor: data.scheduled_for,
      sent: data.status === 'sent',
      createdAt: data.created_at
    };
  }
}
```

---

## API Controllers

### 1. Dashboard Controller

**API Endpoints for Dashboard Widgets:**
- `GET /api/dashboard/stats` - KPI Statistics Cards data
- `GET /api/dashboard/upcoming-visits` - Upcoming Visits Widget data
- `GET /api/dashboard/recent-activity` - Recent Activity Widget data
- `GET /api/dashboard/revenue-trend` - Revenue Trend Widget data

```typescript
// controllers/dashboardController.ts
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUpcomingVisits(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const visits = await this.dashboardService.getUpcomingVisits(limit);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await this.dashboardService.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRevenueTrend(req: Request, res: Response): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trend = await this.dashboardService.getRevenueTrend(days);
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### 2. Schedule Controller

**API Endpoints for Schedule Components:**
- `GET /api/schedule/slots` - Schedule slot data with filtering
- `GET /api/schedule/statistics` - Schedule Statistics Cards data
- `GET /api/schedule/issues` - Schedule Issues & Alerts Widget data
- `POST /api/schedule/slots` - Create new slot
- `PUT /api/schedule/slots/:id` - Update slot
- `DELETE /api/schedule/slots/:id` - Delete slot

```typescript
// controllers/scheduleController.ts
import { Request, Response } from 'express';
import { ScheduleService } from '../services/scheduleService';

export class ScheduleController {
  private scheduleService: ScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
  }

  async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        dateRange: req.query.dateRange as string,
        status: req.query.status as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.scheduleService.getSlots(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const slot = await this.scheduleService.getSlotById(id);
      
      if (!slot) {
        res.status(404).json({ error: 'Slot not found' });
        return;
      }

      res.json(slot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id; // From authentication middleware
      const slot = await this.scheduleService.createSlot(req.body, userId);
      res.status(201).json(slot);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const slot = await this.scheduleService.updateSlot(id, req.body, userId);
      res.json(slot);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await this.scheduleService.deleteSlot(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.scheduleService.getScheduleStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getIssues(req: Request, res: Response): Promise<void> {
    try {
      const issues = await this.scheduleService.getScheduleIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

## Data Validation

### Validation Middleware

```typescript
// middleware/validation.ts
import Joi from 'joi';

export const validateSlot = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    date: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    duration: Joi.number().integer().min(1).required(),
    capacity: Joi.number().integer().min(1).max(100).required(),
    status: Joi.string().valid('available', 'booked', 'cancelled', 'maintenance').default('available'),
    description: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateVisitor = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    organization: Joi.string().max(255).optional(),
    specialRequirements: Joi.string().max(1000).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    slotId: Joi.string().uuid().required(),
    visitorId: Joi.string().uuid().required(),
    groupSize: Joi.number().integer().min(1).max(50).required(),
    specialRequests: Joi.string().max(1000).optional(),
    paymentMethod: Joi.string().valid('credit_card', 'cash', 'online', 'check', 'free').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

---

## Error Handling

### Global Error Handler

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

## Performance Optimization

### Database Connection Pool

```typescript
// config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'museum_scheduling',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export { pool as db };
```

### Caching Service

```typescript
// services/cacheService.ts
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }
}

export const cacheService = new CacheService();
```

This comprehensive backend data processing guide provides all the necessary components to build a robust backend system for the Museum Scheduling System. It includes data processing services, business logic, API controllers, validation, error handling, and performance optimization strategies.
