
import { Request, Response } from 'express';
import { UserService } from '../core/UserService';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('UserController');

export class UserController {
  constructor(private readonly service: UserService) {}

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.service.getAllUsers();
      ResponseUtils.success(res, { users });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch users');
    }
  }

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

  async createUser(req: Request, res: Response) {
    try {
      const user = await this.service.createUser(req.body);
      ResponseUtils.created(res, user);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create user');
    }
  }

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
