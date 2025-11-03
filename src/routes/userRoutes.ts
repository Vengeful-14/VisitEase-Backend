import { Router } from 'express';
import { registerUser, getUserProfile } from '../controllers/userController';
import { 
  validateUserRegistration, 
  validateUserProfileUpdate,
  validatePasswordChange,
  validateUUID,
  handleValidationErrors 
} from '../validator';
import { authenticateToken, requireAdmin } from '../auth';

const router = Router();

// POST /api/v1/user/register - Register a new user
router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);


// PUT /api/v1/user/:id/profile - Update user profile (placeholder for future implementation)
// router.put('/:id/profile', validateUUID, validateUserProfileUpdate, handleValidationErrors, updateUserProfile);

// PUT /api/v1/user/:id/password - Change password (placeholder for future implementation)
// router.put('/:id/password', validateUUID, validatePasswordChange, handleValidationErrors, changePassword);

// GET /api/v1/user/:id - Get user profile by ID (protected route)
router.get('/:id', authenticateToken, validateUUID, handleValidationErrors, getUserProfile);

export default router;
