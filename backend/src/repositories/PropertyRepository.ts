import { Pool } from 'pg';
import { Property, PropertyInput, PropertyStatus } from '../models/Property';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('PropertyRepository');

export class PropertyRepository implements IPropertyRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Property[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.PROPERTIES}`);
      return result.rows.map(row => this.mapRowToProperty(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch properties: ${error.message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<Property | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.PROPERTIES} WHERE ${COLUMNS.PROPERTIES.ID} = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToProperty(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch property: ${error.message || 'Database query failed'}`);
    }
  }

  async findByOwner(ownerId: string): Promise<Property[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.PROPERTIES} WHERE ${COLUMNS.PROPERTIES.OWNER_ID} = $1`,
        [ownerId]
      );
      return result.rows.map(row => this.mapRowToProperty(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch properties by owner: ${error.message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.PROPERTIES} (
          ${COLUMNS.PROPERTIES.ID},
          ${COLUMNS.PROPERTIES.NAME},
          ${COLUMNS.PROPERTIES.DESCRIPTION},
          ${COLUMNS.PROPERTIES.PROPERTY_TYPE},
          ${COLUMNS.PROPERTIES.STATUS},
          ${COLUMNS.PROPERTIES.CURRENCY},
          ${COLUMNS.PROPERTIES.ADDRESS_STREET},
          ${COLUMNS.PROPERTIES.ADDRESS_CITY},
          ${COLUMNS.PROPERTIES.ADDRESS_STATE},
          ${COLUMNS.PROPERTIES.ADDRESS_PINCODE},
          ${COLUMNS.PROPERTIES.ADDRESS_COUNTRY},
          ${COLUMNS.PROPERTIES.ADDRESS_LANDMARK},
          ${COLUMNS.PROPERTIES.AREA},
          ${COLUMNS.PROPERTIES.TOTAL_FLOORS},
          ${COLUMNS.PROPERTIES.YEAR_BUILT},
          ${COLUMNS.PROPERTIES.PARKING_SPACES},
          ${COLUMNS.PROPERTIES.AMENITIES},
          ${COLUMNS.PROPERTIES.OWNER_ID},
          ${COLUMNS.PROPERTIES.CO_OWNERS},
          ${COLUMNS.PROPERTIES.RECEIPT_SETTINGS},
          ${COLUMNS.PROPERTIES.TEMPLATE_ID},
          ${COLUMNS.PROPERTIES.TEMPLATE_OVERRIDES},
          owner_name,
          owner_mobile_numbers,
          owner_email_ids,
          owner_website,
          ${COLUMNS.PROPERTIES.CREATED_AT},
          ${COLUMNS.PROPERTIES.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) RETURNING *`,
        [
          crypto.randomUUID(),
          data.name,
          data.description,
          data.propertyType,
          data.status || 'available',
          data.currency || 'INR',
          data.address.street,
          data.address.city,
          data.address.state,
          data.address.pincode,
          data.address.country || 'India',
          data.address.landmark,
          data.totalArea,
          data.totalFloors,
          data.yearBuilt,
          data.parkingSpaces,
          JSON.stringify(data.amenities || {
            basic: data.buildingAmenities || [],
            luxury: [],
            additionalInfo: {
              petFriendly: false,
              smokingAllowed: false,
              eventsAllowed: false
            }
          }),
          data.ownerId,
          JSON.stringify(data.coOwners || []),
          JSON.stringify(data.receiptSettings || null),
          data.templateId || null,
          JSON.stringify(data.templateOverrides || null),
          data.ownerDetails?.name || null,
          JSON.stringify(data.ownerDetails?.mobileNumbers || []),
          JSON.stringify(data.ownerDetails?.emailIds || []),
          data.ownerDetails?.website || null,
          now,
          now
        ]
      );
      return this.mapRowToProperty(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<PropertyInput>): Promise<Property | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.NAME} = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.description !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.DESCRIPTION} = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.propertyType !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.PROPERTY_TYPE} = $${paramIndex++}`);
        values.push(data.propertyType);
      }
      if (data.currency !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.CURRENCY} = $${paramIndex++}`);
        values.push(data.currency);
      }
      if (data.address?.country !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_COUNTRY} = $${paramIndex++}`);
        values.push(data.address.country);
      }
      if (data.address?.street !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_STREET} = $${paramIndex++}`);
        values.push(data.address.street);
      }
      if (data.address?.city !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_CITY} = $${paramIndex++}`);
        values.push(data.address.city);
      }
      if (data.address?.state !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_STATE} = $${paramIndex++}`);
        values.push(data.address.state);
      }
      if (data.address?.pincode !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_PINCODE} = $${paramIndex++}`);
        values.push(data.address.pincode);
      }
      if (data.address?.landmark !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.ADDRESS_LANDMARK} = $${paramIndex++}`);
        values.push(data.address.landmark);
      }
      if (data.totalArea !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.AREA} = $${paramIndex++}`);
        values.push(data.totalArea);
      }
      if (data.totalFloors !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.TOTAL_FLOORS} = $${paramIndex++}`);
        values.push(data.totalFloors);
      }
      if (data.yearBuilt !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.YEAR_BUILT} = $${paramIndex++}`);
        values.push(data.yearBuilt);
      }
      if (data.parkingSpaces !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.PARKING_SPACES} = $${paramIndex++}`);
        values.push(data.parkingSpaces);
      }
      if (data.buildingAmenities !== undefined && data.amenities === undefined) {
        fields.push(`${COLUMNS.PROPERTIES.AMENITIES} = $${paramIndex++}`);
        values.push(JSON.stringify(data.buildingAmenities));
      }
      if (data.ownerId !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.OWNER_ID} = $${paramIndex++}`);
        values.push(data.ownerId);
      }
      if (data.coOwners !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.CO_OWNERS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.coOwners));
      }
      if (data.receiptSettings !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.RECEIPT_SETTINGS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.receiptSettings));
      }
      if (data.templateId !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.TEMPLATE_ID} = $${paramIndex++}`);
        values.push(data.templateId);
      }
      if (data.templateOverrides !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.TEMPLATE_OVERRIDES} = $${paramIndex++}`);
        values.push(JSON.stringify(data.templateOverrides));
      }
      if (data.ownerDetails?.name !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.OWNER_NAME} = $${paramIndex++}`);
        values.push(data.ownerDetails.name);
      }
      if (data.ownerDetails?.mobileNumbers !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.OWNER_MOBILE_NUMBERS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.ownerDetails.mobileNumbers));
      }
      if (data.ownerDetails?.emailIds !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.OWNER_EMAIL_IDS} = $${paramIndex++}`);
        values.push(JSON.stringify(data.ownerDetails.emailIds));
      }
      if (data.ownerDetails?.website !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.OWNER_WEBSITE} = $${paramIndex++}`);
        values.push(data.ownerDetails.website);
      }
      // Note: amenities field is handled separately and stored in the same AMENITIES column
      // This is a temporary solution until database schema is updated
      if (data.amenities !== undefined) {
        fields.push(`${COLUMNS.PROPERTIES.AMENITIES} = $${paramIndex++}`);
        values.push(JSON.stringify(data.amenities));
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.PROPERTIES.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.PROPERTIES} SET ${setClause} WHERE ${COLUMNS.PROPERTIES.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToProperty(result.rows[0]) : null;
    } catch (error) {
      logger.error('PropertyRepository.update error', error, { id });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.PROPERTIES} WHERE ${COLUMNS.PROPERTIES.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete property: ${error.message || 'Database delete failed'}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.PROPERTIES} SET ${COLUMNS.PROPERTIES.STATUS} = $1, ${COLUMNS.PROPERTIES.UPDATED_AT} = $2 WHERE ${COLUMNS.PROPERTIES.ID} = $3`,
        [status, new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to update property status: ${error.message || 'Database update failed'}`);
    }
  }

  async updateReceiptSettings(id: string, settings: any): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.PROPERTIES} SET ${COLUMNS.PROPERTIES.RECEIPT_SETTINGS} = $1, ${COLUMNS.PROPERTIES.UPDATED_AT} = $2 WHERE ${COLUMNS.PROPERTIES.ID} = $3`,
        [JSON.stringify(settings), new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to update property receipt settings: ${error.message || 'Database update failed'}`);
    }
  }

  private mapRowToProperty(row: any): Property {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      propertyType: row.property_type,
      status: row.status,
      currency: row.currency || 'INR',
      address: {
        street: row.address_street,
        city: row.address_city,
        state: row.address_state,
        pincode: row.address_pincode,
        country: row.address_country || 'India',
        landmark: row.address_landmark,
      },
      totalArea: parseFloat(row.area) || 0,
      totalFloors: row.total_floors,
      yearBuilt: row.year_built,
      parkingSpaces: row.parking_spaces,
      buildingAmenities: Array.isArray(row.amenities) ? row.amenities : (typeof row.amenities === 'string' ? (JSON.parse(row.amenities).basic || []) : []),
      buildingPhotos: [], // Photos are stored in separate property_files table
      ownerId: row.owner_id,
      coOwners: Array.isArray(row.co_owners) ? row.co_owners : (typeof row.co_owners === 'string' ? JSON.parse(row.co_owners || '[]') : (row.co_owners || [])),
      receiptSettings: row.receipt_settings ? (typeof row.receipt_settings === 'string' ? JSON.parse(row.receipt_settings) : row.receipt_settings) : undefined,
      templateId: row.template_id,
      templateOverrides: row.template_overrides ? (typeof row.template_overrides === 'string' ? JSON.parse(row.template_overrides) : row.template_overrides) : undefined,
      // New enhanced fields
      ownerDetails: {
        name: row.owner_name,
        mobileNumbers: Array.isArray(row.owner_mobile_numbers) ? row.owner_mobile_numbers : (typeof row.owner_mobile_numbers === 'string' ? JSON.parse(row.owner_mobile_numbers || '[]') : (row.owner_mobile_numbers || [])),
        emailIds: Array.isArray(row.owner_email_ids) ? row.owner_email_ids : (typeof row.owner_email_ids === 'string' ? JSON.parse(row.owner_email_ids || '[]') : (row.owner_email_ids || [])),
        website: row.owner_website,
      },
      amenities: row.amenities ? (typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities) : {
        basic: [],
        luxury: [],
        additionalInfo: {
          petFriendly: false,
          smokingAllowed: false,
          eventsAllowed: false,
        },
      },
      receiptTemplate: undefined, // This will be populated separately from property_receipt_templates table
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}