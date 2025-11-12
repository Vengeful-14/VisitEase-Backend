import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();
const bookingController = new BookingController();

// Public routes - no authentication required
// GET /api/v1/public/booking/availability/:slotId - Check slot availability for a specific group size
router.get('/availability/:slotId', bookingController.checkPublicAvailability.bind(bookingController));

// POST /api/v1/public/booking - Create booking (public, no auth required)
router.post('/', bookingController.createPublicBooking.bind(bookingController));

// GET /api/v1/public/booking/track - Track booking by email and token
router.get('/track', bookingController.trackBooking.bind(bookingController));

// PUT /api/v1/public/booking/cancel - Cancel booking by email and token (public, no auth required)
router.put('/cancel', bookingController.cancelPublicBooking.bind(bookingController));

// PUT /api/v1/public/booking/update - Update booking by email and token (public, no auth required)
router.put('/update', bookingController.updatePublicBooking.bind(bookingController));

export default router;

