import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '../type';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  async getBookings(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const filters = {
        slotId: req.query.slotId as string,
        visitorId: req.query.visitorId as string,
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.bookingService.getBookings(filters);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Bookings retrieved successfully',
        data: result
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Get bookings error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve bookings'
      };
      res.status(500).json(errorResponse);
    }
  }

  async getBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(id);
      
      if (!booking) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Booking not found'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking retrieved successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Get booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Failed to retrieve booking'
      };
      res.status(500).json(errorResponse);
    }
  }

  async createBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = (req as any).user?.userId; // From authentication middleware
      if (!userId) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'User authentication required'
        };
        res.status(401).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.createBooking(req.body, userId);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking created successfully',
        data: booking
      };

      res.status(201).json(successResponse);
    } catch (error) {
      console.error('Create booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create booking'
      };
      res.status(400).json(errorResponse);
    }
  }

  async updateBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'User authentication required'
        };
        res.status(401).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.updateBooking(id, req.body, userId);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking updated successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Update booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update booking'
      };
      res.status(400).json(errorResponse);
    }
  }

  async confirmBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'User authentication required'
        };
        res.status(401).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.confirmBooking(id, userId);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Confirm booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to confirm booking'
      };
      res.status(400).json(errorResponse);
    }
  }

  async cancelBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'User authentication required'
        };
        res.status(401).json(errorResponse);
        return;
      }

      if (!reason) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Cancellation reason is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.cancelBooking(id, reason, userId);
      
      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Cancel booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel booking'
      };
      res.status(400).json(errorResponse);
    }
  }
}