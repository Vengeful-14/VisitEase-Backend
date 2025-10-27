import { Router } from 'express';
import {
  bookVisitorSlot,
  getVisitorSlot,
  getAllVisitorSlots,
  updateVisitorSlotBooking,
  deleteVisitorSlotBooking,
  cancelVisitorSlotBooking,
  getVisitorSlotsByVisitor,
  getVisitorSlotsBySlot,
  checkAvailability,
  getVisitorSlotStats,
} from '../controllers/visitorSlotController';
import {
  validateVisitorSlotBooking,
  validateVisitorSlotUpdate,
  validateVisitorSlotSearch,
  validateGetVisitorSlot,
  validateGetVisitorSlotsByVisitor,
  validateGetVisitorSlotsBySlot,
  validateCheckSlotAvailability,
  handleValidationErrors,
} from '../validator';
import { authenticateToken, requireStaffOrAdmin } from '../auth';

const router = Router();

// Public routes (no authentication required for booking)
router.post('/book', validateVisitorSlotBooking, handleValidationErrors, bookVisitorSlot);

// Protected routes (authentication required)
router.get('/stats', authenticateToken, requireStaffOrAdmin, getVisitorSlotStats);
router.post('/availability/:slotId', authenticateToken, ...validateCheckSlotAvailability, handleValidationErrors, checkAvailability);
router.get('/visitor/:visitorId', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlotsByVisitor, handleValidationErrors, getVisitorSlotsByVisitor);
router.get('/slot/:slotId', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlotsBySlot, handleValidationErrors, getVisitorSlotsBySlot);
router.get('/', authenticateToken, requireStaffOrAdmin, validateVisitorSlotSearch, handleValidationErrors, getAllVisitorSlots);
router.get('/:id', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlot, handleValidationErrors, getVisitorSlot);
router.put('/:id', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlot, validateVisitorSlotUpdate, handleValidationErrors, updateVisitorSlotBooking);
router.patch('/:id/cancel', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlot, handleValidationErrors, cancelVisitorSlotBooking);
router.delete('/:id', authenticateToken, requireStaffOrAdmin, ...validateGetVisitorSlot, handleValidationErrors, deleteVisitorSlotBooking);

export default router;
