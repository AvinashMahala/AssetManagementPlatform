import puppeteer from 'puppeteer';
import { ReceiptData } from '@/models/Receipt';
import { ReceiptTemplateSettings } from '@/models/ReceiptTemplate';
import { TemplateEngine, InvoiceTemplateData } from './templateEngine';

export class PDFGenerator {
  static async generateReceiptPDF(receiptData: ReceiptData, templateSettings?: ReceiptTemplateSettings | null, isInvoice: boolean = false): Promise<Buffer> {
    try {
      // Calculate electricity details from expenses
      const electricityCharge = receiptData.breakdown.expenses?.find((e: any) => 
        e.description.toLowerCase().includes('electric') || e.description.toLowerCase().includes('utility')
      );
      
      // Safe access to metadata if it exists
      const previousReading = (electricityCharge as any)?.metadata?.previousReading || 0;
      const currentReading = (electricityCharge as any)?.metadata?.currentReading || 0;
      const unitsConsumed = currentReading - previousReading;
      const ratePerUnit = unitsConsumed > 0 ? (electricityCharge?.amount || 0) / unitsConsumed : 0;

      // Calculate payment breakdown
      const rentAmount = receiptData.breakdown.baseRent;
      const electricityAmount = electricityCharge?.amount || 0;
      const previousBalance = receiptData.breakdown.previousBalance || 0;
      
      // Calculate other expenses (excluding electricity)
      const otherExpenses = receiptData.breakdown.expenses?.filter((e: any) => 
        !(e.description.toLowerCase().includes('electric') || e.description.toLowerCase().includes('utility'))
      ).reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

      const subtotal = rentAmount + electricityAmount + previousBalance + otherExpenses;

      // Get current date and time
      const now = new Date();
      const generationDate = now.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const generationTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
      });

      const templateData: InvoiceTemplateData = {
        // Property details
        propertyName: receiptData.property.name,
        propertyAddress: receiptData.property.address || '',
        propertyPhone: receiptData.property.phone || '',
        propertyEmail: receiptData.property.email || '',
        propertyCurrency: receiptData.property.currency || 'INR',
        
        // Invoice details
        invoiceNumber: receiptData.receiptNumber,
        invoiceDate: new Date(receiptData.receiptDate).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        billingPeriod: `${new Date(receiptData.period.from).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })} - ${new Date(receiptData.period.to).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        })}`,
        generationDate: generationDate,
        generationTime: generationTime,
        
        // Tenant details
        tenantName: receiptData.tenant.name,
        tenantEmail: receiptData.tenant.email || '',
        tenantPhone: receiptData.tenant.phone || '',
        tenantAddress: receiptData.tenant.address || '',
        
        // Unit details (default values if not available)
        unitNumber: 'F-101', // Can be passed via settings if needed
        unitType: '2BHK',
        
        // Owner details
        landlordName: receiptData.landlord.name,
        landlordEmail: receiptData.landlord.email || '',
        landlordPhone: receiptData.landlord.phone || '',
        ownerName: receiptData.landlord.name,
        
        // Electricity details
        meterNumber: (electricityCharge as any)?.metadata?.meterNumber || '101',
        ratePerUnit: this.formatCurrency(ratePerUnit),
        previousReading: previousReading.toString(),
        currentReading: currentReading.toString(),
        unitsConsumed: unitsConsumed.toString(),
        electricityCharges: this.formatCurrency(electricityAmount),
        
        // Payment breakdown
        rentAmount: this.formatCurrency(rentAmount),
        previousBalance: this.formatCurrency(previousBalance),
        additionalExpense: this.formatCurrency(otherExpenses),
        subtotal: this.formatCurrency(subtotal),
        lateFee: '0',
        discount: '0',
        
        // Totals
        totalAmount: this.formatCurrency(receiptData.breakdown.totalAmount),
        amountPaid: this.formatCurrency(receiptData.breakdown.amountPaid),
        balance: receiptData.breakdown.newBalance,
        
        // Payment details
        paymentMethod: receiptData.payment.method?.toUpperCase() || 'N/A',
        paymentDate: receiptData.payment.paidDate
          ? new Date(receiptData.payment.paidDate).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            })
          : 'N/A',
        transactionId: receiptData.payment.transactionId || 'N/A',
        referenceNumber: receiptData.receiptNumber,
        processedBy: 'System',
        
        // Balance status
        remainingBalance: this.formatCurrency(Math.abs(receiptData.breakdown.newBalance)),
        balanceStatusText: receiptData.breakdown.newBalance === 0 ? 'FULLY PAID' : 'PENDING',
        nextDueDate: 'N/A',
        outstandingAmount: this.formatCurrency(Math.max(0, receiptData.breakdown.newBalance)),
        
        // Charges array for backward compatibility
        charges: this.buildChargesArray(receiptData),
        
        // Bank details and payment options from settings
        bankName: receiptData.settings?.bankDetails?.bankName || receiptData.landlord.name,
        accountNumber: receiptData.settings?.bankDetails?.accountNumber || 'XXXX1234',
        ifscCode: receiptData.settings?.bankDetails?.ifscCode || 'ABCD1234',
        accountHolderName: receiptData.settings?.bankDetails?.accountHolderName || receiptData.landlord.name,
        upiId: receiptData.settings?.upiId || receiptData.landlord.phone || '',
        qrCodeUrl: receiptData.settings?.qrCodeUrl,
        signatureUrl: receiptData.settings?.signatureUrl,
        watermarkUrl: receiptData.settings?.watermarkUrl,
        
        // Watermark
        watermarkText: isInvoice ? 'UNPAID' : 'PAID',
        isInvoice: isInvoice,
        
        // Terms
        termsAndConditions: receiptData.termsAndConditions ||
          'This invoice is generated based on the rental agreement. Payment is due as per the terms mentioned in the lease agreement.'
      };      const template = await TemplateEngine.loadTemplate('invoice');
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
