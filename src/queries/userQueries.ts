import { PrismaClient, User, UserRole } from '../generated/prisma';
import { CreateUserData, UserResponse } from '../type';

const prisma = new PrismaClient();

// Create a new user
export const createUser = async (userData: CreateUserData): Promise<UserResponse> => {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: userData.passwordHash,
        phone: userData.phone,
        role: userData.role || 'visitor',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        isActive: true,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Check if user exists by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const findUserById = async (id: string): Promise<UserResponse | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        isActive: true,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Update user's last login time
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    throw error;
  }
};

// Create user session
export const createUserSession = async (sessionData: {
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  try {
    await prisma.userSession.create({
      data: sessionData,
    });
  } catch (error) {
    throw error;
  }
};

// Find user session by token
export const findUserSession = async (sessionToken: string) => {
  try {
    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    return session;
  } catch (error) {
    throw error;
  }
};

// Deactivate user session
export const deactivateUserSession = async (sessionToken: string): Promise<void> => {
  try {
    await prisma.userSession.update({
      where: { sessionToken },
      data: { isActive: false },
    });
  } catch (error) {
    throw error;
  }
};

// Create password reset token
export const createPasswordResetToken = async (tokenData: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Promise<void> => {
  try {
    await prisma.passwordResetToken.create({
      data: tokenData,
    });
  } catch (error) {
    throw error;
  }
};

// Find password reset token
export const findPasswordResetToken = async (token: string) => {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    return resetToken;
  } catch (error) {
    throw error;
  }
};

// Mark password reset token as used
export const markPasswordResetTokenAsUsed = async (token: string): Promise<void> => {
  try {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  } catch (error) {
    throw error;
  }
};

// Get user by ID with password hash (for admin operations)
export const findUserByIdWithPassword = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (userId: string, passwordHash: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  } catch (error) {
    throw error;
  }
};
