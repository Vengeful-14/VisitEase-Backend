import { body, query, param } from 'express-validator';
import { validateUUID } from './commonValidator';

// Booking creation validation
export const validateBookingCreation = [
  ...validateUUID('slotId'),
  ...validateUUID('visitorId'),
  body('groupSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
    .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
    .trim(),
];

// Booking update validation
export const validateBookingUpdate = [
  body('status')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
  body('groupSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
    .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
    .trim(),
  body('cancellationReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters')
    .trim(),
];

// Booking search validation
export const validateBookingSearch = [
  query('slotId')
    .optional()
    .isUUID()
    .withMessage('Slot ID must be a valid UUID'),
  query('visitorId')
    .optional()
    .isUUID()
    .withMessage('Visitor ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Status must be one of: tentative, confirmed, cancelled, completed, no_show'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
  query('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
    .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
  query('createdBy')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && req.query.dateFrom && value) {
        const fromDate = new Date(req.query.dateFrom as string);
        const toDate = new Date(value);
        
        if (toDate < fromDate) {
          throw new Error('Date to must be after date from');
        }
      }
      return true;
    }),
  query('groupSizeMin')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum group size must be at least 1'),
  query('groupSizeMax')
    .optional()
    .isInt({ max: 50 })
    .withMessage('Maximum group size must be at most 50')
    .custom((value, { req }) => {
      if (req.query && req.query.groupSizeMin && value) {
        const min = parseInt(req.query.groupSizeMin as string);
        const max = parseInt(value);
        
        if (max < min) {
          throw new Error('Maximum group size must be greater than or equal to minimum');
        }
      }
      return true;
    }),
  query('totalAmountMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum total amount must be non-negative'),
  query('totalAmountMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum total amount must be non-negative')
    .custom((value, { req }) => {
      if (req.query && req.query.totalAmountMin && value) {
        const min = parseFloat(req.query.totalAmountMin as string);
        const max = parseFloat(value);
        
        if (max < min) {
          throw new Error('Maximum total amount must be greater than or equal to minimum');
        }
      }
      return true;
    }),
];

// Booking ID validation
export const validateBookingId = validateUUID('id');

// Visitor ID validation for getting bookings by visitor
export const validateBookingVisitorId = validateUUID('visitorId');

// Slot ID validation for getting bookings by slot
export const validateBookingSlotId = validateUUID('slotId');

// Booking confirmation validation
export const validateBookingConfirmation = [
  body('confirmedAt')
    .optional()
    .isISO8601()
    .withMessage('Confirmed at must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),
];

// Booking cancellation validation
export const validateBookingCancellation = [
  body('cancellationReason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason must be between 5 and 500 characters')
    .trim(),
  body('cancelledAt')
    .optional()
    .isISO8601()
    .withMessage('Cancelled at must be a valid ISO 8601 date'),
];

// Booking payment update validation
export const validateBookingPayment = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partial'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded, partial'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
    .withMessage('Payment method must be one of: cash, credit_card, debit_card, bank_transfer, online_payment, check'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
];

// Slot availability check validation
export const validateBookingAvailabilityCheck = [
  ...validateUUID('slotId'),
  param('date')
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
export const validateBulkBookingCreation = [
  body('bookings')
    .isArray({ min: 1, max: 10 })
    .withMessage('Bookings must be an array with 1-10 items'),
  body('bookings.*.slotId')
    .isUUID()
    .withMessage('Each booking must have a valid slot ID'),
  body('bookings.*.visitorId')
    .isUUID()
    .withMessage('Each booking must have a valid visitor ID'),
  body('bookings.*.groupSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Each booking must have 1-50 people'),
  body('bookings.*.totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be non-negative'),
  body('bookings.*.paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment', 'check'])
    .withMessage('Payment method must be valid'),
  body('bookings.*.notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('bookings.*.specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
];

// Date range validation for statistics
export const validateBookingDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && req.query.startDate && value) {
        const startDate = new Date(req.query.startDate as string);
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
