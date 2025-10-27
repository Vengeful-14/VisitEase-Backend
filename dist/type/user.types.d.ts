import { UserRole } from '../generated/prisma';
export interface CreateUserData {
    email: string;
    name: string;
    passwordHash: string;
    phone?: string;
    role?: UserRole;
}
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: UserRole;
    emailVerified: boolean;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    isActive: boolean;
}
export interface UserRegistrationRequest {
    email: string;
    name: string;
    password: string;
    phone?: string;
    role?: UserRole;
}
export interface UserProfileResponse {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
    emailVerified: boolean;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
}
//# sourceMappingURL=user.types.d.ts.map