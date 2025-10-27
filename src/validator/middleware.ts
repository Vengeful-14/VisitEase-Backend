import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiErrorResponse } from '../type';

// Main validation error handler middleware
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: 'value' in error ? error.value : undefined
      })),
    };
    
    res.status(400).json(errorResponse);
    return;
  }
  
  next();
};

// Middleware to check if required fields are present
export const checkRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];
    
    fields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Missing required fields',
        errors: missingFields.map(field => ({
          field,
          message: `${field} is required`,
        })),
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Middleware to sanitize input data
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Trim string values in body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Trim string values in query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }
  
  next();
};

// Middleware to validate request size
export const validateRequestSize = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Request too large',
        errors: [{
          field: 'request',
          message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
        }],
      };
      
      res.status(413).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Middleware to validate content type
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.get('content-type');
    
    if (req.method !== 'GET' && req.method !== 'DELETE' && !contentType) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Content-Type header is required',
        errors: [{
          field: 'content-type',
          message: 'Content-Type header is required for this request',
        }],
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    if (contentType && !allowedTypes.some(type => contentType.includes(type))) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Invalid content type',
        errors: [{
          field: 'content-type',
          message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
        }],
      };
      
      res.status(415).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Middleware to rate limit requests
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requests.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (clientData.count >= maxRequests) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Too many requests',
        errors: [{
          field: 'rate-limit',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
        }],
      };
      
      res.status(429).json(errorResponse);
      return;
    }
    
    clientData.count++;
    next();
  };
};

// Middleware to validate API version
export const validateApiVersion = (supportedVersions: string[] = ['v1']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const version = req.get('api-version') || 'v1';
    
    if (!supportedVersions.includes(version)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Unsupported API version',
        errors: [{
          field: 'api-version',
          message: `API version ${version} is not supported. Supported versions: ${supportedVersions.join(', ')}`,
        }],
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Middleware to validate request method
export const validateMethod = (allowedMethods: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!allowedMethods.includes(req.method)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Method not allowed',
        errors: [{
          field: 'method',
          message: `Method ${req.method} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        }],
      };
      
      res.status(405).json(errorResponse);
      return;
    }
    
    next();
  };
};

// Middleware to validate request headers
export const validateHeaders = (requiredHeaders: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingHeaders: string[] = [];
    
    requiredHeaders.forEach(header => {
      if (!req.get(header)) {
        missingHeaders.push(header);
      }
    });
    
    if (missingHeaders.length > 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Missing required headers',
        errors: missingHeaders.map(header => ({
          field: header,
          message: `Header ${header} is required`,
        })),
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    next();
  };
};
