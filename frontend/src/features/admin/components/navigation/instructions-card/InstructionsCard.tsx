import React from 'react';
import { Card, CardContent } from '@/componentDesignLibrary';

export const InstructionsCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p><strong>How to use:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Drag and drop items to reorder them</li>
            <li>Use the toggle switches to show/hide navigation items</li>
            <li>Changes are saved automatically to your browser</li>
            <li>Click "Reset to Defaults" to restore original settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};