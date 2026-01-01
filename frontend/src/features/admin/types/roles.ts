export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
  categoryId?: string | null;
  categoryName?: string | null;
}

export interface RolePermissionDto {
  id: string;
  roleId: string;
  permissionId: string;
  allowed?: boolean;
}

export interface UserRoleDto {
  id: string;
  userId: string;
  roleId: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  rolePermissions?: RolePermissionDto[];
  userRoles?: UserRoleDto[];
  // convenience helper when backend expands response
  permissions?: PermissionDto[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
