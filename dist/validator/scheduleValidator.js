"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateScheduleIssues = exports.validateScheduleStats = exports.validateDeleteSlot = exports.validateUpdateSlot = exports.validateCreateSlot = exports.validateGetSlot = exports.validateGetSlots = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// Get slots validation
exports.validateGetSlots = [
    (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['available', 'booked', 'cancelled', 'maintenance'])
        .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
    (0, express_validator_1.query)('skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Skip must be a non-negative integer')
        .toInt(),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
];
// Get slot by ID validation
exports.validateGetSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Create slot validation
exports.validateCreateSlot = [
    (0, express_validator_1.body)('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date')
        .custom((value) => {
        const slotDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (slotDate < today) {
            throw new Error('Slot date cannot be in the past');
        }
        return true;
    }),
    (0, express_validator_1.body)('startTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    (0, express_validator_1.body)('endTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
        .custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (startTime && value <= startTime) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
    (0, express_validator_1.body)('duration')
        .isInt({ min: 15, max: 480 })
        .withMessage('Duration must be between 15 and 480 minutes')
        .toInt(),
    (0, express_validator_1.body)('capacity')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Capacity must be between 1 and 1000')
        .toInt(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['available', 'booked', 'cancelled', 'maintenance'])
        .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
];
// Update slot validation
exports.validateUpdateSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date')
        .custom((value) => {
        const slotDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (slotDate < today) {
            throw new Error('Slot date cannot be in the past');
        }
        return true;
    }),
    (0, express_validator_1.body)('startTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    (0, express_validator_1.body)('endTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 15, max: 480 })
        .withMessage('Duration must be between 15 and 480 minutes')
        .toInt(),
    (0, express_validator_1.body)('capacity')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Capacity must be between 1 and 1000')
        .toInt(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['available', 'booked', 'cancelled', 'maintenance'])
        .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
];
// Delete slot validation
exports.validateDeleteSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Get schedule statistics validation
exports.validateScheduleStats = [
// No specific validation needed for basic stats request
];
// Get schedule issues validation
exports.validateScheduleIssues = [
// No specific validation needed for basic issues request
];
//# sourceMappingURL=scheduleValidator.js.map