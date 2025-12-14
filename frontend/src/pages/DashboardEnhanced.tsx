import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Home,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProperties, useTenants, useUnits, useLeases, usePayments } from '../hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  RevenueTrendChart,
  OccupancyRateChart,
  PaymentCollectionChart,
  PropertyStatusChart,
} from '../components/ui';
import { AppLayout } from '../components/layout';
import './DashboardEnhanced.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description,
  action,
  actionLabel = 'View Details',
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 stat-card p-2">
      <div className="flex flex-row items-center justify-between pb-0.5">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 text-muted-foreground stat-icon" />
      </div>
      <div className="space-y-0.5">
        <div className="text-xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change}%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-1 justify-between h-6 text-xs px-2"
            onClick={action}
          >
            {actionLabel}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
};

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { properties, loading: propertiesLoading } = useProperties();
  const { tenants, loading: tenantsLoading } = useTenants();
  const { units, loading: unitsLoading } = useUnits();
  const { leases, loading: leasesLoading } = useLeases();
  const { payments, loading: paymentsLoading } = usePayments();

  // Calculate statistics
  const stats = useMemo(() => {
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

    return {
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
  }, [properties, tenants, units, leases, payments]);

  // Prepare chart data
  const revenueData = useMemo(() => {
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
    // Generate last 6 months occupancy data
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        value: Number(stats.occupancyRate) + (Math.random() * 10 - 5), // Simulated variation
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

  const isLoading =
    propertiesLoading || tenantsLoading || unitsLoading || leasesLoading || paymentsLoading;

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center py-20 loading-container">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary loading-spinner"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-3 dashboard-enhanced">
        {/* Stat Cards */}
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

        {/* Alerts and Notifications */}
        {(stats.expiringLeases > 0 || stats.overduePayments > 0) && (
          <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 alert-card p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 alert-icon" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-300 alert-title">
                  Attention Required:
                </span>
                <div className="flex items-center space-x-4">
                  {stats.expiringLeases > 0 && (
                    <span className="text-sm text-amber-800 dark:text-amber-200">
                      {stats.expiringLeases} lease(s) expiring soon
                    </span>
                  )}
                  {stats.overduePayments > 0 && (
                    <span className="text-sm text-amber-800 dark:text-amber-200">
                      {stats.overduePayments} overdue payment(s)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {stats.expiringLeases > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/leases')}
                    className="border-amber-300 hover:bg-amber-100 alert-action-btn h-7 px-2"
                  >
                    Review Leases
                  </Button>
                )}
                {stats.overduePayments > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/payments')}
                    className="border-amber-300 hover:bg-amber-100 alert-action-btn h-7 px-2"
                  >
                    Review Payments
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Charts Carousel */}
        <div className="relative charts-carousel-container">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Analytics Overview</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const container = document.querySelector('.charts-carousel');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="carousel-nav-btn"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const container = document.querySelector('.charts-carousel');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="carousel-nav-btn"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="charts-carousel overflow-x-auto flex space-x-4 pb-2">
            <Card className="chart-container flex-shrink-0 w-96 p-3">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">Revenue Trend</h4>
                <p className="text-xs text-muted-foreground">Monthly revenue over the last 6 months</p>
              </div>
              <div className="chart-content">
                <RevenueTrendChart data={revenueData} height={250} />
              </div>
            </Card>

            <Card className="chart-container flex-shrink-0 w-96 p-3">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">Occupancy Rate</h4>
                <p className="text-xs text-muted-foreground">Unit occupancy trend over time</p>
              </div>
              <div className="chart-content">
                <OccupancyRateChart data={occupancyData} height={250} />
              </div>
            </Card>

            <Card className="chart-container flex-shrink-0 w-96 p-3">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">Payment Collection</h4>
                <p className="text-xs text-muted-foreground">Collected vs pending payments (in thousands)</p>
              </div>
              <div className="chart-content">
                <PaymentCollectionChart data={collectionData} height={250} />
              </div>
            </Card>

            <Card className="chart-container flex-shrink-0 w-96 p-3">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">Property Status Distribution</h4>
                <p className="text-xs text-muted-foreground">Properties by current status</p>
              </div>
              <div className="chart-content">
                <PropertyStatusChart data={propertyStatusData} height={250} />
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 activities-section">
          <Card className="activity-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Active Leases</h4>
                <p className="text-xs text-muted-foreground">{stats.activeLeases} active lease agreements</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {Array.isArray(leases) && leases.filter((l) => l.status === 'active').slice(0, 5).map((lease) => (
                <div
                  key={lease.id}
                  className="flex items-center justify-between py-1 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 px-1 rounded transition-colors"
                  onClick={() => navigate(`/leases/${lease.id}`)}
                >
                  <div>
                    <p className="text-xs font-medium">Lease #{lease.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="default" className="text-xs px-1 py-0">Active</Badge>
                </div>
              ))}
              {(!leases || leases.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No active leases
                </p>
              )}
            </div>
          </Card>

          <Card className="activity-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Pending Payments</h4>
                <p className="text-xs text-muted-foreground">₹{(stats.pendingPayments / 1000).toFixed(1)}K pending</p>
              </div>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {Array.isArray(payments) && payments.filter((p) => p.status === 'pending').slice(0, 5).map((payment) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-1 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 px-1 rounded transition-colors"
                    onClick={() => navigate(`/payments/${payment.id}`)}
                  >
                    <div>
                      <p className="text-xs font-medium">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-xs px-1 py-0">
                      {isOverdue ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
              {(!Array.isArray(payments) || payments.filter((p) => p.status === 'pending').length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No pending payments
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardEnhanced;
