import { Router } from 'express';
import { Request, Response } from 'express';
import {
  // Dashboard validators
  validateDashboardStats,
  validateUpcomingVisits,
  validateRecentActivity,
  validateRevenueTrend,
  
  // Schedule validators
  validateGetSlots,
  validateGetSlot,
  validateCreateSlot,
  validateUpdateSlot,
  validateDeleteSlot,
  validateScheduleStats,
  validateScheduleIssues,
  
  // Visitor validators
  validateGetVisitors,
  validateCreateVisitor,
  validateUpdateVisitor,
  validateDeleteVisitor,
  validateVisitorStats,
  
  // Notification validators
  validateCreateNotification,
  validateSendNotification,
  validateGetNotifications,
  validateCreateNotificationTemplate,
  validateUpdateNotificationTemplate,
  validateDeleteNotificationTemplate,
  
  // Visitor slot validators
  validateVisitorSlotBooking,
  validateVisitorSlotUpdate,
  validateVisitorSlotSearch,
  validateGetVisitorSlot,
  validateDeleteVisitorSlot,
  validateGetVisitorSlotsByVisitor,
  validateGetVisitorSlotsBySlot,
  validateCheckSlotAvailability,
  validateCancelVisitorSlot,
  validateConfirmVisitorSlot,
  validateVisitorSlotStats,
  
  // Middleware functions
  handleValidationErrors,
  sanitizeInput,
  rateLimit,
  validateRequestSize,
  validateContentType,
  validateApiVersion,
  validateMethod,
  validateHeaders,
  checkRequiredFields,
} from '../validator';
import { authenticateToken, requireStaffOrAdmin } from '../auth';

const router = Router();

// Example: Dashboard routes with validation middleware
router.get('/dashboard/stats',
  authenticateToken,
  validateApiVersion(['v1']),
  validateDashboardStats,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Dashboard stats retrieved' });
  }
);

router.get('/dashboard/upcoming-visits',
  authenticateToken,
  validateUpcomingVisits,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Upcoming visits retrieved' });
  }
);

router.get('/dashboard/recent-activity',
  authenticateToken,
  validateRecentActivity,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Recent activity retrieved' });
  }
);

router.get('/dashboard/revenue-trend',
  authenticateToken,
  validateRevenueTrend,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Revenue trend retrieved' });
  }
);

// Example: Schedule routes with validation middleware
router.get('/schedule/slots',
  authenticateToken,
  sanitizeInput,
  validateGetSlots,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Schedule slots retrieved' });
  }
);

router.get('/schedule/slots/:id',
  authenticateToken,
  ...validateGetSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Schedule slot retrieved' });
  }
);

router.post('/schedule/slots',
  authenticateToken,
  requireStaffOrAdmin,
  rateLimit(10, 60 * 1000), // 10 requests per minute
  validateRequestSize(1024 * 1024), // 1MB max
  validateContentType(['application/json']),
  sanitizeInput,
  validateCreateSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Schedule slot created' });
  }
);

router.put('/schedule/slots/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetSlot,
  sanitizeInput,
  validateUpdateSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Schedule slot updated' });
  }
);

router.delete('/schedule/slots/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Schedule slot deleted' });
  }
);

// Example: Visitor routes with validation middleware
router.get('/visitors',
  authenticateToken,
  requireStaffOrAdmin,
  sanitizeInput,
  validateGetVisitors,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitors retrieved' });
  }
);

router.post('/visitors',
  authenticateToken,
  requireStaffOrAdmin,
  rateLimit(5, 60 * 1000), // 5 requests per minute
  validateRequestSize(512 * 1024), // 512KB max
  validateContentType(['application/json']),
  sanitizeInput,
  validateCreateVisitor,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor created' });
  }
);

router.put('/visitors/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateDeleteVisitor, // This validates the ID parameter
  sanitizeInput,
  validateUpdateVisitor,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor updated' });
  }
);

router.delete('/visitors/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateDeleteVisitor,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor deleted' });
  }
);

// Example: Notification routes with validation middleware
router.get('/notifications',
  authenticateToken,
  requireStaffOrAdmin,
  sanitizeInput,
  validateGetNotifications,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Notifications retrieved' });
  }
);

router.post('/notifications',
  authenticateToken,
  requireStaffOrAdmin,
  rateLimit(20, 60 * 1000), // 20 requests per minute
  validateRequestSize(2 * 1024 * 1024), // 2MB max
  validateContentType(['application/json']),
  sanitizeInput,
  validateCreateNotification,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Notification created' });
  }
);

router.put('/notifications/:id/send',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateSendNotification,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Notification sent' });
  }
);

// Example: Visitor slot routes with validation middleware
router.post('/visitor-slots/book',
  rateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  validateRequestSize(512 * 1024), // 512KB max
  validateContentType(['application/json']),
  sanitizeInput,
  validateVisitorSlotBooking,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slot booked' });
  }
);

router.get('/visitor-slots',
  authenticateToken,
  requireStaffOrAdmin,
  sanitizeInput,
  validateVisitorSlotSearch,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slots retrieved' });
  }
);

router.get('/visitor-slots/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetVisitorSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slot retrieved' });
  }
);

router.put('/visitor-slots/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetVisitorSlot,
  sanitizeInput,
  validateVisitorSlotUpdate,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slot updated' });
  }
);

router.patch('/visitor-slots/:id/cancel',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetVisitorSlot,
  validateCancelVisitorSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slot cancelled' });
  }
);

router.delete('/visitor-slots/:id',
  authenticateToken,
  requireStaffOrAdmin,
  ...validateGetVisitorSlot,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Visitor slot deleted' });
  }
);

router.post('/visitor-slots/availability/:slotId',
  authenticateToken,
  ...validateCheckSlotAvailability,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Slot availability checked' });
  }
);

// Example: Public routes with rate limiting
router.get('/public/schedule/slots',
  rateLimit(100, 60 * 1000), // 100 requests per minute
  sanitizeInput,
  validateGetSlots,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Public schedule slots retrieved' });
  }
);

// Example: Routes with custom validation
router.post('/custom-endpoint',
  authenticateToken,
  validateMethod(['POST']),
  validateHeaders(['content-type', 'authorization']),
  checkRequiredFields(['name', 'email']),
  sanitizeInput,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Custom endpoint processed' });
  }
);

export default router;
