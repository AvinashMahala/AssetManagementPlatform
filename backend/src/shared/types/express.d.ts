import { Request } from 'express';
import { User } from '../../features/auth/user/core/user.types';

declare global {
  namespace Express {
    interface Request {
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
      };
      user?: User; // Adjust based on your User model
    }
  }
}