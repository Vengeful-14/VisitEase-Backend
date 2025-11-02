import { PrismaClient } from '../generated/prisma';
import { EmailService } from '../services/emailService';

const prisma = new PrismaClient();
const emailService = new EmailService();

/**
 * Get tomorrow's date at midnight
 */
function getTomorrowStart(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Get tomorrow's date at end of day
 */
function getTomorrowEnd(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  return tomorrow;
}

/**
 * Send reminder emails for bookings scheduled tomorrow
 */
export async function sendBookingReminders(): Promise<{ sent: number; failed: number }> {
  const tomorrowStart = getTomorrowStart();
  const tomorrowEnd = getTomorrowEnd();

  // Find confirmed bookings scheduled for tomorrow that haven't been completed or cancelled
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'confirmed',
      slot: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd
        }
      },
      // Only send reminders if visitor has email and tracking token
      visitor: {
        email: {
          not: null
        }
      },
      trackingToken: {
        not: null
      }
    },
    include: {
      visitor: true,
      slot: true
    }
  });

  if (bookings.length === 0) {
    console.log('No bookings found for reminder emails');
    return { sent: 0, failed: 0 };
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const booking of bookings) {
    // Skip if visitor doesn't have email or tracking token
    if (!booking.visitor?.email || !booking.trackingToken) {
      continue;
    }

    try {
      const slotDate = new Date(booking.slot.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const success = await emailService.sendBookingReminderEmail({
        visitorName: booking.visitor.name,
        visitorEmail: booking.visitor.email,
        slotDate: slotDate,
        slotTime: booking.slot.startTime?.substring(0, 5) || 'Unknown',
        slotEndTime: booking.slot.endTime?.substring(0, 5) || 'Unknown',
        groupSize: booking.groupSize,
        trackingToken: booking.trackingToken,
        specialRequests: booking.specialRequests || undefined
      });

      if (success) {
        sentCount++;
        console.log(`Reminder email sent successfully to ${booking.visitor.email} for booking ${booking.id}`);
      } else {
        failedCount++;
        console.error(`Failed to send reminder email to ${booking.visitor.email} for booking ${booking.id}`);
      }
    } catch (error) {
      failedCount++;
      console.error(`Error sending reminder email to ${booking.visitor.email} for booking ${booking.id}:`, error);
    }
  }

  console.log(`Booking reminder emails: ${sentCount} sent, ${failedCount} failed`);
  return { sent: sentCount, failed: failedCount };
}

/**
 * Start the booking reminder scheduler
 * Runs daily at 9 AM to send reminders for bookings scheduled tomorrow
 */
export function startBookingReminderScheduler(): void {
  // Run once on startup (for testing/debugging, but typically we'd skip this)
  // Uncomment the line below if you want to test immediately on startup
  // sendBookingReminders().catch(err => console.error('Error in initial reminder check:', err));

  // Calculate milliseconds until next 9 AM
  function getMsUntil9AM(): number {
    const now = new Date();
    const next9AM = new Date();
    next9AM.setHours(9, 0, 0, 0);
    
    // If it's past 9 AM today, schedule for 9 AM tomorrow
    if (now.getTime() >= next9AM.getTime()) {
      next9AM.setDate(next9AM.getDate() + 1);
    }
    
    return next9AM.getTime() - now.getTime();
  }

  // Schedule first run
  const msUntilFirstRun = getMsUntil9AM();
  console.log(`Booking reminder scheduler will run in ${Math.round(msUntilFirstRun / 1000 / 60)} minutes`);
  
  setTimeout(() => {
    // Run immediately
    sendBookingReminders().catch(err => console.error('Error in booking reminder scheduler:', err));
    
    // Then schedule for every 24 hours
    const oneDayMs = 24 * 60 * 60 * 1000;
    setInterval(() => {
      sendBookingReminders().catch(err => console.error('Error in booking reminder scheduler:', err));
    }, oneDayMs);
  }, msUntilFirstRun);
}

