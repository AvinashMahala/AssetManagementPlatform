import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(['admin', 'user', 'manager']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});
