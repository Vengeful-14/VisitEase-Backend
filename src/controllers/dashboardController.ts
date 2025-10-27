import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '../type';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getStats(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve dashboard statistics'
      };
      res.status(500).json(errorResponse);
    }
  }

  async getUpcomingVisits(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const visits = await this.dashboardService.getUpcomingVisits(limit);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Upcoming visits retrieved successfully',
        data: visits
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Upcoming visits error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve upcoming visits'
      };
      res.status(500).json(errorResponse);
    }
  }

  async getRecentActivity(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await this.dashboardService.getRecentActivity(limit);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Recent activity retrieved successfully',
        data: activity
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Recent activity error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve recent activity'
      };
      res.status(500).json(errorResponse);
    }
  }

  async getRevenueTrend(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const trend = await this.dashboardService.getRevenueTrend(days);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Revenue trend retrieved successfully',
        data: trend
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Revenue trend error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve revenue trend'
      };
      res.status(500).json(errorResponse);
    }
  }
}
