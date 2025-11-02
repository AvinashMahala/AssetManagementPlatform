import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { IPropertyRepository } from './src/interfaces/repositories/IPropertyRepository.js';
import { IUserRepository } from './src/interfaces/repositories/IUserRepository.js';
import { ITenantRepository } from './src/interfaces/repositories/ITenantRepository.js';
import { IPropertyService } from './src/interfaces/services/IPropertyService.js';
import { IUserService } from './src/interfaces/services/IUserService.js';
import { ITenantService } from './src/interfaces/services/ITenantService.js';
import { PropertyRepository } from './src/repositories/PropertyRepository.js';
import { UserRepository } from './src/repositories/UserRepository.js';
import { TenantRepository } from './src/repositories/TenantRepository.js';
import { PropertyService } from './src/services/PropertyService.js';
import { UserService } from './src/services/UserService.js';
import { TenantService } from './src/services/TenantService.js';
import { PropertyController } from './src/controllers/propertyController.js';
import { UserController } from './src/controllers/userController.js';
import { TenantController } from './src/controllers/TenantController.js';
import { createPropertyRoutes } from './src/routes/propertyRoutes.js';
import { createAuthRoutes } from './src/routes/authRoutes.js';
import { createTenantRoutes } from './src/routes/tenantRoutes.js';
import { DependencyContainer } from './src/utils/DependencyContainer.js';

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
const propertyService = container.propertyService;
const userService = container.userService;
const tenantService = container.tenantService;
const passwordResetService = container.passwordResetService;

// Create controllers with injected services
const propertyController = new PropertyController(propertyService);
const userController = new UserController(userService, passwordResetService);
const tenantController = new TenantController(tenantService);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management API',
      version: '1.0.0',
      description: 'API for managing rental properties and users',
    },
    servers: [
      {
        url: 'http://localhost:5001',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Properties',
        description: 'Property portfolio management endpoints',
      },
      {
        name: 'Tenants',
        description: 'Tenant profile and management endpoints',
      },
      {
        name: 'Leases',
        description: 'Lease agreement management endpoints',
      },
      {
        name: 'Rent Payments',
        description: 'Rent payment tracking and collection endpoints',
      },
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Property ID',
            },
            name: {
              type: 'string',
              description: 'Property name',
            },
            description: {
              type: 'string',
              description: 'Property description',
            },
            propertyType: {
              type: 'string',
              enum: ['apartment', 'house', 'villa', 'commercial', 'pg_hostel', 'co_living', 'office', 'shop', 'warehouse'],
              description: 'Type of property',
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'under_maintenance', 'vacant'],
              description: 'Property status',
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
                landmark: {
                  type: 'string',
                  description: 'Landmark',
                },
              },
            },
            area: {
              type: 'number',
              description: 'Area in sq ft',
            },
            bedrooms: {
              type: 'integer',
              description: 'Number of bedrooms',
            },
            bathrooms: {
              type: 'integer',
              description: 'Number of bathrooms',
            },
            monthlyRent: {
              type: 'number',
              description: 'Monthly rent amount',
            },
            securityDeposit: {
              type: 'number',
              description: 'Security deposit amount',
            },
            ownerId: {
              type: 'integer',
              description: 'Owner user ID',
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of amenities',
            },
            photos: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of photo URLs',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        PropertyInput: {
          type: 'object',
          required: ['name', 'propertyType', 'address', 'area', 'monthlyRent', 'securityDeposit', 'ownerId'],
          properties: {
            name: {
              type: 'string',
              description: 'Property name',
            },
            description: {
              type: 'string',
              description: 'Property description',
            },
            propertyType: {
              type: 'string',
              enum: ['apartment', 'house', 'villa', 'commercial', 'pg_hostel', 'co_living', 'office', 'shop', 'warehouse'],
              description: 'Type of property',
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'under_maintenance', 'vacant'],
              default: 'available',
              description: 'Property status',
            },
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'pincode'],
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
                landmark: {
                  type: 'string',
                  description: 'Landmark',
                },
              },
            },
            area: {
              type: 'number',
              description: 'Area in sq ft',
            },
            bedrooms: {
              type: 'integer',
              description: 'Number of bedrooms',
            },
            bathrooms: {
              type: 'integer',
              description: 'Number of bathrooms',
            },
            monthlyRent: {
              type: 'number',
              description: 'Monthly rent amount',
            },
            securityDeposit: {
              type: 'number',
              description: 'Security deposit amount',
            },
            ownerId: {
              type: 'integer',
              description: 'Owner user ID',
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of amenities',
            },
            photos: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of photo URLs',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID (UUID)',
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
        Tenant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Gender',
            },
            occupation: {
              type: 'string',
              description: 'Occupation',
            },
            monthlyIncome: {
              type: 'number',
              description: 'Monthly income',
            },
            currentAddress: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
              },
            },
            permanentAddress: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
              },
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Emergency contact name',
                },
                relationship: {
                  type: 'string',
                  description: 'Relationship to tenant',
                },
                phone: {
                  type: 'string',
                  description: 'Emergency contact phone',
                },
              },
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Document ID (UUID)',
                  },
                  tenantId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Tenant ID (UUID)',
                  },
                  documentType: {
                    type: 'string',
                    enum: ['aadhaar', 'pan', 'driving_license', 'passport', 'employment_letter', 'salary_slip', 'bank_statement', 'previous_landlord_reference'],
                    description: 'Document type',
                  },
                  documentNumber: {
                    type: 'string',
                    description: 'Document number',
                  },
                  fileUrl: {
                    type: 'string',
                    description: 'Document file URL',
                  },
                  verified: {
                    type: 'boolean',
                    description: 'Document verification status',
                  },
                  verifiedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Document verification timestamp',
                  },
                  verifiedBy: {
                    type: 'string',
                    format: 'uuid',
                    description: 'User ID who verified the document (UUID)',
                  },
                  uploadedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Document upload timestamp',
                  },
                },
              },
              description: 'List of tenant documents',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'blacklisted'],
              description: 'Tenant status',
            },
            totalRentals: {
              type: 'integer',
              description: 'Total number of rentals',
            },
            currentPropertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Current property ID (UUID)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        TenantInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'phone'],
          properties: {
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Gender',
            },
            occupation: {
              type: 'string',
              description: 'Occupation',
            },
            monthlyIncome: {
              type: 'number',
              description: 'Monthly income',
            },
            currentAddress: {
              type: 'object',
              required: ['street', 'city', 'state', 'pincode'],
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
              },
            },
            permanentAddress: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                },
                city: {
                  type: 'string',
                  description: 'City',
                },
                state: {
                  type: 'string',
                  description: 'State',
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                },
              },
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Emergency contact name',
                },
                relationship: {
                  type: 'string',
                  description: 'Relationship to tenant',
                },
                phone: {
                  type: 'string',
                  description: 'Emergency contact phone',
                },
              },
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id', 'bank_statement', 'salary_slip'],
                    description: 'Document type',
                  },
                  number: {
                    type: 'string',
                    description: 'Document number',
                  },
                  url: {
                    type: 'string',
                    description: 'Document file URL',
                  },
                },
              },
              description: 'List of tenant documents',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'blacklisted'],
              default: 'active',
              description: 'Tenant status',
            },
            creditScore: {
              type: 'integer',
              description: 'Credit score',
            },
          },
        },
        Lease: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Lease ID',
            },
            propertyId: {
              type: 'integer',
              description: 'Property ID',
            },
            tenantId: {
              type: 'integer',
              description: 'Tenant ID',
            },
            leaseStartDate: {
              type: 'string',
              format: 'date',
              description: 'Lease start date',
            },
            leaseEndDate: {
              type: 'string',
              format: 'date',
              description: 'Lease end date',
            },
            monthlyRent: {
              type: 'number',
              description: 'Monthly rent amount',
            },
            securityDeposit: {
              type: 'number',
              description: 'Security deposit amount',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Monthly maintenance charges',
            },
            paymentFrequency: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
              description: 'Rent payment frequency',
            },
            noticePeriodDays: {
              type: 'integer',
              description: 'Notice period in days',
            },
            lockInPeriodMonths: {
              type: 'integer',
              description: 'Lock-in period in months',
            },
            conditions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Lease conditions and terms',
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'expired', 'terminated', 'cancelled'],
              description: 'Lease status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        LeaseInput: {
          type: 'object',
          required: ['propertyId', 'tenantId', 'leaseStartDate', 'leaseEndDate', 'monthlyRent', 'securityDeposit'],
          properties: {
            propertyId: {
              type: 'integer',
              description: 'Property ID',
            },
            tenantId: {
              type: 'integer',
              description: 'Tenant ID',
            },
            leaseStartDate: {
              type: 'string',
              format: 'date',
              description: 'Lease start date',
            },
            leaseEndDate: {
              type: 'string',
              format: 'date',
              description: 'Lease end date',
            },
            monthlyRent: {
              type: 'number',
              description: 'Monthly rent amount',
            },
            securityDeposit: {
              type: 'number',
              description: 'Security deposit amount',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Monthly maintenance charges',
            },
            paymentFrequency: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
              default: 'monthly',
              description: 'Rent payment frequency',
            },
            noticePeriodDays: {
              type: 'integer',
              default: 30,
              description: 'Notice period in days',
            },
            lockInPeriodMonths: {
              type: 'integer',
              description: 'Lock-in period in months',
            },
            conditions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Lease conditions and terms',
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'expired', 'terminated', 'cancelled'],
              default: 'draft',
              description: 'Lease status',
            },
          },
        },
        RentPayment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Payment ID',
            },
            leaseId: {
              type: 'integer',
              description: 'Lease ID',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Payment due date',
            },
            paidDate: {
              type: 'string',
              format: 'date-time',
              description: 'Payment date',
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'net_banking'],
              description: 'Payment method',
            },
            transactionId: {
              type: 'string',
              description: 'Transaction reference ID',
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
              description: 'Payment status',
            },
            lateFee: {
              type: 'number',
              description: 'Late payment fee',
            },
            remarks: {
              type: 'string',
              description: 'Payment remarks',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        RentPaymentInput: {
          type: 'object',
          required: ['leaseId', 'amount', 'dueDate'],
          properties: {
            leaseId: {
              type: 'integer',
              description: 'Lease ID',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Payment due date',
            },
            paidDate: {
              type: 'string',
              format: 'date-time',
              description: 'Payment date',
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'net_banking'],
              description: 'Payment method',
            },
            transactionId: {
              type: 'string',
              description: 'Transaction reference ID',
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
              default: 'pending',
              description: 'Payment status',
            },
            lateFee: {
              type: 'number',
              description: 'Late payment fee',
            },
            remarks: {
              type: 'string',
              description: 'Payment remarks',
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

pool.query(`CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  occupation VARCHAR(100),
  company_name VARCHAR(255),
  monthly_income DECIMAL(12,2),
  current_address_street VARCHAR(255) NOT NULL,
  current_address_city VARCHAR(100) NOT NULL,
  current_address_state VARCHAR(100) NOT NULL,
  current_address_pincode VARCHAR(10) NOT NULL,
  permanent_address_street VARCHAR(255) NOT NULL,
  permanent_address_city VARCHAR(100) NOT NULL,
  permanent_address_state VARCHAR(100) NOT NULL,
  permanent_address_pincode VARCHAR(10) NOT NULL,
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_relationship VARCHAR(100) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  total_rentals INTEGER DEFAULT 0,
  current_property_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating tenants table', err);
  } else {
    console.log('Tenants table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100),
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Error creating tenant_documents table', err);
  } else {
    console.log('Tenant documents table ready');
  }
});

pool.query(`CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  res.json({ message: 'Property Management API' });
});

// Mount routes
app.use('/api/properties', createPropertyRoutes(propertyController));
app.use('/api/auth', createAuthRoutes(userService, passwordResetService));
app.use('/api/tenants', createTenantRoutes(tenantController));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});