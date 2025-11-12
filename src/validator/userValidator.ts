import { body } from 'express-validator';
import { validateEmail, validatePassword, validateName, validatePhone, validateUUID } from './commonValidator';

// User registration validation rules
export const validateUserRegistration = [
  ...validateEmail('email'),
  ...validateName('name'),
  ...validatePassword,
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'visitor'])
    .withMessage('Role must be admin, staff, or visitor'),
];

// User login validation rules
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// User profile update validation rules
export const validateUserProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for avatar'),
];

// Password change validation rules
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// User ID parameter validation
export const validateUserId = [
  body('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

// Refresh token validation
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

// Staff user creation validation rules (admin only - no role field allowed)
export const validateStaffUserCreation = [
  ...validateEmail('email'),
  ...validateName('name'),
  ...validatePassword,
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  // Explicitly reject role field if provided (even if null or empty)
  body('role')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        throw new Error('Role cannot be specified. Staff users are created with staff role only.');
      }
      return true;
    }),
];

// Reset staff password validation rules (admin only - requires admin password confirmation)
export const validateResetStaffPassword = [
  body('staffUserId')
    .isUUID()
    .withMessage('Staff user ID must be a valid UUID'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('adminPassword')
    .notEmpty()
    .withMessage('Admin password is required for confirmation'),
];