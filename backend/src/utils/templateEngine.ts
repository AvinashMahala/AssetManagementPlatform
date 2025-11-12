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

  // Tenant
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAddress: string;

  // Landlord
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;

  // Charges
  charges: Array<{
    description: string;
    amount: number;
  }>;

  // Totals
  totalAmount: string;
  amountPaid: string;
  balance: number;

  // Payment
  paymentMethod: string;
  paymentDate: string;

  // Receipt Template Settings
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  upiWallets?: Array<{
    type: string;
    number: string;
    name: string;
  }>;
  upiId?: string;
  qrCodeUrl?: string;
  signatureUrl?: string;
  watermarkUrl?: string;

  // Footer
  termsAndConditions: string;
}

export class TemplateEngine {
  /**
   * Load HTML template from file
   */
  static async loadTemplate(templateName: string): Promise<string> {
    const templatePath = join(process.cwd(), 'templates', `${templateName}.html`);
    return await readFile(templatePath, 'utf-8');
  }

  /**
   * Replace placeholders in template with actual data
   */
  static renderTemplate(template: string, data: InvoiceTemplateData): string {
    let html = template;

    // Simple placeholder replacement
    html = html.replace(/{{propertyName}}/g, this.escapeHtml(data.propertyName));
    html = html.replace(/{{propertyAddress}}/g, this.escapeHtml(data.propertyAddress));
    html = html.replace(/{{propertyPhone}}/g, this.escapeHtml(data.propertyPhone));
    html = html.replace(/{{propertyEmail}}/g, this.escapeHtml(data.propertyEmail));

    html = html.replace(/{{invoiceNumber}}/g, this.escapeHtml(data.invoiceNumber));
    html = html.replace(/{{invoiceDate}}/g, this.escapeHtml(data.invoiceDate));
    html = html.replace(/{{billingPeriod}}/g, this.escapeHtml(data.billingPeriod));

    html = html.replace(/{{tenantName}}/g, this.escapeHtml(data.tenantName));
    html = html.replace(/{{tenantEmail}}/g, this.escapeHtml(data.tenantEmail));
    html = html.replace(/{{tenantPhone}}/g, this.escapeHtml(data.tenantPhone));
    html = html.replace(/{{tenantAddress}}/g, this.escapeHtml(data.tenantAddress));

    html = html.replace(/{{landlordName}}/g, this.escapeHtml(data.landlordName));
    html = html.replace(/{{landlordEmail}}/g, this.escapeHtml(data.landlordEmail));
    html = html.replace(/{{landlordPhone}}/g, this.escapeHtml(data.landlordPhone));

    html = html.replace(/{{totalAmount}}/g, data.totalAmount);
    html = html.replace(/{{amountPaid}}/g, data.amountPaid);

    html = html.replace(/{{paymentMethod}}/g, this.escapeHtml(data.paymentMethod));
    html = html.replace(/{{paymentDate}}/g, this.escapeHtml(data.paymentDate));

    // Receipt template settings
    const bankName = data.bankDetails?.bankName || data.landlordName;
    const accountNumber = data.bankDetails?.accountNumber ? this.maskAccountNumber(data.bankDetails.accountNumber) : 'XXXX1234';
    const ifscCode = data.bankDetails?.ifscCode || 'ABCD1234';
    const upiId = data.upiId || data.landlordEmail;

    html = html.replace(/{{bankName}}/g, this.escapeHtml(bankName));
    html = html.replace(/{{accountNumber}}/g, this.escapeHtml(accountNumber));
    html = html.replace(/{{ifscCode}}/g, this.escapeHtml(ifscCode));
    html = html.replace(/{{upiId}}/g, this.escapeHtml(upiId));

    html = html.replace(/{{termsAndConditions}}/g, this.escapeHtml(data.termsAndConditions));

    // Build charges row for the payment table
    // Table has: Rent (Period) | Electricity | Old Balance | Expense Added | Total Due Amount
    let rentAmount = 0;
    let electricityAmount = 0;
    let expenseAmount = 0;
    let oldBalance = 0;

    data.charges.forEach(charge => {
      const desc = charge.description.toLowerCase();
      if (desc.includes('rent') || desc.includes('rental')) {
        rentAmount += charge.amount;
      } else if (desc.includes('electric') || desc.includes('utility')) {
        electricityAmount += charge.amount;
      } else if (desc.includes('balance') || desc.includes('previous')) {
        oldBalance += charge.amount;
      } else {
        expenseAmount += charge.amount;
      }
    });

    const currencySymbol = this.getCurrencySymbol(data.propertyCurrency);

    const chargesRows = `
      <td class="amount-col">${currencySymbol}${this.formatCurrency(rentAmount, data.propertyCurrency)}</td>
      <td class="amount-col">${currencySymbol}${this.formatCurrency(electricityAmount, data.propertyCurrency)}</td>
      <td class="amount-col">${currencySymbol}${this.formatCurrency(oldBalance, data.propertyCurrency)}</td>
      <td class="amount-col">${currencySymbol}${this.formatCurrency(expenseAmount, data.propertyCurrency)}</td>
      <td class="amount-col">${currencySymbol}${this.formatCurrency(parseFloat(data.totalAmount), data.propertyCurrency)}</td>
    `;
    html = html.replace(/{{chargesRows}}/g, chargesRows);

    // Build balance row (if there's a balance due)
    let balanceRow = '';
    if (data.balance !== 0) {
      balanceRow = `
        <div class="balance-due-box">
          <div class="balance-due-label">BALANCE DUE</div>
          <div class="balance-due-amount">${currencySymbol}${this.formatCurrency(Math.abs(data.balance), data.propertyCurrency)}</div>
        </div>
      `;
    }
    html = html.replace(/{{balanceRow}}/g, balanceRow);

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
   * Mask account number for security (show only last 4 digits)
   */
  private static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return `XXXX${accountNumber.slice(-4)}`;
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
