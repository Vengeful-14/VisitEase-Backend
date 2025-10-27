"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userQueries_1 = require("../queries/userQueries");
// User registration controller
const registerUser = async (req, res) => {
    try {
        const { email, name, password, phone, role } = req.body;
        // Check if user already exists
        const existingUser = await (0, userQueries_1.findUserByEmail)(email);
        if (existingUser) {
            const errorResponse = {
                success: false,
                message: 'User with this email already exists',
            };
            res.status(409).json(errorResponse);
            return;
        }
        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user data
        const userData = {
            email,
            name,
            passwordHash,
            phone,
            role,
        };
        // Create the user
        const newUser = await (0, userQueries_1.createUser)(userData);
        // Return success response (without password hash)
        const successResponse = {
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser,
            },
        };
        res.status(201).json(successResponse);
    }
    catch (error) {
        console.error('Registration error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error during registration',
        };
        res.status(500).json(errorResponse);
    }
};
exports.registerUser = registerUser;
// Get user profile controller
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            const errorResponse = {
                success: false,
                message: 'User ID is required',
            };
            res.status(400).json(errorResponse);
            return;
        }
        const user = await (0, userQueries_1.findUserById)(userId);
        if (!user) {
            const errorResponse = {
                success: false,
                message: 'User not found',
            };
            res.status(404).json(errorResponse);
            return;
        }
        const successResponse = {
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
    }
    catch (error) {
        console.error('Get user profile error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error',
        };
        res.status(500).json(errorResponse);
    }
};
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=userController.js.map