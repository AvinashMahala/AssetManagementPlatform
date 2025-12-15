import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Home,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { StatCard } from '../../components/ui';

interface StatsSectionProps {
  stats: {
    totalProperties: number;
    availableProperties: number;
    activeTenants: number;
    totalTenants: number;
    occupancyRate: number;
    occupiedUnits: number;
    totalUnits: number;
    totalRevenue: number;
    activeLeases: number;
    pendingPayments: number;
    expiringLeases: number;
    overduePayments: number;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 stats-grid">
      <StatCard
        title="Total Properties"
        value={stats.totalProperties}
        icon={Building2}
        description={`${stats.availableProperties} available`}
        action={() => navigate('/properties')}
        actionLabel="Manage Properties"
      />
      <StatCard
        title="Active Tenants"
        value={stats.activeTenants}
        icon={Users}
        description={`${stats.totalTenants} total tenants`}
        action={() => navigate('/tenants')}
        actionLabel="View Tenants"
      />
      <StatCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        icon={Home}
        description={`${stats.occupiedUnits}/${stats.totalUnits} units occupied`}
        action={() => navigate('/units')}
        actionLabel="View Units"
      />
      <StatCard
        title="Total Revenue"
        value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
        icon={TrendingUp}
        trend="up"
        change={12.5}
        action={() => navigate('/payments')}
        actionLabel="View Payments"
      />
      <StatCard
        title="Rent Collection"
        value="Workflow"
        icon={Receipt}
        description="Monitor collection process"
        action={() => navigate('/rent-collection/workflow-dashboard')}
        actionLabel="View Dashboard"
      />
    </div>
  );
};

export default StatsSection;