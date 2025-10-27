"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboardService_1 = require("../services/dashboardService");
class DashboardController {
    constructor() {
        this.dashboardService = new dashboardService_1.DashboardService();
    }
    async getStats(req, res) {
        try {
            const stats = await this.dashboardService.getDashboardStats();
            const successResponse = {
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: stats
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Dashboard stats error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve dashboard statistics'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getUpcomingVisits(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const visits = await this.dashboardService.getUpcomingVisits(limit);
            const successResponse = {
                success: true,
                message: 'Upcoming visits retrieved successfully',
                data: visits
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Upcoming visits error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve upcoming visits'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getRecentActivity(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const activity = await this.dashboardService.getRecentActivity(limit);
            const successResponse = {
                success: true,
                message: 'Recent activity retrieved successfully',
                data: activity
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Recent activity error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve recent activity'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getRevenueTrend(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const trend = await this.dashboardService.getRevenueTrend(days);
            const successResponse = {
                success: true,
                message: 'Revenue trend retrieved successfully',
                data: trend
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Revenue trend error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve revenue trend'
            };
            res.status(500).json(errorResponse);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboardController.js.map