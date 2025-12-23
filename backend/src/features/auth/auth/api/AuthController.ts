
import { Request, Response } from 'express';
import { AuthService } from '../core/AuthService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('AuthController');

export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserRegistrationInput'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Invalid input
   */
  async register(req: Request, res: Response) {
    try {
      const result = await this.service.register(req.body);
      ResponseUtils.created(res, result);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Registration failed');
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCredentials'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials
   */
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

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid refresh token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const result = await this.service.refreshToken(req.body);
      ResponseUtils.success(res, result);
    } catch (err) {
      ResponseUtils.unauthorized(res, 'Invalid refresh token');
    }
  }
}
