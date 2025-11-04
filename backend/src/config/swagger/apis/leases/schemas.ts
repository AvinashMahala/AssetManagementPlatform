import { OpenAPIV3 } from 'openapi-types';

export const leasesSchemas: Record<string, OpenAPIV3.SchemaObject> = {
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
};