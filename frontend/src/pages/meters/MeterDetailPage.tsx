import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import {
  useMeter,
  useMeterReadings,
  useMeterTrend,
  useMeterStatistics,
  useDeleteMeter
} from '../../hooks';
import { MeterType } from '../../types/meter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AppLayout } from '../../components/layout/AppLayout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const MeterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { data: readingsData } = useMeterReadings(id!);
  const { data: trendData } = useMeterTrend(id!, 12);
  const { data: statistics } = useMeterStatistics(id!);
  const { mutate: deleteMeter, loading: deleting } = useDeleteMeter();

  const [activeTab, setActiveTab] = useState('overview');

  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this meter? This action cannot be undone and will delete all associated readings.')) {
      try {
        await deleteMeter(id);
        navigate('/meters', {
          state: { message: 'Meter deleted successfully!' }
        });
      } catch (err) {
        console.error('Failed to delete meter:', err);
        alert('Failed to delete meter');
      }
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Meter Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meter details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Meter Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meter Not Found</h2>
            <p className="text-gray-600 mb-4">The meter you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/meters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meters
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const readings = readingsData?.readings || [];
  const trend = trendData?.trend || [];
  const stats = statistics || {};

  return (
    <AppLayout title={`${meter.meterName} - Details`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/meters')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meters
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{meter.meterName}</h1>
              <p className="text-gray-600">Meter ID: {meter.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/meters/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Meter
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/meters/${id}/readings/create`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              Delete Meter
            </Button>
          </div>
        </div>

        {/* Status and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={meter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {meter.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <Badge className={getMeterTypeColor(meter.meterType)}>
                    {meter.meterType.charAt(0).toUpperCase() + meter.meterType.slice(1)}
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost per Unit</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(meter.costPerUnit)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Readings</p>
                  <p className="text-2xl font-bold text-gray-900">{readings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="readings">Readings History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Meter Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Meter Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Meter Name</label>
                    <p className="text-gray-900">{meter.meterName}</p>
                  </div>
                  {meter.meterNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Meter Number</label>
                      <p className="text-gray-900">{meter.meterNumber}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Meter Type</label>
                    <p className="text-gray-900">{meter.meterType.charAt(0).toUpperCase() + meter.meterType.slice(1)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cost per Unit</label>
                    <p className="text-gray-900">{formatCurrency(meter.costPerUnit)}</p>
                  </div>
                  {meter.fixedCharge && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fixed Charge</label>
                      <p className="text-gray-900">{formatCurrency(meter.fixedCharge)}</p>
                    </div>
                  )}
                  {meter.remarks && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Remarks</label>
                      <p className="text-gray-900">{meter.remarks}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{formatDate(meter.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Latest Reading */}
              <Card>
                <CardHeader>
                  <CardTitle>Latest Reading</CardTitle>
                </CardHeader>
                <CardContent>
                  {readings.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Reading Date</label>
                        <p className="text-gray-900">{formatDate(readings[0].readingDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Current Reading</label>
                        <p className="text-gray-900">{readings[0].currentReading}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Units Consumed</label>
                        <p className="text-gray-900">{readings[0].unitsConsumed}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Total Cost</label>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(readings[0].totalCost)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No readings recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="readings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Readings History</CardTitle>
              </CardHeader>
              <CardContent>
                {readings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Previous</th>
                          <th className="text-left py-2 px-4">Current</th>
                          <th className="text-left py-2 px-4">Consumed</th>
                          <th className="text-left py-2 px-4">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readings.map((reading) => (
                          <tr key={reading.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{formatDate(reading.readingDate)}</td>
                            <td className="py-2 px-4">{reading.previousReading}</td>
                            <td className="py-2 px-4">{reading.currentReading}</td>
                            <td className="py-2 px-4">{reading.unitsConsumed}</td>
                            <td className="py-2 px-4">{formatCurrency(reading.totalCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No readings recorded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consumption Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumption Trend (12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="unitsConsumed"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-600">No trend data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Cost Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trend (12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalCost" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-600">No cost data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Meter Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Avg Monthly Usage</label>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageUnitsConsumed?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Avg Monthly Cost</label>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageCost ? formatCurrency(stats.averageCost) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Readings</label>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReadings || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Trend</label>
                      <p className={`text-2xl font-bold ${stats.trendDirection === 'up' ? 'text-red-600' : stats.trendDirection === 'down' ? 'text-green-600' : 'text-gray-900'}`}>
                        {stats.trendDirection?.charAt(0).toUpperCase() + stats.trendDirection?.slice(1) || 'Stable'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};