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

  // Public method - no authentication required
  async checkPublicAvailability(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { slotId } = req.params;
      const groupSize = parseInt(req.query.groupSize as string) || 1;

      if (!slotId) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Slot ID is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (groupSize < 1) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Group size must be at least 1'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Get slot and calculate actual booked capacity
      const slot = await this.bookingService.getSlotForAvailability(slotId);
      
      if (!slot) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Slot not found'
        };
        res.status(404).json(errorResponse);
        return;
      }

      // Calculate actual booked capacity from bookings (not cached bookedCount)
      const bookings = await this.bookingService.getBookingsForSlot(slotId);
      const totalBookedCapacity = bookings.reduce((sum, booking) => {
        // Only count confirmed and tentative bookings
        if (booking.status === 'confirmed' || booking.status === 'tentative') {
          return sum + (booking.groupSize || 0);
        }
        return sum;
      }, 0);

      const availableCapacity = slot.capacity - totalBookedCapacity;
      // Allow booking if there's available capacity and slot is not cancelled or expired
      // Note: Status might be 'booked' but still have capacity if status wasn't updated correctly
      const isSlotBookable = slot.status !== 'cancelled' && slot.status !== 'expired';
      const canAccommodate = availableCapacity >= groupSize && availableCapacity > 0 && isSlotBookable;
      
      // Debug logging
      console.log(`[Availability Check] Slot: ${slotId}, Status: ${slot.status}, Capacity: ${slot.capacity}, Booked: ${totalBookedCapacity}, Available: ${availableCapacity}, Requested: ${groupSize}, Can Accommodate: ${canAccommodate}`);

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Availability checked successfully',
        data: {
          available: canAccommodate,
          capacity: slot.capacity,
          booked: totalBookedCapacity,
          remaining: availableCapacity,
          canAccommodate: canAccommodate,
          slotStatus: slot.status
        }
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Check public availability error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check availability'
      };
      res.status(500).json(errorResponse);
    }
  }

  // Public method - no authentication required
  async createPublicBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { slotId, visitor, groupSize, specialRequests, gcashNumber, referenceNumber } = req.body;

      if (!slotId || !visitor || !groupSize) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Missing required fields: slotId, visitor, and groupSize are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!visitor.name || !visitor.email) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Visitor name and email are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validate GCash payment information is required
      if (!gcashNumber || !gcashNumber.trim()) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'GCash number is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (gcashNumber.trim().length < 10 || gcashNumber.trim().length > 11) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'GCash number must be 10-11 digits'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!referenceNumber || !referenceNumber.trim()) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'GCash reference number is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (referenceNumber.trim().length < 6) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'GCash reference number must be at least 6 characters'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.createPublicBooking({
        slotId,
        visitor,
        groupSize: parseInt(groupSize),
        specialRequests,
        gcashNumber,
        referenceNumber
      });

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking created successfully',
        data: booking
      };

      res.status(201).json(successResponse);
    } catch (error) {
      console.error('Create public booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create booking'
      };
      res.status(400).json(errorResponse);
    }
  }

  // Public method - no authentication required
  async trackBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { email, token } = req.query;

      if (!email || !token) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Email and token are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.trackBooking(
        email as string,
        token as string
      );

      if (!booking) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Booking not found. Please check your email and tracking token.'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking found successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Track booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track booking'
      };
      res.status(500).json(errorResponse);
    }
  }

  // Public method - cancel booking by email and token (no authentication required)
  async cancelPublicBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Email and token are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const { reason } = req.body;
      if (!reason || reason.trim().length === 0) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Cancellation reason is required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const booking = await this.bookingService.cancelPublicBooking(
        email as string,
        token as string,
        reason as string
      );

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Cancel public booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel booking'
      };
      res.status(400).json(errorResponse);
    }
  }

  // Public method - update booking by email and token (no authentication required)
  async updatePublicBooking(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { email, token, groupSize, specialRequests, notes, gcashNumber, referenceNumber } = req.body;

      if (!email || !token) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'Email and token are required'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validate that at least one field is being updated
      if (groupSize === undefined && specialRequests === undefined && notes === undefined && gcashNumber === undefined && referenceNumber === undefined) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          message: 'At least one field (groupSize, specialRequests, notes, gcashNumber, or referenceNumber) must be provided for update'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Prepare updates object
      const updates: { groupSize?: number; specialRequests?: string; notes?: string; gcashNumber?: string; referenceNumber?: string } = {};
      if (groupSize !== undefined) {
        if (typeof groupSize !== 'number' || groupSize <= 0) {
          const errorResponse: ApiErrorResponse = {
            success: false,
            message: 'Group size must be a positive number'
          };
          res.status(400).json(errorResponse);
          return;
        }
        updates.groupSize = groupSize;
      }
      if (specialRequests !== undefined) updates.specialRequests = specialRequests;
      if (notes !== undefined) updates.notes = notes;
      if (gcashNumber !== undefined) updates.gcashNumber = gcashNumber;
      if (referenceNumber !== undefined) updates.referenceNumber = referenceNumber;

      const booking = await this.bookingService.updatePublicBooking(
        email as string,
        token as string,
        updates
      );

      const successResponse: ApiSuccessResponse = {
        success: true,
        message: 'Booking updated successfully',
        data: booking
      };

      res.status(200).json(successResponse);
    } catch (error) {
      console.error('Update public booking error:', error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update booking'
      };
      res.status(400).json(errorResponse);
    }
  }
}