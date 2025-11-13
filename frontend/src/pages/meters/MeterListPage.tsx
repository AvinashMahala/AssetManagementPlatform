import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff } from 'lucide-react';
import { useMeters, useDeleteMeter, useUpdateMeterStatus } from '../../hooks';
import { MeterType } from '../../types/meter';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AppLayout } from '../../components/layout/AppLayout';

export const MeterListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: meters, loading, error, refetch } = useMeters();
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateMeterStatus();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Ensure meters is always an array
  const metersArray = Array.isArray(meters) ? meters : [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meter? This action cannot be undone.')) {
      try {
        await deleteMeter(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete meter:', err);
        alert('Failed to delete meter');
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await updateStatus({ id, isActive: !isActive });
      refetch();
    } catch (err) {
      console.error('Failed to update meter status:', err);
      alert('Failed to update meter status');
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{metersArray.length}</div>
                <p className="text-sm text-gray-600">Total Meters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {metersArray.filter(m => m.isActive).length || 0}
                </div>
                <p className="text-sm text-gray-600">Active Meters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {metersArray.filter(m => m.meterType === MeterType.ELECTRICITY).length || 0}
                </div>
                <p className="text-sm text-gray-600">Electricity Meters</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {metersArray.filter(m => m.meterType === MeterType.WATER).length || 0}
                </div>
                <p className="text-sm text-gray-600">Water Meters</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};