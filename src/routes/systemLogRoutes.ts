import { Router } from 'express';
import { SystemLogController } from '../controllers/systemLogController';
import { authenticateToken, requireAdmin } from '../auth';
import {
  validateSystemLogQuery,
  validateSystemLogId,
  validateSystemLogStats,
  validateCleanupRequest,
  handleValidationErrors
} from '../validator';

const router = Router();
const systemLogController = new SystemLogController();

// All system log routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

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
router.get('/', 
  validateSystemLogQuery, 
  handleValidationErrors, 
  systemLogController.getSystemLogs.bind(systemLogController)
);

/**
 * GET /api/v1/system-logs/:id
 * Get a specific system log by ID
 */
router.get('/:id', 
  validateSystemLogId, 
  handleValidationErrors, 
  systemLogController.getSystemLogById.bind(systemLogController)
);

/**
 * GET /api/v1/system-logs/stats/overview
 * Get system log statistics and overview
 * Query parameters:
 * - dateFrom: string (ISO date)
 * - dateTo: string (ISO date)
 */
router.get('/stats/overview', 
  validateSystemLogStats, 
  handleValidationErrors, 
  systemLogController.getSystemLogStats.bind(systemLogController)
);

/**
 * DELETE /api/v1/system-logs/cleanup
 * Delete old system logs (cleanup)
 * Body:
 * - days: number (delete logs older than X days, default 90)
 */
router.delete('/cleanup', 
  validateCleanupRequest, 
  handleValidationErrors, 
  systemLogController.deleteOldLogs.bind(systemLogController)
);

export default router;
