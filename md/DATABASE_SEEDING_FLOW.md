# Database Seeding Flow - VisitEase Backend

This guide provides a step-by-step flow for populating the database with test data without conflicts, including sample data for all API requests.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Reset and Setup](#database-reset-and-setup)
3. [Seeding Flow Overview](#seeding-flow-overview)
4. [Phase-by-Phase Seeding](#phase-by-phase-seeding)
5. [Sample Data Sets](#sample-data-sets)
6. [API Testing with Seeded Data](#api-testing-with-seeded-data)
7. [Conflict Prevention](#conflict-prevention)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Backend server running on `http://localhost:3000`
- Database properly migrated
- REST Client extension (VS Code) or similar tool
- Clean database state

## Database Reset and Setup

### 1. Reset Database
```bash
# Reset database and migrations
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

### 2. Verify Clean State
```bash
# Check database is empty
npx prisma studio
```

## Seeding Flow Overview

The seeding process follows a specific order to maintain referential integrity:

```
1. Users (Authentication) → 2. Visit Slots → 3. Visitors → 4. Bookings → 5. Notification Templates → 6. Notifications
```

**Key Principles:**
- **Dependencies First**: Create parent entities before child entities
- **Unique Constraints**: Ensure unique emails, phone numbers, and time slots
- **Capacity Management**: Don't overbook slots
- **Realistic Data**: Use realistic dates, times, and amounts

## Phase-by-Phase Seeding

### Phase 1: User Registration and Authentication

#### 1.1 Register Users with Different Roles

**Admin User:**
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

**Staff User:**
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

**Visitor User:**
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

#### 1.2 Login and Get Tokens

**Login Admin:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@visitease.com",
  "password": "Password123"
}
```

**Login Staff:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "staff@visitease.com",
  "password": "Password123"
}
```

**Login Visitor:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "visitor@visitease.com",
  "password": "Password123"
}
```

**Save the returned tokens:**
- `accessToken` - Use in Authorization header
- `refreshToken` - For token refresh
- `sessionToken` - For logout

### Phase 2: Create Visit Slots (Schedule)

#### 2.1 Create Slots for Next Week (Monday to Friday)

**Monday Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Monday Late Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Monday Afternoon Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Tuesday Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Tuesday Afternoon Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Wednesday Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Wednesday Afternoon Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
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

**Thursday Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "date": "2024-01-18",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Thursday morning tour slot"
}
```

**Friday Morning Slot:**
```http
POST http://localhost:3000/api/v1/schedule/slots
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "date": "2024-01-19",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "capacity": 20,
  "status": "available",
  "description": "Friday morning tour slot"
}
```

### Phase 3: Create Visitors

#### 3.1 Individual Visitors

**Individual Visitor 1:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

**Individual Visitor 2:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

#### 3.2 Family Visitors

**Family Visitor:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

#### 3.3 Educational Group Visitors

**Educational Group Leader:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

#### 3.4 Corporate Visitors

**Corporate Visitor:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

#### 3.5 Senior Visitors

**Senior Visitor:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

#### 3.6 Teen Visitors

**Teen Visitor:**
```http
POST http://localhost:3000/api/v1/visitors
Authorization: Bearer {staff-token}
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

### Phase 4: Create Bookings

#### 4.1 Individual Bookings

**Individual Booking 1 (Monday Morning):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-1-id}",
  "slotId": "{slot-1-id}",
  "groupSize": 1,
  "totalAmount": 25.00,
  "paymentMethod": "credit_card",
  "specialRequests": "Wheelchair accessible tour"
}
```

**Individual Booking 2 (Monday Late Morning):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-2-id}",
  "slotId": "{slot-2-id}",
  "groupSize": 1,
  "totalAmount": 25.00,
  "paymentMethod": "cash",
  "specialRequests": "Photography allowed"
}
```

#### 4.2 Family Bookings

**Family Booking (Monday Afternoon):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-3-id}",
  "slotId": "{slot-3-id}",
  "groupSize": 4,
  "totalAmount": 100.00,
  "paymentMethod": "online",
  "specialRequests": "Family with two children under 12"
}
```

#### 4.3 Educational Group Bookings

**Educational Group Booking (Tuesday Morning):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-4-id}",
  "slotId": "{slot-4-id}",
  "groupSize": 25,
  "totalAmount": 500.00,
  "paymentMethod": "online",
  "specialRequests": "Educational tour for university students"
}
```

#### 4.4 Corporate Bookings

**Corporate Booking (Tuesday Afternoon):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-5-id}",
  "slotId": "{slot-5-id}",
  "groupSize": 8,
  "totalAmount": 200.00,
  "paymentMethod": "credit_card",
  "specialRequests": "VIP tour for executives"
}
```

#### 4.5 Senior Bookings

**Senior Booking (Wednesday Morning):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-6-id}",
  "slotId": "{slot-6-id}",
  "groupSize": 2,
  "totalAmount": 40.00,
  "paymentMethod": "cash",
  "specialRequests": "Senior citizen discount"
}
```

#### 4.6 Teen Bookings

**Teen Booking (Wednesday Afternoon):**
```http
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer {visitor-token}
Content-Type: application/json

{
  "visitorId": "{visitor-7-id}",
  "slotId": "{slot-7-id}",
  "groupSize": 1,
  "totalAmount": 15.00,
  "paymentMethod": "online",
  "specialRequests": "Student ID required"
}
```

### Phase 5: Create Notification Templates

#### 5.1 Booking Confirmation Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "Booking Confirmation Template",
  "type": "booking_confirmation",
  "subject": "Booking Confirmed - VisitEase Museum",
  "bodyTemplate": "Dear [VISITOR_NAME], your booking for [VISIT_DATE] at [VISIT_TIME] has been confirmed. Booking ID: [BOOKING_ID]. Please arrive 15 minutes early.",
  "variables": ["VISITOR_NAME", "VISIT_DATE", "VISIT_TIME", "BOOKING_ID"]
}
```

#### 5.2 Booking Reminder Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "Booking Reminder Template",
  "type": "booking_reminder",
  "subject": "Reminder: Your Visit Tomorrow",
  "bodyTemplate": "Hi [VISITOR_NAME], this is a reminder that you have a visit scheduled for tomorrow at [VISIT_TIME]. Please arrive 15 minutes early. If you need to cancel, please contact us at least 24 hours in advance.",
  "variables": ["VISITOR_NAME", "VISIT_TIME"]
}
```

#### 5.3 Booking Cancellation Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "Booking Cancellation Template",
  "type": "booking_cancellation",
  "subject": "Booking Cancelled - VisitEase Museum",
  "bodyTemplate": "Dear [VISITOR_NAME], your booking for [VISIT_DATE] at [VISIT_TIME] has been cancelled. Reason: [CANCELLATION_REASON]. If you have any questions, please contact us.",
  "variables": ["VISITOR_NAME", "VISIT_DATE", "VISIT_TIME", "CANCELLATION_REASON"]
}
```

#### 5.4 Payment Reminder Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "Payment Reminder Template",
  "type": "payment_reminder",
  "subject": "Payment Reminder - VisitEase Museum",
  "bodyTemplate": "Dear [VISITOR_NAME], this is a reminder that payment for your booking (ID: [BOOKING_ID]) is due. Amount: $[AMOUNT]. Please complete payment before your visit.",
  "variables": ["VISITOR_NAME", "BOOKING_ID", "AMOUNT"]
}
```

#### 5.5 General Announcement Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "General Announcement Template",
  "type": "general_announcement",
  "subject": "Museum Announcement",
  "bodyTemplate": "Important museum announcement: [ANNOUNCEMENT_MESSAGE]",
  "variables": ["ANNOUNCEMENT_MESSAGE"]
}
```

#### 5.6 Maintenance Alert Template
```http
POST http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "name": "Maintenance Alert Template",
  "type": "maintenance_alert",
  "subject": "Maintenance Alert - VisitEase Museum",
  "bodyTemplate": "Attention: [MAINTENANCE_MESSAGE]. Expected duration: [DURATION]. We apologize for any inconvenience.",
  "variables": ["MAINTENANCE_MESSAGE", "DURATION"]
}
```

### Phase 6: Create Notifications

#### 6.1 Booking Confirmation Notifications
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "type": "booking_confirmation",
  "title": "Booking Confirmation",
  "message": "Your booking has been confirmed for tomorrow at 9:00 AM",
  "recipient": "john.doe@example.com",
  "scheduledFor": "2024-01-15T10:00:00Z",
  "deliveryMethod": "email",
  "templateId": "{template-1-id}",
  "metadata": {
    "bookingId": "{booking-1-id}",
    "slotId": "{slot-1-id}",
    "visitorName": "John Doe",
    "visitDate": "2024-01-15",
    "visitTime": "09:00"
  }
}
```

#### 6.2 Booking Reminder Notifications
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "type": "booking_reminder",
  "title": "Booking Reminder",
  "message": "Don't forget your visit tomorrow at 10:00 AM",
  "recipient": "+1234567894",
  "scheduledFor": "2024-01-15T08:00:00Z",
  "deliveryMethod": "sms",
  "templateId": "{template-2-id}",
  "metadata": {
    "bookingId": "{booking-2-id}",
    "visitorName": "Jane Smith",
    "visitTime": "10:00"
  }
}
```

#### 6.3 General Announcements
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "type": "general_announcement",
  "title": "Museum Closure Notice",
  "message": "The museum will be closed on January 20th for maintenance",
  "recipient": "all_visitors",
  "deliveryMethod": "all",
  "templateId": "{template-5-id}",
  "metadata": {
    "announcementType": "closure",
    "announcementMessage": "The museum will be closed on January 20th for maintenance. We apologize for any inconvenience."
  }
}
```

#### 6.4 Maintenance Alerts
```http
POST http://localhost:3000/api/v1/notifications
Authorization: Bearer {staff-token}
Content-Type: application/json

{
  "type": "maintenance_alert",
  "title": "Maintenance Alert",
  "message": "Scheduled maintenance will begin at 6:00 PM today",
  "recipient": "staff@museum.com",
  "deliveryMethod": "in_app",
  "templateId": "{template-6-id}",
  "metadata": {
    "maintenanceType": "scheduled",
    "maintenanceMessage": "Scheduled maintenance will begin at 6:00 PM today",
    "duration": "2 hours"
  }
}
```

### Phase 7: Confirm Bookings

#### 7.1 Confirm All Bookings
```http
PUT http://localhost:3000/api/v1/bookings/{booking-1-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-2-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-3-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-4-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-5-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-6-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/bookings/{booking-7-id}/confirm
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

### Phase 8: Send Notifications

#### 8.1 Send All Notifications
```http
PUT http://localhost:3000/api/v1/notifications/{notification-1-id}/send
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/notifications/{notification-2-id}/send
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/notifications/{notification-3-id}/send
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

```http
PUT http://localhost:3000/api/v1/notifications/{notification-4-id}/send
Authorization: Bearer {staff-token}
Content-Type: application/json

{}
```

## Sample Data Sets

### Complete Test Data Summary

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
      "description": "Monday morning tour slot"
    },
    {
      "date": "2024-01-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "capacity": 15,
      "description": "Monday late morning tour slot"
    },
    {
      "date": "2024-01-15",
      "startTime": "14:00",
      "endTime": "15:00",
      "capacity": 25,
      "description": "Monday afternoon tour slot"
    },
    {
      "date": "2024-01-16",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "description": "Tuesday morning tour slot"
    },
    {
      "date": "2024-01-16",
      "startTime": "14:00",
      "endTime": "15:00",
      "capacity": 25,
      "description": "Tuesday afternoon tour slot"
    },
    {
      "date": "2024-01-17",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "description": "Wednesday morning tour slot"
    },
    {
      "date": "2024-01-17",
      "startTime": "14:00",
      "endTime": "15:00",
      "capacity": 25,
      "description": "Wednesday afternoon tour slot"
    },
    {
      "date": "2024-01-18",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "description": "Thursday morning tour slot"
    },
    {
      "date": "2024-01-19",
      "startTime": "09:00",
      "endTime": "10:00",
      "capacity": 20,
      "description": "Friday morning tour slot"
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
      "type": "individual",
      "ageGroup": "adult_35_54"
    },
    {
      "name": "Robert Johnson",
      "email": "robert.johnson@example.com",
      "type": "family",
      "ageGroup": "adult_35_54"
    },
    {
      "name": "Dr. Sarah Wilson",
      "email": "sarah.wilson@university.edu",
      "type": "educational",
      "ageGroup": "adult_35_54"
    },
    {
      "name": "Mike Davis",
      "email": "mike.davis@company.com",
      "type": "corporate",
      "ageGroup": "adult_35_54"
    },
    {
      "name": "Margaret Brown",
      "email": "margaret.brown@example.com",
      "type": "individual",
      "ageGroup": "senior_55_plus"
    },
    {
      "name": "Emily Taylor",
      "email": "emily.taylor@example.com",
      "type": "individual",
      "ageGroup": "teen_13_17"
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
      "groupSize": 1,
      "totalAmount": 25.00,
      "paymentMethod": "cash"
    },
    {
      "visitorId": "visitor-3",
      "slotId": "slot-3",
      "groupSize": 4,
      "totalAmount": 100.00,
      "paymentMethod": "online"
    },
    {
      "visitorId": "visitor-4",
      "slotId": "slot-4",
      "groupSize": 25,
      "totalAmount": 500.00,
      "paymentMethod": "online"
    },
    {
      "visitorId": "visitor-5",
      "slotId": "slot-5",
      "groupSize": 8,
      "totalAmount": 200.00,
      "paymentMethod": "credit_card"
    },
    {
      "visitorId": "visitor-6",
      "slotId": "slot-6",
      "groupSize": 2,
      "totalAmount": 40.00,
      "paymentMethod": "cash"
    },
    {
      "visitorId": "visitor-7",
      "slotId": "slot-7",
      "groupSize": 1,
      "totalAmount": 15.00,
      "paymentMethod": "online"
    }
  ],
  "templates": [
    {
      "name": "Booking Confirmation Template",
      "type": "booking_confirmation"
    },
    {
      "name": "Booking Reminder Template",
      "type": "booking_reminder"
    },
    {
      "name": "Booking Cancellation Template",
      "type": "booking_cancellation"
    },
    {
      "name": "Payment Reminder Template",
      "type": "payment_reminder"
    },
    {
      "name": "General Announcement Template",
      "type": "general_announcement"
    },
    {
      "name": "Maintenance Alert Template",
      "type": "maintenance_alert"
    }
  ],
  "notifications": [
    {
      "type": "booking_confirmation",
      "deliveryMethod": "email"
    },
    {
      "type": "booking_reminder",
      "deliveryMethod": "sms"
    },
    {
      "type": "general_announcement",
      "deliveryMethod": "all"
    },
    {
      "type": "maintenance_alert",
      "deliveryMethod": "in_app"
    }
  ]
}
```

## API Testing with Seeded Data

### 1. Dashboard API Testing

**Get Dashboard Statistics:**
```http
GET http://localhost:3000/api/v1/dashboard/stats
Authorization: Bearer {admin-token}
```

**Get Upcoming Visits:**
```http
GET http://localhost:3000/api/v1/dashboard/upcoming-visits?limit=5
Authorization: Bearer {admin-token}
```

**Get Recent Activity:**
```http
GET http://localhost:3000/api/v1/dashboard/recent-activity?limit=10
Authorization: Bearer {admin-token}
```

**Get Revenue Trend:**
```http
GET http://localhost:3000/api/v1/dashboard/revenue-trend?days=7
Authorization: Bearer {admin-token}
```

### 2. Schedule API Testing

**Get All Slots:**
```http
GET http://localhost:3000/api/v1/schedule/slots?date=2024-01-15
Authorization: Bearer {staff-token}
```

**Get Schedule Statistics:**
```http
GET http://localhost:3000/api/v1/schedule/statistics
Authorization: Bearer {staff-token}
```

**Get Schedule Issues:**
```http
GET http://localhost:3000/api/v1/schedule/issues
Authorization: Bearer {staff-token}
```

### 3. Visitor API Testing

**Get All Visitors:**
```http
GET http://localhost:3000/api/v1/visitors?search=John&type=individual
Authorization: Bearer {staff-token}
```

**Get Visitor Statistics:**
```http
GET http://localhost:3000/api/v1/visitors/stats
Authorization: Bearer {staff-token}
```

### 4. Booking API Testing

**Get All Bookings:**
```http
GET http://localhost:3000/api/v1/bookings?status=confirmed
Authorization: Bearer {staff-token}
```

**Get Bookings by Visitor:**
```http
GET http://localhost:3000/api/v1/bookings/visitor/{visitor-1-id}
Authorization: Bearer {staff-token}
```

**Get Bookings by Slot:**
```http
GET http://localhost:3000/api/v1/bookings/slot/{slot-1-id}
Authorization: Bearer {staff-token}
```

### 5. Notification API Testing

**Get All Notifications:**
```http
GET http://localhost:3000/api/v1/notifications?type=booking_confirmation
Authorization: Bearer {staff-token}
```

**Get Notification Templates:**
```http
GET http://localhost:3000/api/v1/notifications/templates
Authorization: Bearer {staff-token}
```

## Conflict Prevention

### 1. Unique Constraints

**Email Addresses:**
- All user emails must be unique
- All visitor emails must be unique
- Use different domains for different types of users

**Phone Numbers:**
- All phone numbers must be unique
- Use different area codes for different users

**Time Slots:**
- No overlapping time slots on the same date
- Ensure proper time intervals between slots

### 2. Capacity Management

**Slot Capacity:**
- Don't overbook slots
- Leave some slots available for testing
- Monitor total bookings vs. capacity

**Group Size Limits:**
- Respect maximum group size limits
- Test edge cases (1 person, maximum capacity)

### 3. Data Relationships

**Foreign Key Constraints:**
- Create parent entities before child entities
- Ensure all referenced IDs exist
- Use consistent ID formats

**Business Logic:**
- Confirm bookings before sending notifications
- Send notifications after bookings are confirmed
- Maintain proper status transitions

### 4. Date and Time Management

**Future Dates:**
- Use future dates for all slots and bookings
- Ensure dates are realistic and consistent
- Avoid past dates for new bookings

**Time Zones:**
- Use consistent time zone (UTC)
- Ensure time formats are correct
- Validate time ranges

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Issue**: 401 Unauthorized
- **Solution**: Check if tokens are valid and not expired
- **Fix**: Re-login and get new tokens

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

### Verification Steps

1. **Check User Count:**
   ```http
   GET http://localhost:3000/api/v1/users
   Authorization: Bearer {admin-token}
   ```

2. **Check Slot Count:**
   ```http
   GET http://localhost:3000/api/v1/schedule/slots
   Authorization: Bearer {staff-token}
   ```

3. **Check Visitor Count:**
   ```http
   GET http://localhost:3000/api/v1/visitors
   Authorization: Bearer {staff-token}
   ```

4. **Check Booking Count:**
   ```http
   GET http://localhost:3000/api/v1/bookings
   Authorization: Bearer {staff-token}
   ```

5. **Check Notification Count:**
   ```http
   GET http://localhost:3000/api/v1/notifications
   Authorization: Bearer {staff-token}
   ```

### Success Criteria

- ✅ All users can register and login
- ✅ All slots are created without conflicts
- ✅ All visitors are created with unique data
- ✅ All bookings are created within capacity limits
- ✅ All notifications are created and sent
- ✅ All data relationships are maintained
- ✅ All business rules are enforced
- ✅ All API endpoints return expected data

This comprehensive flow ensures proper database seeding without conflicts and provides realistic test data for all API endpoints.
