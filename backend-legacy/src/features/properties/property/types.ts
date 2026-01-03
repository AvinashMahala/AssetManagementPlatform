import { Request, Response, NextFunction } from 'express';
import { IUserService } from '@/features/auth/user/core/IUserService';

/**
 * Minimal interface describing the methods property routes expect from a
 * file controller implementation.
 */
export interface IPropertyFileController {
  uploadFile(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  getPropertyFiles(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  downloadFile(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  updateFile(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  deleteFile(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
}

/**
 * Minimal interface describing methods for the receipt template controller
 */
export interface IReceiptTemplateController {
  createTemplate(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  getTemplate(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  updateTemplate(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  deleteTemplate(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
  generateUPILinks(req: Request, res: Response, next?: NextFunction): Promise<any> | any;
}

export type UserServiceLike = IUserService;
