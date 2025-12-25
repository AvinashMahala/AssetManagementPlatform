
import { Request, Response } from 'express';
import { AuthService } from '../core/AuthService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('AuthController');

export class AuthController {
  constructor(private readonly service: AuthService) {}
  // OpenAPI: see `src/shared/config/swagger/apis/auth/paths/auth.register.post.ts`
  async register(req: Request, res: Response) {
    try {
      const result = await this.service.register(req.body);
      ResponseUtils.created(res, result);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Registration failed');
    }
  }

  // OpenAPI: see `src/shared/config/swagger/apis/auth/paths/auth.login.post.ts`
  async login(req: Request, res: Response) {
    try {
      const result = await this.service.login(req.body);
      ResponseUtils.success(res, result);
    } catch (err) {
      // Don't expose specific error details for login failures
      if ((err as Error).message === 'Invalid email or password') {
        return ResponseUtils.unauthorized(res, 'Invalid email or password');
      }
      ErrorUtils.handleGenericError(res, err, 'Login failed');
    }
  }

  // OpenAPI: see `src/shared/config/swagger/apis/auth/paths/auth.refresh-token.post.ts`
  async refreshToken(req: Request, res: Response) {
    try {
      const result = await this.service.refreshToken(req.body);
      ResponseUtils.success(res, result);
    } catch (err) {
      ResponseUtils.unauthorized(res, 'Invalid refresh token');
    }
  }
}
