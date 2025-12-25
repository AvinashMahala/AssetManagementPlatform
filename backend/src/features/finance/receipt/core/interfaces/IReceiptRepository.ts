import { Receipt, ReceiptInput, ReceiptGenerationRequest, BulkReceiptGenerationRequest } from '@/features/finance/receipt/core/receipt.types';
import { ReceiptTemplateSettings } from '@/features/finance/receipt-template/core/receipt-template.types';

export interface IReceiptRepository {
  findAll(): Promise<Receipt[]>;
  findById(id: string): Promise<Receipt | null>;
  findByReceiptNumber(receiptNumber: string): Promise<Receipt | null>;
  findByProperty(propertyId: string): Promise<Receipt[]>;
  findByRentTransaction(rentTransactionId: string): Promise<Receipt[]>;
  findByTenant(tenantId: string): Promise<Receipt[]>;
  create(data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt>;
  update(id: string, data: Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Receipt | null>;
  delete(id: string): Promise<boolean>;
  getNextReceiptNumber(propertyId: string, prefix?: string): Promise<string>;
  getNextReceiptNumberWithTemplate(propertyId: string, templateSettings: ReceiptTemplateSettings | null): Promise<string>;
  updateStatus(id: string, status: string, sentTo?: string, sentAt?: Date): Promise<boolean>;
}

export interface IReceiptService {
  getAllReceipts(): Promise<Receipt[]>;
  getReceiptById(id: string): Promise<Receipt | null>;
  getReceiptByNumber(receiptNumber: string): Promise<Receipt | null>;
  getReceiptsByProperty(propertyId: string): Promise<Receipt[]>;
  getReceiptsByRentTransaction(rentTransactionId: string): Promise<Receipt[]>;
  getReceiptsByTenant(tenantId: string): Promise<Receipt[]>;
  generateReceipt(request: ReceiptGenerationRequest): Promise<Receipt>;
  generateBulkReceipts(request: BulkReceiptGenerationRequest): Promise<Receipt[]>;
  updateReceipt(id: string, data: Partial<ReceiptInput>): Promise<Receipt | null>;
  deleteReceipt(id: string): Promise<boolean>;
  sendReceiptByEmail(receiptId: string, email: string): Promise<boolean>;
  downloadReceiptPDF(receiptId: string): Promise<Buffer>;
  updatePropertyReceiptSettings(propertyId: string, settings: any): Promise<boolean>;
  getPropertyReceiptSettings(propertyId: string): Promise<any>;
}