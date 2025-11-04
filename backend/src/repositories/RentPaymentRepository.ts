import { Pool } from 'pg';
import { IRentPaymentRepository } from '../interfaces/repositories/IRentPaymentRepository';
import { RentPayment, RentPaymentInput, PaymentStatus, PaymentMethod } from '../models/RentPayment';
import { TABLES, COLUMNS } from '../constants/database';
import crypto from 'crypto';

export class RentPaymentRepository implements IRentPaymentRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.RENT_PAYMENTS} ORDER BY ${COLUMNS.RENT_PAYMENTS.CREATED_AT} DESC`);
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<RentPayment | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToRentPayment(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByLease(leaseId: string): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.LEASE_ID} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} DESC`,
        [leaseId]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findByProperty(propertyId: string): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.PROPERTY_ID} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} DESC`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findByTenant(tenantId: string): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.TENANT_ID} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} DESC`,
        [tenantId]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findPendingPayments(): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.STATUS} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} ASC`,
        [PaymentStatus.PENDING]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findOverduePayments(): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.STATUS} = $1 AND ${COLUMNS.RENT_PAYMENTS.DUE_DATE} < CURRENT_DATE ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} ASC`,
        [PaymentStatus.PENDING]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findPartialPayments(): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.STATUS} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} ASC`,
        [PaymentStatus.PARTIAL]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.DUE_DATE} BETWEEN $1 AND $2 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} ASC`,
        [startDate, endDate]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async findPaymentsByStatus(status: string): Promise<RentPayment[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.STATUS} = $1 ORDER BY ${COLUMNS.RENT_PAYMENTS.DUE_DATE} DESC`,
        [status]
      );
      return result.rows.map(row => this.mapRowToRentPayment(row));
    } catch (error) {
      throw error;
    }
  }

  async create(data: Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentPayment> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.RENT_PAYMENTS} (
          ${COLUMNS.RENT_PAYMENTS.ID},
          ${COLUMNS.RENT_PAYMENTS.LEASE_ID},
          ${COLUMNS.RENT_PAYMENTS.PROPERTY_ID},
          ${COLUMNS.RENT_PAYMENTS.TENANT_ID},
          ${COLUMNS.RENT_PAYMENTS.AMOUNT},
          ${COLUMNS.RENT_PAYMENTS.DUE_DATE},
          ${COLUMNS.RENT_PAYMENTS.PAID_DATE},
          ${COLUMNS.RENT_PAYMENTS.STATUS},
          ${COLUMNS.RENT_PAYMENTS.PAYMENT_METHOD},
          ${COLUMNS.RENT_PAYMENTS.TRANSACTION_ID},
          ${COLUMNS.RENT_PAYMENTS.PAYMENT_REFERENCE},
          ${COLUMNS.RENT_PAYMENTS.LATE_FEE},
          ${COLUMNS.RENT_PAYMENTS.PENALTY_AMOUNT},
          ${COLUMNS.RENT_PAYMENTS.RENT_AMOUNT},
          ${COLUMNS.RENT_PAYMENTS.MAINTENANCE_CHARGES},
          ${COLUMNS.RENT_PAYMENTS.OTHER_CHARGES},
          ${COLUMNS.RENT_PAYMENTS.NOTES},
          ${COLUMNS.RENT_PAYMENTS.CREATED_BY},
          ${COLUMNS.RENT_PAYMENTS.UPDATED_BY},
          ${COLUMNS.RENT_PAYMENTS.CREATED_AT},
          ${COLUMNS.RENT_PAYMENTS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
        [
          crypto.randomUUID(),
          data.leaseId,
          data.propertyId,
          data.tenantId,
          data.amount,
          data.dueDate,
          data.paidDate,
          data.status || PaymentStatus.PENDING,
          data.paymentMethod,
          data.transactionId,
          data.paymentReference,
          data.lateFee,
          data.penaltyAmount,
          data.rentAmount,
          data.maintenanceCharges,
          data.otherCharges,
          data.notes,
          data.createdBy,
          data.updatedBy,
          now,
          now
        ]
      );
      return this.mapRowToRentPayment(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentPayment | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.leaseId !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.LEASE_ID} = $${paramIndex++}`);
        values.push(data.leaseId);
      }
      if (data.propertyId !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.PROPERTY_ID} = $${paramIndex++}`);
        values.push(data.propertyId);
      }
      if (data.tenantId !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.TENANT_ID} = $${paramIndex++}`);
        values.push(data.tenantId);
      }
      if (data.amount !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.AMOUNT} = $${paramIndex++}`);
        values.push(data.amount);
      }
      if (data.dueDate !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.DUE_DATE} = $${paramIndex++}`);
        values.push(data.dueDate);
      }
      if (data.paidDate !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.PAID_DATE} = $${paramIndex++}`);
        values.push(data.paidDate);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.paymentMethod !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.PAYMENT_METHOD} = $${paramIndex++}`);
        values.push(data.paymentMethod);
      }
      if (data.transactionId !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.TRANSACTION_ID} = $${paramIndex++}`);
        values.push(data.transactionId);
      }
      if (data.paymentReference !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.PAYMENT_REFERENCE} = $${paramIndex++}`);
        values.push(data.paymentReference);
      }
      if (data.lateFee !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.LATE_FEE} = $${paramIndex++}`);
        values.push(data.lateFee);
      }
      if (data.penaltyAmount !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.PENALTY_AMOUNT} = $${paramIndex++}`);
        values.push(data.penaltyAmount);
      }
      if (data.rentAmount !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.RENT_AMOUNT} = $${paramIndex++}`);
        values.push(data.rentAmount);
      }
      if (data.maintenanceCharges !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.MAINTENANCE_CHARGES} = $${paramIndex++}`);
        values.push(data.maintenanceCharges);
      }
      if (data.otherCharges !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.OTHER_CHARGES} = $${paramIndex++}`);
        values.push(data.otherCharges);
      }
      if (data.notes !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.NOTES} = $${paramIndex++}`);
        values.push(data.notes);
      }
      if (data.updatedBy !== undefined) {
        fields.push(`${COLUMNS.RENT_PAYMENTS.UPDATED_BY} = $${paramIndex++}`);
        values.push(data.updatedBy);
      }

      if (fields.length === 0) {
        return null;
      }

      fields.push(`${COLUMNS.RENT_PAYMENTS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      values.push(id);

      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_PAYMENTS} SET ${fields.join(', ')} WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows.length > 0 ? this.mapRowToRentPayment(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $1`,
        [id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw error;
    }
  }

  async markAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_PAYMENTS} SET
          ${COLUMNS.RENT_PAYMENTS.STATUS} = $1,
          ${COLUMNS.RENT_PAYMENTS.PAID_DATE} = $2,
          ${COLUMNS.RENT_PAYMENTS.PAYMENT_METHOD} = $3,
          ${COLUMNS.RENT_PAYMENTS.TRANSACTION_ID} = $4,
          ${COLUMNS.RENT_PAYMENTS.UPDATED_AT} = $5
         WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $6`,
        [PaymentStatus.PAID, paidDate, paymentMethod, transactionId, new Date(), id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw error;
    }
  }

  async markAsOverdue(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_PAYMENTS} SET
          ${COLUMNS.RENT_PAYMENTS.STATUS} = $1,
          ${COLUMNS.RENT_PAYMENTS.UPDATED_AT} = $2
         WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $3 AND ${COLUMNS.RENT_PAYMENTS.DUE_DATE} < CURRENT_DATE`,
        [PaymentStatus.OVERDUE, new Date(), id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw error;
    }
  }

  async calculateLateFees(id: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT
          CASE
            WHEN ${COLUMNS.RENT_PAYMENTS.DUE_DATE} < CURRENT_DATE AND ${COLUMNS.RENT_PAYMENTS.STATUS} != $1
            THEN EXTRACT(DAY FROM CURRENT_DATE - ${COLUMNS.RENT_PAYMENTS.DUE_DATE}) * 50 -- Assuming $50 per day late fee
            ELSE 0
          END as late_fee
         FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.ID} = $2`,
        [PaymentStatus.PAID, id]
      );
      return result.rows.length > 0 ? parseFloat(result.rows[0].late_fee) || 0 : 0;
    } catch (error) {
      throw error;
    }
  }

  async getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `SELECT COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.PROPERTY_ID} = $1 AND ${COLUMNS.RENT_PAYMENTS.STATUS} = $2`;
      const values: any[] = [propertyId, PaymentStatus.PAID];
      let paramIndex = 3;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.PAID_DATE} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.PAID_DATE} <= $${paramIndex++}`;
        values.push(endDate);
      }

      const result = await this.pool.query(query, values);
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw error;
    }
  }

  async getTotalRevenueByLease(leaseId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `SELECT COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.LEASE_ID} = $1 AND ${COLUMNS.RENT_PAYMENTS.STATUS} = $2`;
      const values: any[] = [leaseId, PaymentStatus.PAID];
      let paramIndex = 3;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.PAID_DATE} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.PAID_DATE} <= $${paramIndex++}`;
        values.push(endDate);
      }

      const result = await this.pool.query(query, values);
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw error;
    }
  }

  async getOutstandingPaymentsByProperty(propertyId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.PROPERTY_ID} = $1 AND ${COLUMNS.RENT_PAYMENTS.STATUS} IN ($2, $3)`,
        [propertyId, PaymentStatus.PENDING, PaymentStatus.OVERDUE]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw error;
    }
  }

  async getOutstandingPaymentsByTenant(tenantId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total FROM ${TABLES.RENT_PAYMENTS} WHERE ${COLUMNS.RENT_PAYMENTS.TENANT_ID} = $1 AND ${COLUMNS.RENT_PAYMENTS.STATUS} IN ($2, $3)`,
        [tenantId, PaymentStatus.PENDING, PaymentStatus.OVERDUE]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw error;
    }
  }

  async getMonthlyRevenueReport(propertyId?: string, year?: number, month?: number): Promise<any> {
    try {
      let query = `
        SELECT
          EXTRACT(YEAR FROM ${COLUMNS.RENT_PAYMENTS.PAID_DATE}) as year,
          EXTRACT(MONTH FROM ${COLUMNS.RENT_PAYMENTS.PAID_DATE}) as month,
          COUNT(*) as total_payments,
          COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total_amount,
          COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.LATE_FEE}), 0) as total_late_fees
        FROM ${TABLES.RENT_PAYMENTS}
        WHERE ${COLUMNS.RENT_PAYMENTS.STATUS} = $1
      `;
      const values: any[] = [PaymentStatus.PAID];
      let paramIndex = 2;

      if (propertyId) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.PROPERTY_ID} = $${paramIndex++}`;
        values.push(propertyId);
      }
      if (year) {
        query += ` AND EXTRACT(YEAR FROM ${COLUMNS.RENT_PAYMENTS.PAID_DATE}) = $${paramIndex++}`;
        values.push(year);
      }
      if (month) {
        query += ` AND EXTRACT(MONTH FROM ${COLUMNS.RENT_PAYMENTS.PAID_DATE}) = $${paramIndex++}`;
        values.push(month);
      }

      query += ` GROUP BY year, month ORDER BY year DESC, month DESC`;

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = `
        SELECT
          ${COLUMNS.RENT_PAYMENTS.STATUS},
          COUNT(*) as count,
          COALESCE(SUM(${COLUMNS.RENT_PAYMENTS.AMOUNT}), 0) as total_amount
        FROM ${TABLES.RENT_PAYMENTS}
        WHERE 1=1
      `;
      const values: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.CREATED_AT} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_PAYMENTS.CREATED_AT} <= $${paramIndex++}`;
        values.push(endDate);
      }

      query += ` GROUP BY ${COLUMNS.RENT_PAYMENTS.STATUS}`;

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  private mapRowToRentPayment(row: any): RentPayment {
    return {
      id: row.id,
      leaseId: row.lease_id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      amount: parseFloat(row.amount) || 0,
      dueDate: row.due_date,
      paidDate: row.paid_date,
      status: row.status,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      paymentReference: row.payment_reference,
      lateFee: row.late_fee ? parseFloat(row.late_fee) : undefined,
      penaltyAmount: row.penalty_amount ? parseFloat(row.penalty_amount) : undefined,
      rentAmount: row.rent_amount ? parseFloat(row.rent_amount) : 0,
      maintenanceCharges: row.maintenance_charges ? parseFloat(row.maintenance_charges) : undefined,
      otherCharges: row.other_charges ? parseFloat(row.other_charges) : undefined,
      notes: row.notes,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}