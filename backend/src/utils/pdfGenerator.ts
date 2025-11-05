import { createRequire } from 'module';
import { ReceiptData } from '../models/Receipt';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate';

const require = createRequire(import.meta.url);

export class PDFGenerator {
  /**
   * Generate a professional receipt PDF with template styling
   */
  static async generateReceiptPDF(receiptData: ReceiptData, templateSettings?: ReceiptTemplateSettings | null): Promise<Buffer> {
    // Use require for pdfkit in ES modules
    const PDFDocument = require('pdfkit');

    return new Promise((resolve, reject) => {
      try {
        // Apply template layout settings
        const paperSize = templateSettings?.layout?.paperSize || 'a4';
        const orientation = templateSettings?.layout?.orientation || 'portrait';

        const doc = new PDFDocument({ 
          size: paperSize,
          layout: orientation,
          margin: 50,
          info: {
            Title: `Receipt ${receiptData.receiptNumber}`,
            Author: receiptData.landlord.name,
            Subject: 'Rent Payment Receipt'
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header with template styling
        this.addHeader(doc, receiptData, templateSettings);
        
        // Receipt details with template content settings
        this.addReceiptDetails(doc, receiptData, templateSettings);
        
        // Payment breakdown with template settings
        this.addPaymentBreakdown(doc, receiptData, templateSettings);
        
        // Footer with template settings
        this.addFooter(doc, receiptData, templateSettings);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static addHeader(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    const pageWidth = doc.page.width;
    
    // Apply template theme colors
    const primaryColor = templateSettings?.theme?.primaryColor || '#2563eb';
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    
    // Title with template styling
    doc.fontSize(fontSize.title)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('RENT RECEIPT', 50, 50, { align: 'center' });
    
    // Receipt Number
    doc.fontSize(fontSize.normal)
       .fillColor('#64748b')
       .text(`Receipt No: ${data.receiptNumber}`, 50, 85, { align: 'center' });
    
    // Date
    const receiptDate = new Date(data.receiptDate);
    doc.text(`Date: ${receiptDate.toLocaleDateString('en-IN')}`, 50, 100, { align: 'center' });
    
    // Horizontal line
    doc.moveTo(50, 120)
       .lineTo(pageWidth - 50, 120)
       .strokeColor('#e5e7eb')
       .stroke();
    
    doc.moveDown(2);
  }

  private static addReceiptDetails(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    const startY = 140;
    let currentY = startY;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e40af';

    // Property Details Section
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Property Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Property: ${data.property.name}`, 50, currentY);
    currentY += 15;
    
    // Show property address based on template settings
    if (templateSettings?.content?.showPropertyAddress !== false && data.property.address) {
      doc.text(`Address: ${data.property.address}`, 50, currentY);
      currentY += 15;
    }
    
    if (data.property.phone) {
      doc.text(`Phone: ${data.property.phone}`, 50, currentY);
      currentY += 15;
    }
    if (data.property.email) {
      doc.text(`Email: ${data.property.email}`, 50, currentY);
      currentY += 15;
    }

    currentY += 10;

    // Landlord Details Section
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Landlord Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Name: ${data.landlord.name}`, 50, currentY);
    currentY += 15;
    doc.text(`Email: ${data.landlord.email}`, 50, currentY);
    currentY += 15;
    if (data.landlord.phone) {
      doc.text(`Phone: ${data.landlord.phone}`, 50, currentY);
      currentY += 15;
    }

    currentY += 10;

    // Tenant Details Section
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Tenant Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Name: ${data.tenant.name}`, 50, currentY);
    currentY += 15;
    doc.text(`Email: ${data.tenant.email}`, 50, currentY);
    currentY += 15;
    doc.text(`Phone: ${data.tenant.phone}`, 50, currentY);
    currentY += 15;
    
    // Show tenant address based on template settings
    if (templateSettings?.content?.showTenantAddress !== false && data.tenant.address) {
      doc.text(`Address: ${data.tenant.address}`, 50, currentY);
      currentY += 15;
    }

    currentY += 10;

    // Payment Period
    const periodFrom = new Date(data.period.from);
    const periodTo = new Date(data.period.to);
    
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Payment Period', 50, currentY);
    
    currentY += 25;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`From: ${periodFrom.toLocaleDateString('en-IN')}`, 50, currentY);
    currentY += 15;
    doc.text(`To: ${periodTo.toLocaleDateString('en-IN')}`, 50, currentY);
    
    return currentY + 30;
  }

  private static addPaymentBreakdown(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    let currentY = 500;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e40af';

    // Only show payment breakdown if enabled in template
    if (templateSettings?.content?.showPaymentBreakdown === false) {
      return currentY + 30;
    }

    // Payment Breakdown Box
    doc.rect(50, currentY, doc.page.width - 100, 150)
       .fillColor('#f8fafc')
       .fill();
    
    doc.rect(50, currentY, doc.page.width - 100, 150)
       .strokeColor('#e5e7eb')
       .stroke();

    currentY += 15;

    // Title
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('Payment Breakdown', 60, currentY);
    
    currentY += 30;

    // Breakdown items
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#374151');

    // Previous Balance (only if enabled in template)
    if (templateSettings?.content?.showBalanceForward !== false && data.breakdown.previousBalance > 0) {
      doc.text('Previous Balance:', 60, currentY);
      doc.text(`₹${data.breakdown.previousBalance.toLocaleString('en-IN')}`, 
               doc.page.width - 150, currentY, { align: 'right', width: 100 });
      currentY += 15;
    }

    // Base Rent
    doc.text('Base Rent:', 60, currentY);
    doc.text(`₹${data.breakdown.baseRent.toLocaleString('en-IN')}`, 
             doc.page.width - 150, currentY, { align: 'right', width: 100 });
    currentY += 15;

    // Expenses
    if (data.breakdown.expenses && data.breakdown.expenses.length > 0) {
      data.breakdown.expenses.forEach((expense: any) => {
        doc.text(`${expense.description}:`, 60, currentY);
        doc.text(`₹${expense.amount.toLocaleString('en-IN')}`, 
                 doc.page.width - 150, currentY, { align: 'right', width: 100 });
        currentY += 15;
      });
    }

    // Line separator
    doc.moveTo(60, currentY + 5)
       .lineTo(doc.page.width - 60, currentY + 5)
       .strokeColor('#cbd5e1')
       .stroke();
    
    currentY += 20;

    // Total Amount
    doc.fontSize(fontSize.normal + 2)
       .font('Helvetica-Bold')
       .fillColor(primaryColor);
    doc.text('Total Amount:', 60, currentY);
    doc.text(`₹${data.breakdown.totalAmount.toLocaleString('en-IN')}`, 
             doc.page.width - 150, currentY, { align: 'right', width: 100 });
    
    currentY += 15;

    // Amount Paid
    doc.fillColor('#16a34a');
    doc.text('Amount Paid:', 60, currentY);
    doc.text(`₹${data.breakdown.amountPaid.toLocaleString('en-IN')}`, 
             doc.page.width - 150, currentY, { align: 'right', width: 100 });

    currentY += 15;

    // New Balance
    if (data.breakdown.newBalance !== 0) {
      doc.fillColor('#dc2626');
      doc.text('Balance:', 60, currentY);
      doc.text(`₹${data.breakdown.newBalance.toLocaleString('en-IN')}`, 
               doc.page.width - 150, currentY, { align: 'right', width: 100 });
    }

    return currentY + 30;
  }

  private static addFooter(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');

    // Payment method
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#64748b')
       .text(`Payment Method: ${data.payment.method?.toUpperCase() || 'N/A'}`, 50, footerY);
    
    if (data.payment.paidDate) {
      const paidDate = new Date(data.payment.paidDate);
      doc.text(`Payment Date: ${paidDate.toLocaleDateString('en-IN')}`, 50, footerY + 15);
    }

    let currentY = footerY + 40;

    // Terms and conditions (only if enabled in template)
    if (templateSettings?.content?.showTermsAndConditions !== false && data.termsAndConditions) {
      doc.fontSize(fontSize.small)
         .fillColor('#9ca3af')
         .text(data.termsAndConditions, 50, currentY, {
           width: doc.page.width - 100,
           align: 'center'
         });
      currentY += 30;
    }

    // Signature (only if enabled in template)
    if (templateSettings?.content?.showSignature !== false) {
      const signatureText = templateSettings?.content?.signatureText || 'This is a computer-generated receipt and does not require a signature.';
      doc.fontSize(fontSize.small)
         .fillColor('#9ca3af')
         .text(signatureText, 50, currentY, {
           width: doc.page.width - 100,
           align: 'center'
         });
    }
  }

  private static getFontSize(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small':
        return { title: 20, section: 12, normal: 10, small: 8 };
      case 'large':
        return { title: 28, section: 16, normal: 14, small: 10 };
      case 'medium':
      default:
        return { title: 24, section: 14, normal: 12, small: 8 };
    }
  }
}
