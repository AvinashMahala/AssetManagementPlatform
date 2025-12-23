import swaggerJSDoc from 'swagger-jsdoc';
import { baseDefinition } from './base.js';
import { allTags, allSchemas, allSecuritySchemes } from './apis/index.js';

const options = {
  definition: {
    ...baseDefinition,
    tags: allTags,
    components: {
      schemas: allSchemas,
      securitySchemes: allSecuritySchemes,
    },
  },
  apis: [
    './src/features/**/api/*.ts',
    './src/features/**/api/*.routes.ts',
    './src/shared/config/swagger/apis/**/*.ts'
  ],
} as swaggerJSDoc.Options;

export default options;