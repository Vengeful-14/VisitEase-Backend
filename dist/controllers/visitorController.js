"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorController = void 0;
const visitorService_1 = require("../services/visitorService");
class VisitorController {
    constructor() {
        this.visitorService = new visitorService_1.VisitorService();
    }
    async getVisitors(req, res) {
        try {
            const filters = {
                search: req.query.search,
                type: req.query.type,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await this.visitorService.getVisitors(filters);
            const successResponse = {
                success: true,
                message: 'Visitors retrieved successfully',
                data: result
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get visitors error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve visitors'
            };
            res.status(500).json(errorResponse);
        }
    }
    async getVisitor(req, res) {
        try {
            const { id } = req.params;
            const visitor = await this.visitorService.getVisitorById(id);
            if (!visitor) {
                const errorResponse = {
                    success: false,
                    message: 'Visitor not found'
                };
                res.status(404).json(errorResponse);
                return;
            }
            const successResponse = {
                success: true,
                message: 'Visitor retrieved successfully',
                data: visitor
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Get visitor error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve visitor'
            };
            res.status(500).json(errorResponse);
        }
    }
    async createVisitor(req, res) {
        try {
            const visitor = await this.visitorService.createVisitor(req.body);
            const successResponse = {
                success: true,
                message: 'Visitor created successfully',
                data: visitor
            };
            res.status(201).json(successResponse);
        }
        catch (error) {
            console.error('Create visitor error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create visitor'
            };
            res.status(400).json(errorResponse);
        }
    }
    async updateVisitor(req, res) {
        try {
            const { id } = req.params;
            const visitor = await this.visitorService.updateVisitor(id, req.body);
            const successResponse = {
                success: true,
                message: 'Visitor updated successfully',
                data: visitor
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Update visitor error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update visitor'
            };
            res.status(400).json(errorResponse);
        }
    }
    async deleteVisitor(req, res) {
        try {
            const { id } = req.params;
            await this.visitorService.deleteVisitor(id);
            const successResponse = {
                success: true,
                message: 'Visitor deleted successfully'
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Delete visitor error:', error);
            const errorResponse = {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete visitor'
            };
            res.status(400).json(errorResponse);
        }
    }
    async getStats(req, res) {
        try {
            const stats = await this.visitorService.getVisitorStats();
            const successResponse = {
                success: true,
                message: 'Visitor statistics retrieved successfully',
                data: stats
            };
            res.status(200).json(successResponse);
        }
        catch (error) {
            console.error('Visitor stats error:', error);
            const errorResponse = {
                success: false,
                message: 'Failed to retrieve visitor statistics'
            };
            res.status(500).json(errorResponse);
        }
    }
}
exports.VisitorController = VisitorController;
//# sourceMappingURL=visitorController.js.map