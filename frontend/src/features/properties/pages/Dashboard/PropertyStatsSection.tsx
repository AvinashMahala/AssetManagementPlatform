import React from 'react';
import { Home, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { StatsCard } from '@/componentDesignLibrary/components/stats-card/StatsCard';
import styles from './PropertyStatsSection.module.scss';

interface PropertyStatsSectionProps {
  metrics: {
    totalUnits: number;
    occupiedUnits: number;
    availableUnits: number;
    occupancyRate: string;
    activeLeases: number;
    totalMonthlyRent: number;
    totalRevenue: number;
    paidPayments: number;
  };
  formatCurrency: (amount: number | undefined | null) => string;
}

export const PropertyStatsSection: React.FC<PropertyStatsSectionProps> = ({
  metrics,
  formatCurrency,
}) => {
  return (
    <div className={styles.keyMetrics}>
      <StatsCard
        title="Total Units"
        value={metrics.totalUnits.toString()}
        description={`${metrics.occupiedUnits} occupied • ${metrics.availableUnits} available`}
        icon={<Home className="h-4 w-4" />}
        variant="default"
        className={styles.metricCard}
      />
      <StatsCard
        title="Occupancy Rate"
        value={`${metrics.occupancyRate}%`}
        description={`${metrics.activeLeases} active tenants`}
        icon={<TrendingUp className="h-4 w-4" />}
        variant="success"
        className={styles.metricCard}
      />
      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(metrics.totalMonthlyRent)}
        description={`From ${metrics.activeLeases} active leases`}
        icon={<DollarSign className="h-4 w-4" />}
        variant="default"
        className={styles.metricCard}
      />
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(metrics.totalRevenue)}
        description={`${metrics.paidPayments} payments collected`}
        icon={<BarChart3 className="h-4 w-4" />}
        variant="default"
        className={styles.metricCard}
      />
    </div>
  );
};
