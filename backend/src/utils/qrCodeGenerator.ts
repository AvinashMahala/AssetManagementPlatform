import QRCode from 'qrcode';
import { Pool } from 'pg';

export class QRCodeGenerator {
  constructor(private pool: Pool) {}

  async generateQRCode(data: string, options?: {
    size?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  }): Promise<string> {
    try {
      const qrOptions = {
        width: options?.size || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#FFFFFF',
        },
      };

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(data, qrOptions);
      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw new Error('QR code generation failed');
    }
  }

  async generatePaymentQRCode(paymentData: {
    upiId?: string;
    amount?: number;
    name?: string;
    note?: string;
  }): Promise<string> {
    // Generate UPI payment URL
    const upiUrl = this.buildUPIUrl(paymentData);
    return this.generateQRCode(upiUrl);
  }

  async generateReceiptQRCode(receiptId: string, baseUrl: string): Promise<string> {
    const receiptUrl = `${baseUrl}/receipts/${receiptId}`;
    return this.generateQRCode(receiptUrl);
  }

  private buildUPIUrl(data: {
    upiId?: string;
    amount?: number;
    name?: string;
    note?: string;
  }): string {
    const params = new URLSearchParams();
    
    if (data.upiId) params.append('pa', data.upiId);
    if (data.name) params.append('pn', data.name);
    if (data.amount) params.append('am', data.amount.toString());
    if (data.note) params.append('tn', data.note);
    params.append('cu', 'INR');

    return `upi://pay?${params.toString()}`;
  }

  async generateQRCodeBuffer(data: string, options?: any): Promise<Buffer> {
    try {
      const qrBuffer = await QRCode.toBuffer(data, options);
      return qrBuffer;
    } catch (error) {
      console.error('Failed to generate QR code buffer:', error);
      throw new Error('QR code buffer generation failed');
    }
  }
}
