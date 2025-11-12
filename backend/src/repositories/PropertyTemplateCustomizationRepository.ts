import { Pool } from 'pg';
import { PropertyTemplateCustomization } from '../models/TemplateCustomization';

export class PropertyTemplateCustomizationRepository {
  constructor(private pool: Pool) {}

  async findByPropertyId(propertyId: string): Promise<PropertyTemplateCustomization | null> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM property_template_customizations WHERE property_id = $1',
        [propertyId]
      );
      return result.rows[0] ? this.mapRow(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find property template customization by property ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<PropertyTemplateCustomization, 'id'>): Promise<PropertyTemplateCustomization> {
    try {
      const result = await this.pool.query(
        `INSERT INTO property_template_customizations 
         (property_id, template_id, custom_styles, custom_logo_url, custom_header, custom_footer, 
          show_qr_code, qr_code_data, qr_code_position, qr_code_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [data.propertyId, data.templateId, JSON.stringify(data.customStyles), data.customLogoUrl,
         data.customHeader, data.customFooter, data.showQrCode, JSON.stringify(data.qrCodeData),
         data.qrCodePosition, data.qrCodeSize]
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create property template customization: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(propertyId: string, data: Partial<PropertyTemplateCustomization>): Promise<PropertyTemplateCustomization> {
    try {
      const result = await this.pool.query(
        `UPDATE property_template_customizations 
         SET template_id = COALESCE($2, template_id),
             custom_styles = COALESCE($3, custom_styles),
             custom_logo_url = COALESCE($4, custom_logo_url),
             custom_header = COALESCE($5, custom_header),
             custom_footer = COALESCE($6, custom_footer),
             show_qr_code = COALESCE($7, show_qr_code),
             qr_code_data = COALESCE($8, qr_code_data),
             updated_at = CURRENT_TIMESTAMP
         WHERE property_id = $1
         RETURNING *`,
        [propertyId, data.templateId, data.customStyles ? JSON.stringify(data.customStyles) : null,
         data.customLogoUrl, data.customHeader, data.customFooter, data.showQrCode,
         data.qrCodeData ? JSON.stringify(data.qrCodeData) : null]
      );
      return this.mapRow(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update property template customization: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  private mapRow(row: any): PropertyTemplateCustomization {
    return {
      id: row.id,
      propertyId: row.property_id,
      templateId: row.template_id,
      customStyles: typeof row.custom_styles === 'string' ? JSON.parse(row.custom_styles) : row.custom_styles,
      customLogoUrl: row.custom_logo_url,
      customHeader: row.custom_header,
      customFooter: row.custom_footer,
      showQrCode: row.show_qr_code,
      qrCodeData: typeof row.qr_code_data === 'string' ? JSON.parse(row.qr_code_data) : row.qr_code_data,
      qrCodePosition: row.qr_code_position,
      qrCodeSize: row.qr_code_size,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
