import { useMemo } from 'react';
import { useLeases, usePayments } from './index';

export const useActivityItems = () => {
  const { leases } = useLeases();
  const { payments } = usePayments();

  const activeLeases = useMemo(() => {
    if (!Array.isArray(leases)) return [];
    return leases
      .filter((l) => l.status === 'active')
      .slice(0, 5)
      .map((lease) => ({
        id: lease.id,
        title: `Lease #${lease.id.slice(0, 8)}`,
        subtitle: `${new Date(lease.startDate).toLocaleDateString()} - ${new Date(lease.endDate).toLocaleDateString()}`,
        badge: 'Active',
        badgeVariant: 'default' as const,
        onClick: (navigate: (path: string) => void) => navigate(`/leases/${lease.id}`),
      }));
  }, [leases]);

  const pendingPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments
      .filter((p) => p.status === 'pending')
      .slice(0, 5)
      .map((payment) => {
        const isOverdue = new Date(payment.dueDate) < new Date();
        return {
          id: payment.id,
          title: `₹${payment.amount.toLocaleString()}`,
          subtitle: `Due: ${new Date(payment.dueDate).toLocaleDateString()}`,
          badge: isOverdue ? 'Overdue' : 'Pending',
          badgeVariant: (isOverdue ? 'destructive' : 'secondary') as const,
          onClick: (navigate: (path: string) => void) => navigate(`/payments/${payment.id}`),
        };
      });
  }, [payments]);

  return { activeLeases, pendingPayments };
};