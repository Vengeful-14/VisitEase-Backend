# API Testing Guide - VisitEase Backend

This guide provides a comprehensive flow for testing all APIs with proper data seeding to avoid conflicts and ensure proper relationships between entities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Data Seeding Flow](#data-seeding-flow)
3. [API Testing Sequence](#api-testing-sequence)
4. [Sample Data Sets](#sample-data-sets)
5. [Testing Scenarios](#testing-scenarios)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Backend server running on `http://localhost:3000`
- Database properly migrated and reset
- REST Client extension (VS Code) or similar tool
- Valid JWT tokens for different user roles

## Data Seeding Flow

### Phase 1: User Registration and Authentication

#### 1.1 Register Admin User
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@visitease.com",
  "name": "John Admin",
  "password": "Password123",
  "phone": "+1234567890",
  "role": "admin"
}
```

#### 1.2 Register Staff User
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "staff@visitease.com",
  "name": "Sarah Staff",
  "password": "Password123",
  "phone": "+1234567891",
  "role": "staff"
}
```

#### 1.3 Register Visitor User
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "visitor@visitease.com",
  "name": "Mike Visitor",
  "password": "Password123",
  "phone": "+1234567892",
  "role": "visitor"
}
```

#### 1.4 Login and Get Tokens
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@visitease.com",
  "password": "Password123"
}
```

**Save the returned tokens:**
- `accessToken` - Use as `Bearer {accessToken}` in Authorization header
- `refreshToken` - Use for token refresh
- `sessionToken` - Use for logout

### Phase 2: Create Visit Slots (Schedule)

#### 2.1 Create Available Slots for Next Week
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Morning tour slot"
}
```

#### 2.2 Create Multiple Slots
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "duration": 60,
  "capacity": 15,
  "status": "available",
  "description": "Late morning tour slot"
}
```

```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 60,
  "capacity": 25,
  "status": "available",
  "description": "Afternoon tour slot"
}
```

#### 2.3 Create Slots for Different Days
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "date": "2024-01-16",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Tuesday morning slot"
}
```

### Phase 3: Create Visitors

#### 3.1 Create Individual Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567893",
  "organization": null,
  "specialRequirements": null,
  "ageGroup": "adult_18_34",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA"
}
```

#### 3.2 Create Family Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567894",
  "organization": null,
  "specialRequirements": "Wheelchair accessible",
  "ageGroup": "adult_35_54",
  "addressLine1": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postalCode": "90210",
  "country": "USA"
}
```

#### 3.3 Create Educational Group Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@university.edu",
  "phone": "+1234567895",
  "organization": "University of California",
  "specialRequirements": "Educational tour for 25 students",
  "ageGroup": "adult_35_54",
  "addressLine1": "789 University Blvd",
  "city": "Berkeley",
  "state": "CA",
  "postalCode": "94720",
  "country": "USA"
}
```

#### 3.4 Create Corporate Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "Mike Wilson",
  "email": "mike.wilson@company.com",
  "phone": "+1234567896",
  "organization": "Tech Corp Inc",
  "specialRequirements": "VIP tour for executives",
  "ageGroup": "adult_35_54",
  "addressLine1": "321 Business Park",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA"
}
```

### Phase 4: Create Bookings

#### 4.1 Create Individual Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-access-token}
Content-Type: application/json

{
  "visitorId": "{visitor-id-from-step-3.1}",
  "slotId": "{slot-id-from-step-2.1}",
  "groupSize": 1,
  "totalAmount": 25.00,
  "paymentMethod": "credit_card",
  "specialRequests": "Wheelchair accessible tour"
}
```

#### 4.2 Create Family Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-access-token}
Content-Type: application/json

{
  "visitorId": "{visitor-id-from-step-3.2}",
  "slotId": "{slot-id-from-step-2.2}",
  "groupSize": 4,
  "totalAmount": 100.00,
  "paymentMethod": "cash",
  "specialRequests": "Family with two children under 12"
}
```

#### 4.3 Create Educational Group Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-access-token}
Content-Type: application/json

{
  "visitorId": "{visitor-id-from-step-3.3}",
  "slotId": "{slot-id-from-step-2.3}",
  "groupSize": 25,
  "totalAmount": 500.00,
  "paymentMethod": "online",
  "specialRequests": "Educational tour for university students"
}
```

### Phase 5: Create Notification Templates

#### 5.1 Create Booking Confirmation Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "Booking Confirmation Template",
  "type": "booking_confirmation",
  "subject": "Booking Confirmed - {{museumName}}",
  "bodyTemplate": "Dear {{visitorName}}, your booking for {{visitDate}} at {{visitTime}} has been confirmed. Booking ID: {{bookingId}}",
  "variables": ["museumName", "visitorName", "visitDate", "visitTime", "bookingId"]
}
```

#### 5.2 Create Booking Reminder Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "name": "Booking Reminder Template",
  "type": "booking_reminder",
  "subject": "Reminder: Your Visit Tomorrow",
  "bodyTemplate": "Hi {{visitorName}}, this is a reminder that you have a visit scheduled for tomorrow at {{visitTime}}. Please arrive 15 minutes early.",
  "variables": ["visitorName", "visitTime"]
}
```

### Phase 6: Create Notifications

#### 6.1 Create Booking Confirmation Notification
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {staff-access-token}
Content-Type: application/json

{
  "type": "booking_confirmation",
  "title": "Booking Confirmation",
  "message": "Your booking has been confirmed for tomorrow at 2:00 PM",
  "recipient": "john.doe@example.com",
  "scheduledFor": "2024-01-15T10:00:00Z",
  "deliveryMethod": "email",
  "templateId": "{template-id-from-step-5.1}",
  "metadata": {
    "bookingId": "{booking-id-from-step-4.1}",
    "slotId": "{slot-id-from-step-2.1}"
  }
}
```

## API Testing Sequence

### 1. Authentication Flow Testing

#### Test User Registration
1. Register users with different roles
2. Test validation errors (invalid email, weak password, etc.)
3. Test duplicate email registration

#### Test User Login
1. Login with valid credentials
2. Test invalid credentials
3. Test missing fields

#### Test Token Management
1. Use access token for protected endpoints
2. Test token refresh
3. Test logout functionality

### 2. Dashboard API Testing

#### Test Dashboard Statistics
1. Get dashboard stats with admin token
2. Get dashboard stats with staff token
3. Test without authentication (should fail)

#### Test Upcoming Visits
1. Get upcoming visits with default limit
2. Get upcoming visits with custom limit
3. Test invalid limit values

#### Test Recent Activity
1. Get recent activity with default limit
2. Get recent activity with custom limit
3. Test invalid limit values

#### Test Revenue Trend
1. Get revenue trend for 7 days (default)
2. Get revenue trend for 30 days
3. Get revenue trend for 90 days
4. Test invalid days values

### 3. Schedule API Testing

#### Test Schedule Slot Management
1. Create schedule slots with valid data
2. Create schedule slots with invalid data (past dates, invalid times)
3. Get schedule slots with filters
4. Update schedule slots
5. Delete schedule slots

#### Test Schedule Statistics
1. Get schedule statistics
2. Get schedule issues

### 4. Visitor API Testing

#### Test Visitor Management
1. Create visitors with different types
2. Create visitors with invalid data
3. Get visitors with search and filters
4. Update visitor information
5. Delete visitors

#### Test Visitor Statistics
1. Get visitor statistics

### 5. Booking API Testing

#### Test Booking Creation
1. Create bookings for different visitor types
2. Create bookings with invalid data
3. Test capacity validation
4. Test slot availability

#### Test Booking Management
1. Confirm bookings
2. Cancel bookings
3. Get bookings by visitor
4. Get bookings by slot
5. Get all bookings with filters

### 6. Notification API Testing

#### Test Notification Creation
1. Create notifications with different types
2. Create notifications with invalid data
3. Send notifications
4. Get notifications with filters

#### Test Notification Templates
1. Create notification templates
2. Update notification templates
3. Delete notification templates

## Sample Data Sets

### Complete Test Data Set

```json
{
  "users": [
    {
      "email": "admin@visitease.com",
      "name": "John Admin",
      "role": "admin"
    },
    {
      "email": "staff@visitease.com",
      "name": "Sarah Staff",
      "role": "staff"
    },
    {
      "email": "visitor@visitease.com",
      "name": "Mike Visitor",
      "role": "visitor"
    }
  ],
  "slots": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "description": "Morning tour slot"
    },
    {
      "date": "2024-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "capacity": 15,
      "description": "Late morning tour slot"
    },
    {
      "date": "2024-01-15",
      "startTime": "14:00",
      "endTime": "15:00",
      "capacity": 25,
      "description": "Afternoon tour slot"
    }
  ],
  "visitors": [
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "type": "individual",
      "ageGroup": "adult_18_34"
    },
    {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "type": "family",
      "ageGroup": "adult_35_54"
    },
    {
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@university.edu",
      "type": "educational",
      "ageGroup": "adult_35_54"
    }
  ],
  "bookings": [
    {
      "visitorId": "visitor-1",
      "slotId": "slot-1",
      "groupSize": 1,
      "totalAmount": 25.00,
      "paymentMethod": "credit_card"
    },
    {
      "visitorId": "visitor-2",
      "slotId": "slot-2",
      "groupSize": 4,
      "totalAmount": 100.00,
      "paymentMethod": "cash"
    },
    {
      "visitorId": "visitor-3",
      "slotId": "slot-3",
      "groupSize": 25,
      "totalAmount": 500.00,
      "paymentMethod": "online"
    }
  ]
}
```

## Testing Scenarios

### Scenario 1: Complete Booking Flow
1. Register visitor user
2. Login visitor user
3. Create visitor profile
4. Create available slot (staff)
5. Create booking (visitor)
6. Confirm booking (staff)
7. Create confirmation notification (staff)
8. Send notification (staff)

### Scenario 2: Capacity Management
1. Create slot with capacity 10
2. Create 5 individual bookings (5 people)
3. Create family booking with 6 people (should fail)
4. Create family booking with 5 people (should succeed)
5. Try to create another booking (should fail - at capacity)

### Scenario 3: Schedule Conflict Detection
1. Create overlapping time slots
2. Test conflict detection
3. Resolve conflicts
4. Verify schedule integrity

### Scenario 4: Notification Workflow
1. Create notification templates
2. Create bookings
3. Auto-generate confirmation notifications
4. Send reminder notifications
5. Send cancellation notifications

### Scenario 5: Role-Based Access Control
1. Test admin access to all endpoints
2. Test staff access to management endpoints
3. Test visitor access restrictions
4. Test unauthorized access attempts

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Issue**: 401 Unauthorized
- **Solution**: Check if token is valid and not expired
- **Fix**: Re-login and get new token

#### 2. Validation Errors
- **Issue**: 400 Bad Request with validation errors
- **Solution**: Check request body format and required fields
- **Fix**: Ensure all required fields are provided with correct format

#### 3. Permission Errors
- **Issue**: 403 Forbidden
- **Solution**: Check user role and endpoint permissions
- **Fix**: Use appropriate role token (admin/staff for management endpoints)

#### 4. Not Found Errors
- **Issue**: 404 Not Found
- **Solution**: Check if resource exists and ID is correct
- **Fix**: Verify resource was created successfully and use correct ID

#### 5. Conflict Errors
- **Issue**: 409 Conflict
- **Solution**: Check for duplicate data or business rule violations
- **Fix**: Use unique data or resolve conflicts

### Data Cleanup

To reset the database for fresh testing:

```bash
# Reset database and migrations
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

### Token Management

Store tokens in environment variables or a secure location:

```bash
# Example environment variables
ADMIN_TOKEN=your-admin-token-here
STAFF_TOKEN=your-staff-token-here
VISITOR_TOKEN=your-visitor-token-here
```

### Testing Checklist

- [ ] All user roles can register and login
- [ ] Admin can access all endpoints
- [ ] Staff can access management endpoints
- [ ] Visitors can only access booking endpoints
- [ ] All CRUD operations work correctly
- [ ] Validation works for all endpoints
- [ ] Rate limiting is enforced
- [ ] Error handling is consistent
- [ ] Data relationships are maintained
- [ ] Business rules are enforced

## File Structure

```
rest/
├── README.md                 # This file
├── auth.http                 # Authentication API tests
├── dashboard.http            # Dashboard API tests
├── schedule.http             # Schedule API tests
├── visitor.http              # Visitor API tests
├── booking.http              # Booking API tests
├── notification.http         # Notification API tests
├── visitor-slot.http         # Visitor slot API tests (legacy)
└── createuser.http           # User creation tests (legacy)
```

## Best Practices

1. **Always use proper authentication tokens**
2. **Test both success and error scenarios**
3. **Use realistic test data**
4. **Clean up test data after testing**
5. **Test rate limiting and security measures**
6. **Verify data relationships and constraints**
7. **Test with different user roles**
8. **Use proper HTTP status codes**
9. **Include comprehensive error messages**
10. **Document any issues or bugs found**

This guide ensures comprehensive testing of all APIs with proper data seeding and conflict avoidance.
