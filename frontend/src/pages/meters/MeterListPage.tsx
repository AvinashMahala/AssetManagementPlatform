import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Power, PowerOff } from 'lucide-react';
import { useMeters, useDeleteMeter, useUpdateMeterStatus } from '../../hooks';
import { MeterType } from '../../types/meter';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AppLayout } from '../../components/layout/AppLayout';

export const MeterListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: meters, loading, error, refetch } = useMeters();
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateMeterStatus();

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
      <div className="space-y-6">
        {/* Header */}
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

        {/* Stats Cards */}
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

        {/* Meters List */}
        {metersArray.length > 0 ? (
          <div className="space-y-4">
            {metersArray.map((meter) => (
              <Card key={meter.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meter.meterName}</h3>
                        <Badge className={getMeterTypeColor(meter.meterType)}>
                          {getMeterTypeLabel(meter.meterType)}
                        </Badge>
                        <Badge variant={meter.isActive ? 'default' : 'secondary'}>
                          {meter.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Meter Number:</span> {meter.meterNumber || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Cost per Unit:</span> ₹{meter.costPerUnit}
                        </div>
                        <div>
                          <span className="font-medium">Fixed Charge:</span> {meter.fixedCharge ? `₹${meter.fixedCharge}` : 'None'}
                        </div>
                      </div>

                      {meter.remarks && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Remarks:</span> {meter.remarks}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
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
                        onClick={() => navigate(`/meters/${meter.id}`)}
                        title="View meter details"
                      >
                        <Eye className="h-4 w-4" />
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};