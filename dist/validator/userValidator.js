"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.validateUserId = exports.validatePasswordChange = exports.validateUserProfileUpdate = exports.validateUserLogin = exports.validateUserRegistration = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// User registration validation rules
exports.validateUserRegistration = [
    ...(0, commonValidator_1.validateEmail)('email'),
    ...(0, commonValidator_1.validateName)('name'),
    ...commonValidator_1.validatePassword,
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'staff', 'visitor'])
        .withMessage('Role must be admin, staff, or visitor'),
];
// User login validation rules
exports.validateUserLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
// User profile update validation rules
exports.validateUserProfileUpdate = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any', { strictMode: false })
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('avatarUrl')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL for avatar'),
];
// Password change validation rules
exports.validatePasswordChange = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
        }
        return true;
    }),
];
// User ID parameter validation
exports.validateUserId = [
    (0, express_validator_1.body)('id')
        .isUUID()
        .withMessage('User ID must be a valid UUID'),
];
// Refresh token validation
exports.validateRefreshToken = [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isString()
        .withMessage('Refresh token must be a string'),
];
//# sourceMappingURL=userValidator.js.map