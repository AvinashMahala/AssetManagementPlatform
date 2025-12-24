import { OpenAPIV3 } from 'openapi-types';

export const receiptTemplatesTags: OpenAPIV3.TagObject[] = [
  {
    name: 'receipt-templates',
    description: 'Receipt template management',
  },
];

export const receiptTemplatesSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  ReceiptTemplateSettings: {
    type: 'object',
    properties: {
      theme: {
        type: 'object',
        properties: {
          primaryColor: { type: 'string', example: '#ffffff' },
          secondaryColor: { type: 'string', example: '#000000' },
          fontFamily: { type: 'string', example: 'Arial' },
          fontSize: { type: 'string', example: 'medium' },
        },
      },
      layout: {
        type: 'object',
        properties: {
          showLogo: { type: 'boolean' },
          logoPosition: { type: 'string', example: 'top-left' },
          showWatermark: { type: 'boolean' },
          paperSize: { type: 'string', example: 'a4' },
          orientation: { type: 'string', example: 'portrait' },
        },
      },
      content: { type: 'object' },
      paymentOptions: { type: 'object' },
      numbering: { type: 'object' },
    },
  },
  ReceiptTemplateInput: {
    type: 'object',
    required: ['name', 'type', 'description', 'defaultSettings'],
    properties: {
      name: { type: 'string' },
      type: { type: 'string', example: 'basic' },
      description: { type: 'string' },
      defaultSettings: { $ref: '#/components/schemas/ReceiptTemplateSettings' },
      templateHtml: { type: 'string' },
      templateCss: { type: 'string' },
      previewImageUrl: { type: 'string' },
      isActive: { type: 'boolean' },
      isDefault: { type: 'boolean' },
      sortOrder: { type: 'integer' },
    },
  },
  ReceiptTemplate: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },
      description: { type: 'string' },
      defaultSettings: { $ref: '#/components/schemas/ReceiptTemplateSettings' },
      templateHtml: { type: 'string' },
      templateCss: { type: 'string' },
      layoutConfig: { type: 'object' },
      placeholders: { type: 'object' },
      previewImageUrl: { type: 'string' },
      isActive: { type: 'boolean' },
      isDefault: { type: 'boolean' },
      sortOrder: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};

export default {};
