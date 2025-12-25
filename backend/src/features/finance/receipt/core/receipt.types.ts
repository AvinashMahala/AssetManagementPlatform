
export enum ReceiptStatus {
  GENERATED = 'generated',
  SENT = 'sent',
  DOWNLOADED = 'downloaded'
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  propertyId: string;
  rentTransactionId?: string;
  tenantId?: string;
  receiptDate: Date;
  amount: number;
  description: string;
  receiptData: ReceiptData;
  pdfUrl?: string;
  fileSize?: number;
  status: ReceiptStatus;
  generatedBy: string;
  sentTo?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptData {
  property: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    currency?: string;
  };
  landlord: {
    name: string;
    phone?: string;
    email?: string;
  };
  tenant: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  receiptNumber: string;
  receiptDate: string;
  period: {
    from: string;
    to: string;
  };
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
  payment: {
    method?: string;
    transactionId?: string;
    paidDate?: string;
  };
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
  notes?: string;
  termsAndConditions?: string;
  watermarkText?: string;
  isInvoice?: boolean;
}

export interface ReceiptInput {
  propertyId: string;
  rentTransactionId?: string;
  tenantId?: string;
  receiptDate: Date;
  amount: number;
  description: string;
  receiptData: ReceiptData;
  status?: ReceiptStatus;
  generatedBy: string;
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
