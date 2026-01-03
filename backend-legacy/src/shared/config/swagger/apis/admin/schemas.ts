import { OpenAPIV3 } from 'openapi-types';

export const adminSchemas: Record<string, OpenAPIV3.SchemaObject> = {
	BulkErrorItem: {
		type: 'object',
		properties: {
			index: { type: 'integer', example: 0 },
			itemId: { type: 'string', example: 'unit-123' },
			message: { type: 'string', example: 'Missing balance for unit' },
			details: { type: 'object' }
		}
	},
	BulkOperationResult: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			message: { type: 'string', example: 'Bulk operation completed' },
			processed: { type: 'integer', example: 10 },
			failed: { type: 'integer', example: 0 },
			errors: {
				type: 'array',
				items: { $ref: '#/components/schemas/BulkErrorItem' }
			},
			data: { type: 'object' }
		}
	},
	BulkExportResult: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			message: { type: 'string', example: 'Bulk export completed' },
			exportId: { type: 'string', example: 'export-abc123' },
			downloadUrl: { type: 'string', example: 'https://example.com/exports/export-abc123.csv' }
		}
	},
	ReceiptValidationResult: {
		type: 'object',
		properties: {
			success: { type: 'boolean', example: true },
			message: { type: 'string', example: 'Validation completed' },
			issues: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'string', example: 'receipt-1' },
						issue: { type: 'string', example: 'Missing amount' }
					}
				}
			}
		}
	}
};
