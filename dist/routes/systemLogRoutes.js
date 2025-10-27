"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemLogController_1 = require("../controllers/systemLogController");
const auth_1 = require("../auth");
const validator_1 = require("../validator");
const router = (0, express_1.Router)();
const systemLogController = new systemLogController_1.SystemLogController();
// All system log routes require authentication and admin privileges
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
/**
 * GET /api/v1/system-logs
 * Get system logs with filtering and pagination
 * Query parameters:
 * - level: LogLevel (debug, info, warn, error, fatal)
 * - userId: string (filter by user ID)
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 * - action: string (filter by action type)
 * - skip: number (pagination offset)
 * - limit: number (pagination limit, max 100)
 */
router.get('/', validator_1.validateSystemLogQuery, validator_1.handleValidationErrors, systemLogController.getSystemLogs.bind(systemLogController));
/**
 * GET /api/v1/system-logs/:id
 * Get a specific system log by ID
 */
router.get('/:id', validator_1.validateSystemLogId, validator_1.handleValidationErrors, systemLogController.getSystemLogById.bind(systemLogController));
/**
 * GET /api/v1/system-logs/stats/overview
 * Get system log statistics and overview
 * Query parameters:
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 */
router.get('/stats/overview', validator_1.validateSystemLogStats, validator_1.handleValidationErrors, systemLogController.getSystemLogStats.bind(systemLogController));
/**
 * DELETE /api/v1/system-logs/cleanup
 * Delete old system logs (cleanup)
 * Body:
 * - days: number (delete logs older than X days, default 90)
 */
router.delete('/cleanup', validator_1.validateCleanupRequest, validator_1.handleValidationErrors, systemLogController.deleteOldLogs.bind(systemLogController));
exports.default = router;
//# sourceMappingURL=systemLogRoutes.js.map