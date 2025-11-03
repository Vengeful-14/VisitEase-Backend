# API Validation Middleware

This document explains how to use the validation middleware in your Express.js routes.

## Overview

The validation system uses `express-validator` to provide comprehensive input validation for all API endpoints. Each validator is structured as an array of validation rules that can be used as middleware in Express routes.

## Basic Usage

### 1. Import the validators and middleware

```typescript
import { Router } from 'express';
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
  sanitizeInput,
  rateLimit
} from '../validator';
import { authenticateToken } from '../auth';
```

### 2. Use validators in routes

```typescript
const router = Router();

// Basic validation
router.post('/register', 
  validateUserRegistration, 
  handleValidationErrors, 
  registerUser
);

// With additional middleware
router.post('/login',
  sanitizeInput,
  rateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  validateUserLogin,
  handleValidationErrors,
  loginUser
);

// With authentication
router.put('/profile/:id',
  authenticateToken,
  ...validateUUID('id'),
  validateUserUpdate,
  handleValidationErrors,
  updateUser
);
```

## Available Validators

### Dashboard Validators
- `validateDashboardStats` - Dashboard statistics validation
- `validateUpcomingVisits` - Upcoming visits with limit validation
- `validateRecentActivity` - Recent activity with limit validation
- `validateRevenueTrend` - Revenue trend with days validation

### Schedule Validators
- `validateGetSlots` - Get slots with filters and pagination
- `validateGetSlot` - Get slot by ID
- `validateCreateSlot` - Create slot with comprehensive validation
- `validateUpdateSlot` - Update slot with optional fields
- `validateDeleteSlot` - Delete slot validation
- `validateScheduleStats` - Schedule statistics validation
- `validateScheduleIssues` - Schedule issues validation

### Visitor Validators
- `validateGetVisitors` - Get visitors with search and filters
- `validateCreateVisitor` - Create visitor with comprehensive validation
- `validateUpdateVisitor` - Update visitor with optional fields
- `validateDeleteVisitor` - Delete visitor validation
- `validateVisitorStats` - Visitor statistics validation

### Notification Validators
- `validateCreateNotification` - Create notification validation
- `validateSendNotification` - Send notification validation
- `validateGetNotifications` - Get notifications with filters
- `validateCreateNotificationTemplate` - Create template validation
- `validateUpdateNotificationTemplate` - Update template validation
- `validateDeleteNotificationTemplate` - Delete template validation

### Visitor Slot Validators
- `validateVisitorSlotBooking` - Book visitor slot validation
- `validateVisitorSlotUpdate` - Update visitor slot validation
- `validateVisitorSlotSearch` - Search visitor slots validation
- `validateGetVisitorSlot` - Get visitor slot by ID
- `validateDeleteVisitorSlot` - Delete visitor slot validation
- `validateGetVisitorSlotsByVisitor` - Get slots by visitor ID
- `validateGetVisitorSlotsBySlot` - Get slots by slot ID
- `validateCheckSlotAvailability` - Check slot availability
- `validateCancelVisitorSlot` - Cancel visitor slot validation
- `validateConfirmVisitorSlot` - Confirm visitor slot validation
- `validateVisitorSlotStats` - Visitor slot statistics validation

## Middleware Functions

### Core Validation Middleware
- `handleValidationErrors` - Handles validation errors and returns formatted response
- `sanitizeInput` - Sanitizes input data (trims strings)
- `checkRequiredFields` - Checks for required fields in request body

### Security Middleware
- `rateLimit` - Rate limiting middleware
- `validateRequestSize` - Validates request size
- `validateContentType` - Validates content type
- `validateApiVersion` - Validates API version
- `validateMethod` - Validates HTTP method
- `validateHeaders` - Validates required headers

## Example Route Implementations

### 1. Simple CRUD Route

```typescript
// GET /api/v1/visitors
router.get('/',
  authenticateToken,
  requireStaffOrAdmin,
  validateGetVisitors,
  handleValidationErrors,
  getVisitors
);

// POST /api/v1/visitors
router.post('/',
  authenticateToken,
  requireStaffOrAdmin,
  sanitizeInput,
  validateCreateVisitor,
  handleValidationErrors,
  createVisitor
);

// PUT /api/v1/visitors/:id
router.put('/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateUUID('id'),
  sanitizeInput,
  validateUpdateVisitor,
  handleValidationErrors,
  updateVisitor
);

// DELETE /api/v1/visitors/:id
router.delete('/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateUUID('id'),
  handleValidationErrors,
  deleteVisitor
);
```

### 2. Complex Route with Multiple Middleware

```typescript
// POST /api/v1/notifications
router.post('/',
  authenticateToken,
  requireStaffOrAdmin,
  rateLimit(10, 60 * 1000), // 10 requests per minute
  validateRequestSize(1024 * 1024), // 1MB max
  validateContentType(['application/json']),
  sanitizeInput,
  validateCreateNotification,
  handleValidationErrors,
  createNotification
);
```

### 3. Public Route with Rate Limiting

```typescript
// POST /api/v1/visitor-slots/book
router.post('/book',
  rateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  sanitizeInput,
  validateVisitorSlotBooking,
  handleValidationErrors,
  bookVisitorSlot
);
```

## Error Response Format

When validation fails, the middleware returns a standardized error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long",
      "value": "123"
    }
  ]
}
```

## Best Practices

1. **Always use `handleValidationErrors`** after validation middleware
2. **Use `sanitizeInput`** before validation to clean data
3. **Apply rate limiting** to public endpoints
4. **Use authentication middleware** for protected routes
5. **Validate request size** for endpoints that accept large payloads
6. **Use appropriate HTTP status codes** (400 for validation errors, 401 for auth, etc.)

## Custom Validation Rules

You can create custom validation rules by extending the existing validators:

```typescript
import { body } from 'express-validator';

export const validateCustomField = [
  body('customField')
    .custom((value) => {
      // Custom validation logic
      if (value === 'forbidden') {
        throw new Error('This value is not allowed');
      }
      return true;
    })
];
```

## Testing Validators

You can test validators using the validation middleware:

```typescript
import request from 'supertest';
import { app } from '../app';

describe('Visitor Validation', () => {
  it('should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/visitors')
      .send({
        name: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toHaveLength(1);
  });
});
```
