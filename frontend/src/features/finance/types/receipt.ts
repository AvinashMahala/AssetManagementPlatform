// Receipt-related types
export const ReceiptStatus = {
  GENERATED: 'generated',
  SENT: 'sent',
  DOWNLOADED: 'downloaded'
} as const;

export type ReceiptStatusValue = typeof ReceiptStatus[keyof typeof ReceiptStatus];

export interface ReceiptData {
  // Property information
  property: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };

  // Landlord information
  landlord: {
    name: string;
    phone?: string;
    email?: string;
  };

  // Tenant information
  tenant: {
    name: string;
    phone?: string;
    address?: string;
  };

  // Receipt details
  receiptNumber: string;
  receiptDate: string;
  period: {
    from: string;
    to: string;
  };

  // Financial breakdown
  breakdown: {
    baseRent: number;
    previousBalance: number;
    expenses: Array<{
      type: string;
      description: string;
      amount: number;
    }>;
    totalAmount: number;
    amountPaid: number;
    newBalance: number;
  };

  // Payment information
  payment: {
    method?: string;
    transactionId?: string;
    paidDate?: string;
  };

  // Receipt settings (for customization)
  settings: {
    logoUrl?: string;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      accountHolderName?: string;
    };
    wallets?: Array<{
      type: string;
      number: string;
      name: string;
    }>;
    upiId?: string;
    qrCodeUrl?: string;
    signatureUrl?: string;
    watermarkUrl?: string;
  };

  // Additional notes
  notes?: string;
  termsAndConditions?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  propertyId: string;
  rentTransactionId?: string;
  tenantId?: string;
  receiptDate: string;
  amount: number;
  description: string;
  receiptData: ReceiptData;
  pdfUrl?: string;
  fileSize?: number;
  status: ReceiptStatusValue;
  generatedBy: string;
  sentTo?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptGenerationRequest {
  paymentId: string;
  customSettings?: Partial<ReceiptData['settings']>;
  notes?: string;
}

export interface BulkReceiptGenerationRequest {
  propertyId: string;
  month: number;
  year: number;
  includeAllTenants?: boolean;
  tenantIds?: string[];
}

export interface ReceiptInput {
  propertyId: string;
  rentTransactionId?: string;
  tenantId?: string;
  receiptDate: string;
  amount: number;
  description: string;
  receiptData: ReceiptData;
  status?: ReceiptStatusValue;
  generatedBy: string;
}