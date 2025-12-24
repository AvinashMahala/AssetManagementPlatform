import { CreatePropertyUseCase } from '../CreateProperty.usecase.js';
import type { PropertyInput, Property } from '../../types/property.types.js';

describe('CreatePropertyUseCase', () => {
  const mockRepository = {
    create: jest.fn(async (data: Partial<PropertyInput>) => {
      // return a minimal Property shaped object for assertions
      const result: Partial<Property> = {
        id: 'test-id',
        name: data.name || 'test',
        propertyType: data.propertyType as any,
        status: 'available' as any,
        currency: data.currency || 'INR',
        address: data.address as any,
        totalArea: (data as any).totalArea || 0,
        buildingAmenities: data.buildingAmenities || [],
        buildingPhotos: data.buildingPhotos || [],
        ownerId: data.ownerId || 'owner',
        ownerDetails: data.ownerDetails as any,
        amenities: data.amenities as any,
        files: data.files || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return result as Property;
    })
  } as any;

  const usecase = new CreatePropertyUseCase(mockRepository);

  const baseInput = (): PropertyInput => ({
    name: 'Test Property',
    propertyType: 'apartment' as any,
    address: { street: 'S', city: 'C', state: 'ST', pincode: '12345' },
    totalArea: 100,
    ownerId: 'owner-id',
    ownerDetails: { name: 'Owner', mobileNumbers: ['+911234567890'], emailIds: ['o@example.com'] },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates when totalArea provided', async () => {
    const input = baseInput();
    input.totalArea = 200;
    const result = await usecase.execute(input);
    expect(result.totalArea).toBe(200);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('accepts legacy `area` field when totalArea missing', async () => {
    const input = baseInput();
    delete (input as any).totalArea;
    (input as any).area = '300';

    const result = await usecase.execute(input as any);
    expect(result.totalArea).toBe(300);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('throws if area/totalArea missing', async () => {
    const input = baseInput();
    // remove both
    delete (input as any).totalArea;
    delete (input as any).area;

    await expect(usecase.execute(input as any)).rejects.toThrow('Property area is required');
  });
});
