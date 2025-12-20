import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import type { NavItem } from '@/hooks';
import type { NavigationPreviewProps } from './index';

export const NavigationPreview: React.FC<NavigationPreviewProps> = ({ enabledItems }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This is how your navigation will look:
        </div>
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-2">
            {enabledItems.map((item: NavItem) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-700">
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};