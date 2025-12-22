import { Pool } from 'pg';
import { ReceiptTemplate, ReceiptTemplateInput } from '@/models/ReceiptTemplate';
import { TABLES, COLUMNS } from '@/shared/constants/database';

export class ReceiptTemplateRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<ReceiptTemplate[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RECEIPT_TEMPLATES} ORDER BY ${COLUMNS.RECEIPT_TEMPLATES.CREATED_AT} ASC`
      );
      return result.rows.map(row => this.mapRowToReceiptTemplate(row));
    } catch (error) {
      throw new Error(`Failed to fetch receipt templates: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<ReceiptTemplate | null> {
    try {
      console.log('🔍 Finding receipt template by ID:', id);
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RECEIPT_TEMPLATES} WHERE ${COLUMNS.RECEIPT_TEMPLATES.ID} = $1`,
        [id]
      );
      console.log('📊 Query result:', result.rows);
      return result.rows[0] ? this.mapRowToReceiptTemplate(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ Error in findById:', error);
      throw new Error(`Failed to fetch receipt template: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByType(type: string): Promise<ReceiptTemplate | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RECEIPT_TEMPLATES} WHERE ${COLUMNS.RECEIPT_TEMPLATES.TYPE} = $1`,
        [type]
      );
      return result.rows[0] ? this.mapRowToReceiptTemplate(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch receipt template by type: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: ReceiptTemplateInput): Promise<ReceiptTemplate> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.RECEIPT_TEMPLATES} (
          ${COLUMNS.RECEIPT_TEMPLATES.ID},
          ${COLUMNS.RECEIPT_TEMPLATES.TYPE},
          ${COLUMNS.RECEIPT_TEMPLATES.NAME},
          ${COLUMNS.RECEIPT_TEMPLATES.DESCRIPTION},
          ${COLUMNS.RECEIPT_TEMPLATES.DEFAULT_SETTINGS},
          ${COLUMNS.RECEIPT_TEMPLATES.TEMPLATE_HTML},
          ${COLUMNS.RECEIPT_TEMPLATES.TEMPLATE_CSS},
          ${COLUMNS.RECEIPT_TEMPLATES.LAYOUT_CONFIG},
          ${COLUMNS.RECEIPT_TEMPLATES.PLACEHOLDERS},
          ${COLUMNS.RECEIPT_TEMPLATES.PREVIEW_IMAGE_URL},
          ${COLUMNS.RECEIPT_TEMPLATES.IS_ACTIVE},
          ${COLUMNS.RECEIPT_TEMPLATES.IS_DEFAULT},
          ${COLUMNS.RECEIPT_TEMPLATES.SORT_ORDER},
          ${COLUMNS.RECEIPT_TEMPLATES.CREATED_AT},
          ${COLUMNS.RECEIPT_TEMPLATES.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          crypto.randomUUID(),
          data.type,
          data.name,
          data.description,
          JSON.stringify(data.defaultSettings),
          data.templateHtml,
          data.templateCss ? JSON.stringify(data.templateCss) : null,
          data.layoutConfig ? JSON.stringify(data.layoutConfig) : null,
          data.placeholders ? JSON.stringify(data.placeholders) : null,
          data.previewImageUrl,
          data.isActive || true,
          data.isDefault || false,
          data.sortOrder || 0,
          now,
          now
        ]
      );
      return this.mapRowToReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create receipt template: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<ReceiptTemplateInput>): Promise<ReceiptTemplate | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.type !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.TYPE} = $${paramIndex++}`);
        values.push(data.type);
      }
      if (data.name !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.NAME} = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.DESCRIPTION} = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.defaultSettings !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.DEFAULT_SETTINGS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.defaultSettings));
      }
      if (data.templateHtml !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.TEMPLATE_HTML} = $${paramIndex++}`);
        values.push(data.templateHtml);
      }
      if (data.templateCss !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.TEMPLATE_CSS} = $${paramIndex++}`);
        values.push(data.templateCss ? JSON.stringify(data.templateCss) : null);
      }
      if (data.layoutConfig !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.LAYOUT_CONFIG} = $${paramIndex++}`);
        values.push(data.layoutConfig ? JSON.stringify(data.layoutConfig) : null);
      }
      if (data.placeholders !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.PLACEHOLDERS} = $${paramIndex++}`);
        values.push(data.placeholders ? JSON.stringify(data.placeholders) : null);
      }
      if (data.previewImageUrl !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.PREVIEW_IMAGE_URL} = $${paramIndex++}`);
        values.push(data.previewImageUrl);
      }
      if (data.isActive !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.IS_ACTIVE} = $${paramIndex++}`);
        values.push(data.isActive);
      }
      if (data.isDefault !== undefined) {
        fields.push(`${COLUMNS.RECEIPT_TEMPLATES.IS_DEFAULT} = $${paramIndex++}`);
        values.push(data.isDefault);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.RECEIPT_TEMPLATES.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.RECEIPT_TEMPLATES} SET ${setClause} WHERE ${COLUMNS.RECEIPT_TEMPLATES.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToReceiptTemplate(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update receipt template: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.RECEIPT_TEMPLATES} WHERE ${COLUMNS.RECEIPT_TEMPLATES.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete receipt template: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async getDefaultTemplate(): Promise<ReceiptTemplate | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RECEIPT_TEMPLATES} WHERE ${COLUMNS.RECEIPT_TEMPLATES.IS_DEFAULT} = true LIMIT 1`
      );
      return result.rows[0] ? this.mapRowToReceiptTemplate(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch default receipt template: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  private mapRowToReceiptTemplate(row: any): ReceiptTemplate {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      description: row.description,
      defaultSettings: typeof row.default_settings === 'string' 
        ? JSON.parse(row.default_settings) 
        : row.default_settings,
      templateHtml: row.template_html,
      templateCss: typeof row.template_css === 'string' 
        ? JSON.parse(row.template_css) 
        : row.template_css,
      layoutConfig: typeof row.layout_config === 'string' 
        ? JSON.parse(row.layout_config) 
        : row.layout_config,
      placeholders: typeof row.placeholders === 'string' 
        ? JSON.parse(row.placeholders) 
        : row.placeholders,
      previewImageUrl: row.preview_image_url,
      isActive: row.is_active,
      isDefault: row.is_default,
      sortOrder: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}