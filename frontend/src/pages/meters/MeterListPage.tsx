import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMeters, useDeleteMeter, useUpdateMeterStatus } from '../../hooks';
import { MeterType } from '../../types/meter';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PaginationOptions, MeterFilters } from '../../services/meterService';
import { useNotifications } from '../../contexts';

export const MeterListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateMeterStatus();
  const { showError } = useNotifications();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        return 'bg-yellow-100 text-yellow-800';
      case MeterType.WATER:
        return 'bg-blue-100 text-blue-800';
      case MeterType.GAS:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout title="Meters">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading meters...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Meters">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading meters: {error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meters">
      <div className="flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meters</h1>
              <p className="mt-2 text-gray-600">Manage utility meters for your properties</p>
            </div>
            <Button
              onClick={() => navigate('/meters/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Meter
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search meters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Meter Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.meterType || 'all'}
                  onValueChange={handleMeterTypeFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Meter Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={paginationOptions.limit.toString()}
                onValueChange={(value) => handlePageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{paginationInfo?.total || 0}</div>
                <p className="text-sm text-gray-600">Total Meters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {metersArray.filter((m: any) => m.isActive).length || 0}
                </div>
                <p className="text-sm text-gray-600">Active Meters (Page)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {metersArray.filter((m: any) => m.meterType === MeterType.ELECTRICITY).length || 0}
                </div>
                <p className="text-sm text-gray-600">Electricity Meters (Page)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {metersArray.filter((m: any) => m.meterType === MeterType.WATER).length || 0}
                </div>
                <p className="text-sm text-gray-600">Water Meters (Page)</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full border-0 shadow-none">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                    <TableRow>
                      <TableHead>Meter Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Meter Number</TableHead>
                      <TableHead>Cost per Unit</TableHead>
                      <TableHead>Fixed Charge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metersArray.length > 0 ? (
                      metersArray.map((meter) => (
                        <TableRow key={meter.id}>
                          <TableCell className="font-medium">{meter.meterName}</TableCell>
                          <TableCell>
                            <Badge className={getMeterTypeColor(meter.meterType)}>
                              {getMeterTypeLabel(meter.meterType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{meter.meterNumber || 'N/A'}</TableCell>
                          <TableCell>₹{meter.costPerUnit}</TableCell>
                          <TableCell>{meter.fixedCharge ? `₹${meter.fixedCharge}` : 'None'}</TableCell>
                          <TableCell>
                            <Badge variant={meter.isActive ? 'default' : 'secondary'}>
                              {meter.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={meter.remarks}>
                            {meter.remarks || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/meters/${meter.id}`)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
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
                                size="sm"
                                onClick={() => navigate(`/meters/${meter.id}/edit`)}
                                title="Edit meter"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(meter.id)}
                                disabled={deleting}
                                title="Delete meter"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="text-6xl mb-4">⚡</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No meters found</h3>
                          <p className="text-gray-600 mb-6">Get started by adding your first utility meter</p>
                          <Button
                            onClick={() => navigate('/meters/create')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Meter
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-white dark:bg-gray-950">
                  <div className="text-sm text-gray-600">
                    Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to{' '}
                    {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of{' '}
                    {paginationInfo.total} meters
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.page - 1)}
                      disabled={!paginationInfo.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
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
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
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
    </AppLayout>
  );
};