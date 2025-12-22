/**
 * @deprecated This repository is deprecated. Use the new LeaseRepository in src/features/leases/data/repository/LeaseRepository.ts
 * This file is kept only because RentPaymentService, RentTransactionService, etc. still depend on it.
 * Once those features are migrated, this file should be deleted.
 */
import { Pool } from 'pg';
import { Lease, LeaseInput, LeaseStatus } from '@/models/Lease.js';
import { TABLES, COLUMNS } from '@/shared/constants/database.js';
import { ILeaseRepository } from '@/interfaces/repositories/ILeaseRepository.js';

export class LeaseRepository implements ILeaseRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Lease[]> {
    try {
      const result = await this.pool.query(`
        SELECT
          l.*,
          u.unit_number,
          u.property_id as unit_property_id
        FROM ${TABLES.LEASES} l
        LEFT JOIN ${TABLES.UNITS} u ON l.unit_id = u.id
      `);
      return result.rows.map(row => this.mapRowToLease(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch leases: ${error.message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<Lease | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.LEASES} WHERE ${COLUMNS.LEASES.ID} = $1`,
        [id]
      );
      console.log('[LeaseRepository.findById] Row data:', result.rows[0]);
      return result.rows[0] ? this.mapRowToLease(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch lease: ${error.message || 'Database query failed'}`);
    }
  }

  async findByProperty(propertyId: string): Promise<Lease[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.LEASES} WHERE ${COLUMNS.LEASES.PROPERTY_ID} = $1`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToLease(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch leases by property: ${error.message || 'Database query failed'}`);
    }
  }

  async findByTenant(tenantId: string): Promise<Lease[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.LEASES} WHERE ${COLUMNS.LEASES.TENANT_ID} = $1`,
        [tenantId]
      );
      return result.rows.map(row => this.mapRowToLease(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch leases by tenant: ${error.message || 'Database query failed'}`);
    }
  }

  async findActiveLeases(): Promise<Lease[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.LEASES} WHERE ${COLUMNS.LEASES.STATUS} = $1`,
        [LeaseStatus.ACTIVE]
      );
      return result.rows.map(row => this.mapRowToLease(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch active leases: ${error.message || 'Database query failed'}`);
    }
  }

  async findExpiringLeases(days: number): Promise<Lease[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.LEASES}
         WHERE ${COLUMNS.LEASES.END_DATE} <= $1
         AND ${COLUMNS.LEASES.STATUS} = $2`,
        [new Date(Date.now() + days * 24 * 60 * 60 * 1000), LeaseStatus.ACTIVE]
      );
      return result.rows.map(row => this.mapRowToLease(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch expiring leases: ${error.message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.LEASES} (
          ${COLUMNS.LEASES.ID},
          ${COLUMNS.LEASES.PROPERTY_ID},
          ${COLUMNS.LEASES.UNIT_ID},
          ${COLUMNS.LEASES.TENANT_ID},
          ${COLUMNS.LEASES.START_DATE},
          ${COLUMNS.LEASES.END_DATE},
          ${COLUMNS.LEASES.MONTHLY_RENT},
          ${COLUMNS.LEASES.SECURITY_DEPOSIT},
          ${COLUMNS.LEASES.LATE_FEE_AMOUNT},
          ${COLUMNS.LEASES.GRACE_PERIOD_DAYS},
          ${COLUMNS.LEASES.PAYMENT_DUE_DAY},
          ${COLUMNS.LEASES.TERMS_CONDITIONS},
          ${COLUMNS.LEASES.SPECIAL_CLAUSES},
          ${COLUMNS.LEASES.STATUS},
          ${COLUMNS.LEASES.NOTICE_PERIOD_DAYS},
          ${COLUMNS.LEASES.AUTO_RENEWAL},
          ${COLUMNS.LEASES.MAINTENANCE_CHARGES},
          ${COLUMNS.LEASES.PAYMENT_FREQUENCY},
          ${COLUMNS.LEASES.RENT_DUE_DAY},
          ${COLUMNS.LEASES.ELECTRICITY_CHARGES},
          ${COLUMNS.LEASES.WATER_CHARGES},
          ${COLUMNS.LEASES.OTHER_CHARGES},
          ${COLUMNS.LEASES.PETS_ALLOWED},
          ${COLUMNS.LEASES.SMOKING_ALLOWED},
          ${COLUMNS.LEASES.SUBLETTING_ALLOWED},
          ${COLUMNS.LEASES.SPECIAL_CONDITIONS},
          ${COLUMNS.LEASES.SIGNED_AT},
          ${COLUMNS.LEASES.LEASE_DOCUMENT_URL},
          ${COLUMNS.LEASES.CREATED_AT},
          ${COLUMNS.LEASES.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING *`,
        [
          crypto.randomUUID(),
          data.propertyId,
          data.unitId,
          data.tenantId,
          data.startDate,
          data.endDate,
          data.monthlyRent,
          data.securityDeposit,
          data.lateFeeAmount,
          data.gracePeriodDays,
          data.paymentDueDay,
          data.termsConditions,
          data.specialClauses,
          data.status || LeaseStatus.DRAFT,
          data.noticePeriodDays,
          data.autoRenewal,
          data.maintenanceCharges,
          data.paymentFrequency,
          data.rentDueDay,
          data.electricityCharges,
          data.waterCharges,
          data.otherCharges,
          data.petsAllowed,
          data.smokingAllowed,
          data.sublettingAllowed,
          data.specialConditions,
          data.signedAt,
          data.leaseDocumentUrl,
          now,
          now
        ]
      );
      return this.mapRowToLease(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lease | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.propertyId !== undefined) {
        fields.push(`${COLUMNS.LEASES.PROPERTY_ID} = $${paramIndex++}`);
        values.push(data.propertyId);
      }
      if (data.unitId !== undefined) {
        fields.push(`${COLUMNS.LEASES.UNIT_ID} = $${paramIndex++}`);
        values.push(data.unitId);
      }
      if (data.startDate !== undefined) {
        fields.push(`${COLUMNS.LEASES.START_DATE} = $${paramIndex++}`);
        values.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        fields.push(`${COLUMNS.LEASES.END_DATE} = $${paramIndex++}`);
        values.push(data.endDate);
      }
      if (data.monthlyRent !== undefined) {
        fields.push(`${COLUMNS.LEASES.MONTHLY_RENT} = $${paramIndex++}`);
        values.push(data.monthlyRent);
      }
      if (data.securityDeposit !== undefined) {
        fields.push(`${COLUMNS.LEASES.SECURITY_DEPOSIT} = $${paramIndex++}`);
        values.push(data.securityDeposit);
      }
      if (data.lateFeeAmount !== undefined) {
        fields.push(`${COLUMNS.LEASES.LATE_FEE_AMOUNT} = $${paramIndex++}`);
        values.push(data.lateFeeAmount);
      }
      if (data.gracePeriodDays !== undefined) {
        fields.push(`${COLUMNS.LEASES.GRACE_PERIOD_DAYS} = $${paramIndex++}`);
        values.push(data.gracePeriodDays);
      }
      if (data.paymentDueDay !== undefined) {
        fields.push(`${COLUMNS.LEASES.PAYMENT_DUE_DAY} = $${paramIndex++}`);
        values.push(data.paymentDueDay);
      }
      if (data.termsConditions !== undefined) {
        fields.push(`${COLUMNS.LEASES.TERMS_CONDITIONS} = $${paramIndex++}`);
        values.push(data.termsConditions);
      }
      if (data.specialClauses !== undefined) {
        fields.push(`${COLUMNS.LEASES.SPECIAL_CLAUSES} = $${paramIndex++}`);
        values.push(data.specialClauses);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.LEASES.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.noticePeriodDays !== undefined) {
        fields.push(`${COLUMNS.LEASES.NOTICE_PERIOD_DAYS} = $${paramIndex++}`);
        values.push(data.noticePeriodDays);
      }
      if (data.autoRenewal !== undefined) {
        fields.push(`${COLUMNS.LEASES.AUTO_RENEWAL} = $${paramIndex++}`);
        values.push(data.autoRenewal);
      }
      if (data.maintenanceCharges !== undefined) {
        fields.push(`${COLUMNS.LEASES.MAINTENANCE_CHARGES} = $${paramIndex++}`);
        values.push(data.maintenanceCharges);
      }
      if (data.paymentFrequency !== undefined) {
        fields.push(`${COLUMNS.LEASES.PAYMENT_FREQUENCY} = $${paramIndex++}`);
        values.push(data.paymentFrequency);
      }
      if (data.rentDueDay !== undefined) {
        fields.push(`${COLUMNS.LEASES.RENT_DUE_DAY} = $${paramIndex++}`);
        values.push(data.rentDueDay);
      }
      if (data.electricityCharges !== undefined) {
        fields.push(`${COLUMNS.LEASES.ELECTRICITY_CHARGES} = $${paramIndex++}`);
        values.push(data.electricityCharges);
      }
      if (data.waterCharges !== undefined) {
        fields.push(`${COLUMNS.LEASES.WATER_CHARGES} = $${paramIndex++}`);
        values.push(data.waterCharges);
      }
      if (data.otherCharges !== undefined) {
        fields.push(`${COLUMNS.LEASES.OTHER_CHARGES} = $${paramIndex++}`);
        values.push(data.otherCharges);
      }
      if (data.petsAllowed !== undefined) {
        fields.push(`${COLUMNS.LEASES.PETS_ALLOWED} = $${paramIndex++}`);
        values.push(data.petsAllowed);
      }
      if (data.smokingAllowed !== undefined) {
        fields.push(`${COLUMNS.LEASES.SMOKING_ALLOWED} = $${paramIndex++}`);
        values.push(data.smokingAllowed);
      }
      if (data.sublettingAllowed !== undefined) {
        fields.push(`${COLUMNS.LEASES.SUBLETTING_ALLOWED} = $${paramIndex++}`);
        values.push(data.sublettingAllowed);
      }
      if (data.specialConditions !== undefined) {
        fields.push(`${COLUMNS.LEASES.SPECIAL_CONDITIONS} = $${paramIndex++}`);
        values.push(data.specialConditions);
      }
      if (data.signedAt !== undefined) {
        fields.push(`${COLUMNS.LEASES.SIGNED_AT} = $${paramIndex++}`);
        values.push(data.signedAt);
      }
      if (data.leaseDocumentUrl !== undefined) {
        fields.push(`${COLUMNS.LEASES.LEASE_DOCUMENT_URL} = $${paramIndex++}`);
        values.push(data.leaseDocumentUrl);
      }

      if (fields.length === 0) {
        return null;
      }

      fields.push(`${COLUMNS.LEASES.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      values.push(id);

      const result = await this.pool.query(
        `UPDATE ${TABLES.LEASES} SET ${fields.join(', ')} WHERE ${COLUMNS.LEASES.ID} = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows.length > 0 ? this.mapRowToLease(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.LEASES} WHERE ${COLUMNS.LEASES.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete lease: ${error.message || 'Database delete failed'}`);
    }
  }

  async terminateLease(id: string, terminationReason: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.LEASES} SET
         ${COLUMNS.LEASES.STATUS} = $1,
         ${COLUMNS.LEASES.TERMINATION_REASON} = $2,
         ${COLUMNS.LEASES.TERMINATED_AT} = $3,
         ${COLUMNS.LEASES.UPDATED_AT} = $4
         WHERE ${COLUMNS.LEASES.ID} = $5`,
        [LeaseStatus.TERMINATED, terminationReason, new Date(), new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to terminate lease: ${error.message || 'Database update failed'}`);
    }
  }

  async renewLease(id: string, newEndDate: Date): Promise<Lease | null> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.LEASES} SET
         ${COLUMNS.LEASES.END_DATE} = $1,
         ${COLUMNS.LEASES.UPDATED_AT} = $2
         WHERE ${COLUMNS.LEASES.ID} = $3
         AND ${COLUMNS.LEASES.STATUS} = $4
         RETURNING *`,
        [newEndDate, new Date(), id, LeaseStatus.ACTIVE]
      );
      return result.rows[0] ? this.mapRowToLease(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to renew lease: ${error.message || 'Database update failed'}`);
    }
  }

  private mapRowToLease(row: any): Lease {
    return {
      id: row.id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      unitId: row.unit_id,
      unitNumber: row.unit_number,
      startDate: row.start_date,
      endDate: row.end_date,
      monthlyRent: parseFloat(row.monthly_rent) || 0,
      securityDeposit: parseFloat(row.security_deposit) || 0,
      lateFeeAmount: row.late_fee_amount ? parseFloat(row.late_fee_amount) : undefined,
      gracePeriodDays: row.grace_period_days,
      paymentDueDay: row.payment_due_day,
      termsConditions: row.terms_conditions,
      specialClauses: row.special_clauses,
      status: row.status,
      noticePeriodDays: row.notice_period_days,
      autoRenewal: row.auto_renewal,
      maintenanceCharges: row.maintenance_charges ? parseFloat(row.maintenance_charges) : undefined,
      paymentFrequency: row.payment_frequency,
      rentDueDay: row.rent_due_day,
      electricityCharges: row.electricity_charges ? parseFloat(row.electricity_charges) : undefined,
      waterCharges: row.water_charges ? parseFloat(row.water_charges) : undefined,
      otherCharges: row.other_charges ? parseFloat(row.other_charges) : undefined,
      petsAllowed: row.pets_allowed,
      smokingAllowed: row.smoking_allowed,
      sublettingAllowed: row.subletting_allowed,
      specialConditions: row.special_conditions,
      signedAt: row.signed_at,
      leaseDocumentUrl: row.lease_document_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}