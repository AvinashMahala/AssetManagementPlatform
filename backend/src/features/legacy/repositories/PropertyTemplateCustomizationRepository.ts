import { Pool } from 'pg';
import { PropertyTemplateCustomization } from '@/models/TemplateCustomization';
import { TABLES, COLUMNS } from '@/shared/constants/database';

export class PropertyTemplateCustomizationRepository {
  constructor(private pool: Pool) {}

  async findByPropertyId(propertyId: string): Promise<PropertyTemplateCustomization | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.PROPERTY_TEMPLATE_CUSTOMIZATIONS} WHERE ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.PROPERTY_ID} = $1`,
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
        `INSERT INTO ${TABLES.PROPERTY_TEMPLATE_CUSTOMIZATIONS} 
         (${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.PROPERTY_ID}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.TEMPLATE_ID}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_STYLES}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_LOGO_URL}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_HEADER}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_FOOTER}, 
          ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.SHOW_QR_CODE}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.QR_CODE_DATA}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.QR_CODE_POSITION}, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.QR_CODE_SIZE})
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
        `UPDATE ${TABLES.PROPERTY_TEMPLATE_CUSTOMIZATIONS} 
         SET ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.TEMPLATE_ID} = COALESCE($2, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.TEMPLATE_ID}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_STYLES} = COALESCE($3, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_STYLES}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_LOGO_URL} = COALESCE($4, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_LOGO_URL}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_HEADER} = COALESCE($5, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_HEADER}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_FOOTER} = COALESCE($6, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.CUSTOM_FOOTER}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.SHOW_QR_CODE} = COALESCE($7, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.SHOW_QR_CODE}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.QR_CODE_DATA} = COALESCE($8, ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.QR_CODE_DATA}),
             ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.UPDATED_AT} = CURRENT_TIMESTAMP
         WHERE ${COLUMNS.PROPERTY_TEMPLATE_CUSTOMIZATIONS.PROPERTY_ID} = $1
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
