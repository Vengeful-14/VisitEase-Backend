"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
const dashboardController = new dashboardController_1.DashboardController();
// All dashboard routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/dashboard/stats - Dashboard statistics
router.get('/stats', dashboardController.getStats.bind(dashboardController));
// GET /api/v1/dashboard/upcoming-visits - Upcoming visits
router.get('/upcoming-visits', dashboardController.getUpcomingVisits.bind(dashboardController));
// GET /api/v1/dashboard/recent-activity - Recent activity
router.get('/recent-activity', dashboardController.getRecentActivity.bind(dashboardController));
// GET /api/v1/dashboard/revenue-trend - Revenue trend
router.get('/revenue-trend', dashboardController.getRevenueTrend.bind(dashboardController));
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map