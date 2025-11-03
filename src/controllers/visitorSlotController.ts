import { Request, Response } from 'express';
import {
  createVisitorSlot,
  getVisitorSlotById,
  getVisitorSlots,
  updateVisitorSlot,
  deleteVisitorSlot,
  getVisitorSlotsByVisitorId,
  getVisitorSlotsBySlotId,
  checkSlotAvailability,
  getVisitorSlotStatistics,
  cancelVisitorSlot,
} from '../queries/visitorSlotQueries';
import {
  CreateVisitorSlotData,
  UpdateVisitorSlotData,
  VisitorSlotBookingRequest,
  VisitorSlotSearchFilters,
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthRequest,
} from '../type';
import { SlotStatus } from '../generated/prisma';

// Create a new visitor slot booking
export const bookVisitorSlot = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const {
      visitorId,
      slotId,
      groupSize,
      totalAmount,
      paymentMethod,
      specialRequests,
    } = req.body;

    const bookingData: CreateVisitorSlotData = {
      visitorId,
      slotId,
      groupSize,
      totalAmount,
      paymentMethod,
      specialRequests,
      createdBy: req.user?.userId,
    };

    const newBooking = await createVisitorSlot(bookingData);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot booked successfully',
      data: newBooking,
    };

    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Error booking visitor slot:', error);
    
    let errorMessage = 'Failed to book visitor slot';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (error.message.includes('not available') || error.message.includes('capacity')) {
        statusCode = 400;
        errorMessage = error.message;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: errorMessage,
      errors: [
        {
          field: 'general',
          message: errorMessage,
        },
      ],
    };
    res.status(statusCode).json(errorResponse);
  }
};

// Get visitor slot by ID
export const getVisitorSlot = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    const visitorSlot = await getVisitorSlotById(id);
    if (!visitorSlot) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Visitor slot booking not found',
        errors: [
          {
            field: 'id',
            message: 'No visitor slot booking found with the provided ID',
          },
        ],
      };
      res.status(404).json(errorResponse);
      return;
    }

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot booking retrieved successfully',
      data: visitorSlot,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error getting visitor slot:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve visitor slot booking',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while retrieving the visitor slot booking',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Get all visitor slots with optional filters
export const getAllVisitorSlots = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const {
      visitorId,
      slotId,
      status,
      dateFrom,
      dateTo,
      skip,
      limit,
    } = req.query;

    const filters: VisitorSlotSearchFilters = {};

    if (visitorId) filters.visitorId = visitorId as string;
    if (slotId) filters.slotId = slotId as string;
    if (status) filters.status = status as any;
    if (dateFrom) filters.dateFrom = dateFrom as string;
    if (dateTo) filters.dateTo = dateTo as string;
    if (skip) filters.skip = parseInt(skip as string);
    if (limit) filters.limit = parseInt(limit as string);

    const visitorSlots = await getVisitorSlots(filters);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot bookings retrieved successfully',
      data: visitorSlots,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error getting visitor slots:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve visitor slot bookings',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while retrieving visitor slot bookings',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Update visitor slot booking
export const updateVisitorSlotBooking = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateVisitorSlotData = req.body;

    const updatedBooking = await updateVisitorSlot(id, updateData);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot booking updated successfully',
      data: updatedBooking,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error updating visitor slot:', error);
    
    let errorMessage = 'Failed to update visitor slot booking';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (error.message.includes('capacity')) {
        statusCode = 400;
        errorMessage = error.message;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: errorMessage,
      errors: [
        {
          field: 'general',
          message: errorMessage,
        },
      ],
    };
    res.status(statusCode).json(errorResponse);
  }
};

// Delete visitor slot booking
export const deleteVisitorSlotBooking = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const existingBooking = await getVisitorSlotById(id);
    if (!existingBooking) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Visitor slot booking not found',
        errors: [
          {
            field: 'id',
            message: 'No visitor slot booking found with the provided ID',
          },
        ],
      };
      res.status(404).json(errorResponse);
      return;
    }

    await deleteVisitorSlot(id);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot booking deleted successfully',
      data: null,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error deleting visitor slot:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to delete visitor slot booking',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while deleting the visitor slot booking',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Cancel visitor slot booking
export const cancelVisitorSlotBooking = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;

    const cancelledBooking = await cancelVisitorSlot(id);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot booking cancelled successfully',
      data: cancelledBooking,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error cancelling visitor slot:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to cancel visitor slot booking',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while cancelling the visitor slot booking',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Get visitor slots by visitor ID
export const getVisitorSlotsByVisitor = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { visitorId } = req.params;

    const visitorSlots = await getVisitorSlotsByVisitorId(visitorId);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot bookings retrieved successfully',
      data: visitorSlots,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error getting visitor slots by visitor:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve visitor slot bookings',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while retrieving visitor slot bookings',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Get visitor slots by slot ID
export const getVisitorSlotsBySlot = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { slotId } = req.params;

    const visitorSlots = await getVisitorSlotsBySlotId(slotId);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot bookings retrieved successfully',
      data: visitorSlots,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error getting visitor slots by slot:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve visitor slot bookings',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while retrieving visitor slot bookings',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};

// Check slot availability
export const checkAvailability = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { slotId } = req.params;
    const { groupSize } = req.body;

    const availability = await checkSlotAvailability(slotId, groupSize || 1);

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Slot availability checked successfully',
      data: availability,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error checking slot availability:', error);
    
    let errorMessage = 'Failed to check slot availability';
    let statusCode = 500;
    
    if (error instanceof Error && error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: errorMessage,
      errors: [
        {
          field: 'general',
          message: errorMessage,
        },
      ],
    };
    res.status(statusCode).json(errorResponse);
  }
};

// Get visitor slot statistics
export const getVisitorSlotStats = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const stats = await getVisitorSlotStatistics();

    const successResponse: ApiSuccessResponse = {
      success: true,
      message: 'Visitor slot statistics retrieved successfully',
      data: stats,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error getting visitor slot statistics:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Failed to retrieve visitor slot statistics',
      errors: [
        {
          field: 'general',
          message: 'An unexpected error occurred while retrieving visitor slot statistics',
        },
      ],
    };
    res.status(500).json(errorResponse);
  }
};
