# TypeScript Build Fixes

## 1. bookingReminderScheduler.ts Fixes

Apply these changes to `src/scripts/bookingReminderScheduler.ts`:

### Fix Line 47 - Replace `not: null`:
```typescript
// Change from:
organization: { not: null }

// To:
organization: { not: Prisma.DbNull }
// OR remove the filter if not needed:
// (just remove the organization filter line)
```

### Fix Lines 70, 75, 83, 84, 86, 87, 95, 98, 102 - Add include for visitor and slot:

The booking query needs to include visitor and slot relations. Find the booking query (around line 40-50) and update it to:

```typescript
const bookings = await prisma.booking.findMany({
  where: {
    // your existing where conditions
    status: 'confirmed',
    // ... other conditions
  },
  include: {
    visitor: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    slot: {
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    },
  },
});
```

Then you can access `booking.visitor.email` and `booking.slot.date` etc.

---

## 2. visitorService.ts Fix

If you see `mostPopularVisitorType` at line 267, either:
- Remove it if it's not needed, OR
- Add it to the VisitorStats interface (line 25-31):

```typescript
export interface VisitorStats {
  totalVisitors: number;
  newVisitorsThisMonth: number;
  returningVisitors: number;
  averageGroupSize: number;
  mostPopularOrganization: string;
  mostPopularVisitorType?: string; // Add this if you need it
}
```

---

## 3. seedVisitSlots.ts - Already Fixed ✅

The fix has been applied - changed `descriptions` to `Record<SlotStatus, string>` type.

