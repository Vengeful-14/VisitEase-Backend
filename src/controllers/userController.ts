import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById, findUserByIdWithPassword, updateUserPassword, getAllStaffUsers, updateUserActiveStatus } from '../queries/userQueries';
import { CreateUserData, UserRegistrationRequest, ApiResponse, ApiErrorResponse, ApiSuccessResponse, AuthRequest } from '../type';

// User registration controller
export const registerUser = async (req: Request<{}, ApiResponse, UserRegistrationRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, name, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User with this email already exists',
      };
      res.status(409).json(errorResponse);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user data
    const userData: CreateUserData = {
      email,
      name,
      passwordHash,
      phone,
      role,
    };

    // Create the user
    const newUser = await createUser(userData);

    // Return success response (without password hash)
    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
      },
    };
    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Registration error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error during registration',
    };
    res.status(500).json(errorResponse);
  }
};

// Get all staff users controller (admin only)
export const getStaffUsers = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const staffUsers = await getAllStaffUsers();
    
    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Staff users retrieved successfully',
      data: {
        users: staffUsers,
      },
    };
    
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Get staff users error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve staff users',
    };
    res.status(500).json(errorResponse);
  }
};

// Deactivate user controller (admin only)
export const deactivateUser = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User ID is required',
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // Get user to verify it exists and is staff
    const user = await findUserById(userId);
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(errorResponse);
      return;
    }
    
    // Only allow deactivating staff users
    if (user.role !== 'staff') {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Only staff users can be deactivated',
      };
      res.status(403).json(errorResponse);
      return;
    }
    
    // Prevent deactivating self
    if (user.id === req.user!.userId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'You cannot deactivate your own account',
      };
      res.status(403).json(errorResponse);
      return;
    }
    
    // Update user active status
    const updatedUser = await updateUserActiveStatus(userId, false);
    
    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: updatedUser,
      },
    };
    
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Deactivate user error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to deactivate user',
    };
    res.status(500).json(errorResponse);
  }
};

// Activate user controller (admin only)
export const activateUser = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User ID is required',
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // Get user to verify it exists and is staff
    const user = await findUserById(userId);
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(errorResponse);
      return;
    }
    
    // Only allow activating staff users
    if (user.role !== 'staff') {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Only staff users can be activated',
      };
      res.status(403).json(errorResponse);
      return;
    }
    
    // Update user active status
    const updatedUser = await updateUserActiveStatus(userId, true);
    
    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'User activated successfully',
      data: {
        user: updatedUser,
      },
    };
    
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Activate user error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to activate user',
    };
    res.status(500).json(errorResponse);
  }
};

// Create staff user controller (admin only)
export const createStaffUser = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, name, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User with this email already exists',
      };
      res.status(409).json(errorResponse);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user data - force role to 'staff' only
    const userData: CreateUserData = {
      email,
      name,
      passwordHash,
      phone,
      role: 'staff', // Always set to staff, ignore any role in request
    };

    // Create the user
    const newUser = await createUser(userData);

    // Return success response (without password hash)
    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Staff user created successfully',
      data: {
        user: newUser,
      },
    };
    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Create staff user error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error during staff user creation',
    };
    res.status(500).json(errorResponse);
  }
};

// Reset staff password controller (admin only, requires admin password confirmation)
export const resetStaffPassword = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { staffUserId, newPassword, adminPassword } = req.body;

    // Validate required fields
    if (!staffUserId || !newPassword || !adminPassword) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Staff user ID, new password, and admin password are required',
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Get admin user to verify password
    const adminUser = await findUserByEmail(req.user!.email);
    if (!adminUser || !adminUser.passwordHash) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Admin account not found or uses OAuth authentication',
      };
      res.status(404).json(errorResponse);
      return;
    }

    // Verify admin's password
    const isAdminPasswordValid = await bcrypt.compare(adminPassword, adminUser.passwordHash);
    if (!isAdminPasswordValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Invalid admin password. Password confirmation failed.',
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Get staff user
    const staffUser = await findUserByIdWithPassword(staffUserId);
    if (!staffUser) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Staff user not found',
      };
      res.status(404).json(errorResponse);
      return;
    }

    // Verify user is a staff member
    if (staffUser.role !== 'staff') {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User is not a staff member. Only staff passwords can be reset.',
      };
      res.status(403).json(errorResponse);
      return;
    }

    // Check if staff user is active
    if (!staffUser.isActive) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Staff user account is deactivated',
      };
      res.status(403).json(errorResponse);
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update staff user's password
    await updateUserPassword(staffUserId, passwordHash);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Staff password reset successfully',
      data: {
        userId: staffUserId,
        email: staffUser.email,
      },
    };
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Reset staff password error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error during password reset',
    };
    res.status(500).json(errorResponse);
  }
};

// Get user profile controller
export const getUserProfile = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User ID is required',
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Authorization: Staff users can only view their own profile, admins can view any profile
    if (!req.user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Authentication required',
      };
      res.status(401).json(errorResponse);
      return;
    }

    if (req.user.role === 'staff' && req.user.userId !== userId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Insufficient permissions. Staff users can only view their own profile.',
      };
      res.status(403).json(errorResponse);
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(errorResponse);
      return;
    }

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl || undefined,
          role: user.role,
          emailVerified: user.emailVerified,
          phone: user.phone || undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt || undefined,
          isActive: user.isActive,
        },
      },
    };
    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Get user profile error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(errorResponse);
  }
};
