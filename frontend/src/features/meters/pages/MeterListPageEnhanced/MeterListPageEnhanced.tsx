import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMeters, useDeleteMeter, useUpdateMeterStatus } from '@/features/meters/hooks/useMeters';
import { MeterType } from '@/features/meters/types';
import { AppLayout } from '@/components/layout/AppLayout';
import type { PaginationOptions, MeterFilters as MeterFiltersType } from '@/features/meters/services/meterService';
import { useNotifications } from '@/contexts';
import { getErrorMessage } from '@/types/api';
import { MeterListHeader, MeterStats, MeterFilters, MeterTable, MeterLoading, MeterError } from '@/features/meters/components';
import styles from './MeterListPageEnhanced.module.scss';

export const MeterListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateMeterStatus();
  const { showError, showSuccess } = useNotifications();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px' }
    );

    const elements = [headerRef.current, statsRef.current, filtersRef.current, tableRef.current].filter(Boolean);
    elements.forEach(el => el && observer.observe(el as Element));

    return () => observer.disconnect();
  }, []);

  // Pagination and filtering state
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>({
    page: 1,
    limit: 10
  });
  const [filters, setFilters] = useState<MeterFiltersType>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: metersResponse, loading, error, refetch } = useMeters(paginationOptions, filters);

  // Extract data from response
  const metersData = metersResponse?.data || [];
  const paginationInfo = metersResponse ? {
    total: metersResponse.total,
    page: metersResponse.page,
    limit: metersResponse.limit,
    totalPages: metersResponse.totalPages,
    hasNext: metersResponse.hasNext,
    hasPrev: metersResponse.hasPrev
  } : null;

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
      setPaginationOptions(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPaginationOptions(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit: number) => {
    setPaginationOptions(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Handle filters
  const handleMeterTypeFilter = (meterType: string) => {
    setFilters(prev => ({ ...prev, meterType: meterType === 'all' ? undefined : meterType as MeterType }));
    setPaginationOptions(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? undefined : status as 'active' | 'inactive' }));
    setPaginationOptions(prev => ({ ...prev, page: 1 }));
  };

  // Ensure meters is always an array
  const metersArray = Array.isArray(metersData) ? metersData : [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meter? This action cannot be undone.')) {
      try {
        const resp = await deleteMeter(id);
        if (!resp.success) {
          showError(getErrorMessage(resp.error));
          return;
        }
        refetch();
        showSuccess('Meter deleted successfully');
      } catch (err) {
        console.error('Failed to delete meter:', err);
        showError('Failed to delete meter. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateStatus({ id, isActive: !isActive });
      refetch();
    } catch (err) {
      console.error('Failed to update meter status:', err);
      showError('Failed to update meter status. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <MeterLoading message="Loading meters..." subMessage="Please wait while we fetch your meter data" />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <MeterError 
          title="Error Loading Meters" 
          message={`Error loading meters: ${getErrorMessage(error)}`} 
          onRetry={refetch}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles['meter-list-page-enhanced']}>
        <div className="py-2 space-y-2">
          <div ref={headerRef}>
            <MeterListHeader onAddClick={() => navigate('/meters/create-tabbed')} />
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={styles['success-message']}>
              <div className={styles['success-icon']}>✓</div>
              <p className={styles['success-text']}>{successMessage}</p>
            </div>
          )}

          <div ref={statsRef}>
            <MeterStats
              totalMeters={paginationInfo?.total || 0}
              activeMeters={metersArray.filter((m: any) => m.isActive).length || 0}
              electricityMeters={metersArray.filter((m: any) => m.meterType === MeterType.ELECTRICITY).length || 0}
              waterMeters={metersArray.filter((m: any) => m.meterType === MeterType.WATER).length || 0}
            />
          </div>

          <div ref={filtersRef}>
            <MeterFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              meterType={filters.meterType || 'all'}
              onMeterTypeChange={handleMeterTypeFilter}
              status={filters.status || 'all'}
              onStatusChange={handleStatusFilter}
              limit={paginationOptions.limit}
              onLimitChange={handlePageSizeChange}
            />
          </div>

          <div ref={tableRef}>
            <MeterTable
              meters={metersArray}
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              updatingStatus={updatingStatus}
              deleting={deleting}
              searchTerm={searchTerm}
              filters={{
                meterType: filters.meterType,
                status: filters.status
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MeterListPageEnhanced;
