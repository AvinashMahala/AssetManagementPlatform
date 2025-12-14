import React from 'react';
import { Card } from './card';

interface ChartContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  className = '',
}) => (
  <Card className={`chart-container flex-shrink-0 w-96 p-3 ${className}`}>
    <div className="mb-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="chart-content">{children}</div>
  </Card>
);

export default ChartContainer;