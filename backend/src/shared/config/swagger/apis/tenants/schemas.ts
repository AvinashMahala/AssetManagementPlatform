import { OpenAPIV3 } from 'openapi-types';

export const tenantsSchemas: Record<string, OpenAPIV3.SchemaObject> = {
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
};