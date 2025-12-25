import { emailService } from '@/shared/utils/email';
import { RentTransaction } from '@/features/finance/rent-transaction/core/rent-transaction.types';

export interface NotificationOptions {
  transactionId: string;
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: Date;
  invoiceUrl?: string;
}

export interface NotificationResult {
  success: boolean;
  method: 'email' | 'sms' | 'manual';
  sentAt: Date;
  error?: string;
}

export class NotificationService {
  /**
   * Send invoice notification to tenant
   */
  async sendInvoiceNotification(options: NotificationOptions): Promise<NotificationResult> {
    const {
      transactionId,
      tenantEmail,
      tenantName,
      propertyName,
      unitNumber,
      invoiceNumber,
      totalAmount,
      dueDate,
      invoiceUrl
    } = options;

    try {
      // Format currency
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(totalAmount);

      // Format due date
      const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create email content
      const subject = `Rent Invoice - ${propertyName} Unit ${unitNumber}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Rent Invoice</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${propertyName} - Unit ${unitNumber}</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${tenantName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              Your rent invoice has been generated and is ready for payment.
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Invoice Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">Invoice Number:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">Amount Due:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-size: 18px; font-weight: bold; color: #28a745;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">Due Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${formattedDueDate}</td>
                </tr>
              </table>
            </div>

            ${invoiceUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invoiceUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                📄 View & Download Invoice
              </a>
            </div>
            ` : ''}

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">💰 Payment Instructions</h4>
              <p style="margin: 0; color: #856404; line-height: 1.6;">
                Please ensure payment is made by the due date to avoid any late fees.
                You can make payment through online transfer, UPI, or cash.
              </p>
            </div>

            <p style="font-size: 16px; color: #333; margin-top: 30px;">
              Thank you for your prompt attention to this matter.
            </p>

            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              Best regards,<br/>
              <strong>${propertyName} Management</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This is an automated message from the Asset Management Platform.</p>
              <p>If you have any questions, please contact your property manager.</p>
            </div>
          </div>
        </div>
      `;

      const textContent = `
Rent Invoice - ${propertyName} Unit ${unitNumber}

Dear ${tenantName},

Your rent invoice has been generated and is ready for payment.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Amount Due: ${formattedAmount}
- Due Date: ${formattedDueDate}

${invoiceUrl ? `View Invoice: ${invoiceUrl}` : ''}

Please ensure payment is made by the due date to avoid any late fees.

Thank you,
${propertyName} Management

---
This is an automated message from the Asset Management Platform.
      `.trim();

      // Send email
      const emailSent = await emailService.sendEmail({
        to: tenantEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      return {
        success: emailSent,
        method: 'email',
        sentAt: new Date(),
        error: emailSent ? undefined : 'Email service is currently disabled'
      };

    } catch (error) {
      console.error('Error sending invoice notification:', error);
      return {
        success: false,
        method: 'email',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send receipt notification to tenant
   */
  async sendReceiptNotification(options: NotificationOptions): Promise<NotificationResult> {
    const {
      transactionId,
      tenantEmail,
      tenantName,
      propertyName,
      unitNumber,
      invoiceNumber, // This will be receipt number
      totalAmount,
      dueDate,
      invoiceUrl
    } = options;

    try {
      // Format currency
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(totalAmount);

      // Create email content
      const subject = `Payment Receipt - ${propertyName} Unit ${unitNumber}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Payment Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${propertyName} - Unit ${unitNumber}</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${tenantName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              Thank you! Your payment has been received and processed successfully.
            </p>

            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin: 0 0 15px 0; color: #155724;">Receipt Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; font-weight: bold;">Receipt Number:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; font-size: 18px; font-weight: bold; color: #28a745;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; font-weight: bold;">Payment Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb;">${new Date().toLocaleDateString('en-IN')}</td>
                </tr>
              </table>
            </div>

            ${invoiceUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invoiceUrl}"
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                📄 View Receipt
              </a>
            </div>
            ` : ''}

            <p style="font-size: 16px; color: #333; margin-top: 30px;">
              We appreciate your business and look forward to serving you.
            </p>

            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              Best regards,<br/>
              <strong>${propertyName} Management</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This is an automated message from the Asset Management Platform.</p>
            </div>
          </div>
        </div>
      `;

      const textContent = `
Payment Receipt - ${propertyName} Unit ${unitNumber}

Dear ${tenantName},

Thank you! Your payment has been received and processed successfully.

Receipt Details:
- Receipt Number: ${invoiceNumber}
- Amount Paid: ${formattedAmount}
- Payment Date: ${new Date().toLocaleDateString('en-IN')}

${invoiceUrl ? `View Receipt: ${invoiceUrl}` : ''}

We appreciate your business!

Best regards,
${propertyName} Management

---
This is an automated message from the Asset Management Platform.
      `.trim();

      // Send email
      const emailSent = await emailService.sendEmail({
        to: tenantEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      return {
        success: emailSent,
        method: 'email',
        sentAt: new Date(),
        error: emailSent ? undefined : 'Email service is currently disabled'
      };

    } catch (error) {
      console.error('Error sending receipt notification:', error);
      return {
        success: false,
        method: 'email',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminder(options: NotificationOptions): Promise<NotificationResult> {
    const {
      tenantEmail,
      tenantName,
      propertyName,
      unitNumber,
      totalAmount,
      dueDate
    } = options;

    try {
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(totalAmount);

      const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const subject = `Payment Reminder - ${propertyName} Unit ${unitNumber}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Payment Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${propertyName} - Unit ${unitNumber}</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${tenantName},</p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              This is a friendly reminder that your rent payment is due soon.
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #856404;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold;">Amount Due:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-size: 18px; font-weight: bold; color: #856404;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold;">Due Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7;">${formattedDueDate}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Please make your payment at your earliest convenience to avoid any late fees.
              </p>
            </div>

            <p style="font-size: 16px; color: #333; margin-top: 30px;">
              Thank you for your attention to this matter.
            </p>

            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              Best regards,<br/>
              <strong>${propertyName} Management</strong>
            </p>
          </div>
        </div>
      `;

      const emailSent = await emailService.sendEmail({
        to: tenantEmail,
        subject,
        html: htmlContent
      });

      return {
        success: emailSent,
        method: 'email',
        sentAt: new Date(),
        error: emailSent ? undefined : 'Email service is currently disabled'
      };

    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return {
        success: false,
        method: 'email',
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const notificationService = new NotificationService();