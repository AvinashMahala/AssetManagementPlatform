import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { IExpenseRepository } from '../../core/interfaces/IExpenseRepository';
import { Expense, ExpenseFilters, ExpenseStatus } from '../../core/types/expense.types';
import { CreateExpenseParams, UpdateExpenseParams } from '../../core/types/expense.params';
import { TABLES } from '@/shared/constants/database';

export class ExpenseRepository extends BaseRepository<Expense, CreateExpenseParams, UpdateExpenseParams> implements IExpenseRepository {
  constructor(pool: Pool) {
    super(pool, TABLES.EXPENSES);
  }

  protected mapToDomain(row: any): Expense {
    return {
      id: row.id,
      propertyId: row.property_id,
      unitId: row.unit_id,
      type: row.type,
      description: row.description,
      amount: parseFloat(row.amount),
      frequency: row.frequency,
      startDate: row.start_date,
      endDate: row.end_date,
      distribution: row.distribution,
      affectedUnitIds: Array.isArray(row.affected_unit_ids) ? row.affected_unit_ids : [],
      billPhotoUrl: row.bill_photo_url,
      status: row.status,
      isActive: row.is_active,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Override add to handle snake_case conversion for input
  async create(data: CreateExpenseParams): Promise<Expense> {
    const dbData = {
      property_id: data.propertyId,
      unit_id: data.unitId,
      type: data.type,
      description: data.description,
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.startDate,
      end_date: data.endDate,
      distribution: data.distribution,
      affected_unit_ids: data.affectedUnitIds,
      bill_photo_url: data.billPhotoUrl,
      status: data.status,
      created_by: data.createdBy,
      is_active: data.status === ExpenseStatus.ACTIVE // Set is_active based on status
    };
    
    // Remove undefined fields
    Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);

    return super.add(dbData as any);
  }

  async update(id: string, data: UpdateExpenseParams): Promise<Expense | null> {
    const dbData: any = {
      type: data.type,
      description: data.description,
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.startDate,
      end_date: data.endDate,
      distribution: data.distribution,
      affected_unit_ids: data.affectedUnitIds,
      bill_photo_url: data.billPhotoUrl,
      status: data.status,
      updated_by: data.updatedBy,
      updated_at: new Date()
    };

    if (data.status) {
      dbData.is_active = data.status === ExpenseStatus.ACTIVE;
    }

    // Remove undefined fields
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    return super.updateById(id, dbData);
  }

  async findByProperty(propertyId: string): Promise<Expense[]> {
    return this.findAll({
      where: { property_id: propertyId },
      orderBy: { start_date: 'DESC' }
    });
  }

  async findByUnit(unitId: string): Promise<Expense[]> {
    return this.findAll({
      where: { unit_id: unitId },
      orderBy: { start_date: 'DESC' }
    });
  }

  async findActiveByProperty(propertyId: string): Promise<Expense[]> {
    return this.findAll({
      where: { property_id: propertyId, is_active: true },
      orderBy: { start_date: 'DESC' }
    });
  }

  async findActiveByUnit(unitId: string): Promise<Expense[]> {
    return this.findAll({
      where: { unit_id: unitId, is_active: true },
      orderBy: { start_date: 'DESC' }
    });
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE ${this.tableName} SET status = $1, is_active = $2, updated_at = NOW() WHERE id = $3`,
      [status, status === ExpenseStatus.ACTIVE, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async findWithFilters(filters: ExpenseFilters): Promise<Expense[]> {
    let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
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

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }

    if (filters.startDate) {
      query += ` AND start_date >= $${paramIndex++}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND end_date <= $${paramIndex++}`;
      values.push(filters.endDate);
    }

    query += ` ORDER BY start_date DESC`;

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapToDomain(row));
  }
}
