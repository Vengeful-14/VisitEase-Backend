import { Router } from 'express';
import { VisitorController } from '../controllers/visitorController';
import { authenticateToken, requireStaffOrAdmin } from '../auth/middleware';

const router = Router();
const visitorController = new VisitorController();

// All visitor routes require authentication
router.use(authenticateToken);

// GET /api/v1/visitors - Get visitors with filtering
router.get('/', visitorController.getVisitors.bind(visitorController));

// GET /api/v1/visitors/:id - Get specific visitor
router.get('/:id', visitorController.getVisitor.bind(visitorController));

// GET /api/v1/visitors/statistics - Get visitor statistics
router.get('/statistics', visitorController.getStats.bind(visitorController));

// POST /api/v1/visitors - Create new visitor (Staff/Admin only)
router.post('/', requireStaffOrAdmin, visitorController.createVisitor.bind(visitorController));

// PUT /api/v1/visitors/:id - Update visitor (Staff/Admin only)
router.put('/:id', requireStaffOrAdmin, visitorController.updateVisitor.bind(visitorController));

// DELETE /api/v1/visitors/:id - Delete visitor (Staff/Admin only)
router.delete('/:id', requireStaffOrAdmin, visitorController.deleteVisitor.bind(visitorController));

export default router;