import PDFDocument from 'pdfkit';
import { ReceiptData } from '../models/Receipt';

export class PDFGenerator {
  /**
   * Generate a professional receipt PDF
   */
  static async generateReceiptPDF(receiptData: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          info: {
            Title: `Receipt ${receiptData.receiptNumber}`,
            Author: receiptData.landlord.name,
            Subject: 'Rent Payment Receipt'
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, receiptData);
        
        // Receipt details
        this.addReceiptDetails(doc, receiptData);
        
        // Payment breakdown
        this.addPaymentBreakdown(doc, receiptData);
        
        // Footer
        this.addFooter(doc, receiptData);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static addHeader(doc: PDFKit.PDFDocument, data: ReceiptData) {
    const pageWidth = doc.page.width;
    
    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text('RENT RECEIPT', 50, 50, { align: 'center' });
    
    // Receipt Number
    doc.fontSize(12)
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

  private static addReceiptDetails(doc: PDFKit.PDFDocument, data: ReceiptData) {
    const startY = 140;
    let currentY = startY;

    // Property Details Section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Property Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Property: ${data.property.name}`, 50, currentY);
    currentY += 15;
    doc.text(`Address: ${data.property.address}`, 50, currentY);
    currentY += 15;
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
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Landlord Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(10)
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
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Tenant Details', 50, currentY);
    
    currentY += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Name: ${data.tenant.name}`, 50, currentY);
    currentY += 15;
    doc.text(`Email: ${data.tenant.email}`, 50, currentY);
    currentY += 15;
    doc.text(`Phone: ${data.tenant.phone}`, 50, currentY);
    currentY += 15;
    doc.text(`Address: ${data.tenant.address}`, 50, currentY);
    currentY += 15;

    currentY += 10;

    // Payment Period
    const periodFrom = new Date(data.period.from);
    const periodTo = new Date(data.period.to);
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Payment Period', 50, currentY);
    
    currentY += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`From: ${periodFrom.toLocaleDateString('en-IN')}`, 50, currentY);
    currentY += 15;
    doc.text(`To: ${periodTo.toLocaleDateString('en-IN')}`, 50, currentY);
    
    return currentY + 30;
  }

  private static addPaymentBreakdown(doc: PDFKit.PDFDocument, data: ReceiptData) {
    let currentY = 500;

    // Payment Breakdown Box
    doc.rect(50, currentY, doc.page.width - 100, 150)
       .fillColor('#f8fafc')
       .fill();
    
    doc.rect(50, currentY, doc.page.width - 100, 150)
       .strokeColor('#e5e7eb')
       .stroke();

    currentY += 15;

    // Title
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Payment Breakdown', 60, currentY);
    
    currentY += 30;

    // Breakdown items
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#374151');

    // Previous Balance
    if (data.breakdown.previousBalance > 0) {
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
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af');
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

  private static addFooter(doc: PDFKit.PDFDocument, data: ReceiptData) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;

    // Payment method
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#64748b')
       .text(`Payment Method: ${data.payment.method?.toUpperCase() || 'N/A'}`, 50, footerY);
    
    if (data.payment.paidDate) {
      const paidDate = new Date(data.payment.paidDate);
      doc.text(`Payment Date: ${paidDate.toLocaleDateString('en-IN')}`, 50, footerY + 15);
    }

    // Terms and conditions
    if (data.termsAndConditions) {
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(data.termsAndConditions, 50, footerY + 40, {
           width: doc.page.width - 100,
           align: 'center'
         });
    } else {
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text('This is a computer-generated receipt and does not require a signature.', 
               50, footerY + 40, {
                 width: doc.page.width - 100,
                 align: 'center'
               });
    }
  }
}
