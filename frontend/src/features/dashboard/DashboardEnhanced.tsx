import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CreditCard,
} from 'lucide-react';
import { useLeases, usePayments, useDashboardStats, useActivityItems, useChartCarousel } from '../../hooks';
import { ActivityCard, StatsSection, AlertsSection } from './';
const ChartsCarousel = React.lazy(() => import('./ChartsCarousel'));
import { ErrorBoundary } from '../../components/common';
import { AppLayout } from '../../components/layout';
import './DashboardEnhanced.scss';

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { stats, chartData, loading, error } = useDashboardStats();
  const { activeLeases, pendingPayments } = useActivityItems();
  const { scrollLeft, scrollRight } = useChartCarousel();

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
            items={activeLeases.map((item) => ({
              ...item,
              onClick: () => item.onClick(navigate),
            }))}
            emptyMessage="No active leases"
          />

          <ActivityCard
            title="Pending Payments"
            description={`₹${(stats.pendingPayments / 1000).toFixed(1)}K pending`}
            icon={CreditCard}
            items={pendingPayments.map((item) => ({
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
