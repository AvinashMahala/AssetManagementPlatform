// Import all API group modules
import { authTags, authSchemas } from './auth/index.js';
import { usersTags, usersSchemas } from './users/index.js';
import { propertiesTags, propertiesSchemas } from './properties/index.js';
import { adminTags, adminSchemas } from './admin/index.js';
import { unitsTags, unitsSchemas } from './units/index.js';
import { tenantsTags, tenantsSchemas } from './tenants/index.js';
import { leasesTags, leasesSchemas } from './leases/index.js';
import { paymentsTags, paymentsSchemas } from './payments/index.js';
import { receiptTemplatesTags, receiptTemplatesSchemas } from './receipt-templates/schemas.js';
import { commonSchemas, commonSecuritySchemes, commonResponses } from './common/index.js';

import { OpenAPIV3 } from 'openapi-types';

// Combine all tags
export const allTags: OpenAPIV3.TagObject[] = [
  ...authTags,
  ...usersTags,
  ...propertiesTags,
  ...adminTags,
  ...unitsTags,
  ...tenantsTags,
  ...leasesTags,
  ...paymentsTags,
  ...receiptTemplatesTags,
];

// Combine all schemas
export const allSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ...authSchemas,
  ...usersSchemas,
  ...propertiesSchemas,
  ...adminSchemas,
  ...unitsSchemas,
  ...tenantsSchemas,
  ...leasesSchemas,
  ...paymentsSchemas,
  ...receiptTemplatesSchemas,
  ...commonSchemas,
};

export const allResponses: Record<string, OpenAPIV3.ResponseObject> = {
  ...commonResponses,
};

// Combine all security schemes
export const allSecuritySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {
  ...commonSecuritySchemes,
};