import { Pool } from 'pg';
import { PreviewRequest, PreviewResponse, PreviewSampleData, DEFAULT_PREVIEW_OPTIONS } from '../models/TemplatePreview';
import { SampleDataGenerator } from '@/shared/utils/sampleDataGenerator';
import { PDFGenerator } from '@/shared/utils/pdfGenerator';
import { TABLES, COLUMNS } from '@/shared/constants/database';

export class TemplatePreviewService {
  constructor(private pool: Pool) {}

  async generatePreview(request: PreviewRequest): Promise<PreviewResponse> {
    try {
      const startTime = Date.now();
      
      // Get sample data
      const sampleData = request.sampleData || SampleDataGenerator.generateDefault();
      
      // Generate HTML preview
      const previewHtml = this.generatePreviewHTML(sampleData, request);
      
      // For now, we'll skip PDF generation and just return HTML
      const previewPdfUrl = undefined;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        previewHtml,
        previewPdfUrl,
        expiresAt,
        generationTime,
      };
    } catch (error) {
      console.error('Error generating template preview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during preview generation',
        expiresAt: new Date(),
      };
    }
  }

  generatePreviewHTML(sampleData: PreviewSampleData, request: PreviewRequest): string {
    try {
      const { property, landlord, tenant, unit, lease, payment, receipt, breakdown } = sampleData;
      
      // Apply customizations if provided
      const customStyles = request.customizations?.customStyles;
      const primaryColor = customStyles?.theme?.primary || '#7c3aed';
      const secondaryColor = customStyles?.theme?.secondary || '#64748b';
      const textColor = customStyles?.theme?.text || '#1e293b';
      const backgroundColor = customStyles?.theme?.background || '#ffffff';
      const borderColor = customStyles?.theme?.border || '#e2e8f0';
      
      // Calculate dates and amounts
      const currentDate = new Date(receipt?.receiptDate || '2024-11-04');
      const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
      const year = currentDate.getFullYear();
      const billNo = receipt?.receiptNumber?.split('-').pop() || '760';
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
            .receipt { background: ${backgroundColor}; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            
            /* Property Header */
            .property-header { 
              background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
              padding: 25px;
              border-bottom: 3px solid ${primaryColor};
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .property-qr {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30);
              border: 2px solid ${primaryColor};
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: ${primaryColor};
              font-weight: bold;
              text-align: center;
            }
            .property-info { flex: 1; padding: 0 20px; text-align: center; }
            .property-name { font-size: 24px; font-weight: bold; color: ${primaryColor}; margin-bottom: 5px; }
            .property-details { font-size: 12px; color: ${secondaryColor}; line-height: 1.6; }
            .property-icon {
              width: 80px;
              height: 80px;
              background: ${primaryColor}20;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            
            /* Title Section */
            .title-section {
              background: #fafafa;
              padding: 15px 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid ${borderColor};
            }
            .receipt-title { font-size: 20px; font-weight: bold; color: ${textColor}; }
            .receipt-date { font-size: 14px; color: ${secondaryColor}; }
            
            /* Bill Info */
            .bill-info {
              padding: 15px 25px;
              background: ${backgroundColor};
              font-size: 13px;
              color: ${textColor};
              border-bottom: 1px solid ${borderColor};
            }
            
            /* Room & Tenant */
            .room-tenant {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1px;
              background: ${borderColor};
              border: 1px solid ${borderColor};
              margin: 0 25px;
            }
            .info-cell {
              background: ${backgroundColor};
              padding: 12px;
              font-size: 13px;
            }
            .info-label { color: ${secondaryColor}; font-weight: 600; }
            .info-value { color: ${textColor}; }
            
            /* Electricity Details */
            .electricity-section {
              padding: 15px 25px;
              background: #fafafa;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              color: ${textColor};
              margin-bottom: 10px;
            }
            .meter-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1px;
              background: ${borderColor};
              border: 1px solid ${borderColor};
            }
            .meter-cell {
              background: ${backgroundColor};
              padding: 10px;
              text-align: center;
              font-size: 12px;
            }
            .meter-label { color: ${secondaryColor}; font-size: 11px; }
            .meter-value { color: ${textColor}; font-weight: bold; margin-top: 4px; }
            
            /* Expenses */
            .expenses-section {
              padding: 20px 25px;
              background: ${backgroundColor};
            }
            .expense-cards {
              display: flex;
              gap: 10px;
              margin-top: 10px;
            }
            .expense-card {
              flex: 1;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 12px;
            }
            .expense-yellow { background: #fef3c7; border: 1px solid #fbbf24; }
            .expense-blue { background: #dbeafe; border: 1px solid #3b82f6; }
            .expense-red { background: #fee2e2; border: 1px solid #ef4444; }
            .expense-icon { font-size: 24px; margin-bottom: 8px; }
            .expense-label { color: ${secondaryColor}; font-size: 11px; margin-bottom: 4px; }
            .expense-amount { font-size: 16px; font-weight: bold; color: ${textColor}; }
            .expense-sublabel { font-size: 10px; color: ${secondaryColor}; margin-top: 4px; }
            
            /* Payment Details */
            .payment-section {
              padding: 20px 25px;
              background: #fafafa;
            }
            .payment-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 1px;
              background: ${borderColor};
              border: 1px solid ${borderColor};
              margin-top: 10px;
            }
            .payment-cell {
              background: ${backgroundColor};
              padding: 12px 8px;
              text-align: center;
              font-size: 11px;
            }
            .payment-cell-black {
              background: #1e293b;
              color: white;
            }
            .payment-label { font-size: 10px; margin-bottom: 6px; }
            .payment-amount { font-size: 14px; font-weight: bold; margin-top: 4px; }
            
            /* Payment Made */
            .payments-made {
              display: flex;
              gap: 10px;
              margin: 15px 0;
            }
            .payment-item {
              flex: 1;
              padding: 15px;
              border-radius: 8px;
              background: #86efac;
              border: 1px solid #22c55e;
              text-align: center;
            }
            .payment-date { font-size: 10px; color: #166534; margin-bottom: 8px; }
            .payment-icon { font-size: 28px; margin-bottom: 8px; }
            .payment-amt { font-size: 18px; font-weight: bold; color: #166534; }
            
            /* Balance Summary */
            .balance-summary {
              display: flex;
              gap: 10px;
            }
            .summary-card {
              flex: 1;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .paid-card {
              background: #f0f9ff;
              border: 2px solid #3b82f6;
            }
            .due-card {
              background: #fef2f2;
              border: 2px solid #ef4444;
            }
            .summary-label { font-size: 11px; color: ${secondaryColor}; margin-bottom: 8px; }
            .summary-amount { font-size: 20px; font-weight: bold; }
            .paid-card .summary-amount { color: #1e40af; }
            .due-card .summary-amount { color: #dc2626; }
            
            /* Signature */
            .signature-section {
              padding: 20px 25px;
              text-align: right;
              border-top: 2px dashed ${primaryColor};
              border-bottom: 2px dashed ${primaryColor};
            }
            .signature-line {
              width: 200px;
              margin-left: auto;
              border-bottom: 2px solid ${textColor};
              height: 60px;
              font-family: 'Brush Script MT', cursive;
              font-size: 32px;
              color: ${textColor};
              display: flex;
              align-items: flex-end;
              justify-content: center;
              padding-bottom: 5px;
            }
            
            /* Payment Options */
            .payment-options {
              padding: 20px 25px;
              background: ${backgroundColor};
            }
            .payment-methods {
              display: flex;
              gap: 15px;
              margin-top: 10px;
              align-items: center;
            }
            .payment-method {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 15px;
              background: #f8fafc;
              border: 1px solid ${borderColor};
              border-radius: 8px;
              flex: 1;
            }
            .payment-icon-small { font-size: 24px; }
            .payment-info { flex: 1; }
            .payment-method-label { font-size: 10px; color: ${secondaryColor}; }
            .payment-method-value { font-size: 12px; font-weight: 600; color: ${textColor}; }
            .qr-section {
              padding: 15px;
              border: 2px dashed ${primaryColor};
              border-radius: 8px;
              text-align: center;
            }
            .qr-placeholder {
              width: 100px;
              height: 100px;
              margin: 0 auto 10px;
              background: ${primaryColor}15;
              border: 2px solid ${primaryColor};
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: ${primaryColor};
            }
            .qr-label { font-size: 11px; color: ${primaryColor}; font-weight: bold; }
            
            @media print {
              body { padding: 0; background: white; }
              .receipt { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Property Header -->
            <div class="property-header">
              <div class="property-qr">
                <div>QR<br/>Code</div>
              </div>
              <div class="property-info">
                <div class="property-name">${unit?.unitNumber || 'A00'}</div>
                <div class="property-details">
                  ${property?.address?.street || 'Test Address'}<br/>
                  Mobile No: ${property?.phone || '123456789'}<br/>
                  Email: ${property?.email || 'test@gmail.com'}<br/>
                  Website: ${property?.type || 'test.com'}<br/>
                  Owner: ${landlord?.name || 'Owner'}
                </div>
              </div>
              <div class="property-icon">🏠</div>
            </div>
            
            <!-- Title Section -->
            <div class="title-section">
              <div class="receipt-title">RENT RECEIPT</div>
              <div class="receipt-date">${currentDate.getDate()} ${monthName.slice(0,3)}, ${year.toString().slice(2)}</div>
            </div>
            
            <!-- Bill Info -->
            <div class="bill-info">
              <strong>Bill No:</strong> ${billNo} | <strong>Month:</strong> ${monthName.toUpperCase()}, ${year}
            </div>
            
            <!-- Room & Tenant -->
            <div class="room-tenant">
              <div class="info-cell">
                <span class="info-label">Room:</span> <span class="info-value">${unit?.unitNumber || 'A1'}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Tenant:</span> <span class="info-value">${tenant?.name || 'Mr. Test'}</span>
              </div>
            </div>
            
            <!-- Electricity Details -->
            <div class="electricity-section">
              <div class="section-title">Electricity Details | Meter No: A100 | PerUnit Cost: 7.0 ₹</div>
              <div class="meter-grid">
                <div class="meter-cell">
                  <div class="meter-label">Old</div>
                  <div class="meter-value">20</div>
                </div>
                <div class="meter-cell">
                  <div class="meter-label">New</div>
                  <div class="meter-value">30</div>
                </div>
                <div class="meter-cell">
                  <div class="meter-label">Units</div>
                  <div class="meter-value">10</div>
                </div>
                <div class="meter-cell">
                  <div class="meter-label">Cost</div>
                  <div class="meter-value">70 ₹</div>
                </div>
              </div>
            </div>
            
            <!-- Expenses -->
            <div class="expenses-section">
              <div class="section-title">Expense</div>
              <div class="expense-cards">
                <div class="expense-card expense-yellow">
                  <div class="expense-icon">🧺</div>
                  <div class="expense-label">Laundry</div>
                  <div class="expense-amount">200 ₹</div>
                  <div class="expense-sublabel">Dry cleaning cost</div>
                </div>
                <div class="expense-card expense-blue">
                  <div class="expense-icon">📶</div>
                  <div class="expense-label">Wi-Fi/Internet</div>
                  <div class="expense-amount">100 ₹</div>
                  <div class="expense-sublabel">Internet cost</div>
                </div>
                <div class="expense-card expense-red">
                  <div class="expense-icon">❌</div>
                  <div class="expense-label">Removed</div>
                  <div class="expense-amount">100 ₹</div>
                  <div class="expense-sublabel">Paid Cash</div>
                </div>
              </div>
            </div>
            
            <!-- Payment Details -->
            <div class="payment-section">
              <div class="section-title">Payment Details</div>
              <div class="payment-grid">
                <div class="payment-cell">
                  <div class="payment-label">Rent [7 Sep - 7 Oct]</div>
                  <div class="payment-amount">+ 2,000 ₹</div>
                </div>
                <div class="payment-cell">
                  <div class="payment-label">Electricity</div>
                  <div class="payment-amount">+ 70 ₹</div>
                </div>
                <div class="payment-cell">
                  <div class="payment-label">Old Balance</div>
                  <div class="payment-amount">+ 0 ₹</div>
                </div>
                <div class="payment-cell">
                  <div class="payment-label" style="color: #ef4444;">Expense Added</div>
                  <div class="payment-amount" style="color: #ef4444;">+ 200 ₹</div>
                </div>
                <div class="payment-cell payment-cell-black">
                  <div class="payment-label">Total Due Amount</div>
                  <div class="payment-amount">2,270 ₹</div>
                </div>
              </div>
              
              <div class="payments-made">
                <div class="payment-item">
                  <div class="payment-date">07 Sep, 22</div>
                  <div class="payment-icon">💳</div>
                  <div class="payment-amt">1,000 ₹</div>
                </div>
                <div class="payment-item">
                  <div class="payment-date">06 Sep, 22</div>
                  <div class="payment-icon">💰</div>
                  <div class="payment-amt">800 ₹</div>
                </div>
              </div>
              
              <div class="balance-summary">
                <div class="summary-card paid-card">
                  <div class="summary-label">Total Amount Paid</div>
                  <div class="summary-amount">1,800 ₹</div>
                </div>
                <div class="summary-card due-card">
                  <div class="summary-label">Balance Due</div>
                  <div class="summary-amount">470 ₹</div>
                </div>
              </div>
            </div>
            
            <!-- Signature -->
            <div class="signature-section">
              <div class="signature-line">Signature</div>
            </div>
            
            <!-- Payment Options -->
            <div class="payment-options">
              <div class="section-title" style="color: ${primaryColor};">Payment Options</div>
              <div style="display: flex; gap: 15px; margin-top: 10px;">
                <div style="flex: 2;">
                  <div class="payment-method">
                    <div class="payment-icon-small">🏦</div>
                    <div class="payment-info">
                      <div class="payment-method-label">Bank: ABC BANK | Acc No:</div>
                      <div class="payment-method-value">123456789</div>
                      <div class="payment-method-label">IFSC: ABC1234 | Name: Test User</div>
                    </div>
                  </div>
                  <div class="payment-method" style="margin-top: 10px;">
                    <div class="payment-icon-small">📱</div>
                    <div class="payment-info">
                      <div class="payment-method-value">123456789</div>
                      <div class="payment-method-label">Test User</div>
                    </div>
                  </div>
                  <div class="payment-method" style="margin-top: 10px;">
                    <div class="payment-icon-small">💳</div>
                    <div class="payment-info">
                      <div class="payment-method-value">test@upi.com</div>
                    </div>
                  </div>
                </div>
                <div class="qr-section">
                  <div class="qr-placeholder">QR Code</div>
                  <div class="qr-label">Add A New Place</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error generating preview HTML:', error);
      throw new Error('Failed to generate preview HTML');
    }
  }

  async cachePreview(templateId: string, propertyId: string | undefined, previewData: any): Promise<void> {
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes
    
    await this.pool.query(
      `INSERT INTO ${TABLES.TEMPLATE_PREVIEW_CACHE} 
       (${COLUMNS.TEMPLATE_PREVIEW_CACHE.TEMPLATE_ID}, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PROPERTY_ID}, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.SAMPLE_DATA}, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PREVIEW_HTML}, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PREVIEW_EXPIRES_AT})
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (${COLUMNS.TEMPLATE_PREVIEW_CACHE.TEMPLATE_ID}, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PROPERTY_ID}) 
       DO UPDATE SET ${COLUMNS.TEMPLATE_PREVIEW_CACHE.SAMPLE_DATA} = $3, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PREVIEW_HTML} = $4, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PREVIEW_EXPIRES_AT} = $5, ${COLUMNS.TEMPLATE_PREVIEW_CACHE.CREATED_AT} = CURRENT_TIMESTAMP`,
      [templateId, propertyId, JSON.stringify(previewData.sampleData), previewData.previewHtml, expiresAt]
    );
  }

  async getCachedPreview(templateId: string, propertyId?: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.TEMPLATE_PREVIEW_CACHE} 
       WHERE ${COLUMNS.TEMPLATE_PREVIEW_CACHE.TEMPLATE_ID} = $1 AND ($2::uuid IS NULL OR ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PROPERTY_ID} = $2) 
       AND ${COLUMNS.TEMPLATE_PREVIEW_CACHE.PREVIEW_EXPIRES_AT} > NOW()
       ORDER BY ${COLUMNS.TEMPLATE_PREVIEW_CACHE.CREATED_AT} DESC LIMIT 1`,
      [templateId, propertyId || null]
    );
    
    return result.rows[0] || null;
  }
}
