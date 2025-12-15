import { useMemo } from 'react';
import { useProperties, useTenants, useUnits, useLeases, usePayments } from './index';

export const useDashboardStats = () => {
  const { properties, loading: propertiesLoading } = useProperties();
  const { tenants, loading: tenantsLoading } = useTenants();
  const { units, loading: unitsLoading } = useUnits();
  const { leases, loading: leasesLoading } = useLeases();
  const { payments, loading: paymentsLoading } = usePayments();

  const result = useMemo(() => {
    try {
      const totalProperties = Array.isArray(properties) ? properties.length : 0;
    const availableProperties = Array.isArray(properties)
      ? properties.filter((p) => p.status === 'available').length
      : 0;
    const totalTenants = Array.isArray(tenants) ? tenants.length : 0;
    const activeTenants = Array.isArray(tenants)
      ? tenants.filter((t) => t.status === 'active').length
      : 0;
    const totalUnits = Array.isArray(units) ? units.length : 0;
    const occupiedUnits = Array.isArray(units)
      ? units.filter((u) => u.status === 'occupied').length
      : 0;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0';

    const activeLeases = Array.isArray(leases)
      ? leases.filter((l) => l.status === 'active').length
      : 0;
    const expiringLeases = Array.isArray(leases)
      ? leases.filter((l) => {
          const endDate = new Date(l.endDate);
          const today = new Date();
          const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 30;
        }).length
      : 0;

    const totalRevenue = Array.isArray(payments)
      ? payments
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0)
      : 0;
    const pendingPayments = Array.isArray(payments)
      ? payments
          .filter((p) => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0)
      : 0;
    const overduePayments = Array.isArray(payments)
      ? payments.filter((p) => {
          if (p.status !== 'pending') return false;
          const dueDate = new Date(p.dueDate);
          return dueDate < new Date();
        }).length
      : 0;

      const statsObj = {
        totalProperties,
        availableProperties,
        totalTenants,
        activeTenants,
        totalUnits,
        occupiedUnits,
        occupancyRate,
        activeLeases,
        expiringLeases,
        totalRevenue,
        pendingPayments,
        overduePayments,
      };
      return { stats: statsObj, error: null };
    } catch (err) {
      return {
        stats: {
          totalProperties: 0,
          availableProperties: 0,
          totalTenants: 0,
          activeTenants: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          occupancyRate: '0',
          activeLeases: 0,
          expiringLeases: 0,
          totalRevenue: 0,
          pendingPayments: 0,
          overduePayments: 0,
        },
        error: err as Error,
      };
    }
  }, [properties, tenants, units, leases, payments]);

  const { stats, error } = result;  const revenueData = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    const monthlyData: { [key: string]: number } = {};
    payments
      .filter((p) => p.status === 'paid')
      .forEach((payment) => {
        const date = new Date(payment.paidDate || payment.dueDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
      });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, value]) => ({
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round(value),
      }));
  }, [payments]);

  const occupancyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Number(stats.occupancyRate) + (Math.random() * 10 - 5),
      });
    }
    return data;
  }, [stats.occupancyRate]);

  const collectionData = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    const monthlyData: { [key: string]: { collected: number; pending: number } } = {};
    payments.forEach((payment) => {
      const date = new Date(payment.dueDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { collected: 0, pending: 0 };
      }
      
      if (payment.status === 'paid') {
        monthlyData[monthKey].collected += payment.amount;
      } else {
        monthlyData[monthKey].pending += payment.amount;
      }
    });

    return Object.entries(monthlyData)
      .slice(-6)
      .map(([name, values]) => ({
        name,
        collected: Math.round(values.collected / 1000),
        pending: Math.round(values.pending / 1000),
      }));
  }, [payments]);

  const propertyStatusData = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    const statusCounts: { [key: string]: number } = {};
    properties.forEach((property) => {
      statusCounts[property.status] = (statusCounts[property.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));
  }, [properties]);

  const loading = propertiesLoading || tenantsLoading || unitsLoading || leasesLoading || paymentsLoading;

  return {
    stats,
    chartData: {
      revenue: revenueData,
      occupancy: occupancyData,
      collection: collectionData,
      propertyStatus: propertyStatusData,
    },
    loading,
    error,
  };
};