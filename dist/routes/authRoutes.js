"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validator_1 = require("../validator");
const router = (0, express_1.Router)();
// POST /api/v1/auth/login - User login
router.post('/login', validator_1.validateUserLogin, validator_1.handleValidationErrors, authController_1.loginUser);
// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', validator_1.validateRefreshToken, validator_1.handleValidationErrors, authController_1.refreshToken);
// POST /api/v1/auth/logout - User logout
router.post('/logout', authController_1.logoutUser);
// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', authController_1.requestPasswordReset);
// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', authController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map