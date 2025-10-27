"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchQuery = exports.validateURL = exports.validatePhone = exports.validateName = exports.validatePassword = exports.validateEmail = exports.validateUUID = exports.validatePagination = void 0;
const express_validator_1 = require("express-validator");
// Common validation rules for pagination
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Sort field must be a string between 1 and 50 characters'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either "asc" or "desc"'),
];
// UUID parameter validation
const validateUUID = (field) => [
    (0, express_validator_1.param)(field)
        .isUUID()
        .withMessage(`${field} must be a valid UUID`),
];
exports.validateUUID = validateUUID;
// Email validation
const validateEmail = (field) => [
    (0, express_validator_1.body)(field)
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
];
exports.validateEmail = validateEmail;
// Password validation
exports.validatePassword = [
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];
// Name validation
const validateName = (field) => [
    (0, express_validator_1.body)(field)
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
];
exports.validateName = validateName;
// Phone validation
exports.validatePhone = [
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
];
// URL validation
exports.validateURL = [
    (0, express_validator_1.body)('url')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
];
// Search query validation
exports.validateSearchQuery = [
    (0, express_validator_1.query)('q')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
];
//# sourceMappingURL=commonValidator.js.map