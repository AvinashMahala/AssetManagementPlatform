import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

interface FormColumnProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormColumn: React.FC<FormColumnProps> = ({
  title,
  description,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className="lg:col-span-1">
      <Card className={`h-full ${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

interface FormGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  className = '',
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};