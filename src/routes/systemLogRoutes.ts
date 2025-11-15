import { Router } from 'express';
import { SystemLogController } from '../controllers/systemLogController';
import { authenticateToken, requireAdmin, requireStaffOrAdmin } from '../auth';
import {
  validateSystemLogQuery,
  validateSystemLogId,
  validateSystemLogStats,
  validateCleanupRequest,
  handleValidationErrors
} from '../validator';

const router = Router();
const systemLogController = new SystemLogController();

// All system log routes require authentication
router.use(authenticateToken);

/**
 * GET /api/v1/system-logs
 * Get system logs with filtering and pagination
 * Access: Staff and Admin
 * Query parameters:
 * - level: LogLevel (debug, info, warn, error, fatal)
 * - userId: string (filter by user ID)
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 * - action: string (filter by action type)
 * - skip: number (pagination offset)
 * - limit: number (pagination limit, max 100)
 */
router.get('/', 
  requireStaffOrAdmin,
  validateSystemLogQuery, 
  handleValidationErrors, 
  systemLogController.getSystemLogs.bind(systemLogController)
);

/**
 * GET /api/v1/system-logs/stats/overview
 * Get system log statistics and overview
 * Access: Staff and Admin
 * Query parameters:
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 */
router.get('/stats/overview', 
  requireStaffOrAdmin,
  validateSystemLogStats, 
  handleValidationErrors, 
  systemLogController.getSystemLogStats.bind(systemLogController)
);

/**
 * GET /api/v1/system-logs/:id
 * Get a specific system log by ID
 * Access: Staff and Admin
 */
router.get('/:id', 
  requireStaffOrAdmin,
  validateSystemLogId, 
  handleValidationErrors, 
  systemLogController.getSystemLogById.bind(systemLogController)
);

/**
 * DELETE /api/v1/system-logs/cleanup
 * Delete old system logs (cleanup)
 * Access: Admin only
 * Body:
 * - days: number (delete logs older than X days, default 90)
 */
router.delete('/cleanup', 
  requireAdmin,
  validateCleanupRequest, 
  handleValidationErrors, 
  systemLogController.deleteOldLogs.bind(systemLogController)
);

export default router;
