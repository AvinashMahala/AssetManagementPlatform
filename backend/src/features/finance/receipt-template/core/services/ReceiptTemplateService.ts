import { ReceiptTemplateRepository } from '../../data/repository/ReceiptTemplateRepository';
import { PropertyRepository } from '@/features/legacy/repositories/PropertyRepository';
import { ReceiptTemplate, ReceiptTemplateInput, ReceiptTemplateType, ReceiptTemplateSettings, PropertyTemplateSelection } from '@/models/ReceiptTemplate';

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
    console.log('🏢 Getting template settings for property:', propertyId);
    const property = await this.propertyRepository.findById(propertyId);
    console.log('📍 Property found:', property ? `ID: ${property.id}, Template ID: ${property.templateId}` : 'NULL');
    
    if (!property || !property.templateId) {
      // Return default template settings if no template selected
      console.log('⚠️ No template ID, getting default template');
      const defaultTemplate = await this.getDefaultTemplate();
      console.log('📋 Default template:', defaultTemplate ? `ID: ${defaultTemplate.id}` : 'NULL');
      return defaultTemplate ? defaultTemplate.defaultSettings : null;
    }

    console.log('🔍 Looking for template:', property.templateId);
    const template = await this.templateRepository.findById(property.templateId);
    console.log('📝 Template found:', template ? `ID: ${template.id}, Name: ${template.name}` : 'NULL');
    
    if (!template) {
      console.log('❌ Template not found!');
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

  /**
   * Validates template settings for completeness and correctness
   */
  validateTemplateSettings(settings: ReceiptTemplateSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate theme settings
    if (!settings.theme) {
      errors.push('Theme settings are required');
    } else {
      if (!settings.theme.primaryColor || !this.isValidHexColor(settings.theme.primaryColor)) {
        errors.push('Valid primary color is required');
      }
      if (!settings.theme.secondaryColor || !this.isValidHexColor(settings.theme.secondaryColor)) {
        errors.push('Valid secondary color is required');
      }
      if (!settings.theme.fontFamily) {
        errors.push('Font family is required');
      }
      if (!['small', 'medium', 'large'].includes(settings.theme.fontSize)) {
        errors.push('Font size must be small, medium, or large');
      }
    }

    // Validate layout settings
    if (!settings.layout) {
      errors.push('Layout settings are required');
    } else {
      if (!['a4', 'letter'].includes(settings.layout.paperSize)) {
        errors.push('Paper size must be a4 or letter');
      }
      if (!['portrait', 'landscape'].includes(settings.layout.orientation)) {
        errors.push('Orientation must be portrait or landscape');
      }
      if (!['top-left', 'top-center', 'top-right'].includes(settings.layout.logoPosition)) {
        errors.push('Logo position must be top-left, top-center, or top-right');
      }
    }

    // Validate content settings
    if (!settings.content) {
      errors.push('Content settings are required');
    }

    // Validate numbering settings
    if (!settings.numbering) {
      errors.push('Numbering settings are required');
    } else {
      if (!settings.numbering.prefix || settings.numbering.prefix.trim().length === 0) {
        errors.push('Receipt number prefix is required');
      }
      if (typeof settings.numbering.startNumber !== 'number' || settings.numbering.startNumber < 1) {
        errors.push('Start number must be a positive integer');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates if a template is ready for receipt generation
   */
  async validateTemplateForReceiptGeneration(templateId: string): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      errors.push('Template not found');
      return { isValid: false, errors, warnings };
    }

    if (!template.isActive) {
      errors.push('Template is not active');
    }

    // Validate template settings
    const settingsValidation = this.validateTemplateSettings(template.defaultSettings);
    if (!settingsValidation.isValid) {
      errors.push(...settingsValidation.errors);
    }

    // Check for potential issues
    if (template.defaultSettings.content.showTermsAndConditions && 
        (!template.defaultSettings.content.termsAndConditionsText || 
         template.defaultSettings.content.termsAndConditionsText.trim().length === 0)) {
      warnings.push('Terms and conditions are enabled but no text is provided');
    }

    if (template.defaultSettings.content.showSignature && 
        (!template.defaultSettings.content.signatureText || 
         template.defaultSettings.content.signatureText.trim().length === 0)) {
      warnings.push('Signature is enabled but no signature text is provided');
    }

    if (template.defaultSettings.layout.showWatermark && 
        (!template.defaultSettings.layout.watermarkText || 
         template.defaultSettings.layout.watermarkText.trim().length === 0)) {
      warnings.push('Watermark is enabled but no watermark text is provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates property template configuration
   */
  async validatePropertyTemplateConfiguration(propertyId: string): Promise<{ isValid: boolean; errors: string[]; warnings: string[]; templateSettings: ReceiptTemplateSettings | null }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      errors.push('Property not found');
      return { isValid: false, errors, warnings, templateSettings: null };
    }

    let templateSettings: ReceiptTemplateSettings | null = null;

    if (!property.templateId) {
      warnings.push('No template assigned to property, using default template');
      const defaultTemplate = await this.getDefaultTemplate();
      if (!defaultTemplate) {
        errors.push('No template assigned and no default template available');
      } else {
        templateSettings = defaultTemplate.defaultSettings;
      }
    } else {
      const template = await this.templateRepository.findById(property.templateId);
      if (!template) {
        errors.push('Assigned template not found');
      } else if (!template.isActive) {
        errors.push('Assigned template is not active');
      } else {
        templateSettings = this.mergeTemplateSettings(template.defaultSettings, property.templateOverrides);
        
        // Validate merged settings
        const settingsValidation = this.validateTemplateSettings(templateSettings);
        if (!settingsValidation.isValid) {
          errors.push(...settingsValidation.errors.map(error => `Template configuration error: ${error}`));
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      templateSettings
    };
  }

  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}