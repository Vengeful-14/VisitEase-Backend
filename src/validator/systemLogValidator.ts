import { body, query, param } from 'express-validator';
import { LogLevel } from '../generated/prisma';

/**
 * Validate system log query parameters
 */
export const validateSystemLogQuery = [
  query('level')
    .optional()
    .isIn(['debug', 'info', 'warn', 'error', 'fatal'])
    .withMessage('Level must be one of: debug, info, warn, error, fatal'),
  
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  
  query('action')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Action must be a string between 1 and 50 characters'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validate system log ID parameter
 */
export const validateSystemLogId = [
  param('id')
    .isUUID()
    .withMessage('System log ID must be a valid UUID')
];

/**
 * Validate system log statistics query parameters
 */
export const validateSystemLogStats = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
];

/**
 * Validate cleanup request body
 */
export const validateCleanupRequest = [
  body('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

