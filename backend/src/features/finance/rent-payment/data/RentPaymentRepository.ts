
import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { IRentPaymentRepository } from '../core/IRentPaymentRepository';
import { RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams, PaymentStatus } from '../core/rent-payment.types';
import { TABLES } from '@/shared/constants/database';

export class RentPaymentRepository extends BaseRepository<RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams> implements IRentPaymentRepository {
  constructor(pool: Pool) {
    super(pool, TABLES.RENT_PAYMENTS);
  }

  protected mapToDomain(row: any): RentPayment {
    return {
      id: row.id,
      leaseId: row.lease_id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      unitId: row.unit_id, // Might be joined or null
      unitNumber: row.unit_number, // Might be joined or null
      amount: parseFloat(row.amount),
      dueDate: row.due_date,
      paidDate: row.paid_date,
      status: row.status,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      paymentReference: row.payment_reference,
      lateFee: row.late_fee ? parseFloat(row.late_fee) : undefined,
      penaltyAmount: row.penalty_amount ? parseFloat(row.penalty_amount) : undefined,
      rentAmount: row.rent_amount ? parseFloat(row.rent_amount) : undefined,
      maintenanceCharges: row.maintenance_charges ? parseFloat(row.maintenance_charges) : undefined,
      notes: row.notes,
      receiptUrl: row.receipt_url,
      isRecurring: row.is_recurring,
      recurringInterval: row.recurring_interval,
      nextPaymentDate: row.next_payment_date,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async create(data: CreateRentPaymentParams): Promise<RentPayment> {
    const dbData = {
      lease_id: data.leaseId,
      property_id: data.propertyId,
      tenant_id: data.tenantId,
      amount: data.amount,
      due_date: data.dueDate,
      paid_date: data.paidDate,
      status: data.status,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      payment_reference: data.paymentReference,
      late_fee: data.lateFee,
      penalty_amount: data.penaltyAmount,
      rent_amount: data.rentAmount,
      maintenance_charges: data.maintenanceCharges,
      notes: data.notes,
      receipt_url: data.receiptUrl,
      is_recurring: data.isRecurring,
      recurring_interval: data.recurringInterval,
      next_payment_date: data.nextPaymentDate,
      created_by: data.createdBy
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);

    return super.add(dbData as any);
  }

  async update(id: string, data: UpdateRentPaymentParams): Promise<RentPayment | null> {
    const dbData: any = {
      amount: data.amount,
      due_date: data.dueDate,
      paid_date: data.paidDate,
      status: data.status,
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId,
      payment_reference: data.paymentReference,
      late_fee: data.lateFee,
      penalty_amount: data.penaltyAmount,
      rent_amount: data.rentAmount,
      maintenance_charges: data.maintenanceCharges,
      notes: data.notes,
      receipt_url: data.receiptUrl,
      is_recurring: data.isRecurring,
      recurring_interval: data.recurringInterval,
      next_payment_date: data.nextPaymentDate,
      updated_by: data.updatedBy,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    return super.updateById(id, dbData);
  }

  async findByLease(leaseId: string): Promise<RentPayment[]> {
    return this.findAll({
      where: { lease_id: leaseId },
      orderBy: { due_date: 'DESC' }
    });
  }

  async findByProperty(propertyId: string): Promise<RentPayment[]> {
    return this.findAll({
      where: { property_id: propertyId },
      orderBy: { due_date: 'DESC' }
    });
  }

  async findByTenant(tenantId: string): Promise<RentPayment[]> {
    return this.findAll({
      where: { tenant_id: tenantId },
      orderBy: { due_date: 'DESC' }
    });
  }

  async findPendingPayments(): Promise<RentPayment[]> {
    return this.findAll({
      where: { status: PaymentStatus.PENDING },
      orderBy: { due_date: 'ASC' }
    });
  }

  async findOverduePayments(): Promise<RentPayment[]> {
    return this.findAll({
      where: { status: PaymentStatus.OVERDUE },
      orderBy: { due_date: 'ASC' }
    });
  }

  async findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]> {
    // BaseRepository doesn't support range queries directly in findAll 'where' yet without custom SQL or advanced filter support.
    // I'll use a raw query here for safety and correctness.
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE due_date >= $1 AND due_date <= $2
      ORDER BY due_date DESC
    `;
    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  // Legacy methods
  async findPartialPayments(): Promise<RentPayment[]> {
    return this.findAll({
      where: { status: PaymentStatus.PARTIAL },
      orderBy: { due_date: 'ASC' }
    });
  }

  async findPaymentsByStatus(status: string): Promise<RentPayment[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = $1`;
    const result = await this.pool.query(query, [status]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async markAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName}
      SET status = 'PAID', paid_date = $2, payment_method = $3, transaction_id = $4, updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [id, paidDate, paymentMethod, transactionId]);
    return (result.rowCount ?? 0) > 0;
  }

  async markAsOverdue(id: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName}
      SET status = 'OVERDUE', updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async calculateLateFees(id: string): Promise<number> {
    // Placeholder
    return 0;
  }

  // Financial summaries
  async getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    let query = `SELECT SUM(amount) as total FROM ${this.tableName} WHERE property_id = $1 AND status = 'PAID'`;
    const params: any[] = [propertyId];
    
    if (startDate) {
      query += ` AND paid_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND paid_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const result = await this.pool.query(query, params);
    return parseFloat(result.rows[0]?.total || '0');
  }

  async getTotalRevenueByLease(leaseId: string, startDate?: Date, endDate?: Date): Promise<number> {
    let query = `SELECT SUM(amount) as total FROM ${this.tableName} WHERE lease_id = $1 AND status = 'PAID'`;
    const params: any[] = [leaseId];
    
    if (startDate) {
      query += ` AND paid_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND paid_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const result = await this.pool.query(query, params);
    return parseFloat(result.rows[0]?.total || '0');
  }

  async getOutstandingPaymentsByProperty(propertyId: string): Promise<number> {
    const query = `
      SELECT SUM(amount) as total 
      FROM ${this.tableName} 
      WHERE property_id = $1 AND status IN ('PENDING', 'OVERDUE', 'PARTIAL')
    `;
    const result = await this.pool.query(query, [propertyId]);
    return parseFloat(result.rows[0]?.total || '0');
  }

  async getOutstandingPaymentsByTenant(tenantId: string): Promise<number> {
    const query = `
      SELECT SUM(amount) as total 
      FROM ${this.tableName} 
      WHERE tenant_id = $1 AND status IN ('PENDING', 'OVERDUE', 'PARTIAL')
    `;
    const result = await this.pool.query(query, [tenantId]);
    return parseFloat(result.rows[0]?.total || '0');
  }

  async getMonthlyRevenueReport(propertyId?: string, year?: number, month?: number): Promise<any> {
    // Placeholder
    return {};
  }

  async getPaymentStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    // Placeholder
    return {};
  }
}
