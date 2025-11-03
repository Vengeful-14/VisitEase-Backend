import { UserRole } from '../generated/prisma';

// User creation data interface
export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
  role?: UserRole;
}

// User response interface (for API responses)
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

// User registration request interface
export interface UserRegistrationRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

// User profile response interface (for public profile data)
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
