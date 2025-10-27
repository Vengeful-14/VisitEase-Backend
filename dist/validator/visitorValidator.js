"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVisitorStats = exports.validateDeleteVisitor = exports.validateUpdateVisitor = exports.validateCreateVisitor = exports.validateGetVisitors = void 0;
const express_validator_1 = require("express-validator");
const commonValidator_1 = require("./commonValidator");
// Get visitors validation
exports.validateGetVisitors = [
    (0, express_validator_1.query)('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['individual', 'family', 'group', 'educational', 'corporate', 'senior'])
        .withMessage('Type must be one of: individual, family, group, educational, corporate, senior'),
    (0, express_validator_1.query)('ageGroup')
        .optional()
        .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
        .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
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
// Create visitor validation
exports.validateCreateVisitor = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone must be a valid phone number'),
    (0, express_validator_1.body)('organization')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Organization must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('specialRequirements')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special requirements must not exceed 1000 characters')
        .trim(),
    (0, express_validator_1.body)('ageGroup')
        .optional()
        .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
        .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
    (0, express_validator_1.body)('addressLine1')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address line 1 must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('addressLine2')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address line 2 must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('city')
        .optional()
        .isLength({ max: 100 })
        .withMessage('City must not exceed 100 characters')
        .trim(),
    (0, express_validator_1.body)('state')
        .optional()
        .isLength({ max: 100 })
        .withMessage('State must not exceed 100 characters')
        .trim(),
    (0, express_validator_1.body)('postalCode')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Postal code must not exceed 20 characters')
        .trim(),
    (0, express_validator_1.body)('country')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Country must not exceed 100 characters')
        .trim(),
];
// Update visitor validation
exports.validateUpdateVisitor = [
    ...(0, commonValidator_1.validateUUID)('id'),
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone must be a valid phone number'),
    (0, express_validator_1.body)('organization')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Organization must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('specialRequirements')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special requirements must not exceed 1000 characters')
        .trim(),
    (0, express_validator_1.body)('ageGroup')
        .optional()
        .isIn(['child_0_12', 'teen_13_17', 'adult_18_34', 'adult_35_54', 'senior_55_plus'])
        .withMessage('Age group must be one of: child_0_12, teen_13_17, adult_18_34, adult_35_54, senior_55_plus'),
    (0, express_validator_1.body)('addressLine1')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address line 1 must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('addressLine2')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address line 2 must not exceed 200 characters')
        .trim(),
    (0, express_validator_1.body)('city')
        .optional()
        .isLength({ max: 100 })
        .withMessage('City must not exceed 100 characters')
        .trim(),
    (0, express_validator_1.body)('state')
        .optional()
        .isLength({ max: 100 })
        .withMessage('State must not exceed 100 characters')
        .trim(),
    (0, express_validator_1.body)('postalCode')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Postal code must not exceed 20 characters')
        .trim(),
    (0, express_validator_1.body)('country')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Country must not exceed 100 characters')
        .trim(),
];
// Delete visitor validation
exports.validateDeleteVisitor = [
    ...(0, commonValidator_1.validateUUID)('id'),
];
// Get visitor statistics validation
exports.validateVisitorStats = [
// No specific validation needed for basic stats request
];
//# sourceMappingURL=visitorValidator.js.map