import { PrismaClient } from '../generated/prisma';
import { EmailService } from './emailService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient: string;
  recipientType: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: string;
  deliveryMethod: string;
  templateId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
  }

  async createNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    recipient: string;
    scheduledFor: Date;
    deliveryMethod: string;
    templateId?: string;
    metadata?: any;
  }, userId: string): Promise<Notification> {
    
    const recipientType = this.determineRecipientType(notificationData.recipient);

    const notification = await this.prisma.notification.create({
      data: {
        type: notificationData.type as any,
        title: notificationData.title,
        message: notificationData.message,
        recipient: notificationData.recipient,
        recipientType: recipientType as any,
        scheduledFor: notificationData.scheduledFor,
        deliveryMethod: notificationData.deliveryMethod as any,
        templateId: notificationData.templateId || null,
        metadata: notificationData.metadata || null,
        createdBy: userId
      }
    });

    return this.transformNotification(notification);
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    const notification = await this.getNotificationById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.status !== 'pending') {
      throw new Error('Notification is not in pending status');
    }

    try {
      let sent = false;
      
      switch (notification.deliveryMethod) {
        case 'email':
          sent = await this.sendEmail(notification);
          break;
        case 'sms':
          sent = await this.sendSMS(notification);
          break;
        case 'in_app':
          sent = await this.sendInAppNotification(notification);
          break;
        default:
          throw new Error('Unsupported delivery method');
      }

      // Update notification status
      await this.updateNotificationStatus(notificationId, sent ? 'sent' : 'failed');
      
      return sent;
    } catch (error) {
      await this.updateNotificationStatus(notificationId, 'failed');
      throw error;
    }
  }

  async getNotifications(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{notifications: Notification[], total: number}> {
    
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          creator: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.notification.count({ where })
    ]);

    return {
      notifications: notifications.map(notification => this.transformNotification(notification)),
      total
    };
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        creator: true
      }
    });

    return notification ? this.transformNotification(notification) : null;
  }

  async updateNotificationStatus(id: string, status: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'sent') {
      updateData.sentAt = new Date();
    }

    await this.prisma.notification.update({
      where: { id },
      data: updateData
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id }
    });
  }

  async getNotificationTemplates(): Promise<any[]> {
    return this.prisma.notificationTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createNotificationTemplate(templateData: {
    name: string;
    type: string;
    subject?: string;
    bodyTemplate: string;
    variables: string[];
  }): Promise<any> {
    return this.prisma.notificationTemplate.create({
      data: {
        name: templateData.name,
        type: templateData.type as any,
        subject: templateData.subject || null,
        bodyTemplate: templateData.bodyTemplate,
        variables: templateData.variables
      }
    });
  }

  private determineRecipientType(recipient: string): string {
    if (recipient.includes('@')) {
      return 'user';
    } else if (recipient.includes('+') || /^\d+$/.test(recipient)) {
      return 'visitor';
    }
    return 'user';
  }

  private async sendEmail(notification: any): Promise<boolean> {
    // Implement email sending logic (e.g., using SendGrid, Nodemailer, etc.)
    // This is a placeholder implementation
    console.log(`Sending email to ${notification.recipient}: ${notification.title}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true; // Return true if email was sent successfully
  }

  private async sendSMS(notification: any): Promise<boolean> {
    // Implement SMS sending logic (e.g., using Twilio, etc.)
    // This is a placeholder implementation
    console.log(`Sending SMS to ${notification.recipient}: ${notification.message}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true; // Return true if SMS was sent successfully
  }

  private async sendInAppNotification(notification: any): Promise<boolean> {
    // Implement in-app notification logic
    // This could involve WebSocket connections or database updates
    console.log(`Sending in-app notification to ${notification.recipient}: ${notification.title}`);
    
    return true;
  }

  async sendSMSForBooking(bookingId: string, userId: string, customMessage?: string): Promise<Notification> {
    // Fetch booking with visitor and slot details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        visitor: true,
        slot: true,
        smsStatus: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.visitor.phone) {
      throw new Error('Visitor does not have a phone number');
    }

    // Check SMS status
    let smsStatus = booking.smsStatus;
    
    // If already sent, return existing notification
    if (smsStatus && smsStatus.status === 'sent') {
      if (smsStatus.notificationId) {
        const notification = await this.getNotificationById(smsStatus.notificationId);
        if (notification) {
          return notification;
        }
      }
      throw new Error('SMS has already been sent for this booking');
    }

    // Check if max attempts reached
    if (smsStatus && smsStatus.status === 'max_attempts_reached') {
      throw new Error('Maximum SMS sending attempts (3) have been reached for this booking');
    }

    // Check attempt count
    const attemptCount = smsStatus ? smsStatus.attemptCount : 0;
    const maxAttempts = smsStatus ? smsStatus.maxAttempts : 3;

    if (attemptCount >= maxAttempts) {
      // Update status to max_attempts_reached
      if (smsStatus) {
        await this.prisma.bookingSmsStatus.update({
          where: { id: smsStatus.id },
          data: {
            status: 'max_attempts_reached',
            lastAttemptAt: new Date()
          }
        });
      }
      throw new Error(`Maximum SMS sending attempts (${maxAttempts}) have been reached for this booking`);
    }

    // Generate SMS message
    const slotDate = new Date(booking.slot.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const defaultMessage = `Thank you for visiting! Your booking on ${slotDate} at ${booking.slot.startTime.substring(0, 5)} has been completed. We hope you had a great experience!`;
    const message = customMessage || defaultMessage;

    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        type: 'sms',
        title: `Booking Completion - ${booking.visitor.name}`,
        message: message,
        recipient: booking.visitor.phone,
        recipientType: 'visitor',
        scheduledFor: new Date(),
        deliveryMethod: 'sms',
        metadata: {
          bookingId: booking.id,
          visitorId: booking.visitorId,
          slotId: booking.slotId
        },
        createdBy: userId
      }
    });

    // Update or create SMS status
    const now = new Date();
    if (!smsStatus) {
      smsStatus = await this.prisma.bookingSmsStatus.create({
        data: {
          bookingId: booking.id,
          status: 'pending',
          attemptCount: 1,
          maxAttempts: 3,
          lastAttemptAt: now,
          notificationId: notification.id
        }
      });
    } else {
      await this.prisma.bookingSmsStatus.update({
        where: { id: smsStatus.id },
        data: {
          attemptCount: attemptCount + 1,
          lastAttemptAt: now,
          notificationId: notification.id,
          status: 'pending'
        }
      });
    }

    // Send SMS immediately
    try {
      const sent = await this.sendSMS({
        recipient: booking.visitor.phone,
        message: message,
        title: notification.title
      });

      // Update notification status
      await this.updateNotificationStatus(notification.id, sent ? 'sent' : 'failed');

      // Update SMS status
      if (sent) {
        await this.prisma.bookingSmsStatus.update({
          where: { id: smsStatus.id },
          data: {
            status: 'sent',
            sentAt: now,
            lastErrorMessage: null
          }
        });
      } else {
        const newAttemptCount = attemptCount + 1;
        await this.prisma.bookingSmsStatus.update({
          where: { id: smsStatus.id },
          data: {
            status: newAttemptCount >= maxAttempts ? 'max_attempts_reached' : 'failed',
            lastErrorMessage: 'SMS sending failed'
          }
        });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const newAttemptCount = attemptCount + 1;
      
      await this.updateNotificationStatus(notification.id, 'failed');
      
      await this.prisma.bookingSmsStatus.update({
        where: { id: smsStatus.id },
        data: {
          status: newAttemptCount >= maxAttempts ? 'max_attempts_reached' : 'failed',
          lastErrorMessage: errorMessage
        }
      });
      
      throw error;
    }

    return this.transformNotification(notification);
  }

  async sendEmailForBooking(bookingId: string, userId: string): Promise<Notification> {
    // Fetch booking with visitor and slot details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        visitor: true,
        slot: true,
        smsStatus: true,
        emailStatus: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.visitor.email) {
      throw new Error('Visitor does not have an email address');
    }

    if (!booking.trackingToken) {
      throw new Error('Booking does not have a tracking token');
    }

    // Check if SMS attempts exceed 3 or max attempts reached
    // But allow resending if email was already sent
    const emailAlreadySent = booking.emailStatus && booking.emailStatus.status === 'sent';
    if (!emailAlreadySent) {
      const attemptCount = booking.smsStatus?.attemptCount || 0;
      if (attemptCount > 3 || booking.smsStatus?.status === 'max_attempts_reached') {
        throw new Error('Email cannot be sent when SMS attempts exceed 3 or maximum attempts have been reached');
      }
    }

    // Generate email data
    const slotDate = new Date(booking.slot.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        type: 'email',
        title: `Booking Confirmation - ${booking.visitor.name}`,
        message: `Your booking for ${slotDate} at ${booking.slot.startTime?.substring(0, 5) || 'Unknown'} has been confirmed.`,
        recipient: booking.visitor.email,
        recipientType: 'visitor',
        scheduledFor: new Date(),
        deliveryMethod: 'email',
        metadata: {
          bookingId: booking.id,
          visitorId: booking.visitorId,
          slotId: booking.slotId
        },
        createdBy: userId
      }
    });

    // Update or create email status
    const now = new Date();
    let emailStatus = booking.emailStatus;
    
    if (!emailStatus) {
      emailStatus = await this.prisma.bookingEmailStatus.create({
        data: {
          bookingId: booking.id,
          status: 'pending',
          notificationId: notification.id
        }
      });
    } else {
      await this.prisma.bookingEmailStatus.update({
        where: { id: emailStatus.id },
        data: {
          status: 'pending',
          notificationId: notification.id,
          lastErrorMessage: null
        }
      });
    }

    // Send email using EmailService
    try {
      const sent = await this.emailService.sendBookingConfirmationEmail({
        visitorName: booking.visitor.name,
        visitorEmail: booking.visitor.email,
        slotDate: slotDate,
        slotTime: booking.slot.startTime?.substring(0, 5) || 'Unknown',
        slotEndTime: booking.slot.endTime?.substring(0, 5) || 'Unknown',
        groupSize: booking.groupSize,
        trackingToken: booking.trackingToken,
        specialRequests: booking.specialRequests || undefined
      });

      // Update notification status
      await this.updateNotificationStatus(notification.id, sent ? 'sent' : 'failed');

      // Update email status
      if (sent) {
        await this.prisma.bookingEmailStatus.update({
          where: { id: emailStatus.id },
          data: {
            status: 'sent',
            sentAt: now,
            lastErrorMessage: null
          }
        });
      } else {
        await this.prisma.bookingEmailStatus.update({
          where: { id: emailStatus.id },
          data: {
            status: 'failed',
            lastErrorMessage: 'Email sending failed - check Resend API configuration'
          }
        });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Email sending error in notificationService:', errorMessage);
      console.error('Full error:', error);
      
      await this.updateNotificationStatus(notification.id, 'failed');
      
      await this.prisma.bookingEmailStatus.update({
        where: { id: emailStatus.id },
        data: {
          status: 'failed',
          lastErrorMessage: errorMessage
        }
      });
      
      throw new Error(`Failed to send email: ${errorMessage}`);
    }

    return this.transformNotification(notification);
  }

  private transformNotification(data: any): Notification {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      message: data.message,
      recipient: data.recipient,
      recipientType: data.recipientType,
      scheduledFor: data.scheduledFor,
      sentAt: data.sentAt,
      status: data.status,
      deliveryMethod: data.deliveryMethod,
      templateId: data.templateId,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}
