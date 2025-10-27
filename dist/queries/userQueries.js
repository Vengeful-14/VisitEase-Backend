"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPassword = exports.markPasswordResetTokenAsUsed = exports.findPasswordResetToken = exports.createPasswordResetToken = exports.deactivateUserSession = exports.findUserSession = exports.createUserSession = exports.updateLastLogin = exports.findUserById = exports.findUserByEmail = exports.createUser = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
// Create a new user
const createUser = async (userData) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.createUser = createUser;
// Check if user exists by email
const findUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return user;
    }
    catch (error) {
        throw error;
    }
};
exports.findUserByEmail = findUserByEmail;
// Get user by ID
const findUserById = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.findUserById = findUserById;
// Update user's last login time
const updateLastLogin = async (userId) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updateLastLogin = updateLastLogin;
// Create user session
const createUserSession = async (sessionData) => {
    try {
        await prisma.userSession.create({
            data: sessionData,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createUserSession = createUserSession;
// Find user session by token
const findUserSession = async (sessionToken) => {
    try {
        const session = await prisma.userSession.findUnique({
            where: { sessionToken },
            include: { user: true },
        });
        return session;
    }
    catch (error) {
        throw error;
    }
};
exports.findUserSession = findUserSession;
// Deactivate user session
const deactivateUserSession = async (sessionToken) => {
    try {
        await prisma.userSession.update({
            where: { sessionToken },
            data: { isActive: false },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.deactivateUserSession = deactivateUserSession;
// Create password reset token
const createPasswordResetToken = async (tokenData) => {
    try {
        await prisma.passwordResetToken.create({
            data: tokenData,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createPasswordResetToken = createPasswordResetToken;
// Find password reset token
const findPasswordResetToken = async (token) => {
    try {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        return resetToken;
    }
    catch (error) {
        throw error;
    }
};
exports.findPasswordResetToken = findPasswordResetToken;
// Mark password reset token as used
const markPasswordResetTokenAsUsed = async (token) => {
    try {
        await prisma.passwordResetToken.update({
            where: { token },
            data: { usedAt: new Date() },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.markPasswordResetTokenAsUsed = markPasswordResetTokenAsUsed;
// Update user password
const updateUserPassword = async (userId, passwordHash) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updateUserPassword = updateUserPassword;
//# sourceMappingURL=userQueries.js.map