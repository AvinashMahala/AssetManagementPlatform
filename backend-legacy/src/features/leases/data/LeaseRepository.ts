import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { Lease, LeaseStatus, CreateLeaseDTO, UpdateLeaseDTO } from '../core/lease.types';
import crypto from 'crypto';

export class LeaseRepository extends BaseRepository<Lease> {
  constructor(pool: Pool) {
    super(pool, 'leases');
    this.relations = {
      unit: {
        table: 'units',
        localKey: 'unit_id',
        foreignKey: 'id',
        columns: ['unit_number']
      }
    };
  }

  protected override mapToDomain(row: any): Lease {
    const lease = super.mapToDomain(row);
    if ((lease as any).unit) {
      lease.unitNumber = (lease as any).unit.unitNumber;
      delete (lease as any).unit;
    }
    return lease;
  }

  async findAll(options: any = {}): Promise<Lease[]> {
    const opts = { ...options };
    if (!opts.relations) {
      opts.relations = ['unit'];
    }
    return super.findAll(opts);
  }

  async findById(id: string): Promise<Lease | null> {
    return super.findById(id, ['unit']);
  }

  async create(data: CreateLeaseDTO): Promise<Lease> {
    const now = new Date();
    const leaseData: any = {
      ...data,
      id: crypto.randomUUID(),
      status: data.status || LeaseStatus.DRAFT,
      createdAt: now,
      updatedAt: now
    };
    
    return super.add(leaseData);
  }

  async update(id: string, data: UpdateLeaseDTO): Promise<Lease | null> {
    return super.updateById(id, data);
  }

  async findActiveByTenantId(tenantId: string): Promise<Lease[]> {
    return this.findAll({ 
      where: { tenant_id: tenantId, status: LeaseStatus.ACTIVE },
      relations: ['unit']
    });
  }

  async findExpiringLeases(daysThreshold: number): Promise<Lease[]> {
    const sql = `
      SELECT l.*, u.unit_number as "unit.unit_number"
      FROM ${this.tableName} l
      LEFT JOIN units u ON l.unit_id = u.id
      WHERE l.status = $1 
      AND l.end_date <= NOW() + INTERVAL '${daysThreshold} days'
      AND l.end_date >= NOW()
    `;
    const result = await this.pool.query(sql, [LeaseStatus.ACTIVE]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findByPropertyId(propertyId: string): Promise<Lease[]> {
    return this.findAll({ 
      where: { property_id: propertyId },
      relations: ['unit']
    });
  }

  // Legacy Interface Implementation
  async findByProperty(propertyId: string): Promise<Lease[]> {
    return this.findByPropertyId(propertyId);
  }

  async findByTenant(tenantId: string): Promise<Lease[]> {
    return this.findAll({ 
      where: { tenant_id: tenantId },
      relations: ['unit']
    });
  }

  async findActiveLeases(): Promise<Lease[]> {
    return this.findAll({ 
      where: { status: LeaseStatus.ACTIVE },
      relations: ['unit']
    });
  }

  async terminateLease(id: string, terminationReason: string): Promise<boolean> {
    const result = await this.updateById(id, { 
      status: LeaseStatus.TERMINATED,
      terminationReason,
      terminatedAt: new Date()
    } as any);
    return !!result;
  }

  async renewLease(id: string, newEndDate: Date): Promise<Lease | null> {
    return this.updateById(id, { 
      endDate: newEndDate, 
      status: LeaseStatus.ACTIVE 
    } as any);
  }
  
  async delete(id: string): Promise<boolean> {
    return super.delete(id);
  }
}
