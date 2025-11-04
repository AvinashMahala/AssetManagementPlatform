import { OpenAPIV3 } from 'openapi-types';

export const tenantsTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Tenants',
    description: 'Tenant profile and document management endpoints including tenant screening, document verification, and tenant history tracking',
    externalDocs: {
      description: 'Tenant Management Guide',
      url: 'https://assetmanagementplatform.com/docs/tenants'
    }
  },
];