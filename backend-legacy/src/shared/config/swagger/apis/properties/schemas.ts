import { OpenAPIV3 } from 'openapi-types';

export const propertiesSchemas: Record<string, OpenAPIV3.SchemaObject> = {
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
};