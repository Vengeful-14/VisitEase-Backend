import { body, query, param } from 'express-validator';
import { validateUUID } from './commonValidator';

// Get visitors validation
export const validateGetVisitors = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('type')
    .optional()
    .isIn(['individual', 'family', 'group', 'educational', 'corporate', 'senior'])
    .withMessage('Type must be one of: individual, family, group, educational, corporate, senior'),
  query('ageGroup')
    .optional()
    .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
    .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
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

// Create visitor validation
export const validateCreateVisitor = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Phone must be a valid phone number'),
  body('organization')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Organization must not exceed 200 characters')
    .trim(),
  body('specialRequirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requirements must not exceed 1000 characters')
    .trim(),
  body('ageGroup')
    .optional()
    .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
    .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
  body('addressLine1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 1 must not exceed 200 characters')
    .trim(),
  body('addressLine2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must not exceed 200 characters')
    .trim(),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters')
    .trim(),
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters')
    .trim(),
  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters')
    .trim(),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters')
    .trim(),
];

// Update visitor validation
export const validateUpdateVisitor = [
  ...validateUUID('id'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Phone must be a valid phone number'),
  body('organization')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Organization must not exceed 200 characters')
    .trim(),
  body('specialRequirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requirements must not exceed 1000 characters')
    .trim(),
  body('ageGroup')
    .optional()
    .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
    .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
  body('addressLine1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 1 must not exceed 200 characters')
    .trim(),
  body('addressLine2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must not exceed 200 characters')
    .trim(),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters')
    .trim(),
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters')
    .trim(),
  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters')
    .trim(),
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters')
    .trim(),
];

// Delete visitor validation
export const validateDeleteVisitor = [
  ...validateUUID('id'),
];

// Get visitor statistics validation
export const validateVisitorStats = [
  // No specific validation needed for basic stats request
];