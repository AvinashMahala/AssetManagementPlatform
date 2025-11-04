// Import all API group modules
import { authTags, authSchemas } from './auth/index.js';
import { usersTags, usersSchemas } from './users/index.js';
import { propertiesTags, propertiesSchemas } from './properties/index.js';
import { unitsTags, unitsSchemas } from './units/index.js';
import { tenantsTags, tenantsSchemas } from './tenants/index.js';
import { leasesTags, leasesSchemas } from './leases/index.js';
import { paymentsTags, paymentsSchemas } from './payments/index.js';
import { commonSchemas, commonSecuritySchemes } from './common/index.js';

import { OpenAPIV3 } from 'openapi-types';

// Combine all tags
export const allTags: OpenAPIV3.TagObject[] = [
  ...authTags,
  ...usersTags,
  ...propertiesTags,
  ...unitsTags,
  ...tenantsTags,
  ...leasesTags,
  ...paymentsTags,
];

// Combine all schemas
export const allSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ...authSchemas,
  ...usersSchemas,
  ...propertiesSchemas,
  ...unitsSchemas,
  ...tenantsSchemas,
  ...leasesSchemas,
  ...paymentsSchemas,
  ...commonSchemas,
};

// Combine all security schemes
export const allSecuritySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {
  ...commonSecuritySchemes,
};