import { OpenAPIV3 } from 'openapi-types';

export const baseDefinition: Partial<OpenAPIV3.Document> = {
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
      url: 'http://localhost:5001/api/v1',
      description: 'Development server (v1)'
    },
    {
      url: 'https://api.assetmanagementplatform.com/api/v1',
      description: 'Production server (v1)'
    },
    {
      url: 'https://staging.assetmanagementplatform.com/api/v1',
      description: 'Staging server (v1)'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
};