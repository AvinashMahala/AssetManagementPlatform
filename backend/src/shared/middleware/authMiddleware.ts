import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUserService } from '@/features/auth/user/core/IUserService';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = (userService: IUserService) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

      const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string };

      // Verify user still exists and is active
      const user = await userService.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Conditional authentication middleware
 * - If DISABLE_AUTH=true: Bypasses authentication and uses dev user
 * - If DISABLE_AUTH=false or not set: Requires valid JWT token
 */
export const conditionalAuth = (userService: IUserService) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authDisabled = process.env.DISABLE_AUTH === 'true';
    
    if (authDisabled) {
      // Bypass authentication - use dev user from environment
      req.user = {
        id: process.env.DEV_USER_ID || 'f40a33a6-8f4c-4a1d-bd26-857920024739',
        email: process.env.DEV_USER_EMAIL || 'dev@example.com',
        role: (process.env.DEV_USER_ROLE as 'admin' | 'user') || 'admin'
      };
      // Try to lookup the user in DB to warn if missing
      try {
        const found = await userService.getUserById(req.user.id);
        if (!found) {
          console.warn('[conditionalAuth] DEV_USER_ID is set but not present in DB:', req.user.id);
          console.warn("Run 'scripts/seed_to_db.py' to create the user or set DEV_USER_ID to an existing user id.");
        }
      } catch (err) {
        console.warn('[conditionalAuth] Error while verifying DEV_USER_ID:', err);
      }
      return next();
    }
    
    // Auth is enabled - require JWT token
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

      const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string };

      // Verify user still exists
      console.log('[conditionalAuth] Decoded userId:', decoded.userId);
      const user = await userService.getUserById(decoded.userId);
      console.log('[conditionalAuth] User found:', user ? 'yes' : 'no');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      console.error('[conditionalAuth] Error:', error);
      console.error('[conditionalAuth] Error type:', error instanceof jwt.TokenExpiredError ? 'TokenExpiredError' : error instanceof jwt.JsonWebTokenError ? 'JsonWebTokenError' : 'Other');
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};

/**
 * Simple dev auth bypass (for routes that don't need userService)
 * Always bypasses in development when DISABLE_AUTH=true
 */
export const devAuthBypass = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authDisabled = process.env.DISABLE_AUTH === 'true';
  
  if (authDisabled) {
    req.user = {
      id: process.env.DEV_USER_ID || 'f40a33a6-8f4c-4a1d-bd26-857920024739',
      email: process.env.DEV_USER_EMAIL || 'dev@example.com',
      role: (process.env.DEV_USER_ROLE as 'admin' | 'user') || 'admin'
    };
    return next();
  }
  
  // When auth is enabled but no token provided
  return res.status(401).json({ 
    success: false, 
    message: 'Authentication required. Set DISABLE_AUTH=true in .env for development.' 
  });
};