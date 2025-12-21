import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { Lease, LeaseStatus } from '../core/lease.types';

export class LeaseRepository extends BaseRepository<Lease> {
  constructor(pool: Pool) {
    super(pool, 'leases');
    
    // 1. Configure Relations for "Magic Joins"
    this.relations = {
      tenant: {
        table: 'tenants',
        localKey: 'tenant_id',
        foreignKey: 'id',
        columns: ['first_name', 'last_name', 'email']
      },
      property: {
        table: 'properties',
        localKey: 'property_id',
        foreignKey: 'id',
        columns: ['name', 'address']
      }
    };
  }

  // =================================================================
  // 🌟 STANDARD CRUD IS ALREADY HERE! (Inherited from BaseRepository)
  // =================================================================
  // create(), findById(), findAll(), update(), delete() are ready.

  // =================================================================
  // 🚀 CUSTOM OPERATIONS (The "Non-CRUD" Stuff)
  // =================================================================

  /**
   * Example 1: Complex Filtering & Date Logic
   * "Find leases expiring in the next X days"
   */
  async findExpiringSoon(days: number): Promise<Lease[]> {
    const query = `
      SELECT l.*, 
             t.first_name as "tenant.first_name", 
             t.last_name as "tenant.last_name",
             p.name as "property.name"
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.id
      JOIN properties p ON l.property_id = p.id
      WHERE l.status = $1 
      AND l.end_date BETWEEN NOW() AND NOW() + interval '${days} days'
    `;
    
    const result = await this.pool.query(query, [LeaseStatus.ACTIVE]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  /**
   * Example 2: Aggregation / Analytics
   * "Calculate total expected rent for a property"
   */
  async calculateTotalRent(propertyId: string): Promise<number> {
    const query = `
      SELECT SUM(monthly_rent) as total
      FROM leases
      WHERE property_id = $1 AND status = $2
    `;
    
    const result = await this.pool.query(query, [propertyId, LeaseStatus.ACTIVE]);
    return parseFloat(result.rows[0]?.total || '0');
  }

  /**
   * Example 3: Bulk Status Update
   * "Expire all leases that passed their end date"
   */
  async expireOverdueLeases(): Promise<number> {
    const query = `
      UPDATE leases
      SET status = $1, updated_at = NOW()
      WHERE status = $2 AND end_date < NOW()
    `;
    
    const result = await this.pool.query(query, [LeaseStatus.EXPIRED, LeaseStatus.ACTIVE]);
    return result.rowCount || 0;
  }
}
