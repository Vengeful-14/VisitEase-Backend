"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
const notificationController = new notificationController_1.NotificationController();
// All notification routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/notifications - Get notifications with filtering
router.get('/', notificationController.getNotifications.bind(notificationController));
// GET /api/v1/notifications/:id - Get specific notification
router.get('/:id', notificationController.getNotification.bind(notificationController));
// GET /api/v1/notifications/templates - Get notification templates
router.get('/templates', notificationController.getTemplates.bind(notificationController));
// POST /api/v1/notifications - Create new notification (Staff/Admin only)
router.post('/', middleware_1.requireStaffOrAdmin, notificationController.createNotification.bind(notificationController));
// POST /api/v1/notifications/templates - Create notification template (Staff/Admin only)
router.post('/templates', middleware_1.requireStaffOrAdmin, notificationController.createTemplate.bind(notificationController));
// PUT /api/v1/notifications/:id/send - Send notification (Staff/Admin only)
router.put('/:id/send', middleware_1.requireStaffOrAdmin, notificationController.sendNotification.bind(notificationController));
// PUT /api/v1/notifications/:id/status - Update notification status (Staff/Admin only)
router.put('/:id/status', middleware_1.requireStaffOrAdmin, notificationController.updateNotificationStatus.bind(notificationController));
// DELETE /api/v1/notifications/:id - Delete notification (Staff/Admin only)
router.delete('/:id', middleware_1.requireStaffOrAdmin, notificationController.deleteNotification.bind(notificationController));
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map