import { OpenAPIV3 } from 'openapi-types';

export const leasesTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Leases',
    description: 'Lease agreement lifecycle management including lease creation, terms negotiation, document signing, and lease termination',
    externalDocs: {
      description: 'Lease Management Guide',
      url: 'https://assetmanagementplatform.com/docs/leases'
    }
  },
];