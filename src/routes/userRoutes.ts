import { Router } from 'express';
import { registerUser, getUserProfile, createStaffUser, resetStaffPassword } from '../controllers/userController';
import { 
  validateUserRegistration, 
  validateUserProfileUpdate,
  validatePasswordChange,
  validateUUID,
  validateStaffUserCreation,
  validateResetStaffPassword,
  handleValidationErrors 
} from '../validator';
import { authenticateToken, requireAdmin } from '../auth';

const router = Router();

// POST /api/v1/user/register - Register a new user
router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);

// POST /api/v1/user/staff - Create staff user (admin only)
router.post('/staff', authenticateToken, requireAdmin, validateStaffUserCreation, handleValidationErrors, createStaffUser);

// PUT /api/v1/user/staff/reset-password - Reset staff password (admin only, requires admin password confirmation)
router.put('/staff/reset-password', authenticateToken, requireAdmin, validateResetStaffPassword, handleValidationErrors, resetStaffPassword);

// PUT /api/v1/user/:id/profile - Update user profile (placeholder for future implementation)
// router.put('/:id/profile', validateUUID, validateUserProfileUpdate, handleValidationErrors, updateUserProfile);

// PUT /api/v1/user/:id/password - Change password (placeholder for future implementation)
// router.put('/:id/password', validateUUID, validatePasswordChange, handleValidationErrors, changePassword);

// GET /api/v1/user/:id - Get user profile by ID (protected route)
router.get('/:id', authenticateToken, validateUUID, handleValidationErrors, getUserProfile);

export default router;
