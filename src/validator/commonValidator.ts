import { body, param, query } from 'express-validator';

// Common validation rules for pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be a string between 1 and 50 characters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
];

// UUID parameter validation
export const validateUUID = (field: string) => [
  param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`),
];

// Email validation
export const validateEmail = (field: string) => [
  body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Password validation
export const validatePassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

// Name validation
export const validateName = (field: string) => [
  body(field)
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
];

// Phone validation
export const validatePhone = [
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

// URL validation
export const validateURL = [
  body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
];

// Search query validation
export const validateSearchQuery = [
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
