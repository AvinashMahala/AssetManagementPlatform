import puppeteer from 'puppeteer';
import { ReceiptData } from '../models/Receipt';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate';
import { TemplateEngine, InvoiceTemplateData } from './templateEngine';

export class PDFGenerator {
  static async generateReceiptPDF(receiptData: ReceiptData, templateSettings?: ReceiptTemplateSettings | null): Promise<Buffer> {
    try {
      const templateData: InvoiceTemplateData = {
        propertyName: receiptData.property.name,
        propertyAddress: receiptData.property.address || '',
        propertyPhone: receiptData.property.phone || '',
        propertyEmail: receiptData.property.email || '',
        propertyCurrency: receiptData.property.currency || 'INR',
        invoiceNumber: receiptData.receiptNumber,
        invoiceDate: new Date(receiptData.receiptDate).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        billingPeriod: `${new Date(receiptData.period.from).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })} - ${new Date(receiptData.period.to).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })}`,
        tenantName: receiptData.tenant.name,
        tenantEmail: receiptData.tenant.email || '',
        tenantPhone: receiptData.tenant.phone || '',
        tenantAddress: receiptData.tenant.address || '',
        landlordName: receiptData.landlord.name,
        landlordEmail: receiptData.landlord.email || '',
        landlordPhone: receiptData.landlord.phone || '',
        charges: this.buildChargesArray(receiptData),
        totalAmount: this.formatCurrency(receiptData.breakdown.totalAmount),
        amountPaid: this.formatCurrency(receiptData.breakdown.amountPaid),
        balance: receiptData.breakdown.newBalance,
        paymentMethod: receiptData.payment.method?.toUpperCase() || 'N/A',
        paymentDate: receiptData.payment.paidDate 
          ? new Date(receiptData.payment.paidDate).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            })
          : 'N/A',
        termsAndConditions: receiptData.termsAndConditions || 
          'This invoice is generated based on the rental agreement. Payment is due as per the terms mentioned in the lease agreement.'
      };

      const template = await TemplateEngine.loadTemplate('invoice');
      const html = TemplateEngine.renderTemplate(template, templateData);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private static buildChargesArray(data: ReceiptData): Array<{ description: string; amount: number }> {
    const charges: Array<{ description: string; amount: number }> = [];
    if (data.breakdown.previousBalance > 0) {
      charges.push({ description: 'Previous Balance', amount: data.breakdown.previousBalance });
    }
    charges.push({ description: 'Base Rent', amount: data.breakdown.baseRent });
    if (data.breakdown.expenses && data.breakdown.expenses.length > 0) {
      data.breakdown.expenses.forEach((expense: any) => {
        charges.push({ description: expense.description, amount: expense.amount });
      });
    }
    return charges;
  }

  private static formatCurrency(amount: number): string {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
