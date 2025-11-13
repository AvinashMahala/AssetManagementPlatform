import { PDFGenerator } from '../src/utils/pdfGenerator.js';
import { TemplateEngine } from '../src/utils/templateEngine.js';

// Test data for invoice
const testReceiptData = {
  property: {
    name: 'Test Property',
    address: '123 Test Street',
    phone: '123-456-7890',
    email: 'test@property.com',
    currency: 'INR'
  },
  tenant: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '987-654-3210',
    address: '456 Tenant Ave'
  },
  landlord: {
    name: 'Jane Smith',
    email: 'jane@landlord.com',
    phone: '555-123-4567'
  },
  receiptNumber: 'TEST-001',
  receiptDate: new Date().toISOString(),
  period: {
    from: new Date().toISOString(),
    to: new Date().toISOString()
  },
  breakdown: {
    totalAmount: 10000,
    amountPaid: 10000,
    newBalance: 0,
    previousBalance: 0,
    baseRent: 10000,
    expenses: []
  },
  payment: {
    method: 'cash',
    paidDate: new Date().toISOString()
  },
  settings: null,
  termsAndConditions: 'Test terms'
};

async function testWatermark() {
  try {
    console.log('Testing PDF generation with watermark...');

    // Test invoice (should have UNPAID watermark)
    console.log('Generating invoice PDF...');
    const invoiceBuffer = await PDFGenerator.generateReceiptPDF(testReceiptData, null, true);
    console.log('Invoice PDF generated successfully, size:', invoiceBuffer.length, 'bytes');

    // Test receipt (should have PAID watermark)
    console.log('Generating receipt PDF...');
    const receiptBuffer = await PDFGenerator.generateReceiptPDF(testReceiptData, null, false);
    console.log('Receipt PDF generated successfully, size:', receiptBuffer.length, 'bytes');

    // Test template rendering directly
    console.log('Testing template rendering...');
    const template = await TemplateEngine.loadTemplate('invoice');
    const templateData = {
      propertyName: 'Test Property',
      propertyAddress: '123 Test Street',
      propertyPhone: '123-456-7890',
      propertyEmail: 'test@property.com',
      propertyCurrency: 'INR',
      invoiceNumber: 'TEST-001',
      invoiceDate: new Date().toLocaleDateString(),
      billingPeriod: 'Jan 2024 - Feb 2024',
      tenantName: 'John Doe',
      tenantEmail: 'john@example.com',
      tenantPhone: '987-654-3210',
      tenantAddress: '456 Tenant Ave',
      landlordName: 'Jane Smith',
      landlordEmail: 'jane@landlord.com',
      landlordPhone: '555-123-4567',
      charges: [{ description: 'Base Rent', amount: 10000 }],
      totalAmount: '10,000.00',
      amountPaid: '10,000.00',
      balance: 0,
      paymentMethod: 'CASH',
      paymentDate: new Date().toLocaleDateString(),
      watermarkText: 'UNPAID',
      isInvoice: true,
      termsAndConditions: 'Test terms'
    };

    const html = TemplateEngine.renderTemplate(template, templateData);
    console.log('Template rendered successfully');

    // Check if watermark is in HTML
    if (html.includes('UNPAID')) {
      console.log('✓ Watermark text "UNPAID" found in rendered HTML');
    } else {
      console.log('✗ Watermark text "UNPAID" NOT found in rendered HTML');
    }

    if (html.includes('<div class="watermark">UNPAID</div>')) {
      console.log('✓ Watermark div with "UNPAID" found in HTML');
    } else {
      console.log('✗ Watermark div with "UNPAID" NOT found in HTML');
    }

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWatermark();