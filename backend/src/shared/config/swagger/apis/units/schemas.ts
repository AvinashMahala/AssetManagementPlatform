import { OpenAPIV3 } from 'openapi-types';

export const unitsSchemas: Record<string, OpenAPIV3.SchemaObject> = {
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
  UnitUtility: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      unitId: { type: 'string', format: 'uuid' },
      propertyId: { type: 'string', format: 'uuid' },
      utilityType: { type: 'string' },
      utilityName: { type: 'string' },
      isEnabled: { type: 'boolean' },
      billingMethod: { type: 'string' },
      fixedAmount: { type: 'number' },
      meterId: { type: 'string' },
      multiplier: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  UnitUtilityInput: {
    type: 'object',
    required: ['unitId', 'propertyId', 'utilityType', 'utilityName', 'billingMethod'],
    properties: {
      unitId: { type: 'string', format: 'uuid' },
      propertyId: { type: 'string', format: 'uuid' },
      utilityType: { type: 'string' },
      utilityName: { type: 'string' },
      isEnabled: { type: 'boolean' },
      billingMethod: { type: 'string' },
      fixedAmount: { type: 'number' },
      meterId: { type: 'string' },
      multiplier: { type: 'number' },
    },
  },
};