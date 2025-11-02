import { Router } from 'express';
import { authenticateToken } from '../auth/middleware';
import { ReportsController } from '../controllers/reportsController';

const router = Router();
const reportsController = new ReportsController();

// All reports routes require authentication
router.use(authenticateToken);

// GET /api/v1/reports/summary?days=7 - Summary stats for reports page
router.get('/summary', reportsController.getSummary.bind(reportsController));

// GET /api/v1/reports/daily?days=7 or ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD - Daily breakdown
router.get('/daily', reportsController.getDaily.bind(reportsController));

// GET /api/v1/reports/booking-trend?days=7 - Confirmed/Cancelled trend with comparison
router.get('/booking-trend', reportsController.getBookingTrend.bind(reportsController));

export default router;


