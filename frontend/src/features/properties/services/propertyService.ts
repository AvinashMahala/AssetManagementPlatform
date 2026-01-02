import type { Property, PropertyInput, PropertyFilters } from '@/features/properties/types';
import { PropertyStatus } from '@/features/properties/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import { createComponentLogger } from '@/utils/logger';

const logger = createComponentLogger('PropertyService');

class PropertyService {
  private mapApiProperty(api: any): Property {
    const amenitiesObject = api.amenitiesObject || (api.amenities ? (() => { try { return JSON.parse(api.amenities); } catch { return { basic: [], luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } }; } })() : { basic: [], luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } });

    const buildingAmenities = [ ...(amenitiesObject.basic || []), ...(amenitiesObject.luxury || []) ];

    const ownerMobileNumbers = Array.isArray(api.ownerMobileNumbersArray)
      ? api.ownerMobileNumbersArray
      : (api.ownerMobileNumbers ? (() => { try { return JSON.parse(api.ownerMobileNumbers); } catch { return []; } })() : []);

    const ownerEmailIds = Array.isArray(api.ownerEmailIdsArray)
      ? api.ownerEmailIdsArray
      : (api.ownerEmailIds ? (() => { try { return JSON.parse(api.ownerEmailIds); } catch { return []; } })() : []);

    const ownerDetails = {
      name: api.ownerName || '',
      mobileNumbers: ownerMobileNumbers,
      emailIds: ownerEmailIds,
      website: api.ownerWebsite || undefined,
    };

    const statusMap = (s?: string) => {
      if (!s) return PropertyStatus.VACANT;
      const ss = s.toLowerCase();
      if (ss === 'active' || ss === 'available') return PropertyStatus.AVAILABLE;
      if (ss === 'occupied') return PropertyStatus.OCCUPIED;
      if (ss === 'under_maintenance' || ss === 'maintenance') return PropertyStatus.UNDER_MAINTENANCE;
      if (ss === 'vacant' || ss === 'inactive') return PropertyStatus.VACANT;
      return PropertyStatus.AVAILABLE;
    };

    return {
      id: api.id,
      name: api.name,
      description: api.description,
      propertyType: api.propertyType,
      status: statusMap(api.status),
      currency: api.currency,
      address: {
        street: api.address || '',
        city: api.addressCity || '',
        state: api.addressState || '',
        pincode: api.addressPincode || '',
        country: api.addressCountry || undefined,
        landmark: api.addressLandmark || undefined,
      },
      totalArea: api.area ?? api.totalArea ?? 0,
      totalFloors: api.totalFloors ?? undefined,
      yearBuilt: api.yearBuilt ?? undefined,
      parkingSpaces: api.parkingSpaces ?? undefined,
      buildingAmenities,
      buildingPhotos: [],
      ownerDetails,
      amenities: amenitiesObject,
      files: [],
      receiptTemplate: api.templateJson ?? undefined,
      ownerId: api.ownerId,
      coOwners: Array.isArray(api.coOwnersArray) ? api.coOwnersArray : (api.coOwners ? (() => { try { return JSON.parse(api.coOwners); } catch { return []; } })() : []),
      receiptSettings: api.receiptSettings ?? undefined,
      templateId: api.templateId ?? undefined,
      templateOverrides: undefined,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    } as Property;
  }

  async getAll(filters?: PropertyFilters): Promise<ApiResponse<Property[]>> {
    const params = {
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    };

    const resp = await apiClient.get<any[]>(API_ENDPOINTS.PROPERTIES, { params });
    if (!resp || !resp.data) return resp as ApiResponse<Property[]>;

    const mapped = Array.isArray(resp.data) ? resp.data.map((p: any) => this.mapApiProperty(p)) : [];
    return { ...resp, data: mapped } as ApiResponse<Property[]>;
  }

  async getById(id: string): Promise<ApiResponse<Property>> {
    const resp = await apiClient.get<any>(`${API_ENDPOINTS.PROPERTIES}/${id}`);
    if (!resp || !resp.data) return resp as ApiResponse<Property>;
    const mapped = this.mapApiProperty(resp.data);
    return { ...resp, data: mapped } as ApiResponse<Property>;
  }

  private mapToApiPayload(propertyData: Partial<PropertyInput>): any {
    const amenitiesObject = propertyData.amenities || { basic: [], luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } };

    return {
      name: propertyData.name,
      description: propertyData.description,
      propertyType: propertyData.propertyType,
      currency: propertyData.currency,
      address: propertyData.address?.street,
      addressCity: propertyData.address?.city,
      addressState: propertyData.address?.state,
      addressPincode: propertyData.address?.pincode,
      addressCountry: propertyData.address?.country,
      addressLandmark: propertyData.address?.landmark,
      area: propertyData.totalArea,
      totalFloors: propertyData.totalFloors,
      yearBuilt: propertyData.yearBuilt,
      parkingSpaces: propertyData.parkingSpaces,
      // Send amenities as an object so the API can bind to UpdatePropertyRequest.Amenities
      amenities: amenitiesObject,
      ownerId: propertyData.ownerId,
      ownerName: propertyData.ownerDetails?.name,
      ownerMobileNumbersArray: propertyData.ownerDetails?.mobileNumbers,
      ownerEmailIdsArray: propertyData.ownerDetails?.emailIds,
      ownerWebsite: propertyData.ownerDetails?.website,
      coOwnersArray: propertyData.coOwners,
      receiptSettings: propertyData.receiptSettings,
      templateId: propertyData.templateId,
      templateJson: propertyData.receiptTemplate ? JSON.stringify(propertyData.receiptTemplate) : undefined,
    };
  }

  async create(propertyData: PropertyInput): Promise<ApiResponse<Property>> {
    const payload = this.mapToApiPayload(propertyData);
    return apiClient.post<Property>(API_ENDPOINTS.PROPERTIES, payload);
  }

  async update(id: string, propertyData: Partial<PropertyInput>): Promise<ApiResponse<Property>> {
    logger.debug('Updating property', { propertyId: id, fields: Object.keys(propertyData) });
    const startTime = Date.now();
    try {
      const payload = this.mapToApiPayload(propertyData);
      const result = await apiClient.put<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}`, payload);
      const duration = Date.now() - startTime;
      logger.info('Property updated successfully', { propertyId: id, duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update property', error, { propertyId: id, duration: `${duration}ms` });
      throw error;
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROPERTIES}/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<Property>> {
    return apiClient.patch<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}/status`, { status });
  }

  // Utility methods
  async search(query: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ search: query });
  }

  async getByType(propertyType: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ propertyType: propertyType as any });
  }

  async getByStatus(status: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ status: status as any });
  }

  async getByCity(city: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ city });
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
