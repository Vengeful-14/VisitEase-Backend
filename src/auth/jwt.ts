import jwt from 'jsonwebtoken';
import { JWTPayload, TokenResponse } from '../type';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate access token
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'visitease-api',
    audience: 'visitease-client',
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'visitease-api',
      audience: 'visitease-client',
    } as jwt.SignOptions
  );
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'visitease-api',
      audience: 'visitease-client',
    } as jwt.VerifyOptions) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string; type: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'visitease-api',
      audience: 'visitease-client',
    } as jwt.VerifyOptions) as any;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return { userId: decoded.userId, type: decoded.type };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Generate token pair
export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenResponse => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);
  
  // Calculate expiration time in seconds
  const expiresIn = 24 * 60 * 60; // 24 hours in seconds
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer',
  };
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};
