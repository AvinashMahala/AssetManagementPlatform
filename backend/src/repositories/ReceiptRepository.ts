import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Receipt, ReceiptInput, ReceiptGenerationRequest, BulkReceiptGenerationRequest } from '../models/Receipt';
import { IReceiptRepository } from '../interfaces/repositories/IReceiptRepository';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate';
import { TABLES, COLUMNS } from '../constants/database';

export class ReceiptRepository implements IReceiptRepository {
  constructor(private db: Pool) {}

  async findAll(): Promise<Receipt[]> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query);
    return result.rows.map(this.mapRowToReceipt);
  }

  async findById(id: string): Promise<Receipt | null> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToReceipt(result.rows[0]) : null;
  }

  async findByReceiptNumber(receiptNumber: string): Promise<Receipt | null> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      WHERE receipt_number = $1
    `;
    const result = await this.db.query(query, [receiptNumber]);
    return result.rows.length > 0 ? this.mapRowToReceipt(result.rows[0]) : null;
  }

  async findByProperty(propertyId: string): Promise<Receipt[]> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      WHERE property_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [propertyId]);
    return result.rows.map(this.mapRowToReceipt);
  }

  async findByRentTransaction(rentTransactionId: string): Promise<Receipt[]> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      WHERE rent_transaction_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [rentTransactionId]);
    return result.rows.map(this.mapRowToReceipt);
  }

  async findByTenant(tenantId: string): Promise<Receipt[]> {
    const query = `
      SELECT * FROM ${TABLES.RECEIPTS}
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rows.map(this.mapRowToReceipt);
  }

  async create(data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
    const id = uuidv4();
    const query = `
      INSERT INTO ${TABLES.RECEIPTS} (
        ${COLUMNS.RECEIPTS.ID},
        ${COLUMNS.RECEIPTS.RECEIPT_NUMBER},
        ${COLUMNS.RECEIPTS.PROPERTY_ID},
        ${COLUMNS.RECEIPTS.RENT_TRANSACTION_ID},
        ${COLUMNS.RECEIPTS.TENANT_ID},
        ${COLUMNS.RECEIPTS.RECEIPT_DATE},
        ${COLUMNS.RECEIPTS.AMOUNT},
        ${COLUMNS.RECEIPTS.DESCRIPTION},
        ${COLUMNS.RECEIPTS.RECEIPT_DATA},
        ${COLUMNS.RECEIPTS.STATUS},
        ${COLUMNS.RECEIPTS.GENERATED_BY},
        ${COLUMNS.RECEIPTS.SENT_TO},
        ${COLUMNS.RECEIPTS.SENT_AT},
        ${COLUMNS.RECEIPTS.CREATED_AT},
        ${COLUMNS.RECEIPTS.UPDATED_AT}
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      data.receiptNumber,
      data.propertyId,
      data.rentTransactionId,
      data.tenantId,
      data.receiptDate,
      data.amount,
      data.description,
      JSON.stringify(data.receiptData),
      data.status,
      data.generatedBy,
      data.sentTo,
      data.sentAt
    ];

    const result = await this.db.query(query, values);
    return this.mapRowToReceipt(result.rows[0]);
  }

  async update(id: string, data: Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Receipt | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.receiptNumber !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.RECEIPT_NUMBER} = $${paramIndex++}`);
      values.push(data.receiptNumber);
    }
    if (data.receiptData !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.RECEIPT_DATA} = $${paramIndex++}`);
      values.push(JSON.stringify(data.receiptData));
    }
    if (data.status !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.STATUS} = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.sentTo !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.SENT_TO} = $${paramIndex++}`);
      values.push(data.sentTo);
    }
    if (data.sentAt !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.SENT_AT} = $${paramIndex++}`);
      values.push(data.sentAt);
    }

    if (updateFields.length === 0) return null;

    updateFields.push(`${COLUMNS.RECEIPTS.UPDATED_AT} = NOW()`);

    const query = `
      UPDATE ${TABLES.RECEIPTS}
      SET ${updateFields.join(', ')}
      WHERE ${COLUMNS.RECEIPTS.ID} = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await this.db.query(query, values);
    return result.rows.length > 0 ? this.mapRowToReceipt(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM ${TABLES.RECEIPTS}
      WHERE ${COLUMNS.RECEIPTS.ID} = $1
    `;
    const result = await this.db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getNextReceiptNumber(propertyId: string, prefix: string = 'REC'): Promise<string> {
    const query = `
      SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '[0-9]+$') AS INTEGER)), 0) + 1 as next_number
      FROM ${TABLES.RECEIPTS}
      WHERE property_id = $1 AND receipt_number LIKE $2
    `;
    const result = await this.db.query(query, [propertyId, `${prefix}%`]);
    const nextNumber = result.rows[0].next_number;
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async getNextReceiptNumberWithTemplate(propertyId: string, templateSettings: ReceiptTemplateSettings | null): Promise<string> {
    // Use template numbering settings or defaults
    const numberingSettings = templateSettings?.numbering || {
      prefix: 'REC',
      startNumber: 1,
      includeYear: false,
      includeMonth: false
    };

    // Build the base prefix
    let prefix = numberingSettings.prefix;

    // Add year if enabled
    if (numberingSettings.includeYear) {
      const currentYear = new Date().getFullYear();
      prefix += currentYear.toString();
    }

    // Add month if enabled
    if (numberingSettings.includeMonth) {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      prefix += currentMonth;
    }

    // Get the next number for this prefix and property
    const query = `
      SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM '[0-9]+$') AS INTEGER)), ${numberingSettings.startNumber - 1}) + 1 as next_number
      FROM ${TABLES.RECEIPTS}
      WHERE property_id = $1 AND receipt_number LIKE $2
    `;
    const result = await this.db.query(query, [propertyId, `${prefix}%`]);
    const nextNumber = result.rows[0].next_number;

    // Format the number with leading zeros (6 digits by default)
    const formattedNumber = nextNumber.toString().padStart(6, '0');

    return `${prefix}${formattedNumber}`;
  }

  async updateStatus(id: string, status: string, sentTo?: string, sentAt?: Date): Promise<boolean> {
    const updateFields: string[] = [`${COLUMNS.RECEIPTS.STATUS} = $1`];
    const values: any[] = [status];
    let paramIndex = 2;

    if (sentTo !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.SENT_TO} = $${paramIndex++}`);
      values.push(sentTo);
    }
    if (sentAt !== undefined) {
      updateFields.push(`${COLUMNS.RECEIPTS.SENT_AT} = $${paramIndex++}`);
      values.push(sentAt);
    }

    updateFields.push(`${COLUMNS.RECEIPTS.UPDATED_AT} = NOW()`);

    const query = `
      UPDATE ${TABLES.RECEIPTS}
      SET ${updateFields.join(', ')}
      WHERE ${COLUMNS.RECEIPTS.ID} = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await this.db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }

  private mapRowToReceipt(row: any): Receipt {
    return {
      id: row.id,
      receiptNumber: row.receipt_number,
      propertyId: row.property_id,
      rentTransactionId: row.rent_transaction_id,
      tenantId: row.tenant_id,
      receiptDate: row.receipt_date,
      amount: parseFloat(row.amount) || 0,
      description: row.description,
      receiptData: row.receipt_data,
      pdfUrl: row.pdf_url,
      fileSize: row.file_size,
      status: row.status,
      generatedBy: row.generated_by,
      sentTo: row.sent_to,
      sentAt: row.sent_at,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}