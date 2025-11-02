"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reportsService_1 = require("../services/reportsService");
class ReportsController {
    constructor() {
        this.reportsService = new reportsService_1.ReportsService();
    }
    async getSummary(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const summary = await this.reportsService.getSummary(days);
            const successResponse = {
                success: true,
                message: 'Report summary retrieved successfully',
                data: summary,
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Reports summary error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve report summary',
            };
            res.status(500).json(errorResponse);
        }
    }
    async getDaily(req, res) {
        try {
            const { days, dateFrom, dateTo } = req.query;
            const parsedDays = days ? parseInt(days) : undefined;
            const daily = await this.reportsService.getDaily({
                days: parsedDays,
                dateFrom: dateFrom,
                dateTo: dateTo,
            });
            const successResponse = {
                success: true,
                message: 'Daily report retrieved successfully',
                data: daily,
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Reports daily error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve daily report',
            };
            res.status(500).json(errorResponse);
        }
    }
    async getBookingTrend(req, res) {
        try {
            const { days, dateFrom, dateTo } = req.query;
            const parsedDays = days ? parseInt(days) : undefined;
            const result = await this.reportsService.getBookingTrend({
                days: parsedDays,
                dateFrom: dateFrom,
                dateTo: dateTo,
            });
            const successResponse = {
                success: true,
                message: 'Booking trend retrieved successfully',
                data: result,
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Reports booking trend error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve booking trend',
            };
            res.status(500).json(errorResponse);
        }
    }
}
exports.ReportsController = ReportsController;
exports.default = ReportsController;
//# sourceMappingURL=reportsController.js.map