"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduleController_1 = require("../controllers/scheduleController");
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
const scheduleController = new scheduleController_1.ScheduleController();
// All schedule routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/schedule/slots - Get schedule slots with filtering
router.get('/slots', scheduleController.getSlots.bind(scheduleController));
// GET /api/v1/schedule/slots/:id - Get specific slot
router.get('/slots/:id', scheduleController.getSlot.bind(scheduleController));
// GET /api/v1/schedule/statistics - Get schedule statistics
router.get('/statistics', scheduleController.getStats.bind(scheduleController));
// GET /api/v1/schedule/issues - Get schedule issues and conflicts
router.get('/issues', scheduleController.getIssues.bind(scheduleController));
// POST /api/v1/schedule/slots - Create new slot (Staff/Admin only)
router.post('/slots', middleware_1.requireStaffOrAdmin, scheduleController.createSlot.bind(scheduleController));
// PUT /api/v1/schedule/slots/:id - Update slot (Staff/Admin only)
router.put('/slots/:id', middleware_1.requireStaffOrAdmin, scheduleController.updateSlot.bind(scheduleController));
// DELETE /api/v1/schedule/slots/:id - Delete slot (Staff/Admin only)
router.delete('/slots/:id', middleware_1.requireStaffOrAdmin, scheduleController.deleteSlot.bind(scheduleController));
exports.default = router;
//# sourceMappingURL=scheduleRoutes.js.map