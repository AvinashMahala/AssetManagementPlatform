import type { Tenant, TenantInput } from '@/features/tenants/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

class TenantService {
  private mapFromApi(obj: any): Tenant {
    if (!obj) throw new Error('Invalid tenant object from API');

    const currentAddress = obj.currentAddress || {
      street: obj.CurrentAddressStreet || '',
      city: obj.CurrentAddressCity || '',
      state: obj.CurrentAddressState || '',
      pincode: obj.CurrentAddressPincode || '',
    };

    const permanentAddress = (obj.permanentAddress || (obj.PermanentAddressStreet || obj.PermanentAddressCity || obj.PermanentAddressState || obj.PermanentAddressPincode))
      ? {
          street: obj.permanentAddress?.street || obj.PermanentAddressStreet || '',
          city: obj.permanentAddress?.city || obj.PermanentAddressCity || '',
          state: obj.permanentAddress?.state || obj.PermanentAddressState || '',
          pincode: obj.permanentAddress?.pincode || obj.PermanentAddressPincode || '',
        }
      : undefined;

    const emergencyContact = (obj.emergencyContact || obj.EmergencyContactName || obj.EmergencyContactPhone || obj.EmergencyContactRelationship)
      ? {
          name: obj.emergencyContact?.name || obj.EmergencyContactName || '',
          relationship: obj.emergencyContact?.relationship || obj.EmergencyContactRelationship || '',
          phone: obj.emergencyContact?.phone || obj.EmergencyContactPhone || '',
        }
      : undefined;

    return {
      id: (obj.id || obj.Id || '').toString(),
      firstName: obj.firstName || obj.FirstName || '',
      lastName: obj.lastName || obj.LastName || '',
      email: obj.email || obj.Email || '',
      phone: obj.phone || obj.Phone || undefined,
      alternatePhone: obj.alternatePhone || obj.AlternatePhone || undefined,
      dateOfBirth: obj.dateOfBirth || obj.DateOfBirth || undefined,
      gender: obj.gender || obj.Gender || undefined,
      occupation: obj.occupation || obj.Occupation || undefined,
      companyName: obj.companyName || obj.CompanyName || undefined,
      monthlyIncome: obj.monthlyIncome !== undefined ? obj.monthlyIncome : (obj.MonthlyIncome !== undefined ? obj.MonthlyIncome : undefined),
      currentAddress,
      permanentAddress,
      emergencyContact,
      status: (obj.status || obj.Status || 'active'),
      totalRentals: obj.totalRentals !== undefined ? obj.totalRentals : obj.TotalRentals,
      currentPropertyId: obj.currentPropertyId || obj.CurrentPropertyId || undefined,
      createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : (obj.CreatedAt ? new Date(obj.CreatedAt).toISOString() : new Date().toISOString()),
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : (obj.UpdatedAt ? new Date(obj.UpdatedAt).toISOString() : undefined),
    } as Tenant;
  }

  async getAll(): Promise<ApiResponse<Tenant[]>> {
    const res = await apiClient.get<any[]>(API_ENDPOINTS.TENANTS);
    if (!res.success) return res as ApiResponse<Tenant[]>;
    return {
      ...res,
      data: (res.data || []).map((t: any) => this.mapFromApi(t)),
    };
  }

  async getById(id: string): Promise<ApiResponse<Tenant>> {
    const res = await apiClient.get<any>(`${API_ENDPOINTS.TENANTS}/${id}`);
    if (!res.success) return res as ApiResponse<Tenant>;
    return {
      ...res,
      data: res.data ? this.mapFromApi(res.data) : undefined,
    };
  }

  private flattenForApi(data: Partial<TenantInput>) {
    const payload: any = { ...data };

    if (data.currentAddress) {
      payload.CurrentAddressStreet = data.currentAddress.street;
      payload.CurrentAddressCity = data.currentAddress.city;
      payload.CurrentAddressState = data.currentAddress.state;
      payload.CurrentAddressPincode = data.currentAddress.pincode;
      delete payload.currentAddress;
    }

    if (data.permanentAddress) {
      payload.PermanentAddressStreet = data.permanentAddress.street;
      payload.PermanentAddressCity = data.permanentAddress.city;
      payload.PermanentAddressState = data.permanentAddress.state;
      payload.PermanentAddressPincode = data.permanentAddress.pincode;
      delete payload.permanentAddress;
    }

    if (data.emergencyContact) {
      payload.EmergencyContactName = data.emergencyContact.name;
      payload.EmergencyContactRelationship = data.emergencyContact.relationship;
      payload.EmergencyContactPhone = data.emergencyContact.phone;
      delete payload.emergencyContact;
    }

    // Map camelCase keys to PascalCase for backend model binding where necessary
    if ((payload as any).firstName !== undefined) { payload.FirstName = (payload as any).firstName; delete (payload as any).firstName; }
    if ((payload as any).lastName !== undefined) { payload.LastName = (payload as any).lastName; delete (payload as any).lastName; }
    if ((payload as any).email !== undefined) { payload.Email = (payload as any).email; delete (payload as any).email; }
    if ((payload as any).phone !== undefined) { payload.Phone = (payload as any).phone; delete (payload as any).phone; }
    if ((payload as any).alternatePhone !== undefined) { payload.AlternatePhone = (payload as any).alternatePhone; delete (payload as any).alternatePhone; }
    if ((payload as any).dateOfBirth !== undefined) { payload.DateOfBirth = (payload as any).dateOfBirth; delete (payload as any).dateOfBirth; }
    if ((payload as any).gender !== undefined) { payload.Gender = (payload as any).gender; delete (payload as any).gender; }
    if ((payload as any).occupation !== undefined) { payload.Occupation = (payload as any).occupation; delete (payload as any).occupation; }
    if ((payload as any).companyName !== undefined) { payload.CompanyName = (payload as any).companyName; delete (payload as any).companyName; }
    if ((payload as any).monthlyIncome !== undefined) { payload.MonthlyIncome = (payload as any).monthlyIncome; delete (payload as any).monthlyIncome; }
    if ((payload as any).status !== undefined) { payload.Status = (payload as any).status; delete (payload as any).status; }
    if ((payload as any).currentPropertyId !== undefined) { payload.CurrentPropertyId = (payload as any).currentPropertyId; delete (payload as any).currentPropertyId; }

    return payload;
  }

  async create(data: TenantInput): Promise<ApiResponse<Tenant>> {
    const payload = this.flattenForApi(data);
    const res = await apiClient.post<any>(API_ENDPOINTS.TENANTS, payload);
    if (!res.success) return res as ApiResponse<Tenant>;
    return {
      ...res,
      data: res.data ? this.mapFromApi(res.data) : undefined,
    };
  }

  async update(id: string, data: Partial<TenantInput>): Promise<ApiResponse<Tenant>> {
    const payload = this.flattenForApi(data);
    const res = await apiClient.put<any>(`${API_ENDPOINTS.TENANTS}/${id}`, payload);
    if (!res.success) return res as ApiResponse<Tenant>;
    return {
      ...res,
      data: res.data ? this.mapFromApi(res.data) : undefined,
    };
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.TENANTS}/${id}`);
  }
}

export const tenantService = new TenantService();
export default tenantService;
