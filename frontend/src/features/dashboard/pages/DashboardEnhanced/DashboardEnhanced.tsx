import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CreditCard,
} from 'lucide-react';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useActivityItems } from '@/features/dashboard/hooks/useActivityItems';
import { useChartCarousel } from '@/features/dashboard/hooks/useChartCarousel';
import { useCan } from '@/contexts/RBACContext';
import { ActivityCard, StatsSection, AlertsSection } from '../../components';
const ChartsCarousel = React.lazy(() => import('../../components/ChartsCarousel/ChartsCarousel'));
import { ErrorBoundary } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import './DashboardEnhanced.scss';

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { stats, chartData, loading, error } = useDashboardStats();
  const { activeLeases, pendingPayments } = useActivityItems();
  const { scrollLeft, scrollRight } = useChartCarousel();
  const canView = useCan('dashboard:dashboard:view');

  if (!canView) {
    return (
      <AppLayout title="Dashboard">
        <div className="space-y-3 dashboard-enhanced">
          {/* Keep page layout but show message in right column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 py-6">
            <div className="col-span-2">
              {/* Left content area left intentionally blank for users without access */}
              <div className="h-40 flex items-center justify-center text-gray-400">
                Dashboard content is restricted.
              </div>
            </div>
            <div className="col-span-1">
              <div className="border rounded p-4 bg-gray-50 text-gray-700">
                <h3 className="font-semibold mb-2">Access Denied</h3>
                <p className="text-sm mb-3">You don't have permission to view the dashboard.</p>
                <p className="text-xs text-gray-500">Required permission: <code>dashboard:dashboard:view</code></p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="text-red-600">Error loading dashboard: {error.message}</div>
        </div>
      </AppLayout>
    );
  }

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
        <ErrorBoundary>
          <StatsSection stats={stats} />
        </ErrorBoundary>

        {/* Alerts and Notifications */}
        <ErrorBoundary>
          <AlertsSection stats={stats} />
        </ErrorBoundary>

        {/* Charts Carousel */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading charts...</div>}>
            <ChartsCarousel chartData={chartData} scrollLeft={scrollLeft} scrollRight={scrollRight} />
          </Suspense>
        </ErrorBoundary>

        {/* Recent Activities */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 activities-section">
          <ActivityCard
            title="Active Leases"
            description={`${stats.activeLeases} active lease agreements`}
            icon={FileText}
            items={activeLeases.map((item: any) => ({
              ...item,
              onClick: () => item.onClick(navigate),
            }))}
            emptyMessage="No active leases"
          />

          <ActivityCard
            title="Pending Payments"
            description={`₹${(stats.pendingPayments / 1000).toFixed(1)}K pending`}
            icon={CreditCard}
            items={pendingPayments.map((item: any) => ({
              ...item,
              onClick: () => item.onClick(navigate),
            }))}
            emptyMessage="No pending payments"
          />
        </div>
        </ErrorBoundary>
      </div>
    </AppLayout>
  );
};

export default DashboardEnhanced;
