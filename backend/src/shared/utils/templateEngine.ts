import { readFile } from 'fs/promises';
import { join } from 'path';

export interface InvoiceTemplateData {
  // Property
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  propertyEmail: string;
  propertyCurrency: string; // Currency code (e.g., 'INR', 'USD', 'EUR')

  // Invoice
  invoiceNumber: string;
  invoiceDate: string;
  billingPeriod: string;
  generationDate: string;
  generationTime?: string;

  // Tenant
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAddress: string;

  // Unit/Room Details
  unitNumber: string;
  unitType?: string;

  // Landlord/Owner
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  ownerName: string;

  // Charges
  charges: Array<{
    description: string;
    amount: number;
  }>;

  // Electricity Details
  meterNumber?: string;
  ratePerUnit?: string;
  previousReading?: string;
  currentReading?: string;
  unitsConsumed?: string;
  electricityCharges?: string;

  // Payment Breakdown
  rentAmount: string;
  previousBalance?: string;
  additionalExpense?: string;
  subtotal?: string;
  lateFee?: string;
  discount?: string;

  // Totals
  totalAmount: string;
  amountPaid: string;
  balance: number;

  // Payment
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  referenceNumber?: string;
  processedBy?: string;
  
  // Balance Status
  remainingBalance?: string;
  balanceStatusText?: string;
  nextDueDate?: string;
  outstandingAmount?: string;

  // Receipt Template Settings
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  upiWallets?: Array<{
    type: string;
    number: string;
    name: string;
  }>;
  upiId?: string;
  qrCodeUrl?: string;
  signatureUrl?: string;
  watermarkUrl?: string;

  // Watermark settings
  watermarkText?: string;
  isInvoice?: boolean;

  // Footer
  termsAndConditions: string;
}

export class TemplateEngine {
  /**
   * Load HTML template from file with inlined CSS
   */
  static async loadTemplate(templateName: string): Promise<string> {
    const templatePath = join(process.cwd(), 'templates', `${templateName}.html`);
    const cssPath = join(process.cwd(), 'templates', `${templateName}.css`);
    
    let html = await readFile(templatePath, 'utf-8');
    
    // Try to load and inline CSS
    try {
      const css = await readFile(cssPath, 'utf-8');
      // Replace the <link> tag with inline <style>
      html = html.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'][^"']+\.css["']\s*\/?>/gi,
        `<style>${css}</style>`
      );
    } catch (error) {
      console.warn(`CSS file not found for template ${templateName}, skipping inline styles`);
    }
    
    return html;
  }

  /**
   * Replace placeholders in template with actual data
   */
  static renderTemplate(template: string, data: InvoiceTemplateData): string {
    let html = template;

    // Simple placeholder replacement
    // Property details
    html = html.replace(/{{propertyName}}/g, this.escapeHtml(data.propertyName));
    html = html.replace(/{{propertyAddress}}/g, this.escapeHtml(data.propertyAddress));
    html = html.replace(/{{propertyPhone}}/g, this.escapeHtml(data.propertyPhone));
    html = html.replace(/{{propertyEmail}}/g, this.escapeHtml(data.propertyEmail));

    // Invoice details
    html = html.replace(/{{invoiceNumber}}/g, this.escapeHtml(data.invoiceNumber));
    html = html.replace(/{{invoiceDate}}/g, this.escapeHtml(data.invoiceDate));
    html = html.replace(/{{billingPeriod}}/g, this.escapeHtml(data.billingPeriod));
    html = html.replace(/{{generationDate}}/g, this.escapeHtml(data.generationDate));
    html = html.replace(/{{generationTime}}/g, this.escapeHtml(data.generationTime || ''));

    // Tenant details
    html = html.replace(/{{tenantName}}/g, this.escapeHtml(data.tenantName));
    html = html.replace(/{{tenantEmail}}/g, this.escapeHtml(data.tenantEmail));
    html = html.replace(/{{tenantPhone}}/g, this.escapeHtml(data.tenantPhone));
    html = html.replace(/{{tenantAddress}}/g, this.escapeHtml(data.tenantAddress));

    // Unit details
    html = html.replace(/{{unitNumber}}/g, this.escapeHtml(data.unitNumber));
    html = html.replace(/{{unitType}}/g, this.escapeHtml(data.unitType || ''));

    // Owner details
    html = html.replace(/{{landlordName}}/g, this.escapeHtml(data.landlordName));
    html = html.replace(/{{landlordEmail}}/g, this.escapeHtml(data.landlordEmail));
    html = html.replace(/{{landlordPhone}}/g, this.escapeHtml(data.landlordPhone));
    html = html.replace(/{{ownerName}}/g, this.escapeHtml(data.ownerName));

    // Electricity details
    html = html.replace(/{{meterNumber}}/g, this.escapeHtml(data.meterNumber || 'N/A'));
    html = html.replace(/{{ratePerUnit}}/g, this.escapeHtml(data.ratePerUnit || '0'));
    html = html.replace(/{{previousReading}}/g, this.escapeHtml(data.previousReading || '0'));
    html = html.replace(/{{currentReading}}/g, this.escapeHtml(data.currentReading || '0'));
    html = html.replace(/{{unitsConsumed}}/g, this.escapeHtml(data.unitsConsumed || '0'));
    html = html.replace(/{{electricityCharges}}/g, this.escapeHtml(data.electricityCharges || '0'));

    // Payment breakdown
    html = html.replace(/{{rentAmount}}/g, data.rentAmount);
    html = html.replace(/{{previousBalance}}/g, data.previousBalance || '0');
    html = html.replace(/{{additionalExpense}}/g, data.additionalExpense || '0');
    html = html.replace(/{{subtotal}}/g, data.subtotal || data.totalAmount);
    html = html.replace(/{{lateFee}}/g, data.lateFee || '0');
    html = html.replace(/{{discount}}/g, data.discount || '0');

    // Totals and payment
    html = html.replace(/{{totalAmount}}/g, data.totalAmount);
    html = html.replace(/{{amountPaid}}/g, data.amountPaid);
    html = html.replace(/{{paymentMethod}}/g, this.escapeHtml(data.paymentMethod));
    html = html.replace(/{{paymentDate}}/g, this.escapeHtml(data.paymentDate));
    html = html.replace(/{{transactionId}}/g, this.escapeHtml(data.transactionId || 'N/A'));
    html = html.replace(/{{referenceNumber}}/g, this.escapeHtml(data.referenceNumber || 'N/A'));
    html = html.replace(/{{processedBy}}/g, this.escapeHtml(data.processedBy || 'System'));

    // Balance status
    html = html.replace(/{{remainingBalance}}/g, data.remainingBalance || '0');
    html = html.replace(/{{balanceStatusText}}/g, this.escapeHtml(data.balanceStatusText || 'PAID'));
    html = html.replace(/{{nextDueDate}}/g, this.escapeHtml(data.nextDueDate || 'N/A'));
    html = html.replace(/{{outstandingAmount}}/g, data.outstandingAmount || '0');

    // Receipt template settings (bank details)
    const bankName = data.bankName || data.bankDetails?.bankName || data.landlordName;
    const accountNumber = data.accountNumber || data.bankDetails?.accountNumber || 'XXXX1234';
    const ifscCode = data.ifscCode || data.bankDetails?.ifscCode || 'ABCD1234';
    const accountHolderName = data.accountHolderName || data.bankDetails?.accountHolderName || data.landlordName;
    const upiId = data.upiId || data.landlordEmail;

    html = html.replace(/{{bankName}}/g, this.escapeHtml(bankName));
    html = html.replace(/{{accountNumber}}/g, this.escapeHtml(accountNumber));
    html = html.replace(/{{ifscCode}}/g, this.escapeHtml(ifscCode));
    html = html.replace(/{{accountHolderName}}/g, this.escapeHtml(accountHolderName));
    html = html.replace(/{{upiId}}/g, this.escapeHtml(upiId));

    html = html.replace(/{{termsAndConditions}}/g, this.escapeHtml(data.termsAndConditions));

    // Watermark settings
    if (data.watermarkText) {
      html = html.replace(/{{watermarkText}}/g, this.escapeHtml(data.watermarkText));
    }
    if (data.isInvoice !== undefined) {
      html = html.replace(/{{isInvoice}}/g, data.isInvoice ? 'true' : 'false');
    }

    // Note: New template uses individual field replacements instead of dynamic table generation

    return html;
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Format currency with proper decimals and thousand separators
   */
  private static formatCurrency(amount: number, currency: string = 'INR'): string {
    const currencyLocales: Record<string, string> = {
      'INR': 'en-IN',
      'USD': 'en-US',
      'EUR': 'en-EU',
      'GBP': 'en-GB',
      'AUD': 'en-AU',
      'CAD': 'en-CA',
      'JPY': 'ja-JP',
      'CNY': 'zh-CN'
    };

    const locale = currencyLocales[currency] || 'en-US';

    return amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Get currency symbol for a given currency code
   */
  private static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥',
      'CNY': '¥'
    };

    return symbols[currency] || currency;
  }
}
