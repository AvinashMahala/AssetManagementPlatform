import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Expense, ExpenseInput, ExpenseFilters } from '../models/Expense';
import { IExpenseRepository } from '../interfaces/repositories/IExpenseRepository';
import { TABLES, COLUMNS } from '../constants/database';

export class ExpenseRepository implements IExpenseRepository {
  constructor(private db: Pool) {}

  async findAll(): Promise<Expense[]> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        ORDER BY created_at DESC
      `;
      const result = await this.db.query(query);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch expenses: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<Expense | null> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        WHERE id = $1
      `;
      const result = await this.db.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToExpense(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch expense: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByProperty(propertyId: string): Promise<Expense[]> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        WHERE property_id = $1
        ORDER BY start_date DESC
      `;
      const result = await this.db.query(query, [propertyId]);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch expenses by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByUnit(unitId: string): Promise<Expense[]> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        WHERE unit_id = $1
        ORDER BY start_date DESC
      `;
      const result = await this.db.query(query, [unitId]);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch expenses by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findActiveByProperty(propertyId: string): Promise<Expense[]> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        WHERE property_id = $1 AND is_active = true
        ORDER BY start_date DESC
      `;
      const result = await this.db.query(query, [propertyId]);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch active expenses by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findActiveByUnit(unitId: string): Promise<Expense[]> {
    try {
      const query = `
        SELECT * FROM ${TABLES.EXPENSES}
        WHERE unit_id = $1 AND is_active = true
        ORDER BY start_date DESC
      `;
      const result = await this.db.query(query, [unitId]);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch active expenses by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findWithFilters(filters: ExpenseFilters): Promise<Expense[]> {
    try {
      let query = `SELECT * FROM ${TABLES.EXPENSES} WHERE 1=1`;
      const values: any[] = [];
      let paramIndex = 1;

      if (filters.propertyId) {
        query += ` AND property_id = $${paramIndex++}`;
        values.push(filters.propertyId);
      }

      if (filters.unitId) {
        query += ` AND unit_id = $${paramIndex++}`;
        values.push(filters.unitId);
      }

      if (filters.type) {
        query += ` AND type = $${paramIndex++}`;
        values.push(filters.type);
      }

      if (filters.frequency) {
        query += ` AND frequency = $${paramIndex++}`;
        values.push(filters.frequency);
      }

      if (filters.distribution) {
        query += ` AND distribution = $${paramIndex++}`;
        values.push(filters.distribution);
      }

      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        values.push(filters.status);
      }

      if (filters.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex++}`;
        values.push(filters.isActive);
      }

      if (filters.startDateFrom) {
        query += ` AND start_date >= $${paramIndex++}`;
        values.push(filters.startDateFrom);
      }

      if (filters.startDateTo) {
        query += ` AND start_date <= $${paramIndex++}`;
        values.push(filters.startDateTo);
      }

      query += ` ORDER BY start_date DESC`;

      const result = await this.db.query(query, values);
      return result.rows.map(this.mapRowToExpense);
    } catch (error) {
      throw new Error(`Failed to fetch expenses with filters: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: ExpenseInput): Promise<Expense> {
    try {
      const id = uuidv4();
      const query = `
        INSERT INTO ${TABLES.EXPENSES} (
          ${COLUMNS.EXPENSES.ID},
          ${COLUMNS.EXPENSES.PROPERTY_ID},
          ${COLUMNS.EXPENSES.UNIT_ID},
          ${COLUMNS.EXPENSES.TYPE},
          ${COLUMNS.EXPENSES.DESCRIPTION},
          ${COLUMNS.EXPENSES.AMOUNT},
          ${COLUMNS.EXPENSES.FREQUENCY},
          ${COLUMNS.EXPENSES.START_DATE},
          ${COLUMNS.EXPENSES.END_DATE},
          ${COLUMNS.EXPENSES.DISTRIBUTION},
          ${COLUMNS.EXPENSES.AFFECTED_UNIT_IDS},
          ${COLUMNS.EXPENSES.BILL_PHOTO_URL},
          ${COLUMNS.EXPENSES.STATUS},
          ${COLUMNS.EXPENSES.IS_ACTIVE},
          ${COLUMNS.EXPENSES.CREATED_BY},
          ${COLUMNS.EXPENSES.UPDATED_BY},
          ${COLUMNS.EXPENSES.CREATED_AT},
          ${COLUMNS.EXPENSES.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        id,
        data.propertyId,
        data.unitId,
        data.type,
        data.description,
        data.amount,
        data.frequency,
        data.startDate,
        data.endDate,
        data.distribution,
        JSON.stringify(data.affectedUnitIds || []),
        data.billPhotoUrl,
        data.status || 'active',
        true, // is_active
        data.createdBy,
        data.updatedBy,
      ];

      const result = await this.db.query(query, values);
      return this.mapRowToExpense(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create expense: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<ExpenseInput>): Promise<Expense | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.type !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.TYPE} = $${paramIndex++}`);
        values.push(data.type);
      }
      if (data.description !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.DESCRIPTION} = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.amount !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.AMOUNT} = $${paramIndex++}`);
        values.push(data.amount);
      }
      if (data.frequency !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.FREQUENCY} = $${paramIndex++}`);
        values.push(data.frequency);
      }
      if (data.startDate !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.START_DATE} = $${paramIndex++}`);
        values.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.END_DATE} = $${paramIndex++}`);
        values.push(data.endDate);
      }
      if (data.distribution !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.DISTRIBUTION} = $${paramIndex++}`);
        values.push(data.distribution);
      }
      if (data.affectedUnitIds !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.AFFECTED_UNIT_IDS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.affectedUnitIds));
      }
      if (data.billPhotoUrl !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.BILL_PHOTO_URL} = $${paramIndex++}`);
        values.push(data.billPhotoUrl);
      }
      if (data.status !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.updatedBy !== undefined) {
        updateFields.push(`${COLUMNS.EXPENSES.UPDATED_BY} = $${paramIndex++}`);
        values.push(data.updatedBy);
      }

      if (updateFields.length === 0) return null;

      updateFields.push(`${COLUMNS.EXPENSES.UPDATED_AT} = NOW()`);

      const query = `
        UPDATE ${TABLES.EXPENSES}
        SET ${updateFields.join(', ')}
        WHERE ${COLUMNS.EXPENSES.ID} = $${paramIndex}
        RETURNING *
      `;
      values.push(id);

      const result = await this.db.query(query, values);
      return result.rows.length > 0 ? this.mapRowToExpense(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update expense: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM ${TABLES.EXPENSES}
        WHERE ${COLUMNS.EXPENSES.ID} = $1
      `;
      const result = await this.db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete expense: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const query = `
        UPDATE ${TABLES.EXPENSES}
        SET ${COLUMNS.EXPENSES.STATUS} = $1, ${COLUMNS.EXPENSES.UPDATED_AT} = NOW()
        WHERE ${COLUMNS.EXPENSES.ID} = $2
        RETURNING *
      `;
      const result = await this.db.query(query, [status, id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update expense status: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  private mapRowToExpense(row: any): Expense {
    return {
      id: row.id,
      propertyId: row.property_id,
      unitId: row.unit_id,
      type: row.type,
      description: row.description,
      amount: parseFloat(row.amount) || 0,
      frequency: row.frequency,
      startDate: new Date(row.start_date),
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      distribution: row.distribution,
      affectedUnitIds: row.affected_unit_ids || [],
      billPhotoUrl: row.bill_photo_url,
      status: row.status,
      isActive: row.is_active,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}