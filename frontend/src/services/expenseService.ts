import type { Expense, ExpenseInput, ExpenseUpdateInput, ExpenseFilters, ExpenseStatistics, ExpenseWithDetails } from '../types/expense';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class ExpenseService {
  async getAll(filters?: ExpenseFilters): Promise<ApiResponse<ExpenseWithDetails[]>> {
    let url = API_ENDPOINTS.EXPENSES;
    const params = new URLSearchParams();

    if (filters) {
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.unitId) params.append('unitId', filters.unitId);
      if (filters.type) params.append('type', filters.type);
      if (filters.frequency) params.append('frequency', filters.frequency);
      if (filters.distribution) params.append('distribution', filters.distribution);
      if (filters.status) params.append('status', filters.status);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
      if (filters.startDateTo) params.append('startDateTo', filters.startDateTo);
    }

    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<ExpenseWithDetails[]>(url);
  }

  async getById(id: string): Promise<ApiResponse<ExpenseWithDetails>> {
    return apiClient.get<ExpenseWithDetails>(`${API_ENDPOINTS.EXPENSES}/${id}`);
  }

  async create(data: ExpenseInput): Promise<ApiResponse<Expense>> {
    return apiClient.post<Expense>(API_ENDPOINTS.EXPENSES, data);
  }

  async update(id: string, data: ExpenseUpdateInput): Promise<ApiResponse<Expense>> {
    return apiClient.put<Expense>(`${API_ENDPOINTS.EXPENSES}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.EXPENSES}/${id}`);
  }

  async getStatistics(propertyId?: string): Promise<ApiResponse<ExpenseStatistics>> {
    let url = `${API_ENDPOINTS.EXPENSES}/statistics`;
    if (propertyId) {
      url += `?propertyId=${propertyId}`;
    }
    return apiClient.get<ExpenseStatistics>(url);
  }
}

export const expenseService = new ExpenseService();
export default expenseService;