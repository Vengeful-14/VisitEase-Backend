import { query, param } from 'express-validator';

// Dashboard statistics validation
export const validateDashboardStats = [
  // No specific validation needed for basic stats request
];

// Upcoming visits validation
export const validateUpcomingVisits = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
];

// Recent activity validation
export const validateRecentActivity = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
];

// Revenue trend validation
export const validateRevenueTrend = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be an integer between 1 and 365')
    .toInt(),
];
