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
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e3a8a';
    const accentColor = templateSettings?.theme?.secondaryColor || '#3b82f6';
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    
    // Modern header background with gradient effect
    doc.rect(0, 0, pageWidth, 150)
       .fillColor(primaryColor)
       .fill();
    
    // Accent bar
    doc.rect(0, 145, pageWidth, 5)
       .fillColor(accentColor)
       .fill();
    
    // Company/Property Name
    doc.fontSize(fontSize.title + 4)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(data.property.name.toUpperCase(), 60, 40, { align: 'left' });
    
    // Property contact info
    doc.fontSize(fontSize.small)
       .font('Helvetica')
       .fillColor('#e0e7ff');
    
    let contactY = 75;
    if (data.property.address) {
      doc.text(data.property.address, 60, contactY);
      contactY += 12;
    }
    if (data.property.phone) {
      doc.text(`Tel: ${data.property.phone}`, 60, contactY);
      contactY += 12;
    }
    if (data.property.email) {
      doc.text(`Email: ${data.property.email}`, 60, contactY);
    }
    
    // INVOICE title on right side
    doc.fontSize(fontSize.title + 8)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text('RENT INVOICE', pageWidth - 250, 40, { align: 'right', width: 200 });
    
    // Receipt Number & Date box on right
    const boxX = pageWidth - 220;
    doc.fontSize(fontSize.normal)
       .fillColor('#e0e7ff')
       .text('Invoice No:', boxX, 85, { width: 70, align: 'left' });
    doc.font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(data.receiptNumber, boxX + 75, 85, { width: 120, align: 'right' });
    
    const receiptDate = new Date(data.receiptDate);
    doc.font('Helvetica')
       .fillColor('#e0e7ff')
       .text('Date:', boxX, 100, { width: 70, align: 'left' });
    doc.font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(receiptDate.toLocaleDateString('en-IN', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), boxX + 75, 100, { width: 120, align: 'right' });
    
    doc.moveDown(2);
  }

  private static addReceiptDetails(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    const startY = 180;
    let currentY = startY;
    const pageWidth = doc.page.width;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e3a8a';

    // Billing period banner
    const periodFrom = new Date(data.period.from);
    const periodTo = new Date(data.period.to);
    
    doc.rect(50, currentY, pageWidth - 100, 40)
       .fillColor('#f1f5f9')
       .fill();
    
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('BILLING PERIOD', 60, currentY + 6);
    
    doc.fontSize(fontSize.normal + 2)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text(`${periodFrom.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${periodTo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 
             60, currentY + 22);

    currentY += 60;

    // Two-column layout for Tenant and Landlord
    const col1X = 50;
    const col2X = (pageWidth / 2) + 20;
    const colWidth = (pageWidth / 2) - 70;

    // BILLED TO (Tenant) section
    doc.fontSize(fontSize.section - 1)
       .font('Helvetica-Bold')
       .fillColor('#64748b')
       .text('BILLED TO', col1X, currentY);
    
    currentY += 20;
    
    // Tenant info box
    doc.rect(col1X, currentY, colWidth, 110)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();
    
    let tenantY = currentY + 15;
    doc.fontSize(fontSize.normal + 1)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text(data.tenant.name, col1X + 15, tenantY, { width: colWidth - 30 });
    
    tenantY += 20;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#475569');
    
    if (data.tenant.email) {
      doc.text(`📧 ${data.tenant.email}`, col1X + 15, tenantY, { width: colWidth - 30 });
      tenantY += 15;
    }
    if (data.tenant.phone) {
      doc.text(`📱 ${data.tenant.phone}`, col1X + 15, tenantY, { width: colWidth - 30 });
      tenantY += 15;
    }
    if (templateSettings?.content?.showTenantAddress !== false && data.tenant.address) {
      doc.fontSize(fontSize.small)
         .text(data.tenant.address, col1X + 15, tenantY, { width: colWidth - 30 });
    }

    // PAYMENT TO (Landlord) section
    let landlordY = currentY - 20;
    doc.fontSize(fontSize.section - 1)
       .font('Helvetica-Bold')
       .fillColor('#64748b')
       .text('PAYMENT TO', col2X, landlordY);
    
    landlordY += 20;
    
    // Landlord info box
    doc.rect(col2X, landlordY, colWidth, 110)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();
    
    landlordY += 15;
    doc.fontSize(fontSize.normal + 1)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text(data.landlord.name, col2X + 15, landlordY, { width: colWidth - 30 });
    
    landlordY += 20;
    doc.fontSize(fontSize.normal)
       .font('Helvetica')
       .fillColor('#475569');
    
    if (data.landlord.email) {
      doc.text(`📧 ${data.landlord.email}`, col2X + 15, landlordY, { width: colWidth - 30 });
      landlordY += 15;
    }
    if (data.landlord.phone) {
      doc.text(`📱 ${data.landlord.phone}`, col2X + 15, landlordY, { width: colWidth - 30 });
      landlordY += 15;
    }

    return currentY + 140;
  }

  private static addPaymentBreakdown(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    let currentY = 450;
    const pageWidth = doc.page.width;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e3a8a';
    const accentColor = templateSettings?.theme?.secondaryColor || '#3b82f6';

    // Only show payment breakdown if enabled in template
    if (templateSettings?.content?.showPaymentBreakdown === false) {
      return currentY + 30;
    }

    // Section title
    doc.fontSize(fontSize.section)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('CHARGES & PAYMENT DETAILS', 50, currentY);
    
    currentY += 30;

    // Table header
    const tableTop = currentY;
    const descCol = 60;
    const amountCol = pageWidth - 150;
    
    // Header row with background
    doc.rect(50, tableTop, pageWidth - 100, 30)
       .fillColor('#f8fafc')
       .fill();
    
    doc.rect(50, tableTop, pageWidth - 100, 30)
       .strokeColor('#cbd5e1')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(fontSize.normal)
       .font('Helvetica-Bold')
       .fillColor('#475569')
       .text('DESCRIPTION', descCol, tableTop + 8)
       .text('AMOUNT', amountCol - 50, tableTop + 8, { width: 100, align: 'right' });

    currentY = tableTop + 30;

    // Table rows
    const rows: Array<{ label: string; amount: number; bold?: boolean; color?: string }> = [];
    
    // Previous Balance
    if (templateSettings?.content?.showBalanceForward !== false && data.breakdown.previousBalance > 0) {
      rows.push({ label: 'Previous Balance', amount: data.breakdown.previousBalance });
    }

    // Base Rent
    rows.push({ label: 'Base Rent', amount: data.breakdown.baseRent });

    // Expenses
    if (data.breakdown.expenses && data.breakdown.expenses.length > 0) {
      data.breakdown.expenses.forEach((expense: any) => {
        rows.push({ label: expense.description, amount: expense.amount });
      });
    }

    // Draw rows
    rows.forEach((row, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        doc.rect(50, currentY, pageWidth - 100, 25)
           .fillColor('#ffffff')
           .fill();
      } else {
        doc.rect(50, currentY, pageWidth - 100, 25)
           .fillColor('#f8fafc')
           .fill();
      }

      doc.rect(50, currentY, pageWidth - 100, 25)
         .strokeColor('#e5e7eb')
         .lineWidth(0.5)
         .stroke();

      doc.fontSize(fontSize.normal)
         .font('Helvetica')
         .fillColor('#334155')
         .text(row.label, descCol, currentY + 6);
      
      doc.text(`₹${row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
               amountCol - 50, currentY + 6, { width: 100, align: 'right' });
      
      currentY += 25;
    });

    // Subtotal row
    doc.rect(50, currentY, pageWidth - 100, 30)
       .fillColor('#f1f5f9')
       .fill();
    
    doc.rect(50, currentY, pageWidth - 100, 30)
       .strokeColor('#cbd5e1')
       .lineWidth(1)
       .stroke();

    doc.fontSize(fontSize.normal + 1)
       .font('Helvetica-Bold')
       .fillColor('#334155')
       .text('SUBTOTAL', descCol, currentY + 8);
    
    doc.text(`₹${data.breakdown.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
             amountCol - 50, currentY + 8, { width: 100, align: 'right' });
    
    currentY += 30;

    // Amount Paid row
    doc.rect(50, currentY, pageWidth - 100, 30)
       .fillColor('#dcfce7')
       .fill();
    
    doc.rect(50, currentY, pageWidth - 100, 30)
       .strokeColor('#86efac')
       .lineWidth(1)
       .stroke();

    doc.fontSize(fontSize.normal + 1)
       .font('Helvetica-Bold')
       .fillColor('#15803d')
       .text('AMOUNT PAID', descCol, currentY + 8);
    
    doc.text(`₹${data.breakdown.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
             amountCol - 50, currentY + 8, { width: 100, align: 'right' });
    
    currentY += 30;

    // Balance Due row (if any)
    if (data.breakdown.newBalance !== 0) {
      const isCredit = data.breakdown.newBalance < 0;
      const balanceColor = isCredit ? '#dcfce7' : '#fee2e2';
      const borderColor = isCredit ? '#86efac' : '#fca5a5';
      const textColor = isCredit ? '#15803d' : '#dc2626';
      
      doc.rect(50, currentY, pageWidth - 100, 35)
         .fillColor(balanceColor)
         .fill();
      
      doc.rect(50, currentY, pageWidth - 100, 35)
         .strokeColor(borderColor)
         .lineWidth(2)
         .stroke();

      doc.fontSize(fontSize.normal + 2)
         .font('Helvetica-Bold')
         .fillColor(textColor)
         .text(isCredit ? 'CREDIT BALANCE' : 'BALANCE DUE', descCol, currentY + 10);
      
      doc.text(`₹${Math.abs(data.breakdown.newBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
               amountCol - 50, currentY + 10, { width: 100, align: 'right' });
      
      currentY += 35;
    }

    return currentY + 20;
  }

  private static addFooter(doc: PDFKit.PDFDocument, data: ReceiptData, templateSettings?: ReceiptTemplateSettings | null) {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const footerY = pageHeight - 120;
    
    const fontSize = this.getFontSize(templateSettings?.theme?.fontSize || 'medium');
    const primaryColor = templateSettings?.theme?.primaryColor || '#1e3a8a';

    // Payment details section
    if (data.payment.paidDate || data.payment.method) {
      doc.rect(50, footerY - 40, pageWidth - 100, 50)
         .fillColor('#f8fafc')
         .fill();
      
      doc.rect(50, footerY - 40, pageWidth - 100, 50)
         .strokeColor('#e5e7eb')
         .lineWidth(0.5)
         .stroke();

      let paymentY = footerY - 28;
      
      if (data.payment.method) {
        doc.fontSize(fontSize.normal)
           .font('Helvetica-Bold')
           .fillColor('#475569')
           .text('Payment Method:', 60, paymentY);
        
        doc.font('Helvetica')
           .fillColor('#0f172a')
           .text(data.payment.method.toUpperCase(), 180, paymentY);
      }
      
      if (data.payment.paidDate) {
        const paidDate = new Date(data.payment.paidDate);
        doc.font('Helvetica-Bold')
           .fillColor('#475569')
           .text('Payment Date:', pageWidth - 250, paymentY);
        
        doc.font('Helvetica')
           .fillColor('#0f172a')
           .text(paidDate.toLocaleDateString('en-IN', { 
             year: 'numeric', 
             month: 'long', 
             day: 'numeric' 
           }), pageWidth - 160, paymentY, { width: 120, align: 'left' });
      }
    }

    let currentY = footerY + 25;

    // Divider line
    doc.moveTo(50, currentY)
       .lineTo(pageWidth - 50, currentY)
       .strokeColor('#e5e7eb')
       .lineWidth(0.5)
       .stroke();

    currentY += 15;

    // Terms and conditions (only if enabled in template)
    if (templateSettings?.content?.showTermsAndConditions !== false && data.termsAndConditions) {
      doc.fontSize(fontSize.small)
         .font('Helvetica')
         .fillColor('#94a3b8')
         .text(data.termsAndConditions, 50, currentY, {
           width: pageWidth - 100,
           align: 'center',
           lineGap: 2
         });
      currentY += 20;
    }

    // Signature line (only if enabled in template)
    if (templateSettings?.content?.showSignature !== false) {
      const signatureText = templateSettings?.content?.signatureText || 
        'This is a computer-generated invoice and does not require a physical signature.';
      
      doc.fontSize(fontSize.small - 1)
         .font('Helvetica')
         .fillColor('#cbd5e1')
         .text(signatureText, 50, currentY, {
           width: pageWidth - 100,
           align: 'center'
         });
    }

    // Footer bar with branding
    const footerBarY = pageHeight - 25;
    doc.rect(0, footerBarY, pageWidth, 25)
       .fillColor(primaryColor)
       .fill();
    
    doc.fontSize(fontSize.small - 1)
       .font('Helvetica')
       .fillColor('#e0e7ff')
       .text('Thank you for your payment', 50, footerBarY + 8, { 
         width: pageWidth - 100, 
         align: 'center' 
       });
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
