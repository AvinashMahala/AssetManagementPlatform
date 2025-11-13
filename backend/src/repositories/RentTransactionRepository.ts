import { Pool } from 'pg';
import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { RentTransaction, RentTransactionInput, RentTransactionStatus, BillingMethod, ExpenseAction } from '../models/RentTransaction';
import { TABLES, COLUMNS } from '../constants/database';
import crypto from 'crypto';

export class RentTransactionRepository implements IRentTransactionRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.RENT_TRANSACTIONS} ORDER BY ${COLUMNS.RENT_TRANSACTIONS.CREATED_AT} DESC`);
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find all rent transactions: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<RentTransaction | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $1`,
        [id]
      );
      return result.rows.length > 0 ? this.mapRowToRentTransaction(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find rent transaction by ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByLease(leaseId: string): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.LEASE_ID} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [leaseId]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by lease: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByProperty(propertyId: string): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByTenant(tenantId: string): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.TENANT_ID} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [tenantId]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by tenant: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByUnit(unitId: string): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.UNIT_ID} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByBillingPeriod(billingPeriodStart: Date, billingPeriodEnd: Date): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} >= $1 AND ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END} <= $2 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [billingPeriodStart, billingPeriodEnd]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by billing period: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByPropertyAndPeriod(propertyId: string, month: number, year: number): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $1 AND EXTRACT(MONTH FROM ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START}) = $2 AND EXTRACT(YEAR FROM ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START}) = $3 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [propertyId, month, year]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by property and period: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findPendingTransactions(): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} ASC`,
        [RentTransactionStatus.DRAFT]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find pending rent transactions: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findOverdueTransactions(): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END} < CURRENT_DATE ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} ASC`,
        [RentTransactionStatus.DRAFT]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find overdue rent transactions: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findTransactionsByDateRange(startDate: Date, endDate: Date): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} BETWEEN $1 AND $2 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} ASC`,
        [startDate, endDate]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by date range: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findTransactionsByStatus(status: string): Promise<RentTransaction[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1 ORDER BY ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} DESC`,
        [status]
      );
      return result.rows.map(row => this.mapRowToRentTransaction(row));
    } catch (error) {
      throw new Error(`Failed to find rent transactions by status: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<RentTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentTransaction> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.RENT_TRANSACTIONS} (
          ${COLUMNS.RENT_TRANSACTIONS.ID},
          ${COLUMNS.RENT_TRANSACTIONS.LEASE_ID},
          ${COLUMNS.RENT_TRANSACTIONS.UNIT_ID},
          ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID},
          ${COLUMNS.RENT_TRANSACTIONS.TENANT_ID},
          ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START},
          ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END},
          ${COLUMNS.RENT_TRANSACTIONS.BILLING_METHOD},
          ${COLUMNS.RENT_TRANSACTIONS.DAYS_COUNT},
          ${COLUMNS.RENT_TRANSACTIONS.BASE_RENT},
          ${COLUMNS.RENT_TRANSACTIONS.PREVIOUS_BALANCE},
          ${COLUMNS.RENT_TRANSACTIONS.EXPENSES},
          ${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT},
          ${COLUMNS.RENT_TRANSACTIONS.AMOUNT_PAID},
          ${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE},
          ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE},
          ${COLUMNS.RENT_TRANSACTIONS.STATUS},
          ${COLUMNS.RENT_TRANSACTIONS.PAYMENT_METHOD},
          ${COLUMNS.RENT_TRANSACTIONS.TRANSACTION_ID},
          ${COLUMNS.RENT_TRANSACTIONS.PAYMENT_REFERENCE},
          ${COLUMNS.RENT_TRANSACTIONS.LATE_FEE},
          ${COLUMNS.RENT_TRANSACTIONS.PENALTY_AMOUNT},
          ${COLUMNS.RENT_TRANSACTIONS.RECEIPT_NUMBER},
          ${COLUMNS.RENT_TRANSACTIONS.RECEIPT_GENERATED},
          ${COLUMNS.RENT_TRANSACTIONS.NOTES},
          ${COLUMNS.RENT_TRANSACTIONS.CREATED_BY},
          ${COLUMNS.RENT_TRANSACTIONS.UPDATED_BY},
          ${COLUMNS.RENT_TRANSACTIONS.CREATED_AT},
          ${COLUMNS.RENT_TRANSACTIONS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) RETURNING *`,
        [
          crypto.randomUUID(),
          data.leaseId,
          data.unitId,
          data.propertyId,
          data.tenantId,
          data.billingPeriodStart,
          data.billingPeriodEnd,
          data.billingMethod || BillingMethod.RELATIVE,
          data.daysCount,
          data.baseRent,
          data.previousBalance,
          JSON.stringify(data.expenses || []),
          data.totalAmount,
          data.amountPaid,
          data.newBalance,
          data.paidDate,
          data.status || RentTransactionStatus.DRAFT,
          null, // paymentMethod
          null, // transactionId
          null, // paymentReference
          null, // lateFee
          null, // penaltyAmount
          data.receiptNumber,
          data.receiptGenerated,
          data.notes,
          data.createdBy,
          data.updatedBy,
          now,
          now
        ]
      );
      return this.mapRowToRentTransaction(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create rent transaction: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<Omit<RentTransaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentTransaction | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.billingPeriodStart !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_START} = $${paramIndex++}`);
        values.push(data.billingPeriodStart);
      }
      if (data.billingPeriodEnd !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END} = $${paramIndex++}`);
        values.push(data.billingPeriodEnd);
      }
      if (data.billingMethod !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.BILLING_METHOD} = $${paramIndex++}`);
        values.push(data.billingMethod);
      }
      if (data.daysCount !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.DAYS_COUNT} = $${paramIndex++}`);
        values.push(data.daysCount);
      }
      if (data.baseRent !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.BASE_RENT} = $${paramIndex++}`);
        values.push(data.baseRent);
      }
      if (data.previousBalance !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.PREVIOUS_BALANCE} = $${paramIndex++}`);
        values.push(data.previousBalance);
      }
      if (data.expenses !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.EXPENSES} = $${paramIndex++}`);
        values.push(JSON.stringify(data.expenses));
      }
      if (data.totalAmount !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT} = $${paramIndex++}`);
        values.push(data.totalAmount);
      }
      if (data.amountPaid !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.AMOUNT_PAID} = $${paramIndex++}`);
        values.push(data.amountPaid);
      }
      if (data.newBalance !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE} = $${paramIndex++}`);
        values.push(data.newBalance);
      }
      if (data.paidDate !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} = $${paramIndex++}`);
        values.push(data.paidDate);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.receiptNumber !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.RECEIPT_NUMBER} = $${paramIndex++}`);
        values.push(data.receiptNumber);
      }
      if (data.receiptGenerated !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.RECEIPT_GENERATED} = $${paramIndex++}`);
        values.push(data.receiptGenerated);
      }
      if (data.notes !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.NOTES} = $${paramIndex++}`);
        values.push(data.notes);
      }
      if (data.updatedBy !== undefined) {
        fields.push(`${COLUMNS.RENT_TRANSACTIONS.UPDATED_BY} = $${paramIndex++}`);
        values.push(data.updatedBy);
      }

      if (fields.length === 0) {
        return null;
      }

      fields.push(`${COLUMNS.RENT_TRANSACTIONS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      values.push(id);

      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_TRANSACTIONS} SET ${fields.join(', ')} WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows.length > 0 ? this.mapRowToRentTransaction(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update rent transaction: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $1`,
        [id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw new Error(`Failed to delete rent transaction: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async markAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_TRANSACTIONS} SET
          ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1,
          ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} = $2,
          ${COLUMNS.RENT_TRANSACTIONS.PAYMENT_METHOD} = $3,
          ${COLUMNS.RENT_TRANSACTIONS.TRANSACTION_ID} = $4,
          ${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE} = 0,
          ${COLUMNS.RENT_TRANSACTIONS.UPDATED_AT} = $5
         WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $6`,
        [RentTransactionStatus.PAID, paidDate, paymentMethod, transactionId, new Date(), id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw new Error(`Failed to mark rent transaction as paid: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async markAsOverdue(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.RENT_TRANSACTIONS} SET
          ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1,
          ${COLUMNS.RENT_TRANSACTIONS.UPDATED_AT} = $2
         WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $3 AND ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END} < CURRENT_DATE`,
        [RentTransactionStatus.CANCELLED, new Date(), id]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw new Error(`Failed to mark rent transaction as overdue: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async calculateLateFees(id: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT
          CASE
            WHEN ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END} < CURRENT_DATE AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} != $1
            THEN EXTRACT(DAY FROM CURRENT_DATE - ${COLUMNS.RENT_TRANSACTIONS.BILLING_PERIOD_END}) * 50 -- Assuming $50 per day late fee
            ELSE 0
          END as late_fee
         FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.ID} = $2`,
        [RentTransactionStatus.PAID, id]
      );
      return result.rows.length > 0 ? parseFloat(result.rows[0].late_fee) || 0 : 0;
    } catch (error) {
      throw new Error(`Failed to calculate late fees: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT}), 0) as total FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $2`;
      const values: any[] = [propertyId, RentTransactionStatus.PAID];
      let paramIndex = 3;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} <= $${paramIndex++}`;
        values.push(endDate);
      }

      const result = await this.pool.query(query, values);
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw new Error(`Failed to get total revenue by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getTotalRevenueByLease(leaseId: string, startDate?: Date, endDate?: Date): Promise<number> {
    try {
      let query = `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT}), 0) as total FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.LEASE_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $2`;
      const values: any[] = [leaseId, RentTransactionStatus.PAID];
      let paramIndex = 3;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE} <= $${paramIndex++}`;
        values.push(endDate);
      }

      const result = await this.pool.query(query, values);
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw new Error(`Failed to get total revenue by lease: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getOutstandingTransactionsByProperty(propertyId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as total FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} IN ($2, $3)`,
        [propertyId, RentTransactionStatus.FINALIZED, RentTransactionStatus.CANCELLED]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw new Error(`Failed to get outstanding transactions by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getOutstandingTransactionsByTenant(tenantId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as total FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.TENANT_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} IN ($2, $3)`,
        [tenantId, RentTransactionStatus.FINALIZED, RentTransactionStatus.CANCELLED]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      throw new Error(`Failed to get outstanding transactions by tenant: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getMonthlyRevenueReport(propertyId?: string, year?: number, month?: number): Promise<any> {
    try {
      let query = `
        SELECT
          EXTRACT(YEAR FROM ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE}) as year,
          EXTRACT(MONTH FROM ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE}) as month,
          COUNT(*) as total_transactions,
          COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT}), 0) as total_amount,
          COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.LATE_FEE}), 0) as total_late_fees
        FROM ${TABLES.RENT_TRANSACTIONS}
        WHERE ${COLUMNS.RENT_TRANSACTIONS.STATUS} = $1
      `;
      const values: any[] = [RentTransactionStatus.PAID];
      let paramIndex = 2;

      if (propertyId) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $${paramIndex++}`;
        values.push(propertyId);
      }
      if (year) {
        query += ` AND EXTRACT(YEAR FROM ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE}) = $${paramIndex++}`;
        values.push(year);
      }
      if (month) {
        query += ` AND EXTRACT(MONTH FROM ${COLUMNS.RENT_TRANSACTIONS.PAID_DATE}) = $${paramIndex++}`;
        values.push(month);
      }

      query += ` GROUP BY year, month ORDER BY year DESC, month DESC`;

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get monthly revenue report: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getTransactionStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = `
        SELECT
          ${COLUMNS.RENT_TRANSACTIONS.STATUS},
          COUNT(*) as count,
          COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.TOTAL_AMOUNT}), 0) as total_amount,
          COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as total_balance
        FROM ${TABLES.RENT_TRANSACTIONS}
        WHERE 1=1
      `;
      const values: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.CREATED_AT} >= $${paramIndex++}`;
        values.push(startDate);
      }
      if (endDate) {
        query += ` AND ${COLUMNS.RENT_TRANSACTIONS.CREATED_AT} <= $${paramIndex++}`;
        values.push(endDate);
      }

      query += ` GROUP BY ${COLUMNS.RENT_TRANSACTIONS.STATUS}`;

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get transaction statistics: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getCurrentBalanceByLease(leaseId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as balance FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.LEASE_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} IN ($2, $3)`,
        [leaseId, RentTransactionStatus.FINALIZED, RentTransactionStatus.CANCELLED]
      );
      return parseFloat(result.rows[0].balance) || 0;
    } catch (error) {
      throw new Error(`Failed to get current balance by lease: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getCurrentBalanceByTenant(tenantId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as balance FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.TENANT_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} IN ($2, $3)`,
        [tenantId, RentTransactionStatus.FINALIZED, RentTransactionStatus.CANCELLED]
      );
      return parseFloat(result.rows[0].balance) || 0;
    } catch (error) {
      throw new Error(`Failed to get current balance by tenant: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getCurrentBalanceByProperty(propertyId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COALESCE(SUM(${COLUMNS.RENT_TRANSACTIONS.NEW_BALANCE}), 0) as balance FROM ${TABLES.RENT_TRANSACTIONS} WHERE ${COLUMNS.RENT_TRANSACTIONS.PROPERTY_ID} = $1 AND ${COLUMNS.RENT_TRANSACTIONS.STATUS} IN ($2, $3)`,
        [propertyId, RentTransactionStatus.FINALIZED, RentTransactionStatus.CANCELLED]
      );
      return parseFloat(result.rows[0].balance) || 0;
    } catch (error) {
      throw new Error(`Failed to get current balance by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  private mapRowToRentTransaction(row: any): RentTransaction {
    return {
      id: row.id,
      leaseId: row.lease_id,
      unitId: row.unit_id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      billingPeriodStart: row.billing_period_start,
      billingPeriodEnd: row.billing_period_end,
      billingMethod: row.billing_method,
      daysCount: parseInt(row.days_count) || 0,
      baseRent: parseFloat(row.base_rent) || 0,
      previousBalance: parseFloat(row.previous_balance) || 0,
      expenses: row.expenses || [],
      totalAmount: parseFloat(row.total_amount) || 0,
      amountPaid: parseFloat(row.amount_paid) || 0,
      newBalance: parseFloat(row.new_balance) || 0,
      paidDate: row.paid_date,
      status: row.status,
      receiptNumber: row.receipt_number,
      receiptGenerated: row.receipt_generated,
      workflowStatus: row.workflow_status,
      invoiceGenerated: row.invoice_generated,
      notificationSent: row.notification_sent,
      receiptSent: row.receipt_sent,
      invoiceSentDate: row.invoice_sent_date,
      receiptSentDate: row.receipt_sent_date,
      lastPaymentDate: row.last_payment_date,
      workflowCompletedDate: row.workflow_completed_date,
      paymentMethod: row.payment_method,
      paymentReference: row.payment_reference,
      transactionId: row.transaction_id,
      notes: row.notes,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}