import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken, requireStaffOrAdmin } from '../auth/middleware';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateToken);

// GET /api/v1/notifications - Get notifications with filtering
router.get('/', notificationController.getNotifications.bind(notificationController));

// GET /api/v1/notifications/:id - Get specific notification
router.get('/:id', notificationController.getNotification.bind(notificationController));

// GET /api/v1/notifications/templates - Get notification templates
router.get('/templates', notificationController.getTemplates.bind(notificationController));

// POST /api/v1/notifications - Create new notification (Staff/Admin only)
router.post('/', requireStaffOrAdmin, notificationController.createNotification.bind(notificationController));

// POST /api/v1/notifications/templates - Create notification template (Staff/Admin only)
router.post('/templates', requireStaffOrAdmin, notificationController.createTemplate.bind(notificationController));

// POST /api/v1/notifications/send-sms-booking - Send SMS notification for a booking (Staff/Admin only)
router.post('/send-sms-booking', requireStaffOrAdmin, notificationController.sendSMSForBooking.bind(notificationController));

// POST /api/v1/notifications/send-email-booking - Send email notification for a booking (Staff/Admin only)
router.post('/send-email-booking', requireStaffOrAdmin, notificationController.sendEmailForBooking.bind(notificationController));

// PUT /api/v1/notifications/:id/send - Send notification (Staff/Admin only)
router.put('/:id/send', requireStaffOrAdmin, notificationController.sendNotification.bind(notificationController));

// PUT /api/v1/notifications/:id/status - Update notification status (Staff/Admin only)
router.put('/:id/status', requireStaffOrAdmin, notificationController.updateNotificationStatus.bind(notificationController));

// DELETE /api/v1/notifications/:id - Delete notification (Staff/Admin only)
router.delete('/:id', requireStaffOrAdmin, notificationController.deleteNotification.bind(notificationController));

export default router;
