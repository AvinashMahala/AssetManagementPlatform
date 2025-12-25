import { createPropertySchema, updatePropertySchema } from '../property.validation';

describe('Property validation schemas', () => {
  test('createPropertySchema accepts legacy type and address string and normalizes them', async () => {
    const payload = {
      body: {
        name: 'Test Property',
        address: '123 Main St',
        type: 'apartment',
        amenities: ['parking', 'security'],
      },
    } as any;

    const parsed = await createPropertySchema.parseAsync(payload);

    expect(parsed.body.propertyType).toBe('apartment');
    expect(typeof parsed.body.address).toBe('object');
    expect(parsed.body.address.street).toBe('123 Main St');
    expect(parsed.body.amenities.basic).toContain('parking');
  });

  test('createPropertySchema accepts structured address and propertyType', async () => {
    const payload = {
      body: {
        name: 'Another Property',
        propertyType: 'house',
        address: { street: '1 A St', city: 'City', state: 'State', pincode: '12345' },
      },
    } as any;

    const parsed = await createPropertySchema.parseAsync(payload);
    expect(parsed.body.propertyType).toBe('house');
    expect(parsed.body.address.city).toBe('City');
  });

  test('name length exceeding 255 is rejected', async () => {
    const longName = 'x'.repeat(260);
    const payload = { body: { name: longName, type: 'apartment', address: 'a' } } as any;
    await expect(createPropertySchema.parseAsync(payload)).rejects.toThrow();
  });

  test('createPropertySchema accepts numeric totalArea and legacy area', async () => {
    const payload1 = { body: { name: 'WithTotal', propertyType: 'apartment', address: 'a', totalArea: 150 } } as any;
    const parsed1 = await createPropertySchema.parseAsync(payload1);
    expect(parsed1.body.totalArea).toBe(150);

    const payload2 = { body: { name: 'WithArea', propertyType: 'apartment', address: 'a', area: '250' } } as any;
    const parsed2 = await createPropertySchema.parseAsync(payload2);
    expect(parsed2.body.totalArea).toBe(250);
  });

  test('updatePropertySchema normalizes type to propertyType when provided', async () => {
    const payload = { params: { id: '11111111-1111-4111-8111-111111111111' }, body: { type: 'villa' } } as any;
    const parsed = await updatePropertySchema.parseAsync(payload);
    expect(parsed.body.propertyType).toBe('villa');
  });
});
