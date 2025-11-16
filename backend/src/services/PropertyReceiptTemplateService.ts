import { IPropertyReceiptTemplateRepository } from '../interfaces/repositories/IPropertyReceiptTemplateRepository';
import { IPropertyReceiptTemplateService } from '../interfaces/services/IPropertyReceiptTemplateService';
import { PropertyReceiptTemplate } from '../models/Property';
import { ERROR_MESSAGES } from '../constants/validation';

export class PropertyReceiptTemplateService implements IPropertyReceiptTemplateService {
  private repository: IPropertyReceiptTemplateRepository;

  constructor(repository: IPropertyReceiptTemplateRepository) {
    this.repository = repository;
  }

  /**
   * Create a new receipt template for a property
   */
  async createTemplate(
    propertyId: string,
    templateData: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>
  ): Promise<PropertyReceiptTemplate> {
    // Validate property ID
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Check if template already exists for this property
    const existingTemplate = await this.repository.existsForProperty(propertyId);
    if (existingTemplate) {
      throw new Error('Receipt template already exists for this property');
    }

    // Validate bank details if provided
    if (templateData.bankDetails) {
      this.validateBankDetails(templateData.bankDetails);
    }

    // Validate wallets if provided
    if (templateData.wallets && templateData.wallets.length > 0) {
      this.validateWallets(templateData.wallets);
    }

    const templateDataWithPropertyId = {
      ...templateData,
      propertyId
    };

    return await this.repository.create(templateDataWithPropertyId);
  }

  /**
   * Get receipt template by property ID
   */
  async getTemplateByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.getByPropertyId(propertyId);
  }

  /**
   * Update receipt template
   */
  async updateTemplate(
    propertyId: string,
    updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PropertyReceiptTemplate | null> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Validate bank details if being updated
    if (updates.bankDetails) {
      this.validateBankDetails(updates.bankDetails);
    }

    // Validate wallets if being updated
    if (updates.wallets) {
      this.validateWallets(updates.wallets);
    }

    return await this.repository.update(propertyId, updates);
  }

  /**
   * Delete receipt template
   */
  async deleteTemplate(propertyId: string): Promise<boolean> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.deleteByPropertyId(propertyId);
  }

  /**
   * Generate UPI payment links for wallets that have generateUPILinks enabled
   */
  generateUPILinks(
    wallets: Array<{ type: string; upiId: string; generateUPILinks: boolean }>,
    amount?: number
  ): string[] {
    const upiLinks: string[] = [];

    for (const wallet of wallets) {
      if (wallet.generateUPILinks && wallet.upiId) {
        // Generate UPI payment link
        // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=CURRENCY
        let upiLink = `upi://pay?pa=${encodeURIComponent(wallet.upiId)}`;

        // Add amount if provided
        if (amount && amount > 0) {
          upiLink += `&am=${amount}&cu=INR`;
        }

        // Add payee name (using wallet type as fallback)
        upiLink += `&pn=${encodeURIComponent(wallet.type)}`;

        upiLinks.push(upiLink);
      }
    }

    return upiLinks;
  }

  /**
   * Validate bank details
   */
  private validateBankDetails(bankDetails: any): void {
    if (!bankDetails.bankName || bankDetails.bankName.trim().length === 0) {
      throw new Error('Bank name is required');
    }

    if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length === 0) {
      throw new Error('Account number is required');
    }

    if (!bankDetails.ifscCode || bankDetails.ifscCode.trim().length === 0) {
      throw new Error('IFSC code is required');
    }

    // Basic IFSC validation (11 characters, first 4 letters, 7th character 0)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankDetails.ifscCode.toUpperCase())) {
      throw new Error('Invalid IFSC code format');
    }

    if (!bankDetails.accountHolderName || bankDetails.accountHolderName.trim().length === 0) {
      throw new Error('Account holder name is required');
    }
  }

  /**
   * Validate wallets
   */
  private validateWallets(wallets: any[]): void {
    if (!Array.isArray(wallets)) {
      throw new Error('Wallets must be an array');
    }

    if (wallets.length > 10) {
      throw new Error('Maximum 10 wallets allowed');
    }

    const validTypes = ['PAYTM', 'PHONEPE', 'GPAY', 'AMAZONPAY', 'OTHER'];

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];

      if (!wallet.type || !validTypes.includes(wallet.type)) {
        throw new Error(`Invalid wallet type at index ${i}`);
      }

      if (!wallet.upiId || wallet.upiId.trim().length === 0) {
        throw new Error(`UPI ID is required for wallet at index ${i}`);
      }

      // Basic UPI ID validation
      const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
      if (!upiRegex.test(wallet.upiId)) {
        throw new Error(`Invalid UPI ID format at index ${i}`);
      }

      if (!wallet.upiName || wallet.upiName.trim().length === 0) {
        throw new Error(`UPI name is required for wallet at index ${i}`);
      }
    }
  }
}