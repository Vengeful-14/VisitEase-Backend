import { body, query, param } from 'express-validator';
import { validateUUID } from './commonValidator';

// Get slots validation
export const validateGetSlots = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('status')
    .optional()
    .isIn(['available', 'booked', 'cancelled', 'maintenance'])
    .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
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

// Get slot by ID validation
export const validateGetSlot = [
  ...validateUUID('id'),
];

// Create slot validation
export const validateCreateSlot = [
  body('date')
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
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      const startTime = req.body.startTime;
      if (startTime && value <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes')
    .toInt(),
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000')
    .toInt(),
  body('status')
    .optional()
    .isIn(['available', 'booked', 'cancelled', 'maintenance'])
    .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
];

// Update slot validation
export const validateUpdateSlot = [
  ...validateUUID('id'),
  body('date')
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
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('Start time must be in HH:MM or HH:MM:SS format'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('End time must be in HH:MM or HH:MM:SS format'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes')
    .toInt(),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000')
    .toInt(),
  body('status')
    .optional()
    .isIn(['available', 'booked', 'cancelled', 'maintenance'])
    .withMessage('Status must be one of: available, booked, cancelled, maintenance'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
];

// Delete slot validation
export const validateDeleteSlot = [
  ...validateUUID('id'),
];

// Get schedule statistics validation
export const validateScheduleStats = [
  // No specific validation needed for basic stats request
];

// Get schedule issues validation
export const validateScheduleIssues = [
  // No specific validation needed for basic issues request
];
