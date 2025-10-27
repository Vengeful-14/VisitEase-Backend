"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingDateRange = exports.validateBulkBookingCreation = exports.validateBookingAvailabilityCheck = exports.validateBookingPayment = exports.validateBookingCancellation = exports.validateBookingConfirmation = exports.validateBookingSlotId = exports.validateBookingVisitorId = exports.validateBookingId = exports.validateBookingSearch = exports.validateBookingUpdate = exports.validateBookingCreation = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// Booking creation validation
exports.validateBookingCreation = [
    ...(0, commonValidator_1.validateUUID)('slotId'),
    ...(0, commonValidator_1.validateUUID)('visitorId'),
    (0, express_validator_1.body)('groupSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Group size must be between 1 and 50'),
    (0, express_validator_1.body)('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
        .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
        .trim(),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special requests must not exceed 500 characters')
        .trim(),
];
// Booking update validation
exports.validateBookingUpdate = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
        .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
    (0, express_validator_1.body)('groupSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Group size must be between 1 and 50'),
    (0, express_validator_1.body)('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    (0, express_validator_1.body)('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
        .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
        .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
        .trim(),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special requests must not exceed 500 characters')
        .trim(),
    (0, express_validator_1.body)('cancellationReason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Cancellation reason must not exceed 500 characters')
        .trim(),
];
// Booking search validation
exports.validateBookingSearch = [
    (0, express_validator_1.query)('slotId')
        .optional()
        .isUUID()
        .withMessage('Slot ID must be a valid UUID'),
    (0, express_validator_1.query)('visitorId')
        .optional()
        .isUUID()
        .withMessage('Visitor ID must be a valid UUID'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
        .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
    (0, express_validator_1.query)('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
        .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
    (0, express_validator_1.query)('paymentMethod')
        .optional()
        .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
        .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
    (0, express_validator_1.query)('createdBy')
        .optional()
        .isUUID()
        .withMessage('Created by must be a valid UUID'),
    (0, express_validator_1.query)('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be a valid ISO 8601 date')
        .custom((value, { req }) => {
        if (req.query && req.query.dateFrom && value) {
            const fromDate = new Date(req.query.dateFrom);
            const toDate = new Date(value);
            if (toDate < fromDate) {
                throw new Error('Date to must be after date from');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('groupSizeMin')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Minimum group size must be at least 1'),
    (0, express_validator_1.query)('groupSizeMax')
        .optional()
        .isInt({ max: 50 })
        .withMessage('Maximum group size must be at most 50')
        .custom((value, { req }) => {
        if (req.query && req.query.groupSizeMin && value) {
            const min = parseInt(req.query.groupSizeMin);
            const max = parseInt(value);
            if (max < min) {
                throw new Error('Maximum group size must be greater than or equal to minimum');
            }
        }
        return true;
    }),
    (0, express_validator_1.query)('totalAmountMin')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum total amount must be non-negative'),
    (0, express_validator_1.query)('totalAmountMax')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum total amount must be non-negative')
        .custom((value, { req }) => {
        if (req.query && req.query.totalAmountMin && value) {
            const min = parseFloat(req.query.totalAmountMin);
            const max = parseFloat(value);
            if (max < min) {
                throw new Error('Maximum total amount must be greater than or equal to minimum');
            }
        }
        return true;
    }),
];
// Booking ID validation
exports.validateBookingId = (0, commonValidator_1.validateUUID)('id');
// Visitor ID validation for getting bookings by visitor
exports.validateBookingVisitorId = (0, commonValidator_1.validateUUID)('visitorId');
// Slot ID validation for getting bookings by slot
exports.validateBookingSlotId = (0, commonValidator_1.validateUUID)('slotId');
// Booking confirmation validation
exports.validateBookingConfirmation = [
    (0, express_validator_1.body)('confirmedAt')
        .optional()
        .isISO8601()
        .withMessage('Confirmed at must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
        .trim(),
];
// Booking cancellation validation
exports.validateBookingCancellation = [
    (0, express_validator_1.body)('cancellationReason')
        .isLength({ min: 5, max: 500 })
        .withMessage('Cancellation reason must be between 5 and 500 characters')
        .trim(),
    (0, express_validator_1.body)('cancelledAt')
        .optional()
        .isISO8601()
        .withMessage('Cancelled at must be a valid ISO 8601 date'),
];
// Booking payment update validation
exports.validateBookingPayment = [
    (0, express_validator_1.body)('paymentStatus')
        .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
        .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
        .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
    (0, express_validator_1.body)('totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
];
// Slot availability check validation
exports.validateBookingAvailabilityCheck = [
    ...(0, commonValidator_1.validateUUID)('slotId'),
    (0, express_validator_1.param)('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date')
        .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            throw new Error('Date cannot be in the past');
        }
        return true;
    }),
];
// Bulk booking validation
exports.validateBulkBookingCreation = [
    (0, express_validator_1.body)('bookings')
        .isArray({ min: 1, max: 10 })
        .withMessage('Bookings must be an array with 1-10 items'),
    (0, express_validator_1.body)('bookings.*.slotId')
        .isUUID()
        .withMessage('Each booking must have a valid slot ID'),
    (0, express_validator_1.body)('bookings.*.visitorId')
        .isUUID()
        .withMessage('Each booking must have a valid visitor ID'),
    (0, express_validator_1.body)('bookings.*.groupSize')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Each booking must have 1-50 people'),
    (0, express_validator_1.body)('bookings.*.totalAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be non-negative'),
    (0, express_validator_1.body)('bookings.*.paymentMethod')
        .optional()
        .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
        .withMessage('Payment method must be valid'),
    (0, express_validator_1.body)('bookings.*.notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    (0, express_validator_1.body)('bookings.*.specialRequests')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special requests must not exceed 500 characters'),
];
// Date range validation for statistics
exports.validateBookingDateRange = [
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .custom((value, { req }) => {
        if (req.query && req.query.startDate && value) {
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(value);
            if (endDate < startDate) {
                throw new Error('End date must be after start date');
            }
            // Check if date range is not more than 1 year
            const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds
            if (endDate.getTime() - startDate.getTime() > oneYear) {
                throw new Error('Date range cannot exceed 1 year');
            }
        }
        return true;
    }),
];
//# sourceMappingURL=bookingValidator.js.map