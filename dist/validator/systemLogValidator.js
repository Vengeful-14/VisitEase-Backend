"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCleanupRequest = exports.validateSystemLogStats = exports.validateSystemLogId = exports.validateSystemLogQuery = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validate system log query parameters
 */
exports.validateSystemLogQuery = [
    (0, express_validator_1.query)('level')
        .optional()
        .isIn(['debug', 'info', 'warn', 'error', 'fatal'])
        .withMessage('Level must be one of: debug, info, warn, error, fatal'),
    (0, express_validator_1.query)('userId')
        .optional()
        .isUUID()
        .withMessage('User ID must be a valid UUID'),
    (0, express_validator_1.query)('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('action')
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('Action must be a string between 1 and 50 characters'),
    (0, express_validator_1.query)('skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Skip must be a non-negative integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
/**
 * Validate system log ID parameter
 */
exports.validateSystemLogId = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('System log ID must be a valid UUID')
];
/**
 * Validate system log statistics query parameters
 */
exports.validateSystemLogStats = [
    (0, express_validator_1.query)('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid ISO 8601 date')
];
/**
 * Validate cleanup request body
 */
exports.validateCleanupRequest = [
    (0, express_validator_1.body)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be between 1 and 365')
];
//# sourceMappingURL=systemLogValidator.js.map