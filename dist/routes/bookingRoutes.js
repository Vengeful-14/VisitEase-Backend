"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
const bookingController = new bookingController_1.BookingController();
// All booking routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/bookings - Get bookings with filtering
router.get('/', bookingController.getBookings.bind(bookingController));
// GET /api/v1/bookings/:id - Get specific booking
router.get('/:id', bookingController.getBooking.bind(bookingController));
// POST /api/v1/bookings - Create new booking (Staff/Admin only)
router.post('/', middleware_1.requireStaffOrAdmin, bookingController.createBooking.bind(bookingController));
// PUT /api/v1/bookings/:id - Update booking (Staff/Admin only)
router.put('/:id', middleware_1.requireStaffOrAdmin, bookingController.updateBooking.bind(bookingController));
// PUT /api/v1/bookings/:id/confirm - Confirm booking (Staff/Admin only)
router.put('/:id/confirm', middleware_1.requireStaffOrAdmin, bookingController.confirmBooking.bind(bookingController));
// PUT /api/v1/bookings/:id/cancel - Cancel booking (Staff/Admin only)
router.put('/:id/cancel', middleware_1.requireStaffOrAdmin, bookingController.cancelBooking.bind(bookingController));
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map