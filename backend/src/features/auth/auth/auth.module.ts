
import { Router } from 'express';
import { Pool } from 'pg';
import { AuthService } from './core/AuthService';
import { AuthController } from './api/AuthController';
import { UserRepository } from '@/features/auth/user/data/UserRepository';
import { UserService } from '@/features/auth/user/core/UserService';
import { validateZodRequest, validateRequest } from '@/shared/middleware/validationMiddleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './api/auth.validation';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { ResponseUtils } from '@/shared/utils/response';
import { HTTP_STATUS } from '@/shared/constants/http';
import { authLimiter } from '@/shared/middleware/rateLimitMiddleware';

export class AuthModule {
  public router: Router;
  private controller: AuthController;
  private service: AuthService;
  private userService: UserService;

  constructor(pool: Pool) {
    this.router = Router();
    
    // Initialize dependencies
    const userRepository = new UserRepository(pool);
    this.userService = new UserService(userRepository);
    
    this.service = new AuthService(this.userService, userRepository);
    this.controller = new AuthController(this.service);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    // Base route: /api/auth

    this.router.post('/register', authLimiter, validateZodRequest(registerSchema), this.controller.register.bind(this.controller));
    this.router.post('/login', authLimiter, validateZodRequest(loginSchema), this.controller.login.bind(this.controller));
    this.router.post('/refresh-token', validateZodRequest(refreshTokenSchema), this.controller.refreshToken.bind(this.controller));

    // Profile routes
    this.router.get('/profile', conditionalAuth(this.userService), async (req, res) => {
      try {
        const userId = (req as any).user?.id;
        if (!userId) return ResponseUtils.unauthorized(res, 'Authentication required');
        const profile = await this.userService.getUserProfile(userId);
        return ResponseUtils.success(res, profile);
      } catch (err) {
        return ResponseUtils.error(res, 'Failed to fetch profile', HTTP_STATUS.INTERNAL_SERVER_ERROR, err as Error);
      }
    });

    this.router.put('/profile', conditionalAuth(this.userService), validateRequest.updateProfile, async (req, res) => {
      try {
        const userId = (req as any).user?.id;
        if (!userId) return ResponseUtils.unauthorized(res, 'Authentication required');
        const updated = await this.userService.updateUserProfile(userId, req.body);
        return ResponseUtils.success(res, updated);
      } catch (err) {
        return ResponseUtils.error(res, 'Failed to update profile', HTTP_STATUS.INTERNAL_SERVER_ERROR, err as Error);
      }
    });
  }
}
