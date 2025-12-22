import { Pool } from 'pg';
import { ReceiptTemplateRepository } from '@/features/finance/receipt-template/data/repository/ReceiptTemplateRepository';
import { PropertyTemplateCustomizationRepository } from '@/features/legacy/repositories/PropertyTemplateCustomizationRepository';
import { TemplatePreviewService } from './TemplatePreviewService';
import { TemplateImportExportService } from './TemplateImportExportService';
import { TemplateConfiguration, PropertyTemplateCustomization, TemplatePlaceholder } from '@/models/TemplateCustomization';
import { PreviewRequest } from '@/models/TemplatePreview';

export class TemplateCustomizationService {
  private templateRepo: ReceiptTemplateRepository;
  private customizationRepo: PropertyTemplateCustomizationRepository;
  private previewService: TemplatePreviewService;
  private importExportService: TemplateImportExportService;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.templateRepo = new ReceiptTemplateRepository(pool);
    this.customizationRepo = new PropertyTemplateCustomizationRepository(pool);
    this.previewService = new TemplatePreviewService(pool);
    this.importExportService = new TemplateImportExportService(pool);
  }

  async generatePreview(request: PreviewRequest) {
    return this.previewService.generatePreview(request);
  }

  async exportTemplate(templateId: string) {
    return this.importExportService.exportTemplate(templateId);
  }

  async importTemplate(importData: any, userId: string) {
    return this.importExportService.importTemplate(importData, userId);
  }

  async duplicateTemplate(templateId: string, name: string) {
    return this.importExportService.duplicateTemplate(templateId, name);
  }

  async getAllTemplates() {
    return this.templateRepo.findAll();
  }

  async getTemplateById(id: string) {
    return this.templateRepo.findById(id);
  }

  async getPropertyTemplateSettings(propertyId: string) {
    return this.customizationRepo.findByPropertyId(propertyId);
  }

  async updatePropertyTemplateSettings(propertyId: string, data: Partial<PropertyTemplateCustomization>) {
    const existing = await this.customizationRepo.findByPropertyId(propertyId);
    
    if (existing) {
      return this.customizationRepo.update(propertyId, data);
    } else {
      return this.customizationRepo.create({
        propertyId,
        templateId: data.templateId!,
        showQrCode: data.showQrCode || false,
        ...data
      });
    }
  }

  getAvailablePlaceholders(): Record<string, TemplatePlaceholder[]> {
    return {
      property: [
        { key: '{{property.name}}', label: 'Property Name', type: 'text', category: 'property', required: true, example: 'Sunrise Apartments' },
        { key: '{{property.address}}', label: 'Property Address', type: 'address', category: 'property', required: true, example: '123 Main St, Mumbai' },
        { key: '{{property.phone}}', label: 'Property Phone', type: 'phone', category: 'property', required: false, example: '+91-9876543210' },
        { key: '{{property.email}}', label: 'Property Email', type: 'email', category: 'property', required: false, example: 'info@property.com' }
      ],
      tenant: [
        { key: '{{tenant.name}}', label: 'Tenant Name', type: 'text', category: 'tenant', required: true, example: 'John Doe' },
        { key: '{{tenant.email}}', label: 'Tenant Email', type: 'email', category: 'tenant', required: false, example: 'john@example.com' },
        { key: '{{tenant.phone}}', label: 'Tenant Phone', type: 'phone', category: 'tenant', required: false, example: '+91-9876543211' }
      ],
      payment: [
        { key: '{{payment.amount}}', label: 'Payment Amount', type: 'currency', category: 'payment', required: true, format: '₹#,##0.00', example: '₹25,000.00' },
        { key: '{{payment.date}}', label: 'Payment Date', type: 'date', category: 'payment', required: true, format: 'DD/MM/YYYY', example: '04/11/2024' },
        { key: '{{payment.method}}', label: 'Payment Method', type: 'text', category: 'payment', required: true, example: 'UPI' }
      ],
      receipt: [
        { key: '{{receipt.number}}', label: 'Receipt Number', type: 'text', category: 'receipt', required: true, example: 'REC-2024-001' },
        { key: '{{receipt.date}}', label: 'Receipt Date', type: 'date', category: 'receipt', required: true, format: 'DD/MM/YYYY', example: '04/11/2024' }
      ]
    };
  }
}
