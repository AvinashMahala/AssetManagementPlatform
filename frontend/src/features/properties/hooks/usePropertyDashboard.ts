import { useState, useEffect, useMemo } from 'react';
import { useProperty } from '@/features/properties/hooks/useProperties';
import { useUnits } from '@/features/units/hooks/useUnits';
import { useLeases } from '@/features/leases/hooks/useLeases';
import { usePayments } from '@/features/finance/hooks/usePayments';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { format } from 'date-fns';

export const usePropertyDashboard = (propertyId: string) => {
  const { data: property, loading: propertyLoading, error: propertyError } = useProperty(propertyId);
  const { units, loading: unitsLoading } = useUnits(propertyId);
  const { leases } = useLeases();
  const { payments } = usePayments();
  const { tenants } = useTenants();

  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  // Listen for file deletion events
  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent) => {
      if (event.detail?.propertyId === propertyId || event.detail?.entityId === propertyId) {
        setFileRefreshTrigger(prev => prev + 1);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'file-deleted' && event.newValue) {
        try {
          setFileRefreshTrigger(prev => prev + 1);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    };

    window.addEventListener('file-deleted', handleFileDeleted as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('file-deleted', handleFileDeleted as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [propertyId]);

  // Filter leases for this property's units
  const propertyUnitIds = useMemo(() => units.map(u => u.id), [units]);
  const propertyLeases = useMemo(
    () => leases.filter(l => propertyUnitIds.includes(l.unitId)),
    [leases, propertyUnitIds]
  );

  // Filter payments for this property's leases
  const propertyLeaseIds = useMemo(() => propertyLeases.map(l => l.id), [propertyLeases]);
  const propertyPayments = useMemo(
    () => payments.filter(p => propertyLeaseIds.includes(p.leaseId)),
    [payments, propertyLeaseIds]
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const availableUnits = units.filter(u => u.status === 'available').length;
    const maintenanceUnits = units.filter(u => u.status === 'under_maintenance').length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0';

    const activeLeases = propertyLeases.filter(l => l.status === 'active');
    const expiringSoonLeases = activeLeases.filter(l => {
      const daysUntilExpiry = Math.ceil((new Date(l.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const totalMonthlyRent = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    const paidPayments = propertyPayments.filter(p => p.status === 'paid');
    const pendingPayments = propertyPayments.filter(p => p.status === 'pending');
    const overduePayments = propertyPayments.filter(p => {
      if (p.status === 'paid') return false;
      return new Date(p.dueDate) < new Date();
    });

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = propertyPayments.length > 0
      ? ((paidPayments.length / propertyPayments.length) * 100).toFixed(1)
      : '0';

    // Revenue trend (last 6 months)
    const revenueTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(monthDate, 'MMM yyyy');
      const monthPayments = paidPayments.filter(p => {
        if (!p.paidDate) return false;
        const paidDate = new Date(p.paidDate);
        return paidDate.getMonth() === monthDate.getMonth() && paidDate.getFullYear() === monthDate.getFullYear();
      });
      const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
      revenueTrend.push({ name: monthKey, value: monthRevenue });
    }

    // Occupancy trend
    const occupancyTrend = [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Available', value: availableUnits },
      { name: 'Maintenance', value: maintenanceUnits }
    ];

    // Active tenants
    const activeTenantIds = activeLeases.map(l => l.tenantId);
    const activeTenants = tenants.filter(t => activeTenantIds.includes(t.id) && t.status === 'active');

    return {
      totalUnits,
      occupiedUnits,
      availableUnits,
      maintenanceUnits,
      occupancyRate,
      activeLeases: activeLeases.length,
      expiringSoonLeases: expiringSoonLeases.length,
      totalMonthlyRent,
      totalRevenue,
      pendingAmount,
      overdueAmount,
      collectionRate,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      revenueTrend,
      occupancyTrend,
      activeTenants: activeTenants.length
    };
  }, [units, propertyLeases, propertyPayments, tenants]);

  return {
    property,
    propertyLoading,
    propertyError,
    units,
    unitsLoading,
    leases: propertyLeases,
    payments: propertyPayments,
    tenants,
    metrics,
    fileRefreshTrigger
  };
};
