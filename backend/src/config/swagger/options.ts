import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Management Platform API',
      version: '1.0.0',
      description: 'Comprehensive API for managing rental properties, tenants, leases, and financial operations. Built for property managers and landlords to streamline property management workflows including tenant screening, lease agreements, rent collection, maintenance tracking, and financial reporting.',
      contact: {
        name: 'Asset Management Platform Support',
        email: 'support@assetmanagementplatform.com',
        url: 'https://assetmanagementplatform.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://assetmanagementplatform.com/terms',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://api.assetmanagementplatform.com',
        description: 'Production server'
      },
      {
        url: 'https://staging.assetmanagementplatform.com',
        description: 'Staging server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication, registration, and authorization endpoints including JWT token management, email/phone verification, and password reset functionality',
        externalDocs: {
          description: 'Authentication Guide',
          url: 'https://assetmanagementplatform.com/docs/authentication'
        }
      },
      {
        name: 'Users',
        description: 'User account management endpoints for administrators and regular users including profile updates, role management, and account settings',
      },
      {
        name: 'Properties',
        description: 'Property portfolio management endpoints for creating, updating, and managing rental properties including property details, amenities, and photos',
      },
      {
        name: 'Units',
        description: 'Individual unit management within properties including unit details, availability status, amenities, and rental pricing',
      },
      {
        name: 'Tenants',
        description: 'Tenant profile and document management endpoints including tenant screening, document verification, and tenant history tracking',
        externalDocs: {
          description: 'Tenant Management Guide',
          url: 'https://assetmanagementplatform.com/docs/tenants'
        }
      },
      {
        name: 'Unit Tenants',
        description: 'Unit-tenant assignment and occupancy management endpoints for tracking tenant moves, rent sharing, and occupancy status',
      },
      {
        name: 'Leases',
        description: 'Lease agreement lifecycle management including lease creation, terms negotiation, document signing, and lease termination',
        externalDocs: {
          description: 'Lease Management Guide',
          url: 'https://assetmanagementplatform.com/docs/leases'
        }
      },
      {
        name: 'Rent Payments',
        description: 'Rent payment processing and tracking endpoints including payment collection, overdue management, late fees, and financial reporting',
        externalDocs: {
          description: 'Payment Processing Guide',
          url: 'https://assetmanagementplatform.com/docs/payments'
        }
      },
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Property ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Property name',
              example: 'Sunset Apartments'
            },
            description: {
              type: 'string',
              description: 'Property description',
              example: 'Modern apartment complex with excellent amenities'
            },
            propertyType: {
              type: 'string',
              enum: ['apartment', 'house', 'villa', 'commercial', 'pg_hostel', 'co_living', 'office', 'shop', 'warehouse'],
              description: 'Type of property',
              example: 'apartment'
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'under_maintenance', 'vacant'],
              description: 'Property status',
              example: 'available'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Street address',
                  example: '123 Main Street'
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'Mumbai'
                },
                state: {
                  type: 'string',
                  description: 'State',
                  example: 'Maharashtra'
                },
                pincode: {
                  type: 'string',
                  description: 'Pincode',
                  example: '400001'
                },
                landmark: {
                  type: 'string',
                  description: 'Landmark',
                  example: 'Near Central Mall'
                },
              },
            },
            area: {
              type: 'number',
              description: 'Area in sq ft',
              example: 1200
            },
            bedrooms: {
              type: 'integer',
              description: 'Number of bedrooms',
              example: 2
            },
            bathrooms: {
              type: 'integer',
              description: 'Number of bathrooms',
              example: 2
            },
            monthlyRent: {
              type: 'number',
              description: 'Monthly rent amount',
              example: 25000
            },
            securityDeposit: {
              type: 'number',
              description: 'Security deposit amount',
              example: 50000
            },
            ownerId: {
              type: 'integer',
              description: 'Owner user ID',
              example: 1
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of amenities',
              example: ['parking', 'gym', 'swimming pool', 'security']
            },
            photos: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of photo URLs',
              example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T10:30:00Z'
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
              type: 'string',
              format: 'uuid',
              description: 'Lease ID (UUID)',
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Lease start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
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
            status: {
              type: 'string',
              enum: ['draft', 'active', 'expired', 'terminated'],
              description: 'Lease status',
            },
            noticePeriodDays: {
              type: 'integer',
              description: 'Notice period in days',
            },
            autoRenewal: {
              type: 'boolean',
              description: 'Auto renewal enabled',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Monthly maintenance charges',
            },
            paymentFrequency: {
              type: 'string',
              description: 'Payment frequency',
            },
            rentDueDay: {
              type: 'integer',
              description: 'Rent due day of month',
            },
            electricityCharges: {
              type: 'number',
              description: 'Monthly electricity charges',
            },
            waterCharges: {
              type: 'number',
              description: 'Monthly water charges',
            },
            otherCharges: {
              type: 'number',
              description: 'Other monthly charges',
            },
            petsAllowed: {
              type: 'boolean',
              description: 'Pets allowed',
            },
            smokingAllowed: {
              type: 'boolean',
              description: 'Smoking allowed',
            },
            sublettingAllowed: {
              type: 'boolean',
              description: 'Subletting allowed',
            },
            specialConditions: {
              type: 'string',
              description: 'Special lease conditions',
            },
            signedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Lease signing date',
            },
            leaseDocumentUrl: {
              type: 'string',
              description: 'Lease document URL',
            },
            terminatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Lease termination date',
            },
            terminationReason: {
              type: 'string',
              description: 'Lease termination reason',
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
          required: ['propertyId', 'tenantId', 'startDate', 'endDate', 'monthlyRent', 'securityDeposit'],
          properties: {
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Lease start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
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
            status: {
              type: 'string',
              enum: ['draft', 'active', 'expired', 'terminated'],
              default: 'draft',
              description: 'Lease status',
            },
            noticePeriodDays: {
              type: 'integer',
              description: 'Notice period in days',
            },
            autoRenewal: {
              type: 'boolean',
              description: 'Auto renewal enabled',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Monthly maintenance charges',
            },
            paymentFrequency: {
              type: 'string',
              description: 'Payment frequency',
            },
            rentDueDay: {
              type: 'integer',
              description: 'Rent due day of month',
            },
            electricityCharges: {
              type: 'number',
              description: 'Monthly electricity charges',
            },
            waterCharges: {
              type: 'number',
              description: 'Monthly water charges',
            },
            otherCharges: {
              type: 'number',
              description: 'Other monthly charges',
            },
            petsAllowed: {
              type: 'boolean',
              description: 'Pets allowed',
            },
            smokingAllowed: {
              type: 'boolean',
              description: 'Smoking allowed',
            },
            sublettingAllowed: {
              type: 'boolean',
              description: 'Subletting allowed',
            },
            specialConditions: {
              type: 'string',
              description: 'Special lease conditions',
            },
            signedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Lease signing date',
            },
            leaseDocumentUrl: {
              type: 'string',
              description: 'Lease document URL',
            },
          },
        },
        RentPayment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Payment ID (UUID)',
            },
            leaseId: {
              type: 'string',
              format: 'uuid',
              description: 'Lease ID (UUID)',
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
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
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
              description: 'Payment status',
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'net_banking', 'paytm', 'phonepe', 'amazon_pay', 'other'],
              description: 'Payment method',
            },
            transactionId: {
              type: 'string',
              description: 'Transaction reference ID',
            },
            paymentReference: {
              type: 'string',
              description: 'Payment reference',
            },
            lateFee: {
              type: 'number',
              description: 'Late payment fee',
            },
            penaltyAmount: {
              type: 'number',
              description: 'Penalty amount',
            },
            rentAmount: {
              type: 'number',
              description: 'Rent amount',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Maintenance charges',
            },
            otherCharges: {
              type: 'number',
              description: 'Other charges',
            },
            notes: {
              type: 'string',
              description: 'Payment notes',
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'Created by user ID (UUID)',
            },
            updatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'Updated by user ID (UUID)',
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
          required: ['leaseId', 'propertyId', 'tenantId', 'amount', 'dueDate', 'rentAmount', 'status', 'createdBy'],
          properties: {
            leaseId: {
              type: 'string',
              format: 'uuid',
              description: 'Lease ID (UUID)',
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
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
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
              default: 'pending',
              description: 'Payment status',
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'net_banking', 'paytm', 'phonepe', 'amazon_pay', 'other'],
              description: 'Payment method',
            },
            transactionId: {
              type: 'string',
              description: 'Transaction reference ID',
            },
            paymentReference: {
              type: 'string',
              description: 'Payment reference',
            },
            lateFee: {
              type: 'number',
              description: 'Late payment fee',
            },
            penaltyAmount: {
              type: 'number',
              description: 'Penalty amount',
            },
            rentAmount: {
              type: 'number',
              description: 'Rent amount',
            },
            maintenanceCharges: {
              type: 'number',
              description: 'Maintenance charges',
            },
            otherCharges: {
              type: 'number',
              description: 'Other charges',
            },
            notes: {
              type: 'string',
              description: 'Payment notes',
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'Created by user ID (UUID)',
            },
            updatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'Updated by user ID (UUID)',
            },
          },
        },
        Unit: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unit ID (UUID)',
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            unitNumber: {
              type: 'string',
              description: 'Unit number',
            },
            unitName: {
              type: 'string',
              description: 'Unit name',
            },
            description: {
              type: 'string',
              description: 'Unit description',
            },
            unitType: {
              type: 'string',
              enum: ['apartment', 'room', 'studio', 'penthouse', 'duplex', 'triplex'],
              description: 'Type of unit',
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'under_maintenance', 'vacant'],
              description: 'Unit status',
            },
            floor: {
              type: 'integer',
              description: 'Floor number',
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
            balconies: {
              type: 'integer',
              description: 'Number of balconies',
            },
            furnished: {
              type: 'boolean',
              description: 'Whether unit is furnished',
            },
            maxOccupants: {
              type: 'integer',
              description: 'Maximum number of occupants',
            },
            unitAmenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of unit amenities',
            },
            unitPhotos: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of unit photo URLs',
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
        UnitInput: {
          type: 'object',
          required: ['propertyId', 'unitNumber', 'unitType', 'area', 'monthlyRent', 'securityDeposit'],
          properties: {
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID (UUID)',
            },
            unitNumber: {
              type: 'string',
              description: 'Unit number',
            },
            unitName: {
              type: 'string',
              description: 'Unit name',
            },
            description: {
              type: 'string',
              description: 'Unit description',
            },
            unitType: {
              type: 'string',
              enum: ['apartment', 'room', 'studio', 'penthouse', 'duplex', 'triplex'],
              description: 'Type of unit',
            },
            status: {
              type: 'string',
              enum: ['available', 'occupied', 'under_maintenance', 'vacant'],
              default: 'available',
              description: 'Unit status',
            },
            floor: {
              type: 'integer',
              description: 'Floor number',
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
            balconies: {
              type: 'integer',
              description: 'Number of balconies',
            },
            furnished: {
              type: 'boolean',
              description: 'Whether unit is furnished',
            },
            maxOccupants: {
              type: 'integer',
              description: 'Maximum number of occupants',
            },
            unitAmenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of unit amenities',
            },
            unitPhotos: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of unit photo URLs',
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
          },
        },
        UnitTenant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Assignment ID (UUID)',
            },
            unitId: {
              type: 'string',
              format: 'uuid',
              description: 'Unit ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
            },
            isPrimaryTenant: {
              type: 'boolean',
              description: 'Whether this is the primary tenant',
            },
            moveInDate: {
              type: 'string',
              format: 'date',
              description: 'Move-in date',
            },
            moveOutDate: {
              type: 'string',
              format: 'date',
              description: 'Move-out date',
            },
            monthlyRentShare: {
              type: 'number',
              description: 'Monthly rent share amount',
            },
            securityDepositShare: {
              type: 'number',
              description: 'Security deposit share amount',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'evicted'],
              description: 'Assignment status',
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
        UnitTenantInput: {
          type: 'object',
          required: ['unitId', 'tenantId', 'monthlyRentShare', 'securityDepositShare'],
          properties: {
            unitId: {
              type: 'string',
              format: 'uuid',
              description: 'Unit ID (UUID)',
            },
            tenantId: {
              type: 'string',
              format: 'uuid',
              description: 'Tenant ID (UUID)',
            },
            isPrimaryTenant: {
              type: 'boolean',
              default: false,
              description: 'Whether this is the primary tenant',
            },
            moveInDate: {
              type: 'string',
              format: 'date',
              description: 'Move-in date',
            },
            moveOutDate: {
              type: 'string',
              format: 'date',
              description: 'Move-out date',
            },
            monthlyRentShare: {
              type: 'number',
              description: 'Monthly rent share amount',
            },
            securityDepositShare: {
              type: 'number',
              description: 'Security deposit share amount',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'evicted'],
              default: 'active',
              description: 'Assignment status',
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

export default options;