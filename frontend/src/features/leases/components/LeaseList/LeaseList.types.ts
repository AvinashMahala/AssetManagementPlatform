import type { Lease } from '../../types/lease';

export interface LeaseListProps {
  leases: Lease[];
  viewMode: 'table' | 'timeline';
  loading?: boolean;
  selectedLeases: Set<string>;
  onSelectLease: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (id: string, tenantName: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  getTenantName: (id: string) => string;
  getUnitNumber: (lease: Lease) => string;
}
