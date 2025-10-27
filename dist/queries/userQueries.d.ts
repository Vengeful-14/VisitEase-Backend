import { User } from '../generated/prisma';
import { CreateUserData, UserResponse } from '../type';
export declare const createUser: (userData: CreateUserData) => Promise<UserResponse>;
export declare const findUserByEmail: (email: string) => Promise<User | null>;
export declare const findUserById: (id: string) => Promise<UserResponse | null>;
export declare const updateLastLogin: (userId: string) => Promise<void>;
export declare const createUserSession: (sessionData: {
    userId: string;
    sessionToken: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}) => Promise<void>;
export declare const findUserSession: (sessionToken: string) => Promise<({
    user: {
        name: string;
        id: string;
        email: string;
        avatarUrl: string | null;
        role: import("../generated/prisma").$Enums.UserRole;
        passwordHash: string | null;
        emailVerified: boolean;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isActive: boolean;
    };
} & {
    id: string;
    createdAt: Date;
    isActive: boolean;
    sessionToken: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    lastAccessedAt: Date;
    userId: string;
}) | null>;
export declare const deactivateUserSession: (sessionToken: string) => Promise<void>;
export declare const createPasswordResetToken: (tokenData: {
    userId: string;
    token: string;
    expiresAt: Date;
}) => Promise<void>;
export declare const findPasswordResetToken: (token: string) => Promise<({
    user: {
        name: string;
        id: string;
        email: string;
        avatarUrl: string | null;
        role: import("../generated/prisma").$Enums.UserRole;
        passwordHash: string | null;
        emailVerified: boolean;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isActive: boolean;
    };
} & {
    id: string;
    createdAt: Date;
    expiresAt: Date;
    userId: string;
    token: string;
    usedAt: Date | null;
}) | null>;
export declare const markPasswordResetTokenAsUsed: (token: string) => Promise<void>;
export declare const updateUserPassword: (userId: string, passwordHash: string) => Promise<void>;
//# sourceMappingURL=userQueries.d.ts.map