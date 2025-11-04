import { Receipt, ReceiptInput, ReceiptGenerationRequest, BulkReceiptGenerationRequest, ReceiptStatus, ReceiptData } from '../models/Receipt';
import { IReceiptRepository, IReceiptService } from '../interfaces/repositories/IReceiptRepository';
import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ReceiptTemplateService } from './ReceiptTemplateService';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate';

export class ReceiptService implements IReceiptService {
  constructor(
    private receiptRepository: IReceiptRepository,
    private rentTransactionRepository: IRentTransactionRepository,
    private propertyRepository: IPropertyRepository,
    private tenantRepository: ITenantRepository,
    private userRepository: IUserRepository,
    private templateService: ReceiptTemplateService
  ) {}

  async getAllReceipts(): Promise<Receipt[]> {
    return this.receiptRepository.findAll();
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    return this.receiptRepository.findById(id);
  }

  async getReceiptByNumber(receiptNumber: string): Promise<Receipt | null> {
    return this.receiptRepository.findByReceiptNumber(receiptNumber);
  }

  async getReceiptsByProperty(propertyId: string): Promise<Receipt[]> {
    return this.receiptRepository.findByProperty(propertyId);
  }

  async getReceiptsByRentTransaction(rentTransactionId: string): Promise<Receipt[]> {
    return this.receiptRepository.findByRentTransaction(rentTransactionId);
  }

  async getReceiptsByTenant(tenantId: string): Promise<Receipt[]> {
    return this.receiptRepository.findByTenant(tenantId);
  }

  async generateReceipt(request: ReceiptGenerationRequest): Promise<Receipt> {
    // Get rent transaction details
    const rentTransaction = await this.rentTransactionRepository.findById(request.rentTransactionId);
    if (!rentTransaction) {
      throw new Error('Rent transaction not found');
    }

    // Get property details
    const property = await this.propertyRepository.findById(rentTransaction.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Get tenant details
    const tenant = await this.tenantRepository.findById(rentTransaction.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get landlord details (property owner)
    const landlord = await this.userRepository.findById(property.ownerId);
    if (!landlord) {
      throw new Error('Landlord not found');
    }

    // Generate receipt number
    const receiptNumber = await this.receiptRepository.getNextReceiptNumber(property.id, 'REC');

    // Build receipt data
    const receiptData = await this.buildReceiptData(
      receiptNumber,
      property,
      landlord,
      tenant,
      rentTransaction,
      request.customSettings,
      request.notes
    );

    // Create receipt record
    const receiptInput: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'> = {
      receiptNumber,
      propertyId: property.id,
      rentTransactionId: rentTransaction.id,
      tenantId: tenant.id,
      receiptDate: new Date(),
      amount: rentTransaction.amountPaid || rentTransaction.totalAmount,
      description: `Rent payment receipt for ${tenant.firstName} ${tenant.lastName}`,
      receiptData,
      status: ReceiptStatus.GENERATED,
      generatedBy: landlord.id // Assuming the landlord generates receipts
    };

    return this.receiptRepository.create(receiptInput);
  }

  async generateBulkReceipts(request: BulkReceiptGenerationRequest): Promise<Receipt[]> {
    // Get all rent transactions for the property in the specified month/year
    const rentTransactions = await this.rentTransactionRepository.findByPropertyAndPeriod(
      request.propertyId,
      request.month,
      request.year
    );

    // Filter by tenant IDs if specified
    let filteredTransactions = rentTransactions;
    if (!request.includeAllTenants && request.tenantIds && request.tenantIds.length > 0) {
      filteredTransactions = rentTransactions.filter((rt: any) =>
        request.tenantIds!.includes(rt.tenantId)
      );
    }

    // Generate receipts for each transaction
    const receipts: Receipt[] = [];
    for (const transaction of filteredTransactions) {
      try {
        const receipt = await this.generateReceipt({
          rentTransactionId: transaction.id
        });
        receipts.push(receipt);
      } catch (error) {
        console.error(`Failed to generate receipt for transaction ${transaction.id}:`, error);
        // Continue with other receipts
      }
    }

    return receipts;
  }

  async updateReceipt(id: string, data: Partial<ReceiptInput>): Promise<Receipt | null> {
    return this.receiptRepository.update(id, data);
  }

  async deleteReceipt(id: string): Promise<boolean> {
    return this.receiptRepository.delete(id);
  }

  async sendReceiptByEmail(receiptId: string, email: string): Promise<boolean> {
    // Update receipt status
    const success = await this.receiptRepository.updateStatus(
      receiptId,
      ReceiptStatus.SENT,
      email,
      new Date()
    );

    if (success) {
      // TODO: Implement actual email sending logic
      // This would integrate with an email service like SendGrid, AWS SES, etc.
      console.log(`Receipt ${receiptId} sent to ${email}`);
    }

    return success;
  }

  async downloadReceiptPDF(receiptId: string): Promise<Buffer> {
    // Get receipt details
    const receipt = await this.receiptRepository.findById(receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }

    // Update status to downloaded
    await this.receiptRepository.updateStatus(receiptId, ReceiptStatus.DOWNLOADED);

    // TODO: Implement actual PDF generation
    // This would use a library like pdfkit, puppeteer, or similar
    // For now, return a placeholder
    const pdfBuffer = Buffer.from('PDF content would be generated here');

    return pdfBuffer;
  }

  async updatePropertyReceiptSettings(propertyId: string, settings: any): Promise<boolean> {
    // This would update the property's receipt settings
    // The settings are stored in the property's receiptSettings field
    return this.propertyRepository.updateReceiptSettings(propertyId, settings);
  }

  async getPropertyReceiptSettings(propertyId: string): Promise<any> {
    const property = await this.propertyRepository.findById(propertyId);
    return property?.receiptSettings || {};
  }

  private mergeReceiptSettings(
    templateSettings: ReceiptTemplateSettings | null,
    propertySettings: any,
    customSettings?: any
  ): ReceiptData['settings'] {
    // Start with template settings as base
    const baseSettings: ReceiptData['settings'] = {};

    if (templateSettings) {
      // Apply template settings to the receipt data structure
      // Template settings control layout and visual aspects
      // Property settings control content like bank details, logos, etc.
    }

    // Merge with property settings (bank details, logos, etc.)
    const mergedWithProperty = {
      ...baseSettings,
      ...propertySettings
    };

    // Apply custom settings (overrides everything)
    return {
      ...mergedWithProperty,
      ...customSettings
    };
  }

  private async buildReceiptData(
    receiptNumber: string,
    property: any,
    landlord: any,
    tenant: any,
    rentTransaction: any,
    customSettings?: any,
    notes?: string
  ): Promise<ReceiptData> {
    // Get template settings for the property
    const templateSettings = await this.templateService.getPropertyTemplateSettings(property.id);

    // Use property receipt settings or defaults
    const propertySettings = property.receiptSettings || {};

    // Merge settings: template settings + property settings + custom settings
    const mergedSettings = this.mergeReceiptSettings(templateSettings, propertySettings, customSettings);

    return {
      property: {
        name: property.name,
        address: `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}`,
        phone: property.phone,
        email: property.email
      },
      landlord: {
        name: `${landlord.firstName} ${landlord.lastName}`,
        phone: landlord.phone,
        email: landlord.email
      },
      tenant: {
        name: `${tenant.firstName} ${tenant.lastName}`,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.currentAddressStreet ? `${tenant.currentAddressStreet}, ${tenant.currentAddressCity}, ${tenant.currentAddressState} - ${tenant.currentAddressPincode}` : undefined
      },
      receiptNumber,
      receiptDate: new Date(),
      period: {
        from: rentTransaction.billingPeriodStart,
        to: rentTransaction.billingPeriodEnd
      },
      breakdown: {
        baseRent: rentTransaction.baseRent || rentTransaction.amount,
        previousBalance: rentTransaction.previousBalance || 0,
        expenses: rentTransaction.expenses || [],
        totalAmount: rentTransaction.totalAmount,
        amountPaid: rentTransaction.amountPaid,
        newBalance: rentTransaction.newBalance || 0
      },
      payment: {
        method: rentTransaction.paymentMethod,
        transactionId: rentTransaction.transactionId,
        paidDate: rentTransaction.paidDate
      },
      settings: mergedSettings,
      notes,
      termsAndConditions: templateSettings?.content?.termsAndConditionsText
    };
  }
}