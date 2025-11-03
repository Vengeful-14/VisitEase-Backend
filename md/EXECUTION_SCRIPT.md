# Database Seeding Execution Script

This script provides a practical step-by-step guide to execute the database seeding flow without conflicts.

## Quick Start

### Step 1: Reset Database
```bash
# In your terminal, run:
npx prisma migrate reset --force
npx prisma generate
npm run dev
```

### Step 2: Execute Seeding Phases

Copy and paste the following requests in order using your REST Client (VS Code REST Client extension):

## Phase 1: User Registration

### 1.1 Register Admin User
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

### 1.2 Register Staff User
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

### 1.3 Register Visitor User
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

### 1.4 Login Admin User
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@visitease.com",
  "password": "Password123"
}
```

**Save the `accessToken` from response as `adminToken`**

### 1.5 Login Staff User
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "staff@visitease.com",
  "password": "Password123"
}
```

**Save the `accessToken` from response as `staffToken`**

### 1.6 Login Visitor User
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "visitor@visitease.com",
  "password": "Password123"
}
```

**Save the `accessToken` from response as `visitorToken`**

## Phase 2: Create Visit Slots

### 2.1 Monday Morning Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Monday morning tour slot"
}
```

**Save the `id` from response as `slot1Id`**

### 2.2 Monday Late Morning Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "duration": 60,
  "capacity": 15,
  "status": "available",
  "description": "Monday late morning tour slot"
}
```

**Save the `id` from response as `slot2Id`**

### 2.3 Monday Afternoon Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 60,
  "capacity": 25,
  "status": "available",
  "description": "Monday afternoon tour slot"
}
```

**Save the `id` from response as `slot3Id`**

### 2.4 Tuesday Morning Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-16",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Tuesday morning tour slot"
}
```

**Save the `id` from response as `slot4Id`**

### 2.5 Tuesday Afternoon Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-16",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 60,
  "capacity": 25,
  "status": "available",
  "description": "Tuesday afternoon tour slot"
}
```

**Save the `id` from response as `slot5Id`**

### 2.6 Wednesday Morning Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-17",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Wednesday morning tour slot"
}
```

**Save the `id` from response as `slot6Id`**

### 2.7 Wednesday Afternoon Slot
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "date": "2024-01-17",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 60,
  "capacity": 25,
  "status": "available",
  "description": "Wednesday afternoon tour slot"
}
```

**Save the `id` from response as `slot7Id`**

## Phase 3: Create Visitors

### 3.1 Individual Visitor 1
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
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

**Save the `id` from response as `visitor1Id`**

### 3.2 Individual Visitor 2
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
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

**Save the `id` from response as `visitor2Id`**

### 3.3 Family Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Robert Johnson",
  "email": "robert.johnson@example.com",
  "phone": "+1234567895",
  "organization": null,
  "specialRequirements": "Family with children under 12",
  "ageGroup": "adult_35_54",
  "addressLine1": "789 Pine St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "country": "USA"
}
```

**Save the `id` from response as `visitor3Id`**

### 3.4 Educational Group Leader
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Dr. Sarah Wilson",
  "email": "sarah.wilson@university.edu",
  "phone": "+1234567896",
  "organization": "University of California",
  "specialRequirements": "Educational tour for 25 students",
  "ageGroup": "adult_35_54",
  "addressLine1": "321 University Blvd",
  "city": "Berkeley",
  "state": "CA",
  "postalCode": "94720",
  "country": "USA"
}
```

**Save the `id` from response as `visitor4Id`**

### 3.5 Corporate Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Mike Davis",
  "email": "mike.davis@company.com",
  "phone": "+1234567897",
  "organization": "Tech Corp Inc",
  "specialRequirements": "VIP tour for executives",
  "ageGroup": "adult_35_54",
  "addressLine1": "654 Business Park",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA"
}
```

**Save the `id` from response as `visitor5Id`**

### 3.6 Senior Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Margaret Brown",
  "email": "margaret.brown@example.com",
  "phone": "+1234567898",
  "organization": null,
  "specialRequirements": "Senior citizen discount",
  "ageGroup": "senior_55_plus",
  "addressLine1": "987 Elm St",
  "city": "Portland",
  "state": "OR",
  "postalCode": "97201",
  "country": "USA"
}
```

**Save the `id` from response as `visitor6Id`**

### 3.7 Teen Visitor
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Emily Taylor",
  "email": "emily.taylor@example.com",
  "phone": "+1234567899",
  "organization": null,
  "specialRequirements": "Student ID required",
  "ageGroup": "teen_13_17",
  "addressLine1": "147 Maple Ave",
  "city": "Denver",
  "state": "CO",
  "postalCode": "80201",
  "country": "USA"
}
```

**Save the `id` from response as `visitor7Id`**

## Phase 4: Create Bookings

### 4.1 Individual Booking 1
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor1Id}}",
  "slotId": "{{slot1Id}}",
  "groupSize": 1,
  "totalAmount": 25.00,
  "paymentMethod": "credit_card",
  "specialRequests": "Wheelchair accessible tour"
}
```

**Save the `id` from response as `booking1Id`**

### 4.2 Individual Booking 2
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor2Id}}",
  "slotId": "{{slot2Id}}",
  "groupSize": 1,
  "totalAmount": 25.00,
  "paymentMethod": "cash",
  "specialRequests": "Photography allowed"
}
```

**Save the `id` from response as `booking2Id`**

### 4.3 Family Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor3Id}}",
  "slotId": "{{slot3Id}}",
  "groupSize": 4,
  "totalAmount": 100.00,
  "paymentMethod": "online",
  "specialRequests": "Family with two children under 12"
}
```

**Save the `id` from response as `booking3Id`**

### 4.4 Educational Group Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor4Id}}",
  "slotId": "{{slot4Id}}",
  "groupSize": 25,
  "totalAmount": 500.00,
  "paymentMethod": "online",
  "specialRequests": "Educational tour for university students"
}
```

**Save the `id` from response as `booking4Id`**

### 4.5 Corporate Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor5Id}}",
  "slotId": "{{slot5Id}}",
  "groupSize": 8,
  "totalAmount": 200.00,
  "paymentMethod": "credit_card",
  "specialRequests": "VIP tour for executives"
}
```

**Save the `id` from response as `booking5Id`**

### 4.6 Senior Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor6Id}}",
  "slotId": "{{slot6Id}}",
  "groupSize": 2,
  "totalAmount": 40.00,
  "paymentMethod": "cash",
  "specialRequests": "Senior citizen discount"
}
```

**Save the `id` from response as `booking6Id`**

### 4.7 Teen Booking
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {{visitorToken}}
Content-Type: application/json

{
  "visitorId": "{{visitor7Id}}",
  "slotId": "{{slot7Id}}",
  "groupSize": 1,
  "totalAmount": 15.00,
  "paymentMethod": "online",
  "specialRequests": "Student ID required"
}
```

**Save the `id` from response as `booking7Id`**

## Phase 5: Create Notification Templates

### 5.1 Booking Confirmation Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Booking Confirmation Template",
  "type": "booking_confirmation",
  "subject": "Booking Confirmed - VisitEase Museum",
  "bodyTemplate": "Dear [VISITOR_NAME], your booking for [VISIT_DATE] at [VISIT_TIME] has been confirmed. Booking ID: [BOOKING_ID]. Please arrive 15 minutes early.",
  "variables": ["VISITOR_NAME", "VISIT_DATE", "VISIT_TIME", "BOOKING_ID"]
}
```

**Save the `id` from response as `template1Id`**

### 5.2 Booking Reminder Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "name": "Booking Reminder Template",
  "type": "booking_reminder",
  "subject": "Reminder: Your Visit Tomorrow",
  "bodyTemplate": "Hi [VISITOR_NAME], this is a reminder that you have a visit scheduled for tomorrow at [VISIT_TIME]. Please arrive 15 minutes early. If you need to cancel, please contact us at least 24 hours in advance.",
  "variables": ["VISITOR_NAME", "VISIT_TIME"]
}
```

**Save the `id` from response as `template2Id`**

## Phase 6: Create Notifications

### 6.1 Booking Confirmation Notification
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "type": "booking_confirmation",
  "title": "Booking Confirmation",
  "message": "Your booking has been confirmed for tomorrow at 9:00 AM",
  "recipient": "john.doe@example.com",
  "scheduledFor": "2024-01-15T10:00:00Z",
  "deliveryMethod": "email",
  "templateId": "{{template1Id}}",
  "metadata": {
    "bookingId": "{{booking1Id}}",
    "slotId": "{{slot1Id}}",
    "visitorName": "John Doe",
    "visitDate": "2024-01-15",
    "visitTime": "09:00"
  }
}
```

**Save the `id` from response as `notification1Id`**

### 6.2 Booking Reminder Notification
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{
  "type": "booking_reminder",
  "title": "Booking Reminder",
  "message": "Don't forget your visit tomorrow at 10:00 AM",
  "recipient": "+1234567894",
  "scheduledFor": "2024-01-15T08:00:00Z",
  "deliveryMethod": "sms",
  "templateId": "{{template2Id}}",
  "metadata": {
    "bookingId": "{{booking2Id}}",
    "visitorName": "Jane Smith",
    "visitTime": "10:00"
  }
}
```

**Save the `id` from response as `notification2Id`**

## Phase 7: Confirm Bookings

### 7.1 Confirm All Bookings
```http
PUT http://localhost:3000/api/v1/bookings/{{booking1Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking2Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking3Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking4Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking5Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking6Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{{booking7Id}}/confirm
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

## Phase 8: Send Notifications

### 8.1 Send All Notifications
```http
PUT http://localhost:3000/api/v1/notifications/{{notification1Id}}/send
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/notifications/{{notification2Id}}/send
Authorization: Bearer {{staffToken}}
Content-Type: application/json

{}
```

## Phase 9: Verify Data

### 9.1 Get Dashboard Statistics
```http
GET http://localhost:3000/api/v1/dashboard/stats
Authorization: Bearer {{adminToken}}
```

### 9.2 Get Schedule Statistics
```http
GET http://localhost:3000/api/v1/schedule/statistics
Authorization: Bearer {{staffToken}}
```

### 9.3 Get Visitor Statistics
```http
GET http://localhost:3000/api/v1/visitors/stats
Authorization: Bearer {{staffToken}}
```

### 9.4 Get All Bookings
```http
GET http://localhost:3000/api/v1/bookings
Authorization: Bearer {{staffToken}}
```

### 9.5 Get All Notifications
```http
GET http://localhost:3000/api/v1/notifications
Authorization: Bearer {{staffToken}}
```

## Success Verification

After completing all phases, you should have:

- ✅ 3 users (admin, staff, visitor)
- ✅ 7 visit slots (Monday-Wednesday)
- ✅ 7 visitors (different types)
- ✅ 7 bookings (confirmed)
- ✅ 2 notification templates
- ✅ 2 notifications (sent)
- ✅ All data relationships intact
- ✅ No conflicts or errors

## Troubleshooting

If you encounter errors:

1. **Check if server is running**: `npm run dev`
2. **Verify database connection**: Check Prisma connection
3. **Check token validity**: Re-login if tokens are expired
4. **Verify IDs**: Ensure all referenced IDs exist
5. **Check capacity**: Don't overbook slots
6. **Reset if needed**: `npx prisma migrate reset --force`

## Next Steps

Once seeding is complete, you can:

1. **Test all API endpoints** using the individual test files
2. **Run comprehensive tests** using the test suites
3. **Test error scenarios** with invalid data
4. **Test performance** with large datasets
5. **Test security** with different user roles

This execution script ensures a clean, conflict-free database seeding process with realistic test data.
