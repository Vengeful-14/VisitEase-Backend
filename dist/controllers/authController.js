"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.logoutUser = exports.refreshToken = exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const userQueries_1 = require("../queries/userQueries");
const auth_1 = require("../auth");
// User login controller
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await (0, userQueries_1.findUserByEmail)(email);
        if (!user) {
            const errorResponse = {
                success: false,
                message: 'Invalid email or password',
            };
            res.status(401).json(errorResponse);
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            const errorResponse = {
                success: false,
                message: 'Account is deactivated. Please contact support.',
            };
            res.status(401).json(errorResponse);
            return;
        }
        // Check if user has a password (not OAuth user)
        if (!user.passwordHash) {
            const errorResponse = {
                success: false,
                message: 'Please use social login for this account',
            };
            res.status(401).json(errorResponse);
            return;
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            const errorResponse = {
                success: false,
                message: 'Invalid email or password',
            };
            res.status(401).json(errorResponse);
            return;
        }
        // Generate JWT tokens
        const tokenPair = (0, auth_1.generateTokenPair)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        // Create session token for additional security
        const sessionToken = crypto_1.default.randomBytes(32).toString('hex');
        const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Create user session
        await (0, userQueries_1.createUserSession)({
            userId: user.id,
            sessionToken,
            expiresAt: sessionExpiresAt,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
        });
        // Update last login time
        await (0, userQueries_1.updateLastLogin)(user.id);
        // Prepare user data for response (without sensitive information)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl || undefined,
            role: user.role,
            emailVerified: user.emailVerified,
            phone: user.phone || undefined,
            isActive: user.isActive,
        };
        // Prepare login response
        const loginResponse = {
            user: userData,
            token: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            sessionToken,
            sessionExpiresAt: sessionExpiresAt.toISOString(),
        };
        const successResponse = {
            success: true,
            message: 'Login successful',
            data: loginResponse,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Login error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error during login',
        };
        res.status(500).json(errorResponse);
    }
};
exports.loginUser = loginUser;
// Refresh token controller
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            const errorResponse = {
                success: false,
                message: 'Refresh token is required',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Verify refresh token
        const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require('../auth')));
        const { userId } = verifyRefreshToken(refreshToken);
        // Find user to get current role and email
        const user = await (0, userQueries_1.findUserById)(userId);
        if (!user || !user.isActive) {
            const errorResponse = {
                success: false,
                message: 'Invalid refresh token',
            };
            res.status(401).json(errorResponse);
            return;
        }
        // Generate new token pair
        const tokenPair = (0, auth_1.generateTokenPair)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const successResponse = {
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokenPair.accessToken,
                refreshToken: tokenPair.refreshToken,
                expiresIn: tokenPair.expiresIn,
                tokenType: tokenPair.tokenType,
            },
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Refresh token error:', error);
        const errorResponse = {
            success: false,
            message: 'Invalid or expired refresh token',
        };
        res.status(401).json(errorResponse);
    }
};
exports.refreshToken = refreshToken;
// Logout controller - simplified without session token requirement
const logoutUser = async (req, res) => {
    try {
        // Extract session token from request headers or body (optional)
        const sessionToken = req.headers['x-session-token'] || req.body?.sessionToken;
        // If session token is provided, try to deactivate it (but don't fail if it doesn't exist)
        if (sessionToken) {
            try {
                await (0, userQueries_1.deactivateUserSession)(sessionToken);
            }
            catch (sessionError) {
                // Log the error but don't fail the logout
                console.warn('Session deactivation failed (session may not exist):', sessionError);
            }
        }
        const successResponse = {
            success: true,
            message: 'Logout successful. Please remove the token from client storage.',
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Logout error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error during logout',
        };
        res.status(500).json(errorResponse);
    }
};
exports.logoutUser = logoutUser;
// Request password reset controller
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            const errorResponse = {
                success: false,
                message: 'Email is required',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Find user by email
        const user = await (0, userQueries_1.findUserByEmail)(email);
        if (!user) {
            // Don't reveal if email exists or not for security
            const successResponse = {
                success: true,
                message: 'If the email exists, a password reset link has been sent.',
            };
            res.status(200).json(successResponse);
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Create password reset token
        await (0, userQueries_1.createPasswordResetToken)({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        // TODO: Send email with reset link
        // For now, we'll just return success
        // In production, you would send an email with the reset link
        const successResponse = {
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
            data: {
                // Only include token in development
                ...(process.env.NODE_ENV === 'development' && { resetToken }),
            },
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Password reset request error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error during password reset request',
        };
        res.status(500).json(errorResponse);
    }
};
exports.requestPasswordReset = requestPasswordReset;
// Reset password controller
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            const errorResponse = {
                success: false,
                message: 'Token and new password are required',
            };
            res.status(400).json(errorResponse);
            return;
        }
        if (newPassword.length < 6) {
            const errorResponse = {
                success: false,
                message: 'Password must be at least 6 characters long',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Find password reset token
        const resetTokenRecord = await (0, userQueries_1.findPasswordResetToken)(token);
        if (!resetTokenRecord) {
            const errorResponse = {
                success: false,
                message: 'Invalid or expired reset token',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Check if token is expired
        if (resetTokenRecord.expiresAt < new Date()) {
            const errorResponse = {
                success: false,
                message: 'Reset token has expired',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Check if token has already been used
        if (resetTokenRecord.usedAt) {
            const errorResponse = {
                success: false,
                message: 'Reset token has already been used',
            };
            res.status(400).json(errorResponse);
            return;
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        // Update user password
        await (0, userQueries_1.updateUserPassword)(resetTokenRecord.userId, passwordHash);
        // Mark token as used
        await (0, userQueries_1.markPasswordResetTokenAsUsed)(token);
        const successResponse = {
            success: true,
            message: 'Password has been reset successfully',
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Password reset error:', error);
        const errorResponse = {
            success: false,
            message: 'Internal server error during password reset',
        };
        res.status(500).json(errorResponse);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map