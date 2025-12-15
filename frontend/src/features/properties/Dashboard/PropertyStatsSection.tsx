import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Home, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

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
    <div className="key-metrics grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <Card className="metric-card hover:shadow-md transition-shadow" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="metric-header flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="metric-title text-xs font-medium text-muted-foreground">Total Units</CardTitle>
          <Home className="metric-icon h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="metric-content">
          <div className="metric-value text-2xl font-bold">{metrics.totalUnits}</div>
          <p className="metric-description text-xs text-muted-foreground mt-1">
            {metrics.occupiedUnits} occupied • {metrics.availableUnits} available
          </p>
        </CardContent>
      </Card>

      <Card className="metric-card hover:shadow-md transition-shadow" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="metric-header flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="metric-title text-xs font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          <TrendingUp className="metric-icon h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="metric-content">
          <div className="metric-value text-2xl font-bold">{metrics.occupancyRate}%</div>
          <p className="metric-description text-xs text-muted-foreground mt-1">
            {metrics.activeLeases} active tenants
          </p>
        </CardContent>
      </Card>

      <Card className="metric-card hover:shadow-md transition-shadow" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="metric-header flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="metric-title text-xs font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          <DollarSign className="metric-icon h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent className="metric-content">
          <div className="metric-value text-2xl font-bold">{formatCurrency(metrics.totalMonthlyRent)}</div>
          <p className="metric-description text-xs text-muted-foreground mt-1">
            From {metrics.activeLeases} active leases
          </p>
        </CardContent>
      </Card>

      <Card className="metric-card hover:shadow-md transition-shadow" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="metric-header flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="metric-title text-xs font-medium text-muted-foreground">Total Revenue</CardTitle>
          <BarChart3 className="metric-icon h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent className="metric-content">
          <div className="metric-value text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="metric-description text-xs text-muted-foreground mt-1">
            {metrics.paidPayments} payments collected
          </p>
        </CardContent>
      </Card>
    </div>
  );
};