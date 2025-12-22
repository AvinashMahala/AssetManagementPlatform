import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { Lease, LeaseStatus } from '../core/lease.types';

export class LeaseRepository extends BaseRepository<Lease> {
  constructor(pool: Pool) {
    super(pool, 'leases');
  }

  async create(data: Partial<Lease>): Promise<Lease> {
    return super.add(data);
  }

  async update(id: string, data: Partial<Lease>): Promise<Lease | null> {
    return super.updateById(id, data);
  }

  async findActiveByTenantId(tenantId: string): Promise<Lease[]> {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE tenant_id = $1 AND status = $2
    `;
    const result = await this.pool.query(sql, [tenantId, LeaseStatus.ACTIVE]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findExpiringLeases(daysThreshold: number): Promise<Lease[]> {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE status = $1 
      AND end_date <= NOW() + INTERVAL '${daysThreshold} days'
      AND end_date >= NOW()
    `;
    const result = await this.pool.query(sql, [LeaseStatus.ACTIVE]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findByPropertyId(propertyId: string): Promise<Lease[]> {
    return this.findAll({ 
      where: { property_id: propertyId } 
    });
  }

  // Legacy Interface Implementation
  async findByProperty(propertyId: string): Promise<Lease[]> {
    return this.findByPropertyId(propertyId);
  }

  async findByTenant(tenantId: string): Promise<Lease[]> {
    return this.findAll({ where: { tenant_id: tenantId } });
  }

  async findActiveLeases(): Promise<Lease[]> {
    return this.findAll({ 
      where: { 
        status: LeaseStatus.ACTIVE 
      } 
    });
  }

  async terminateLease(id: string, terminationReason: string): Promise<boolean> {
    const result = await this.updateById(id, { 
      status: LeaseStatus.TERMINATED
    });
    return !!result;
  }

  async renewLease(id: string, newEndDate: Date): Promise<Lease | null> {
    return this.updateById(id, { 
      endDate: newEndDate, 
      status: LeaseStatus.ACTIVE 
    });
  }
}
