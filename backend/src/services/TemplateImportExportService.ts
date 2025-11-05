import { Pool } from 'pg';
import { TemplateConfiguration } from '../models/TemplateCustomization';

export class TemplateImportExportService {
  constructor(private pool: Pool) {}

  async exportTemplate(templateId: string): Promise<any> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM receipt_templates WHERE id = $1',
        [templateId]
      );

      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }

      const template = result.rows[0];

      // Create export package
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        template: {
          name: template.name,
          type: template.type,
          description: template.description,
          defaultSettings: template.default_settings,
          templateHtml: template.template_html,
          templateCss: template.template_css,
          layoutConfig: template.layout_config,
          placeholders: template.placeholders,
        },
        metadata: {
          exportedBy: 'system',
          originalId: template.id,
        },
      };

      return exportData;
    } catch (error: any) {
      throw new Error(`Failed to export template: ${error.message}`);
    }
  }

  async importTemplate(importData: any, userId: string): Promise<string> {
    try {
      // Validate import data
      this.validateImportData(importData);

      const { template } = importData;

      // Insert new template
      const result = await this.pool.query(
        `INSERT INTO receipt_templates 
         (name, type, description, default_settings, template_html, template_css, 
          layout_config, placeholders, is_active, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false)
         RETURNING id`,
        [
          `${template.name} (Imported)`,
          template.type,
          template.description,
          JSON.stringify(template.defaultSettings),
          template.templateHtml,
          JSON.stringify(template.templateCss),
          JSON.stringify(template.layoutConfig),
          JSON.stringify(template.placeholders),
        ]
      );

      return result.rows[0].id;
    } catch (error: any) {
      throw new Error(`Failed to import template: ${error.message}`);
    }
  }

  private validateImportData(data: any): void {
    if (!data.version) {
      throw new Error('Invalid import data: missing version');
    }

    if (!data.template) {
      throw new Error('Invalid import data: missing template');
    }

    const required = ['name', 'type', 'defaultSettings'];
    for (const field of required) {
      if (!data.template[field]) {
        throw new Error(`Invalid import data: missing ${field}`);
      }
    }

    // Validate template type
    const validTypes = ['basic', 'professional', 'premium'];
    if (!validTypes.includes(data.template.type)) {
      throw new Error(`Invalid template type: ${data.template.type}`);
    }
  }

  async duplicateTemplate(templateId: string, newName: string): Promise<string> {
    try {
      const result = await this.pool.query(
        `INSERT INTO receipt_templates 
         (name, type, description, default_settings, template_html, template_css, 
          layout_config, placeholders, is_active, is_default, sort_order)
         SELECT $1, type, description, default_settings, template_html, template_css,
                layout_config, placeholders, true, false, sort_order
         FROM receipt_templates
         WHERE id = $2
         RETURNING id`,
        [newName, templateId]
      );

      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }

      return result.rows[0].id;
    } catch (error: any) {
      throw new Error(`Failed to duplicate template: ${error.message}`);
    }
  }
}
