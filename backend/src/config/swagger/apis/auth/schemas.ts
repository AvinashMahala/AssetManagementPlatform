import { OpenAPIV3 } from 'openapi-types';

export const authSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      username: {
        type: 'string',
        description: 'Username',
        example: 'john_doe'
      },
      email: {
        type: 'string',
        description: 'Email address',
        example: 'john.doe@example.com'
      },
      phone: {
        type: 'string',
        description: 'Phone number',
        example: '+91-9876543210'
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        description: 'User role',
        example: 'user'
      },
      isEmailVerified: {
        type: 'boolean',
        description: 'Email verification status',
        example: true
      },
      isPhoneVerified: {
        type: 'boolean',
        description: 'Phone verification status',
        example: false
      },
      profilePicture: {
        type: 'string',
        description: 'Profile picture URL',
        example: 'https://example.com/profile.jpg'
      },
      lastLogin: {
        type: 'string',
        format: 'date-time',
        description: 'Last login timestamp',
        example: '2024-01-15T14:30:00Z'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Account creation timestamp',
        example: '2024-01-10T09:00:00Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2024-01-15T14:30:00Z'
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
};