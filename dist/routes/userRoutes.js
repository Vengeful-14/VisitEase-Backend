"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validator_1 = require("../validator");
const auth_1 = require("../auth");
const router = (0, express_1.Router)();
// POST /api/v1/user/register - Register a new user
router.post('/register', validator_1.validateUserRegistration, validator_1.handleValidationErrors, userController_1.registerUser);
// PUT /api/v1/user/:id/profile - Update user profile (placeholder for future implementation)
// router.put('/:id/profile', validateUUID, validateUserProfileUpdate, handleValidationErrors, updateUserProfile);
// PUT /api/v1/user/:id/password - Change password (placeholder for future implementation)
// router.put('/:id/password', validateUUID, validatePasswordChange, handleValidationErrors, changePassword);
// GET /api/v1/user/:id - Get user profile by ID (protected route)
router.get('/:id', auth_1.authenticateToken, validator_1.validateUUID, validator_1.handleValidationErrors, userController_1.getUserProfile);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map