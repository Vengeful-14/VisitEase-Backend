"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../validator");
const auth_1 = require("../auth");
const router = (0, express_1.Router)();
// Example: Dashboard routes with validation middleware
router.get('/dashboard/stats', auth_1.authenticateToken, (0, validator_1.validateApiVersion)(['v1']), validator_1.validateDashboardStats, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Dashboard stats retrieved' });
});
router.get('/dashboard/upcoming-visits', auth_1.authenticateToken, validator_1.validateUpcomingVisits, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Upcoming visits retrieved' });
});
router.get('/dashboard/recent-activity', auth_1.authenticateToken, validator_1.validateRecentActivity, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Recent activity retrieved' });
});
router.get('/dashboard/revenue-trend', auth_1.authenticateToken, validator_1.validateRevenueTrend, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Revenue trend retrieved' });
});
// Example: Schedule routes with validation middleware
router.get('/schedule/slots', auth_1.authenticateToken, validator_1.sanitizeInput, validator_1.validateGetSlots, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Schedule slots retrieved' });
});
router.get('/schedule/slots/:id', auth_1.authenticateToken, ...validator_1.validateGetSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Schedule slot retrieved' });
});
router.post('/schedule/slots', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, (0, validator_1.rateLimit)(10, 60 * 1000), // 10 requests per minute
(0, validator_1.validateRequestSize)(1024 * 1024), // 1MB max
(0, validator_1.validateContentType)(['application/json']), validator_1.sanitizeInput, validator_1.validateCreateSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Schedule slot created' });
});
router.put('/schedule/slots/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetSlot, validator_1.sanitizeInput, validator_1.validateUpdateSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Schedule slot updated' });
});
router.delete('/schedule/slots/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Schedule slot deleted' });
});
// Example: Visitor routes with validation middleware
router.get('/visitors', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, validator_1.sanitizeInput, validator_1.validateGetVisitors, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitors retrieved' });
});
router.post('/visitors', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, (0, validator_1.rateLimit)(5, 60 * 1000), // 5 requests per minute
(0, validator_1.validateRequestSize)(512 * 1024), // 512KB max
(0, validator_1.validateContentType)(['application/json']), validator_1.sanitizeInput, validator_1.validateCreateVisitor, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor created' });
});
router.put('/visitors/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateDeleteVisitor, // This validates the ID parameter
validator_1.sanitizeInput, validator_1.validateUpdateVisitor, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor updated' });
});
router.delete('/visitors/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateDeleteVisitor, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor deleted' });
});
// Example: Notification routes with validation middleware
router.get('/notifications', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, validator_1.sanitizeInput, validator_1.validateGetNotifications, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Notifications retrieved' });
});
router.post('/notifications', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, (0, validator_1.rateLimit)(20, 60 * 1000), // 20 requests per minute
(0, validator_1.validateRequestSize)(2 * 1024 * 1024), // 2MB max
(0, validator_1.validateContentType)(['application/json']), validator_1.sanitizeInput, validator_1.validateCreateNotification, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Notification created' });
});
router.put('/notifications/:id/send', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateSendNotification, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Notification sent' });
});
// Example: Visitor slot routes with validation middleware
router.post('/visitor-slots/book', (0, validator_1.rateLimit)(5, 15 * 60 * 1000), // 5 requests per 15 minutes
(0, validator_1.validateRequestSize)(512 * 1024), // 512KB max
(0, validator_1.validateContentType)(['application/json']), validator_1.sanitizeInput, validator_1.validateVisitorSlotBooking, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slot booked' });
});
router.get('/visitor-slots', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, validator_1.sanitizeInput, validator_1.validateVisitorSlotSearch, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slots retrieved' });
});
router.get('/visitor-slots/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slot retrieved' });
});
router.put('/visitor-slots/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.sanitizeInput, validator_1.validateVisitorSlotUpdate, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slot updated' });
});
router.patch('/visitor-slots/:id/cancel', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.validateCancelVisitorSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slot cancelled' });
});
router.delete('/visitor-slots/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Visitor slot deleted' });
});
router.post('/visitor-slots/availability/:slotId', auth_1.authenticateToken, ...validator_1.validateCheckSlotAvailability, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Slot availability checked' });
});
// Example: Public routes with rate limiting
router.get('/public/schedule/slots', (0, validator_1.rateLimit)(100, 60 * 1000), // 100 requests per minute
validator_1.sanitizeInput, validator_1.validateGetSlots, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Public schedule slots retrieved' });
});
// Example: Routes with custom validation
router.post('/custom-endpoint', auth_1.authenticateToken, (0, validator_1.validateMethod)(['POST']), (0, validator_1.validateHeaders)(['content-type', 'authorization']), (0, validator_1.checkRequiredFields)(['name', 'email']), validator_1.sanitizeInput, validator_1.handleValidationErrors, async (req, res) => {
    res.json({ success: true, message: 'Custom endpoint processed' });
});
exports.default = router;
//# sourceMappingURL=exampleRoutes.js.map