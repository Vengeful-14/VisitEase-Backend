"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRevenueTrend = exports.validateRecentActivity = exports.validateUpcomingVisits = exports.validateDashboardStats = void 0;
const express_validator_1 = require("express-validator");
// Dashboard statistics validation
exports.validateDashboardStats = [
// No specific validation needed for basic stats request
];
// Upcoming visits validation
exports.validateUpcomingVisits = [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
];
// Recent activity validation
exports.validateRecentActivity = [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
];
// Revenue trend validation
exports.validateRevenueTrend = [
    (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be an integer between 1 and 365')
        .toInt(),
];
//# sourceMappingURL=dashboardValidator.js.map