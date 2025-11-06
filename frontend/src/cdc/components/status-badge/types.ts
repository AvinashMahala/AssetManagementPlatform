export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'warning'
  | 'success'
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'reserved'
  | 'paid'
  | 'unpaid'
  | 'overdue';

export interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}