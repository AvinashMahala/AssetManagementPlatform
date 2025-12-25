export interface UnitTenant {
  id: string;
  unitId: string;
  tenantId: string;
  isPrimaryTenant: boolean;
  moveInDate?: Date;
  moveOutDate?: Date;
  monthlyRentShare: number;
  securityDepositShare: number;
  status: 'active' | 'inactive' | 'evicted';
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitTenantInput {
  unitId: string;
  tenantId: string;
  isPrimaryTenant?: boolean;
  moveInDate?: Date;
  moveOutDate?: Date;
  monthlyRentShare: number;
  securityDepositShare: number;
  status?: 'active' | 'inactive' | 'evicted';
}
