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
      const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const summary = await this.reportsService.getSummary(days, month, year);

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
      const { days, dateFrom, dateTo, month, year } = req.query;
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      // If month and year are provided, calculate dateFrom and dateTo
      if (month && year) {
        const monthNum = parseInt(month as string, 10);
        const yearNum = parseInt(year as string, 10);
        const dateFromObj = new Date(yearNum, monthNum - 1, 1);
        const dateToObj = new Date(yearNum, monthNum, 0);
        dateToObj.setHours(23, 59, 59, 999);
        startDate = dateFromObj.toISOString();
        endDate = dateToObj.toISOString();
      } else {
        startDate = dateFrom as string | undefined;
        endDate = dateTo as string | undefined;
      }
      
      const parsedDays = days ? parseInt(days as string) : undefined;
      const daily = await this.reportsService.getDaily({
        days: parsedDays,
        dateFrom: startDate,
        dateTo: endDate,
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
      const { days, dateFrom, dateTo, month, year } = req.query;
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      // If month and year are provided, calculate dateFrom and dateTo
      if (month && year) {
        const monthNum = parseInt(month as string, 10);
        const yearNum = parseInt(year as string, 10);
        const dateFromObj = new Date(yearNum, monthNum - 1, 1);
        const dateToObj = new Date(yearNum, monthNum, 0);
        dateToObj.setHours(23, 59, 59, 999);
        startDate = dateFromObj.toISOString();
        endDate = dateToObj.toISOString();
      } else {
        startDate = dateFrom as string | undefined;
        endDate = dateTo as string | undefined;
      }
      
      const parsedDays = days ? parseInt(days as string) : undefined;
      const result = await this.reportsService.getBookingTrend({
        days: parsedDays,
        dateFrom: startDate,
        dateTo: endDate,
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


