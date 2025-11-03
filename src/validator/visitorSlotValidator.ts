import { body, query, param } from 'express-validator';
import { validateUUID } from './commonValidator';

// Visitor slot booking validation (for Booking model)
export const validateVisitorSlotBooking = [
  ...validateUUID('visitorId'),
  ...validateUUID('slotId'),
  body('groupSize')
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50')
    .toInt(),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number')
    .toFloat(),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'cash', 'online', 'check', 'free'])
    .withMessage('Payment method must be one of: credit_card, cash, online, check, free'),
  body('specialRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requests must not exceed 1000 characters')
    .trim(),
];

// Visitor slot update validation (for Booking model)
export const validateVisitorSlotUpdate = [
  body('groupSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50')
    .toInt(),
  body('status')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
  body('specialRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requests must not exceed 1000 characters')
    .trim(),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number')
    .toFloat(),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Payment status must be one of: pending, paid, refunded, failed'),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'cash', 'online', 'check', 'free'])
    .withMessage('Payment method must be one of: credit_card, cash, online, check, free'),
  body('cancellationReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters')
    .trim(),
];

// Visitor slot search validation
export const validateVisitorSlotSearch = [
  query('visitorId')
    .optional()
    .isUUID()
    .withMessage('Visitor ID must be a valid UUID'),
  query('slotId')
    .optional()
    .isUUID()
    .withMessage('Slot ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
];

// Get visitor slot by ID validation
export const validateGetVisitorSlot = [
  ...validateUUID('id'),
];

// Delete visitor slot validation
export const validateDeleteVisitorSlot = [
  ...validateUUID('id'),
];

// Get visitor slots by visitor ID validation
export const validateGetVisitorSlotsByVisitor = [
  ...validateUUID('visitorId'),
];

// Get visitor slots by slot ID validation
export const validateGetVisitorSlotsBySlot = [
  ...validateUUID('slotId'),
];

// Check slot availability validation
export const validateCheckSlotAvailability = [
  ...validateUUID('slotId'),
  body('groupSize')
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50')
    .toInt(),
];

// Cancel visitor slot validation
export const validateCancelVisitorSlot = [
  ...validateUUID('id'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters')
    .trim(),
];

// Confirm visitor slot validation
export const validateConfirmVisitorSlot = [
  ...validateUUID('id'),
];

// Get visitor slot statistics validation
export const validateVisitorSlotStats = [
  // No specific validation needed for basic stats request
];