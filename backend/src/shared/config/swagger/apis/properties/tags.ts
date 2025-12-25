import { OpenAPIV3 } from 'openapi-types';

export const propertiesTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Properties',
    description: 'Property portfolio management endpoints for creating, updating, and managing rental properties including property details, amenities, and photos',
  },
  {
    name: 'PropertyFiles',
    description: 'Endpoints for uploading, listing, and managing files attached to properties'
  },
  {
    name: 'PropertyReceiptTemplates',
    description: 'Endpoints for managing property-level receipt templates and generating UPI links'
  }
];