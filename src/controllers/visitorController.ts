import { Request, Response } from 'express';
import { VisitorService } from '../services/visitorService';
import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '../type';

export class VisitorController {
  private visitorService: VisitorService;

  constructor() {
    this.visitorService = new VisitorService();
  }

  async getVisitors(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const filters = {
        search: req.query.search as string,
        type: req.query.type as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.visitorService.getVisitors(filters);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitors retrieved successfully',
        data: result
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Get visitors error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve visitors'
      };
      res.status(500).json(errorResponse);
    }
  }

  async getVisitor(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const visitor = await this.visitorService.getVisitorById(id);
      
      if (!visitor) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Visitor not found'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitor retrieved successfully',
        data: visitor
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Get visitor error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve visitor'
      };
      res.status(500).json(errorResponse);
    }
  }

  async createVisitor(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const visitor = await this.visitorService.createVisitor(req.body);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitor created successfully',
        data: visitor
      };

      res.status(201).json(successResponse);
    } catch (error) {
      console.error('Create visitor error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create visitor'
      };
      res.status(400).json(errorResponse);
    }
  }

  async updateVisitor(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const visitor = await this.visitorService.updateVisitor(id, req.body);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitor updated successfully',
        data: visitor
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Update visitor error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update visitor'
      };
      res.status(400).json(errorResponse);
    }
  }

  async deleteVisitor(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      await this.visitorService.deleteVisitor(id);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitor deleted successfully'
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Delete visitor error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete visitor'
      };
      res.status(400).json(errorResponse);
    }
  }

  async getStats(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      // Parse month and year from query parameters (similar to dashboard and schedule)
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      
      const stats = await this.visitorService.getVisitorStats(month, year);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Visitor statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Visitor stats error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve visitor statistics'
      };
      res.status(500).json(errorResponse);
    }
  }
}