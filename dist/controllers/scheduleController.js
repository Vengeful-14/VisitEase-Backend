"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const scheduleService_1 = require("../services/scheduleService");
class ScheduleController {
    constructor() {
        this.scheduleService = new scheduleService_1.ScheduleService();
    }
    async getSlots(req, res) {
        try {
            const filters = {
                dateRange: req.query.dateRange,
                status: req.query.status,
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await this.scheduleService.getSlots(filters);
            const successResponse = {
                success: true,
                message: 'Schedule slots retrieved successfully',
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get slots error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve schedule slots'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getSlot(req, res) {
        try {
            const { id } = req.params;
            const slot = await this.scheduleService.getSlotById(id);
            if (!slot) {
                const errorResponse = {
                    success: false,
                    message: 'Slot not found'
                };
                res.status(404).json(errorResponse);
                return;
            }
            const successResponse = {
                success: true,
                message: 'Slot retrieved successfully',
                data: slot
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get slot error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve slot'
            };
            res.status(500).json(errorResponse);
        }
    }
    async createSlot(req, res) {
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
            const slot = await this.scheduleService.createSlot(req.body, userId);
            const successResponse = {
                success: true,
                message: 'Slot created successfully',
                data: slot
            };
            res.status(201).json(successResponse);
        }
        catch (error) {
            console.error('Create slot error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create slot'
            };
            res.status(400).json(errorResponse);
        }
    }
    async updateSlot(req, res) {
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
            const slot = await this.scheduleService.updateSlot(id, req.body, userId);
            const successResponse = {
                success: true,
                message: 'Slot updated successfully',
                data: slot
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Update slot error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update slot'
            };
            res.status(400).json(errorResponse);
        }
    }
    async deleteSlot(req, res) {
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
            await this.scheduleService.deleteSlot(id, userId);
            const successResponse = {
                success: true,
                message: 'Slot deleted successfully'
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Delete slot error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete slot'
            };
            res.status(400).json(errorResponse);
        }
    }
    async getStats(req, res) {
        try {
            const stats = await this.scheduleService.getScheduleStats();
            const successResponse = {
                success: true,
                message: 'Schedule statistics retrieved successfully',
                data: stats
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Schedule stats error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve schedule statistics'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getIssues(req, res) {
        try {
            const issues = await this.scheduleService.getScheduleIssues();
            const successResponse = {
                success: true,
                message: 'Schedule issues retrieved successfully',
                data: issues
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Schedule issues error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve schedule issues'
            };
            res.status(500).json(errorResponse);
        }
    }
    async expireOldSlots(req, res) {
        try {
            const result = await this.scheduleService.expirePastUnbookedSlots();
            const successResponse = {
                success: true,
                message: `Expired ${result.expiredCount} past unbooked slots`,
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Expire old slots error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to expire old slots'
            };
            res.status(500).json(errorResponse);
        }
    }
    // Public method - no authentication required
    async getPublicAvailableSlots(req, res) {
        try {
            const filters = {
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
            };
            const result = await this.scheduleService.getPublicAvailableSlots(filters);
            const successResponse = {
                success: true,
                message: 'Available slots retrieved successfully',
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get public available slots error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve available slots'
            };
            res.status(500).json(errorResponse);
        }
    }
    // Public method - no authentication required (read-only)
    async getPublicSlot(req, res) {
        try {
            const { id } = req.params;
            const slot = await this.scheduleService.getSlotById(id);
            if (!slot) {
                const errorResponse = {
                    success: false,
                    message: 'Slot not found'
                };
                res.status(404).json(errorResponse);
                return;
            }
            // Only return if slot is available and not expired
            const now = new Date();
            const slotStart = new Date(slot.date);
            try {
                const [hh, mm, ss] = String(slot.startTime || '00:00:00').split(':').map(v => parseInt(v || '0', 10));
                slotStart.setHours(hh || 0, mm || 0, ss || 0, 0);
            }
            catch { }
            if (slotStart < now || slot.status !== 'available') {
                const errorResponse = {
                    success: false,
                    message: 'Slot is no longer available'
                };
                res.status(404).json(errorResponse);
                return;
            }
            const successResponse = {
                success: true,
                message: 'Slot retrieved successfully',
                data: slot
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get public slot error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve slot'
            };
            res.status(500).json(errorResponse);
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=scheduleController.js.map