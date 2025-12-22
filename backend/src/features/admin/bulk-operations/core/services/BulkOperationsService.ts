import { IRentTransactionService } from '@/interfaces/services/IRentTransactionService';
import { IReceiptService } from '@/features/finance/receipt/core/interfaces/IReceiptRepository';
import { IPropertyRepository } from '@/interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '@/interfaces/repositories/ITenantRepository';
import { IUnitRepository } from '@/features/properties/unit/core/interfaces/IUnitRepository';
import { IUserRepository } from '@/interfaces/repositories/IUserRepository';
import { ILeaseRepository } from '@/interfaces/repositories/ILeaseRepository';
import { IRentTransactionRepository } from '@/interfaces/repositories/IRentTransactionRepository';
import { RentTransaction, RentTransactionStatus } from '@/models/RentTransaction';
import { PDFGenerator } from '@/shared/utils/pdfGenerator';
import { ReceiptData } from '@/models/Receipt';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BulkRentCollectionInput {
  unitIds: string[];
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  applyExpenses?: boolean;
  expenseIds?: string[]; // If specific expenses should be applied
  skipUnitsWithExistingTransactions?: boolean;
}

export interface BulkPaymentInput {
  transactionIds: string[];
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  paymentReference?: string;
}

export interface BulkReceiptGenerationInput {
  transactionIds: string[];
  regenerateExisting?: boolean;
}

export interface BulkCommunicationInput {
  tenantIds: string[];
  subject: string;
  message: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  attachments?: string[];
}

interface BulkExportInput {
  entityType: 'properties' | 'units' | 'tenants' | 'transactions' | 'payments' | 'receipts';
  dateRange?: {
    start: Date;
    end: Date;
  };
  propertyIds?: string[];
  unitIds?: string[];
  tenantIds?: string[];
  format: 'csv' | 'excel' | 'json' | 'pdf';
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results?: any[];
}

export class BulkOperationsService {
  private rentTransactionService: IRentTransactionService;
  private receiptService: IReceiptService;
  private propertyRepository: IPropertyRepository;
  private tenantRepository: ITenantRepository;
  private unitRepository: IUnitRepository;
  private userRepository: IUserRepository;
  private leaseRepository: ILeaseRepository;
  private rentTransactionRepository: IRentTransactionRepository;

  constructor(
    rentTransactionService: IRentTransactionService,
    receiptService: IReceiptService,
    propertyRepository: IPropertyRepository,
    tenantRepository: ITenantRepository,
    unitRepository: IUnitRepository,
    userRepository: IUserRepository,
    leaseRepository: ILeaseRepository,
    rentTransactionRepository: IRentTransactionRepository
  ) {
    this.rentTransactionService = rentTransactionService;
    this.receiptService = receiptService;
    this.propertyRepository = propertyRepository;
    this.tenantRepository = tenantRepository;
    this.unitRepository = unitRepository;
    this.userRepository = userRepository;
    this.leaseRepository = leaseRepository;
    this.rentTransactionRepository = rentTransactionRepository;
  }

  /**
   * Bulk rent collection for multiple units
   */
  async bulkRentCollection(input: BulkRentCollectionInput, userId: string): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    try {
      for (const unitId of input.unitIds) {
        try {
          // Check if transaction already exists for this period
          if (input.skipUnitsWithExistingTransactions) {
            const existingTransaction = await this.rentTransactionService.getCurrentMonthTransaction(unitId);
            if (existingTransaction) {
              results.failed++;
              results.errors.push(`Unit ${unitId}: Transaction already exists for current period`);
              continue;
            }
          }

          // Get unit details
          const unit = await this.unitRepository.findById(unitId);
          if (!unit) {
            results.failed++;
            results.errors.push(`Unit ${unitId}: Unit not found`);
            continue;
          }

          // Find current active lease for this unit
          const currentDate = new Date();
          const unitLeases = await this.leaseRepository.findAll();
          const currentLease = unitLeases.find((lease: any) =>
            lease.unitId === unitId &&
            lease.startDate <= currentDate &&
            lease.endDate >= currentDate &&
            lease.status === 'active'
          );

          if (!currentLease) {
            results.failed++;
            results.errors.push(`Unit ${unitId}: No active lease found`);
            continue;
          }

          // Generate transaction for this unit
          const transactions = await this.rentTransactionService.generateMonthlyTransactions(
            currentLease.id,
            input.billingPeriodStart,
            input.billingPeriodEnd
          );

          if (transactions && transactions.length > 0) {
            results.processed++;
            results.results!.push({
              unitId,
              transactionId: transactions[0].id,
              amount: transactions[0].totalAmount
            });
          } else {
            results.failed++;
            results.errors.push(`Unit ${unitId}: Failed to generate transaction`);
          }

        } catch (error) {
          results.failed++;
          results.errors.push(`Unit ${unitId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Bulk payment recording for multiple transactions
   */
  async bulkPaymentRecording(input: BulkPaymentInput, userId: string): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    try {
      for (const transactionId of input.transactionIds) {
        try {
          const transaction = await this.rentTransactionService.recordPayment(
            transactionId,
            input.amount,
            input.paymentMethod,
            input.paymentDate,
            input.paymentReference
          );

          if (transaction) {
            results.processed++;
            results.results!.push({
              transactionId,
              newBalance: transaction.newBalance,
              status: transaction.status
            });
          } else {
            results.failed++;
            results.errors.push(`Transaction ${transactionId}: Payment recording failed`);
          }

        } catch (error) {
          results.failed++;
          results.errors.push(`Transaction ${transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(`Bulk payment operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Bulk receipt generation for multiple transactions
   */
  async bulkReceiptGeneration(input: BulkReceiptGenerationInput, userId: string): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    try {
      for (const transactionId of input.transactionIds) {
        try {
          // Check if receipt already exists
          const transaction = await this.rentTransactionService.getTransactionById(transactionId);
          if (!transaction) {
            results.failed++;
            results.errors.push(`Transaction ${transactionId}: Not found`);
            continue;
          }

          if (transaction.receiptGenerated && !input.regenerateExisting) {
            results.failed++;
            results.errors.push(`Transaction ${transactionId}: Receipt already exists`);
            continue;
          }

          // Generate receipt
          const receiptResult = await this.rentTransactionService.generateReceipt(transactionId);

          results.processed++;
          results.results!.push({
            transactionId,
            receiptNumber: receiptResult.receiptNumber,
            pdfUrl: receiptResult.pdfUrl
          });

        } catch (error) {
          results.failed++;
          results.errors.push(`Transaction ${transactionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(`Bulk receipt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Bulk communication to tenants
   */
  async bulkTenantCommunication(input: BulkCommunicationInput, userId: string): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
      results: []
    };

    try {
      for (const tenantId of input.tenantIds) {
        try {
          const tenant = await this.tenantRepository.findById(tenantId);
          if (!tenant) {
            results.failed++;
            results.errors.push(`Tenant ${tenantId}: Not found`);
            continue;
          }

          const communicationResult = {
            tenantId,
            tenantName: `${tenant.firstName} ${tenant.lastName}`,
            channels: [] as string[]
          };

          // Send via each requested channel
          for (const channel of input.channels) {
            try {
              switch (channel) {
                case 'email':
                  if (tenant.email) {
                    // TODO: Implement email sending
                    communicationResult.channels.push('email');
                  }
                  break;
                case 'sms':
                  if (tenant.phone) {
                    // TODO: Implement SMS sending
                    communicationResult.channels.push('sms');
                  }
                  break;
                case 'whatsapp':
                  if (tenant.phone) {
                    // TODO: Implement WhatsApp sending
                    communicationResult.channels.push('whatsapp');
                  }
                  break;
              }
            } catch (error) {
              console.error(`Failed to send ${channel} to tenant ${tenantId}:`, error);
            }
          }

          if (communicationResult.channels.length > 0) {
            results.processed++;
            results.results!.push(communicationResult);
          } else {
            results.failed++;
            results.errors.push(`Tenant ${tenantId}: No valid communication channels`);
          }

        } catch (error) {
          results.failed++;
          results.errors.push(`Tenant ${tenantId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.success = false;
      results.errors.push(`Bulk communication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Bulk data export
   */
  async bulkDataExport(input: BulkExportInput, userId: string): Promise<{ fileUrl: string; fileName: string }> {
    try {
      let data: any[] = [];
      let fileName = `${input.entityType}_export_${new Date().toISOString().split('T')[0]}`;

      switch (input.entityType) {
        case 'properties':
          data = await this.propertyRepository.findAll();
          break;
        case 'units':
          if (input.propertyIds && input.propertyIds.length > 0) {
            data = await this.unitRepository.findByProperty(input.propertyIds[0]);
          } else {
            data = await this.unitRepository.findAll();
          }
          break;
        case 'tenants':
          data = await this.tenantRepository.findAll();
          break;
        case 'transactions':
          data = await this.rentTransactionRepository.findAll();
          break;
        case 'payments':
          // Payments are part of rent transactions
          data = await this.rentTransactionRepository.findAll();
          break;
        case 'receipts':
          // This would need a receipt repository - for now return empty
          data = [];
          break;
        default:
          throw new Error(`Unsupported entity type: ${input.entityType}`);
      }

      // Apply date filtering if specified
      if (input.dateRange && (input.entityType === 'transactions' || input.entityType === 'payments' || input.entityType === 'receipts')) {
        // Filter data by date range
        data = data.filter(item => {
          const itemDate = new Date(item.createdAt || item.date);
          return itemDate >= input.dateRange!.start && itemDate <= input.dateRange!.end;
        });
      }

      // Generate file based on format
      let fileContent: Buffer;
      let mimeType: string;

      switch (input.format) {
        case 'csv':
          fileContent = this.generateCSV(data);
          mimeType = 'text/csv';
          fileName += '.csv';
          break;
        case 'excel':
          fileContent = this.generateExcel(data);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileName += '.xlsx';
          break;
        case 'pdf':
          fileContent = await this.generatePDF(data, input.entityType);
          mimeType = 'application/pdf';
          fileName += '.pdf';
          break;
        default:
          throw new Error(`Unsupported format: ${input.format}`);
      }

      // Save file and return URL
      const exportsDir = path.join(__dirname, '../../public/exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filePath = path.join(exportsDir, fileName);
      fs.writeFileSync(filePath, fileContent);

      return {
        fileUrl: `/api/exports/${fileName}`,
        fileName
      };

    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Receipt validation - check for missing or invalid receipts
   */
  async validateReceipts(propertyId?: string): Promise<{
    valid: number;
    invalid: number;
    missing: number;
    details: any[];
  }> {
    try {
      // Get all paid transactions
      const paidTransactions = await this.rentTransactionService.getAllTransactions()
        .then(transactions => transactions.filter(t => t.status === RentTransactionStatus.PAID));

      const results = {
        valid: 0,
        invalid: 0,
        missing: 0,
        details: [] as any[]
      };

      for (const transaction of paidTransactions) {
        // Skip if not in requested property
        if (propertyId && transaction.propertyId !== propertyId) {
          continue;
        }

        const detail = {
          transactionId: transaction.id,
          receiptNumber: transaction.receiptNumber,
          receiptGenerated: transaction.receiptGenerated,
          status: 'valid',
          issues: [] as string[]
        };

        // Check if receipt should exist but doesn't
        if (!transaction.receiptGenerated || !transaction.receiptNumber) {
          detail.status = 'missing';
          results.missing++;
          detail.issues.push('Receipt not generated');
        } else {
          // Check if receipt file exists
          const receiptsDir = path.join(__dirname, '../../public/receipts');
          const receiptPath = path.join(receiptsDir, `${transaction.receiptNumber}.pdf`);

          if (!fs.existsSync(receiptPath)) {
            detail.status = 'invalid';
            results.invalid++;
            detail.issues.push('Receipt file not found');
          } else {
            results.valid++;
          }
        }

        results.details.push(detail);
      }

      return results;

    } catch (error) {
      throw new Error(`Receipt validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateCSV(data: any[]): Buffer {
    if (data.length === 0) return Buffer.from('');

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];

    return Buffer.from(csvRows.join('\n'));
  }

  private generateExcel(data: any[]): Buffer {
    // For now, return CSV as Excel (would need exceljs or similar library for true Excel)
    return this.generateCSV(data);
  }

  private async generatePDF(data: any[], entityType: string): Promise<Buffer> {
    // Simple PDF generation - would need pdfkit or similar for complex layouts
    const content = `
${entityType.toUpperCase()} EXPORT
Generated: ${new Date().toISOString()}

Total Records: ${data.length}

${data.map((item, index) => `
Record ${index + 1}:
${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join('\n')}
`).join('\n---\n')}
    `;

    // For now, return simple text as PDF (would need proper PDF generation)
    return Buffer.from(content);
  }
}