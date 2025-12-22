
import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { IRentTransactionRepository } from '../core/IRentTransactionRepository';
import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams } from '../core/rent-transaction.types';
import { TABLES } from '@/shared/constants/database';

export class RentTransactionRepository extends BaseRepository<RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams> implements IRentTransactionRepository {
  constructor(pool: Pool) {
    super(pool, TABLES.RENT_TRANSACTIONS);
  }

  protected mapToDomain(row: any): RentTransaction {
    return {
      id: row.id,
      leaseId: row.lease_id,
      unitId: row.unit_id,
      tenantId: row.tenant_id,
      propertyId: row.property_id,
      billingPeriodStart: row.billing_period_start,
      billingPeriodEnd: row.billing_period_end,
      billingMethod: row.billing_method,
      daysCount: row.days_count,
      baseRent: parseFloat(row.base_rent),
      maintenanceCharges: parseFloat(row.maintenance_charges),
      previousBalance: parseFloat(row.previous_balance),
      totalMeterCharges: parseFloat(row.total_meter_charges),
      totalExpenses: parseFloat(row.total_expenses),
      expenses: row.expenses || [],
      totalAmount: parseFloat(row.total_amount),
      amountPaid: parseFloat(row.amount_paid),
      newBalance: parseFloat(row.new_balance),
      paidDate: row.paid_date,
      status: row.status,
      workflowStatus: row.workflow_status,
      invoiceUrl: row.invoice_url,
      receiptUrl: row.receipt_url,
      notes: row.notes,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async create(data: CreateRentTransactionParams): Promise<RentTransaction> {
    const dbData = {
      lease_id: data.leaseId,
      unit_id: data.unitId,
      tenant_id: data.tenantId,
      property_id: data.propertyId,
      billing_period_start: data.billingPeriodStart,
      billing_period_end: data.billingPeriodEnd,
      billing_method: data.billingMethod,
      days_count: data.daysCount,
      base_rent: data.baseRent,
      maintenance_charges: data.maintenanceCharges,
      previous_balance: data.previousBalance,
      total_meter_charges: data.totalMeterCharges,
      total_expenses: data.totalExpenses,
      expenses: JSON.stringify(data.expenses),
      total_amount: data.totalAmount,
      amount_paid: data.amountPaid,
      new_balance: data.newBalance,
      paid_date: data.paidDate,
      status: data.status,
      workflow_status: data.workflowStatus,
      invoice_url: data.invoiceUrl,
      receipt_url: data.receiptUrl,
      notes: data.notes,
      created_by: data.createdBy
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);

    return super.add(dbData as any);
  }

  async update(id: string, data: UpdateRentTransactionParams): Promise<RentTransaction | null> {
    const dbData: any = {
      billing_period_start: data.billingPeriodStart,
      billing_period_end: data.billingPeriodEnd,
      billing_method: data.billingMethod,
      days_count: data.daysCount,
      base_rent: data.baseRent,
      maintenance_charges: data.maintenanceCharges,
      previous_balance: data.previousBalance,
      total_meter_charges: data.totalMeterCharges,
      total_expenses: data.totalExpenses,
      expenses: data.expenses ? JSON.stringify(data.expenses) : undefined,
      total_amount: data.totalAmount,
      amount_paid: data.amountPaid,
      new_balance: data.newBalance,
      paid_date: data.paidDate,
      status: data.status,
      workflow_status: data.workflowStatus,
      invoice_url: data.invoiceUrl,
      receipt_url: data.receiptUrl,
      notes: data.notes,
      updated_by: data.updatedBy,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    return super.updateById(id, dbData);
  }

  async findByLease(leaseId: string): Promise<RentTransaction[]> {
    return this.findAll({
      where: { lease_id: leaseId },
      orderBy: { billing_period_start: 'DESC' }
    });
  }

  async findByProperty(propertyId: string): Promise<RentTransaction[]> {
    return this.findAll({
      where: { property_id: propertyId },
      orderBy: { billing_period_start: 'DESC' }
    });
  }

  async findByTenant(tenantId: string): Promise<RentTransaction[]> {
    return this.findAll({
      where: { tenant_id: tenantId },
      orderBy: { billing_period_start: 'DESC' }
    });
  }

  async findByUnit(unitId: string): Promise<RentTransaction[]> {
    return this.findAll({
      where: { unit_id: unitId },
      orderBy: { billing_period_start: 'DESC' }
    });
  }

  async findByBillingPeriod(start: Date, end: Date): Promise<RentTransaction[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE billing_period_start >= $1 AND billing_period_end <= $2
      ORDER BY billing_period_start DESC
    `;
    const result = await this.pool.query(query, [start, end]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findPendingTransactions(): Promise<RentTransaction[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE status IN ('PENDING', 'PARTIALLY_PAID')
      ORDER BY billing_period_start ASC
    `;
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findOverdueTransactions(): Promise<RentTransaction[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE status IN ('PENDING', 'PARTIALLY_PAID')
      AND billing_period_end < CURRENT_DATE
      ORDER BY billing_period_start ASC
    `;
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findTransactionsByDateRange(start: Date, end: Date): Promise<RentTransaction[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE created_at >= $1 AND created_at <= $2
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [start, end]);
    return result.rows.map(row => this.mapToDomain(row));
  }
}
