"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const bookingService_1 = require("../services/bookingService");
class BookingController {
    constructor() {
        this.bookingService = new bookingService_1.BookingService();
    }
    async getBookings(req, res) {
        try {
            const filters = {
                slotId: req.query.slotId,
                visitorId: req.query.visitorId,
                status: req.query.status,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await this.bookingService.getBookings(filters);
            const successResponse = {
                success: true,
                message: 'Bookings retrieved successfully',
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get bookings error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve bookings'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await this.bookingService.getBookingById(id);
            if (!booking) {
                const errorResponse = {
                    success: false,
                    message: 'Booking not found'
                };
                res.status(404).json(errorResponse);
                return;
            }
            const successResponse = {
                success: true,
                message: 'Booking retrieved successfully',
                data: booking
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get booking error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve booking'
            };
            res.status(500).json(errorResponse);
        }
    }
    async createBooking(req, res) {
        try {
            const userId = req.user?.userId; // From authentication middleware
            if (!userId) {
                const errorResponse = {
                    success: false,
                    message: 'User authentication required'
                };
                res.status(401).json(errorResponse);
                return;
            }
            const booking = await this.bookingService.createBooking(req.body, userId);
            const successResponse = {
                success: true,
                message: 'Booking created successfully',
                data: booking
            };
            res.status(201).json(successResponse);
        }
        catch (error) {
            console.error('Create booking error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create booking'
            };
            res.status(400).json(errorResponse);
        }
    }
    async updateBooking(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                const errorResponse = {
                    success: false,
                    message: 'User authentication required'
                };
                res.status(401).json(errorResponse);
                return;
            }
            const booking = await this.bookingService.updateBooking(id, req.body, userId);
            const successResponse = {
                success: true,
                message: 'Booking updated successfully',
                data: booking
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Update booking error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update booking'
            };
            res.status(400).json(errorResponse);
        }
    }
    async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                const errorResponse = {
                    success: false,
                    message: 'User authentication required'
                };
                res.status(401).json(errorResponse);
                return;
            }
            const booking = await this.bookingService.confirmBooking(id, userId);
            const successResponse = {
                success: true,
                message: 'Booking confirmed successfully',
                data: booking
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Confirm booking error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to confirm booking'
            };
            res.status(400).json(errorResponse);
        }
    }
    async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                const errorResponse = {
                    success: false,
                    message: 'User authentication required'
                };
                res.status(401).json(errorResponse);
                return;
            }
            if (!reason) {
                const errorResponse = {
                    success: false,
                    message: 'Cancellation reason is required'
                };
                res.status(400).json(errorResponse);
                return;
            }
            const booking = await this.bookingService.cancelBooking(id, reason, userId);
            const successResponse = {
                success: true,
                message: 'Booking cancelled successfully',
                data: booking
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Cancel booking error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to cancel booking'
            };
            res.status(400).json(errorResponse);
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=bookingController.js.map