import { OpenAPIV3 } from 'openapi-types';

export const commonSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  Error: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        description: 'Error message',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  Success: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        description: 'Success message',
      },
      data: {
        type: 'object',
        description: 'Response data',
      },
    },
  },
};

export const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
  BadRequest: {
    description: 'Bad request',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  },
  NotFound: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  },
  InternalError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  },
};

export const commonSecuritySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};