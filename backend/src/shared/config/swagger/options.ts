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
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
} as swaggerJSDoc.Options;

export default options;