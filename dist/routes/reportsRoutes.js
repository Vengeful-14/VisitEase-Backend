"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../auth/middleware");
const reportsController_1 = require("../controllers/reportsController");
const router = (0, express_1.Router)();
const reportsController = new reportsController_1.ReportsController();
// All reports routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/reports/summary?days=7 - Summary stats for reports page
router.get('/summary', reportsController.getSummary.bind(reportsController));
// GET /api/v1/reports/daily?days=7 or ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD - Daily breakdown
router.get('/daily', reportsController.getDaily.bind(reportsController));
// GET /api/v1/reports/booking-trend?days=7 - Confirmed/Cancelled trend with comparison
router.get('/booking-trend', reportsController.getBookingTrend.bind(reportsController));
exports.default = router;
//# sourceMappingURL=reportsRoutes.js.map