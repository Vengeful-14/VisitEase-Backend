"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitorController_1 = require("../controllers/visitorController");
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
const visitorController = new visitorController_1.VisitorController();
// All visitor routes require authentication
router.use(middleware_1.authenticateToken);
// GET /api/v1/visitors - Get visitors with filtering
router.get('/', visitorController.getVisitors.bind(visitorController));
// GET /api/v1/visitors/:id - Get specific visitor
router.get('/:id', visitorController.getVisitor.bind(visitorController));
// GET /api/v1/visitors/statistics - Get visitor statistics
router.get('/statistics', visitorController.getStats.bind(visitorController));
// POST /api/v1/visitors - Create new visitor (Staff/Admin only)
router.post('/', middleware_1.requireStaffOrAdmin, visitorController.createVisitor.bind(visitorController));
// PUT /api/v1/visitors/:id - Update visitor (Staff/Admin only)
router.put('/:id', middleware_1.requireStaffOrAdmin, visitorController.updateVisitor.bind(visitorController));
// DELETE /api/v1/visitors/:id - Delete visitor (Staff/Admin only)
router.delete('/:id', middleware_1.requireStaffOrAdmin, visitorController.deleteVisitor.bind(visitorController));
exports.default = router;
//# sourceMappingURL=visitorRoutes.js.map