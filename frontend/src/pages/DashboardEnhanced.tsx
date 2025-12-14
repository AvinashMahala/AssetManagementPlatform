import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Home,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLeases, usePayments, useDashboardStats } from '../hooks';
import {
  Card,
  Button,
  RevenueTrendChart,
  OccupancyRateChart,
  PaymentCollectionChart,
  PropertyStatusChart,
  StatCard,
  ChartContainer,
} from '../components/ui';
import { ActivityCard } from '../components/dashboard';
import { AppLayout } from '../components/layout';
import './DashboardEnhanced.scss';

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { stats, chartData, loading } = useDashboardStats();
  const { leases } = useLeases();
  const { payments } = usePayments();

  if (loading) {
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
            <ChartContainer title="Revenue Trend" description="Monthly revenue over the last 6 months">
              <RevenueTrendChart data={chartData.revenue} height={250} />
            </ChartContainer>

            <ChartContainer title="Occupancy Rate" description="Unit occupancy trend over time">
              <OccupancyRateChart data={chartData.occupancy} height={250} />
            </ChartContainer>

            <ChartContainer title="Payment Collection" description="Collected vs pending payments (in thousands)">
              <PaymentCollectionChart data={chartData.collection} height={250} />
            </ChartContainer>

            <ChartContainer title="Property Status Distribution" description="Properties by current status">
              <PropertyStatusChart data={chartData.propertyStatus} height={250} />
            </ChartContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 activities-section">
          <ActivityCard
            title="Active Leases"
            description={`${stats.activeLeases} active lease agreements`}
            icon={FileText}
            items={Array.isArray(leases) ? leases.filter((l) => l.status === 'active').slice(0, 5).map((lease) => ({
              id: lease.id,
              title: `Lease #${lease.id.slice(0, 8)}`,
              subtitle: `${new Date(lease.startDate).toLocaleDateString()} - ${new Date(lease.endDate).toLocaleDateString()}`,
              badge: 'Active',
              badgeVariant: 'default',
              onClick: () => navigate(`/leases/${lease.id}`),
            })) : []}
            emptyMessage="No active leases"
          />

          <ActivityCard
            title="Pending Payments"
            description={`₹${(stats.pendingPayments / 1000).toFixed(1)}K pending`}
            icon={CreditCard}
            items={Array.isArray(payments) ? payments.filter((p) => p.status === 'pending').slice(0, 5).map((payment) => {
              const isOverdue = new Date(payment.dueDate) < new Date();
              return {
                id: payment.id,
                title: `₹${payment.amount.toLocaleString()}`,
                subtitle: `Due: ${new Date(payment.dueDate).toLocaleDateString()}`,
                badge: isOverdue ? 'Overdue' : 'Pending',
                badgeVariant: isOverdue ? 'destructive' : 'secondary',
                onClick: () => navigate(`/payments/${payment.id}`),
              };
            }) : []}
            emptyMessage="No pending payments"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardEnhanced;
