import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';
import { authenticateToken, requireStaffOrAdmin } from '../auth/middleware';
import { validateUpdateSlot } from '../validator/scheduleValidator';
import { handleValidationErrors } from '../validator/middleware';

const router = Router();
const scheduleController = new ScheduleController();

// All schedule routes require authentication
router.use(authenticateToken);

// GET /api/v1/schedule/slots - Get schedule slots with filtering
router.get('/slots', scheduleController.getSlots.bind(scheduleController));

// GET /api/v1/schedule/slots/:id - Get specific slot
router.get('/slots/:id', scheduleController.getSlot.bind(scheduleController));

// GET /api/v1/schedule/statistics - Get schedule statistics
router.get('/statistics', scheduleController.getStats.bind(scheduleController));

// GET /api/v1/schedule/issues - Get schedule issues and conflicts
router.get('/issues', scheduleController.getIssues.bind(scheduleController));

// POST /api/v1/schedule/slots - Create new slot (Staff/Admin only)
router.post('/slots', requireStaffOrAdmin, scheduleController.createSlot.bind(scheduleController));

// PUT /api/v1/schedule/slots/:id - Update slot (Staff/Admin only)
router.put('/slots/:id', requireStaffOrAdmin, scheduleController.updateSlot.bind(scheduleController));

// DELETE /api/v1/schedule/slots/:id - Delete slot (Staff/Admin only)
router.delete('/slots/:id', requireStaffOrAdmin, scheduleController.deleteSlot.bind(scheduleController));

export default router;
