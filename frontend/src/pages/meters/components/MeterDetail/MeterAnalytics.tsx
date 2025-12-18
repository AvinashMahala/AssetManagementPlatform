import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
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

interface MeterAnalyticsProps {
  trend: any[]; // Replace with MeterTrend type
  stats: any; // Replace with MeterStatistics type
}

export const MeterAnalytics: React.FC<MeterAnalyticsProps> = ({ trend, stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};
