import rateLimit from 'express-rate-limit';
import { config } from '@/shared/config/env';

/**
 * Creates a custom rate limiter
 * @param windowMs Time window in milliseconds
 * @param max Max requests per window
 * @param message Error message
 */
export const createRateLimiter = (
  windowMs: number, 
  max: number, 
  message: string = 'Too many requests, please try again later'
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
};

// Global API Limiter (General use)
export const globalLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.max,
  'Too many requests from this IP, please try again after 15 minutes'
);

// Strict Auth Limiter (Login/Register/Password Reset)
// 5 attempts per 15 minutes to prevent brute force
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many login attempts, please try again after 15 minutes'
);

// File Upload Limiter (Prevent DoS via large uploads)
// 10 uploads per hour
export const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Upload limit exceeded, please try again later'
);
