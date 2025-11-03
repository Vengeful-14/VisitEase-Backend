# API Testing Quick Reference

## Environment Variables Setup

Create a `.env` file in the rest folder with your tokens:

```bash
# Replace with actual tokens from login responses
adminToken=your-admin-access-token-here
staffToken=your-staff-access-token-here
visitorToken=your-visitor-access-token-here

# Replace with actual IDs from creation responses
visitor1Id=visitor-id-from-step-3.1
visitor2Id=visitor-id-from-step-3.2
visitor3Id=visitor-id-from-step-3.3
visitor4Id=visitor-id-from-step-3.4
visitor5Id=visitor-id-from-step-3.5
visitor6Id=visitor-id-from-step-3.6

slot1Id=slot-id-from-step-2.1
slot2Id=slot-id-from-step-2.2
slot3Id=slot-id-from-step-2.3
slot4Id=slot-id-from-step-2.4
slot5Id=slot-id-from-step-2.5
slot6Id=slot-id-from-step-2.6
slot7Id=slot-id-from-step-2.7
slot8Id=slot-id-from-step-2.8

booking1Id=booking-id-from-step-4.1
booking2Id=booking-id-from-step-4.2
booking3Id=booking-id-from-step-4.3
booking4Id=booking-id-from-step-4.4
booking5Id=booking-id-from-step-4.5
booking6Id=booking-id-from-step-4.6

template1Id=template-id-from-step-5.1
template2Id=template-id-from-step-5.2
template3Id=template-id-from-step-5.3
template4Id=template-id-from-step-5.4
template5Id=template-id-from-step-5.5
template6Id=template-id-from-step-5.6

notification1Id=notification-id-from-step-6.1
notification2Id=notification-id-from-step-6.2
notification3Id=notification-id-from-step-6.3
notification4Id=notification-id-from-step-6.4

adminSessionToken=admin-session-token-from-login
staffSessionToken=staff-session-token-from-login
visitorSessionToken=visitor-session-token-from-login
```

## Quick Testing Commands

### 1. Authentication Flow
```bash
# Register users
POST /api/v1/auth/register

# Login users
POST /api/v1/auth/login

# Logout users
POST /api/v1/auth/logout
```

### 2. Dashboard APIs
```bash
# Get dashboard stats
GET /api/v1/dashboard/stats

# Get upcoming visits
GET /api/v1/dashboard/upcoming-visits?limit=10

# Get recent activity
GET /api/v1/dashboard/recent-activity?limit=10

# Get revenue trend
GET /api/v1/dashboard/revenue-trend?days=30
```

### 3. Schedule APIs
```bash
# Create slot
POST /api/v1/schedule/slots

# Get slots
GET /api/v1/schedule/slots?date=2024-01-15

# Update slot
PUT /api/v1/schedule/slots/{id}

# Delete slot
DELETE /api/v1/schedule/slots/{id}

# Get statistics
GET /api/v1/schedule/statistics
```

### 4. Visitor APIs
```bash
# Create visitor
POST /api/v1/visitors

# Get visitors
GET /api/v1/visitors?search=John&type=individual

# Update visitor
PUT /api/v1/visitors/{id}

# Delete visitor
DELETE /api/v1/visitors/{id}

# Get statistics
GET /api/v1/visitors/stats
```

### 5. Booking APIs
```bash
# Create booking
POST /api/v1/bookings

# Confirm booking
PUT /api/v1/bookings/{id}/confirm

# Cancel booking
PUT /api/v1/bookings/{id}/cancel

# Get bookings
GET /api/v1/bookings?status=confirmed

# Get booking by visitor
GET /api/v1/bookings/visitor/{visitorId}

# Get booking by slot
GET /api/v1/bookings/slot/{slotId}
```

### 6. Notification APIs
```bash
# Create notification
POST /api/v1/notifications

# Send notification
PUT /api/v1/notifications/{id}/send

# Get notifications
GET /api/v1/notifications?type=booking_confirmation

# Create template
POST /api/v1/notifications/templates

# Update template
PUT /api/v1/notifications/templates/{id}

# Delete template
DELETE /api/v1/notifications/templates/{id}
```

## Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Validation error or invalid data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (duplicate, constraint violation)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

## Testing Checklist

### Authentication
- [ ] Register users with different roles
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Use tokens for protected endpoints
- [ ] Test token refresh
- [ ] Test logout

### Authorization
- [ ] Admin can access all endpoints
- [ ] Staff can access management endpoints
- [ ] Visitors can only access booking endpoints
- [ ] Unauthorized access is blocked

### Validation
- [ ] Required fields validation
- [ ] Data format validation
- [ ] Business rule validation
- [ ] Constraint validation

### CRUD Operations
- [ ] Create resources
- [ ] Read resources
- [ ] Update resources
- [ ] Delete resources
- [ ] List resources with filters

### Error Handling
- [ ] Proper error messages
- [ ] Correct HTTP status codes
- [ ] Validation error details
- [ ] Authentication error handling

### Performance
- [ ] Rate limiting works
- [ ] Pagination works
- [ ] Large data sets handled
- [ ] Response times acceptable

## Sample Test Data

### Valid Test Data
```json
{
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123",
    "phone": "+1234567890",
    "role": "visitor"
  },
  "slot": {
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "duration": 60,
    "capacity": 20,
    "status": "available",
    "description": "Test slot"
  },
  "visitor": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "ageGroup": "adult_18_34"
  },
  "booking": {
    "visitorId": "valid-visitor-id",
    "slotId": "valid-slot-id",
    "groupSize": 1,
    "totalAmount": 25.00,
    "paymentMethod": "credit_card"
  },
  "notification": {
    "type": "booking_confirmation",
    "title": "Booking Confirmed",
    "message": "Your booking has been confirmed",
    "recipient": "test@example.com",
    "deliveryMethod": "email"
  }
}
```

### Invalid Test Data
```json
{
  "user": {
    "email": "invalid-email",
    "name": "A",
    "password": "123",
    "role": "invalid_role"
  },
  "slot": {
    "date": "2020-01-01",
    "startTime": "25:00",
    "endTime": "24:00",
    "duration": 5,
    "capacity": 0
  },
  "visitor": {
    "name": "",
    "email": "not-an-email",
    "phone": "invalid-phone",
    "ageGroup": "invalid_age"
  },
  "booking": {
    "visitorId": "invalid-id",
    "slotId": "invalid-id",
    "groupSize": 0,
    "totalAmount": -10.00,
    "paymentMethod": "invalid_method"
  }
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is valid
   - Ensure token is in Authorization header
   - Try re-login to get new token

2. **403 Forbidden**
   - Check user role permissions
   - Use appropriate role token
   - Verify endpoint access rights

3. **400 Bad Request**
   - Check request body format
   - Verify required fields
   - Check data validation rules

4. **404 Not Found**
   - Verify resource exists
   - Check ID format (UUID)
   - Ensure proper endpoint URL

5. **409 Conflict**
   - Check for duplicate data
   - Verify business constraints
   - Resolve conflicts

### Debug Tips

1. **Check Response Headers**
   - Look for error details
   - Check rate limit headers
   - Verify content type

2. **Validate Request Format**
   - Ensure JSON is valid
   - Check field names and types
   - Verify required fields

3. **Test Incrementally**
   - Start with simple requests
   - Build up complexity
   - Test each endpoint separately

4. **Use Proper Tools**
   - REST Client extension
   - Postman
   - curl commands

5. **Monitor Server Logs**
   - Check for server errors
   - Look for validation messages
   - Monitor performance

## File Organization

```
rest/
├── README.md                 # Comprehensive testing guide
├── QUICK_REFERENCE.md        # This file
├── seed-data.http            # Complete data seeding script
├── auth.http                 # Authentication API tests
├── dashboard.http            # Dashboard API tests
├── schedule.http             # Schedule API tests
├── visitor.http              # Visitor API tests
├── booking.http              # Booking API tests
├── notification.http         # Notification API tests
├── visitor-slot.http         # Visitor slot API tests (legacy)
└── createuser.http           # User creation tests (legacy)
```

This quick reference provides essential information for efficient API testing and troubleshooting.
