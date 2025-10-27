"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVisitorSlotStats = exports.validateConfirmVisitorSlot = exports.validateCancelVisitorSlot = exports.validateCheckSlotAvailability = exports.validateGetVisitorSlotsBySlot = exports.validateGetVisitorSlotsByVisitor = exports.validateDeleteVisitorSlot = exports.validateGetVisitorSlot = exports.validateVisitorSlotSearch = exports.validateVisitorSlotUpdate = exports.validateVisitorSlotBooking = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// Visitor slot booking validation (for Booking model)
exports.validateVisitorSlotBooking = [
    ...(0, commonValidator_1.validateUUID)('visitorId'),
    ...(0, commonValidator_1.validateUUID)('slotId'),
    (0, express_validator_1.body)('groupSize')
        .isInt({ min: 1, max: 50 })
        .withMessage('Group size must be between 1 and 50')
        .toInt(),
    (0, express_validator_1.body)('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a non-negative number')
        .toFloat(),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['credit_card', 'cash', 'online', 'check', 'free'])
        .withMessage('Payment method must be one of: credit_card, cash, online, check, free'),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special requests must not exceed 1000 characters')
        .trim(),
];
// Visitor slot update validation (for Booking model)
exports.validateVisitorSlotUpdate = [
    (0, express_validator_1.body)('groupSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Group size must be between 1 and 50')
        .toInt(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
        .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special requests must not exceed 1000 characters')
        .trim(),
    (0, express_validator_1.body)('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a non-negative number')
        .toFloat(),
    (0, express_validator_1.body)('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'refunded', 'failed'])
        .withMessage('Payment status must be one of: pending, paid, refunded, failed'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['credit_card', 'cash', 'online', 'check', 'free'])
        .withMessage('Payment method must be one of: credit_card, cash, online, check, free'),
    (0, express_validator_1.body)('cancellationReason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Cancellation reason must not exceed 500 characters')
        .trim(),
];
// Visitor slot search validation
exports.validateVisitorSlotSearch = [
    (0, express_validator_1.query)('visitorId')
        .optional()
        .isUUID()
        .withMessage('Visitor ID must be a valid UUID'),
    (0, express_validator_1.query)('slotId')
        .optional()
        .isUUID()
        .withMessage('Slot ID must be a valid UUID'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
        .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
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
// Get visitor slot by ID validation
exports.validateGetVisitorSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Delete visitor slot validation
exports.validateDeleteVisitorSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Get visitor slots by visitor ID validation
exports.validateGetVisitorSlotsByVisitor = [
    ...(0, commonValidator_1.validateUUID)('visitorId'),
];
// Get visitor slots by slot ID validation
exports.validateGetVisitorSlotsBySlot = [
    ...(0, commonValidator_1.validateUUID)('slotId'),
];
// Check slot availability validation
exports.validateCheckSlotAvailability = [
    ...(0, commonValidator_1.validateUUID)('slotId'),
    (0, express_validator_1.body)('groupSize')
        .isInt({ min: 1, max: 50 })
        .withMessage('Group size must be between 1 and 50')
        .toInt(),
];
// Cancel visitor slot validation
exports.validateCancelVisitorSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
    (0, express_validator_1.body)('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Cancellation reason must not exceed 500 characters')
        .trim(),
];
// Confirm visitor slot validation
exports.validateConfirmVisitorSlot = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Get visitor slot statistics validation
exports.validateVisitorSlotStats = [
// No specific validation needed for basic stats request
];
//# sourceMappingURL=visitorSlotValidator.js.map