
import { Router } from 'express';
import { Pool } from 'pg';
import { AuthService } from './core/AuthService';
import { AuthController } from './api/AuthController';
import { UserRepository } from '@/features/auth/user/data/UserRepository';
import { UserService } from '@/features/auth/user/core/UserService';
import { validateZodRequest } from '@/shared/middleware/validationMiddleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './api/auth.validation';

export class AuthModule {
  public router: Router;
  private controller: AuthController;
  private service: AuthService;

  constructor(pool: Pool) {
    this.router = Router();
    
    // Initialize dependencies
    const userRepository = new UserRepository(pool);
    const userService = new UserService(userRepository);
    
    this.service = new AuthService(userService, userRepository);
    this.controller = new AuthController(this.service);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    // Base route: /api/auth

    this.router.post('/register', validateZodRequest(registerSchema), this.controller.register.bind(this.controller));
    this.router.post('/login', validateZodRequest(loginSchema), this.controller.login.bind(this.controller));
    this.router.post('/refresh-token', validateZodRequest(refreshTokenSchema), this.controller.refreshToken.bind(this.controller));
  }
}
