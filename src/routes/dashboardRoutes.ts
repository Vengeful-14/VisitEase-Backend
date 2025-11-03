import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../auth/middleware';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/v1/dashboard/stats - Dashboard statistics
router.get('/stats', dashboardController.getStats.bind(dashboardController));

// GET /api/v1/dashboard/upcoming-visits - Upcoming visits
router.get('/upcoming-visits', dashboardController.getUpcomingVisits.bind(dashboardController));

// GET /api/v1/dashboard/recent-activity - Recent activity
router.get('/recent-activity', dashboardController.getRecentActivity.bind(dashboardController));

// GET /api/v1/dashboard/revenue-trend - Revenue trend
router.get('/revenue-trend', dashboardController.getRevenueTrend.bind(dashboardController));

export default router;
