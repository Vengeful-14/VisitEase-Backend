import { Request, Response } from 'express';
import { PrismaClient, LogLevel } from '../generated/prisma';
import { 
  ApiResponse, 
  ApiErrorResponse, 
  ApiSuccessResponse 
} from '../type';

export interface SystemLogFilters {
  level?: LogLevel;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  action?: string;
  skip?: number;
  limit?: number;
}

export interface SystemLogResponse {
  id: string;
  level: LogLevel;
  message: string;
  originalMessage: string;
  context: any;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export class SystemLogController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get system logs with filtering and pagination
   */
  async getSystemLogs(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const {
        level,
        userId,
        dateFrom,
        dateTo,
        action,
        skip = 0,
        limit = 50
      } = req.query;

      // Build where clause
      const where: any = {};

      if (level) {
        where.level = level;
      }

      if (userId) {
        where.userId = userId;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      if (action) {
        where.context = {
          path: ['action'],
          equals: action
        };
      }

      // Get logs with pagination
      const [logs, total] = await Promise.all([
        this.prisma.systemLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip as string),
          take: Math.min(parseInt(limit as string), 100), // Max 100 per request
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        this.prisma.systemLog.count({ where })
      ]);

      // Transform logs for response with enhanced readability
      const transformedLogs: SystemLogResponse[] = logs.map(log => {
        const context = log.context as any;
        const user = log.user;
        
        // Create readable message with user info
        let readableMessage = log.message;
        if (user) {
          readableMessage = `[${user.name} (${user.role})] ${log.message}`;
        }
        
        // Add formatted date
        const formattedDate = log.createdAt.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        return {
          id: log.id,
          level: log.level,
          message: readableMessage,
          originalMessage: log.message,
          context: {
            ...context,
            // Add readable context information
            userInfo: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            } : null,
            formattedDate: formattedDate,
            status: context?.status || 'completed',
            action: context?.action || 'unknown'
          },
          userId: log.userId,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
          // Add user information for better readability
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null
        };
      });

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'System logs retrieved successfully',
        data: {
          logs: transformedLogs,
          pagination: {
            total,
            skip: parseInt(skip as string),
            limit: parseInt(limit as string),
            hasMore: (parseInt(skip as string) + parseInt(limit as string)) < total
          }
        }
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Error getting system logs:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve system logs',
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get a specific system log by ID
   */
  async getSystemLogById(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;

      const log = await this.prisma.systemLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      if (!log) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'System log not found',
        };
        res.status(404).json(errorResponse);
        return;
      }

      const context = log.context as any;
      const user = log.user;
      
      // Create readable message with user info
      let readableMessage = log.message;
      if (user) {
        readableMessage = `[${user.name} (${user.role})] ${log.message}`;
      }
      
      // Add formatted date
      const formattedDate = log.createdAt.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const logResponse: SystemLogResponse = {
        id: log.id,
        level: log.level,
        message: readableMessage,
        originalMessage: log.message,
        context: {
          ...context,
          userInfo: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null,
          formattedDate: formattedDate,
          status: context?.status || 'completed',
          action: context?.action || 'unknown'
        },
        userId: log.userId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      };

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'System log retrieved successfully',
        data: logResponse
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Error getting system log:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve system log',
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get system log statistics
   */
  async getSystemLogStats(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query;

      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom as string);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo as string);
        }
      }

      const [
        totalLogs,
        logsByLevel,
        recentLogs,
        topActions
      ] = await Promise.all([
        // Total logs
        this.prisma.systemLog.count({ where }),
        
        // Logs by level
        this.prisma.systemLog.groupBy({
          by: ['level'],
          where,
          _count: { level: true }
        }),
        
        // Recent logs (last 24 hours)
        this.prisma.systemLog.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Top actions (from context)
        this.prisma.systemLog.findMany({
          where: {
            ...where,
            context: {
              path: ['action'],
              not: null
            }
          },
          select: {
            context: true
          },
          take: 100
        })
      ]);

      // Process top actions
      const actionCounts: { [key: string]: number } = {};
      topActions.forEach(log => {
        const context = log.context as any;
        const action = context?.action;
        if (action) {
          actionCounts[action] = (actionCounts[action] || 0) + 1;
        }
      });

      const topActionsList = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'System log statistics retrieved successfully',
        data: {
          totalLogs,
          logsByLevel: logsByLevel.map(item => ({
            level: item.level,
            count: item._count.level
          })),
          recentLogs,
          topActions: topActionsList
        }
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Error getting system log statistics:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve system log statistics',
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Delete old system logs (cleanup)
   */
  async deleteOldLogs(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { days = 90 } = req.body; // Default: delete logs older than 90 days
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

      const result = await this.prisma.systemLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: `Deleted ${result.count} old system logs`,
        data: {
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString()
        }
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Error deleting old logs:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to delete old system logs',
      };
      res.status(500).json(errorResponse);
    }
  }
}
