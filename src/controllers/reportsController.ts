import { Request, Response } from 'express';
import { ReportsService } from '../services/reportsService';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../type';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  async getSummary(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const summary = await this.reportsService.getSummary(days);

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Report summary retrieved successfully',
        data: summary,
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Reports summary error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve report summary',
      };
      res.status(500).json(errorResponse);
    }
  }

  async getDaily(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { days, dateFrom, dateTo } = req.query;
      const parsedDays = days ? parseInt(days as string) : undefined;
      const daily = await this.reportsService.getDaily({
        days: parsedDays,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      });

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Daily report retrieved successfully',
        data: daily,
      };
      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Reports daily error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve daily report',
      };
      res.status(500).json(errorResponse);
    }
  }

  async getBookingTrend(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { days, dateFrom, dateTo } = req.query;
      const parsedDays = days ? parseInt(days as string) : undefined;
      const result = await this.reportsService.getBookingTrend({
        days: parsedDays,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      });

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking trend retrieved successfully',
        data: result,
      };
      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Reports booking trend error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve booking trend',
      };
      res.status(500).json(errorResponse);
    }
  }
}

export default ReportsController;


