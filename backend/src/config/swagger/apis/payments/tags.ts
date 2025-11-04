import { OpenAPIV3 } from 'openapi-types';

export const paymentsTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Rent Payments',
    description: 'Rent payment processing and tracking endpoints including payment collection, overdue management, late fees, and financial reporting',
    externalDocs: {
      description: 'Payment Processing Guide',
      url: 'https://assetmanagementplatform.com/docs/payments'
    }
  },
];