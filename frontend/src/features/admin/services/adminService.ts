import { apiClient } from '@/lib/apiClient';
import type { RoleDto, PermissionDto } from '../types/roles';

export async function getRoles(q?: string, page: number = 1, pageSize: number = 20): Promise<PagedResult<RoleDto>> {
  const qStr = q ? `?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}` : `?page=${page}&pageSize=${pageSize}`;
  const response = await apiClient.get(`/api/v1/admin/roles${qStr}`);
  if (!response.success || !response.data) throw new Error('Failed to fetch roles');

  // Normalize backend shapes: some endpoints return `users: Guid[]`, others return `userRoles: UserRoleDto[]`.
  const raw = response.data as any;
  const items = (raw.items || []).map((r: any) => {
    // Normalize user id formats to lowercase strings for consistent comparisons
    const usersFromUserRoles = r.userRoles ? r.userRoles.map((ur: any) => String(ur.userId).toLowerCase()) : undefined;
    const users = r.users ? r.users.map((u: any) => String(u).toLowerCase()) : (usersFromUserRoles || []);
    const userRoles = r.userRoles ? r.userRoles.map((ur: any) => ({ ...ur, userId: String(ur.userId).toLowerCase() })) : users.map((u: string) => ({ userId: u }));
    return { ...r, users, userRoles };
  });

  return { ...raw, items } as PagedResult<RoleDto>;
}

export async function getPermissions(): Promise<PermissionDto[]> {
  const response = await apiClient.get('/api/v1/admin/roles/permissions');
  if (!response.success || !response.data) throw new Error('Failed to fetch permissions');
  return response.data as PermissionDto[];
}

export async function getRole(id: string): Promise<RoleDto> {
  const response = await apiClient.get(`/api/v1/admin/roles/${id}`);
  if (!response.success || !response.data) throw new Error('Failed to fetch role');
  return response.data as RoleDto;
}

export async function getUsers(q?: string) {
  const response = await apiClient.get(`/api/v1/admin/roles/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  if (!response.success || !response.data) throw new Error('Failed to fetch users');
  return response.data as Array<{ id: string; email: string; username?: string; name?: string }>;
}

export async function createRole(payload: { name: string; description?: string }): Promise<RoleDto> {
  const response = await apiClient.post('/api/v1/admin/roles', payload);
  if (!response.success || !response.data) throw new Error('Failed to create role');
  return response.data as RoleDto;
}

export async function updateRole(id: string, payload: { name: string; description?: string }): Promise<void> {
  const response = await apiClient.put(`/api/v1/admin/roles/${id}`, payload);
  if (!response.success) throw new Error('Failed to update role');
}

export async function deleteRole(id: string): Promise<void> {
  const response = await apiClient.delete(`/api/v1/admin/roles/${id}`);
  if (!response.success) throw new Error('Failed to delete role');
}

export async function setRolePermissions(id: string, permissionIds: string[]): Promise<void> {
  const response = await apiClient.post(`/api/v1/admin/roles/${id}/permissions`, permissionIds);
  if (!response.success) throw new Error('Failed to set permissions');
}

export async function assignUser(id: string, userId: string): Promise<void> {
  const response = await apiClient.post(`/api/v1/admin/roles/${id}/users`, { userId });
  if (!response.success) throw new Error(response.error?.message || response.message || 'Failed to assign user');
}

export async function removeUser(id: string, userId: string): Promise<void> {
  const response = await apiClient.delete(`/api/v1/admin/roles/${id}/users/${userId}`);
  if (!response.success) throw new Error(response.error?.message || response.message || 'Failed to remove user');
}

// Return a server export URL for roles. If ids is provided, include it as a comma-separated list; q is optional filter
export async function createRoleExport(ids?: string[], q?: string) {
  const payload: { ids?: string[]; q?: string } = {};
  if (ids && ids.length) payload.ids = ids;
  if (q) payload.q = q;
  const response = await apiClient.post('/api/v1/admin/exports/roles', payload);
  if (!response.success || !response.data) throw new Error('Failed to create export token');
  return response.data as { token: string; expiresAt: string; url: string };
}

export async function revokeExportToken(token: string): Promise<void> {
  const response = await apiClient.post(`/api/v1/admin/exports/${token}/revoke`, null);
  if (!response.success) throw new Error('Failed to revoke export token');
}

export async function getExportTokens(page: number = 1, pageSize: number = 100) {
  const response = await apiClient.get(`/api/v1/admin/exports?page=${page}&pageSize=${pageSize}`);
  if (!response.success || !response.data) throw new Error('Failed to fetch export tokens');
  return response.data as Array<import('../types/exports').ExportTokenDto>;
}

export function exportRolesUrl(ids?: string[], q?: string) {
  const params = new URLSearchParams();
  if (ids && ids.length) params.set('ids', ids.join(','));
  if (q) params.set('q', q);
  return `/api/v1/admin/roles/export?${params.toString()}`;
}