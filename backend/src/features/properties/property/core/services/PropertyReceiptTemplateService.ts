import { IPropertyReceiptTemplateRepository } from '../interfaces/IPropertyReceiptTemplateRepository';
import { PropertyReceiptTemplate, BankDetails, WalletDetails } from '../types/property.types';
import { ERROR_MESSAGES } from '@/shared/constants/validation';

export class PropertyReceiptTemplateService {
  constructor(private repository: IPropertyReceiptTemplateRepository) {}

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
    const exists = await this.repository.existsForProperty(propertyId);
    if (exists) {
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

    // Validate bank details if provided
    if (updates.bankDetails) {
      this.validateBankDetails(updates.bankDetails);
    }

    // Validate wallets if provided
    if (updates.wallets && updates.wallets.length > 0) {
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
    return await this.repository.delete(propertyId);
  }

  /**
   * Generate UPI links for wallets
   */
  generateUPILinks(wallets: WalletDetails[], amount?: number): { walletName: string; upiLink: string }[] {
    if (!wallets || wallets.length === 0) {
      return [];
    }

    return wallets.map(wallet => {
      let upiLink = `upi://pay?pa=${wallet.upiId}&pn=${encodeURIComponent(wallet.upiName)}`;
      if (amount) {
        upiLink += `&am=${amount}`;
      }
      return {
        walletName: wallet.upiName,
        upiLink
      };
    });
  }

  private validateBankDetails(bankDetails: BankDetails): void {
    if (!bankDetails.bankName || bankDetails.bankName.trim().length === 0) {
      throw new Error('Bank name is required');
    }
    if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length === 0) {
      throw new Error('Account number is required');
    }
    if (!bankDetails.ifscCode || bankDetails.ifscCode.trim().length === 0) {
      throw new Error('IFSC code is required');
    }
    if (!bankDetails.accountHolderName || bankDetails.accountHolderName.trim().length === 0) {
      throw new Error('Account holder name is required');
    }
  }

  private validateWallets(wallets: WalletDetails[]): void {
    for (const wallet of wallets) {
      if (!wallet.type) {
        throw new Error('Wallet type is required');
      }
      if (!wallet.upiPhoneNumber && !wallet.upiId) {
        throw new Error('Either UPI phone number or UPI ID is required');
      }
    }
  }
}
