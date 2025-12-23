import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ensure env vars are loaded
// Try to load .env from current directory first (for Docker/local), then parent (original setup)
const localEnv = path.resolve(process.cwd(), '.env');
const parentEnv = path.resolve(process.cwd(), '../.env');

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else if (fs.existsSync(parentEnv)) {
  dotenv.config({ path: parentEnv });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5002').transform(Number),
  
  // Database
  MAIN_DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().default('5432').transform(Number),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),

  // Files Database
  FILES_DATABASE_URL: z.string().optional(),
  DB_FILES_NAME: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Auth
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_REFRESH_SECRET: z.string().default('your-refresh-secret-key'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  DISABLE_AUTH: z.string().default('false').transform((val) => val === 'true'),
  
  // Dev User
  DEV_USER_ID: z.string().optional(),
  DEV_USER_EMAIL: z.string().optional(),
  DEV_USER_ROLE: z.enum(['admin', 'user']).optional(),
  SYSTEM_USER_ID: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const config = {
  env: _env.data.NODE_ENV,
  port: _env.data.PORT,
  db: {
    url: _env.data.MAIN_DATABASE_URL,
    host: _env.data.DB_HOST,
    port: _env.data.DB_PORT,
    name: _env.data.DB_NAME,
    user: _env.data.DB_USER,
    password: _env.data.DB_PASSWORD,
    filesUrl: _env.data.FILES_DATABASE_URL,
    filesName: _env.data.DB_FILES_NAME,
  },
  email: {
    provider: _env.data.EMAIL_PROVIDER,
    resendApiKey: _env.data.RESEND_API_KEY,
  },
  auth: {
    jwtSecret: _env.data.JWT_SECRET,
    jwtRefreshSecret: _env.data.JWT_REFRESH_SECRET,
    accessTokenExpiry: _env.data.JWT_ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: _env.data.JWT_REFRESH_TOKEN_EXPIRY,
    disableAuth: _env.data.DISABLE_AUTH,
  },
  devUser: {
    id: _env.data.DEV_USER_ID,
    email: _env.data.DEV_USER_EMAIL,
    role: _env.data.DEV_USER_ROLE,
  },
  system: {
    userId: _env.data.SYSTEM_USER_ID,
  }
};
