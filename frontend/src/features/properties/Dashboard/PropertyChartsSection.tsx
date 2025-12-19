import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { RevenueTrendChart, PropertyStatusChart } from '@/componentDesignLibrary';

interface PropertyChartsSectionProps {
  revenueTrend: Array<{ name: string; value: number }>;
  occupancyTrend: Array<{ name: string; value: number }>;
}

export const PropertyChartsSection: React.FC<PropertyChartsSectionProps> = ({
  revenueTrend,
  occupancyTrend,
}) => {
  return (
    <div className="charts-section grid gap-4 md:grid-cols-2">
      <Card className="chart-card">
        <CardHeader className="chart-header">
          <CardTitle className="chart-title text-lg">Revenue Trend</CardTitle>
          <CardDescription className="chart-description">Last 6 months revenue</CardDescription>
        </CardHeader>
        <CardContent className="chart-content">
          <RevenueTrendChart data={revenueTrend} height={250} />
        </CardContent>
      </Card>

      <Card className="chart-card">
        <CardHeader className="chart-header">
          <CardTitle className="chart-title text-lg">Unit Distribution</CardTitle>
          <CardDescription className="chart-description">Current occupancy status</CardDescription>
        </CardHeader>
        <CardContent className="chart-content">
          <PropertyStatusChart data={occupancyTrend} height={250} />
        </CardContent>
      </Card>
    </div>
  );
};