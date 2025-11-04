import { OpenAPIV3 } from 'openapi-types';

export const authTags: OpenAPIV3.TagObject[] = [
  {
    name: 'Authentication',
    description: 'User authentication, registration, and authorization endpoints including JWT token management, email/phone verification, and password reset functionality',
    externalDocs: {
      description: 'Authentication Guide',
      url: 'https://assetmanagementplatform.com/docs/authentication'
    }
  },
];