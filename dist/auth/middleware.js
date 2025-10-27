"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireStaffOrAdmin = exports.requireAdmin = exports.authorizeRoles = exports.authenticateToken = void 0;
const jwt_1 = require("./jwt");
// Authentication middleware
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            const errorResponse = {
                success: false,
                message: 'Access token is required',
            };
            res.status(401).json(errorResponse);
            return;
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        const errorResponse = {
            success: false,
            message: 'Invalid or expired token',
        };
        res.status(401).json(errorResponse);
    }
};
exports.authenticateToken = authenticateToken;
// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const errorResponse = {
                success: false,
                message: 'Authentication required',
            };
            res.status(401).json(errorResponse);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            const errorResponse = {
                success: false,
                message: 'Insufficient permissions',
            };
            res.status(403).json(errorResponse);
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Admin only middleware
exports.requireAdmin = (0, exports.authorizeRoles)('admin');
// Staff and Admin middleware
exports.requireStaffOrAdmin = (0, exports.authorizeRoles)('admin', 'staff');
// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (token) {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=middleware.js.map