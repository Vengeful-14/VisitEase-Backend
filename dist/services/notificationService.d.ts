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
export declare class NotificationService {
    private prisma;
    constructor();
    createNotification(notificationData: {
        type: string;
        title: string;
        message: string;
        recipient: string;
        scheduledFor: Date;
        deliveryMethod: string;
        templateId?: string;
        metadata?: any;
    }, userId: string): Promise<Notification>;
    sendNotification(notificationId: string): Promise<boolean>;
    getNotifications(filters: {
        status?: string;
        type?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    getNotificationById(id: string): Promise<Notification | null>;
    updateNotificationStatus(id: string, status: string): Promise<void>;
    deleteNotification(id: string): Promise<void>;
    getNotificationTemplates(): Promise<any[]>;
    createNotificationTemplate(templateData: {
        name: string;
        type: string;
        subject?: string;
        bodyTemplate: string;
        variables: string[];
    }): Promise<any>;
    private determineRecipientType;
    private sendEmail;
    private sendSMS;
    private sendInAppNotification;
    private transformNotification;
}
//# sourceMappingURL=notificationService.d.ts.map