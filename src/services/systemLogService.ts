import { PrismaClient, LogLevel } from '../generated/prisma';

export interface SystemLogData {
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SystemLogService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a system log entry
   */
  async createLog(logData: SystemLogData): Promise<void> {
    try {
      await this.prisma.systemLog.create({
        data: {
          level: logData.level,
          message: logData.message,
          context: logData.context || null,
          userId: logData.userId || null,
          ipAddress: logData.ipAddress || null,
          userAgent: logData.userAgent || null,
        }
      });
    } catch (error) {
      // Don't throw error for logging failures to avoid breaking main functionality
      console.error('Failed to create system log:', error);
    }
  }

  /**
   * Log visit slot creation
   */
  async logSlotCreated(slotData: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    description?: string;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(slotData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const message = `📅 NEW VISIT SLOT CREATED: ${readableDate} from ${slotData.startTime} to ${slotData.endTime} with capacity of ${slotData.capacity} visitors${slotData.description ? ` - Description: "${slotData.description}"` : ''}`;
    
    await this.createLog({
      level: 'info',
      message,
      context: {
        action: 'slot_created',
        actionType: 'Visit Slot Creation',
        slotId: slotData.slotId,
        date: slotData.date,
        readableDate: readableDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        capacity: slotData.capacity,
        description: slotData.description,
        createdBy: slotData.userName || slotData.userId,
        timestamp: new Date().toISOString(),
        details: {
          slotInfo: `Slot ID: ${slotData.slotId}`,
          timeInfo: `Time: ${slotData.startTime} - ${slotData.endTime}`,
          capacityInfo: `Capacity: ${slotData.capacity} visitors`,
          dateInfo: `Date: ${readableDate}`
        }
      },
      userId: slotData.userId
    });
  }

  /**
   * Log visit slot update
   */
  async logSlotUpdated(slotData: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    description?: string;
    userId: string;
    userName?: string;
    changes: any;
  }): Promise<void> {
    const readableDate = new Date(slotData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const changesList = Object.entries(slotData.changes || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    const message = `✏️ VISIT SLOT UPDATED: ${readableDate} from ${slotData.startTime} to ${slotData.endTime} with capacity of ${slotData.capacity} visitors${slotData.description ? ` - Description: "${slotData.description}"` : ''}${changesList ? ` - Changes: ${changesList}` : ''}`;
    
    await this.createLog({
      level: 'info',
      message,
      context: {
        action: 'slot_updated',
        actionType: 'Visit Slot Update',
        slotId: slotData.slotId,
        date: slotData.date,
        readableDate: readableDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        capacity: slotData.capacity,
        description: slotData.description,
        updatedBy: slotData.userName || slotData.userId,
        changes: slotData.changes,
        timestamp: new Date().toISOString(),
        details: {
          slotInfo: `Slot ID: ${slotData.slotId}`,
          timeInfo: `Time: ${slotData.startTime} - ${slotData.endTime}`,
          capacityInfo: `Capacity: ${slotData.capacity} visitors`,
          dateInfo: `Date: ${readableDate}`,
          changesInfo: changesList ? `Changes made: ${changesList}` : 'No specific changes recorded'
        }
      },
      userId: slotData.userId
    });
  }

  /**
   * Log visit slot deletion
   */
  async logSlotDeleted(slotData: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(slotData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const message = `🗑️ VISIT SLOT DELETED: ${readableDate} from ${slotData.startTime} to ${slotData.endTime} - This slot has been permanently removed from the system`;
    
    await this.createLog({
      level: 'warn',
      message,
      context: {
        action: 'slot_deleted',
        actionType: 'Visit Slot Deletion',
        slotId: slotData.slotId,
        date: slotData.date,
        readableDate: readableDate,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        deletedBy: slotData.userName || slotData.userId,
        timestamp: new Date().toISOString(),
        details: {
          slotInfo: `Slot ID: ${slotData.slotId}`,
          timeInfo: `Time: ${slotData.startTime} - ${slotData.endTime}`,
          dateInfo: `Date: ${readableDate}`,
          actionInfo: 'This slot has been permanently removed from the system',
          impactInfo: 'Any existing bookings for this slot may be affected'
        }
      },
      userId: slotData.userId
    });
  }

  /**
   * Log booking creation
   */
  async logBookingCreated(bookingData: {
    bookingId: string;
    visitorName: string;
    slotDate: string;
    slotTime: string;
    groupSize: number;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(bookingData.slotDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const groupText = bookingData.groupSize === 1 ? 'individual visitor' : `group of ${bookingData.groupSize} visitors`;
    
    const message = `🎫 NEW BOOKING CREATED: ${bookingData.visitorName} has booked a visit for ${readableDate} at ${bookingData.slotTime} (${groupText})`;
    
    await this.createLog({
      level: 'info',
      message,
      context: {
        action: 'booking_created',
        actionType: 'Booking Creation',
        bookingId: bookingData.bookingId,
        visitorName: bookingData.visitorName,
        slotDate: bookingData.slotDate,
        readableDate: readableDate,
        slotTime: bookingData.slotTime,
        groupSize: bookingData.groupSize,
        createdBy: bookingData.userName || bookingData.userId,
        timestamp: new Date().toISOString(),
        details: {
          bookingInfo: `Booking ID: ${bookingData.bookingId}`,
          visitorInfo: `Visitor: ${bookingData.visitorName}`,
          timeInfo: `Time: ${bookingData.slotTime}`,
          dateInfo: `Date: ${readableDate}`,
          groupInfo: `Group size: ${bookingData.groupSize} ${bookingData.groupSize === 1 ? 'person' : 'people'}`
        }
      },
      userId: bookingData.userId
    });
  }

  /**
   * Log booking cancellation
   */
  async logBookingCancelled(bookingData: {
    bookingId: string;
    visitorName: string;
    slotDate: string;
    slotTime: string;
    reason?: string;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(bookingData.slotDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const reasonText = bookingData.reason ? ` - Reason: "${bookingData.reason}"` : ' - No reason provided';
    
    const message = `❌ BOOKING CANCELLED: ${bookingData.visitorName}'s visit for ${readableDate} at ${bookingData.slotTime} has been cancelled${reasonText}`;
    
    await this.createLog({
      level: 'warn',
      message,
      context: {
        action: 'booking_cancelled',
        actionType: 'Booking Cancellation',
        bookingId: bookingData.bookingId,
        visitorName: bookingData.visitorName,
        slotDate: bookingData.slotDate,
        readableDate: readableDate,
        slotTime: bookingData.slotTime,
        reason: bookingData.reason,
        cancelledBy: bookingData.userName || bookingData.userId,
        timestamp: new Date().toISOString(),
        details: {
          bookingInfo: `Booking ID: ${bookingData.bookingId}`,
          visitorInfo: `Visitor: ${bookingData.visitorName}`,
          timeInfo: `Time: ${bookingData.slotTime}`,
          dateInfo: `Date: ${readableDate}`,
          reasonInfo: bookingData.reason ? `Reason: ${bookingData.reason}` : 'No reason provided',
          impactInfo: 'This booking has been cancelled and the slot may be available for other visitors'
        }
      },
      userId: bookingData.userId
    });
  }

  /**
   * Log maintenance scheduled
   */
  async logMaintenanceScheduled(maintenanceData: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(maintenanceData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const message = `🔧 MAINTENANCE SCHEDULED: System maintenance planned for ${readableDate} from ${maintenanceData.startTime} to ${maintenanceData.endTime} - Details: "${maintenanceData.description}"`;
    
    await this.createLog({
      level: 'info',
      message,
      context: {
        action: 'maintenance_scheduled',
        actionType: 'Maintenance Scheduling',
        slotId: maintenanceData.slotId,
        date: maintenanceData.date,
        readableDate: readableDate,
        startTime: maintenanceData.startTime,
        endTime: maintenanceData.endTime,
        description: maintenanceData.description,
        scheduledBy: maintenanceData.userName || maintenanceData.userId,
        timestamp: new Date().toISOString(),
        details: {
          slotInfo: `Slot ID: ${maintenanceData.slotId}`,
          timeInfo: `Time: ${maintenanceData.startTime} - ${maintenanceData.endTime}`,
          dateInfo: `Date: ${readableDate}`,
          descriptionInfo: `Details: ${maintenanceData.description}`,
          impactInfo: 'This maintenance window may affect system availability'
        }
      },
      userId: maintenanceData.userId
    });
  }

  /**
   * Log slot status change
   */
  async logSlotStatusChanged(statusData: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    oldStatus: string;
    newStatus: string;
    userId: string;
    userName?: string;
  }): Promise<void> {
    const readableDate = new Date(statusData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const statusChangeText = `${statusData.oldStatus.toUpperCase()} → ${statusData.newStatus.toUpperCase()}`;
    
    const message = `🔄 SLOT STATUS CHANGED: Visit slot for ${readableDate} at ${statusData.startTime}-${statusData.endTime} status changed from ${statusData.oldStatus} to ${statusData.newStatus}`;
    
    await this.createLog({
      level: 'info',
      message,
      context: {
        action: 'slot_status_changed',
        actionType: 'Slot Status Change',
        slotId: statusData.slotId,
        date: statusData.date,
        readableDate: readableDate,
        startTime: statusData.startTime,
        endTime: statusData.endTime,
        oldStatus: statusData.oldStatus,
        newStatus: statusData.newStatus,
        changedBy: statusData.userName || statusData.userId,
        timestamp: new Date().toISOString(),
        details: {
          slotInfo: `Slot ID: ${statusData.slotId}`,
          timeInfo: `Time: ${statusData.startTime} - ${statusData.endTime}`,
          dateInfo: `Date: ${readableDate}`,
          statusChangeInfo: `Status: ${statusChangeText}`,
          impactInfo: `This slot is now ${statusData.newStatus.toLowerCase()} and ${statusData.newStatus === 'available' ? 'can accept new bookings' : statusData.newStatus === 'full' ? 'is at full capacity' : 'is not available for booking'}`
        }
      },
      userId: statusData.userId
    });
  }

  /**
   * Log error events
   */
  async logError(errorData: {
    message: string;
    context?: any;
    userId?: string;
    userName?: string;
  }): Promise<void> {
    const message = `🚨 SYSTEM ERROR: ${errorData.message}`;
    
    await this.createLog({
      level: 'error',
      message,
      context: {
        action: 'error',
        actionType: 'System Error',
        ...errorData.context,
        errorBy: errorData.userName || errorData.userId,
        timestamp: new Date().toISOString(),
        details: {
          errorInfo: `Error: ${errorData.message}`,
          userInfo: errorData.userName ? `User: ${errorData.userName}` : errorData.userId ? `User ID: ${errorData.userId}` : 'Unknown user',
          contextInfo: errorData.context ? `Additional context: ${JSON.stringify(errorData.context)}` : 'No additional context',
          impactInfo: 'This error may affect system functionality'
        }
      },
      userId: errorData.userId
    });
  }
}
