import { Pool } from 'pg';
import { initializeDatabase } from '@/shared/config/database/init/index';
import { PropertyRepository } from '../data/repository/PropertyRepository';

describe('Property integration tests', () => {
  const dbUrl = process.env.MAIN_DATABASE_URL || 'postgresql://user:pass@localhost:5434/asset_platform_main';
  const pool = new Pool({ connectionString: dbUrl });
  let repository: PropertyRepository;

  beforeAll(async () => {
    // Initialize schema (destructive) for integration test environments
    await initializeDatabase(pool as any);
    repository = new PropertyRepository(pool as any);
  }, 30000);

  afterAll(async () => {
    await pool.end();
  });

  test('create + find property with structured address persists correctly', async () => {
    const payload = {
      name: 'Integration Property',
      propertyType: 'apartment',
      address: { street: '42 Test St', city: 'TestCity', state: 'TS', pincode: '400001', country: 'India' },
      totalArea: 123.45,
      ownerDetails: { name: 'Owner', mobileNumbers: ['9999999999'], emailIds: ['owner@example.com'] },
      ownerId: null,
    } as any;

    const created = await repository.create(payload);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Integration Property');
    expect(created.address.street).toBe('42 Test St');

    const fetched = await repository.findById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe('Integration Property');

    // Cleanup
    await repository.delete(created.id);
  }, 30000);
});
