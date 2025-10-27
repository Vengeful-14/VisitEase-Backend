"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    constructor() {
        this.notificationService = new notificationService_1.NotificationService();
    }
    async getNotifications(req, res) {
        try {
            const filters = {
                status: req.query.status,
                type: req.query.type,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await this.notificationService.getNotifications(filters);
            const successResponse = {
                success: true,
                message: 'Notifications retrieved successfully',
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get notifications error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve notifications'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getNotification(req, res) {
        try {
            const { id } = req.params;
            const notification = await this.notificationService.getNotificationById(id);
            if (!notification) {
                const errorResponse = {
                    success: false,
                    message: 'Notification not found'
                };
                res.status(404).json(errorResponse);
                return;
            }
            const successResponse = {
                success: true,
                message: 'Notification retrieved successfully',
                data: notification
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get notification error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve notification'
            };
            res.status(500).json(errorResponse);
        }
    }
    async createNotification(req, res) {
        try {
            const userId = req.user?.userId; // From authentication middleware
            if (!userId) {
                const errorResponse = {
                    success: false,
                    message: 'User authentication required'
                };
                res.status(401).json(errorResponse);
                return;
            }
            const notification = await this.notificationService.createNotification(req.body, userId);
            const successResponse = {
                success: true,
                message: 'Notification created successfully',
                data: notification
            };
            res.status(201).json(successResponse);
        }
        catch (error) {
            console.error('Create notification error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create notification'
            };
            res.status(400).json(errorResponse);
        }
    }
    async sendNotification(req, res) {
        try {
            const { id } = req.params;
            const sent = await this.notificationService.sendNotification(id);
            const successResponse = {
                success: true,
                message: sent ? 'Notification sent successfully' : 'Failed to send notification',
                data: { sent }
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Send notification error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to send notification'
            };
            res.status(400).json(errorResponse);
        }
    }
    async updateNotificationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                const errorResponse = {
                    success: false,
                    message: 'Status is required'
                };
                res.status(400).json(errorResponse);
                return;
            }
            await this.notificationService.updateNotificationStatus(id, status);
            const successResponse = {
                success: true,
                message: 'Notification status updated successfully'
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Update notification status error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update notification status'
            };
            res.status(400).json(errorResponse);
        }
    }
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            await this.notificationService.deleteNotification(id);
            const successResponse = {
                success: true,
                message: 'Notification deleted successfully'
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Delete notification error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete notification'
            };
            res.status(400).json(errorResponse);
        }
    }
    async getTemplates(req, res) {
        try {
            const templates = await this.notificationService.getNotificationTemplates();
            const successResponse = {
                success: true,
                message: 'Notification templates retrieved successfully',
                data: templates
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get notification templates error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve notification templates'
            };
            res.status(500).json(errorResponse);
        }
    }
    async createTemplate(req, res) {
        try {
            const template = await this.notificationService.createNotificationTemplate(req.body);
            const successResponse = {
                success: true,
                message: 'Notification template created successfully',
                data: template
            };
            res.status(201).json(successResponse);
        }
        catch (error) {
            console.error('Create notification template error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create notification template'
            };
            res.status(400).json(errorResponse);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notificationController.js.map