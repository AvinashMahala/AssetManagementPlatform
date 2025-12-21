import type { Lease } from '../types/lease';

export const getDaysUntilExpiry = (endDate: string) => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isExpiringSoon = (endDate: string) => {
  const days = getDaysUntilExpiry(endDate);
  return days > 0 && days <= 30;
};

export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active': return 'default';
    case 'expired': return 'destructive';
    case 'draft': return 'secondary';
    case 'terminated': return 'outline';
    default: return 'outline';
  }
};

export const getStatusColor = (lease: Lease): string => {
  if (lease.status === 'active' && isExpiringSoon(lease.endDate)) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  }
  switch (lease.status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};
