"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitorSlotController_1 = require("../controllers/visitorSlotController");
const validator_1 = require("../validator");
const auth_1 = require("../auth");
const router = (0, express_1.Router)();
// Public routes (no authentication required for booking)
router.post('/book', validator_1.validateVisitorSlotBooking, validator_1.handleValidationErrors, visitorSlotController_1.bookVisitorSlot);
// Protected routes (authentication required)
router.get('/stats', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, visitorSlotController_1.getVisitorSlotStats);
router.post('/availability/:slotId', auth_1.authenticateToken, ...validator_1.validateCheckSlotAvailability, validator_1.handleValidationErrors, visitorSlotController_1.checkAvailability);
router.get('/visitor/:visitorId', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlotsByVisitor, validator_1.handleValidationErrors, visitorSlotController_1.getVisitorSlotsByVisitor);
router.get('/slot/:slotId', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlotsBySlot, validator_1.handleValidationErrors, visitorSlotController_1.getVisitorSlotsBySlot);
router.get('/', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, validator_1.validateVisitorSlotSearch, validator_1.handleValidationErrors, visitorSlotController_1.getAllVisitorSlots);
router.get('/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.handleValidationErrors, visitorSlotController_1.getVisitorSlot);
router.put('/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.validateVisitorSlotUpdate, validator_1.handleValidationErrors, visitorSlotController_1.updateVisitorSlotBooking);
router.patch('/:id/cancel', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.handleValidationErrors, visitorSlotController_1.cancelVisitorSlotBooking);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireStaffOrAdmin, ...validator_1.validateGetVisitorSlot, validator_1.handleValidationErrors, visitorSlotController_1.deleteVisitorSlotBooking);
exports.default = router;
//# sourceMappingURL=visitorSlotRoutes.js.map