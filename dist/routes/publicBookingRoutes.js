"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const router = (0, express_1.Router)();
const bookingController = new bookingController_1.BookingController();
// Public routes - no authentication required
// GET /api/v1/public/booking/availability/:slotId - Check slot availability for a specific group size
router.get('/availability/:slotId', bookingController.checkPublicAvailability.bind(bookingController));
// POST /api/v1/public/booking - Create booking (public, no auth required)
router.post('/', bookingController.createPublicBooking.bind(bookingController));
// GET /api/v1/public/booking/track - Track booking by email and token
router.get('/track', bookingController.trackBooking.bind(bookingController));
// PUT /api/v1/public/booking/cancel - Cancel booking by email and token (public, no auth required)
router.put('/cancel', bookingController.cancelPublicBooking.bind(bookingController));
exports.default = router;
//# sourceMappingURL=publicBookingRoutes.js.map