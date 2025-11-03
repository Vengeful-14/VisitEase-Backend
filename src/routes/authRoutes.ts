import { Router } from 'express';
import { 
  loginUser, 
  refreshToken, 
  logoutUser, 
  requestPasswordReset, 
  resetPassword 
} from '../controllers/authController';
import { 
  validateUserLogin, 
  validateRefreshToken,
  handleValidationErrors 
} from '../validator';

const router = Router();

// POST /api/v1/auth/login - User login
router.post('/login', validateUserLogin, handleValidationErrors, loginUser);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', validateRefreshToken, handleValidationErrors, refreshToken);

// POST /api/v1/auth/logout - User logout
router.post('/logout', logoutUser);

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', requestPasswordReset);

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

export default router;
