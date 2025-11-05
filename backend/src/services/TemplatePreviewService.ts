import { Pool } from 'pg';
import { PreviewRequest, PreviewResponse, PreviewSampleData, DEFAULT_PREVIEW_OPTIONS } from '../models/TemplatePreview';
import { SampleDataGenerator } from '../utils/sampleDataGenerator';
import { PDFGenerator } from '../utils/pdfGenerator';

export class TemplatePreviewService {
  constructor(private pool: Pool) {}

  async generatePreview(request: PreviewRequest): Promise<PreviewResponse> {
    const startTime = Date.now();
    
    try {
      const sampleData = request.sampleData || SampleDataGenerator.generateDefault();
      const format = request.format || 'html';
      
      let previewHtml: string | undefined;
      let previewPdfUrl: string | undefined;
      
      if (format === 'html' || format === 'both') {
        previewHtml = this.generatePreviewHTML(sampleData, request);
      }
      
      if (format === 'pdf' || format === 'both') {
        // For now, return placeholder - full PDF preview will be implemented with PDFGenerator enhancement
        previewPdfUrl = '/api/templates/preview/pdf/placeholder';
      }
      
      const expiresAt = new Date(Date.now() + 300000); // 5 minutes
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        previewHtml,
        previewPdfUrl,
        expiresAt,
        generationTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        expiresAt: new Date(),
      };
    }
  }

  generatePreviewHTML(sampleData: PreviewSampleData, request: PreviewRequest): string {
    const { property, landlord, tenant, payment, receipt, breakdown } = sampleData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 50px; background: #f5f5f5; }
          .receipt { background: white; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
          .section { margin-bottom: 25px; }
          .section-title { color: #2563eb; font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .field { margin: 8px 0; color: #1e293b; }
          .field-label { color: #64748b; font-weight: 500; display: inline-block; width: 150px; }
          .breakdown-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .breakdown-table td { padding: 10px; border: 1px solid #e2e8f0; }
          .breakdown-table .label { background: #f8fafc; font-weight: 500; width: 60%; }
          .breakdown-table .amount { text-align: right; }
          .total-row { font-weight: bold; background: #f1f5f9; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); z-index: -1; }
        </style>
      </head>
      <body>
        <div class="watermark">PREVIEW ONLY</div>
        <div class="receipt">
          <div class="header">
            <h1>RENT RECEIPT</h1>
            <div style="color: #64748b; margin-top: 10px;">Receipt No: ${receipt.receiptNumber}</div>
            <div style="color: #64748b;">Date: ${receipt.receiptDate}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Property Details</div>
            <div class="field"><span class="field-label">Property Name:</span> ${property.name}</div>
            <div class="field"><span class="field-label">Address:</span> ${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.pincode}</div>
            <div class="field"><span class="field-label">Phone:</span> ${property.phone}</div>
            <div class="field"><span class="field-label">Email:</span> ${property.email}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Landlord Details</div>
            <div class="field"><span class="field-label">Name:</span> ${landlord.name}</div>
            <div class="field"><span class="field-label">Email:</span> ${landlord.email}</div>
            <div class="field"><span class="field-label">Phone:</span> ${landlord.phone}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Tenant Details</div>
            <div class="field"><span class="field-label">Name:</span> ${tenant.name}</div>
            <div class="field"><span class="field-label">Email:</span> ${tenant.email}</div>
            <div class="field"><span class="field-label">Phone:</span> ${tenant.phone}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Breakdown</div>
            <table class="breakdown-table">
              <tr><td class="label">Previous Balance</td><td class="amount">₹${breakdown.previousBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
              <tr><td class="label">Base Rent</td><td class="amount">₹${breakdown.baseRent.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
              ${breakdown.maintenanceCharges ? `<tr><td class="label">Maintenance Charges</td><td class="amount">₹${breakdown.maintenanceCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>` : ''}
              ${breakdown.waterCharges ? `<tr><td class="label">Water Charges</td><td class="amount">₹${breakdown.waterCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>` : ''}
              ${breakdown.electricityCharges ? `<tr><td class="label">Electricity Charges</td><td class="amount">₹${breakdown.electricityCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>` : ''}
              <tr class="total-row"><td class="label">Total Amount</td><td class="amount">₹${breakdown.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
              <tr class="total-row"><td class="label">Amount Paid</td><td class="amount">₹${breakdown.amountPaid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
              <tr class="total-row"><td class="label">Balance</td><td class="amount">₹${breakdown.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
            </table>
          </div>
          
          <div class="section" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <div class="field"><span class="field-label">Payment Method:</span> ${payment.method}</div>
            <div class="field"><span class="field-label">Payment Date:</span> ${payment.date}</div>
            ${payment.reference ? `<div class="field"><span class="field-label">Reference:</span> ${payment.reference}</div>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async cachePreview(templateId: string, propertyId: string | undefined, previewData: any): Promise<void> {
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes
    
    await this.pool.query(
      `INSERT INTO template_preview_cache 
       (template_id, property_id, sample_data, preview_html, preview_expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (template_id, property_id) 
       DO UPDATE SET sample_data = $3, preview_html = $4, preview_expires_at = $5, created_at = CURRENT_TIMESTAMP`,
      [templateId, propertyId, JSON.stringify(previewData.sampleData), previewData.previewHtml, expiresAt]
    );
  }

  async getCachedPreview(templateId: string, propertyId?: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM template_preview_cache 
       WHERE template_id = $1 AND ($2::uuid IS NULL OR property_id = $2) 
       AND preview_expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [templateId, propertyId || null]
    );
    
    return result.rows[0] || null;
  }
}
