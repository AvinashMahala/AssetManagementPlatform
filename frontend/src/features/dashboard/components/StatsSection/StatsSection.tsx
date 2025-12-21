import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Home,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { StatsCard } from '@/componentDesignLibrary/components/stats-card';
import './StatsSection.scss';

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
      <StatsCard
        title="Total Properties"
        value={stats.totalProperties}
        icon={<Building2 className="h-4 w-4" />}
        description={`${stats.availableProperties} available`}
        action={{ label: 'Manage Properties', onClick: () => navigate('/properties') }}
      />
      <StatsCard
        title="Active Tenants"
        value={stats.activeTenants}
        icon={<Users className="h-4 w-4" />}
        description={`${stats.totalTenants} total tenants`}
        action={{ label: 'View Tenants', onClick: () => navigate('/tenants') }}
      />
      <StatsCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        icon={<Home className="h-4 w-4" />}
        description={`${stats.occupiedUnits}/${stats.totalUnits} units occupied`}
        action={{ label: 'View Units', onClick: () => navigate('/units') }}
      />
      <StatsCard
        title="Total Revenue"
        value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: 12.5, direction: 'up' }}
        action={{ label: 'View Payments', onClick: () => navigate('/payments') }}
      />
      <StatsCard
        title="Rent Collection"
        value="Workflow"
        icon={<Receipt className="h-4 w-4" />}
        description="Monitor collection process"
        action={{ label: 'View Dashboard', onClick: () => navigate('/rent-collection/workflow-dashboard') }}
      />
    </div>
  );
};

export default StatsSection;