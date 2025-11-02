import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { IAssetRepository } from './src/interfaces/repositories/IAssetRepository.js';
import { IUserRepository } from './src/interfaces/repositories/IUserRepository.js';
import { IAssetService } from './src/interfaces/services/IAssetService.js';
import { IUserService } from './src/interfaces/services/IUserService.js';
import { AssetRepository } from './src/repositories/AssetRepository.js';
import { UserRepository } from './src/repositories/UserRepository.js';
import { AssetService } from './src/services/AssetService.js';
import { UserService } from './src/services/UserService.js';
import { AssetController } from './src/controllers/assetController.js';
import { UserController } from './src/controllers/userController.js';
import { createAssetRoutes } from './src/routes/assetRoutes.js';
import { createAuthRoutes } from './src/routes/authRoutes.js';
import { DependencyContainer } from './src/utils/DependencyContainer.js';

dotenv.config({ path: '../.env' });

console.log('Environment variables loaded:');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize dependency injection container
const container = DependencyContainer.initialize(pool);

// Get services from container
const assetService = container.assetService;
const userService = container.userService;
const passwordResetService = container.passwordResetService;

// Create controllers with injected services
const assetController = new AssetController(assetService);
const userController = new UserController(userService, passwordResetService);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Management API',
      version: '1.0.0',
      description: 'API for managing assets and users',
    },
    servers: [
      {
        url: 'http://localhost:5001',
      },
    ],
    tags: [
      {
        name: 'Assets',
        description: 'Asset management endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
    components: {
      schemas: {
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Asset ID',
            },
            name: {
              type: 'string',
              description: 'Asset name',
            },
            description: {
              type: 'string',
              description: 'Asset description',
            },
            value: {
              type: 'number',
              description: 'Asset value',
            },
            location: {
              type: 'string',
              description: 'Asset location',
            },
          },
        },
        AssetInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            value: {
              type: 'number',
            },
            location: {
              type: 'string',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              description: 'Email address',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'User role',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            isPhoneVerified: {
              type: 'boolean',
              description: 'Phone verification status',
            },
            profilePicture: {
              type: 'string',
              description: 'Profile picture URL',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        UserInput: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username (3-50 characters)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)',
            },
            phone: {
              type: 'string',
              description: 'Phone number (optional)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              default: 'user',
              description: 'User role',
            },
          },
        },
        UserRegistrationInput: {
          type: 'object',
          required: ['username', 'email', 'password', 'registrationMethod'],
          properties: {
            username: {
              type: 'string',
              description: 'Username (3-50 characters)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)',
            },
            phone: {
              type: 'string',
              description: 'Phone number (optional)',
            },
            registrationMethod: {
              type: 'string',
              enum: ['email', 'phone', 'google'],
              description: 'Registration method',
            },
          },
        },
        UserCredentials: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
            },
            expiresIn: {
              type: 'integer',
              description: 'Token expiration time in seconds',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            tokens: {
              $ref: '#/components/schemas/AuthTokens',
            },
          },
        },
        GoogleUserProfile: {
          type: 'object',
          required: ['id', 'email', 'name', 'verified_email'],
          properties: {
            id: {
              type: 'string',
              description: 'Google user ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            name: {
              type: 'string',
              description: 'Full name',
            },
            picture: {
              type: 'string',
              description: 'Profile picture URL',
            },
            verified_email: {
              type: 'boolean',
              description: 'Whether email is verified by Google',
            },
          },
        },
        EmailVerificationRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address to verify',
            },
          },
        },
        EmailVerificationConfirm: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Email verification token',
            },
          },
        },
        PhoneVerificationRequest: {
          type: 'object',
          required: ['phone'],
          properties: {
            phone: {
              type: 'string',
              description: 'Phone number to verify',
            },
          },
        },
        PhoneVerificationConfirm: {
          type: 'object',
          required: ['phone', 'code'],
          properties: {
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            code: {
              type: 'string',
              minLength: 6,
              maxLength: 6,
              description: '6-digit verification code',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token',
            },
          },
        },
        PasswordResetOptions: {
          type: 'object',
          properties: {
            availableMethods: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['security_questions', 'recovery_codes', 'admin_reset'],
              },
              description: 'Available password reset methods',
            },
            enabledMethods: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['security_questions', 'recovery_codes', 'admin_reset'],
              },
              description: 'Enabled password reset methods',
            },
            hasSecurityQuestions: {
              type: 'boolean',
              description: 'Whether user has security questions set up',
            },
            recoveryCodesCount: {
              type: 'integer',
              description: 'Number of unused recovery codes',
            },
          },
        },
        SecurityQuestionSetup: {
          type: 'object',
          required: ['questions'],
          properties: {
            questions: {
              type: 'array',
              minItems: 2,
              maxItems: 5,
              items: {
                type: 'object',
                required: ['question', 'answer'],
                properties: {
                  question: {
                    type: 'string',
                    minLength: 10,
                    maxLength: 200,
                    description: 'Security question',
                  },
                  answer: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                    description: 'Answer to security question',
                  },
                },
              },
              description: 'List of security questions and answers',
            },
          },
        },
        PasswordResetViaSecurityQuestions: {
          type: 'object',
          required: ['email', 'answers', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            answers: {
              type: 'array',
              minItems: 2,
              items: {
                type: 'object',
                required: ['question', 'answer'],
                properties: {
                  question: {
                    type: 'string',
                    description: 'Security question',
                  },
                  answer: {
                    type: 'string',
                    description: 'Answer to security question',
                  },
                },
              },
              description: 'Answers to security questions',
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              description: 'New password',
            },
          },
        },
        PasswordResetViaRecoveryCode: {
          type: 'object',
          required: ['email', 'recoveryCode', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            recoveryCode: {
              type: 'string',
              description: 'Recovery code',
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              description: 'New password',
            },
          },
        },
        AdminPasswordReset: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'integer',
              description: 'User ID to reset password for',
            },
            sendEmail: {
              type: 'boolean',
              default: true,
              description: 'Whether to send email with temporary password',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

const specs = swaggerJSDoc(options);

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI to work
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

pool.query(`CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(10,2),
  location VARCHAR(255)
)`, (err) => {
  if (err) {
    console.error('Error creating assets table', err);
  } else {
    console.log('Assets table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  google_id VARCHAR(255) UNIQUE,
  profile_picture TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating users table', err);
  } else {
    console.log('Users table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS phone_verification_codes (
  phone VARCHAR(20) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating phone_verification_codes table', err);
  } else {
    console.log('Phone verification codes table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS password_reset_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method_type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, method_type)
)`, (err) => {
  if (err) {
    console.error('Error creating password_reset_methods table', err);
  } else {
    console.log('Password reset methods table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS security_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  answer_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating security_questions table', err);
  } else {
    console.log('Security questions table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS recovery_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating recovery_codes table', err);
  } else {
    console.log('Recovery codes table ready');
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get welcome message
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({ message: 'Asset Management API' });
});

// Mount routes
app.use('/api/assets', createAssetRoutes(assetController));
app.use('/api/auth', createAuthRoutes(userService, passwordResetService));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});