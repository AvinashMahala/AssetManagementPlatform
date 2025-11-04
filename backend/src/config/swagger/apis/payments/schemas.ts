import { OpenAPIV3 } from 'openapi-types';

export const paymentsSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  RentPayment: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Payment ID (UUID)',
      },
      leaseId: {
        type: 'string',
        format: 'uuid',
        description: 'Lease ID (UUID)',
      },
      propertyId: {
        type: 'string',
        format: 'uuid',
        description: 'Property ID (UUID)',
      },
      tenantId: {
        type: 'string',
        format: 'uuid',
        description: 'Tenant ID (UUID)',
      },
      amount: {
        type: 'number',
        description: 'Payment amount',
      },
      dueDate: {
        type: 'string',
        format: 'date',
        description: 'Payment due date',
      },
      paidDate: {
        type: 'string',
        format: 'date-time',
        description: 'Payment date',
      },
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
        description: 'Payment status',
      },
      paymentMethod: {
        type: 'string',
        enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'net_banking', 'paytm', 'phonepe', 'amazon_pay', 'other'],
        description: 'Payment method',
      },
      transactionId: {
        type: 'string',
        description: 'Transaction reference ID',
      },
      paymentReference: {
        type: 'string',
        description: 'Payment reference',
      },
      lateFee: {
        type: 'number',
        description: 'Late payment fee',
      },
      penaltyAmount: {
        type: 'number',
        description: 'Penalty amount',
      },
      rentAmount: {
        type: 'number',
        description: 'Rent amount',
      },
      maintenanceCharges: {
        type: 'number',
        description: 'Maintenance charges',
      },
      otherCharges: {
        type: 'number',
        description: 'Other charges',
      },
      notes: {
        type: 'string',
        description: 'Payment notes',
      },
      createdBy: {
        type: 'string',
        format: 'uuid',
        description: 'Created by user ID (UUID)',
      },
      updatedBy: {
        type: 'string',
        format: 'uuid',
        description: 'Updated by user ID (UUID)',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
      },
    },
  },
  RentPaymentInput: {
    type: 'object',
    required: ['leaseId', 'propertyId', 'tenantId', 'amount', 'dueDate', 'rentAmount', 'status', 'createdBy'],
    properties: {
      leaseId: {
        type: 'string',
        format: 'uuid',
        description: 'Lease ID (UUID)',
      },
      propertyId: {
        type: 'string',
        format: 'uuid',
        description: 'Property ID (UUID)',
      },
      tenantId: {
        type: 'string',
        format: 'uuid',
        description: 'Tenant ID (UUID)',
      },
      amount: {
        type: 'number',
        description: 'Payment amount',
      },
      dueDate: {
        type: 'string',
        format: 'date',
        description: 'Payment due date',
      },
      paidDate: {
        type: 'string',
        format: 'date-time',
        description: 'Payment date',
      },
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'overdue', 'partial', 'failed'],
        default: 'pending',
        description: 'Payment status',
      },
      paymentMethod: {
        type: 'string',
        enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'net_banking', 'paytm', 'phonepe', 'amazon_pay', 'other'],
        description: 'Payment method',
      },
      transactionId: {
        type: 'string',
        description: 'Transaction reference ID',
      },
      paymentReference: {
        type: 'string',
        description: 'Payment reference',
      },
      lateFee: {
        type: 'number',
        description: 'Late payment fee',
      },
      penaltyAmount: {
        type: 'number',
        description: 'Penalty amount',
      },
      rentAmount: {
        type: 'number',
        description: 'Rent amount',
      },
      maintenanceCharges: {
        type: 'number',
        description: 'Maintenance charges',
      },
      otherCharges: {
        type: 'number',
        description: 'Other charges',
      },
      notes: {
        type: 'string',
        description: 'Payment notes',
      },
      createdBy: {
        type: 'string',
        format: 'uuid',
        description: 'Created by user ID (UUID)',
      },
      updatedBy: {
        type: 'string',
        format: 'uuid',
        description: 'Updated by user ID (UUID)',
      },
    },
  },
};