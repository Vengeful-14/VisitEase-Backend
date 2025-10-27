import { PrismaClient } from '../generated/prisma';

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

  constructor() {
    this.prisma = new PrismaClient();
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
