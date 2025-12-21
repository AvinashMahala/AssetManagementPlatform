import { Request } from 'express';
import { User } from './models/User.js'; // Adjust path as needed

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