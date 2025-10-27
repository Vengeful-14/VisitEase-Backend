"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteNotificationTemplate = exports.validateUpdateNotificationTemplate = exports.validateCreateNotificationTemplate = exports.validateGetNotifications = exports.validateSendNotification = exports.validateCreateNotification = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// Create notification validation
exports.validateCreateNotification = [
    (0, express_validator_1.body)('type')
        .isIn(['booking_confirmation', 'booking_reminder', 'booking_cancellation', 'payment_reminder', 'general_announcement', 'maintenance_alert'])
        .withMessage('Type must be one of: booking_confirmation, booking_reminder, booking_cancellation, payment_reminder, general_announcement, maintenance_alert'),
    (0, express_validator_1.body)('title')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .trim(),
    (0, express_validator_1.body)('message')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message must be between 1 and 2000 characters')
        .trim(),
    (0, express_validator_1.body)('recipient')
        .isLength({ min: 1, max: 200 })
        .withMessage('Recipient must be between 1 and 200 characters')
        .trim(),
    (0, express_validator_1.body)('scheduledFor')
        .optional()
        .isISO8601()
        .withMessage('Scheduled date must be a valid ISO 8601 date')
        .custom((value) => {
        if (value) {
            const scheduledDate = new Date(value);
            const now = new Date();
            if (scheduledDate < now) {
                throw new Error('Scheduled date cannot be in the past');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('deliveryMethod')
        .isIn(['email', 'sms', 'in_app', 'all'])
        .withMessage('Delivery method must be one of: email, sms, in_app, all'),
    (0, express_validator_1.body)('templateId')
        .optional()
        .isUUID()
        .withMessage('Template ID must be a valid UUID'),
    (0, express_validator_1.body)('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be a valid object'),
];
// Send notification validation
exports.validateSendNotification = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Get notifications validation
exports.validateGetNotifications = [
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['booking_confirmation', 'booking_reminder', 'booking_cancellation', 'payment_reminder', 'general_announcement', 'maintenance_alert'])
        .withMessage('Type must be one of: booking_confirmation, booking_reminder, booking_cancellation, payment_reminder, general_announcement, maintenance_alert'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['pending', 'sent', 'failed', 'cancelled'])
        .withMessage('Status must be one of: pending, sent, failed, cancelled'),
    (0, express_validator_1.query)('deliveryMethod')
        .optional()
        .isIn(['email', 'sms', 'in_app', 'all'])
        .withMessage('Delivery method must be one of: email, sms, in_app, all'),
    (0, express_validator_1.query)('recipient')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Recipient must be between 1 and 200 characters')
        .trim(),
    (0, express_validator_1.query)('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid ISO 8601 date'),
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
// Create notification template validation
exports.validateCreateNotificationTemplate = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 1, max: 100 })
        .withMessage('Template name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('type')
        .isIn(['booking_confirmation', 'booking_reminder', 'booking_cancellation', 'payment_reminder', 'general_announcement', 'maintenance_alert'])
        .withMessage('Type must be one of: booking_confirmation, booking_reminder, booking_cancellation, payment_reminder, general_announcement, maintenance_alert'),
    (0, express_validator_1.body)('subject')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Subject must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('bodyTemplate')
        .isLength({ min: 1, max: 5000 })
        .withMessage('Body template must be between 1 and 5000 characters')
        .trim(),
    (0, express_validator_1.body)('variables')
        .isArray()
        .withMessage('Variables must be an array')
        .custom((value) => {
        if (!Array.isArray(value)) {
            throw new Error('Variables must be an array');
        }
        for (const variable of value) {
            if (typeof variable !== 'string') {
                throw new Error('Each variable must be a string');
            }
            if (variable.length === 0 || variable.length > 50) {
                throw new Error('Each variable must be between 1 and 50 characters');
            }
        }
        return true;
    }),
];
// Update notification template validation
exports.validateUpdateNotificationTemplate = [
    ...(0, commonValidator_1.validateUUID)('id'),
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Template name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['booking_confirmation', 'booking_reminder', 'booking_cancellation', 'payment_reminder', 'general_announcement', 'maintenance_alert'])
        .withMessage('Type must be one of: booking_confirmation, booking_reminder, booking_cancellation, payment_reminder, general_announcement, maintenance_alert'),
    (0, express_validator_1.body)('subject')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Subject must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('bodyTemplate')
        .optional()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Body template must be between 1 and 5000 characters')
        .trim(),
    (0, express_validator_1.body)('variables')
        .optional()
        .isArray()
        .withMessage('Variables must be an array')
        .custom((value) => {
        if (value && !Array.isArray(value)) {
            throw new Error('Variables must be an array');
        }
        if (value) {
            for (const variable of value) {
                if (typeof variable !== 'string') {
                    throw new Error('Each variable must be a string');
                }
                if (variable.length === 0 || variable.length > 50) {
                    throw new Error('Each variable must be between 1 and 50 characters');
                }
            }
        }
        return true;
    }),
];
// Delete notification template validation
exports.validateDeleteNotificationTemplate = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
//# sourceMappingURL=notificationValidator.js.map