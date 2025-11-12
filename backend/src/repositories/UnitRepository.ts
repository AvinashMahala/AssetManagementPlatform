import { Pool } from 'pg';
import { Unit, UnitInput, UnitTenant, UnitTenantInput, UnitStatus } from '../models/Unit.js';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IUnitRepository } from '../interfaces/repositories/IUnitRepository.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('UnitRepository');

export class UnitRepository implements IUnitRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Unit[]> {
    try {
      logger.debug('Executing findAll query for units');
      const result = await this.pool.query(`SELECT * FROM ${TABLES.UNITS}`);
      const units = result.rows.map(row => this.mapRowToUnit(row));
      logger.info('Successfully fetched all units', { count: units.length });
      return units;
    } catch (error) {
      logger.error('Failed to fetch units', error);
      throw new Error('Failed to fetch units');
    }
  }

  async findById(id: string): Promise<Unit | null> {
    try {
      logger.debug('Executing findById query for unit', { unitId: id });
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNITS} WHERE ${COLUMNS.UNITS.ID} = $1`,
        [id]
      );
      const unit = result.rows[0] ? this.mapRowToUnit(result.rows[0]) : null;
      logger.info('Unit lookup result', { unitId: id, found: !!unit });
      return unit;
    } catch (error) {
      logger.error('Failed to fetch unit by ID', error, { unitId: id });
      throw new Error('Failed to fetch unit');
    }
  }

  async findByProperty(propertyId: string): Promise<Unit[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNITS} WHERE ${COLUMNS.UNITS.PROPERTY_ID} = $1`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToUnit(row));
    } catch (error) {
      throw new Error('Failed to fetch units by property');
    }
  }

  async findByStatus(status: string): Promise<Unit[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNITS} WHERE ${COLUMNS.UNITS.STATUS} = $1`,
        [status]
      );
      return result.rows.map(row => this.mapRowToUnit(row));
    } catch (error) {
      throw new Error('Failed to fetch units by status');
    }
  }

  async create(data: UnitInput): Promise<Unit> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.UNITS} (
          ${COLUMNS.UNITS.ID},
          ${COLUMNS.UNITS.PROPERTY_ID},
          ${COLUMNS.UNITS.UNIT_NUMBER},
          ${COLUMNS.UNITS.UNIT_NAME},
          ${COLUMNS.UNITS.DESCRIPTION},
          ${COLUMNS.UNITS.UNIT_TYPE},
          ${COLUMNS.UNITS.STATUS},
          ${COLUMNS.UNITS.FLOOR},
          ${COLUMNS.UNITS.AREA},
          ${COLUMNS.UNITS.BEDROOMS},
          ${COLUMNS.UNITS.BATHROOMS},
          ${COLUMNS.UNITS.BALCONIES},
          ${COLUMNS.UNITS.FURNISHED},
          ${COLUMNS.UNITS.MAX_OCCUPANTS},
          ${COLUMNS.UNITS.UNIT_AMENITIES},
          ${COLUMNS.UNITS.UNIT_PHOTOS},
          ${COLUMNS.UNITS.MONTHLY_RENT},
          ${COLUMNS.UNITS.SECURITY_DEPOSIT},
          ${COLUMNS.UNITS.MAINTENANCE_CHARGES},
          ${COLUMNS.UNITS.CREATED_AT},
          ${COLUMNS.UNITS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
        [
          crypto.randomUUID(),
          data.propertyId,
          data.unitNumber,
          data.unitName,
          data.description,
          data.unitType,
          data.status || UnitStatus.AVAILABLE,
          data.floor,
          data.area,
          data.bedrooms,
          data.bathrooms,
          data.balconies,
          data.furnished || false,
          data.maxOccupants,
          JSON.stringify(data.unitAmenities || []),
          JSON.stringify(data.unitPhotos || []),
          data.monthlyRent,
          data.securityDeposit,
          data.maintenanceCharges,
          now,
          now
        ]
      );
      return this.mapRowToUnit(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<UnitInput>): Promise<Unit | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.unitNumber !== undefined) {
        fields.push(`${COLUMNS.UNITS.UNIT_NUMBER} = $${paramIndex++}`);
        values.push(data.unitNumber);
      }
      if (data.unitName !== undefined) {
        fields.push(`${COLUMNS.UNITS.UNIT_NAME} = $${paramIndex++}`);
        values.push(data.unitName);
      }
      if (data.description !== undefined) {
        fields.push(`${COLUMNS.UNITS.DESCRIPTION} = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.unitType !== undefined) {
        fields.push(`${COLUMNS.UNITS.UNIT_TYPE} = $${paramIndex++}`);
        values.push(data.unitType);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.UNITS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.floor !== undefined) {
        fields.push(`${COLUMNS.UNITS.FLOOR} = $${paramIndex++}`);
        values.push(data.floor);
      }
      if (data.area !== undefined) {
        fields.push(`${COLUMNS.UNITS.AREA} = $${paramIndex++}`);
        values.push(data.area);
      }
      if (data.bedrooms !== undefined) {
        fields.push(`${COLUMNS.UNITS.BEDROOMS} = $${paramIndex++}`);
        values.push(data.bedrooms);
      }
      if (data.bathrooms !== undefined) {
        fields.push(`${COLUMNS.UNITS.BATHROOMS} = $${paramIndex++}`);
        values.push(data.bathrooms);
      }
      if (data.balconies !== undefined) {
        fields.push(`${COLUMNS.UNITS.BALCONIES} = $${paramIndex++}`);
        values.push(data.balconies);
      }
      if (data.furnished !== undefined) {
        fields.push(`${COLUMNS.UNITS.FURNISHED} = $${paramIndex++}`);
        values.push(data.furnished);
      }
      if (data.maxOccupants !== undefined) {
        fields.push(`${COLUMNS.UNITS.MAX_OCCUPANTS} = $${paramIndex++}`);
        values.push(data.maxOccupants);
      }
      if (data.unitAmenities !== undefined) {
        fields.push(`${COLUMNS.UNITS.UNIT_AMENITIES} = $${paramIndex++}`);
        values.push(JSON.stringify(data.unitAmenities));
      }
      if (data.unitPhotos !== undefined) {
        fields.push(`${COLUMNS.UNITS.UNIT_PHOTOS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.unitPhotos));
      }
      if (data.monthlyRent !== undefined) {
        fields.push(`${COLUMNS.UNITS.MONTHLY_RENT} = $${paramIndex++}`);
        values.push(data.monthlyRent);
      }
      if (data.securityDeposit !== undefined) {
        fields.push(`${COLUMNS.UNITS.SECURITY_DEPOSIT} = $${paramIndex++}`);
        values.push(data.securityDeposit);
      }
      if (data.maintenanceCharges !== undefined) {
        fields.push(`${COLUMNS.UNITS.MAINTENANCE_CHARGES} = $${paramIndex++}`);
        values.push(data.maintenanceCharges);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.UNITS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.UNITS} SET ${setClause} WHERE ${COLUMNS.UNITS.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToUnit(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNITS} WHERE ${COLUMNS.UNITS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete unit');
    }
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.UNITS} SET ${COLUMNS.UNITS.STATUS} = $1, ${COLUMNS.UNITS.UPDATED_AT} = $2 WHERE ${COLUMNS.UNITS.ID} = $3`,
        [status, new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to update unit status');
    }
  }

  async findUnitTenants(unitId: string): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToUnitTenant(row));
    } catch (error) {
      throw new Error('Failed to fetch unit tenants');
    }
  }

  async assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.UNIT_TENANTS} (
          ${COLUMNS.UNIT_TENANTS.ID},
          ${COLUMNS.UNIT_TENANTS.UNIT_ID},
          ${COLUMNS.UNIT_TENANTS.TENANT_ID},
          ${COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT},
          ${COLUMNS.UNIT_TENANTS.MOVE_IN_DATE},
          ${COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE},
          ${COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE},
          ${COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE},
          ${COLUMNS.UNIT_TENANTS.STATUS},
          ${COLUMNS.UNIT_TENANTS.CREATED_AT},
          ${COLUMNS.UNIT_TENANTS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          crypto.randomUUID(),
          data.unitId,
          data.tenantId,
          data.isPrimaryTenant || false,
          data.moveInDate,
          data.moveOutDate,
          data.monthlyRentShare,
          data.securityDepositShare,
          data.status || 'active',
          now,
          now
        ]
      );
      return this.mapRowToUnitTenant(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
        [unitId, tenantId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to remove tenant from unit');
    }
  }

  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.isPrimaryTenant !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT} = $${paramIndex++}`);
        values.push(updates.isPrimaryTenant);
      }
      if (updates.moveInDate !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_IN_DATE} = $${paramIndex++}`);
        values.push(updates.moveInDate);
      }
      if (updates.moveOutDate !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE} = $${paramIndex++}`);
        values.push(updates.moveOutDate);
      }
      if (updates.monthlyRentShare !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE} = $${paramIndex++}`);
        values.push(updates.monthlyRentShare);
      }
      if (updates.securityDepositShare !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE} = $${paramIndex++}`);
        values.push(updates.securityDepositShare);
      }
      if (updates.status !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.STATUS} = $${paramIndex++}`);
        values.push(updates.status);
      }

      if (fields.length === 0) {
        return await this.findTenantAssignment(unitId, tenantId);
      }

      fields.push(`${COLUMNS.UNIT_TENANTS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.UNIT_TENANTS} SET ${setClause} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $${paramIndex} AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $${paramIndex + 1} RETURNING *`;
      values.push(unitId, tenantId);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async findTenantAssignment(unitId: string, tenantId: string): Promise<UnitTenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
        [unitId, tenantId]
      );
      return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch tenant assignment');
    }
  }

  private mapRowToUnit(row: any): Unit {
    return {
      id: row.id,
      propertyId: row.property_id,
      unitNumber: row.unit_number,
      unitName: row.unit_name,
      description: row.description,
      unitType: row.unit_type,
      status: row.status,
      floor: row.floor,
      area: parseFloat(row.area),
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      balconies: row.balconies,
      furnished: row.furnished,
      maxOccupants: row.max_occupants,
      unitAmenities: Array.isArray(row.unit_amenities) ? row.unit_amenities : JSON.parse(row.unit_amenities || '[]'),
      unitPhotos: Array.isArray(row.unit_photos) ? row.unit_photos : JSON.parse(row.unit_photos || '[]'),
      monthlyRent: parseFloat(row.monthly_rent),
      securityDeposit: parseFloat(row.security_deposit),
      maintenanceCharges: row.maintenance_charges ? parseFloat(row.maintenance_charges) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToUnitTenant(row: any): UnitTenant {
    return {
      id: row.id,
      unitId: row.unit_id,
      tenantId: row.tenant_id,
      isPrimaryTenant: row.is_primary_tenant,
      moveInDate: row.move_in_date ? new Date(row.move_in_date) : undefined,
      moveOutDate: row.move_out_date ? new Date(row.move_out_date) : undefined,
      monthlyRentShare: parseFloat(row.monthly_rent_share),
      securityDepositShare: parseFloat(row.security_deposit_share),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}