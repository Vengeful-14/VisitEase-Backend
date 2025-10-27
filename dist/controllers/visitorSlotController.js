"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorSlotStats = exports.checkAvailability = exports.getVisitorSlotsBySlot = exports.getVisitorSlotsByVisitor = exports.cancelVisitorSlotBooking = exports.deleteVisitorSlotBooking = exports.updateVisitorSlotBooking = exports.getAllVisitorSlots = exports.getVisitorSlot = exports.bookVisitorSlot = void 0;
const visitorSlotQueries_1 = require("../queries/visitorSlotQueries");
// Create a new visitor slot booking
const bookVisitorSlot = async (req, res) => {
    try {
        const { visitorId, slotId, groupSize, totalAmount, paymentMethod, specialRequests, } = req.body;
        const bookingData = {
            visitorId,
            slotId,
            groupSize,
            totalAmount,
            paymentMethod,
            specialRequests,
            createdBy: req.user?.userId,
        };
        const newBooking = await (0, visitorSlotQueries_1.createVisitorSlot)(bookingData);
        const successResponse = {
            success: true,
            message: 'Visitor slot booked successfully',
            data: newBooking,
        };
        res.status(201).json(successResponse);
    }
    catch (error) {
        console.error('Error booking visitor slot:', error);
        let errorMessage = 'Failed to book visitor slot';
        let statusCode = 500;
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                statusCode = 404;
                errorMessage = error.message;
            }
            else if (error.message.includes('not available') || error.message.includes('capacity')) {
                statusCode = 400;
                errorMessage = error.message;
            }
        }
        const errorResponse = {
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
exports.bookVisitorSlot = bookVisitorSlot;
// Get visitor slot by ID
const getVisitorSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const visitorSlot = await (0, visitorSlotQueries_1.getVisitorSlotById)(id);
        if (!visitorSlot) {
            const errorResponse = {
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
        const successResponse = {
            success: true,
            message: 'Visitor slot booking retrieved successfully',
            data: visitorSlot,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error getting visitor slot:', error);
        const errorResponse = {
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
exports.getVisitorSlot = getVisitorSlot;
// Get all visitor slots with optional filters
const getAllVisitorSlots = async (req, res) => {
    try {
        const { visitorId, slotId, status, dateFrom, dateTo, skip, limit, } = req.query;
        const filters = {};
        if (visitorId)
            filters.visitorId = visitorId;
        if (slotId)
            filters.slotId = slotId;
        if (status)
            filters.status = status;
        if (dateFrom)
            filters.dateFrom = dateFrom;
        if (dateTo)
            filters.dateTo = dateTo;
        if (skip)
            filters.skip = parseInt(skip);
        if (limit)
            filters.limit = parseInt(limit);
        const visitorSlots = await (0, visitorSlotQueries_1.getVisitorSlots)(filters);
        const successResponse = {
            success: true,
            message: 'Visitor slot bookings retrieved successfully',
            data: visitorSlots,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error getting visitor slots:', error);
        const errorResponse = {
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
exports.getAllVisitorSlots = getAllVisitorSlots;
// Update visitor slot booking
const updateVisitorSlotBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedBooking = await (0, visitorSlotQueries_1.updateVisitorSlot)(id, updateData);
        const successResponse = {
            success: true,
            message: 'Visitor slot booking updated successfully',
            data: updatedBooking,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error updating visitor slot:', error);
        let errorMessage = 'Failed to update visitor slot booking';
        let statusCode = 500;
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                statusCode = 404;
                errorMessage = error.message;
            }
            else if (error.message.includes('capacity')) {
                statusCode = 400;
                errorMessage = error.message;
            }
        }
        const errorResponse = {
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
exports.updateVisitorSlotBooking = updateVisitorSlotBooking;
// Delete visitor slot booking
const deleteVisitorSlotBooking = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if booking exists
        const existingBooking = await (0, visitorSlotQueries_1.getVisitorSlotById)(id);
        if (!existingBooking) {
            const errorResponse = {
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
        await (0, visitorSlotQueries_1.deleteVisitorSlot)(id);
        const successResponse = {
            success: true,
            message: 'Visitor slot booking deleted successfully',
            data: null,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error deleting visitor slot:', error);
        const errorResponse = {
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
exports.deleteVisitorSlotBooking = deleteVisitorSlotBooking;
// Cancel visitor slot booking
const cancelVisitorSlotBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const cancelledBooking = await (0, visitorSlotQueries_1.cancelVisitorSlot)(id);
        const successResponse = {
            success: true,
            message: 'Visitor slot booking cancelled successfully',
            data: cancelledBooking,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error cancelling visitor slot:', error);
        const errorResponse = {
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
exports.cancelVisitorSlotBooking = cancelVisitorSlotBooking;
// Get visitor slots by visitor ID
const getVisitorSlotsByVisitor = async (req, res) => {
    try {
        const { visitorId } = req.params;
        const visitorSlots = await (0, visitorSlotQueries_1.getVisitorSlotsByVisitorId)(visitorId);
        const successResponse = {
            success: true,
            message: 'Visitor slot bookings retrieved successfully',
            data: visitorSlots,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error getting visitor slots by visitor:', error);
        const errorResponse = {
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
exports.getVisitorSlotsByVisitor = getVisitorSlotsByVisitor;
// Get visitor slots by slot ID
const getVisitorSlotsBySlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const visitorSlots = await (0, visitorSlotQueries_1.getVisitorSlotsBySlotId)(slotId);
        const successResponse = {
            success: true,
            message: 'Visitor slot bookings retrieved successfully',
            data: visitorSlots,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error getting visitor slots by slot:', error);
        const errorResponse = {
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
exports.getVisitorSlotsBySlot = getVisitorSlotsBySlot;
// Check slot availability
const checkAvailability = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { groupSize } = req.body;
        const availability = await (0, visitorSlotQueries_1.checkSlotAvailability)(slotId, groupSize || 1);
        const successResponse = {
            success: true,
            message: 'Slot availability checked successfully',
            data: availability,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error checking slot availability:', error);
        let errorMessage = 'Failed to check slot availability';
        let statusCode = 500;
        if (error instanceof Error && error.message.includes('not found')) {
            statusCode = 404;
            errorMessage = error.message;
        }
        const errorResponse = {
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
exports.checkAvailability = checkAvailability;
// Get visitor slot statistics
const getVisitorSlotStats = async (req, res) => {
    try {
        const stats = await (0, visitorSlotQueries_1.getVisitorSlotStatistics)();
        const successResponse = {
            success: true,
            message: 'Visitor slot statistics retrieved successfully',
            data: stats,
        };
        res.status(200).json(successResponse);
    }
    catch (error) {
        console.error('Error getting visitor slot statistics:', error);
        const errorResponse = {
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
exports.getVisitorSlotStats = getVisitorSlotStats;
//# sourceMappingURL=visitorSlotController.js.map