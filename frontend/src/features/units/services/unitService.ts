import type { Unit, UnitInput } from '@/features/units/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

class UnitService {
  private mapApiUnit(api: any): Unit {
    const parseArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val ? val.split(',').map((s: string) => s.trim()) : []; }
      }
      return [];
    };

    return {
      id: api.id,
      propertyId: api.propertyId,
      unitNumber: api.unitNumber,
      unitName: api.name || api.unitName,
      description: api.description,
      unitType: api.unitType,
      status: api.status,
      floor: api.floor ?? undefined,
      area: api.area ?? 0,
      bedrooms: api.bedrooms ?? undefined,
      bathrooms: api.bathrooms ?? undefined,
      balconies: api.balconies ?? undefined,
      furnished: !!api.furnished,
      maxOccupants: api.maxOccupants ?? undefined,
      unitAmenities: parseArray(api.unitAmenities),
      unitPhotos: parseArray(api.unitPhotos),
      monthlyRent: api.monthlyRent ?? 0,
      securityDeposit: api.securityDeposit ?? 0,
      maintenanceCharges: api.maintenanceCharges ?? undefined,
      utilities: api.utilities ?? undefined,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    } as Unit;
  }

  private mapToApiPayload(data: Partial<UnitInput>): any {
    return {
      propertyId: data.propertyId,
      unitNumber: data.unitNumber,
      name: data.unitName,
      description: data.description,
      unitType: data.unitType,
      floor: data.floor,
      area: data.area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      balconies: data.balconies,
      furnished: data.furnished,
      maxOccupants: data.maxOccupants,
      unitAmenities: data.unitAmenities ? JSON.stringify(data.unitAmenities) : undefined,
      unitPhotos: data.unitPhotos ? JSON.stringify(data.unitPhotos) : undefined,
      monthlyRent: data.monthlyRent,
      securityDeposit: data.securityDeposit,
      maintenanceCharges: data.maintenanceCharges,
    };
  }

  async getAll(propertyId?: string): Promise<ApiResponse<Unit[]>> {
    const url = propertyId 
      ? `${API_ENDPOINTS.UNITS}?propertyId=${propertyId}` 
      : API_ENDPOINTS.UNITS;
    const resp = await apiClient.get<any[]>(url);
    if (!resp || !resp.data) return resp as ApiResponse<Unit[]>;
    const mapped = Array.isArray(resp.data) ? resp.data.map((u: any) => this.mapApiUnit(u)) : [];
    return { ...resp, data: mapped } as ApiResponse<Unit[]>;
  }

  async getById(id: string): Promise<ApiResponse<Unit>> {
    const resp = await apiClient.get<any>(`${API_ENDPOINTS.UNITS}/${id}`);
    if (!resp || !resp.data) return resp as ApiResponse<Unit>;
    const mapped = this.mapApiUnit(resp.data);
    return { ...resp, data: mapped } as ApiResponse<Unit>;
  }

  async create(data: UnitInput, audit: boolean = false): Promise<ApiResponse<any>> {
    const payload = this.mapToApiPayload(data);
    const url = audit ? `${API_ENDPOINTS.UNITS}?audit=true` : API_ENDPOINTS.UNITS;
    return apiClient.post<any>(url, payload);
  }

  async update(id: string, data: Partial<UnitInput>, audit: boolean = false): Promise<ApiResponse<any>> {
    const payload = this.mapToApiPayload(data);
    const url = audit ? `${API_ENDPOINTS.UNITS}/${id}?audit=true` : `${API_ENDPOINTS.UNITS}/${id}`;
    return apiClient.put<any>(url, payload);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.UNITS}/${id}`);
  }

  async getAnalytics(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.UNITS}/${id}/analytics`);
  }
}

export const unitService = new UnitService();
export default unitService;
