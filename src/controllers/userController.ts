import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../queries/userQueries';
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
