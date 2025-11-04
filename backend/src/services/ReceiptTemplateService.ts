import { ReceiptTemplateRepository } from '../repositories/ReceiptTemplateRepository';
import { PropertyRepository } from '../repositories/PropertyRepository';
import { ReceiptTemplate, ReceiptTemplateInput, ReceiptTemplateType, ReceiptTemplateSettings, PropertyTemplateSelection } from '../models/ReceiptTemplate';

export class ReceiptTemplateService {
  constructor(
    private templateRepository: ReceiptTemplateRepository,
    private propertyRepository: PropertyRepository
  ) {}

  async getAllTemplates(): Promise<ReceiptTemplate[]> {
    return await this.templateRepository.findAll();
  }

  async getTemplateById(id: string): Promise<ReceiptTemplate | null> {
    return await this.templateRepository.findById(id);
  }

  async getTemplateByType(type: ReceiptTemplateType): Promise<ReceiptTemplate | null> {
    return await this.templateRepository.findByType(type);
  }

  async createTemplate(data: ReceiptTemplateInput): Promise<ReceiptTemplate> {
    // Validate template type
    if (!Object.values(ReceiptTemplateType).includes(data.type)) {
      throw new Error(`Invalid template type: ${data.type}`);
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.unsetOtherDefaults();
    }

    return await this.templateRepository.create(data);
  }

  async updateTemplate(id: string, data: Partial<ReceiptTemplateInput>): Promise<ReceiptTemplate | null> {
    const existingTemplate = await this.templateRepository.findById(id);
    if (!existingTemplate) {
      return null;
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.unsetOtherDefaults();
    }

    return await this.templateRepository.update(id, data);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      return false;
    }

    // Prevent deletion of default template
    if (template.isDefault) {
      throw new Error('Cannot delete the default template');
    }

    // Update properties using this template to use default template
    const defaultTemplate = await this.templateRepository.getDefaultTemplate();
    if (defaultTemplate) {
      // Note: This would require a method to update multiple properties
      // For now, we'll leave properties without a template until manually reassigned
    }

    return await this.templateRepository.delete(id);
  }

  async getDefaultTemplate(): Promise<ReceiptTemplate | null> {
    return await this.templateRepository.getDefaultTemplate();
  }

  async setDefaultTemplate(templateId: string): Promise<boolean> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Unset other defaults first
    await this.unsetOtherDefaults();

    // Set this template as default
    const updated = await this.templateRepository.update(templateId, { isDefault: true });
    return updated !== null;
  }

  async getPropertyTemplateSettings(propertyId: string): Promise<ReceiptTemplateSettings | null> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property || !property.templateId) {
      // Return default template settings if no template selected
      const defaultTemplate = await this.getDefaultTemplate();
      return defaultTemplate ? defaultTemplate.defaultSettings : null;
    }

    const template = await this.templateRepository.findById(property.templateId);
    if (!template) {
      return null;
    }

    // Merge template settings with property overrides
    return this.mergeTemplateSettings(template.defaultSettings, property.templateOverrides);
  }

  async setPropertyTemplate(propertyId: string, templateId: string, overrides?: Partial<ReceiptTemplateSettings>): Promise<boolean> {
    // Validate template exists
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Validate property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return await this.propertyRepository.update(propertyId, {
      templateId,
      templateOverrides: overrides
    }) !== null;
  }

  async getAvailableTemplates(): Promise<ReceiptTemplate[]> {
    const allTemplates = await this.templateRepository.findAll();
    return allTemplates.filter(template => template.isActive);
  }

  private async unsetOtherDefaults(): Promise<void> {
    const allTemplates = await this.templateRepository.findAll();
    for (const template of allTemplates) {
      if (template.isDefault) {
        await this.templateRepository.update(template.id, { isDefault: false });
      }
    }
  }

  private mergeTemplateSettings(baseSettings: ReceiptTemplateSettings, overrides?: Partial<ReceiptTemplateSettings>): ReceiptTemplateSettings {
    if (!overrides) {
      return baseSettings;
    }

    // Deep merge the settings
    return {
      theme: { ...baseSettings.theme, ...overrides.theme },
      layout: { ...baseSettings.layout, ...overrides.layout },
      content: { ...baseSettings.content, ...overrides.content },
      paymentOptions: { ...baseSettings.paymentOptions, ...overrides.paymentOptions },
      numbering: { ...baseSettings.numbering, ...overrides.numbering }
    };
  }
}