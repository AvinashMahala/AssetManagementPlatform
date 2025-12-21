import React from 'react';
import { FolderOpen } from 'lucide-react';
import type { RecentFilesSectionProps } from './RecentFilesSection.types';
import './RecentFilesSection.scss';

export const RecentFilesSection: React.FC<RecentFilesSectionProps> = ({
  onFileClick: _onFileClick
}) => {
  return (
    <div className="recent-files-section">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Files</h2>
      </div>
      <div className="text-sm text-gray-500">
        Recent files functionality will be implemented here.
      </div>
    </div>
  );
};