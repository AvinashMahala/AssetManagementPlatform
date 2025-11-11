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
  Plus,
  ArrowRight,
  AlertCircle,
  Receipt,
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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
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
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {action && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between"
            onClick={action}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
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
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/properties/create')} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </Button>
          <Button onClick={() => navigate('/tenants/create')} variant="secondary" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Tenant</span>
          </Button>
          <Button onClick={() => navigate('/units/create')} variant="secondary" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Unit</span>
          </Button>
          <Button onClick={() => navigate('/leases/create')} variant="secondary" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Lease</span>
          </Button>
          <Button onClick={() => navigate('/payments/create')} variant="secondary" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-900 dark:text-amber-300">
                  Attention Required
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.expiringLeases > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    {stats.expiringLeases} lease(s) expiring within 30 days
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/leases')}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    Review
                  </Button>
                </div>
              )}
              {stats.overduePayments > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    {stats.overduePayments} overdue payment(s)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/payments')}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={revenueData} height={300} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate</CardTitle>
              <CardDescription>Unit occupancy trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <OccupancyRateChart data={occupancyData} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Collection</CardTitle>
              <CardDescription>Collected vs pending payments (in thousands)</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentCollectionChart data={collectionData} height={300} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Status Distribution</CardTitle>
              <CardDescription>Properties by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyStatusChart data={propertyStatusData} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Leases</CardTitle>
                  <CardDescription>{stats.activeLeases} active lease agreements</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(leases) && leases.filter((l) => l.status === 'active').slice(0, 5).map((lease) => (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors"
                    onClick={() => navigate(`/leases/${lease.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">Lease #{lease.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                ))}
                {(!leases || leases.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active leases
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Payments</CardTitle>
                  <CardDescription>₹{(stats.pendingPayments / 1000).toFixed(1)}K pending</CardDescription>
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(payments) && payments.filter((p) => p.status === 'pending').slice(0, 5).map((payment) => {
                  const isOverdue = new Date(payment.dueDate) < new Date();
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors"
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                        {isOverdue ? 'Overdue' : 'Pending'}
                      </Badge>
                    </div>
                  );
                })}
                {(!Array.isArray(payments) || payments.filter((p) => p.status === 'pending').length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending payments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardEnhanced;
