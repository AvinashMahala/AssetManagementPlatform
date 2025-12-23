
import { Request, Response } from 'express';
import { UserService } from '../core/UserService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('UserController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */
export class UserController {
  constructor(private readonly service: UserService) {}

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: List all users
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: List of users
   *       500:
   *         description: Internal server error
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.service.getAllUsers();
      ResponseUtils.success(res, { users });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch users');
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.service.getUserById(req.params.id);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch user');
    }
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [admin, manager, tenant]
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Internal server error
   */
  async createUser(req: Request, res: Response) {
    try {
      const user = await this.service.createUser(req.body);
      ResponseUtils.created(res, user);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create user');
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update a user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               role:
   *                 type: string
   *                 enum: [admin, manager, tenant]
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.service.updateUser(req.params.id, req.body);
      if (!user) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.success(res, user);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update user');
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete a user
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const success = await this.service.deleteUser(req.params.id);
      if (!success) {
        return ResponseUtils.notFound(res, 'User not found');
      }
      ResponseUtils.noContent(res);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete user');
    }
  }
}
