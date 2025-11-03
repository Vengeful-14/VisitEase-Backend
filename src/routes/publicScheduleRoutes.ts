import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';

const router = Router();
const scheduleController = new ScheduleController();

// Public routes - no authentication required
// GET /api/v1/public/schedule/available-slots - Get only available slots for booking
router.get('/available-slots', scheduleController.getPublicAvailableSlots.bind(scheduleController));

// GET /api/v1/public/schedule/slots/:id - Get specific available slot by ID (read-only)
router.get('/slots/:id', scheduleController.getPublicSlot.bind(scheduleController));

export default router;

