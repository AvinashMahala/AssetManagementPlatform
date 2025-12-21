import { Receipt, ReceiptInput, ReceiptGenerationRequest, BulkReceiptGenerationRequest, ReceiptStatus, ReceiptData } from '../models/Receipt';
import { IReceiptRepository, IReceiptService } from '../interfaces/repositories/IReceiptRepository';
import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { IRentPaymentRepository } from '../interfaces/repositories/IRentPaymentRepository';
import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { TenantService } from './TenantService';
import { RentPaymentService } from './RentPaymentService';
import { UserService } from './UserService';
import { LeaseService } from './LeaseService';
import { ReceiptTemplateService } from './ReceiptTemplateService';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate';
import { PDFGenerator } from '@/shared/utils/pdfGenerator';
import { RentPayment } from '../models/RentPayment';

export class ReceiptService implements IReceiptService {
  constructor(
    private receiptRepository: IReceiptRepository,
    private rentTransactionRepository: IRentTransactionRepository,
    private rentPaymentRepository: IRentPaymentRepository,
    private leaseRepository: ILeaseRepository,
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

  async generateReceipt(request: ReceiptGenerationRequest, providedTemplateSettings?: ReceiptTemplateSettings | null): Promise<Receipt> {
    // Get payment details
    const payment = await this.rentPaymentRepository.findById(request.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Get lease details to get property and tenant info
    const lease = await this.leaseRepository.findById(payment.leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Get property details
    const property = await this.propertyRepository.findById(lease.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Get tenant details
    const tenant = await this.tenantRepository.findById(lease.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get landlord details (property owner)
    const landlord = await this.userRepository.findById(property.ownerId);
    if (!landlord) {
      throw new Error('Landlord not found');
    }

    // Validate template configuration before generating receipt
    const templateValidation = await this.templateService.validatePropertyTemplateConfiguration(property.id);
    if (!templateValidation.isValid) {
      throw new Error(`Template validation failed: ${templateValidation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (templateValidation.warnings.length > 0) {
      console.warn(`Template warnings for property ${property.id}: ${templateValidation.warnings.join(', ')}`);
    }

    // Get template settings for the property (use provided or validated settings)
    const templateSettings = providedTemplateSettings !== undefined 
      ? providedTemplateSettings 
      : templateValidation.templateSettings;

    // Generate receipt number based on template settings
    const receiptNumber = await this.receiptRepository.getNextReceiptNumberWithTemplate(property.id, templateSettings);

    // Build receipt data
    const receiptData = await this.buildReceiptData(
      receiptNumber,
      property,
      landlord,
      tenant,
      payment,
      request.customSettings,
      request.notes,
      templateSettings
    );

    // Create receipt record
    const receiptInput: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'> = {
      receiptNumber,
      propertyId: property.id,
      rentTransactionId: undefined, // Not using rent transactions
      tenantId: tenant.id,
      receiptDate: new Date(),
      amount: payment.amount,
      description: `Rent payment receipt for ${tenant.firstName} ${tenant.lastName}`,
      receiptData,
      status: ReceiptStatus.GENERATED,
      generatedBy: landlord.id // Assuming the landlord generates receipts
    };

    return this.receiptRepository.create(receiptInput);
  }

  async generateBulkReceipts(request: BulkReceiptGenerationRequest): Promise<Receipt[]> {
    // Validate template configuration before bulk generation
    const templateValidation = await this.templateService.validatePropertyTemplateConfiguration(request.propertyId);
    if (!templateValidation.isValid) {
      throw new Error(`Template validation failed for bulk receipt generation: ${templateValidation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (templateValidation.warnings.length > 0) {
      console.warn(`Template warnings for property ${request.propertyId}: ${templateValidation.warnings.join(', ')}`);
    }

    // Get template settings for the property once
    const templateSettings = templateValidation.templateSettings;

    // Get all payments for the property
    const allPayments = await this.rentPaymentRepository.findByProperty(request.propertyId);

    // Filter by month/year and tenant IDs
    const filteredPayments = allPayments.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate);
      const matchesPeriod = paymentDate.getMonth() === request.month - 1 && paymentDate.getFullYear() === request.year;
      const matchesTenant = request.includeAllTenants || !request.tenantIds || request.tenantIds.includes(payment.tenantId);
      return matchesPeriod && matchesTenant;
    });

    // Generate receipts for each payment using the same template settings
    const receipts: Receipt[] = [];
    for (const payment of filteredPayments) {
      try {
        const receipt = await this.generateReceipt({
          paymentId: payment.id
        }, templateSettings);
        receipts.push(receipt);
      } catch (error) {
        console.error(`Failed to generate receipt for payment ${payment.id}:`, error);
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

    // Get template settings for the property
    const templateSettings = await this.templateService.getPropertyTemplateSettings(receipt.propertyId);

    // Generate PDF from receipt data with template settings
    const pdfBuffer = await PDFGenerator.generateReceiptPDF(receipt.receiptData, templateSettings);

    // Update status to downloaded
    await this.receiptRepository.updateStatus(receiptId, ReceiptStatus.DOWNLOADED);

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
    // Start with default settings
    const baseSettings: ReceiptData['settings'] = {};

    // Template settings control layout and visual aspects, but don't directly map to receipt data settings
    // The receipt data settings are primarily controlled by property settings

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
    payment: RentPayment,
    customSettings?: any,
    notes?: string,
    templateSettings?: ReceiptTemplateSettings | null
  ): Promise<ReceiptData> {
    // Use provided template settings or fetch if not provided
    const finalTemplateSettings = templateSettings !== undefined ? templateSettings : await this.templateService.getPropertyTemplateSettings(property.id);

    // Use property receipt settings or defaults
    const propertySettings = property.receiptSettings || {};

    // Merge settings: template settings + property settings + custom settings
    const mergedSettings = this.mergeReceiptSettings(finalTemplateSettings, propertySettings, customSettings);

    // For payments, we don't have detailed billing period info, so we'll use the payment date
    const paymentDate = payment.paidDate || payment.dueDate;
    const periodStart = new Date(paymentDate);
    periodStart.setMonth(periodStart.getMonth() - 1); // Assume previous month
    const periodEnd = new Date(paymentDate);

    // Convert Decimal values to numbers for JSON serialization
    const amount = payment.amount;
    const rentAmount = amount; // Use the payment amount as rent amount since no separate field exists

    // Build property info based on template settings
    const propertyInfo = {
      name: property.name,
      address: finalTemplateSettings?.content?.showPropertyAddress !== false
        ? `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}`
        : '', // Empty string when address is hidden
      phone: property.phone,
      email: property.email
    };

    // Build tenant info based on template settings
    const tenantInfo = {
      name: `${tenant.firstName} ${tenant.lastName}`,
      phone: tenant.phone,
      email: tenant.email,
      address: (finalTemplateSettings?.content?.showTenantAddress !== false && tenant.currentAddress)
        ? `${tenant.currentAddress.street}, ${tenant.currentAddress.city}, ${tenant.currentAddress.state} - ${tenant.currentAddress.pincode}`
        : undefined
    };

    // Build breakdown based on template settings
    const breakdown = {
      baseRent: finalTemplateSettings?.content?.showPaymentBreakdown !== false ? rentAmount : 0,
      previousBalance: finalTemplateSettings?.content?.showBalanceForward !== false ? 0 : 0, // Payments don't track previous balance
      expenses: [], // Payments don't have detailed expense breakdown
      totalAmount: amount,
      amountPaid: amount,
      newBalance: 0 // Payments don't track balance
    };

    return {
      property: propertyInfo,
      landlord: {
        name: landlord.name || landlord.username, // Use name field or fallback to username
        phone: landlord.phone,
        email: landlord.email
      },
      tenant: tenantInfo,
      receiptNumber,
      receiptDate: new Date().toISOString(),
      period: {
        from: periodStart.toISOString(),
        to: periodEnd.toISOString()
      },
      breakdown,
      payment: {
        method: payment.paymentMethod || undefined,
        transactionId: undefined, // Transaction ID not available in current payment model
        paidDate: payment.paidDate ? payment.paidDate.toISOString() : undefined
      },
      settings: mergedSettings,
      notes,
      termsAndConditions: finalTemplateSettings?.content?.showTermsAndConditions !== false
        ? finalTemplateSettings?.content?.termsAndConditionsText
        : undefined
    };
  }
}