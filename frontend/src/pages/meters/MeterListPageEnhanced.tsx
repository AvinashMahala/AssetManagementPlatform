import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff, Search, ChevronLeft, ChevronRight, Zap, Droplets, Flame, Activity } from 'lucide-react';
import { useMeters, useDeleteMeter, useUpdateMeterStatus } from '../../hooks';
import { MeterType } from '../../types/meter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PaginationOptions, MeterFilters } from '../../services/meterService';
import { useNotifications } from '../../contexts';
import { getErrorMessage } from '../../types/api';
import './MeterListPageEnhanced.scss';

export const MeterListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateMeterStatus();
  const { showError } = useNotifications();
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
    elements.forEach(el => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Pagination and filtering state
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>({
    page: 1,
    limit: 10
  });
  const [filters, setFilters] = useState<MeterFilters>({});
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
        await deleteMeter(id);
        refetch();
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

  const getMeterTypeLabel = (type: MeterType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getMeterTypeColor = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case MeterType.WATER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case MeterType.GAS:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMeterTypeIcon = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return <Zap className="h-4 w-4" />;
      case MeterType.WATER:
        return <Droplets className="h-4 w-4" />;
      case MeterType.GAS:
        return <Flame className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="meter-list-page-enhanced">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading meters...</p>
            <p className="loading-subtext">Please wait while we fetch your meter data</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="meter-list-page-enhanced">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Error Loading Meters</h3>
            <p className="error-message">Error loading meters: {getErrorMessage(error)}</p>
            <Button onClick={refetch} className="retry-button">
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="meter-list-page-enhanced">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading meters...</p>
            <p className="loading-subtext">Please wait while we fetch your meter data</p>
          </div>
        ) : (
          <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div
              ref={headerRef}
              data-section="header"
              className="meter-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div>
                <h1 className="header-title">Meters</h1>
                <p className="header-description">
                  Manage utility meters for your properties
                </p>
              </div>
              <div className="header-actions flex gap-2">
                <Button
                  className="action-button"
                  onClick={() => navigate('/meters/create-tabbed')}
                  title="Step-by-step guided form with progress tracking"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Meter
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <p className="success-text">{successMessage}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div
              ref={statsRef}
              data-section="stats"
              className="stats-section grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <Card className="stats-card" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Meters</CardTitle>
                  <Activity className="stats-icon h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="stats-value text-3xl font-bold">{paginationInfo?.total || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all properties
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Meters</CardTitle>
                  <div className="stats-icon h-4 w-4 rounded-full bg-green-500"></div>
                </CardHeader>
                <CardContent>
                  <div className="stats-value text-3xl font-bold text-green-600">
                    {metersArray.filter((m: any) => m.isActive).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Electricity</CardTitle>
                  <Zap className="stats-icon h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="stats-value text-3xl font-bold text-yellow-600">
                    {metersArray.filter((m: any) => m.meterType === MeterType.ELECTRICITY).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Electricity meters
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Water</CardTitle>
                  <Droplets className="stats-icon h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="stats-value text-3xl font-bold text-blue-600">
                    {metersArray.filter((m: any) => m.meterType === MeterType.WATER).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Water meters
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div
              ref={filtersRef}
              data-section="filters"
              className="filters-section flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="search-input pl-10"
                  placeholder="Search meters by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-select">
                <Select
                  value={filters.meterType || 'all'}
                  onValueChange={handleMeterTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="filter-select">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="filter-select">
                <Select
                  value={paginationOptions.limit.toString()}
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div
              ref={tableRef}
              data-section="table"
              className="table-container"
            >
              <Card className="table-card">
                <CardContent className="pt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="table-header">
                        <TableRow>
                          <TableHead>Meter Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Meter Number</TableHead>
                          <TableHead>Cost per Unit</TableHead>
                          <TableHead>Fixed Charge</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metersArray.length > 0 ? (
                          metersArray.map((meter, index) => (
                            <TableRow key={meter.id} className="table-row" style={{ '--row-index': index } as React.CSSProperties}>
                              <TableCell className="font-medium">
                                <div className="meter-name-cell">
                                  <span className="meter-name">{meter.meterName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`meter-type-badge ${getMeterTypeColor(meter.meterType)}`}>
                                  {getMeterTypeIcon(meter.meterType)}
                                  <span className="ml-1">{getMeterTypeLabel(meter.meterType)}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="meter-number">{meter.meterNumber || 'N/A'}</span>
                              </TableCell>
                              <TableCell>
                                <span className="cost-value">₹{meter.costPerUnit}</span>
                              </TableCell>
                              <TableCell>
                                <span className="fixed-charge">{meter.fixedCharge ? `₹${meter.fixedCharge}` : 'None'}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={`status-badge ${meter.isActive ? 'status-active' : 'status-inactive'}`}>
                                  {meter.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={meter.remarks}>
                                <span className="remarks-text">{meter.remarks || '-'}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="table-actions flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="table-action-button"
                                    onClick={() => navigate(`/meters/${meter.id}`)}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="table-action-button"
                                    onClick={() => handleToggleStatus(meter.id, meter.isActive)}
                                    disabled={updatingStatus}
                                    title={meter.isActive ? 'Deactivate meter' : 'Activate meter'}
                                  >
                                    {meter.isActive ? (
                                      <PowerOff className="h-4 w-4 text-red-600" />
                                    ) : (
                                      <Power className="h-4 w-4 text-green-600" />
                                    )}
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="table-action-button"
                                    onClick={() => navigate(`/meters/${meter.id}/edit`)}
                                    title="Edit meter"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="table-action-button delete-button"
                                    onClick={() => handleDelete(meter.id)}
                                    disabled={deleting}
                                    title="Delete meter"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="empty-table-cell">
                              <div className="empty-state">
                                <div className="empty-icon">⚡</div>
                                <h3 className="empty-title">No meters found</h3>
                                <p className="empty-description">
                                  {searchTerm || filters.meterType || filters.status
                                    ? 'Try adjusting your filters'
                                    : 'Get started by adding your first utility meter'}
                                </p>
                                {!searchTerm && !filters.meterType && !filters.status && (
                                  <Button className="empty-action-button" onClick={() => navigate('/meters/create-tabbed')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Meter
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {paginationInfo && paginationInfo.totalPages > 1 && (
                    <div className="pagination-container flex justify-between items-center px-6 py-4 border-t">
                      <div className="pagination-info text-sm text-muted-foreground">
                        Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to{' '}
                        {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of{' '}
                        {paginationInfo.total} meters
                      </div>

                      <div className="pagination-controls flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="pagination-button"
                          onClick={() => handlePageChange(paginationInfo.page - 1)}
                          disabled={!paginationInfo.hasPrev}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        <div className="pagination-numbers flex items-center gap-1">
                          {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(
                              paginationInfo.totalPages - 4,
                              paginationInfo.page - 2
                            )) + i;

                            if (pageNum > paginationInfo.totalPages) return null;

                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === paginationInfo.page ? "default" : "outline"}
                                size="sm"
                                className="pagination-number"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="pagination-button"
                          onClick={() => handlePageChange(paginationInfo.page + 1)}
                          disabled={!paginationInfo.hasNext}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MeterListPageEnhanced;