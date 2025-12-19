import React from 'react';
import { Activity, Zap, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import './MeterStats.scss';

interface MeterStatsProps {
  totalMeters: number;
  activeMeters: number;
  electricityMeters: number;
  waterMeters: number;
}

export const MeterStats: React.FC<MeterStatsProps> = ({
  totalMeters,
  activeMeters,
  electricityMeters,
  waterMeters,
}) => {
  return (
    <div
      data-section="stats"
      className="stats-section grid gap-2 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="stats-card" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Meters</CardTitle>
          <Activity className="stats-icon h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stats-value text-2xl font-bold">{totalMeters}</div>
          <p className="text-xs text-muted-foreground">
            Across all properties
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Active Meters</CardTitle>
          <div className="stats-icon h-3 w-3 rounded-full bg-green-500"></div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stats-value text-2xl font-bold text-green-600">
            {activeMeters}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Electricity</CardTitle>
          <Zap className="stats-icon h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stats-value text-2xl font-bold text-yellow-600">
            {electricityMeters}
          </div>
          <p className="text-xs text-muted-foreground">
            Electricity meters
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground">Water</CardTitle>
          <Droplets className="stats-icon h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="stats-value text-2xl font-bold text-blue-600">
            {waterMeters}
          </div>
          <p className="text-xs text-muted-foreground">
            Water meters
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
