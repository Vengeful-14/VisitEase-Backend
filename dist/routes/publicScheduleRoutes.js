"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduleController_1 = require("../controllers/scheduleController");
const router = (0, express_1.Router)();
const scheduleController = new scheduleController_1.ScheduleController();
// Public routes - no authentication required
// GET /api/v1/public/schedule/available-slots - Get only available slots for booking
router.get('/available-slots', scheduleController.getPublicAvailableSlots.bind(scheduleController));
// GET /api/v1/public/schedule/slots/:id - Get specific available slot by ID (read-only)
router.get('/slots/:id', scheduleController.getPublicSlot.bind(scheduleController));
exports.default = router;
//# sourceMappingURL=publicScheduleRoutes.js.map