import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { authenticateToken, requireStaffOrAdmin } from '../auth/middleware';

const router = Router();
const bookingController = new BookingController();

// All booking routes require authentication
router.use(authenticateToken);

// GET /api/v1/bookings - Get bookings with filtering
router.get('/', bookingController.getBookings.bind(bookingController));

// GET /api/v1/bookings/:id - Get specific booking
router.get('/:id', bookingController.getBooking.bind(bookingController));

// POST /api/v1/bookings - Create new booking (Staff/Admin only)
router.post('/', requireStaffOrAdmin, bookingController.createBooking.bind(bookingController));

// PUT /api/v1/bookings/:id - Update booking (Staff/Admin only)
router.put('/:id', requireStaffOrAdmin, bookingController.updateBooking.bind(bookingController));

// PUT /api/v1/bookings/:id/confirm - Confirm booking (Staff/Admin only)
router.put('/:id/confirm', requireStaffOrAdmin, bookingController.confirmBooking.bind(bookingController));

// PUT /api/v1/bookings/:id/cancel - Cancel booking (Staff/Admin only)
router.put('/:id/cancel', requireStaffOrAdmin, bookingController.cancelBooking.bind(bookingController));

export default router;