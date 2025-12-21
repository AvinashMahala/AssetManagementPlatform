import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { RevenueTrendChart, PropertyStatusChart } from '@/componentDesignLibrary';
import styles from './PropertyChartsSection.module.scss';

interface PropertyChartsSectionProps {
  revenueTrend: Array<{ name: string; value: number }>;
  occupancyTrend: Array<{ name: string; value: number }>;
}

export const PropertyChartsSection: React.FC<PropertyChartsSectionProps> = ({
  revenueTrend,
  occupancyTrend,
}) => {
  return (
    <div className={styles.chartsSection}>
      <Card className={styles.chartCard}>
        <CardHeader>
          <CardTitle className={`${styles.chartTitle} text-lg`}>Revenue Trend</CardTitle>
          <CardDescription className={styles.chartDescription}>Last 6 months revenue</CardDescription>
        </CardHeader>
        <CardContent className={styles.chartContent}>
          <RevenueTrendChart data={revenueTrend} height={250} />
        </CardContent>
      </Card>

      <Card className={styles.chartCard}>
        <CardHeader>
          <CardTitle className={`${styles.chartTitle} text-lg`}>Unit Distribution</CardTitle>
          <CardDescription className={styles.chartDescription}>Current occupancy status</CardDescription>
        </CardHeader>
        <CardContent className={styles.chartContent}>
          <PropertyStatusChart data={occupancyTrend} height={250} />
        </CardContent>
      </Card>
    </div>
  );
};