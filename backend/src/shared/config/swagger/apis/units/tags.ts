import { OpenAPIV3 } from 'openapi-types';

export const unitsTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Units',
    description: 'Individual unit management within properties including unit details, availability status, amenities, and rental pricing',
  },
  {
    name: 'Unit Tenants',
    description: 'Unit-tenant assignment and occupancy management endpoints for tracking tenant moves, rent sharing, and occupancy status',
  },
];