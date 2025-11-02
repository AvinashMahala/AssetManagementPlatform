import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUserService } from '../interfaces/services/IUserService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
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