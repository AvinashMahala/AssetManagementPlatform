import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './common/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backLabel,
  onBack,
  actions
}) => {
  return (
    <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
            {subtitle && (
              <>
                <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{subtitle}</span>
              </>
            )}
          </h1>
        </div>
      </div>
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </div>
  );
};